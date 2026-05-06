// aistie-skills/deep-research/skill.js
// Deep Research Engine — 8-phase pipeline
// Uses execute() from Aistie's toolExecutor.ts
// NO Claude wrapper — runs natively in Node.js

module.exports = {

  // ── PHASE 1-8: Full deep research with citations ────────────────────────
  async deepResearch({ query, mode = 'comprehensive' }, execute) {
    const results = {};

    // PHASE 1 + 2: Parallel broad + specific searches
    const [broad, specific, recent] = await Promise.all([
      execute('web:search', { query, count: 10 }),
      execute('web:search', { query: query + ' detailed analysis explanation', count: 8 }),
      execute('web:search', { query: query + ' 2024 2025 latest', count: 8 })
    ]);

    const allResults = [
      ...(broad?.results || []),
      ...(specific?.results || []),
      ...(recent?.results || [])
    ];

    // PHASE 3: Deduplicate by URL
    const seen = new Set();
    const uniqueResults = allResults.filter(r => {
      if (!r.url || seen.has(r.url)) return false;
      seen.add(r.url);
      return true;
    });

    // PHASE 4: Credibility scoring — rank sources
    const credibilityScore = (url) => {
      const u = (url || '').toLowerCase();
      if (u.includes('.gov') || u.includes('.edu')) return 10;
      if (u.includes('wikipedia') || u.includes('britannica')) return 9;
      if (u.includes('nature.com') || u.includes('pubmed') || u.includes('scholar')) return 10;
      if (u.includes('forbes') || u.includes('harvard') || u.includes('mit')) return 8;
      if (u.includes('reuters') || u.includes('bbc') || u.includes('bloomberg')) return 8;
      if (u.includes('medium') || u.includes('substack')) return 5;
      if (u.includes('reddit') || u.includes('quora')) return 3;
      return 6;
    };

    // PHASE 5: Sort by credibility, take top 6
    const topSources = uniqueResults
      .map(r => ({ ...r, score: credibilityScore(r.url) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);

    // PHASE 6: Fetch full content from top 4 sources
    const sourceContents = [];
    for (const source of topSources.slice(0, 4)) {
      try {
        const page = await execute('web:fetch', { url: source.url });
        if (page?.content) {
          sourceContents.push({
            title: source.title || page.title || '',
            url: source.url,
            content: page.content.slice(0, 3000),
            snippet: source.snippet || '',
            score: source.score
          });
        } else {
          sourceContents.push({
            title: source.title || '',
            url: source.url,
            content: source.snippet || '',
            snippet: source.snippet || '',
            score: source.score
          });
        }
      } catch (e) {
        sourceContents.push({
          title: source.title || '',
          url: source.url,
          content: source.snippet || '',
          snippet: source.snippet || '',
          score: source.score
        });
      }
    }

    // Add remaining sources as snippets only
    for (const source of topSources.slice(4)) {
      sourceContents.push({
        title: source.title || '',
        url: source.url,
        content: source.snippet || '',
        snippet: source.snippet || '',
        score: source.score
      });
    }

    // PHASE 7: AI synthesis with citations
    const sourcesText = sourceContents
      .map((s, i) => `[${i + 1}] ${s.title}\nURL: ${s.url}\n${s.content}`)
      .join('\n\n---\n\n');

    const systemPrompt = mode === 'quick'
      ? `You are a research analyst. Give a clear 3-paragraph answer with [1][2][3] inline citations. Be factual and specific.`
      : `You are a world-class research analyst. Write a comprehensive research report.

FORMAT:
## Summary
(2-3 sentence direct answer)

## Key Findings
- **Finding 1** [1]: explanation
- **Finding 2** [2]: explanation
- **Finding 3** [3]: explanation

## Detailed Analysis
(3-4 paragraphs with [1][2][3] inline citations throughout)

## Data & Statistics
(specific numbers, percentages, dates with citations)

## Expert Opinions & Context
(what experts say, with citations)

## Conclusion
(actionable takeaway)

RULES:
- Use [1][2][3] inline citations after every specific claim
- Bold key terms with **term**
- Be specific — use real numbers and dates from sources
- Never make up facts`;

    const report = await execute('ai:generate', {
      systemPrompt,
      prompt: `Research question: "${query}"\n\nSources:\n${sourcesText}\n\nWrite the research report with inline citations [1][2][3].`,
      maxTokens: 2000
    });

    // PHASE 8: Return structured result
    return {
      success: true,
      query,
      report: report?.output || 'Research could not be completed.',
      sources: sourceContents.map((s, i) => ({
        index: i + 1,
        title: s.title,
        url: s.url,
        snippet: s.snippet,
        credibilityScore: s.score
      })),
      totalSources: sourceContents.length,
      mode
    };
  },

  // ── QUICK FACTS: Fast 5-bullet answer ──────────────────────────────────
  async quickFacts({ topic }, execute) {
    const search = await execute('web:search', {
      query: topic + ' facts statistics key points',
      count: 8
    });

    const snippets = (search?.results || [])
      .map(r => r.snippet)
      .filter(Boolean)
      .join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: 'You are a fact researcher. Extract exactly 8 surprising, specific, verified facts. Number them 1-8. Each fact must include a specific number, date, or statistic.',
      prompt: `Topic: "${topic}"\n\nSearch data:\n${snippets}\n\nList 8 specific facts about "${topic}":`,
      maxTokens: 600
    });

    return {
      success: true,
      topic,
      facts: result?.output || '',
      sources: (search?.results || []).slice(0, 5).map(r => ({ title: r.title, url: r.url }))
    };
  },

  // ── COMPARE TOPICS: Side-by-side comparison ─────────────────────────────
  async compareTopics({ topicA, topicB, criteria = [] }, execute) {
    const [searchA, searchB] = await Promise.all([
      execute('web:search', { query: topicA + ' analysis pros cons review 2025', count: 6 }),
      execute('web:search', { query: topicB + ' analysis pros cons review 2025', count: 6 })
    ]);

    const dataA = (searchA?.results || []).map(r => r.snippet).join('\n');
    const dataB = (searchB?.results || []).map(r => r.snippet).join('\n');

    const criteriaText = criteria.length > 0
      ? `Compare on these specific criteria: ${criteria.join(', ')}`
      : 'Compare on: cost, performance, ease of use, best for, limitations, popularity';

    const result = await execute('ai:generate', {
      systemPrompt: `You are a comparison analyst. Create a detailed structured comparison.

FORMAT:
## Overview
Brief intro to both

## Head-to-Head Comparison
| Criteria | ${topicA} | ${topicB} |
|----------|-----------|-----------|
(fill table with real data)

## ${topicA} — Pros & Cons
**Pros:** ...
**Cons:** ...

## ${topicB} — Pros & Cons
**Pros:** ...
**Cons:** ...

## Verdict: Which Should You Choose?
- Choose **${topicA}** if: ...
- Choose **${topicB}** if: ...`,
      prompt: `Compare "${topicA}" vs "${topicB}".\n${criteriaText}\n\nData on ${topicA}:\n${dataA}\n\nData on ${topicB}:\n${dataB}`,
      maxTokens: 1500
    });

    return {
      success: true,
      topicA,
      topicB,
      comparison: result?.output || '',
      sources: [
        ...(searchA?.results || []).slice(0, 3).map(r => ({ title: r.title, url: r.url, topic: topicA })),
        ...(searchB?.results || []).slice(0, 3).map(r => ({ title: r.title, url: r.url, topic: topicB }))
      ]
    };
  },

  // ── TREND RESEARCH: What's trending right now ───────────────────────────
  async trendResearch({ niche, platform = 'general' }, execute) {
    const [trends1, trends2, trends3] = await Promise.all([
      execute('web:search', { query: niche + ' trends 2025', count: 8 }),
      execute('web:search', { query: niche + ' trending topics this month', count: 6 }),
      execute('web:search', { query: niche + ' popular right now ' + platform, count: 6 })
    ]);

    const allSnippets = [
      ...(trends1?.results || []),
      ...(trends2?.results || []),
      ...(trends3?.results || [])
    ].map(r => r.title + ': ' + r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a trend analyst. Identify the top 10 trends with specific data.

FORMAT:
## Top 10 Trends in [Niche] Right Now

1. **Trend Name** — Why it's trending, specific data, who's doing it
2. ...

## What This Means For You
Actionable advice based on these trends

## Predicted Next Big Thing
What's coming in the next 3-6 months`,
      prompt: `Analyze trends for "${niche}" on "${platform}".\n\nData:\n${allSnippets}`,
      maxTokens: 1200
    });

    return {
      success: true,
      niche,
      platform,
      trends: result?.output || '',
      sources: [
        ...(trends1?.results || []),
        ...(trends2?.results || [])
      ].slice(0, 6).map(r => ({ title: r.title, url: r.url }))
    };
  }
};
