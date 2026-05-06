// aistie-skills/content-repurposing/skill.js
// Content Repurposing Engine — 1 piece becomes 10+

module.exports = {

  // ── REPURPOSE URL: Fetch any URL and repurpose it ────────────────────────
  async repurposeUrl({ url, formats = ['twitter-thread', 'linkedin', 'newsletter', 'instagram'], audience = '' }, execute) {
    let content = '';
    let title = '';

    try {
      const page = await execute('web:fetch', { url });
      content = page?.content?.slice(0, 6000) || '';
      title = page?.title || '';
    } catch (e) {
      return { success: false, error: 'Could not fetch content from URL: ' + url };
    }

    if (!content) return { success: false, error: 'No content found at URL' };

    return await module.exports.repurposeText({ text: content, title, formats, audience, sourceUrl: url }, execute);
  },

  // ── REPURPOSE TEXT: Turn any text into multiple formats ──────────────────
  async repurposeText({ text, title = '', formats = ['twitter-thread', 'linkedin', 'newsletter', 'instagram'], audience = '', sourceUrl = '' }, execute) {
    const contentSummary = await execute('ai:generate', {
      systemPrompt: 'Extract the 5 key insights from this content. Be specific and direct.',
      prompt: `Extract 5 key insights from:\n\nTitle: ${title}\n\n${text.slice(0, 4000)}\n\n5 key insights:`,
      maxTokens: 500
    });

    const keyInsights = contentSummary?.output || text.slice(0, 1000);
    const repurposed = {};

    const formatPrompts = {
      'twitter-thread': `Convert into a Twitter thread (10-15 tweets). First tweet must be the hook. Each tweet max 280 chars. End with CTA.`,
      'linkedin': `Convert into a LinkedIn post (800-1300 chars). Start with bold hook. Use line breaks for readability. End with question.`,
      'instagram': `Convert into Instagram carousel caption (2200 chars max). Hook + 5 slide descriptions + CTA + 20 hashtags.`,
      'newsletter': `Convert into email newsletter section (400-600 words). Friendly tone, 3 sections, clear takeaway, CTA.`,
      'youtube-script': `Convert into YouTube video script (5-8 minutes = 800-1200 words). Hook → intro → 3 main points → conclusion → CTA.`,
      'podcast-talking-points': `Convert into podcast talking points (5-7 key points with sub-bullets, questions to explore, example stories).`,
      'blog-outline': `Convert into detailed blog post outline with H1, H2s, H3s, key points per section, word count target.`,
      'short-video': `Convert into 60-second short video script. Hook (0-3s), content (3-50s), CTA (50-60s). Include visual suggestions.`
    };

    // Generate all requested formats in parallel
    const formatResults = await Promise.all(
      formats.map(format =>
        execute('ai:generate', {
          systemPrompt: `You are a content repurposing expert. ${formatPrompts[format] || 'Convert this content to the requested format.'}
Original title: "${title}"
Target audience: ${audience || 'general'}
Source: ${sourceUrl || 'provided content'}`,
          prompt: `Key insights to repurpose:\n${keyInsights}\n\nFull content context:\n${text.slice(0, 2000)}\n\nCreate the ${format}:`,
          maxTokens: 1200
        }).then(r => ({ format, content: r?.output || '' }))
      )
    );

    formatResults.forEach(({ format, content: fc }) => {
      repurposed[format] = fc;
    });

    return {
      success: true,
      title,
      sourceUrl,
      keyInsights,
      repurposed,
      formatsGenerated: formats,
      wordCount: text.split(' ').length
    };
  },

  // ── BUILD CONTENT SYSTEM: Full repurposing workflow ──────────────────────
  async buildContentSystem({ contentPillar, audience, platforms = ['instagram', 'linkedin', 'twitter', 'youtube'], frequency = 'weekly' }, execute) {
    const search = await execute('web:search', {
      query: contentPillar + ' best content formats engagement 2025 ' + audience,
      count: 6
    });
    const data = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a content systems strategist who builds scalable content operations.`,
      prompt: `Build a complete content repurposing system for:
Content pillar: "${contentPillar}"
Audience: ${audience}
Platforms: ${platforms.join(', ')}
Frequency: ${frequency}

Market data: ${data}

## CONTENT REPURPOSING SYSTEM

### Core Content Format (create this first)
Format: (long-form foundation — blog/video/podcast)
Length: 
Frequency: 
Why this is the hub:

### Repurposing Tree
From 1 [core piece] → create:

📱 Instagram: [what + how]
💼 LinkedIn: [what + how]
🐦 Twitter: [X tweets or thread]
📧 Email: [newsletter section]
🎬 YouTube Short/Reel: [what to clip]
📌 Pinterest: [infographic idea]

### Weekly Content Calendar
Monday: Create core piece
Tuesday: Repurpose → [platform]
Wednesday: Repurpose → [platform]
Thursday: Repurpose → [platform]
Friday: Repurpose → [platform]
Weekend: Schedule next week

### SOPs (Standard Operating Procedures)
Step-by-step process for each repurpose:

### Tools Needed
(to execute this system efficiently)

### Time Investment
Creating core piece: X hours
Repurposing all formats: X hours/week
Total: X hours/week for X pieces of content`,
      maxTokens: 1600
    });

    return { success: true, contentPillar, system: result?.output || '' };
  },

  // ── CAROUSEL SCRIPT: Instagram/LinkedIn carousel ─────────────────────────
  async carouselScript({ topic, audience = '', slideCount = 10, platform = 'instagram' }, execute) {
    const search = await execute('web:search', {
      query: topic + ' tips insights data 2025',
      count: 6
    });
    const data = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a carousel content creator. Carousels live or die by slide 1. Each slide must make people swipe to the next.`,
      prompt: `Create a ${slideCount}-slide ${platform} carousel about "${topic}":
Audience: ${audience || 'general'}
Data: ${data}

## CAROUSEL SCRIPT

**SLIDE 1 — COVER (most important)**
Headline: (bold, makes them stop scrolling)
Subtext: (what they'll learn)
Visual suggestion:

**SLIDE 2 — HOOK**
Text:
Visual:

**SLIDE 3-${slideCount - 2}** (content slides)
Slide 3: [insight/tip] — Text: — Visual:
Slide 4: [insight/tip] — Text: — Visual:
...

**SLIDE ${slideCount - 1} — CLIMAX**
(best insight saved for here — reward for swiping)
Text:
Visual:

**SLIDE ${slideCount} — CTA**
Text: (what to do next)
CTA button/action:

## CAPTION FOR POST
(full caption with hook + intro + CTA + hashtags)

## DESIGN NOTES
Font style:
Color palette:
Image style:`,
      maxTokens: 1600
    });

    return { success: true, topic, carousel: result?.output || '' };
  }
};
