// aistie-skills/business-frameworks/skill.js
// 25 business frameworks — Don Norman, Cialdini, Eric Ries, Alex Hormozi
// Grounded in actual published frameworks

module.exports = {

  // ── APPLY FRAMEWORK: Router to right framework ───────────────────────────
  async applyFramework({ framework, business, context = '' }, execute) {
    const frameworkMap: Record<string, string> = {
      'swot': 'swotAnalysis',
      'porter': 'portersFiveForces',
      'blue ocean': 'blueOceanStrategy',
      'first principles': 'firstPrinciples',
      'hormozi': 'hormozi',
      'cialdini': 'cialdini',
      'lean': 'ericRies',
    };
    const fn = frameworkMap[framework.toLowerCase()] || 'swotAnalysis';
    return module.exports[fn]({ business, context }, execute);
  },

  // ── SWOT ANALYSIS: Complete SWOT ─────────────────────────────────────────
  async swotAnalysis({ business, industry = '', competitors = [], context = '' }, execute) {
    const [internal, external] = await Promise.all([
      execute('web:search', { query: business + ' strengths weaknesses company analysis 2025', count: 5 }),
      execute('web:search', { query: (industry || business) + ' market trends opportunities threats 2025', count: 5 })
    ]);

    const data = [
      ...(internal?.results || []),
      ...(external?.results || [])
    ].map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a strategic business analyst. SWOT must be specific and actionable — not generic platitudes.`,
      prompt: `Complete SWOT analysis for "${business}":
Industry: ${industry}
Competitors: ${competitors.join(', ')}
Context: ${context}
Research: ${data}

## SWOT ANALYSIS: ${business}

### STRENGTHS (internal advantages)
1. [Specific strength] — Why it matters competitively:
2.
3.
4.
5.

### WEAKNESSES (internal disadvantages)
1. [Specific weakness] — Impact:
2.
3.
4.

### OPPORTUNITIES (external possibilities)
1. [Specific opportunity] — Size: — Timing:
2.
3.
4.

### THREATS (external dangers)
1. [Specific threat] — Likelihood: — Impact:
2.
3.
4.

### SWOT MATRIX STRATEGIES

**SO Strategies** (use strengths to capture opportunities)
1.
2.

**WO Strategies** (overcome weaknesses to capture opportunities)
1.
2.

**ST Strategies** (use strengths to avoid threats)
1.
2.

**WT Strategies** (minimize weaknesses, avoid threats)
1.
2.

### Top 3 Strategic Priorities
Based on this SWOT, focus on:
1. [Priority] — Why: — How:
2.
3.`,
      maxTokens: 2000
    });

    return { success: true, business, swot: result?.output || '' };
  },

  // ── PORTER'S FIVE FORCES ─────────────────────────────────────────────────
  async portersFiveForces({ industry, company = '', context = '' }, execute) {
    const search = await execute('web:search', {
      query: industry + ' market competition analysis barriers suppliers buyers 2025',
      count: 6
    });
    const data = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a strategic analyst trained in Michael Porter's frameworks. Apply Porter's Five Forces rigorously with specific evidence.`,
      prompt: `Apply Porter's Five Forces to "${industry}" ${company ? 'for ' + company : ''}:
Research: ${data}

## PORTER'S FIVE FORCES: ${industry}

### Force 1: COMPETITIVE RIVALRY
Intensity: Very High / High / Moderate / Low
Key competitors:
Rivalry drivers:
- Number of competitors:
- Industry growth rate:
- Product differentiation:
- Exit barriers:
Strategic implication:

### Force 2: THREAT OF NEW ENTRANTS
Threat level: High / Moderate / Low
Barriers to entry:
- Capital requirements:
- Brand loyalty needed:
- Regulatory requirements:
- Technology barriers:
Strategic implication:

### Force 3: BARGAINING POWER OF SUPPLIERS
Power level: High / Moderate / Low
Key suppliers:
Power drivers:
Strategic implication:

### Force 4: BARGAINING POWER OF BUYERS
Power level: High / Moderate / Low
Buyer characteristics:
Power drivers:
Strategic implication:

### Force 5: THREAT OF SUBSTITUTES
Threat level: High / Moderate / Low
Substitutes:
Switch cost:
Strategic implication:

### Overall Industry Attractiveness
Score: X/5 (5 = very attractive)
Rationale:

### Strategic Recommendations for ${company || 'players in this industry'}
1. [Recommendation based on forces]
2.
3.`,
      maxTokens: 2000
    });

    return { success: true, industry, company, analysis: result?.output || '' };
  },

  // ── BLUE OCEAN STRATEGY ──────────────────────────────────────────────────
  async blueOceanStrategy({ business, industry, currentOffering = '' }, execute) {
    const search = await execute('web:search', {
      query: industry + ' uncontested market space differentiation innovation 2025',
      count: 5
    });
    const data = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a Blue Ocean Strategy expert trained on Kim and Mauborgne's framework. Find genuinely uncontested market spaces.`,
      prompt: `Apply Blue Ocean Strategy to "${business}" in "${industry}":
Current offering: ${currentOffering || 'not specified'}
Market data: ${data}

## BLUE OCEAN STRATEGY: ${business}

### Current Red Ocean Assessment
What everyone in ${industry} competes on:
Why this is a red ocean (price war, margin erosion):

### THE FOUR ACTIONS FRAMEWORK

**ELIMINATE** (factors industry competes on that add no value)
1.
2.
3.

**REDUCE** (factors that should be reduced below industry standard)
1.
2.

**RAISE** (factors that should be raised above industry standard)
1.
2.

**CREATE** (factors that have never been offered)
1.
2.
3.

### THE STRATEGY CANVAS
Current industry curve vs proposed new curve:
[Describe how your value curve differs]

### Blue Ocean Opportunity
The uncontested market space:
Who you'd be serving (non-customers):
Why they don't buy from anyone now:

### Noncustomer Analysis
Tier 1 noncustomers (soon-to-be, on edge):
Tier 2 noncustomers (refusing):
Tier 3 noncustomers (unexplored):

### The New Value Proposition
[One paragraph describing the blue ocean offering]

### Execution Challenges
Cognitive hurdle:
Resource hurdle:
Motivational hurdle:
Political hurdle:`,
      maxTokens: 2000
    });

    return { success: true, business, industry, strategy: result?.output || '' };
  },

  // ── FIRST PRINCIPLES THINKING ────────────────────────────────────────────
  async firstPrinciples({ problem, currentAssumptions = [], industry = '' }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are Elon Musk's first principles thinking coach. Break every assumption. Rebuild from fundamental truths. What would you build if you started from scratch with no industry conventions?`,
      prompt: `Apply first principles thinking to: "${problem}"
Current assumptions: ${currentAssumptions.join(', ')}
Industry: ${industry || 'general'}

## FIRST PRINCIPLES ANALYSIS

### Step 1: Identify Current Assumptions
What does everyone in this space assume to be true?
1. [Assumption] — True or False?
2.
3.
4.
5.

### Step 2: Break Down to Fundamentals
What are the actual physical/logical constraints? (what MUST be true)
1.
2.
3.

What are the arbitrary conventions? (what people ASSUME must be true)
1.
2.
3.

### Step 3: Rebuild from Scratch
If you ignored all conventions and built from fundamentals:
What would you actually need?
What would it look like?
What's the 10x better version?

### Step 4: Question Economics
Current cost structure: $X
First principles cost: $X
Gap: X× (why does this gap exist?)

### The Contrarian Insight
What does everyone believe that is actually wrong?
What's the non-obvious opportunity this reveals?

### Practical Application
How to act on this within existing constraints:
First experiment to run:
What to build/test in the next 30 days:`,
      maxTokens: 1800
    });

    return { success: true, problem, analysis: result?.output || '' };
  },

  // ── HORMOZI FRAMEWORK: $100M Offers ─────────────────────────────────────
  async hormozi({ business, currentOffer = '', price = '', targetCustomer = '' }, execute) {
    const search = await execute('web:search', {
      query: business + ' customer value pricing willingness to pay market 2025',
      count: 5
    });
    const data = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are Alex Hormozi's $100M Offers framework expert. The goal is to create offers so good people feel stupid saying no. Dream outcome × Perceived likelihood × Time delay × Effort = Value.`,
      prompt: `Apply Hormozi's $100M Offers framework to "${business}":
Current offer: ${currentOffer || 'not specified'}
Current price: ${price || 'not specified'}
Target customer: ${targetCustomer || 'not specified'}
Market data: ${data}

## $100M OFFERS FRAMEWORK: ${business}

### The Value Equation Analysis
Dream Outcome: X/10 (what they really want)
Perceived Likelihood: X/10 (do they believe you can deliver?)
Time to Value: X/10 (how fast do they see results?)
Effort Required: X/10 (how hard is it for them?)
**Current Value Score: X/40**

### Identifying the Dream Outcome
What does the customer REALLY want (the final result, not your product):
What does their life look like after:

### The Grand Slam Offer Components
**Core Offer** (the main thing):
**Value Add 1** (something they want but don't expect):
**Value Add 2**:
**Value Add 3**:
**Risk Reversal** (guarantee that removes buying fear):
**Urgency/Scarcity** (real reason to act now):

### Pricing Strategy
Current price: ${price || 'unknown'}
Perceived value: $X (what they should feel it's worth)
Your price: $X (price at 1/10th perceived value)
Positioning: Not the cheapest, not the most expensive — the BEST VALUE

### The Offer Stack
List everything with individual values:
[Item 1]: Worth $X
[Item 2]: Worth $X
Total value: $X
Your price: $X
"Today only" bonus: $X

### The Guarantee
Type: (money-back/results-based/anti-risk)
Wording: "If you don't [specific result] in [timeframe], [what you'll do]"

### The Pitch (1 paragraph)
[Write the complete offer pitch using all elements]`,
      maxTokens: 2000
    });

    return { success: true, business, offer: result?.output || '' };
  },

  // ── CIALDINI PRINCIPLES: Influence ──────────────────────────────────────
  async cialdini({ product, audience = '', channel = 'website', context = '' }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are an expert in Robert Cialdini's 7 Principles of Influence: Reciprocity, Commitment, Social Proof, Authority, Liking, Scarcity, Unity.`,
      prompt: `Apply Cialdini's influence principles to "${product}" for "${audience}" on ${channel}:
Context: ${context}

## CIALDINI'S INFLUENCE PRINCIPLES: ${product}

### 1. RECIPROCITY
Give before you ask.
Implementation: [specific tactic]
Example copy: "..."
Where to use: ${channel}

### 2. COMMITMENT & CONSISTENCY
Start small, build up.
Implementation: [specific tactic]
Example: [low-commitment first step]
How it leads to: [bigger commitment]

### 3. SOCIAL PROOF
Others are doing it.
Implementation: [specific type — numbers/testimonials/logos/ratings]
Example: [specific social proof to show]
Placement: [exactly where on ${channel}]

### 4. AUTHORITY
Expert endorsement.
Implementation: [how to establish authority]
Credentials to show:
Example: "..."

### 5. LIKING
Be likeable.
Implementation: [specific tactics]
Similarity: [how to mirror audience]
Compliments: [genuine appreciation]

### 6. SCARCITY
Less is more.
Implementation: [real scarcity — not fake]
Example: "..."
Why it's real (not manufactured):

### 7. UNITY (Cialdini's 7th, from Pre-Suasion)
Shared identity.
Implementation: [create in-group]
Example: "..."

### COMPLETE ${channel.toUpperCase()} INFLUENCE MAP
Where each principle appears on the page/in the flow:
Above fold:
Middle:
At checkout/CTA:
Follow-up:`,
      maxTokens: 2000
    });

    return { success: true, product, audience, channel, influence: result?.output || '' };
  },

  // ── ERIC RIES LEAN STARTUP ───────────────────────────────────────────────
  async ericRies({ idea, stage = 'idea', assumptions = [], resources = '' }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are Eric Ries, author of The Lean Startup. Apply Build-Measure-Learn rigorously. Kill bad ideas fast, scale good ones faster.`,
      prompt: `Apply Lean Startup methodology to: "${idea}"
Stage: ${stage}
Riskiest assumptions: ${assumptions.join(', ')}
Resources: ${resources || 'limited'}

## LEAN STARTUP FRAMEWORK: ${idea}

### Hypothesis Statement
"We believe [customer segment] has a problem with [problem].
We will know we're right when [measurable outcome]."

### Riskiest Assumptions (ranked)
1. [Most dangerous assumption] — If wrong, impact: Kill idea / Pivot / Minor adjustment
2.
3.

### Minimum Viable Product (MVP)
NOT a full product — the smallest thing to test assumption #1:
What to build:
What to NOT build yet:
How to build in 2 weeks or less:
Cost to build: $X

### Build-Measure-Learn Cycle

**BUILD:** What you'll create
Time: X days | Cost: $X

**MEASURE:** What you'll track
Primary metric:
How to collect:
Sample size needed:

**LEARN:** What the results mean
If metric exceeds X → conclusion: [scale/continue]
If metric is X-Y → conclusion: [iterate]
If metric below X → conclusion: [pivot/kill]

### Innovation Accounting
Baseline metric: X%
Target metric: X%
Improvement needed: X%
By when: [date]

### Pivot Triggers
If you don't see [X] by [date], you must pivot.
Pivot options if current direction fails:
1.
2.

### The 5 Whys (why this might fail)
Why 1:
Why 2:
Why 3:
Why 4:
Why 5:
Root cause:
Prevention:`,
      maxTokens: 2000
    });

    return { success: true, idea, stage, lean: result?.output || '' };
  }
};
