// aistie-skills/social-media-research/skill.js
// Real social listening — Reddit + X discussions with actual quotes

module.exports = {

  async redditResearch({ topic, subreddits = [], timeframe = 'month' }, execute) {
    const subList = subreddits.length > 0 ? subreddits : ['general'];
    const searches = await Promise.all([
      execute('web:search', { query: 'site:reddit.com ' + topic + ' discussion opinions 2025', count: 8 }),
      execute('web:search', { query: 'reddit ' + topic + ' what do people think community', count: 6 }),
      execute('web:search', { query: topic + ' reddit complaints problems love hate', count: 6 })
    ]);

    const allPosts = [...(searches[0]?.results || []), ...(searches[1]?.results || []), ...(searches[2]?.results || [])]
      .map(r => r.title + ': ' + r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a social listening analyst. Extract real opinions with exact quotes. Never paraphrase — quote directly.`,
      prompt: `Analyze Reddit discussions about "${topic}":

Reddit data: ${allPosts}

## REDDIT RESEARCH REPORT

### Overall Sentiment
Positive: X% | Neutral: X% | Negative: X%

### What People LOVE (with direct quotes)
Quote 1: "..." — r/[subreddit]
Quote 2: "..."
Quote 3: "..."

### What People HATE (with direct quotes)
Quote 1: "..." — r/[subreddit]
Quote 2: "..."
Quote 3: "..."

### Most Common Questions Asked
1.
2.
3.
4.
5.

### Recurring Themes
Theme 1: (how often mentioned, sentiment)
Theme 2:
Theme 3:

### Key Influencers/Voices in Community
(accounts or types of people who shape opinion)

### Surprising Insights
(things you wouldn't expect — the gold)

### Marketing Implications
- Language to use in ads/copy:
- Pain points to address:
- What NOT to say:
- Content angles that resonate:`,
      maxTokens: 1500
    });

    return { success: true, topic, research: result?.output || '' };
  },

  async sentimentAnalysis({ brand, competitors = [], platform = 'all' }, execute) {
    const searches = await Promise.all([
      execute('web:search', { query: brand + ' reviews opinions what people say 2025', count: 8 }),
      execute('web:search', { query: brand + ' complaints problems issues users', count: 6 }),
      execute('web:search', { query: brand + ' positive testimonials love recommend', count: 5 })
    ]);

    const allData = [...(searches[0]?.results || []), ...(searches[1]?.results || []), ...(searches[2]?.results || [])]
      .map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a brand sentiment analyst. Be accurate and specific. Use evidence from data.`,
      prompt: `Full sentiment analysis for "${brand}":

Data: ${allData}
Competitors: ${competitors.join(', ') || 'none specified'}

## SENTIMENT ANALYSIS REPORT

### Sentiment Score: X/100 (0=very negative, 100=very positive)

### Sentiment Breakdown
Positive mentions: X%
Neutral mentions: X%  
Negative mentions: X%
Net Promoter estimate: X

### Positive Themes
(what people consistently praise)

### Negative Themes
(what people consistently criticize)

### Most Mentioned Attributes
1. [attribute]: sentiment
2.
3.

### Competitor Sentiment Comparison
${brand}: X/100
${competitors[0] || 'Competitor'}: X/100 (estimated)

### Crisis Risk Assessment
Current reputation risks:
Trending negative topics to watch:

### Reputation Improvement Priorities
1.
2.
3.`,
      maxTokens: 1400
    });

    return { success: true, brand, analysis: result?.output || '' };
  },

  async trendDetection({ topic, platform = 'all', region = 'global' }, execute) {
    const [emerging, peak, declining] = await Promise.all([
      execute('web:search', { query: topic + ' emerging trend growing 2025 new', count: 7 }),
      execute('web:search', { query: topic + ' trend popular viral now', count: 6 }),
      execute('web:search', { query: topic + ' declining dead over saturated 2025', count: 5 })
    ]);

    const data = [...(emerging?.results || []), ...(peak?.results || []), ...(declining?.results || [])].map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a trend analyst who identifies trends early before they peak.`,
      prompt: `Analyze social media trends for "${topic}" on ${platform}:

Region: ${region}
Data: ${data}

## TREND DETECTION REPORT

### Trend Lifecycle Map
🌱 EMERGING (get in now):
📈 GROWING (still good time):
🔥 PEAK (last chance or wait):
📉 DECLINING (avoid or pivot):

### Top 5 Emerging Trends
1. Trend: — Stage: — Time to act: — Opportunity:
2.
3.
4.
5.

### Trend Signals
Early indicators showing:
What to watch for next:

### Content Opportunities
Best content to create RIGHT NOW:
Content to avoid (oversaturated):

### 6-Month Prediction
What will be big by then:`,
      maxTokens: 1200
    });

    return { success: true, topic, platform, trends: result?.output || '' };
  },

  async audienceInsights({ niche, platform = 'general', productType = '' }, execute) {
    const searches = await Promise.all([
      execute('web:search', { query: niche + ' audience demographics interests behavior 2025', count: 6 }),
      execute('web:search', { query: niche + ' community what they want buy 2025', count: 6 })
    ]);

    const data = [...(searches[0]?.results || []), ...(searches[1]?.results || [])].map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are an audience research specialist who builds detailed community profiles.`,
      prompt: `Deep audience insights for "${niche}" community:

Platform: ${platform}
Product type: ${productType || 'general'}
Data: ${data}

## AUDIENCE INSIGHTS

### Who They Are
Demographics: Age, gender, location, income, occupation
Psychographics: Values, personality, lifestyle

### Online Behavior
Where they spend time online:
Content formats they consume:
Peak activity times:
Influencers they follow:

### Buying Behavior
How they research purchases:
What triggers buying decision:
Average spend in this niche:
Price sensitivity:

### Community Language
Terminology they use (jargon, slang):
Topics they're obsessed with:
Inside jokes/references:

### Pain Points by Priority
1. (most painful — address first in marketing)
2.
3.

### Content They Engage With Most
Format 1: — Why:
Format 2: — Why:

### How to Reach Them
Best channels:
Best ad targeting angles:
Influencer types that work:`,
      maxTokens: 1400
    });

    return { success: true, niche, platform, insights: result?.output || '' };
  }
};
