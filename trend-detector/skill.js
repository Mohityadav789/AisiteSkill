// trend-detector/skill.js
// Universal Trend Detection Engine
// No require() needed — uses execute() for everything

// ─────────────────────────────────────────────────────────────────────────────
// DYNAMIC YEAR — always current, never hardcoded
// ─────────────────────────────────────────────────────────────────────────────
const CURRENT_YEAR = new Date().getFullYear();
const CURRENT_YEAR_RANGE = `${CURRENT_YEAR - 1}-${CURRENT_YEAR}`;

// ─────────────────────────────────────────────────────────────────────────────
// PLATFORM CONFIGS
// ─────────────────────────────────────────────────────────────────────────────
const PLATFORM_CONFIGS = {
  instagram: {
    searchSuffix: 'instagram viral carousel reels trending',
    redditSub: 'Instagram',
    contentTypes: ['carousel', 'reel', 'story', 'post'],
    bestPostTimes: 'Tuesday-Friday 8-10am and 6-8pm'
  },
  linkedin: {
    searchSuffix: 'linkedin viral post trending professional',
    redditSub: 'linkedin',
    contentTypes: ['article', 'post', 'carousel', 'video'],
    bestPostTimes: 'Tuesday-Thursday 7-9am and 12pm'
  },
  twitter: {
    searchSuffix: 'twitter X viral tweet trending',
    redditSub: 'Twitter',
    contentTypes: ['tweet', 'thread', 'poll'],
    bestPostTimes: 'Weekdays 9am and 3pm'
  },
  tiktok: {
    searchSuffix: 'tiktok viral trending sound challenge',
    redditSub: 'TikTok',
    contentTypes: ['video', 'duet', 'stitch', 'trend'],
    bestPostTimes: 'Tuesday-Friday 7-9am, 12pm, 7-9pm'
  },
  youtube: {
    searchSuffix: 'youtube viral trending video views',
    redditSub: 'youtube',
    contentTypes: ['video', 'short', 'live'],
    bestPostTimes: 'Thursday-Saturday 2-4pm'
  },
  general: {
    searchSuffix: 'viral trending content social media',
    redditSub: 'socialmedia',
    contentTypes: ['post', 'video', 'article'],
    bestPostTimes: 'Tuesday-Thursday 9am-12pm'
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 1 — FIND TRENDING TOPICS
// ─────────────────────────────────────────────────────────────────────────────
async function findTrendingTopics({ niche, platform, industry, count, timeframe }, execute) {
  console.log(`📈 Trend detection: "${niche}" on ${platform || 'all'} — Year: ${CURRENT_YEAR}`);

  platform = platform || 'instagram';
  count = count || 8;
  timeframe = timeframe || 'this week';
  const config = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS.general;

  const searches = await Promise.all([
    execute('web:search', {
      query: niche + ' trending ' + config.searchSuffix + ' ' + timeframe + ' ' + CURRENT_YEAR,
      count: 6
    }),
    execute('web:search', {
      query: 'viral ' + niche + ' ' + platform + ' going viral this week ' + CURRENT_YEAR,
      count: 5
    }),
    execute('web:search', {
      query: niche + ' news trending today ' + CURRENT_YEAR,
      count: 4
    }),
    execute('web:fetch', {
      url: 'https://www.reddit.com/r/' + config.redditSub +
        '/search.json?q=' + encodeURIComponent(niche) + '&sort=hot&limit=10&t=week'
    })
  ]);

  // Parse Reddit
  let redditSignals = 'No Reddit data';
  try {
    const redditContent = searches[3]?.content || '{}';
    const redditJson = JSON.parse(redditContent);
    const posts = (redditJson?.data?.children || [])
      .map(p => `Reddit(${p.data?.ups}upvotes): ${p.data?.title}`)
      .filter(p => p.length > 20)
      .slice(0, 6)
      .join('\n');
    redditSignals = posts || 'No Reddit posts found';
  } catch(e) {
    console.warn('Reddit parse:', e.message);
  }

  // Google Trends via SerpAPI — optional
  let googleTrendsData = '';
  const serpKey = process.env.SERPAPI_KEY;
  if (serpKey) {
    try {
      const trendsResult = await execute('api:fetch', {
        url: 'https://serpapi.com/search.json',
        params: {
          engine: 'google_trends',
          q: niche,
          api_key: serpKey,
          data_type: 'TIMESERIES',
          date: 'now 7-d'
        }
      });
      const interest = trendsResult?.data?.interest_over_time?.timeline_data || [];
      if (interest.length > 0) {
        const latest = interest[interest.length - 1]?.values?.[0]?.extracted_value || 0;
        const previous = interest[0]?.values?.[0]?.extracted_value || 0;
        const trend = latest > previous ? 'RISING' : 'FALLING';
        googleTrendsData = `Google Trends: "${niche}" is ${trend} (${previous} → ${latest})`;
      }
    } catch(e) {
      console.warn('SerpAPI failed:', e.message);
    }
  }

  // News API — optional
  let newsData = '';
  const newsKey = process.env.NEWS_API_KEY;
  if (newsKey) {
    try {
      const newsResult = await execute('api:fetch', {
        url: 'https://newsapi.org/v2/everything',
        params: {
          q: niche,
          apiKey: newsKey,
          sortBy: 'popularity',
          pageSize: 5,
          language: 'en'
        }
      });
      const articles = (newsResult?.data?.articles || [])
        .map(a => a.title)
        .slice(0, 5)
        .join('\n');
      newsData = articles ? 'News trending:\n' + articles : '';
    } catch(e) {
      console.warn('NewsAPI failed:', e.message);
    }
  }

  const webContext = [
    ...(searches[0]?.results || []),
    ...(searches[1]?.results || []),
    ...(searches[2]?.results || [])
  ].map(r => r.title + ': ' + r.snippet).join('\n');

  const prediction = await execute('ai:generate', {
    systemPrompt: `You are a viral content prediction expert for ${CURRENT_YEAR}.
You analyze real trend signals to predict what will go viral.
Current year is ${CURRENT_YEAR} — all predictions must be relevant to ${CURRENT_YEAR}.
Return ONLY valid JSON, no markdown.`,
    prompt: `Predict viral ${platform} topics for: "${niche}"
Industry: ${industry || 'general'}
Timeframe: ${timeframe}
Current Year: ${CURRENT_YEAR}
Content types that work on ${platform}: ${config.contentTypes.join(', ')}
Best post times: ${config.bestPostTimes}

REAL SIGNALS FROM ${CURRENT_YEAR}:

Web Searches:
${webContext.slice(0, 1800)}

Reddit Community (${config.redditSub}):
${redditSignals}

${googleTrendsData ? 'Google Trends:\n' + googleTrendsData : ''}
${newsData ? newsData : ''}

Return JSON with topics relevant to ${CURRENT_YEAR}:
{
  "trending": [
    {
      "topic": "specific viral topic for ${CURRENT_YEAR}",
      "trendScore": 9,
      "viralWindow": "3-7 days",
      "whyViral": "reason from real data",
      "momentum": "rising|peaked|falling",
      "sources": ["google", "reddit"],
      "bestAngle": "unique angle",
      "contentType": "carousel|post|video|thread",
      "slideCount": 7,
      "suggestedStyle": "bold",
      "competitionLevel": "low|medium|high",
      "predictedReach": "10k-50k",
      "bestPostTime": "${config.bestPostTimes}",
      "hashtags": ["#tag1", "#tag2", "#tag3"],
      "hookIdea": "scroll stopping first line"
    }
  ],
  "emergingTopics": [
    {
      "topic": "just starting to trend in ${CURRENT_YEAR}",
      "signal": "where detected",
      "timeToViral": "5-10 days"
    }
  ],
  "avoidTopics": ["oversaturated topics in ${CURRENT_YEAR}"],
  "trendInsight": "key pattern in ${CURRENT_YEAR} data",
  "bestContentStrategy": "what is winning right now in ${CURRENT_YEAR}"
}`,
    maxTokens: 2000
  });

  try {
    const raw = prediction?.output || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { trending: [], emergingTopics: [], avoidTopics: [] };
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      success: true,
      niche,
      platform,
      year: CURRENT_YEAR,
      trending: parsed.trending || [],
      emergingTopics: parsed.emergingTopics || [],
      avoidTopics: parsed.avoidTopics || [],
      trendInsight: parsed.trendInsight || '',
      bestContentStrategy: parsed.bestContentStrategy || '',
      sourcesUsed: [
        'google-search',
        'reddit-' + config.redditSub,
        serpKey ? 'google-trends-api' : null,
        newsKey ? 'news-api' : null
      ].filter(Boolean)
    };
  } catch(e) {
    console.error('Trend prediction error:', e.message);
    return { trending: [], emergingTopics: [], avoidTopics: [], error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2 — GET TREND PULSE
// ─────────────────────────────────────────────────────────────────────────────
async function getTrendPulse({ topic, platform }, execute) {
  console.log(`💓 Trend pulse: "${topic}" — ${CURRENT_YEAR}`);

  try {
    const [recent, social, news] = await Promise.all([
      execute('web:search', {
        query: topic + ' trending viral ' + (platform || '') + ' ' + CURRENT_YEAR,
        count: 5
      }),
      execute('web:search', {
        query: topic + ' going viral right now today ' + CURRENT_YEAR,
        count: 4
      }),
      execute('web:search', {
        query: topic + ' news latest today ' + CURRENT_YEAR,
        count: 3
      })
    ]);

    const allSignals = [
      ...(recent?.results || []),
      ...(social?.results || []),
      ...(news?.results || [])
    ].map(r => r.title + ': ' + r.snippet).join('\n');

    const pulse = await execute('ai:generate', {
      systemPrompt: `You are a trend analyst for ${CURRENT_YEAR}. Return ONLY valid JSON, no markdown.`,
      prompt: `Is "${topic}" trending on ${platform || 'social media'} in ${CURRENT_YEAR}?

Signals:
${allSignals.slice(0, 1200)}

Return JSON:
{
  "isTrending": true,
  "trendStrength": "weak|moderate|strong|viral",
  "trendScore": 7,
  "momentum": "rising|stable|falling",
  "peakPrediction": "when this will peak",
  "windowToPost": "post now|post in 2 days|too late",
  "reason": "why based on ${CURRENT_YEAR} data",
  "competitionLevel": "low|medium|high",
  "recommendation": "specific action to take"
}`,
      maxTokens: 600
    });

    const raw = pulse?.output || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { isTrending: false };

  } catch(e) {
    console.error('getTrendPulse error:', e.message);
    return { isTrending: false, error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3 — PREDICT VIRAL POTENTIAL
// ─────────────────────────────────────────────────────────────────────────────
async function predictViralPotential({ topic, contentType, platform, niche }, execute) {
  console.log(`🔮 Viral prediction: "${topic}" — ${CURRENT_YEAR}`);

  try {
    const [trendCheck, audienceSearch, competitionSearch] = await Promise.all([
      execute('web:search', {
        query: topic + ' trending viral ' + (platform || 'instagram') + ' ' + CURRENT_YEAR,
        count: 5
      }),
      execute('web:search', {
        query: 'people interested in ' + topic + ' ' + (niche || '') + ' audience ' + CURRENT_YEAR,
        count: 4
      }),
      execute('web:search', {
        query: topic + ' ' + (platform || 'instagram') + ' content creators posts ' + CURRENT_YEAR,
        count: 4
      })
    ]);

    const allData = [
      ...(trendCheck?.results || []),
      ...(audienceSearch?.results || []),
      ...(competitionSearch?.results || [])
    ].map(r => r.title + ': ' + r.snippet).join('\n');

    const prediction = await execute('ai:generate', {
      systemPrompt: `You are a viral content prediction AI for ${CURRENT_YEAR}. Return ONLY valid JSON, no markdown.`,
      prompt: `Predict viral potential in ${CURRENT_YEAR}:
Topic: "${topic}"
Platform: ${platform || 'instagram'}
Content: ${contentType || 'carousel'}
Niche: ${niche || 'general'}

${CURRENT_YEAR} Signals:
${allData.slice(0, 1500)}

Return JSON:
{
  "viralScore": 85,
  "viralProbability": "high",
  "predictedReach": "50k-200k",
  "predictedSaves": "2000-8000",
  "peakWindow": "Post in next 2-3 days",
  "competitionLevel": "medium",
  "factors": {
    "positive": ["why this will go viral in ${CURRENT_YEAR}"],
    "negative": ["risks"],
    "neutral": ["things to know"]
  },
  "improvements": ["specific change to increase score"],
  "bestHook": "suggested opening line",
  "bestCTA": "call to action for saves",
  "recommendation": "POST NOW|WAIT 2 DAYS|REWORK ANGLE|SKIP"
}`,
      maxTokens: 1000
    });

    const raw = prediction?.output || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { viralScore: 0 };

  } catch(e) {
    console.error('predictViralPotential error:', e.message);
    return { viralScore: 0, error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4 — ANALYZE HASHTAGS
// ─────────────────────────────────────────────────────────────────────────────
async function analyzeHashtags({ niche, platform, count }, execute) {
  console.log(`#️⃣ Hashtag analysis: ${niche} — ${CURRENT_YEAR}`);

  try {
    const [hashtagSearch, viralHashtags, nicheHashtags] = await Promise.all([
      execute('web:search', {
        query: 'best hashtags ' + niche + ' ' + (platform || 'instagram') + ' ' + CURRENT_YEAR + ' reach',
        count: 6
      }),
      execute('web:search', {
        query: 'viral hashtags ' + niche + ' trending this week ' + CURRENT_YEAR,
        count: 5
      }),
      execute('web:search', {
        query: 'niche hashtags ' + niche + ' low competition high reach ' + CURRENT_YEAR,
        count: 5
      })
    ]);

    const allData = [
      ...(hashtagSearch?.results || []),
      ...(viralHashtags?.results || []),
      ...(nicheHashtags?.results || [])
    ].map(r => r.title + ': ' + r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a hashtag strategy expert for ${CURRENT_YEAR}. Return ONLY valid JSON, no markdown.`,
      prompt: `Best hashtags for: "${niche}" on ${platform || 'instagram'} in ${CURRENT_YEAR}

Data: ${allData.slice(0, 1500)}

Return JSON with ${CURRENT_YEAR} relevant hashtags:
{
  "strategy": {
    "large": ["#tag1M+"],
    "medium": ["#tag100k-1M"],
    "small": ["#tag10k-100k"],
    "niche": ["#tagunder10k"],
    "trending": ["#tagtrending in ${CURRENT_YEAR}"]
  },
  "recommended30": ["full list of 30 hashtags"],
  "avoid": ["banned or shadowbanned tags"],
  "trendingNow": ["gaining momentum in ${CURRENT_YEAR}"],
  "insight": "hashtag strategy tip for ${CURRENT_YEAR}"
}`,
      maxTokens: 1000
    });

    const raw = result?.output || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};

  } catch(e) {
    console.error('analyzeHashtags error:', e.message);
    return { error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5 — ANALYZE COMPETITOR CONTENT
// ─────────────────────────────────────────────────────────────────────────────
async function analyzeCompetitorContent({ niche, platform, competitors }, execute) {
  console.log(`🔍 Competitor analysis: ${niche} — ${CURRENT_YEAR}`);

  try {
    const searches = await Promise.all([
      execute('web:search', {
        query: 'top ' + niche + ' creators ' + (platform || 'instagram') + ' viral content ' + CURRENT_YEAR,
        count: 8
      }),
      execute('web:search', {
        query: 'best ' + niche + ' ' + (platform || 'instagram') + ' posts engagement saves ' + CURRENT_YEAR,
        count: 6
      })
    ]);

    const allData = searches
      .flatMap(s => s?.results || [])
      .map(r => r.title + ': ' + r.snippet)
      .join('\n');

    const analysis = await execute('ai:generate', {
      systemPrompt: `You are a competitive content analyst for ${CURRENT_YEAR}. Return ONLY valid JSON, no markdown.`,
      prompt: `Analyze competitor content for: "${niche}" on ${platform || 'instagram'} in ${CURRENT_YEAR}

Data: ${allData.slice(0, 2000)}

Return JSON with ${CURRENT_YEAR} insights:
{
  "topContentFormats": ["formats winning in ${CURRENT_YEAR}"],
  "winningHooks": ["hook styles getting engagement"],
  "topicPatterns": ["common angles that perform"],
  "contentGaps": ["topics no one covering but audience wants"],
  "recommendedAngles": [
    {
      "angle": "content angle",
      "whyItWorks": "reason",
      "difficulty": "easy|medium|hard",
      "potentialReach": "estimated reach"
    }
  ],
  "avoid": ["content not working in ${CURRENT_YEAR}"]
}`,
      maxTokens: 1200
    });

    const raw = analysis?.output || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};

  } catch(e) {
    console.error('analyzeCompetitorContent error:', e.message);
    return { error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6 — GET BEST POST TIME
// ─────────────────────────────────────────────────────────────────────────────
async function getBestPostTime({ niche, platform, targetAudience }, execute) {
  console.log(`⏰ Best post time: ${niche} on ${platform} — ${CURRENT_YEAR}`);

  try {
    const config = PLATFORM_CONFIGS[platform] || PLATFORM_CONFIGS.general;

    const result = await execute('web:search', {
      query: 'best time to post ' + (platform || 'instagram') + ' ' + niche + ' ' + CURRENT_YEAR + ' engagement',
      count: 8
    });

    const data = (result?.results || [])
      .map(r => r.title + ': ' + r.snippet).join('\n');

    const timing = await execute('ai:generate', {
      systemPrompt: `You are a social media timing expert for ${CURRENT_YEAR}. Return ONLY valid JSON, no markdown.`,
      prompt: `Best post time for ${CURRENT_YEAR}:
Niche: ${niche}
Platform: ${platform || 'instagram'}
Audience: ${targetAudience || 'general'}
Known best times for ${platform}: ${config.bestPostTimes}

Data: ${data.slice(0, 1000)}

Return JSON:
{
  "bestTimes": [
    {
      "day": "Tuesday",
      "time": "8:00 AM",
      "timezone": "EST",
      "reason": "why this works in ${CURRENT_YEAR}",
      "expectedReach": "2-3x normal"
    }
  ],
  "bestDays": ["Tuesday", "Wednesday", "Thursday"],
  "worstTimes": ["Saturday morning"],
  "postingFrequency": "3-5 times per week",
  "platformSpecificTip": "${CURRENT_YEAR} specific tip"
}`,
      maxTokens: 600
    });

    const raw = timing?.output || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};

  } catch(e) {
    console.error('getBestPostTime error:', e.message);
    return { error: e.message };
  }
}
// 7 — SUGGEST UNIQUE CONTENT ANGLES (new feature)
async function suggestContentAngles({ topic, niche, platform, count }, execute) {
  console.log(`💡 Suggesting content angles for: "${topic}" in ${niche}`);

  const CURRENT_YEAR = new Date().getFullYear();

  try {
    const [existing, audience, viral] = await Promise.all([
      execute('web:search', {
        query: topic + ' ' + (platform || 'instagram') + ' content posts ' + CURRENT_YEAR,
        count: 5
      }),
      execute('web:search', {
        query: niche + ' audience pain points problems questions ' + CURRENT_YEAR,
        count: 5
      }),
      execute('web:search', {
        query: 'viral ' + niche + ' content angles hooks unique ' + CURRENT_YEAR,
        count: 5
      })
    ]);

    const existingContent = [
      ...(existing?.results || []),
      ...(audience?.results || []),
      ...(viral?.results || [])
    ].map(r => r.title + ': ' + r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a viral content strategist for ${CURRENT_YEAR}.
The user wants content ideas about "${topic}" in the "${niche}" niche.
Suggest UNIQUE angles on THIS SPECIFIC TOPIC — not generic content.
Every suggestion must be directly related to: ${topic}
Do NOT suggest generic carousel tips or unrelated content.
Do NOT change the topic — stay focused on: ${topic}
Return ONLY valid JSON, no markdown.`,
      prompt: `Suggest ${count || 6} unique content angles specifically about: "${topic}"
Niche: ${niche}
Platform: ${platform || 'instagram'}
Year: ${CURRENT_YEAR}

The angles must be:
- Directly about: "${topic}"
- Different from each other
- Unique — not what everyone else is posting
- Specific to ${niche} audience

What already exists (avoid these angles):
${existingContent.slice(0, 1500)}

Return JSON:
{
  "angles": [
    {
      "title": "specific post title directly about ${topic}",
      "angle": "contrarian|story|data|mistake|howto|listicle|debate",
      "hook": "exact first line about ${topic} that stops scroll",
      "whyUnique": "why this stands out from existing content about ${topic}",
      "whyItWillWork": "psychological reason audience will engage",
      "contentOutline": ["point 1 about ${topic}", "point 2", "point 3"],
      "cta": "call to action",
      "difficulty": "easy|medium|hard",
      "viralPotential": "medium|high|viral",
      "bestFormat": "post|reel|thread|video|story"
    }
  ],
  "contentTheme": "theme connecting all angles about ${topic}",
  "audienceInsight": "what ${niche} audience wants to know about ${topic}",
  "standOutTip": "one specific thing to do differently from everyone else posting about ${topic}"
}`,
      maxTokens: 2000
    });

    const raw = result?.output || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { angles: [] };
    const parsed = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      topic,
      niche,
      platform,
      angles: parsed.angles || [],
      contentTheme: parsed.contentTheme || '',
      audienceInsight: parsed.audienceInsight || '',
      standOutTip: parsed.standOutTip || ''
    };

  } catch(e) {
    console.error('suggestContentAngles error:', e.message);
    return { angles: [], error: e.message };
  }
}
// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  findTrendingTopics,
  getTrendPulse,
  predictViralPotential,
  analyzeHashtags,
  analyzeCompetitorContent,
  getBestPostTime,
  suggestContentAngles  // ← ADD THIS
};