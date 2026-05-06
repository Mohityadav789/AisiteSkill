// aistie-skills/geo-seo-optimizer/skill.js
// GEO-first SEO — AI search visibility + traditional SEO
// Inspired by AgriciDaniel/claude-seo (3.5K+ installs)

module.exports = {

  // ── GEO AUDIT: How visible are you in AI search? ─────────────────────────
  async geoAudit({ brand, website = '', niche = '', targetQueries = [] }, execute) {
    // Test how AI search engines see this brand
    const queries = targetQueries.length > 0 ? targetQueries : [
      `best ${niche} tools`,
      `top ${niche} companies`,
      `${niche} recommendations`,
      brand + ' reviews'
    ];

    const searchResults = await Promise.all(
      queries.slice(0, 4).map(q =>
        execute('web:search', { query: q, count: 5 })
      )
    );

    // Check if brand appears in results
    const brandMentions = searchResults.map((r, i) => {
      const results = r?.results || [];
      const found = results.some(res =>
        (res.title + res.snippet + res.url).toLowerCase().includes(brand.toLowerCase())
      );
      return { query: queries[i], found, position: found ? results.findIndex(res => (res.title + res.snippet).toLowerCase().includes(brand.toLowerCase())) + 1 : null };
    });

    // Fetch website for citability analysis
    let siteContent = '';
    if (website) {
      try {
        const page = await execute('web:fetch', { url: website });
        siteContent = page?.content?.slice(0, 3000) || '';
      } catch (e) {}
    }

    const result = await execute('ai:generate', {
      systemPrompt: `You are a GEO (Generative Engine Optimization) expert — the new SEO for AI search engines like ChatGPT, Perplexity, and Google SGE.`,
      prompt: `Analyze GEO visibility for "${brand}" in "${niche}":

Brand mentions in AI search queries:
${brandMentions.map(m => `Query: "${m.query}" — Found: ${m.found ? 'YES (position ' + m.position + ')' : 'NO'}`).join('\n')}

Website content sample: ${siteContent || 'not available'}

## GEO AUDIT REPORT

### GEO Visibility Score: X/100
(0 = invisible to AI, 100 = frequently cited)

### AI Search Presence
- ChatGPT/Claude mentions: (estimated frequency)
- Perplexity visibility: (estimated)
- Google SGE presence: (estimated)
- Overall AI citation rate: Low/Medium/High

### Citability Analysis
What makes content citeable by AI:
What's missing from current content:
Authority signals present:
Authority signals missing:

### GEO Optimization Priorities
1. (highest impact fix)
2.
3.
4.
5.

### Content Changes for AI Visibility
- Add these content types:
- Answer these questions explicitly:
- Use these structural formats:
- Add these trust signals:

### Brand Authority Building
- Where to get mentioned:
- What to publish:
- Who to partner with:

### 60-Day GEO Action Plan
Week 1-2:
Week 3-4:
Week 5-6:
Week 7-8:`,
      maxTokens: 1800
    });

    return {
      success: true,
      brand,
      brandMentions,
      geoScore: brandMentions.filter(m => m.found).length,
      totalQueries: queries.length,
      audit: result?.output || ''
    };
  },

  // ── KEYWORD RESEARCH: Deep keyword analysis ──────────────────────────────
  async keywordResearch({ topic, industry = '', targetCountry = 'IN', intent = 'all' }, execute) {
    const [primary, longTail, questions, commercial] = await Promise.all([
      execute('web:search', { query: topic + ' keyword search volume competition 2025 ' + industry, count: 8 }),
      execute('web:search', { query: topic + ' long tail keywords low competition examples', count: 6 }),
      execute('web:search', { query: 'people also ask ' + topic + ' questions what how why', count: 6 }),
      execute('web:search', { query: topic + ' buy hire get best cheap price comparison', count: 5 })
    ]);

    const data = [
      ...(primary?.results || []),
      ...(longTail?.results || []),
      ...(questions?.results || []),
      ...(commercial?.results || [])
    ].map(r => r.title + ': ' + r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are an SEO keyword research expert. Provide specific, actionable keyword data.`,
      prompt: `Complete keyword research for "${topic}" targeting ${targetCountry}:

Research data: ${data}

## KEYWORD RESEARCH REPORT

### Primary Keywords (high volume, competitive)
| Keyword | Est. Monthly Searches | Competition | Difficulty | Intent |
|---------|----------------------|-------------|------------|--------|
(fill 5-8 rows)

### Long-Tail Keywords (lower competition, higher conversion)
| Keyword | Est. Searches | Competition | Why it converts |
|---------|--------------|-------------|-----------------|
(fill 10-15 rows)

### Question Keywords (PAA — People Also Ask)
(15 specific questions people ask about ${topic})
1.
2.
...

### Commercial Intent Keywords (ready to buy)
(keywords showing buying intent — best for landing pages)

### Informational Keywords (content/blog targets)
(keywords for educational content)

### Keyword Clusters
Group into 5 topic clusters for content strategy:
Cluster 1: [theme] — keywords:
Cluster 2:
...

### Quick Wins
Top 5 keywords to target first (easiest to rank):

### Competition Gaps
Keywords competitors haven't fully covered:`,
      maxTokens: 2000
    });

    return { success: true, topic, keywords: result?.output || '' };
  },

  // ── SEO AUDIT: Full website SEO audit ───────────────────────────────────
  async seoAudit({ url, competitor = '' }, execute) {
    let siteContent = '';
    let competitorContent = '';

    try {
      const page = await execute('web:fetch', { url });
      siteContent = page?.content?.slice(0, 4000) || '';
    } catch (e) {}

    if (competitor) {
      try {
        const compPage = await execute('web:fetch', { url: competitor });
        competitorContent = compPage?.content?.slice(0, 2000) || '';
      } catch (e) {}
    }

    const result = await execute('ai:generate', {
      systemPrompt: `You are a technical SEO auditor. Score and fix every element.`,
      prompt: `Full SEO audit for: ${url}

Site content: ${siteContent || 'could not fetch'}
Competitor: ${competitor || 'none'}: ${competitorContent}

## SEO AUDIT REPORT

### Overall SEO Score: X/100

### Technical SEO (X/25)
- Page speed issues:
- Mobile optimization:
- Core Web Vitals estimate:
- Crawlability issues:
- HTTPS/Security:
- Structured data present:

### On-Page SEO (X/25)
- Title tag: [current] → [recommended]
- Meta description: [current] → [recommended]
- H1: [current] → [recommended]
- H2 structure:
- Keyword usage:
- Image alt texts:
- Internal linking:

### Content Quality (X/25)
- Content depth score:
- E-E-A-T signals:
- Content freshness:
- Missing content:
- Thin pages found:

### Authority & Links (X/25)
- Estimated domain authority:
- Backlink profile estimate:
- Missing trust signals:
- PR opportunities:

### Top 10 Issues to Fix (ranked by impact)
1. Issue | Fix | Expected impact
...

### Competitor Comparison
${competitor ? 'What ' + competitor + ' does better:' : 'N/A'}

### 30-Day SEO Action Plan
Week 1: (technical fixes)
Week 2: (on-page)
Week 3: (content)
Week 4: (links)`,
      maxTokens: 2000
    });

    return { success: true, url, audit: result?.output || '' };
  },

  // ── SCHEMA GENERATOR: JSON-LD schema markup ──────────────────────────────
  async schemaGenerator({ pageType, businessName, data = {} }, execute) {
    const schemaTypes = {
      business: 'LocalBusiness',
      product: 'Product',
      article: 'Article',
      faq: 'FAQPage',
      review: 'Review',
      event: 'Event',
      recipe: 'Recipe',
      person: 'Person',
      organization: 'Organization'
    };

    const result = await execute('ai:generate', {
      systemPrompt: `You are a schema markup expert. Generate valid JSON-LD schema following Google's guidelines.`,
      prompt: `Generate complete JSON-LD schema for:
Page type: ${pageType}
Business: ${businessName}
Data: ${JSON.stringify(data)}

Provide:
1. Complete JSON-LD schema (ready to add to <head>)
2. All required properties filled
3. Optional properties that help with rich snippets
4. Validation instructions
5. What rich snippet this unlocks in Google

Return the schema in a code block followed by explanation.`,
      maxTokens: 1000
    });

    return { success: true, pageType, schema: result?.output || '' };
  },

  // ── CONTENT OPTIMIZER: Make content rank higher ──────────────────────────
  async contentOptimizer({ content, targetKeyword, url = '' }, execute) {
    const [serp, relatedKeywords] = await Promise.all([
      execute('web:search', { query: targetKeyword, count: 5 }),
      execute('web:search', { query: targetKeyword + ' related topics semantic keywords LSI', count: 5 })
    ]);

    const topResults = (serp?.results || []).map(r => r.title + ': ' + r.snippet).join('\n');
    const semantic = (relatedKeywords?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are an SEO content editor. Optimize content to outrank the competition.`,
      prompt: `Optimize this content to rank for "${targetKeyword}":

Content to optimize:
"${content.slice(0, 3000)}"

Top ranking pages for this keyword:
${topResults}

Semantic keyword context: ${semantic}

## CONTENT OPTIMIZATION REPORT

### Optimization Score: X/100

### Title Optimization
Current: [extract from content]
Recommended: [SEO-optimized title]

### Missing Topics to Add
(what top 5 ranking pages cover that yours doesn't)
1.
2.
3.
4.
5.

### Semantic Keywords to Include
(related terms that Google expects to see)

### Structure Improvements
- Add these headings:
- Reorganize to:
- Remove or shorten:

### E-E-A-T Improvements
- Experience signals to add:
- Expertise to demonstrate:
- Authoritativeness:
- Trust signals:

### Word Count Analysis
Current: ~${content.split(' ').length} words
Recommended: X words (based on top rankers)

### Optimized Version
(rewrite the opening 2 paragraphs with improvements applied)`,
      maxTokens: 1800
    });

    return { success: true, targetKeyword, optimization: result?.output || '' };
  },

  // ── CITABILITY SCORE: How citable is your content to AI? ────────────────
  async citabilityScore({ content, url = '', topic = '' }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are an expert in how AI language models select and cite sources.
You understand what makes content get cited by ChatGPT, Perplexity, Claude, and Google SGE.`,
      prompt: `Score this content for AI citability:

Content: "${content.slice(0, 3000)}"
URL: ${url}
Topic: ${topic}

## CITABILITY SCORE REPORT

### Overall Citability Score: X/100

### Scoring Breakdown
- Factual density (X/20): How many verifiable facts?
- Source authority (X/20): Does it cite sources?
- Structured information (X/20): Tables, lists, clear data?
- Unique data (X/20): Original research or insights?
- Answer clarity (X/20): Does it directly answer questions?

### Why AI Would/Wouldn't Cite This
Would cite because:
Wouldn't cite because:

### What AI Models Look For
- Question-answer format: Present/Missing
- Statistics with context: Present/Missing
- Expert quotes: Present/Missing
- Recency signals: Present/Missing
- Structured data: Present/Missing

### Rewrites to Improve Citability
Original paragraph: [quote from content]
Improved version: [rewrite]

### Content to Add for Higher Citability
1.
2.
3.

### Expected Citability After Improvements
Score: X/100 (+X improvement)`,
      maxTokens: 1200
    });

    return { success: true, topic, citabilityReport: result?.output || '' };
  }
};
