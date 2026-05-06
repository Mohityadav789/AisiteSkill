// aistie-skills/evidence-dialogue/skill.js
// Evidence-Based Dialogue — fixes AI yes-man problem
// Inspired by glebis/claude-skills balanced skill

module.exports = {

  async analyzeArgument({ claim, context = '', mode = 'FULL' }, execute) {
    const search = await execute('web:search', {
      query: claim + ' evidence research studies pros cons 2025',
      count: 6
    });
    const evidence = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a rigorous critical thinker. You do NOT agree with everything.
You analyze claims with evidence, expose weak reasoning, and give balanced honest assessments.
Never be sycophantic. If something is wrong, say so directly.`,
      prompt: `Analyze this claim with ${mode} mode: "${claim}"
Context: ${context || 'none'}
Evidence found: ${evidence}

## CRITICAL ANALYSIS

### Claim Assessment
Verdict: Strongly Supported / Partially Supported / Insufficient Evidence / Contradicted
Confidence: X%

### Supporting Evidence
(specific data, studies, examples that support this)
1. [Evidence] — Source: — Strength: Strong/Moderate/Weak
2.
3.

### Contradicting Evidence
(what the data says against this claim)
1. [Counter-evidence] — Source: — Strength:
2.
3.

### Logical Fallacies Present
(if any — be specific)

### What's Missing from This Argument
(important factors not considered)

### Most Likely Truth
(your honest assessment based on evidence)

### What Would Change Your Mind
(what evidence would make this stronger or weaker)`,
      maxTokens: 1500
    });

    return { success: true, claim, mode, analysis: result?.output || '' };
  },

  async steelman({ position, yourStance = '', topic = '' }, execute) {
    const search = await execute('web:search', {
      query: position + ' strongest arguments evidence supporters 2025',
      count: 6
    });
    const data = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a master debater. Steelmanning means presenting the STRONGEST possible version of a position — even if you disagree with it. This is NOT about winning — it's about understanding.`,
      prompt: `Steelman this position: "${position}"
Your current stance: ${yourStance || 'not specified'}
Topic: ${topic || 'general'}
Research: ${data}

## STEELMAN ARGUMENT FOR: "${position}"

### The Strongest Version of This Argument
(restate it in its most compelling, defensible form)

### Best Evidence Supporting This Position
1. [Strongest evidence] — Why it matters:
2.
3.

### Most Compelling Logical Arguments
1.
2.
3.

### What Proponents Would Say to Every Objection
Objection 1: "..." — Steelman response: "..."
Objection 2: "..." — Response: "..."
Objection 3: "..." — Response: "..."

### Why Reasonable People Hold This View
(what values/priorities lead to this position)

### The Core Insight That Shouldn't Be Dismissed
(what's genuinely right about this position, even if wrong overall)

### Now — The Honest Critique
(after giving it full credit, what are the actual weaknesses)`,
      maxTokens: 1500
    });

    return { success: true, position, steelman: result?.output || '' };
  },

  async decisionMatrix({ decision, options = [], criteria = [], weights = {} }, execute) {
    const search = await execute('web:search', {
      query: decision + ' factors to consider best practices analysis 2025',
      count: 5
    });
    const context = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a decision analyst. Help people make better decisions with structured frameworks. Be honest — sometimes all options are bad.`,
      prompt: `Build a decision matrix for: "${decision}"
Options: ${options.join(', ')}
Criteria: ${criteria.join(', ') || 'derive from decision type'}
Weights: ${JSON.stringify(weights) || 'equal weighting'}
Context: ${context}

## DECISION MATRIX: ${decision}

### Criteria Weighting
(what matters most and why)
| Criterion | Weight | Why it matters |
|-----------|--------|----------------|
${criteria.length > 0 ? criteria.map(c => `| ${c} | X% | ... |`).join('\n') : '| [Derived criterion] | X% | ... |'}

### Option Scoring
| Option | ${criteria.join(' | ') || 'Criteria'} | Total Score |
|--------|${criteria.map(() => '-----').join(' | ') || '--------'} | ----------- |
${options.map(o => `| ${o} | ... | X/100 |`).join('\n')}

### Tradeoff Analysis
${options.map(o => `**${o}:**\nBest for: \nWorst for: \nHidden risk: `).join('\n\n')}

### The Decision I'd Recommend
Option: [X]
Confidence: X%
Why: [honest reasoning]

### When This Decision Would Be Wrong
Circumstances where another option wins:

### What Information Would Change This
If you found out [X], then [option Y] becomes better because:

### Implementation Tips
If you choose [recommended option]:`,
      maxTokens: 1800
    });

    return { success: true, decision, matrix: result?.output || '' };
  },

  async socraticdialogue({ topic, userBelief = '', depth = 3 }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are Socrates. You ask probing questions that expose assumptions and deepen understanding. You never directly answer — you guide through questions. Keep questions short and pointed.`,
      prompt: `Lead a Socratic dialogue on: "${topic}"
User's current belief: ${userBelief || 'not stated'}
Depth level: ${depth} (1=surface, 3=deep assumptions)

## SOCRATIC DIALOGUE ON: "${topic}"

### Opening Question
[A question that challenges the obvious starting assumption]

### Follow-up Questions (if they answer yes/agree)
Q2:
Q3:
Q4:
Q5:

### Follow-up Questions (if they answer no/disagree)
Q2:
Q3:
Q4:
Q5:

### The Core Assumption This Exposes
[What belief this dialogue ultimately challenges]

### What Most People Realize By the End
[The insight that emerges from this line of questioning]

### The Final Question That Opens Everything Up
[The question with no easy answer — the real one to sit with]`,
      maxTokens: 1200
    });

    return { success: true, topic, dialogue: result?.output || '' };
  },

  async tldrAnalysis({ content, focusOn = 'key points' }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You give brutally honest TL;DRs. No fluff. Just the essential truth in as few words as possible.`,
      prompt: `Give a TL;DR analysis of: "${content.slice(0, 3000)}"
Focus: ${focusOn}

## TL;DR ANALYSIS

### In One Sentence
[The entire thing in 20 words or less]

### The 3 Things That Actually Matter
1.
2.
3.

### The Thing Everyone Misses
[The non-obvious insight]

### What Action To Take
[If applicable — what to do with this information]

### The Honest Rating
Quality/Credibility/Importance: X/10
Why:`,
      maxTokens: 600
    });

    return { success: true, tldr: result?.output || '' };
  }
};
