// aistie-skills/twitter-algorithm/skill.js
// Twitter Algorithm Optimizer
// Based on insights from Twitter's open-source algorithm (github.com/twitter/the-algorithm)

// Key ranking signals from Twitter's open-source algorithm
const TWITTER_ALGORITHM_SIGNALS = {
  positive: [
    'Replies (weighted highest — shows conversation)',
    'Retweets with comment (quote tweets)',
    'Likes (moderate weight)',
    'Bookmarks (strong signal — private save)',
    'Profile clicks from tweet',
    'Video completion rate',
    'Link clicks (moderate)',
    'Follows from tweet'
  ],
  negative: [
    'Mutes',
    'Blocks',
    'Report as spam',
    'Hide replies',
    'Clicking away quickly (dwell time negative)'
  ],
  format: [
    'Under 280 chars gets more reach than longer',
    'Images boost engagement 35%',
    'Videos boost 150%',
    'Polls get high engagement but low reach amplification',
    'Threads perform well if first tweet is strong',
    'External links reduce distribution (post in reply instead)',
    'Hashtags: 1-2 max — more hurts reach',
    'Asking direct questions boosts replies'
  ]
};

module.exports = {

  // ── OPTIMIZE TWEET: Rewrite using algorithm signals ──────────────────────
  async optimizeTweet({ tweet, goal = 'engagement', audience = '' }, execute) {
    const search = await execute('web:search', {
      query: 'viral tweets examples high engagement ' + goal + ' 2025 twitter algorithm',
      count: 5
    });
    const examples = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a Twitter algorithm expert who has studied Twitter's open-source code.

TWITTER ALGORITHM FACTS (from open-source code):
${TWITTER_ALGORITHM_SIGNALS.format.join('\n')}

WHAT DRIVES REACH:
${TWITTER_ALGORITHM_SIGNALS.positive.join('\n')}

WHAT KILLS REACH:
${TWITTER_ALGORITHM_SIGNALS.negative.join('\n')}`,
      prompt: `Optimize this tweet for maximum algorithmic reach:

Original tweet: "${tweet}"
Goal: ${goal}
Audience: ${audience || 'general'}

Viral tweet examples: ${examples}

## TWEET OPTIMIZATION REPORT

### Algorithm Score: X/100
What's working:
What's hurting reach:

### Optimized Versions (3 rewrites)

**Version 1 — Maximum Engagement:**
[tweet under 280 chars]
Why it works algorithmically:
Predicted engagement: High/Medium/Low

**Version 2 — Replies Optimized:**
(ends with question to drive replies — highest weight signal)
[tweet]
Why it works:

**Version 3 — Bookmarks Optimized:**
(educational/valuable — people save these)
[tweet]
Why it works:

### Algorithm Checklist for Your Tweet
- [ ] Under 200 chars? (sweet spot)
- [ ] Ends with question or CTA?
- [ ] Has image/video recommendation?
- [ ] No external link in tweet body? (put in reply)
- [ ] 1-2 hashtags max?
- [ ] Hook in first 5 words?

### Best Time to Post
For ${audience || 'general'} audience: [specific days/times]

### Thread Potential
Should this be a thread? [Yes/No]
If yes, thread structure:`,
      maxTokens: 1200
    });

    return { success: true, original: tweet, optimization: result?.output || '' };
  },

  // ── ANALYZE THREAD: Score and improve thread structure ───────────────────
  async analyzeThread({ tweets = [], topic = '' }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are a Twitter thread expert. Threads live or die by tweet 1. Algorithm distributes based on engagement on first tweet.`,
      prompt: `Analyze and improve this Twitter thread about "${topic}":

Thread tweets:
${tweets.map((t, i) => `Tweet ${i + 1}: "${t}"`).join('\n')}

## THREAD ANALYSIS

### Thread Score: X/100

### Tweet 1 Analysis (most critical)
Hook strength (X/10):
Does it make someone want to read more? Y/N
Rewrite: [improved tweet 1]

### Thread Structure
- Opening hook quality:
- Information flow:
- Engagement checkpoints (you need a tweet every 3-4 that asks for engagement):
- Closing CTA:

### Tweets to Rewrite
Tweet #X: Problem: — Rewrite:
Tweet #Y: Problem: — Rewrite:

### Missing Elements
Add these for higher completion rate:

### Optimized Full Thread
[complete rewritten thread]`,
      maxTokens: 1500
    });

    return { success: true, topic, analysis: result?.output || '' };
  },

  // ── FIND VIRAL ANGLES: What tweets go viral in your niche ────────────────
  async findViralAngles({ topic, niche = '', account = '' }, execute) {
    const [viral, controversial, data] = await Promise.all([
      execute('web:search', { query: 'viral tweets ' + niche + ' ' + topic + ' high engagement 2025', count: 6 }),
      execute('web:search', { query: 'controversial hot take ' + niche + ' ' + topic + ' twitter debate', count: 5 }),
      execute('web:search', { query: topic + ' surprising statistics facts data 2025', count: 5 })
    ]);

    const allData = [
      ...(viral?.results || []),
      ...(controversial?.results || []),
      ...(data?.results || [])
    ].map(r => r.title + ': ' + r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a viral tweet strategist. Find angles that consistently go viral.`,
      prompt: `Find viral tweet angles for "${topic}" in "${niche}":

Data: ${allData}

## VIRAL ANGLES REPORT

### 10 Tweet Ideas Ranked by Viral Potential

1. **[Angle Type: Hot Take]**
Tweet: "..."
Why it goes viral:
Expected reaction: Agree/Disagree debate

2. **[Angle Type: Surprising Stat]**
Tweet: "..."

3. **[Angle Type: Controversial Opinion]**
Tweet: "..."

4. **[Angle Type: Personal Story]**
Tweet: "..."

5-10. (continue with different angles)

### Angle Types That Work in ${niche}
- Most engaging format:
- Best posting time:
- Hashtag strategy:

### Topic to AVOID (what kills reach in this niche)`,
      maxTokens: 1200
    });

    return { success: true, topic, niche, angles: result?.output || '' };
  },

  // ── TWEET CALENDAR: 30-day tweet plan ───────────────────────────────────
  async tweetCalendar({ niche, account = '', tweetsPerDay = 3 }, execute) {
    const search = await execute('web:search', {
      query: niche + ' twitter content ideas topics trends 2025',
      count: 6
    });
    const trends = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a Twitter growth expert. Create a content calendar that builds an audience.`,
      prompt: `Create 7-day Twitter content calendar for "${niche}" account @${account || 'account'}.
${tweetsPerDay} tweets per day.

Trending context: ${trends}

## 7-DAY TWITTER CALENDAR

For each day provide ${tweetsPerDay} tweets:

**MONDAY**
Morning tweet (7-9am): [type] — "[tweet text]"
Afternoon tweet (12-2pm): [type] — "[tweet text]"
Evening tweet (6-8pm): [type] — "[tweet text]"

**TUESDAY**
...

(continue for all 7 days)

## Content Mix
- Educational: X%
- Personal/Story: X%
- Engagement (questions): X%
- Hot takes: X%
- Promotional: X% (keep under 20%)

## Weekly Engagement Strategy
Monday: [theme]
Wednesday: [engagement push — ask question]
Friday: [weekly insight/thread]`,
      maxTokens: 2000
    });

    return { success: true, niche, calendar: result?.output || '' };
  }
};
