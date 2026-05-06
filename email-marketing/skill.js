// aistie-skills/email-marketing/skill.js
// Email Marketing Bible — 55,000 words of expertise in code

module.exports = {

  // ── SUBJECT LINES: 10 variations with psychological triggers ────────────
  async writeSubjectLines({ topic, audience, emailType = 'promotional', brand = '', count = 10 }, execute) {
    const search = await execute('web:search', {
      query: 'best email subject lines ' + emailType + ' high open rate examples 2025',
      count: 5
    });
    const benchmarks = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are an email marketing expert with 15 years experience.
You've written subject lines that generated 60%+ open rates.
NEVER write generic subject lines. Every line must have a specific psychological trigger.`,
      prompt: `Write ${count} subject lines for:
Topic: "${topic}"
Audience: ${audience}
Email type: ${emailType}
Brand: ${brand || 'not specified'}

Write ${count} subject lines using these psychological triggers (2 each):

**CURIOSITY GAP** (makes them need to open)
1.
2.

**URGENCY/SCARCITY** (fear of missing out)
3.
4.

**PERSONALIZATION** (feels 1-to-1)
5.
6.

**BENEFIT-FIRST** (what's in it for them)
7.
8.

**PATTERN INTERRUPT** (unexpected, stops scroll)
9.
10.

## TOP 3 PICKS (most likely to get opened)
With open rate prediction % and why.

## A/B TEST RECOMMENDATION
Test these 2 against each other: [#] vs [#]

Benchmarks from research: ${benchmarks}`,
      maxTokens: 1000
    });

    return {
      success: true,
      topic,
      emailType,
      subjectLines: result?.output || ''
    };
  },

  // ── BUILD SEQUENCE: Full email drip sequence ─────────────────────────────
  async buildSequence({ goal, audience, product = '', sequenceType = 'welcome', days = 7 }, execute) {
    const sequenceGuides = {
      welcome: 'Onboard new subscribers. Build trust first, sell second.',
      nurture: 'Move leads from cold to warm. Educate and demonstrate value.',
      sales: 'Convert warm leads. Overcome objections, create urgency.',
      winback: 'Re-engage inactive subscribers. Pattern interrupt, then value.',
      onboarding: 'Help new customers get value fast. Reduce churn.',
      launch: 'Build anticipation then convert. Pre-launch, launch, post-launch.'
    };

    const result = await execute('ai:generate', {
      systemPrompt: `You are an email sequence strategist.
Guide: ${sequenceGuides[sequenceType] || sequenceType}
Write sequences that feel human — specific, personal, valuable. No corporate fluff.`,
      prompt: `Build a ${days}-email ${sequenceType} sequence for:
Goal: ${goal}
Audience: ${audience}
Product/Service: ${product || 'not specified'}

For EACH email provide:

## Email [#] — Day [X]: [Hook/Theme]
**Subject Line:** (+ 2 alternatives)
**Preview Text:** (30 chars)
**Goal:** What this email must achieve
**Structure:**
- Opening hook (2 sentences):
- Body (main message):
- CTA (specific action):
**Psychological trigger used:**
**Length:** Short/Medium/Long — why

(repeat for all ${days} emails)

## Sequence Strategy Notes
- Best send times:
- Re-send strategy for non-openers:
- What to do if they convert mid-sequence:`,
      maxTokens: 2500
    });

    return {
      success: true,
      goal,
      sequenceType,
      days,
      sequence: result?.output || ''
    };
  },

  // ── WRITE EMAIL: One complete email ─────────────────────────────────────
  async writeEmail({ subject, audience, goal, emailType = 'newsletter', tone = 'conversational', product = '' }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are an elite email copywriter. Write emails that people actually want to read.
RULES:
- First line must hook immediately — no "I hope you're well"
- Short paragraphs (2-3 lines max)
- One clear CTA — not multiple
- Sound human — not corporate
- Specific > generic always`,
      prompt: `Write a complete ${emailType} email:
Subject: "${subject}"
Goal: ${goal}
Audience: ${audience}
Tone: ${tone}
Product/Service: ${product || 'general'}

Provide:

## FINAL EMAIL (ready to send)
---
Subject: ${subject}
Preview: [30-char preview text]

[Full email body — formatted, ready to copy]
---

## WHY THIS WORKS
- Hook analysis:
- Structure choice:
- CTA reasoning:

## VARIATIONS
Quick alternative version with different angle:
---
Subject: [alternative]
[shorter version]
---`,
      maxTokens: 1200
    });

    return {
      success: true,
      subject,
      emailType,
      email: result?.output || ''
    };
  },

  // ── SEGMENT STRATEGY: How to split your list ────────────────────────────
  async segmentStrategy({ listSize, industry, goals = [] }, execute) {
    const search = await execute('web:search', {
      query: 'email list segmentation strategy ' + industry + ' best practices 2025',
      count: 5
    });
    const data = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are an email list strategist. Give specific, actionable segmentation advice.`,
      prompt: `Create segmentation strategy for:
Industry: ${industry}
List size: ${listSize}
Goals: ${goals.join(', ') || 'increase revenue, improve engagement'}

Data: ${data}

Provide:

## Recommended Segments (priority order)
For each segment:
**Segment Name:**
- Who they are:
- How to identify them:
- What to send them:
- Expected engagement:
- Revenue potential:

## Quick Win: First Segment to Create
(easiest to implement with biggest impact)

## Segmentation Triggers to Set Up
(behavioral triggers that auto-sort subscribers)

## Expected Results After 90 Days
(specific metrics to expect)`,
      maxTokens: 1000
    });

    return {
      success: true,
      industry,
      listSize,
      strategy: result?.output || ''
    };
  },

  // ── WIN-BACK CAMPAIGN: Re-engage cold subscribers ──────────────────────
  async winBackCampaign({ subscriberType = 'inactive 90+ days', product = '', brand = '' }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are a win-back email specialist.
Win-back campaigns have ONE job: get them to open and click ONCE.
Use pattern interrupts, honesty, and genuine value — not desperate discounts.`,
      prompt: `Create a complete win-back campaign for:
Subscriber type: ${subscriberType}
Product: ${product || 'not specified'}
Brand: ${brand || 'our company'}

## 5-EMAIL WIN-BACK SEQUENCE

Email 1 (Day 0) — PATTERN INTERRUPT:
Subject: (something they've never seen before)
Body: (admit they've been cold, be real)

Email 2 (Day 3) — VALUE BOMB:
Subject:
Body: (give them your best content/tip — no ask)

Email 3 (Day 7) — SOCIAL PROOF:
Subject:
Body: (show what they've missed while inactive)

Email 4 (Day 10) — DIRECT OFFER:
Subject:
Body: (make them a specific offer — time limited)

Email 5 (Day 14) — BREAKUP:
Subject: ("Should I remove you from my list?")
Body: (final email — creates urgency through loss)

## SUPPRESSION RULE
After email 5: anyone who hasn't clicked = remove from main list, add to quarterly check-in list.

## Expected Results
- Re-engagement rate: X%
- Email to keep on list: #
- Revenue recovery estimate:`,
      maxTokens: 1500
    });

    return {
      success: true,
      subscriberType,
      campaign: result?.output || ''
    };
  },

  // ── AUDIT EMAIL: Score and fix any email ────────────────────────────────
  async auditEmail({ emailText, subjectLine = '', targetAudience = '', emailGoal = '' }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are a senior email copywriter doing a brutal honest audit.
Score each element 1-10. Be specific about what's wrong and how to fix it.`,
      prompt: `Audit this email:

Subject: ${subjectLine || '(no subject provided)'}
---
${emailText}
---

Target audience: ${targetAudience || 'not specified'}
Email goal: ${emailGoal || 'not specified'}

AUDIT REPORT:

## Subject Line (X/10)
What works:
What doesn't:
Better version:

## Preview Text (X/10)
Assessment:
Improvement:

## Opening Line (X/10)
Assessment:
Rewrite:

## Body Copy (X/10)
Clarity:
Engagement:
Length (appropriate/too long/too short):
Biggest weakness:

## CTA (X/10)
Clarity:
Strength:
Better CTA:

## Overall Score: XX/60
Grade: A/B/C/D/F

## Top 3 Changes to Make RIGHT NOW
1.
2.
3.

## REWRITTEN VERSION
(improved email ready to use)`,
      maxTokens: 1200
    });

    return {
      success: true,
      audit: result?.output || ''
    };
  }
};
