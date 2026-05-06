// aistie-skills/beautiful-prose/skill.js
// Beautiful Prose — Hard-edged writing style
// Inspired by SHADOWPR0/beautiful_prose
// Closer to Hemingway than ChatGPT

const PROSE_CONTRACT = `
BEAUTIFUL PROSE WRITING CONTRACT:

1. SHORT SENTENCES. Hemingway averaged 11 words. Aim for that.
2. ACTIVE VOICE. "She ran" not "Running was done by her."
3. CONCRETE NOUNS. "Table" not "furniture item." "Rain" not "precipitation."
4. STRONG VERBS. "He sprinted" not "He moved quickly." "She slammed" not "She closed hard."
5. NO ADVERBS ENDING IN -LY. They apologize for weak verbs. Eliminate them.
6. NO HEDGING. "Somewhat," "rather," "quite," "very," "really" — delete all.
7. NO PASSIVE CONSTRUCTIONS. "It was decided that" → "They decided."
8. SHOW DON'T TELL. "She was angry" → "She slammed the cup down."
9. WHITE SPACE. Short paragraphs. Let the text breathe.
10. ONE IDEA PER SENTENCE. Compound sentences dilute impact.
11. NO THROAT-CLEARING. Start mid-action. No scene-setting.
12. NO AI FILLER. Delete: "It's important to note," "It's worth mentioning," "In conclusion."
13. RHYTHM. Vary sentence length deliberately. Short. Then longer to build. Then short again.
14. SPECIFICITY. "A 1965 Ford Mustang" not "an old car."
15. TRUST THE READER. Don't over-explain. Cut the last sentence — it's usually redundant.
`;

module.exports = {

  // ── REWRITE PROSE: Transform any text to beautiful prose ─────────────────
  async rewriteProse({ text, style = 'hemingway', preserveMeaning = true, intensity = 'medium' }, execute) {
    const styles = {
      hemingway: 'Ernest Hemingway — short sentences, iceberg theory, masculine restraint, subtext',
      orwell: 'George Orwell — clarity above all, no pretension, political directness, plain English',
      didion: 'Joan Didion — fragmented, introspective, elliptical, emotional precision',
      carver: 'Raymond Carver — minimalist, working-class, what is left unsaid, quiet devastation',
      fitzgerald: 'F. Scott Fitzgerald — lyrical, romantic, melancholic, rhythmic sentences',
      modern: 'Modern editorial — clear, direct, confident, no corporate speak, voice of authority'
    };

    const intensityGuide = {
      light: 'Light edit — fix only the worst offenders. Keep most of the original structure.',
      medium: 'Medium rewrite — apply all prose rules. Change structure where needed.',
      heavy: 'Heavy rewrite — transform completely. Keep only the core meaning. Make it sing.'
    };

    const result = await execute('ai:generate', {
      systemPrompt: `You are a literary editor trained in the ${styles[style] || styles.modern} tradition.

${PROSE_CONTRACT}

${intensityGuide[intensity] || intensityGuide.medium}

Your edit should feel like a different writer wrote it — a much better one.`,
      prompt: `Rewrite this text in the style of ${style}:

ORIGINAL:
"${text}"

Apply the full prose contract. ${preserveMeaning ? 'Preserve the exact meaning.' : 'Preserve the core idea but feel free to reshape.'}

REWRITTEN:`,
      maxTokens: Math.min(text.split(' ').length * 3 + 500, 3000)
    });

    return {
      success: true,
      original: text,
      rewritten: result?.output || '',
      style,
      wordCountBefore: text.split(' ').length,
      wordCountAfter: (result?.output || '').split(' ').length
    };
  },

  // ── STYLE ANALYSIS: Score writing against prose contract ─────────────────
  async styleAnalysis({ text }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are a literary critic scoring writing quality against professional prose standards.`,
      prompt: `Score this writing against the Beautiful Prose contract:

"${text}"

## PROSE ANALYSIS REPORT

### Overall Score: X/100

### Scoring Breakdown
- Sentence variety (X/15): Average length and rhythm
- Active voice (X/15): Percentage of active constructions
- Concrete language (X/15): Specificity and imagery
- Verb strength (X/15): Strong verbs vs weak verb + adverb
- Clarity (X/20): Ease of reading and understanding
- Flow (X/20): Rhythm, pacing, transitions

### What Works
(quote specific phrases that are excellent)

### What Kills It
(quote specific phrases that violate prose rules)
Problem 1: "[quote]" — Issue: — Fix:
Problem 2: "[quote]" — Issue: — Fix:
Problem 3: "[quote]" — Issue: — Fix:

### Worst Sentences (rewrite these first)
Original: "..."
Rewritten: "..."

### Best Sentences (keep these)
"..."
"..."

### 5 Specific Improvements
1.
2.
3.
4.
5.`,
      maxTokens: 1000
    });

    return { success: true, analysis: result?.output || '' };
  },

  // ── APPLY VOICE: Rewrite in a specific famous author's style ────────────
  async applyVoice({ text, author, genre = 'narrative' }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are a literary scholar who can write convincingly in the style of any major author.
Study their distinctive traits: sentence structure, vocabulary, themes, rhythm, tone.
Apply THEIR specific style — not just "good writing."`,
      prompt: `Rewrite this text in the style of ${author} (${genre}):

"${text}"

First, describe ${author}'s specific stylistic traits:
- Sentence length pattern:
- Vocabulary level:
- Common structural moves:
- Distinctive traits:

Then rewrite:

IN THE STYLE OF ${author.toUpperCase()}:
[rewritten text]

What makes this sound like ${author}:`,
      maxTokens: 1200
    });

    return { success: true, original: text, author, styled: result?.output || '' };
  },

  // ── WRITING COACH: Teach someone to write better ─────────────────────────
  async writingCoach({ weaknesses = [], goals = '', level = 'intermediate' }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are a writing coach who taught at Columbia Journalism School for 20 years.
Give specific exercises, not vague advice.`,
      prompt: `Create a writing improvement plan for:
Level: ${level}
Weaknesses: ${weaknesses.join(', ') || 'general improvement'}
Goals: ${goals || 'write clear, compelling prose'}

## WRITING COACHING PLAN

### Diagnosis
Based on weaknesses, the core issue is:
Root cause:

### The 5 Laws to Internalize
1.
2.
3.
4.
5.

### Daily Practice (15 minutes/day)
Exercise 1 — Day 1-7: [specific exercise]
Exercise 2 — Day 8-14: [specific exercise]
Exercise 3 — Day 15-21: [specific exercise]
Exercise 4 — Day 22-30: [specific exercise]

### Reading List (to absorb great style)
1. [Book] — What to study:
2.
3.

### The One Edit Rule
Before publishing anything, do this one edit:

### Weekly Challenge
Write 300 words about [specific prompt] applying today's lesson:

### How to Know You're Improving
Specific markers of progress:`,
      maxTokens: 1400
    });

    return { success: true, plan: result?.output || '' };
  }
};
