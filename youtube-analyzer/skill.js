// youtube-analyzer/skill.js
// Universal YouTube Channel Analyzer
// No require() needed — uses execute() for everything

const CURRENT_YEAR = new Date().getFullYear();

// ─────────────────────────────────────────────────────────────────────────────
// 1 — ANALYZE CHANNEL
// ─────────────────────────────────────────────────────────────────────────────
async function analyzeChannel({ channelUrl, channelName }, execute) {
  console.log(`📺 Analyzing YouTube channel: ${channelUrl || channelName}`);

  const searchQuery = channelName || channelUrl;

  const [channelData, statsData, recentData] = await Promise.all([
    execute('web:search', {
      query: searchQuery + ' youtube channel subscribers views ' + CURRENT_YEAR,
      count: 6
    }),
    execute('web:search', {
      query: searchQuery + ' youtube channel stats analytics growth',
      count: 5
    }),
    execute('web:search', {
      query: searchQuery + ' youtube latest videos ' + CURRENT_YEAR,
      count: 5
    })
  ]);

  // Try fetching channel page directly
  let channelPageContent = '';
  try {
    const channelPage = await execute('web:fetch', {
      url: channelUrl || 'https://www.youtube.com/@' + searchQuery
    });
    channelPageContent = (channelPage?.content || '').slice(0, 3000);
  } catch(e) {
    console.warn('Could not fetch channel page:', e.message);
  }

  const searchContext = [
    ...(channelData?.results || []),
    ...(statsData?.results || []),
    ...(recentData?.results || [])
  ].map(r => r.title + ': ' + r.snippet).join('\n');

  const analysis = await execute('ai:generate', {
    systemPrompt: `You are a YouTube channel analytics expert for ${CURRENT_YEAR}.
Analyze real search data and return ONLY valid JSON, no markdown.`,
    prompt: `Analyze this YouTube channel: "${searchQuery}"

Real data from web:
${searchContext.slice(0, 2500)}

Channel page content:
${channelPageContent}

Return JSON:
{
  "channelName": "exact channel name",
  "handle": "@handle if found",
  "niche": "main content niche",
  "subNiche": "specific focus area",
  "estimatedSubscribers": "number or range like 500K-1M",
  "estimatedViews": "total views estimate",
  "uploadFrequency": "how often they post",
  "avgVideoLength": "average video length",
  "contentStyle": "educational|entertainment|tutorial|vlog|review|news",
  "targetAudience": "who watches this channel",
  "topTopics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
  "contentStrengths": ["strength1", "strength2", "strength3"],
  "contentWeaknesses": ["weakness1", "weakness2"],
  "monetization": "likely monetization methods",
  "engagementLevel": "low|medium|high|viral",
  "growthTrend": "growing|stable|declining",
  "uniqueValueProposition": "what makes this channel unique",
  "bestPerformingContentType": "what content gets most views"
}`,
    maxTokens: 1200
  });

  try {
    const raw = analysis?.output || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { success: false, error: 'Could not analyze channel' };
    const parsed = JSON.parse(jsonMatch[0]);
    return { success: true, ...parsed, searchQuery };
  } catch(e) {
    console.error('analyzeChannel error:', e.message);
    return { success: false, error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2 — FIND TRENDING VIDEOS IN NICHE
// ─────────────────────────────────────────────────────────────────────────────
async function findTrendingVideos({ niche, channelName, count }, execute) {
  console.log(`🔥 Finding trending YouTube videos: ${niche}`);

  count = count || 8;

  const [trending, viral, recent] = await Promise.all([
    execute('web:search', {
      query: niche + ' youtube trending videos ' + CURRENT_YEAR + ' most views',
      count: 6
    }),
    execute('web:search', {
      query: 'viral youtube ' + niche + ' video ' + CURRENT_YEAR,
      count: 5
    }),
    execute('web:search', {
      query: niche + ' youtube shorts trending ' + CURRENT_YEAR,
      count: 4
    })
  ]);

  const allResults = [
    ...(trending?.results || []),
    ...(viral?.results || []),
    ...(recent?.results || [])
  ].map(r => r.title + ': ' + r.snippet).join('\n');

  const result = await execute('ai:generate', {
    systemPrompt: `You are a YouTube trends expert for ${CURRENT_YEAR}.
Extract trending video patterns from search data.
Return ONLY valid JSON, no markdown.`,
    prompt: `Find trending YouTube videos for niche: "${niche}"
${channelName ? 'Channel context: ' + channelName : ''}

Real search data:
${allResults.slice(0, 2000)}

Return JSON:
{
  "trending": [
    {
      "title": "video title pattern that's trending",
      "topic": "main topic",
      "estimatedViews": "view range like 1M-5M",
      "whyTrending": "reason based on search data",
      "videoType": "short|long|series",
      "thumbnailStyle": "describe the thumbnail style",
      "hookIdea": "first 10 seconds hook",
      "trendScore": 9
    }
  ],
  "risingTopics": ["topic just starting to trend"],
  "peakingTopics": ["at peak now post immediately"],
  "avoidTopics": ["oversaturated topics"],
  "bestVideoLength": "ideal length for this niche right now",
  "shortsOpportunity": "shorts trend in this niche"
}`,
    maxTokens: 1500
  });

  try {
    const raw = result?.output || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { trending: [], risingTopics: [], peakingTopics: [] };
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      success: true,
      niche,
      trending: parsed.trending || [],
      risingTopics: parsed.risingTopics || [],
      peakingTopics: parsed.peakingTopics || [],
      avoidTopics: parsed.avoidTopics || [],
      bestVideoLength: parsed.bestVideoLength || '',
      shortsOpportunity: parsed.shortsOpportunity || ''
    };
  } catch(e) {
    console.error('findTrendingVideos error:', e.message);
    return { trending: [], risingTopics: [], peakingTopics: [], error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3 — GENERATE VIDEO IDEAS
// ─────────────────────────────────────────────────────────────────────────────
async function generateVideoIdeas({ niche, channelAnalysis, trendData, count }, execute) {
  console.log(`💡 Generating video ideas for: ${niche}`);

  count = count || 10;

  // Search for content gaps
  const [gaps, competitor, audience] = await Promise.all([
    execute('web:search', {
      query: niche + ' youtube content gap missing videos ' + CURRENT_YEAR,
      count: 5
    }),
    execute('web:search', {
      query: 'best ' + niche + ' youtube channel ideas ' + CURRENT_YEAR,
      count: 5
    }),
    execute('web:search', {
      query: niche + ' youtube audience questions reddit quora',
      count: 5
    })
  ]);

  const gapContext = [
    ...(gaps?.results || []),
    ...(competitor?.results || []),
    ...(audience?.results || [])
  ].map(r => r.title + ': ' + r.snippet).join('\n');

  const channelContext = channelAnalysis ? `
Channel niche: ${channelAnalysis.niche}
Content style: ${channelAnalysis.contentStyle}
Target audience: ${channelAnalysis.targetAudience}
Top topics: ${(channelAnalysis.topTopics || []).join(', ')}
Strengths: ${(channelAnalysis.contentStrengths || []).join(', ')}
` : '';

  const trendContext = trendData ? `
Currently trending: ${(trendData.trending || []).slice(0, 3).map(t => t.topic).join(', ')}
Rising topics: ${(trendData.risingTopics || []).slice(0, 3).join(', ')}
` : '';

  const result = await execute('ai:generate', {
    systemPrompt: `You are a world-class YouTube content strategist for ${CURRENT_YEAR}.
You create video ideas that get millions of views.
Return ONLY valid JSON, no markdown.`,
    prompt: `Generate ${count} viral YouTube video ideas for niche: "${niche}"

${channelContext}
${trendContext}

Content gap research:
${gapContext.slice(0, 1800)}

Return JSON:
{
  "ideas": [
    {
      "title": "exact video title optimized for YouTube search",
      "hook": "first 30 seconds script hook",
      "thumbnail": "thumbnail concept description",
      "keyPoints": ["point1", "point2", "point3"],
      "estimatedViews": "view range prediction",
      "difficulty": "easy|medium|hard to make",
      "videoType": "short|long|series",
      "idealLength": "ideal video length",
      "seoKeywords": ["keyword1", "keyword2", "keyword3"],
      "viralPotential": "low|medium|high|viral",
      "whyItWillWork": "reason this will get views",
      "callToAction": "what CTA to use",
      "contentGap": "what gap this fills"
    }
  ],
  "seriesIdea": "a series concept for the channel",
  "shortsIdeas": ["short1", "short2", "short3"],
  "contentCalendar": "suggested posting schedule"
}`,
    maxTokens: 2500
  });

  try {
    const raw = result?.output || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { ideas: [], shortsIdeas: [] };
    const parsed = JSON.parse(jsonMatch[0]);
    return {
      success: true,
      niche,
      ideas: parsed.ideas || [],
      seriesIdea: parsed.seriesIdea || '',
      shortsIdeas: parsed.shortsIdeas || [],
      contentCalendar: parsed.contentCalendar || ''
    };
  } catch(e) {
    console.error('generateVideoIdeas error:', e.message);
    return { ideas: [], shortsIdeas: [], error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4 — ANALYZE SEO
// ─────────────────────────────────────────────────────────────────────────────
async function analyzeSEO({ videoTitle, niche, channelName }, execute) {
  console.log(`🔎 Analyzing YouTube SEO for: ${videoTitle}`);

  const [titleSearch, keywordSearch, competitorSearch] = await Promise.all([
    execute('web:search', {
      query: '"' + videoTitle + '" youtube views site:youtube.com',
      count: 5
    }),
    execute('web:search', {
      query: niche + ' youtube SEO keywords tags ' + CURRENT_YEAR,
      count: 5
    }),
    execute('web:search', {
      query: 'youtube ' + niche + ' top ranking videos keywords',
      count: 5
    })
  ]);

  const searchData = [
    ...(titleSearch?.results || []),
    ...(keywordSearch?.results || []),
    ...(competitorSearch?.results || [])
  ].map(r => r.title + ': ' + r.snippet).join('\n');

  const result = await execute('ai:generate', {
    systemPrompt: `You are a YouTube SEO expert for ${CURRENT_YEAR}.
Analyze video title and provide optimization recommendations.
Return ONLY valid JSON, no markdown.`,
    prompt: `Analyze YouTube SEO for:
Title: "${videoTitle}"
Niche: ${niche}
Channel: ${channelName || 'unknown'}

Search data:
${searchData.slice(0, 1500)}

Return JSON:
{
  "seoScore": 75,
  "titleAnalysis": {
    "strengths": ["what works in title"],
    "weaknesses": ["what to improve"],
    "optimizedTitle": "improved version of title",
    "altTitles": ["alternative title 1", "alternative title 2"]
  },
  "recommendedTags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "recommendedDescription": "first 150 chars of description",
  "thumbnailTips": ["thumbnail tip 1", "thumbnail tip 2"],
  "bestPostTime": "best day and time to publish",
  "competitionLevel": "low|medium|high",
  "searchVolume": "estimated search volume for main keyword",
  "improvements": ["improvement1", "improvement2", "improvement3"]
}`,
    maxTokens: 1000
  });

  try {
    const raw = result?.output || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { seoScore: 0 };
  } catch(e) {
    console.error('analyzeSEO error:', e.message);
    return { seoScore: 0, error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5 — COMPARE COMPETITORS
// ─────────────────────────────────────────────────────────────────────────────
async function compareCompetitors({ channelName, niche, competitors }, execute) {
  console.log(`🔍 Comparing competitors for: ${channelName}`);

  const competitorList = competitors || [];

  const searches = await Promise.all([
    execute('web:search', {
      query: 'top ' + niche + ' youtube channels ' + CURRENT_YEAR + ' subscribers',
      count: 8
    }),
    execute('web:search', {
      query: niche + ' youtube channel comparison best creators',
      count: 6
    }),
    ...competitorList.slice(0, 3).map(c =>
      execute('web:search', {
        query: c + ' youtube channel subscribers views ' + CURRENT_YEAR,
        count: 4
      })
    )
  ]);

  const allData = searches
    .flatMap(s => s?.results || [])
    .map(r => r.title + ': ' + r.snippet)
    .join('\n');

  const result = await execute('ai:generate', {
    systemPrompt: `You are a competitive YouTube analytics expert for ${CURRENT_YEAR}.
Return ONLY valid JSON, no markdown.`,
    prompt: `Compare YouTube channels in niche: "${niche}"
Your channel: ${channelName}
Competitors to analyze: ${competitorList.join(', ') || 'find top 5 in niche'}

Search data:
${allData.slice(0, 2000)}

Return JSON:
{
  "competitors": [
    {
      "name": "channel name",
      "estimatedSubscribers": "subscriber count",
      "contentStyle": "their content approach",
      "uploadFrequency": "how often they post",
      "strengths": ["strength1", "strength2"],
      "weaknesses": ["gap you can exploit"],
      "topContentType": "what performs best for them",
      "estimatedMonthlyViews": "monthly view estimate"
    }
  ],
  "marketGaps": ["gap1 you can fill", "gap2"],
  "yourAdvantages": ["what you can do better"],
  "recommendedDifferentiator": "how to stand out from all competitors",
  "contentOpportunities": ["opportunity1", "opportunity2", "opportunity3"],
  "audienceOverlap": "how much audience overlap exists"
}`,
    maxTokens: 1500
  });

  try {
    const raw = result?.output || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { competitors: [] };
  } catch(e) {
    console.error('compareCompetitors error:', e.message);
    return { competitors: [], error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6 — GET BEST UPLOAD TIME
// ─────────────────────────────────────────────────────────────────────────────
async function getBestUploadTime({ niche, targetAudience, channelSize }, execute) {
  console.log(`⏰ Finding best upload time for: ${niche}`);

  const result = await execute('web:search', {
    query: 'best time to upload youtube ' + niche + ' ' + CURRENT_YEAR + ' views engagement',
    count: 8
  });

  const data = (result?.results || [])
    .map(r => r.title + ': ' + r.snippet).join('\n');

  const timing = await execute('ai:generate', {
    systemPrompt: `You are a YouTube upload timing expert for ${CURRENT_YEAR}.
Return ONLY valid JSON, no markdown.`,
    prompt: `Best upload time for YouTube channel:
Niche: ${niche}
Target audience: ${targetAudience || 'general'}
Channel size: ${channelSize || 'small to medium'}

Data: ${data.slice(0, 1000)}

Return JSON:
{
  "bestTimes": [
    {
      "day": "Friday",
      "time": "3:00 PM",
      "timezone": "EST",
      "reason": "why this works",
      "expectedBoost": "2-3x normal views"
    }
  ],
  "bestDays": ["Friday", "Saturday", "Sunday"],
  "worstDays": ["Monday", "Tuesday"],
  "uploadFrequency": "2-3 times per week",
  "shortsFrequency": "daily for maximum reach",
  "platformTip": "YouTube specific tip for ${CURRENT_YEAR}",
  "premiereTip": "whether to use YouTube premiere feature"
}`,
    maxTokens: 600
  });

  try {
    const raw = timing?.output || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch(e) {
    console.error('getBestUploadTime error:', e.message);
    return { error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7 — GENERATE THUMBNAIL IDEAS
// ─────────────────────────────────────────────────────────────────────────────
async function generateThumbnailIdeas({ videoTitle, niche, style }, execute) {
  console.log(`🖼️ Generating thumbnail ideas for: ${videoTitle}`);

  const result = await execute('web:search', {
    query: 'viral youtube thumbnail design ' + niche + ' ' + CURRENT_YEAR + ' high CTR',
    count: 6
  });

  const data = (result?.results || [])
    .map(r => r.title + ': ' + r.snippet).join('\n');

  const ideas = await execute('ai:generate', {
    systemPrompt: `You are a YouTube thumbnail design expert.
High CTR thumbnails that stop the scroll.
Return ONLY valid JSON, no markdown.`,
    prompt: `Generate thumbnail ideas for:
Title: "${videoTitle}"
Niche: ${niche}
Style preference: ${style || 'any'}

Thumbnail trend data:
${data.slice(0, 800)}

Return JSON:
{
  "thumbnails": [
    {
      "concept": "description of thumbnail visual",
      "text": "big text overlay to use (max 4 words)",
      "colors": "primary colors to use",
      "emotion": "facial expression or emotion to show",
      "background": "background description",
      "ctrPrediction": "estimated CTR improvement",
      "style": "bold|minimal|clean|dramatic"
    }
  ],
  "generalTips": ["tip1", "tip2", "tip3"],
  "colorsToUse": ["color1", "color2"],
  "colorsToAvoid": ["color to avoid"],
  "textRules": "rules for text on thumbnail"
}`,
    maxTokens: 1000
  });

  try {
    const raw = ideas?.output || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? JSON.parse(jsonMatch[0]) : { thumbnails: [] };
  } catch(e) {
    console.error('generateThumbnailIdeas error:', e.message);
    return { thumbnails: [], error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS
// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  analyzeChannel,
  findTrendingVideos,
  generateVideoIdeas,
  analyzeSEO,
  compareCompetitors,
  getBestUploadTime,
  generateThumbnailIdeas
};