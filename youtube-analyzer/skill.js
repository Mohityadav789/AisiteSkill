// youtube-analyzer/skill.js
// Universal YouTube Channel Analyzer — Real web data only, no hallucination
// Uses execute() for all external calls — NO require('axios')

const CURRENT_YEAR = new Date().getFullYear();

// ─────────────────────────────────────────────────────────────────────────────
// HELPER — clean YouTube URL and extract handle
// ─────────────────────────────────────────────────────────────────────────────
function extractHandle(input) {
  if (!input) return '';

  // Remove tracking params (?si=xxx &feature=xxx etc)
  let clean = '';
  try {
    const urlObj = new URL(input);
    clean = urlObj.origin + urlObj.pathname;
  } catch(e) {
    clean = input.split('?')[0].trim();
  }

  // Remove trailing slash
  clean = clean.replace(/\/$/, '');

  // Extract handle from common YouTube URL patterns
  const handleMatch = clean.match(/\/@([^\/\s?&]+)/);
  const cMatch     = clean.match(/\/c\/([^\/\s?&]+)/);
  const uMatch     = clean.match(/\/user\/([^\/\s?&]+)/);

  if (handleMatch) return handleMatch[1];
  if (cMatch)      return cMatch[1];
  if (uMatch)      return uMatch[1];

  // If it's a plain name (not a URL) just return it
  if (!input.startsWith('http')) return input.trim();

  // Last resort — last path segment
  return clean.split('/').pop() || '';
}

// ─────────────────────────────────────────────────────────────────────────────
// 1 — ANALYZE CHANNEL
// ─────────────────────────────────────────────────────────────────────────────
async function analyzeChannel({ channelUrl, channelName }, execute) {
  const rawInput = channelUrl || channelName || '';
  console.log(`📺 analyzeChannel called with: ${rawInput}`);

  // Step 1 — Extract clean handle
  const handle = extractHandle(rawInput);
  const cleanUrl = 'https://www.youtube.com/@' + handle;

  console.log(`📺 Clean handle: ${handle}`);

  if (!handle) {
    return {
      success: false,
      error: 'Could not extract channel name from input. Please paste the channel name like "MrBeast" or URL like "https://youtube.com/@MrBeast"'
    };
  }

  // Step 2 — Parallel web searches with clean handle
  let s1, s2, s3, s4;
  try {
    [s1, s2, s3, s4] = await Promise.all([
      execute('web:search', {
        query: handle + ' youtube channel subscribers views ' + CURRENT_YEAR,
        count: 6
      }),
      execute('web:search', {
        query: '"' + handle + '" youtube channel niche content type',
        count: 5
      }),
      execute('web:search', {
        query: handle + ' youtuber about videos genre language',
        count: 5
      }),
      execute('web:search', {
        query: 'youtube.com/@' + handle,
        count: 4
      })
    ]);
  } catch(e) {
    console.warn('Search error:', e.message);
  }

  // Step 3 — Try fetching the actual channel page
  let channelPageContent = '';
  const urlsToTry = [
    cleanUrl,
    'https://www.youtube.com/c/' + handle,
    'https://www.youtube.com/user/' + handle
  ];

  for (const url of urlsToTry) {
    try {
      console.log(`🔍 Fetching: ${url}`);
      const page = await execute('web:fetch', { url });
      if (page?.content && page.content.length > 100) {
        channelPageContent = page.content.slice(0, 3000);
        console.log(`✅ Channel page fetched: ${channelPageContent.length} chars`);
        break;
      }
    } catch(e) {
      console.warn('Could not fetch:', url);
    }
  }

  // Step 4 — Combine search results
  const searchContext = [
    ...(s1?.results || []),
    ...(s2?.results || []),
    ...(s3?.results || []),
    ...(s4?.results || [])
  ].map(r => (r.title || '') + ': ' + (r.snippet || '')).join('\n');

  console.log(`📊 Search context: ${searchContext.length} chars`);

  if (!searchContext || searchContext.length < 30) {
    return {
      success: false,
      error: `No public data found for "${handle}". The channel may be very new, private, or the name may be incorrect. Try using the exact channel handle from the YouTube URL.`
    };
  }

  // Step 5 — AI analyzes ONLY real data found
  // Step 5 — AI analyzes whatever data we found
  const analysis = await execute('ai:generate', {
    systemPrompt: `You are a YouTube channel analyst for ${CURRENT_YEAR}.
Use information from search results and channel page.
If specific data like subscriber count is not found, write "not found".
NEVER invent numbers. Make reasonable inferences from what IS available.
Return ONLY valid JSON, no markdown.`,
    prompt: `Analyze YouTube channel: "@${handle}"
Clean URL: ${cleanUrl}

All data found:
${combinedContext.slice(0, 2500)}

Return JSON — for any field not found write "not found":
{
  "channelName": "name found OR @${handle}",
  "handle": "@${handle}",
  "channelUrl": "${cleanUrl}",
  "niche": "infer from channel name and any available data",
  "subNiche": "specific focus if found",
  "estimatedSubscribers": "exact number OR not found",
  "estimatedViews": "total views OR not found",
  "uploadFrequency": "frequency if mentioned OR not found",
  "avgVideoLength": "average length if mentioned OR not found",
  "contentStyle": "infer from name and data available",
  "targetAudience": "infer from channel name and niche",
  "topTopics": ["infer from available data"],
  "contentStrengths": ["infer from what is available"],
  "contentWeaknesses": ["not enough data to determine"],
  "growthTrend": "not found",
  "uniqueValueProposition": "infer from channel name and niche",
  "language": "infer if possible OR not found",
  "country": "not found",
  "dataQuality": "low"
}`,
    maxTokens: 1000
  });

  try {
    const raw = analysis?.output || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { success: false, error: 'Could not parse channel analysis. Please try again.' };
    }
    const parsed = JSON.parse(jsonMatch[0]);
    console.log(`✅ Channel analyzed: ${parsed.channelName}, niche: ${parsed.niche}, quality: ${parsed.dataQuality}`);
    return {
      success: true,
      ...parsed,
      cleanHandle: handle,
      cleanUrl
    };
  } catch(e) {
    console.error('analyzeChannel parse error:', e.message);
    return { success: false, error: 'Analysis parse failed: ' + e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2 — FIND TRENDING VIDEOS
// ─────────────────────────────────────────────────────────────────────────────
async function findTrendingVideos({ niche, channelName, count }, execute) {
  console.log(`🔥 findTrendingVideos: ${niche}`);
  count = count || 8;

  const [s1, s2, s3, s4] = await Promise.all([
    execute('web:search', {
      query: '"' + handle + '" youtube',
      count: 6
    }),
    execute('web:search', {
      query: handle + ' youtube channel',
      count: 5
    }),
    execute('web:search', {
      query: '@' + handle + ' youtube videos',
      count: 5
    }),
    execute('web:search', {
      query: handle + ' youtuber',
      count: 4
    })
  ]);
  // Try Reddit for community signals
  let redditSignals = '';
  try {
    const reddit = await execute('web:fetch', {
      url: 'https://www.reddit.com/r/youtube/search.json?q=' + encodeURIComponent(niche) + '&sort=hot&limit=5&t=week'
    });
    const redditJson = JSON.parse(reddit?.content || '{}');
    redditSignals = (redditJson?.data?.children || [])
      .map(p => 'Reddit trending: ' + p.data?.title)
      .slice(0, 4)
      .join('\n');
  } catch(e) {}

  const searchContext = [
    ...(r1?.results || []),
    ...(r2?.results || []),
    ...(r3?.results || [])
  ].map(r => (r.title || '') + ': ' + (r.snippet || '')).join('\n');

  // Even if search found nothing — still try with channel page content
// Small/new channels have no web presence but YouTube page still works
// Combine ALL data found
  const combinedContext = (searchContext || '') + '\n' + (channelPageContent || '');

  if (!searchContext && !channelPageContent) {
    return {
      success: false,
      error: `Could not reach YouTube for "${handle}". Please check your internet connection and try again.`
    };
  }

  if (combinedContext.trim().length < 30) {
    return {
      success: false,
      error: `"${handle}" appears to be a very new or private channel with no public data yet.`
    };
  }

// If search found little data — use what we have + warn user
const combinedContext = (searchContext || '') + '\n' + (channelPageContent || '');
if (combinedContext.trim().length < 30) {
  return {
    success: false,
    error: `"${handle}" appears to be a very new or private channel with no public data yet. Try a channel with more videos published.`
  };
}

  const result = await execute('ai:generate', {
    systemPrompt: `You are a YouTube trends analyst for ${CURRENT_YEAR}.
Extract trending patterns ONLY from the search data provided.
Do NOT invent video titles or topics not mentioned in the data.
Return ONLY valid JSON, no markdown.`,
    prompt: `Find trending YouTube patterns for niche: "${niche}"
${channelName ? 'Channel context: ' + channelName : ''}

REAL web search data:
${combinedContext.slice(0, 2500)}

Reddit community signals:
${redditSignals || 'none found'}

Based ONLY on above data return JSON:
{
  "trending": [
    {
      "title": "video topic pattern from data",
      "topic": "main topic",
      "estimatedViews": "view range found in data",
      "whyTrending": "reason from real data",
      "videoType": "short|long",
      "hookIdea": "hook based on patterns found",
      "trendScore": 8
    }
  ],
  "risingTopics": ["topics gaining traction in data"],
  "peakingTopics": ["at peak now — post immediately"],
  "avoidTopics": ["oversaturated from data"],
  "bestVideoLength": "based on what data shows",
  "shortsOpportunity": "shorts trend found in data"
}`,
    maxTokens: 1500
  });

  try {
    const raw = result?.output || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { success: true, trending: [], risingTopics: [] };
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
    return { success: false, trending: [], risingTopics: [], error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3 — GENERATE VIDEO IDEAS
// ─────────────────────────────────────────────────────────────────────────────
async function generateVideoIdeas({ niche, channelAnalysis, trendData, count }, execute) {
  console.log(`💡 generateVideoIdeas: ${niche}`);
  count = count || 10;

  const [r1, r2, r3] = await Promise.all([
    execute('web:search', {
      query: niche + ' youtube content ideas ' + CURRENT_YEAR + ' what to make',
      count: 5
    }),
    execute('web:search', {
      query: niche + ' youtube audience questions reddit what people want to watch',
      count: 5
    }),
    execute('web:search', {
      query: 'most searched ' + niche + ' youtube topics ' + CURRENT_YEAR,
      count: 5
    })
  ]);

  const gapContext = [
    ...(r1?.results || []),
    ...(r2?.results || []),
    ...(r3?.results || [])
  ].map(r => (r.title || '') + ': ' + (r.snippet || '')).join('\n');

  const channelContext = (channelAnalysis?.success && channelAnalysis?.niche) ? `
Channel: ${channelAnalysis.channelName || niche}
Niche: ${channelAnalysis.niche}
Style: ${channelAnalysis.contentStyle || 'unknown'}
Audience: ${channelAnalysis.targetAudience || 'general'}
Strengths: ${(channelAnalysis.contentStrengths || []).join(', ')}
Language: ${channelAnalysis.language || 'unknown'}
` : `Niche: ${niche}`;

  const trendContext = (trendData?.trending?.length) ? `
Real trending topics from web: ${trendData.trending.slice(0, 3).map(t => t.topic).join(', ')}
Rising: ${(trendData.risingTopics || []).slice(0, 3).join(', ')}
` : '';

  const result = await execute('ai:generate', {
    systemPrompt: `You are a YouTube content strategist for ${CURRENT_YEAR}.
Generate video ideas based on real audience demand found in search data.
Return ONLY valid JSON, no markdown.`,
    prompt: `Generate ${count} YouTube video ideas for niche: "${niche}"

${channelContext}
${trendContext}

Real audience demand from web:
${gapContext.slice(0, 1800)}

Return JSON:
{
  "ideas": [
    {
      "title": "specific SEO-optimized video title",
      "hook": "first 30 seconds hook script",
      "thumbnail": "thumbnail concept",
      "keyPoints": ["point1", "point2", "point3"],
      "estimatedViews": "realistic view prediction",
      "difficulty": "easy|medium|hard",
      "videoType": "short|long|series",
      "idealLength": "ideal length in minutes",
      "seoKeywords": ["keyword1", "keyword2", "keyword3"],
      "viralPotential": "low|medium|high|viral",
      "whyItWillWork": "reason based on audience demand",
      "callToAction": "end CTA"
    }
  ],
  "seriesIdea": "series concept for the channel",
  "shortsIdeas": ["short idea 1", "short idea 2", "short idea 3"],
  "contentCalendar": "suggested posting schedule"
}`,
    maxTokens: 2500
  });

  try {
    const raw = result?.output || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { success: true, ideas: [], shortsIdeas: [] };
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
    return { success: false, ideas: [], shortsIdeas: [], error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4 — ANALYZE SEO
// ─────────────────────────────────────────────────────────────────────────────
async function analyzeSEO({ videoTitle, niche, channelName }, execute) {
  console.log(`🔎 analyzeSEO: ${videoTitle}`);

  const [r1, r2, r3] = await Promise.all([
    execute('web:search', {
      query: '"' + videoTitle + '" youtube',
      count: 5
    }),
    execute('web:search', {
      query: niche + ' youtube best keywords tags ' + CURRENT_YEAR,
      count: 5
    }),
    execute('web:search', {
      query: niche + ' youtube title ideas high views ' + CURRENT_YEAR,
      count: 4
    })
  ]);

  const searchData = [
    ...(r1?.results || []),
    ...(r2?.results || []),
    ...(r3?.results || [])
  ].map(r => (r.title || '') + ': ' + (r.snippet || '')).join('\n');

  const result = await execute('ai:generate', {
    systemPrompt: `You are a YouTube SEO expert for ${CURRENT_YEAR}.
Analyze title SEO using real search data.
Return ONLY valid JSON, no markdown.`,
    prompt: `Analyze YouTube SEO for: "${videoTitle}"
Niche: ${niche}
Channel: ${channelName || 'unknown'}

Real search data:
${searchData.slice(0, 1500)}

Return JSON:
{
  "seoScore": 75,
  "titleAnalysis": {
    "strengths": ["strength"],
    "weaknesses": ["weakness"],
    "optimizedTitle": "improved title",
    "altTitles": ["alt 1", "alt 2"]
  },
  "recommendedTags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "recommendedDescription": "first 150 chars of description",
  "thumbnailTips": ["tip1", "tip2"],
  "bestPostTime": "best day and time to publish",
  "competitionLevel": "low|medium|high",
  "improvements": ["improvement1", "improvement2", "improvement3"]
}`,
    maxTokens: 1000
  });

  try {
    const raw = result?.output || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? { success: true, ...JSON.parse(jsonMatch[0]) } : { success: false, seoScore: 0 };
  } catch(e) {
    return { success: false, seoScore: 0, error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5 — COMPARE COMPETITORS
// ─────────────────────────────────────────────────────────────────────────────
async function compareCompetitors({ channelName, niche, competitors }, execute) {
  console.log(`🔍 compareCompetitors: ${niche}`);
  const competitorList = competitors || [];

  const searches = await Promise.all([
    execute('web:search', {
      query: 'top ' + niche + ' youtube channels ' + CURRENT_YEAR + ' most subscribers',
      count: 8
    }),
    execute('web:search', {
      query: 'best ' + niche + ' youtubers ' + CURRENT_YEAR + ' popular',
      count: 6
    }),
    ...competitorList.slice(0, 2).map(c =>
      execute('web:search', {
        query: c + ' youtube channel subscribers ' + CURRENT_YEAR,
        count: 4
      })
    )
  ]);

  const allData = searches
    .flatMap(s => s?.results || [])
    .map(r => (r.title || '') + ': ' + (r.snippet || ''))
    .join('\n');

  const result = await execute('ai:generate', {
    systemPrompt: `You are a competitive YouTube analyst for ${CURRENT_YEAR}.
List only channels ACTUALLY mentioned in the search results.
If data is missing say "not found in search data".
Return ONLY valid JSON, no markdown.`,
    prompt: `Find YouTube competitors for niche: "${niche}"
My channel: ${channelName || 'unknown'}
Specific competitors to check: ${competitorList.join(', ') || 'find from search data'}

Real search data:
${allData.slice(0, 2000)}

Return JSON using only channels found in data:
{
  "competitors": [
    {
      "name": "channel name from data",
      "estimatedSubscribers": "from data or not found",
      "contentStyle": "from data",
      "strengths": ["from data"],
      "weaknesses": ["gap you can fill"],
      "topContentType": "from data"
    }
  ],
  "marketGaps": ["gaps found in data"],
  "yourAdvantages": ["what you can do better"],
  "recommendedDifferentiator": "how to stand out based on data",
  "contentOpportunities": ["opportunities from data"]
}`,
    maxTokens: 1500
  });

  try {
    const raw = result?.output || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? { success: true, ...JSON.parse(jsonMatch[0]) } : { success: false, competitors: [] };
  } catch(e) {
    return { success: false, competitors: [], error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6 — GET BEST UPLOAD TIME
// ─────────────────────────────────────────────────────────────────────────────
async function getBestUploadTime({ niche, targetAudience, channelSize }, execute) {
  console.log(`⏰ getBestUploadTime: ${niche}`);

  const result = await execute('web:search', {
    query: 'best time upload youtube ' + niche + ' ' + CURRENT_YEAR + ' views engagement data',
    count: 8
  });

  const data = (result?.results || [])
    .map(r => (r.title || '') + ': ' + (r.snippet || '')).join('\n');

  const timing = await execute('ai:generate', {
    systemPrompt: `You are a YouTube timing expert for ${CURRENT_YEAR}.
Return ONLY valid JSON, no markdown.`,
    prompt: `Best upload time for:
Niche: ${niche}
Audience: ${targetAudience || 'general'}
Channel size: ${channelSize || 'growing'}

Real data:
${data.slice(0, 1000)}

Return JSON:
{
  "bestTimes": [
    {
      "day": "Friday",
      "time": "3:00 PM",
      "timezone": "EST",
      "reason": "reason from data",
      "expectedBoost": "expected boost"
    }
  ],
  "bestDays": ["Friday", "Saturday", "Sunday"],
  "worstDays": ["Monday", "Tuesday"],
  "uploadFrequency": "recommended frequency",
  "shortsFrequency": "shorts frequency",
  "platformTip": "YouTube specific tip for ${CURRENT_YEAR}",
  "premiereTip": "whether to use premiere"
}`,
    maxTokens: 600
  });

  try {
    const raw = timing?.output || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? { success: true, ...JSON.parse(jsonMatch[0]) } : { success: false };
  } catch(e) {
    return { success: false, error: e.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7 — GENERATE THUMBNAIL IDEAS
// ─────────────────────────────────────────────────────────────────────────────
async function generateThumbnailIdeas({ videoTitle, niche, style }, execute) {
  console.log(`🖼️ generateThumbnailIdeas: ${videoTitle}`);

  const result = await execute('web:search', {
    query: 'viral youtube thumbnail ' + niche + ' high CTR design ' + CURRENT_YEAR,
    count: 6
  });

  const data = (result?.results || [])
    .map(r => (r.title || '') + ': ' + (r.snippet || '')).join('\n');

  const ideas = await execute('ai:generate', {
    systemPrompt: `You are a YouTube thumbnail expert for ${CURRENT_YEAR}.
Return ONLY valid JSON, no markdown.`,
    prompt: `Generate thumbnail ideas for: "${videoTitle}"
Niche: ${niche}
Style preference: ${style || 'any'}

Trend data:
${data.slice(0, 800)}

Return JSON:
{
  "thumbnails": [
    {
      "concept": "visual description",
      "text": "max 4 words overlay",
      "colors": "colors to use",
      "emotion": "expression or emotion",
      "background": "background description",
      "ctrPrediction": "expected CTR",
      "style": "bold|minimal|clean|dramatic"
    }
  ],
  "generalTips": ["tip1", "tip2", "tip3"],
  "colorsToUse": ["color1", "color2"],
  "colorsToAvoid": ["color"],
  "textRules": "rules for thumbnail text"
}`,
    maxTokens: 800
  });

  try {
    const raw = ideas?.output || '{}';
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    return jsonMatch ? { success: true, ...JSON.parse(jsonMatch[0]) } : { success: false, thumbnails: [] };
  } catch(e) {
    return { success: false, thumbnails: [], error: e.message };
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