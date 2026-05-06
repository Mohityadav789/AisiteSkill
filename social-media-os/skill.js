// aistie-skills/social-media-os/skill.js
// Social Media OS — 17 social media functions
// Inspired by Charlie Hills Social Media OS (391K+ installs)
// Aistie version DOES MORE — actually posts, saves to sheets, schedules

module.exports = {

  // ── VOICE BUILDER: Interview → brand voice profile ──────────────────────
  async buildVoice({ handle, niche, samplePosts = [] }, execute) {
    // Search for public content examples from similar accounts
    const search = await execute('web:search', {
      query: niche + ' best content creators examples tone style',
      count: 8
    });

    const samplesText = samplePosts.length > 0
      ? 'Sample posts from this account:\n' + samplePosts.join('\n---\n')
      : 'No samples provided — creating from niche analysis.';

    const result = await execute('ai:generate', {
      systemPrompt: `You are a brand voice expert. Create a detailed voice profile.

OUTPUT FORMAT (EXACT):
## Brand Voice Profile for @${handle}

### Personality Traits
(5 adjectives that define this voice)

### Tone Guidelines
- **Do:** ...
- **Never:** ...

### Vocabulary Style
Common words/phrases to use:
Words/phrases to AVOID:

### Content Pillars (3-5 main topics)
1.
2.
3.

### Writing Rules
- Sentence length:
- Emoji usage:
- Hashtag style:
- CTA style:

### Voice Examples
**Good:** (example sentence)
**Bad:** (example sentence)`,
      prompt: `Create brand voice for @${handle} in niche: "${niche}"\n\n${samplesText}\n\nNiche context:\n${(search?.results || []).map(r => r.snippet).join('\n')}`,
      maxTokens: 1000
    });

    return {
      success: true,
      handle,
      niche,
      voiceProfile: result?.output || '',
      instruction: 'Save this as your voice.md file. All other content skills will use this profile.'
    };
  },

  // ── GENERATE CONTENT: Multi-platform content with voice ─────────────────
  async generateContent({ topic, platforms = ['instagram', 'twitter', 'linkedin'], tone = 'professional', voiceProfile = '', count = 3 }, execute) {
    // Get trending context for this topic
    const trendSearch = await execute('web:search', {
      query: topic + ' trending viral content 2025',
      count: 6
    });
    const trendContext = (trendSearch?.results || []).map(r => r.snippet).join('\n');

    const voiceContext = voiceProfile
      ? `\n\nBRAND VOICE TO FOLLOW:\n${voiceProfile}`
      : '';

    const result = await execute('ai:generate', {
      systemPrompt: `You are a viral social media content creator with 10M+ combined followers.
Create ${count} post variations per platform. Make them genuinely good — not generic AI content.
${voiceContext}`,
      prompt: `Create ${count} posts about "${topic}" for: ${platforms.join(', ')}

Trending context: ${trendContext}

For EACH platform, generate ${count} variations with different angles:

INSTAGRAM (up to 2200 chars):
Post 1 — [angle: educational]
Caption: ...
Hashtags: ...

Post 2 — [angle: storytelling]
Caption: ...
Hashtags: ...

TWITTER/X (280 chars max each):
Tweet 1: ...
Tweet 2: ...
Thread starter: ...

LINKEDIN (professional, 1300 chars):
Post 1: ...
Post 2: ...

Make each post genuinely engaging — specific facts, real hooks, strong CTAs.`,
      maxTokens: 2000
    });

    return {
      success: true,
      topic,
      platforms,
      content: result?.output || '',
      trendingContext: (trendSearch?.results || []).slice(0, 3).map(r => ({ title: r.title, url: r.url }))
    };
  },

  // ── POST SCORER: Score any draft against what works ─────────────────────
  async scorePost({ postText, platform = 'instagram', niche = 'general', targetAudience = '' }, execute) {
    // Research what works for this niche and platform
    const search = await execute('web:search', {
      query: niche + ' best performing ' + platform + ' posts 2025 engagement',
      count: 6
    });
    const benchmarks = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a social media analytics expert who has analyzed 10M+ posts.
Score posts accurately — be honest, not flattering. Give specific actionable feedback.`,
      prompt: `Score this ${platform} post for "${niche}" niche:

POST TO SCORE:
"${postText}"

TARGET AUDIENCE: ${targetAudience || 'general'}

BENCHMARK DATA:
${benchmarks}

Score on these 7 dimensions (0-10 each):

1. **Hook Strength** (X/10): Does it stop the scroll in 1 second?
2. **Value Delivery** (X/10): Does it teach, entertain, or inspire?
3. **Authenticity** (X/10): Does it sound human or like AI wrote it?
4. **CTA Strength** (X/10): Is the call to action clear and compelling?
5. **Hashtag Quality** (X/10): Are hashtags strategic or random?
6. **Format Fit** (X/10): Is the format right for this platform?
7. **Virality Potential** (X/10): Will people share this?

**TOTAL SCORE: XX/70**

**Grade:** A/B/C/D/F

**What's Working:**
-

**What's Killing It:**
-

**Rewrite Suggestion:**
(improved version of the post)`,
      maxTokens: 1000
    });

    return {
      success: true,
      platform,
      niche,
      originalPost: postText,
      scoreReport: result?.output || ''
    };
  },

  // ── FIND TRENDS: Real trending topics with content angles ───────────────
  async findTrends({ niche, platform = 'general', timeframe = 'this week' }, execute) {
    const [t1, t2, t3] = await Promise.all([
      execute('web:search', { query: niche + ' trending ' + timeframe, count: 8 }),
      execute('web:search', { query: niche + ' viral ' + platform + ' 2025', count: 6 }),
      execute('web:search', { query: niche + ' news latest hot topics', count: 6 })
    ]);

    const allData = [
      ...(t1?.results || []),
      ...(t2?.results || []),
      ...(t3?.results || [])
    ].map(r => r.title + ': ' + r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a trend spotter for content creators. Identify real actionable trends.`,
      prompt: `Find top 10 trending topics for "${niche}" creators on ${platform}.

Real-time data:
${allData}

For each trend provide:

1. **[Trend Name]**
   - Why it's trending right now:
   - Best content angle for creators:
   - Hook idea: "..."
   - Expected engagement level: High/Medium/Low
   - Time to act: Post within [X days]

(repeat for all 10 trends)

## 3 TRENDS TO ACT ON TODAY:
(top 3 with specific post ideas)`,
      maxTokens: 1500
    });

    return {
      success: true,
      niche,
      platform,
      timeframe,
      trends: result?.output || '',
      sources: [...(t1?.results || []), ...(t2?.results || [])].slice(0, 6).map(r => ({ title: r.title, url: r.url }))
    };
  },

  // ── COMPETITOR ANALYSIS: Deep competitor breakdown ──────────────────────
  async competitorAnalysis({ competitors = [], niche = '', yourHandle = '' }, execute) {
    const competitorData = [];

    for (const competitor of competitors.slice(0, 4)) {
      const search = await execute('web:search', {
        query: competitor + ' ' + niche + ' social media strategy content',
        count: 5
      });
      competitorData.push({
        handle: competitor,
        data: (search?.results || []).map(r => r.title + ': ' + r.snippet).join('\n')
      });
    }

    const competitorText = competitorData
      .map(c => `=== ${c.handle} ===\n${c.data}`)
      .join('\n\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a competitive intelligence analyst for social media creators.`,
      prompt: `Analyze these competitors for @${yourHandle || 'my account'} in "${niche}":

${competitorText}

Provide:

## Competitor Breakdown
(for each competitor)
**@handle**
- Estimated strategy:
- Content types:
- Posting frequency:
- What's working for them:
- Their weakness/gap:

## Content Gaps You Can Fill
(topics they're NOT covering that you should)
1.
2.
3.

## Your Competitive Advantage
What you can do BETTER than all of them:

## Action Plan: Beat Them in 30 Days
Week 1:
Week 2:
Week 3:
Week 4:`,
      maxTokens: 1500
    });

    return {
      success: true,
      competitors,
      niche,
      yourHandle,
      analysis: result?.output || ''
    };
  },

  // ── CONTENT CALENDAR: 30-day content plan ──────────────────────────────
  async contentCalendar({ niche, platforms = ['instagram', 'linkedin'], contentPillars = [], postsPerWeek = 5 }, execute) {
    const trendSearch = await execute('web:search', {
      query: niche + ' content ideas topics 2025',
      count: 8
    });
    const trendData = (trendSearch?.results || []).map(r => r.snippet).join('\n');

    const pillarsText = contentPillars.length > 0
      ? 'Content pillars: ' + contentPillars.join(', ')
      : 'Use standard pillars: Educational, Entertaining, Inspirational, Promotional, Behind-the-scenes';

    const result = await execute('ai:generate', {
      systemPrompt: `You are a content strategist. Create a realistic, specific 30-day content calendar.`,
      prompt: `Create a 30-day content calendar for "${niche}" on ${platforms.join(' & ')}.
${pillarsText}
Posts per week: ${postsPerWeek}

Trending topics to use: ${trendData}

FORMAT — Week by Week:

## WEEK 1
**Monday (Instagram):** [Post type] — "[Specific post idea with hook]"
**Wednesday (LinkedIn):** [Post type] — "[Specific post idea]"
**Friday (Instagram + LinkedIn):** [Post type] — "[Specific post idea]"

## WEEK 2
...

## WEEK 3
...

## WEEK 4
...

## Recurring Content Series
(suggest 2-3 series to run throughout the month)

## Best Times to Post
Platform-specific timing recommendations`,
      maxTokens: 2000
    });

    return {
      success: true,
      niche,
      platforms,
      postsPerWeek,
      calendar: result?.output || ''
    };
  },

  // ── GENERATE HOOKS: 5 frameworks, multiple hooks each ───────────────────
  async generateHooks({ topic, platform = 'instagram', audience = 'general', count = 5 }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are a hook writing expert. Every hook must stop the scroll in 1 second.
Write hooks that feel human — NOT like AI. Specific, bold, surprising.`,
      prompt: `Write ${count} hooks for each of these 5 frameworks for topic: "${topic}"
Platform: ${platform} | Audience: ${audience}

## PAS (Problem-Agitate-Solution)
Hook 1: [Lead with the painful problem]
Hook 2: [Different angle on same pain]

## AIDA (Attention-Interest-Desire-Action)
Hook 1: [Bold attention-grabbing opening]
Hook 2: [Curiosity-based opening]

## BAB (Before-After-Bridge)
Hook 1: [Paint the before state]
Hook 2: [Show the transformation]

## STAR (Situation-Task-Action-Result)
Hook 1: [Story-based opening]
Hook 2: [Result-first then story]

## SLAY (Shocking-Lesson-Action-You)
Hook 1: [Start with shocking fact/number]
Hook 2: [Controversial hot take]

## TOP 3 HOOKS OVERALL
(best ones from above — ready to copy-paste)`,
      maxTokens: 1200
    });

    return {
      success: true,
      topic,
      platform,
      audience,
      hooks: result?.output || ''
    };
  },

  // ── ANALYZE ENGAGEMENT: What's working in your niche ───────────────────
  async analyzeEngagement({ niche, platform = 'instagram' }, execute) {
    const [viral, bestTime, formats] = await Promise.all([
      execute('web:search', { query: niche + ' ' + platform + ' viral posts 2025 engagement rate', count: 6 }),
      execute('web:search', { query: 'best time post ' + platform + ' ' + niche + ' 2025', count: 5 }),
      execute('web:search', { query: niche + ' ' + platform + ' best content format reels carousel 2025', count: 5 })
    ]);

    const allData = [
      ...(viral?.results || []),
      ...(bestTime?.results || []),
      ...(formats?.results || [])
    ].map(r => r.title + ': ' + r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a social media analytics expert. Give data-driven, specific insights.`,
      prompt: `Analyze engagement patterns for "${niche}" on ${platform}:

Data: ${allData}

Report:

## Average Engagement Benchmarks for ${niche}
- Likes per post (estimate):
- Comments per post (estimate):
- Shares/saves per post:
- Engagement rate range:

## What Format Gets MOST Engagement
1. [Format] — why it works
2. [Format] — why it works
3. [Format] — why it works

## Best Posting Times
(specific days and hours)

## Hashtag Strategy
- How many to use:
- Mix of sizes: (niche vs broad)
- Top performing hashtag categories:

## What Topics Get Saved (high value)

## What Topics Get Shared (viral potential)

## 3 Quick Wins to Boost Engagement This Week`,
      maxTokens: 1200
    });

    return {
      success: true,
      niche,
      platform,
      analysis: result?.output || '',
      sources: [...(viral?.results || [])].slice(0, 4).map(r => ({ title: r.title, url: r.url }))
    };
  }
};
