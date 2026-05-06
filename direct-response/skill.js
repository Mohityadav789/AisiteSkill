// aistie-skills/direct-response/skill.js
// Direct Response Copywriting Suite
// Based on Kim Barrett's system + Eugene Schwartz awareness levels

module.exports = {

  // ── EXTRACT AVATAR: Deep customer avatar profile ─────────────────────────
  async extractAvatar({ product, niche, existingCustomers = '' }, execute) {
    const search = await execute('web:search', {
      query: niche + ' customer pain points desires frustrations reddit forum 2025',
      count: 8
    });
    const voiceOfCustomer = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a customer research expert trained in direct response marketing.
Extract the EXACT language customers use — not corporate speak.`,
      prompt: `Extract detailed customer avatar for "${product}" in "${niche}":
Existing customer info: ${existingCustomers || 'none provided'}
Voice of customer data: ${voiceOfCustomer}

## CUSTOMER AVATAR: [Name them]

### Demographics
Age range, gender, location, income, education, job:

### Psychographics
Values, beliefs, worldview, identity:

### Day In Their Life
7am — [what they're doing/thinking]
12pm —
6pm —
10pm —

### Deepest Frustrations (in their exact words)
"..."
"..."
"..."

### Deepest Desires (what they actually want)
"..."
"..."

### What They've Already Tried
(and why it failed)

### What They're Afraid to Admit
(the embarrassing truth about their situation)

### Decision-Making Style
How they buy, who influences them, what triggers purchase:

### Exact Phrases to Use in Copy
(words they use that you must mirror)

### Phrases to NEVER Use
(corporate/marketing speak that breaks trust)

### Avatar Summary Statement
"[Name] is a [description] who wants [desire] but struggles with [obstacle] because [deeper reason]."`,
      maxTokens: 1500
    });

    return { success: true, product, niche, avatar: result?.output || '' };
  },

  // ── BUILD OFFER: Irresistible offer construction ─────────────────────────
  async buildOffer({ product, price, audience = '', competitors = [] }, execute) {
    const search = await execute('web:search', {
      query: product + ' offer pricing value stack bonus 2025 marketing',
      count: 6
    });
    const marketData = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are an offer architect trained by Alex Hormozi's $100M Offers methodology.`,
      prompt: `Build an irresistible offer for:
Product: "${product}"
Price point: ${price}
Target: ${audience || 'not specified'}
Competitors: ${competitors.join(', ') || 'not specified'}

Market data: ${marketData}

## OFFER ARCHITECTURE

### Core Offer
What exactly they get (be specific, not vague):

### Value Stack
Item 1: [what] — Real value: $X — Why it matters:
Item 2: [what] — Real value: $X — Why it matters:
Item 3: [what] — Real value: $X — Why it matters:
Item 4: [what] — Real value: $X — Why it matters:
Item 5: [what] — Real value: $X — Why it matters:
Total value: $X

Your price: ${price}
Value-to-price ratio: X:1

### Bonuses (that make saying no feel stupid)
Bonus 1: [name] — Value: $X — Why it's relevant:
Bonus 2: [name] — Value: $X — Why:
Bonus 3: [name] — Value: $X — Why:

### Risk Reversal
Guarantee type: (money-back/results-based/lifetime)
Guarantee language: "..."

### Urgency/Scarcity Elements
(real reasons to act now — not fake countdown timers)

### Offer Name
3 naming options that make it sound premium:
1.
2.
3.

### Offer Stack Summary
"When you get [product] today, you also get [bonus 1], [bonus 2], [bonus 3]. Total value: $X. Yours today for just $[price]."

### Why This Offer Works
The psychology behind each element:`,
      maxTokens: 1600
    });

    return { success: true, product, price, offer: result?.output || '' };
  },

  // ── HEADLINE MATRIX: 50 headlines across frameworks ──────────────────────
  async headlineMatrix({ product, benefit, audience = '', count = 20 }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are a headline writer trained on 10,000 winning direct response headlines.
Every headline must make someone stop and want to read more. Specific > vague always.`,
      prompt: `Write ${count} headlines for "${product}" with benefit "${benefit}":
Audience: ${audience || 'general'}

## HEADLINE MATRIX

### HOW TO Headlines (promise outcome)
1.
2.
3.
4.

### NUMBER Headlines (specificity builds credibility)
5.
6.
7.
8.

### QUESTION Headlines (create curiosity/identify audience)
9.
10.
11.
12.

### COMMAND Headlines (direct, bold)
13.
14.
15.
16.

### BENEFIT + AUDIENCE Headlines
17.
18.
19.
20.

## TOP 5 HEADLINES
(most likely to convert — with reason why)

## HEADLINE TO TEST FIRST
[best single headline with A/B variant]`,
      maxTokens: 1200
    });

    return { success: true, product, benefit, headlines: result?.output || '' };
  },

  // ── CRUSH OBJECTIONS: Handle every sales objection ───────────────────────
  async crushObjections({ product, price, objections = [] }, execute) {
    const defaultObjections = [
      "It's too expensive",
      "I don't have time",
      "I need to think about it",
      "I need to talk to my partner/boss",
      "I've tried things like this before and they didn't work",
      "I can find this information for free online",
      "I'm not sure it will work for me specifically"
    ];

    const allObjections = objections.length > 0 ? objections : defaultObjections;

    const result = await execute('ai:generate', {
      systemPrompt: `You are a sales trainer who has handled 50,000+ objections.
Give exact word-for-word responses — not general advice.`,
      prompt: `Handle every objection for "${product}" at price ${price}:

Objections to handle:
${allObjections.map((o, i) => `${i + 1}. "${o}"`).join('\n')}

For EACH objection:

**"[Objection]"**
Root cause (what they really mean):
Wrong response (what NOT to say):
RIGHT response: "[exact words]"
Follow-up if they persist: "[exact words]"
Proof point to use: (specific stat, testimonial angle, guarantee)

## PREEMPTIVE OBJECTION HANDLING
(address these in your copy BEFORE they're raised)
Top 3 to address proactively:

## PRICE OBJECTION SCRIPTS
Full conversation flow when price is the issue:`,
      maxTokens: 1800
    });

    return { success: true, product, price, objectionHandling: result?.output || '' };
  },

  // ── AWARENESS MAPPER: Eugene Schwartz 5 levels ───────────────────────────
  async awarenessMapper({ product, niche }, execute) {
    const search = await execute('web:search', {
      query: niche + ' customer awareness stages problem solution product 2025',
      count: 5
    });
    const context = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are trained in Eugene Schwartz's 5 levels of customer awareness from Breakthrough Advertising.`,
      prompt: `Map customer awareness levels for "${product}" in "${niche}":

Context: ${context}

## SCHWARTZ AWARENESS MAP

### Level 1 — UNAWARE
Who they are: (don't know they have a problem)
What they're thinking: "..."
Ad angle to use: (educate on problem)
Sample headline:
Sample copy opening:

### Level 2 — PROBLEM AWARE
Who: (know the problem, don't know solutions exist)
Thinking: "..."
Ad angle: (introduce that solutions exist)
Sample headline:
Sample copy:

### Level 3 — SOLUTION AWARE
Who: (know solutions exist, don't know your product)
Thinking: "..."
Ad angle: (why your solution is best)
Sample headline:
Sample copy:

### Level 4 — PRODUCT AWARE
Who: (know your product, haven't bought)
Thinking: "..."
Ad angle: (overcome hesitation, make irresistible offer)
Sample headline:
Sample copy:

### Level 5 — MOST AWARE
Who: (hot leads, just need a push)
Thinking: "..."
Ad angle: (direct offer, urgency)
Sample headline:
Sample copy:

## WHICH LEVEL TO TARGET FIRST
For ${product}: Level X — Why:

## MESSAGING FUNNEL
Map content/ads to move people through all 5 levels:`,
      maxTokens: 1800
    });

    return { success: true, product, niche, awarenessMap: result?.output || '' };
  }
};
