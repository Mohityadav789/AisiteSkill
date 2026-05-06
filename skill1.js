// aistie-skills/marketing-module/skill.js
// 43 marketing skills in 7 pods
// Inspired by alirezarezvani/claude-skills marketing-skill (5.2K+ installs)

module.exports = {

  // ── ROUTER: Detects which pod to use ────────────────────────────────────
  async route({ request, context = '' }, execute) {
    const req = request.toLowerCase();
    if (req.includes('seo') || req.includes('keyword') || req.includes('rank')) return this.seoStrategy({ topic: request, context }, execute);
    if (req.includes('conversion') || req.includes('cro') || req.includes('landing')) return this.croAudit({ url: context, description: request }, execute);
    if (req.includes('competitor') || req.includes('competition') || req.includes('market')) return this.competitorIntelligence({ brand: context, niche: request }, execute);
    if (req.includes('growth') || req.includes('scale') || req.includes('acquire')) return this.growthPlan({ business: request, stage: context }, execute);
    if (req.includes('sales') || req.includes('pitch') || req.includes('prospect')) return this.salesEnablement({ product: request, audience: context }, execute);
    if (req.includes('channel') || req.includes('ads') || req.includes('paid')) return this.channelStrategy({ business: request, budget: context }, execute);
    return this.contentMarketing({ topic: request, audience: context }, execute);
  },

  // ── POD 1: CONTENT MARKETING (8 skills) ─────────────────────────────────
  async contentMarketing({ topic, audience = '', goal = 'awareness', industry = '' }, execute) {
    const [trends, examples] = await Promise.all([
      execute('web:search', { query: topic + ' content marketing examples 2025 ' + industry, count: 6 }),
      execute('web:search', { query: topic + ' best performing content type ROI 2025', count: 5 })
    ]);

    const data = [
      ...(trends?.results || []),
      ...(examples?.results || [])
    ].map(r => r.title + ': ' + r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a content marketing strategist with 15 years experience and $50M+ in campaigns managed.`,
      prompt: `Create a complete content marketing strategy for:
Topic/Brand: "${topic}"
Audience: ${audience || 'not specified'}
Goal: ${goal}
Industry: ${industry || 'general'}

Market data: ${data}

## CONTENT MARKETING STRATEGY

### 1. Content Pillars (5 pillars)
For each: pillar name, why it matters, content formats, example topics

### 2. Content Formats Mix
- Short form (what % and why):
- Long form (what % and why):
- Video (what % and why):
- Interactive (what % and why):

### 3. Distribution Strategy
- Owned channels:
- Earned media:
- Paid amplification:

### 4. Content Calendar Framework
Monthly theme → Weekly focus → Daily content type

### 5. SEO Integration
- Pillar pages:
- Cluster topics:
- Internal linking strategy:

### 6. Repurposing System
How 1 piece of content becomes 10:

### 7. KPIs to Track
- Awareness metrics:
- Engagement metrics:
- Conversion metrics:

### 8. 30-Day Quick Win Plan
Week 1-4 specific actions`,
      maxTokens: 2000
    });

    return { success: true, topic, strategy: result?.output || '', pod: 'content-marketing' };
  },

  // ── POD 2: SEO STRATEGY (5 skills) ──────────────────────────────────────
  async seoStrategy({ topic, url = '', competitor = '', industry = '' }, execute) {
    const [keywords, compSearch, rankingFactors] = await Promise.all([
      execute('web:search', { query: topic + ' keyword research long tail low competition 2025', count: 8 }),
      competitor ? execute('web:search', { query: competitor + ' SEO strategy backlinks content', count: 5 }) : Promise.resolve(null),
      execute('web:search', { query: 'SEO ranking factors ' + industry + ' 2025 Google algorithm', count: 5 })
    ]);

    const data = [
      ...(keywords?.results || []),
      ...(compSearch?.results || []),
      ...(rankingFactors?.results || [])
    ].filter(Boolean).map(r => r.title + ': ' + r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are an SEO strategist who has ranked 500+ websites on page 1.`,
      prompt: `Create complete SEO strategy for: "${topic}"
URL: ${url || 'not provided'}
Competitor: ${competitor || 'not specified'}
Industry: ${industry || 'general'}

Research data: ${data}

## SEO STRATEGY REPORT

### Keyword Research
**Primary keyword:** (with estimated monthly searches)
**Secondary keywords:** (5-8 keywords)
**Long-tail opportunities:** (10 low-competition phrases)
**Questions to answer:** (from People Also Ask)

### Competitor Gap Analysis
What competitors rank for that you don't:
Content gaps to fill:
Backlink opportunities:

### On-Page SEO Checklist
- Title tag formula:
- Meta description formula:
- H1/H2/H3 structure:
- Internal linking:
- Schema markup needed:

### Content Strategy for SEO
- Pillar page topics:
- Cluster content plan:
- Update frequency:

### Technical SEO Priorities
Top 5 technical issues to fix:

### Link Building Plan
- Quick wins (easy links):
- Medium effort:
- Authority targets:

### 90-Day Ranking Roadmap
Month 1, 2, 3 specific actions`,
      maxTokens: 1800
    });

    return { success: true, topic, strategy: result?.output || '', pod: 'seo' };
  },

  // ── POD 3: CRO AUDIT (6 skills) ─────────────────────────────────────────
  async croAudit({ url = '', description = '', conversionGoal = 'leads', industry = '' }, execute) {
    let pageContent = '';
    if (url) {
      try {
        const page = await execute('web:fetch', { url });
        pageContent = page?.content?.slice(0, 3000) || '';
      } catch (e) {}
    }

    const search = await execute('web:search', {
      query: 'CRO best practices ' + industry + ' landing page conversion 2025',
      count: 6
    });
    const benchmarks = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a CRO expert who has optimized 1000+ landing pages and run 500+ A/B tests.`,
      prompt: `Audit this page for conversion optimization:
URL: ${url || 'not provided'}
Description: ${description}
Goal: ${conversionGoal}
Industry: ${industry || 'general'}
Page content: ${pageContent || 'not available'}

Industry benchmarks: ${benchmarks}

## CRO AUDIT REPORT

### Conversion Score: X/100

### Above The Fold Analysis
- Headline clarity (X/10):
- Value proposition (X/10):
- CTA visibility (X/10):
- Trust signals (X/10):

### Critical Issues Found (ranked by impact)
1. Issue: — Impact: High/Medium/Low — Fix:
2. Issue: — Impact: — Fix:
3. Issue: — Impact: — Fix:
4. Issue: — Impact: — Fix:
5. Issue: — Impact: — Fix:

### A/B Tests to Run (priority order)
Test 1: Element | Hypothesis | Expected lift
Test 2:
Test 3:

### Quick Wins (implement today)
- Change 1 (< 1 hour):
- Change 2 (< 1 hour):
- Change 3 (< 1 hour):

### Copywriting Improvements
- Headline rewrite:
- Subheadline rewrite:
- CTA button text:
- Body copy suggestions:

### Trust & Social Proof
Missing elements:
What to add:

### Mobile Optimization
Issues specific to mobile:

### Expected Results After Fixes
Conversion rate improvement estimate: X%`,
      maxTokens: 1800
    });

    return { success: true, url, audit: result?.output || '', pod: 'cro' };
  },

  // ── POD 4: CHANNEL STRATEGY (6 skills) ──────────────────────────────────
  async channelStrategy({ business, budget = '', audience = '', goal = 'leads' }, execute) {
    const search = await execute('web:search', {
      query: business + ' marketing channels ROI best 2025 ' + audience,
      count: 8
    });
    const data = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a performance marketing expert managing $10M+ ad budgets.`,
      prompt: `Recommend optimal marketing channels for:
Business: "${business}"
Budget: ${budget || 'not specified'}
Audience: ${audience || 'general'}
Goal: ${goal}

Market data: ${data}

## CHANNEL STRATEGY

### Channel Recommendation Matrix
For each channel (Google Ads, Meta, LinkedIn, TikTok, SEO, Email, Content, Influencer, PR):
- Fit score for this business: High/Medium/Low/No
- Why:
- Budget allocation %:
- Expected CPL/CAC:

### Primary Channels (top 3 to focus on)
Deep dive on each:
- Setup requirements:
- Content/creative needs:
- Targeting strategy:
- KPIs to track:
- Budget split:

### Channel Mix by Stage
Awareness channels:
Consideration channels:
Conversion channels:
Retention channels:

### Budget Allocation
${budget ? 'Based on budget of ' + budget + ':' : 'Recommended split (percentages):'}
- Paid: X%
- Organic: X%
- Email: X%
- Other: X%

### 90-Day Channel Launch Plan
Month 1 — Launch:
Month 2 — Optimize:
Month 3 — Scale:`,
      maxTokens: 1800
    });

    return { success: true, business, strategy: result?.output || '', pod: 'channels' };
  },

  // ── POD 5: GROWTH PLAN (4 skills) ────────────────────────────────────────
  async growthPlan({ business, stage = 'early', currentRevenue = '', targetRevenue = '', timeframe = '12 months' }, execute) {
    const [growthCases, tactics] = await Promise.all([
      execute('web:search', { query: business + ' growth strategy ' + stage + ' stage startup 2025', count: 6 }),
      execute('web:search', { query: 'growth hacking tactics ' + business + ' acquisition retention 2025', count: 6 })
    ]);

    const data = [
      ...(growthCases?.results || []),
      ...(tactics?.results || [])
    ].map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a growth strategist who has scaled 50+ companies from $0 to $10M+.`,
      prompt: `Create growth plan for:
Business: "${business}"
Stage: ${stage}
Current revenue: ${currentRevenue || 'early/pre-revenue'}
Target: ${targetRevenue || '10x growth'}
Timeframe: ${timeframe}

Data: ${data}

## GROWTH PLAN

### North Star Metric
What single metric to obsess over and why:

### Growth Levers (ranked by impact/effort)
Lever 1: — Impact: — Effort: — Timeline:
Lever 2:
Lever 3:
Lever 4:
Lever 5:

### Acquisition Strategy
- Top 3 acquisition channels:
- Viral/referral mechanics:
- Partnership opportunities:
- Content moat:

### Activation Strategy
- Aha moment definition:
- Time to value reduction:
- Onboarding optimization:

### Retention Strategy
- Churn reduction tactics:
- Engagement loops:
- Expansion revenue:

### Growth Experiments Queue
(10 experiments ranked by expected impact)
1. Hypothesis | Test | Metric | Timeline
...

### 12-Month Milestones
Q1 targets:
Q2 targets:
Q3 targets:
Q4 targets:`,
      maxTokens: 2000
    });

    return { success: true, business, plan: result?.output || '', pod: 'growth' };
  },

  // ── POD 6: COMPETITOR INTELLIGENCE (4 skills) ────────────────────────────
  async competitorIntelligence({ brand, niche, competitors = [] }, execute) {
    const competitorList = competitors.length > 0
      ? competitors
      : await (async () => {
          const s = await execute('web:search', { query: niche + ' top competitors market leaders 2025', count: 5 });
          return (s?.results || []).map(r => r.title.split(' ')[0]).filter(Boolean).slice(0, 4);
        })();

    const searches = await Promise.all(
      competitorList.slice(0, 4).map(c =>
        execute('web:search', { query: c + ' marketing strategy pricing positioning 2025', count: 4 })
      )
    );

    const competitorData = competitorList.slice(0, 4).map((c, i) => ({
      name: c,
      data: (searches[i]?.results || []).map(r => r.snippet).join('\n')
    }));

    const result = await execute('ai:generate', {
      systemPrompt: `You are a competitive intelligence analyst. Extract actionable insights from competitor data.`,
      prompt: `Competitive intelligence report for "${brand}" in "${niche}":

Competitors analyzed:
${competitorData.map(c => `=== ${c.name} ===\n${c.data}`).join('\n\n')}

## COMPETITIVE INTELLIGENCE REPORT

### Market Map
Position each competitor on: Price (Low-High) vs Value (Low-High)
Where ${brand} should position:

### Competitor Profiles
For each competitor:
**[Name]**
- Positioning:
- Key messages:
- Target customer:
- Pricing model:
- Strengths:
- Weaknesses:
- Recent moves:

### Market Gaps (opportunities)
1.
2.
3.

### ${brand}'s Competitive Advantages
What to emphasize:
What to build:

### Threat Assessment
Biggest competitive threats:
How to counter:

### Messaging Differentiation
How to position ${brand} vs each competitor:

### Win/Loss Analysis Framework
Questions to ask lost deals:
Questions to ask won deals:`,
      maxTokens: 2000
    });

    return { success: true, brand, niche, intelligence: result?.output || '', pod: 'intelligence' };
  },

  // ── POD 7: SALES ENABLEMENT (2 skills) ──────────────────────────────────
  async salesEnablement({ product, audience = '', objections = [], dealSize = '' }, execute) {
    const search = await execute('web:search', {
      query: product + ' sales objections common concerns B2B 2025',
      count: 6
    });
    const data = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a B2B sales coach who has closed $50M+ in deals.`,
      prompt: `Create sales enablement kit for:
Product: "${product}"
Audience: ${audience || 'B2B buyers'}
Common objections: ${objections.join(', ') || 'price, timing, competitor, no budget'}
Deal size: ${dealSize || 'not specified'}

Data: ${data}

## SALES ENABLEMENT KIT

### Elevator Pitch (30 seconds)
[ready to use]

### Discovery Questions (10 best)
1.
2.
...

### Value Proposition by Role
- For CEO/Founder:
- For Marketing:
- For Operations:
- For Finance:

### Objection Handling Guide
For each objection:
**"[Objection]"**
Response: [exact words to use]
Proof point: [data/case study]

### Competitive Battle Cards
vs [Competitor 1]: Why we win
vs [Competitor 2]: Why we win

### Email Templates
Cold outreach:
Follow-up after demo:
Post-proposal:
Closing:

### Proposal Structure
Section 1-6 with what goes in each:

### Closing Techniques
For this type of deal:`,
      maxTokens: 2000
    });

    return { success: true, product, kit: result?.output || '', pod: 'sales' };
  }
};
