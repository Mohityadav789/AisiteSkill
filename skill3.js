// aistie-skills/academic-research/skill.js
// Full academic research pipeline
// Inspired by Imbad0202/academic-research-skills (3.4K+ installs)

module.exports = {

  // ── RESEARCH TOPIC: Deep academic research ───────────────────────────────
  async researchTopic({ topic, discipline = '', depth = 'comprehensive', includeCounterArguments = true }, execute) {
    const [primary, recent, scholarly] = await Promise.all([
      execute('web:search', { query: topic + ' academic research study ' + discipline, count: 8 }),
      execute('web:search', { query: topic + ' recent findings 2023 2024 2025 ' + discipline, count: 6 }),
      execute('web:search', { query: topic + ' journal article peer reviewed scholarly', count: 6 })
    ]);

    const allResults = [
      ...(primary?.results || []),
      ...(recent?.results || []),
      ...(scholarly?.results || [])
    ];

    // Fetch content from top sources
    const sourceContents = [];
    for (const result of allResults.slice(0, 5)) {
      try {
        const page = await execute('web:fetch', { url: result.url });
        if (page?.content) {
          sourceContents.push({
            title: result.title,
            url: result.url,
            content: page.content.slice(0, 2500),
            snippet: result.snippet
          });
        }
      } catch (e) {
        sourceContents.push({
          title: result.title,
          url: result.url,
          content: result.snippet,
          snippet: result.snippet
        });
      }
    }

    const sourcesText = sourceContents
      .map((s, i) => `[${i + 1}] ${s.title}\nURL: ${s.url}\n${s.content}`)
      .join('\n\n---\n\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are an academic researcher with PhD-level expertise. Write with scholarly precision.
Use proper academic language. Cite sources as [1][2][3]. Never fabricate citations.`,
      prompt: `Research topic: "${topic}"
Discipline: ${discipline || 'general'}
Depth: ${depth}

Sources:
${sourcesText}

Write a comprehensive academic research summary:

## Overview
(2-3 sentences defining the topic academically)

## Current State of Research
(what the literature says — with [1][2][3] citations)

## Key Theories and Frameworks
(main theoretical foundations)

## Empirical Evidence
(data, studies, statistics with citations)

## Scholarly Debates
(where academics disagree — multiple perspectives)

${includeCounterArguments ? `## Counter-Arguments and Criticisms
(what critics say about mainstream views)` : ''}

## Gaps in Research
(what hasn't been studied yet — your contribution opportunity)

## Conclusion
(synthesis of findings)

## References
${sourceContents.map((s, i) => `[${i + 1}] ${s.title}. Retrieved from ${s.url}`).join('\n')}`,
      maxTokens: 2500
    });

    return {
      success: true,
      topic,
      discipline,
      research: result?.output || '',
      sources: sourceContents.map((s, i) => ({
        index: i + 1,
        title: s.title,
        url: s.url
      }))
    };
  },

  // ── WRITE PAPER: Generate full academic paper ────────────────────────────
  async writePaper({ topic, thesis, discipline = '', wordCount = 1500, paperType = 'research', style = 'APA' }, execute) {
    const research = await module.exports.researchTopic({ topic, discipline, depth: 'comprehensive' }, execute);

    const result = await execute('ai:generate', {
      systemPrompt: `You are an academic writer. Write in formal scholarly style.
Citation style: ${style}. Paper type: ${paperType}.
Never use first person unless it's a reflective paper.
Use passive voice appropriately. Be precise and evidence-based.`,
      prompt: `Write a ${wordCount}-word ${paperType} paper on: "${topic}"
Thesis: ${thesis || 'derive from research'}
Discipline: ${discipline || 'general'}

Use this research:
${research.research.slice(0, 3000)}

PAPER STRUCTURE:

Title: [Formal academic title]

Abstract (150-250 words):
[Concise summary of paper]

1. Introduction
[Background, context, thesis statement, paper roadmap]

2. Literature Review
[What existing research says — cited throughout]

3. [Main Body Section — name based on topic]
[Core argument with evidence]

4. [Second Main Section]
[Supporting evidence and analysis]

5. Discussion
[Interpretation, implications, limitations]

6. Conclusion
[Summary, contributions, future research]

References (${style} format):
[List all cited sources]`,
      maxTokens: 3000
    });

    return {
      success: true,
      topic,
      thesis,
      paper: result?.output || '',
      wordCount: (result?.output || '').split(' ').length,
      style
    };
  },

  // ── REVIEW PAPER: Academic peer review ──────────────────────────────────
  async reviewPaper({ paperText, reviewType = 'comprehensive', discipline = '' }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are a peer reviewer for a top academic journal. Be rigorous but constructive.
Focus on: argumentation, evidence quality, methodology, clarity, contribution to field.`,
      prompt: `Peer review this academic paper:

"${paperText.slice(0, 4000)}"

Discipline: ${discipline || 'general'}
Review type: ${reviewType}

## PEER REVIEW REPORT

### Overall Assessment
Recommendation: Accept / Minor Revision / Major Revision / Reject
Rationale:

### Strengths (be specific)
1.
2.
3.

### Major Issues (must fix before publication)
1. Issue: — Location: — Suggested fix:
2.
3.

### Minor Issues (should fix)
1.
2.
3.

### Methodology Assessment
Research design:
Data/Evidence quality:
Analysis rigor:

### Literature Review Assessment
Coverage:
Currency of sources:
Missing key works:

### Writing Quality
Clarity (X/10):
Academic tone (X/10):
Structure (X/10):
Citation accuracy (X/10):

### Specific Comments by Section
Introduction:
Literature Review:
Main Body:
Conclusion:

### Summary for Author
[Constructive paragraph summarizing what needs to change]`,
      maxTokens: 1800
    });

    return { success: true, review: result?.output || '', reviewType };
  },

  // ── LITERATURE REVIEW: Comprehensive lit review ──────────────────────────
  async literatureReview({ topic, scope = 'last 10 years', discipline = '', themes = [] }, execute) {
    const searches = await Promise.all([
      execute('web:search', { query: topic + ' literature review ' + discipline + ' ' + scope, count: 8 }),
      execute('web:search', { query: topic + ' systematic review meta-analysis ' + discipline, count: 6 }),
      execute('web:search', { query: topic + ' theoretical framework models ' + discipline, count: 5 })
    ]);

    const allData = [
      ...(searches[0]?.results || []),
      ...(searches[1]?.results || []),
      ...(searches[2]?.results || [])
    ].map((r, i) => `[${i + 1}] ${r.title}: ${r.snippet}`).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are an expert at writing systematic literature reviews. Be comprehensive and critical.`,
      prompt: `Write a literature review on: "${topic}"
Scope: ${scope}
Discipline: ${discipline || 'general'}
${themes.length > 0 ? 'Key themes to cover: ' + themes.join(', ') : ''}

Research data:
${allData}

## LITERATURE REVIEW

### Introduction
(scope, purpose, search strategy)

### Thematic Analysis

#### Theme 1: [Main Theme]
(review of literature on this theme with citations [1][2][3])

#### Theme 2: [Second Theme]
(review with citations)

#### Theme 3: [Third Theme]
(review with citations)

### Chronological Development
(how understanding evolved over time)

### Methodological Approaches in Literature
(how researchers have studied this)

### Contradictions and Debates
(where scholars disagree)

### Research Gaps
(what hasn't been studied)

### Conclusion
(synthesis and implications for future research)`,
      maxTokens: 2500
    });

    return { success: true, topic, literatureReview: result?.output || '' };
  },

  // ── GENERATE ABSTRACT: Professional abstract ─────────────────────────────
  async generateAbstract({ paperText, style = 'structured', wordLimit = 250 }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are an academic writing expert. Write precise, informative abstracts.
Style: ${style} (structured = Background/Methods/Results/Conclusions sections)`,
      prompt: `Write a ${wordLimit}-word abstract for this paper:

"${paperText.slice(0, 3000)}"

Abstract must include:
- Background/Context (why this research matters)
- Objective/Purpose (what was studied)
- Methods (how it was studied — brief)
- Results/Findings (what was found — be specific)
- Conclusions/Implications (so what)
- Keywords: [5-7 keywords]

Write ONLY the abstract — no headings unless structured style.`,
      maxTokens: 500
    });

    return { success: true, abstract: result?.output || '', wordCount: (result?.output || '').split(' ').length };
  },

  // ── FORMAT CITATIONS: Convert to any citation style ──────────────────────
  async formatCitations({ sources = [], style = 'APA', inTextOnly = false }, execute) {
    const sourcesText = sources.map((s, i) =>
      `${i + 1}. Title: ${s.title || 'Unknown'} | Author: ${s.author || 'Unknown'} | Year: ${s.year || 'n.d.'} | URL: ${s.url || ''} | Publisher: ${s.publisher || ''}`
    ).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a citation expert. Format references exactly according to ${style} style.`,
      prompt: `Format these sources in ${style} style:

${sourcesText}

Provide:

## REFERENCE LIST (${style})
[Full citations numbered]

${!inTextOnly ? `## IN-TEXT CITATION EXAMPLES
[Show how to cite each source in-text]` : ''}

## COMMON MISTAKES TO AVOID
[${style}-specific errors researchers make]`,
      maxTokens: 1000
    });

    return { success: true, style, citations: result?.output || '' };
  }
};
