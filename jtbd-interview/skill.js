// aistie-skills/jtbd-interview/skill.js
// Jobs-To-Be-Done Interview Tool
// Based on Bob Moesta's JTBD framework and Competing Against Luck

module.exports = {

  async conductInterview({ product, customerType = 'recent buyer', interviewDepth = 'standard' }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are Bob Moesta, the creator of Jobs-To-Be-Done theory. You conduct customer interviews to understand the REAL reason people buy. Focus on the timeline of the purchase decision, not demographics. Ask about the struggling moment, not the product features.`,
      prompt: `Create a JTBD interview guide for "${product}" with "${customerType}":
Depth: ${interviewDepth}

## JTBD INTERVIEW GUIDE: ${product}

### Pre-Interview Setup (5 min)
- Explain this is about understanding THEIR story, not testing the product
- No right or wrong answers
- You want to understand the timeline leading to the purchase

### THE FIRST MOMENT (10 min)
"When did you first start thinking you needed [product]?"
→ Follow up: "What was happening in your life at that time?"
→ Follow up: "How long ago was that?"
→ Follow up: "What were you doing before that made you start thinking about this?"

### THE STRUGGLING MOMENT (15 min)
"Walk me back to the day you decided to look for a solution — what happened that day?"
→ "What were you doing when this problem came up?"
→ "How did this problem make you feel?"
→ "What was the worst part of your situation?"
→ "Had you tried to solve this before? What happened?"

### THE TRIGGER (10 min)
"What finally made you decide to take action?"
→ "Why that day and not 3 months earlier?"
→ "Who else was involved in this decision?"
→ "What would have happened if you hadn't done anything?"

### PASSIVE LOOKING (10 min)
"Before you found [product], what did you look at?"
→ "How did you search for solutions?"
→ "What made you include or exclude options?"
→ "What was your ideal solution in your head?"

### ACTIVE LOOKING (10 min)
"When did you start seriously evaluating options?"
→ "What did you look at specifically?"
→ "Who did you talk to about this?"
→ "What almost stopped you from buying?"

### THE DECISION (10 min)
"What made you choose [product] over alternatives?"
→ "What were you hoping would change after you started using it?"
→ "What would have made you choose something else?"
→ "What were you most worried about?"

### AFTER THE PURCHASE (5 min)
"How has [product] changed your situation?"
→ "What's still not solved?"
→ "What would make you tell a friend about this?"

### ANALYSIS QUESTIONS TO ASK YOURSELF
After the interview:
- What was the struggling moment?
- What was the trigger that created urgency?
- What forces pushed them toward buying?
- What forces pushed them toward NOT buying?
- What job were they hiring the product to do?`,
      maxTokens: 2000
    });

    return { success: true, product, customerType, interviewGuide: result?.output || '' };
  },

  async analyzeInterview({ interviewTranscript, product = '' }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are a JTBD analyst. Extract the four forces of progress from this interview and identify the job being done.`,
      prompt: `Analyze this JTBD interview transcript:

"${interviewTranscript.slice(0, 4000)}"

Product: ${product || 'unknown'}

## JTBD INTERVIEW ANALYSIS

### The Job Being Done
Functional job: [what they needed to accomplish]
Emotional job: [how they wanted to feel]
Social job: [how they wanted to be perceived]

### The Four Forces of Progress

**PUSH (forces pushing away from current situation)**
1. [Pain/frustration that created urgency]
2.
3.

**PULL (forces pulling toward new solution)**
1. [What attracted them to the solution]
2.
3.

**ANXIETY (forces holding back from switching)**
1. [Fear/uncertainty about new solution]
2.
3.

**HABIT (inertia of current behavior)**
1. [What kept them doing the old thing]
2.
3.

### The Struggling Moment
When: [timeline]
What happened: [the specific event]
Emotion: [how they felt]

### The Trigger
What finally created urgency:
Why then and not earlier:

### Key Insights for Product/Marketing
1. [Insight] → Marketing implication:
2.
3.

### Quotes Worth Using in Marketing
"[Direct quote from interview]" — Use for: [where/how]
"[Another quote]" — Use for:`,
      maxTokens: 1800
    });

    return { success: true, product, analysis: result?.output || '' };
  },

  async generateMessaging({ jtbdAnalysis, product, audience = '', channels = [] }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are a conversion copywriter who uses JTBD insights to write copy that converts. Mirror the customer's exact language. Speak to the struggling moment, not the product features.`,
      prompt: `Generate marketing messaging from this JTBD analysis:

Product: "${product}"
Audience: ${audience || 'derived from analysis'}
Channels: ${channels.join(', ') || 'website, ads, email'}
JTBD Analysis: ${jtbdAnalysis.slice(0, 2000)}

## JTBD-BASED MESSAGING

### Hero Headline Options (speak to struggling moment)
1. [Speaks to the push force]
2. [Speaks to the pull/desire]
3. [Speaks to the transformation]
4. [Pattern interrupt]

### Subheadline Options
1.
2.
3.

### Homepage Hero Copy
Headline:
Subheadline:
Body (2-3 sentences):
CTA:

### Ad Copy (Facebook/Google)
Primary text (speaks to struggling moment):
Headline:
Description:

### Email Subject Lines (for acquisition)
1. [Push — problem focused]
2. [Pull — outcome focused]
3. [Social proof — transformation]

### Objection-Handling Copy
Anxiety 1: "[Their fear]" → Your response: "..."
Anxiety 2: → Response:

### Testimonial Framework
What to ask customers to make JTBD-based testimonials:
Template: "I was [struggling situation] until [trigger]. Now [outcome/transformation]."

### Words to USE (from their vocabulary)
Words to AVOID (corporate speak they didn't use):`,
      maxTokens: 2000
    });

    return { success: true, product, messaging: result?.output || '' };
  },

  async buildPersona({ interviews = [], product = '', segment = '' }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are a UX researcher building JTBD-based personas. Unlike traditional demographics-based personas, JTBD personas are built around the job, not the person.`,
      prompt: `Build a JTBD persona from these interview insights:
Product: "${product}"
Segment: "${segment}"
Interview data: ${interviews.join('\n---\n').slice(0, 3000)}

## JTBD PERSONA: [Give them a name based on the job]

### The Job
Primary job: [what they hire this product to do]
When: [situation/context]
So they can: [functional outcome]
And feel: [emotional outcome]
And be seen as: [social outcome]

### The Struggling Moment Profile
Common trigger events:
Emotional state at time of purchase:
Timeline from problem to purchase:

### Forces Profile
Typical push factors:
Typical pull factors:
Common anxieties:
Habits to overcome:

### The Language They Use
When describing the problem:
When describing the ideal solution:
What they search for online:

### What They're NOT (common misconceptions)
Demographics don't matter as much as:
They're NOT [assumed characteristic] — they're actually [reality]

### How to Reach Them
Channels where they look for solutions:
Who they trust for recommendations:
Content that resonates:

### Product Implications
Features that matter most for this job:
Features that sound good but don't matter:
Onboarding focus:`,
      maxTokens: 1800
    });

    return { success: true, product, segment, persona: result?.output || '' };
  }
};
