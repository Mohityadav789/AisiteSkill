// aistie-skills/competitive-ads/skill.js
// Competitive Ads Extractor — Inspired by Composio skill

module.exports = {

  // ── EXTRACT COMPETITOR ADS: Find what competitors are running ────────────
  async extractCompetitorAds({ competitor, platform = 'facebook', niche = '' }, execute) {
    const [adLibrary, adExamples, adCopy] = await Promise.all([
      execute('web:search', { query: competitor + ' facebook ad library ads running 2025', count: 6 }),
      execute('web:search', { query: competitor + ' google ads examples copy headlines 2025', count: 5 }),
      execute('web:search', { query: competitor + ' advertisement campaign ' + niche + ' messaging', count: 5 })
    ]);

    // Try to fetch Facebook Ad Library page
    let adLibraryContent = '';
    try {
      const fbAdsUrl = `https://www.facebook.com/ads/library/?search_type=advertiser&advertiser_name=${encodeURIComponent(competitor)}`;
      const page = await execute('web:fetch', { url: fbAdsUrl });
      adLibraryContent = page?.content?.slice(0, 2000) || '';
    } catch (e) {}

    const allData = [
      ...(adLibrary?.results || []),
      ...(adExamples?.results || []),
      ...(adCopy?.results || [])
    ].map(r => r.title + ': ' + r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a competitive advertising analyst who teardowns competitor ad strategies.`,
      prompt: `Analyze competitor ads for "${competitor}" on ${platform}:

Ad data found: ${allData}
Ad library content: ${adLibraryContent}

## COMPETITOR AD ANALYSIS: ${competitor}

### Ad Strategy Overview
- Estimated ad spend level: Low/Medium/High/Very High
- How long running ads: (indicates profitability)
- Primary platform focus:
- Ad frequency/rotation:

### Core Messaging Analysis
**Primary value proposition:**
**Key pain points they target:**
**Emotional hooks they use:**
**Social proof they show:**

### Ad Copy Patterns
Headlines they use (extract or infer):
Body copy style:
CTA phrases:
Tone (aggressive/soft/educational/emotional):

### Creative Patterns
- Ad formats used:
- Visual style:
- Video vs image ratio:
- Offer types (discount/free trial/demo/content):

### What's Working For Them
(signs of successful ads — long-running = profitable)

### Their Weaknesses / Gaps
(what they're NOT saying that you could own)

### Messaging Angles They OWN
(don't compete here directly)

### Messaging Angles That Are OPEN
(opportunity for you to own)`,
      maxTokens: 1600
    });

    return { success: true, competitor, platform, analysis: result?.output || '' };
  },

  // ── ANALYZE AD PATTERNS: What makes ads in your niche work ──────────────
  async analyzeAdPatterns({ niche, platform = 'facebook', pricePoint = '' }, execute) {
    const [topAds, conversionAds, hooks] = await Promise.all([
      execute('web:search', { query: niche + ' best performing facebook ads examples 2025', count: 6 }),
      execute('web:search', { query: niche + ' high converting ad copy examples ' + pricePoint, count: 5 }),
      execute('web:search', { query: niche + ' ad hooks headlines that convert 2025', count: 5 })
    ]);

    const data = [
      ...(topAds?.results || []),
      ...(conversionAds?.results || []),
      ...(hooks?.results || [])
    ].map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a performance advertising expert. Extract patterns from winning ads.`,
      prompt: `Analyze winning ad patterns for "${niche}" on ${platform}:

Data: ${data}
Price point: ${pricePoint || 'not specified'}

## AD PATTERN ANALYSIS: ${niche}

### Winning Ad Formulas
Formula 1: [structure] — Example:
Formula 2: [structure] — Example:
Formula 3: [structure] — Example:

### Headline Patterns That Convert
Pattern 1: [template] — Example:
Pattern 2: [template] — Example:
Pattern 3: [template] — Example:

### Body Copy Patterns
- Opening hook styles:
- Social proof placement:
- Pain point language:
- Benefit framing:

### Offer Structures That Work
Best offers in this niche:

### Visual/Creative Patterns
What visuals consistently work:

### Audience Targeting Insights
Who responds best:

### 5 Ad Concepts Ready to Test
Each with headline + body + CTA:
1.
2.
3.
4.
5.`,
      maxTokens: 1600
    });

    return { success: true, niche, platform, patterns: result?.output || '' };
  },

  // ── BUILD AD STRATEGY: Full ad campaign plan ─────────────────────────────
  async buildAdStrategy({ product, audience, budget, goal = 'leads', competitors = [] }, execute) {
    const [marketSearch, competitorAds] = await Promise.all([
      execute('web:search', { query: product + ' advertising strategy best practices ' + goal + ' 2025', count: 6 }),
      execute('web:search', { query: (competitors[0] || product + ' competitor') + ' ads marketing strategy', count: 5 })
    ]);

    const data = [
      ...(marketSearch?.results || []),
      ...(competitorAds?.results || [])
    ].map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a performance marketing director who manages $10M+ in annual ad spend.`,
      prompt: `Build complete ad strategy for:
Product: "${product}"
Audience: ${audience}
Budget: ${budget}
Goal: ${goal}
Competitors: ${competitors.join(', ') || 'unknown'}

Market data: ${data}

## AD CAMPAIGN STRATEGY

### Campaign Architecture
Campaign 1 (Awareness): 
Campaign 2 (Consideration):
Campaign 3 (Conversion):
Campaign 4 (Retargeting):

### Budget Allocation
- Prospecting: X% (${budget} × X% = $X)
- Retargeting: X%
- By platform: (breakdown)

### Audience Strategy
Cold audiences to test:
Warm audiences:
Lookalike strategy:
Exclusions:

### Creative Strategy
Ad format mix:
Testing framework:
Creative rotation:

### Message Hierarchy
Primary message (cold):
Secondary message (warm):
Retargeting message:

### 30-Day Launch Plan
Week 1 — Test:
Week 2 — Learn:
Week 3 — Optimize:
Week 4 — Scale:

### KPIs and Targets
CPM target:
CTR target:
CPC target:
CPL/CPA target:
ROAS target:`,
      maxTokens: 1800
    });

    return { success: true, product, strategy: result?.output || '' };
  },

  // ── WRITE AD COPY: Multiple ad copy variations ───────────────────────────
  async writeAdCopy({ product, audience, pain = '', benefit = '', platform = 'facebook', count = 5 }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are a direct response copywriter who has written ads generating $100M+ in revenue.
Every word earns its place. No fluff. Specific > general always.`,
      prompt: `Write ${count} ${platform} ad copy variations for:
Product: "${product}"
Target audience: ${audience}
Main pain point: ${pain || 'derive from product'}
Main benefit: ${benefit || 'derive from product'}

For each variation:

**AD ${Array.from({length: count}, (_, i) => i + 1).join(' | AD ')}**

VARIATION 1 — Problem-aware:
Primary text: (125 chars for mobile)
Headline: (27 chars)
Description: (27 chars)
CTA button: [Learn More/Shop Now/Sign Up/Get Quote]

VARIATION 2 — Benefit-led:
Primary text:
Headline:
Description:
CTA:

VARIATION 3 — Social proof:
Primary text:
Headline:
Description:
CTA:

VARIATION 4 — Urgency/Scarcity:
Primary text:
Headline:
Description:
CTA:

VARIATION 5 — Story-based:
Primary text:
Headline:
Description:
CTA:

## A/B TEST RECOMMENDATION
Test these two first: Variation # vs Variation #
Why:`,
      maxTokens: 1500
    });

    return { success: true, product, adCopy: result?.output || '' };
  }
};
