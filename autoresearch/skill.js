// aistie-skills/autoresearch/skill.js
// Autoresearch Engine — iterative self-improving research
// Inspired by uditgoenka/autoresearch + Karpathy's autoresearch concept
// Modify → verify → keep → repeat

module.exports = {

  // ── AUTO RESEARCH: Multi-iteration research engine ───────────────────────
  async autoResearch({ query, iterations = 3, mode = 'research', onProgress }, execute) {
    const progress = (msg) => {
      if (typeof onProgress === 'function') onProgress(msg);
    };

    let currentKnowledge = '';
    let allSources = [];
    let iterationResults = [];

    for (let i = 1; i <= iterations; i++) {
      progress(`Iteration ${i}/${iterations}: Searching...`);

      // Each iteration refines the search based on previous findings
      const searchQuery = i === 1
        ? query
        : `${query} ${currentKnowledge ? '— specifically about: ' + currentKnowledge.slice(0, 100) : ''}`;

      const [broad, deep] = await Promise.all([
        execute('web:search', { query: searchQuery, count: 6 }),
        execute('web:search', { query: searchQuery + ' detailed analysis ' + new Date().getFullYear(), count: 5 })
      ]);

      const iterationResults_i = [...(broad?.results || []), ...(deep?.results || [])];
      allSources.push(...iterationResults_i);

      // Fetch content from new sources not seen before
      const newSources = iterationResults_i.filter(r =>
        !allSources.slice(0, allSources.length - iterationResults_i.length)
          .some(s => s.url === r.url)
      ).slice(0, 3);

      const fetchedContent = [];
      for (const source of newSources) {
        try {
          progress(`Iteration ${i}: Reading ${source.url.split('/')[2]}...`);
          const page = await execute('web:fetch', { url: source.url });
          if (page?.content) {
            fetchedContent.push({
              title: source.title,
              url: source.url,
              content: page.content.slice(0, 2000)
            });
          }
        } catch (e) {
          fetchedContent.push({
            title: source.title,
            url: source.url,
            content: source.snippet
          });
        }
      }

      // Synthesize this iteration
      progress(`Iteration ${i}: Synthesizing findings...`);
      const synthesis = await execute('ai:generate', {
        systemPrompt: `You are a research analyst. Synthesize new findings and identify what still needs to be researched. Be critical — what's missing? What's contradictory?`,
        prompt: `Query: "${query}"
Previous knowledge: ${currentKnowledge.slice(0, 1000) || 'none yet'}

New sources this iteration:
${fetchedContent.map((s, idx) => `[${idx + 1}] ${s.title}\n${s.content}`).join('\n\n')}

Synthesize:
1. New findings not in previous knowledge:
2. What contradicts previous findings:
3. What's still unclear and needs next iteration:
4. Key insight from this iteration:`,
        maxTokens: 800
      });

      currentKnowledge += '\n\n' + (synthesis?.output || '');
      iterationResults.push({
        iteration: i,
        query: searchQuery,
        synthesis: synthesis?.output || '',
        sources: fetchedContent.map(s => ({ title: s.title, url: s.url }))
      });
    }

    // Final synthesis across all iterations
    progress('Generating final comprehensive report...');
    const finalReport = await execute('ai:generate', {
      systemPrompt: `You are a senior research analyst. Write a comprehensive, well-structured report synthesizing all research iterations. Use [1][2][3] citations. Be definitive where evidence is clear, uncertain where it isn't.`,
      prompt: `Write final research report on: "${query}"

All iteration findings:
${iterationResults.map(r => `ITERATION ${r.iteration}:\n${r.synthesis}`).join('\n\n')}

Write comprehensive report with:
## Executive Summary
## Key Findings (with citations)
## Detailed Analysis
## Conflicting Evidence
## Conclusions
## Recommended Next Steps`,
      maxTokens: 2500
    });

    // Deduplicate sources
    const uniqueSources = allSources.filter((s, i, arr) =>
      arr.findIndex(x => x.url === s.url) === i
    ).slice(0, 15);

    return {
      success: true,
      query,
      iterations,
      finalReport: finalReport?.output || '',
      iterationResults,
      sources: uniqueSources.map((s, i) => ({
        index: i + 1,
        title: s.title,
        url: s.url,
        snippet: s.snippet
      })),
      totalSourcesAnalyzed: uniqueSources.length
    };
  },

  // ── CONTENT MODE: Research + write content ───────────────────────────────
  async contentMode({ topic, contentType = 'blog post', audience = '', tone = 'professional' }, execute) {
    const research = await module.exports.autoResearch(
      { query: topic, iterations: 2, mode: 'research' },
      execute
    );

    const result = await execute('ai:generate', {
      systemPrompt: `You are a content writer. Use the research to write high-quality, accurate content.`,
      prompt: `Write a ${contentType} about "${topic}" for ${audience || 'general audience'}:
Tone: ${tone}

Research base:
${research.finalReport.slice(0, 3000)}

Write the complete ${contentType} now:`,
      maxTokens: 2000
    });

    return {
      success: true,
      topic,
      contentType,
      content: result?.output || '',
      researchBase: research.finalReport,
      sources: research.sources
    };
  },

  // ── SALES MODE: Research prospects and generate outreach ─────────────────
  async salesMode({ company, product, painPoints = [] }, execute) {
    const [companyResearch, industryResearch] = await Promise.all([
      execute('web:search', { query: company + ' news recent challenges growth 2025', count: 6 }),
      execute('web:search', { query: company + ' industry trends problems solutions', count: 5 })
    ]);

    const companyData = [...(companyResearch?.results || []), ...(industryResearch?.results || [])]
      .map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are an elite sales researcher. Find the exact pain points and triggers for a prospect.`,
      prompt: `Research "${company}" as a prospect for "${product}":
Known pain points: ${painPoints.join(', ')}
Company data: ${companyData}

## SALES INTELLIGENCE REPORT: ${company}

### Company Overview
Size/stage, recent news, growth signals:

### Pain Points Identified
1. [Pain] — Evidence: — Urgency: High/Med/Low
2.
3.

### Trigger Events (reasons to reach out NOW)
1. [Recent event that creates urgency]
2.

### Decision Makers to Target
Role: — Why they care: — Their metric:

### Personalized Outreach
Email subject:
Email body (speak to their specific pain):

### Talk Track
Opening: [specific to their situation]
Discovery questions:
Value proposition for them:
Objection handling:

### Account Strategy
Best path to a meeting:`,
      maxTokens: 1500
    });

    return { success: true, company, product, salesIntelligence: result?.output || '' };
  },

  // ── MARKETING MODE: Research + campaign ideas ────────────────────────────
  async marketingMode({ product, targetAudience, campaignGoal = 'awareness', budget = '' }, execute) {
    const [audienceResearch, competitorResearch, trendResearch] = await Promise.all([
      execute('web:search', { query: targetAudience + ' pain points desires online behavior 2025', count: 6 }),
      execute('web:search', { query: product + ' competitors marketing campaigns ads 2025', count: 5 }),
      execute('web:search', { query: product + ' category trends marketing 2025', count: 5 })
    ]);

    const allData = [
      ...(audienceResearch?.results || []),
      ...(competitorResearch?.results || []),
      ...(trendResearch?.results || [])
    ].map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a CMO-level marketing strategist. Build data-driven campaigns.`,
      prompt: `Build marketing campaign for "${product}" targeting "${targetAudience}":
Goal: ${campaignGoal}
Budget: ${budget || 'not specified'}
Research: ${allData}

## MARKETING CAMPAIGN PLAN

### Audience Insight
Key insight about ${targetAudience}:
What they care about most:
Where they spend time online:

### Campaign Strategy
Core message: [one line]
Campaign angle: [the hook/story]
Differentiator: [why this vs competitors]

### Channel Mix
${budget ? 'Budget allocation:' : 'Recommended channels:'}
Primary: — Why:
Secondary: — Why:

### Creative Concepts (3 angles)
Concept 1: [Name] — Hook — Visual — CTA
Concept 2:
Concept 3:

### Content Plan
Week 1-2: [theme]
Week 3-4:
Week 5-6:
Week 7-8:

### KPIs and Targets
Awareness: [metric] target: X
Engagement: [metric] target: X
Conversion: [metric] target: X`,
      maxTokens: 1800
    });

    return { success: true, product, targetAudience, campaign: result?.output || '' };
  },

  // ── DESIGN MODE: Research + design brief ─────────────────────────────────
  async designMode({ project, brandValues = [], targetUsers = '', competitors = [] }, execute) {
    const searches = await Promise.all([
      execute('web:search', { query: project + ' design trends UI UX best practices 2025', count: 5 }),
      execute('web:search', { query: (competitors[0] || project) + ' design system UI patterns', count: 5 })
    ]);

    const data = [...(searches[0]?.results || []), ...(searches[1]?.results || [])]
      .map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a design director. Create comprehensive design briefs that give designers everything they need.`,
      prompt: `Create design brief for: "${project}"
Brand values: ${brandValues.join(', ')}
Target users: ${targetUsers}
Competitors: ${competitors.join(', ')}
Design research: ${data}

## DESIGN BRIEF: ${project}

### Project Overview
What we're designing and why:
Success definition:

### Brand Personality
If this were a person: [3 adjectives]
Tone: Formal ←→ Casual | Traditional ←→ Modern | Serious ←→ Playful
Not like: [brands to avoid resembling]
More like: [brands with right feel]

### Color Direction
Primary palette rationale:
Psychology behind choices:
Accessibility requirements:

### Typography Direction
Heading font characteristics:
Body font characteristics:
Why this combination:

### Visual Language
Photography style:
Illustration style (if any):
Iconography approach:
UI component style:

### User Experience Principles
1. [Core UX principle for this project]
2.
3.

### Competitor Design Analysis
What competitors do well (don't copy):
Gaps we can fill:
How to differentiate visually:

### Deliverables Required
1.
2.
3.

### Design Inspiration
References to explore (with rationale):`,
      maxTokens: 1800
    });

    return { success: true, project, designBrief: result?.output || '' };
  }
};
