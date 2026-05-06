// aistie-skills/humanizer/skill.js
// Humanizer — Multi-pass AI writing remover
// Inspired by blader/humanizer (2.9K+ installs)
// Catches every AI writing tell

// Known AI writing patterns to catch and fix
const AI_TELLS = {
  emDash: /\s—\s/g,
  throatClearing: /^(certainly|absolutely|of course|great question|i'd be happy|happy to help|sure|indeed|definitely|as an ai|as a language model)/i,
  ruleOfThree: /([^.]+),\s([^.]+),\s(and|or)\s([^.]+)\./g,
  synonymCycling: /(utilize|leverage|delve|foster|cultivate|facilitate|endeavor|comprehend|commence|demonstrate|incorporate|subsequently|furthermore|moreover|nevertheless|nonetheless)/gi,
  uniformParagraphs: null,
  weakOpeners: /^(this|there are|it is|it's|these|those|the fact that)/i,
  passiveVoice: /\b(is|are|was|were|been|being)\s+\w+ed\b/gi,
  corporateSpeak: /(best practices|moving forward|going forward|at the end of the day|touch base|circle back|synergy|paradigm shift|bandwidth|deep dive|low-hanging fruit|game-changer|holistic approach|value proposition)/gi,
  aiFillers: /(in conclusion|to summarize|in summary|as mentioned earlier|as stated above|it's worth noting|it's important to note|it's crucial to|needless to say|without further ado)/gi
};

function detectPatterns(text) {
  const issues = [];

  if ((text.match(AI_TELLS.emDash) || []).length > 1) {
    issues.push({ type: 'em-dash overuse', count: (text.match(AI_TELLS.emDash) || []).length, fix: 'Replace most with commas or restructure sentences' });
  }
  if (AI_TELLS.throatClearing.test(text)) {
    issues.push({ type: 'throat-clearing opener', fix: 'Delete the first sentence and start with your second' });
  }
  const synonymMatches = text.match(AI_TELLS.synonymCycling) || [];
  if (synonymMatches.length > 0) {
    issues.push({ type: 'AI vocabulary', words: [...new Set(synonymMatches)], fix: 'Replace with simpler, direct words' });
  }
  const corporateMatches = text.match(AI_TELLS.corporateSpeak) || [];
  if (corporateMatches.length > 0) {
    issues.push({ type: 'corporate speak', phrases: [...new Set(corporateMatches)], fix: 'Say what you mean plainly' });
  }
  const fillerMatches = text.match(AI_TELLS.aiFillers) || [];
  if (fillerMatches.length > 0) {
    issues.push({ type: 'AI filler phrases', phrases: [...new Set(fillerMatches)], fix: 'Delete these entirely — they add zero value' });
  }

  // Check paragraph uniformity
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 50);
  if (paragraphs.length >= 3) {
    const lengths = paragraphs.map(p => p.split(' ').length);
    const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.every(l => Math.abs(l - avg) < avg * 0.3);
    if (variance) {
      issues.push({ type: 'uniform paragraph lengths', fix: 'Vary paragraph lengths — short ones create rhythm' });
    }
  }

  return issues;
}

module.exports = {

  // ── HUMANIZE: Full multi-pass humanization ──────────────────────────────
  async humanize({ text, tone = 'conversational', aggressiveness = 'medium', preserveKeywords = [] }, execute) {
    // Pass 1: Detect what's wrong
    const detectedIssues = detectPatterns(text);

    const keywordsNote = preserveKeywords.length > 0
      ? `\nKEEP THESE KEYWORDS UNCHANGED: ${preserveKeywords.join(', ')}`
      : '';

    const aggressivenessGuide = {
      light: 'Light touch — fix obvious AI tells only. Keep structure mostly intact.',
      medium: 'Medium rewrite — fix all AI patterns, vary sentence structure, add personality.',
      heavy: 'Heavy rewrite — completely transform. Keep only the core meaning. Make it unrecognizable as AI.'
    };

    // Pass 2: Humanize
    const pass1 = await execute('ai:generate', {
      systemPrompt: `You are a human editor who makes AI text sound genuinely human.
${aggressivenessGuide[aggressiveness] || aggressivenessGuide.medium}

WHAT TO FIX:
1. Delete all throat-clearing openers (certainly, absolutely, great question, etc)
2. Replace em-dashes with commas or restructure
3. Replace AI vocabulary (utilize→use, leverage→use, delve→explore, foster→build)
4. Delete filler conclusions (in conclusion, to summarize, it's worth noting)
5. Vary sentence length — mix short punchy sentences with longer ones
6. Add contractions where natural (do not→don't, it is→it's)
7. Remove passive voice where possible
8. Cut corporate speak (best practices, moving forward, synergy)
9. Vary paragraph length — not all the same size
10. Add ONE specific example or detail where text is generic${keywordsNote}`,
      prompt: `Make this text sound human. Tone: ${tone}\n\nOriginal text:\n${text}\n\nHumanized version:`,
      maxTokens: Math.min(text.split(' ').length * 2 + 500, 3000)
    });

    const humanizedV1 = pass1?.output || text;

    // Pass 3: Polish (catch remaining issues)
    const pass2 = await execute('ai:generate', {
      systemPrompt: `You are a final editor. Read this text and fix any remaining AI patterns.
Check specifically:
- Does any sentence sound like it was written by ChatGPT? Rewrite it.
- Are there any "furthermore", "moreover", "additionally" still present? Remove them.
- Does the opening sentence grab attention? If not, rewrite it.
- Is the last sentence weak? Strengthen it.
- Do paragraphs all start with "The"? Vary them.${keywordsNote}`,
      prompt: `Polish this text — make it pass as written by a real human expert:\n\n${humanizedV1}\n\nPolished final version:`,
      maxTokens: Math.min(humanizedV1.split(' ').length * 2 + 300, 3000)
    });

    const finalText = pass2?.output || humanizedV1;

    return {
      success: true,
      original: text,
      humanized: finalText,
      issuesFixed: detectedIssues,
      passesApplied: 2,
      wordCount: {
        original: text.split(' ').length,
        humanized: finalText.split(' ').length
      }
    };
  },

  // ── DETECT AI PATTERNS: Audit any text ─────────────────────────────────
  async detectAIPatterns({ text }, execute) {
    const detectedIssues = detectPatterns(text);

    const result = await execute('ai:generate', {
      systemPrompt: `You are an AI detection expert. Score text on how human vs AI it sounds.
Be specific — quote exact phrases that give it away.`,
      prompt: `Analyze this text for AI writing patterns:

"${text.slice(0, 2000)}"

Score: X/100 (100 = definitely AI, 0 = definitely human)

## AI Tells Found (quote them)
${detectedIssues.map(i => `- ${i.type}`).join('\n') || '(running deeper analysis...)'}

## Specific Phrases That Give It Away
1. "[quote]" — why it sounds like AI
2. "[quote]" — why it sounds like AI
3. "[quote]" — why it sounds like AI

## Structural Issues
- Paragraph uniformity:
- Sentence rhythm:
- Vocabulary variety:

## Quick Fix Priority
1. (most important fix)
2.
3.

## Would AI Detectors Flag This?
GPTZero likelihood: High/Medium/Low
Turnitin likelihood: High/Medium/Low
Winston AI likelihood: High/Medium/Low`,
      maxTokens: 800
    });

    return {
      success: true,
      text: text.slice(0, 500) + (text.length > 500 ? '...' : ''),
      detectedPatterns: detectedIssues,
      aiScore: result?.output || '',
      recommendation: detectedIssues.length === 0
        ? 'Text looks relatively human. Light humanization recommended.'
        : `${detectedIssues.length} AI patterns detected. ${detectedIssues.length > 3 ? 'Heavy' : 'Medium'} humanization recommended.`
    };
  },

  // ── REWRITE SECTION: Fix one specific section ───────────────────────────
  async rewriteSection({ section, context = '', instruction = '', tone = 'conversational' }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are a precise editor. Rewrite ONLY what's given. Keep the meaning. Make it human.`,
      prompt: `Rewrite this section to sound genuinely human:

Section: "${section}"
Context: ${context || 'standalone section'}
Specific instruction: ${instruction || 'make it sound natural and human'}
Tone: ${tone}

Provide:

## REWRITTEN VERSION
[new version — same meaning, human voice]

## WHAT CHANGED
- [specific change 1]
- [specific change 2]
- [specific change 3]

## ALTERNATIVE VERSION
[different approach, same meaning]`,
      maxTokens: 600
    });

    return {
      success: true,
      original: section,
      rewrite: result?.output || ''
    };
  },

  // ── MATCH VOICE: Rewrite to match a specific person's writing style ─────
  async matchVoice({ textToRewrite, voiceSamples = [], voiceDescription = '', tone = '' }, execute) {
    const samplesText = voiceSamples.length > 0
      ? 'VOICE SAMPLES (copy this style):\n' + voiceSamples.map((s, i) => `Sample ${i+1}:\n"${s}"`).join('\n\n')
      : `VOICE DESCRIPTION: ${voiceDescription || 'conversational, direct, no fluff'}`;

    const result = await execute('ai:generate', {
      systemPrompt: `You are a ghostwriter who perfectly captures specific voices.
Study the samples, extract patterns, then rewrite in that exact voice.`,
      prompt: `${samplesText}

Now rewrite this text in that exact voice:
"${textToRewrite}"

VOICE ANALYSIS (what patterns you detected):
- Sentence structure:
- Common phrases:
- Tone markers:
- What they NEVER say:

REWRITTEN IN MATCHING VOICE:
[rewrite]

CONFIDENCE: X% — this sounds like [them/the described voice]`,
      maxTokens: 1000
    });

    return {
      success: true,
      original: textToRewrite,
      rewrite: result?.output || ''
    };
  }
};
