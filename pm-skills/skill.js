// aistie-skills/pm-skills/skill.js
// 100+ PM skills condensed into core functions
// Inspired by phuryn/pm-skills (100+ skills, 8 plugins)

module.exports = {

  // ── WRITE PRD: Complete Product Requirements Document ────────────────────
  async writePRD({ productName, problemStatement, targetUsers, features = [], constraints = '', timeline = '' }, execute) {
    const search = await execute('web:search', {
      query: productName + ' similar products market analysis user needs 2025',
      count: 5
    });
    const marketData = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a senior Product Manager at a top tech company. Write PRDs that engineering teams love — specific, unambiguous, complete.`,
      prompt: `Write a complete PRD for: "${productName}"

Problem: ${problemStatement}
Target Users: ${targetUsers}
Key Features: ${features.join(', ') || 'to be determined'}
Constraints: ${constraints || 'none specified'}
Timeline: ${timeline || 'not specified'}
Market context: ${marketData}

## PRODUCT REQUIREMENTS DOCUMENT

### 1. Executive Summary
Product vision, problem being solved, success definition

### 2. Problem Statement
- User pain points (specific, quantified where possible)
- Current solutions and why they fail
- Opportunity size

### 3. Goals and Success Metrics
- Business goals:
- User goals:
- KPIs to measure success:
- Non-goals (what we're NOT building):

### 4. User Personas
Persona 1: [Name, role, pain, goal, tech comfort]
Persona 2: [Name, role, pain, goal, tech comfort]

### 5. User Stories
Format: As a [user], I want to [action] so that [benefit]
Priority: Must Have / Should Have / Nice to Have
(10-15 user stories)

### 6. Functional Requirements
For each feature:
- Feature name:
- Description:
- Acceptance criteria:
- Edge cases:
- Dependencies:

### 7. Non-Functional Requirements
- Performance:
- Security:
- Scalability:
- Accessibility:

### 8. Technical Considerations
- Architecture notes:
- API requirements:
- Data requirements:
- Integration needs:

### 9. Timeline and Milestones
- Phase 1 (MVP):
- Phase 2:
- Phase 3:

### 10. Open Questions
(things that need to be decided before development)

### 11. Appendix
- Competitive analysis
- Research references`,
      maxTokens: 3000
    });

    return { success: true, productName, prd: result?.output || '' };
  },

  // ── CREATE LEAN CANVAS: One-page business model ──────────────────────────
  async createLeanCanvas({ productName, problem, solution = '', customerSegment = '', uniqueValueProp = '', channels = '', revenueStreams = '', costStructure = '', keyMetrics = '' }, execute) {
    const search = await execute('web:search', {
      query: productName + ' business model revenue competitors market 2025',
      count: 5
    });
    const context = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are an expert in Lean Startup methodology and the Lean Canvas framework by Ash Maurya.`,
      prompt: `Create a complete Lean Canvas for: "${productName}"

Known info:
Problem: ${problem}
Solution: ${solution || 'to be defined'}
Customer: ${customerSegment || 'to be defined'}
UVP: ${uniqueValueProp || 'to be defined'}
Context: ${context}

## LEAN CANVAS: ${productName}

### 1. PROBLEM
Top 3 problems being solved:
1.
2.
3.
Existing alternatives (how users solve it today):

### 2. CUSTOMER SEGMENTS
Target customers:
Early adopters (who will use it first and why):

### 3. UNIQUE VALUE PROPOSITION
Single clear message why you're different:
High-concept pitch: "[X] for [Y]"
Tagline:

### 4. SOLUTION
Top 3 features that solve the problems:
1.
2.
3.

### 5. CHANNELS
Path to customers:
- Awareness:
- Acquisition:
- Retention:

### 6. REVENUE STREAMS
Revenue model:
Pricing:
Lifetime value:
Revenue projections (conservative/realistic/optimistic):

### 7. COST STRUCTURE
Fixed costs:
Variable costs:
Customer acquisition cost estimate:

### 8. KEY METRICS
The ONE metric that matters most:
Supporting metrics:
How to measure them:

### 9. UNFAIR ADVANTAGE
What can't be easily copied:

### RISKIEST ASSUMPTIONS
1. (biggest assumption — test this first)
2.
3.

### NEXT 3 EXPERIMENTS TO RUN
To validate riskiest assumptions:
1.
2.
3.`,
      maxTokens: 2000
    });

    return { success: true, productName, leanCanvas: result?.output || '' };
  },

  // ── DEFINE OKRs: Objectives and Key Results ──────────────────────────────
  async defineOKRs({ company, team = '', quarter = 'Q1 2025', goals = [], currentMetrics = {} }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are an OKR expert trained by John Doerr's "Measure What Matters" methodology.
OKRs must be: Ambitious but achievable, measurable, time-bound, aligned to company goals.`,
      prompt: `Define OKRs for: "${company}" ${team ? '— ' + team + ' team' : ''}
Quarter: ${quarter}
Strategic goals: ${goals.join(', ') || 'growth and product excellence'}
Current metrics: ${JSON.stringify(currentMetrics) || 'not provided'}

## OKR FRAMEWORK: ${quarter}

### COMPANY OKRs

**Objective 1: [Ambitious qualitative goal]**
- KR1: [Measurable result — from X to Y by date]
- KR2: [Measurable result]
- KR3: [Measurable result]
Confidence: X%

**Objective 2: [Second objective]**
- KR1:
- KR2:
- KR3:
Confidence: X%

**Objective 3: [Third objective]**
- KR1:
- KR2:
- KR3:
Confidence: X%

${team ? `### ${team.toUpperCase()} TEAM OKRs (aligned to company)

**Team Objective 1:**
- KR1:
- KR2:
Owner: | Due: | Status: On Track / At Risk / Behind` : ''}

### OKR HEALTH CHECK
Common mistakes in these OKRs:
What to avoid:

### WEEKLY CHECK-IN TEMPLATE
Monday: Update confidence %
Friday: What moved the needle?

### GRADING RUBRIC
0.7-1.0 = Excellent
0.4-0.6 = Good (most should land here)
0.0-0.3 = Failed or too ambitious`,
      maxTokens: 1800
    });

    return { success: true, company, team, quarter, okrs: result?.output || '' };
  },

  // ── PRIORITIZE FEATURES: Data-driven prioritization ──────────────────────
  async prioritizeFeatures({ features = [], framework = 'RICE', userGoal = '', constraints = '' }, execute) {
    const frameworks = {
      RICE: 'Reach × Impact × Confidence / Effort',
      MoSCoW: 'Must Have / Should Have / Could Have / Won\'t Have',
      Kano: 'Basic / Performance / Delight features',
      ICE: 'Impact × Confidence × Ease',
      ValueVsEffort: 'Value vs Effort 2x2 matrix'
    };

    const result = await execute('ai:generate', {
      systemPrompt: `You are a product strategist expert in feature prioritization. Be data-driven and decisive.`,
      prompt: `Prioritize these features using ${framework} (${frameworks[framework] || framework}):

Features: ${features.join('\n')}
User goal: ${userGoal || 'maximize user value'}
Constraints: ${constraints || 'none'}

## FEATURE PRIORITIZATION: ${framework} FRAMEWORK

### Scoring Matrix
| Feature | ${framework === 'RICE' ? 'Reach | Impact | Confidence | Effort | Score' : framework === 'MoSCoW' ? 'Category | Rationale' : 'Score | Priority'} |
|---------|${framework === 'RICE' ? '-------|--------|------------|--------|-------' : '---------|--------'}|
${features.map(f => `| ${f} | ... |`).join('\n')}

### Priority Order
1. [Feature] — Why: — Expected impact:
2.
3.
(continue for all features)

### What to Build First (MVP)
Features for V1:
Features for V2:
Features for V3:
Features to cut completely:

### Risks of This Prioritization
What we're giving up by not building X first:

### Recommendation
Single most important feature to build right now and why:`,
      maxTokens: 1500
    });

    return { success: true, framework, prioritization: result?.output || '' };
  },

  // ── WRITE USER STORIES: Agile user stories ──────────────────────────────
  async writeUserStories({ feature, userTypes = [], acceptanceCriteria = true, includeEdgeCases = true }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are an agile product manager. Write clear, testable user stories. Follow INVEST criteria: Independent, Negotiable, Valuable, Estimable, Small, Testable.`,
      prompt: `Write user stories for: "${feature}"
User types: ${userTypes.join(', ') || 'end user, admin'}

For each story provide:

## USER STORIES: ${feature}

### Epic: ${feature}

**Story 1 — [Core functionality]**
As a [user type],
I want to [specific action],
So that [concrete benefit].

${acceptanceCriteria ? `Acceptance Criteria:
- Given [context], When [action], Then [result]
- Given [context], When [action], Then [result]
- Given [context], When [action], Then [result]` : ''}

${includeEdgeCases ? `Edge Cases:
- What happens if [edge case 1]?
- What happens if [edge case 2]?` : ''}

Story Points: [1/2/3/5/8/13]
Priority: Must Have / Should Have / Nice to Have

(write 8-12 stories total covering all user types and scenarios)

### Definition of Done
- [ ] Code written and reviewed
- [ ] Unit tests passing
- [ ] Acceptance criteria verified
- [ ] Edge cases handled
- [ ] Documentation updated`,
      maxTokens: 2000
    });

    return { success: true, feature, userStories: result?.output || '' };
  },

  // ── BUILD ROADMAP: Product roadmap ──────────────────────────────────────
  async buildRoadmap({ productName, vision, timeframe = '12 months', themes = [], constraints = '' }, execute) {
    const search = await execute('web:search', {
      query: productName + ' product roadmap strategy market 2025',
      count: 5
    });
    const context = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a VP of Product. Build outcome-based roadmaps, not feature lists. Focus on problems to solve, not features to ship.`,
      prompt: `Build a ${timeframe} product roadmap for: "${productName}"

Vision: ${vision}
Strategic themes: ${themes.join(', ') || 'growth, retention, monetization'}
Constraints: ${constraints || 'none'}
Market context: ${context}

## PRODUCT ROADMAP: ${productName}

### Vision Statement
Where we're going and why it matters:

### Strategic Themes
Theme 1: [Name] — Why it matters — How we'll measure success
Theme 2:
Theme 3:

### NOW (Next 3 months)
Focus: [Problem we're solving]
Key initiatives:
1. [Initiative] — Expected outcome — How we measure
2.
3.
Success metrics:

### NEXT (3-6 months)
Focus: [Problem we're solving]
Key initiatives:
Dependencies on NOW items:

### LATER (6-12 months)
Focus: [Bigger bets]
Key initiatives:
What needs to be true for these to happen:

### NOT DOING (and why)
1. [Feature/idea] — Why we're saying no:
2.

### Risks and Dependencies
Technical risks:
Market risks:
Resource constraints:

### How to Communicate This Roadmap
To engineering:
To sales:
To executives:
To customers:`,
      maxTokens: 2000
    });

    return { success: true, productName, roadmap: result?.output || '' };
  },

  // ── DEFINE VALUE PROP: Value proposition canvas ──────────────────────────
  async defineValueProp({ product, customerSegment, jobs = [], pains = [], gains = [] }, execute) {
    const search = await execute('web:search', {
      query: product + ' value proposition customer needs ' + customerSegment + ' 2025',
      count: 5
    });
    const context = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are an expert in the Value Proposition Canvas by Strategyzer. Help businesses find product-market fit.`,
      prompt: `Define the value proposition for "${product}" targeting "${customerSegment}":

Customer jobs: ${jobs.join(', ') || 'derive from segment'}
Customer pains: ${pains.join(', ') || 'derive from research'}
Customer gains: ${gains.join(', ') || 'derive from research'}
Context: ${context}

## VALUE PROPOSITION CANVAS

### CUSTOMER PROFILE: ${customerSegment}

**Customer Jobs** (what they're trying to get done)
Functional jobs:
- 
Social jobs (how they want to be perceived):
-
Emotional jobs (how they want to feel):
-

**Pains** (risks, obstacles, bad outcomes)
Extreme pains:
-
Moderate pains:
-

**Gains** (outcomes and benefits desired)
Required gains:
-
Expected gains:
-
Desired gains:
-

### VALUE MAP: ${product}

**Products & Services**
What we offer:

**Pain Relievers**
How we eliminate pains (map to each pain above):
Pain: [X] → Relief: [How we fix it]

**Gain Creators**
How we create gains (map to each gain above):
Gain: [X] → Creator: [How we deliver it]

### FIT ANALYSIS
Strong fit (pain relievers matching extreme pains):
Weak fit (where we don't address customer needs):
Gaps to fill:

### ONE-LINE VALUE PROPOSITION
"We help [customer segment] who want to [job to be done] by [solution] unlike [alternative]."

### MESSAGING HIERARCHY
Primary message (homepage headline):
Secondary message (subheadline):
Supporting proof points:`,
      maxTokens: 2000
    });

    return { success: true, product, customerSegment, valueProp: result?.output || '' };
  },

  // ── LAUNCH CHECKLIST: Product launch preparation ─────────────────────────
  async launchChecklist({ productName, launchDate, launchType = 'public', targetAudience = '' }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are a product launch expert who has launched 50+ products. Be exhaustive — missing one thing can kill a launch.`,
      prompt: `Create a complete launch checklist for: "${productName}"
Launch date: ${launchDate}
Launch type: ${launchType} (beta/soft/public/enterprise)
Target audience: ${targetAudience || 'general consumers'}

## PRODUCT LAUNCH CHECKLIST: ${productName}

### 8 WEEKS BEFORE
- [ ] Define launch goals and success metrics
- [ ] Identify launch team and assign owners
- [ ] Build press list and media contacts
- [ ] Create launch landing page
- [ ] Set up analytics tracking
- [ ] Define pricing and packaging

### 4 WEEKS BEFORE
- [ ] Write press release
- [ ] Create demo video
- [ ] Prepare social media content
- [ ] Brief customer success team
- [ ] Set up support documentation
- [ ] Beta test with select users

### 2 WEEKS BEFORE
- [ ] Send press release to media
- [ ] Brief analysts and influencers
- [ ] Test all conversion flows
- [ ] Prepare FAQ document
- [ ] Schedule social posts
- [ ] Set up monitoring alerts

### LAUNCH WEEK
- [ ] Day 1: Publish blog post + social
- [ ] Day 1: Submit to Product Hunt
- [ ] Day 1: Email existing users
- [ ] Day 2: Follow up with press
- [ ] Day 3: Engage community
- [ ] Day 5: Publish case study

### POST-LAUNCH (First 30 days)
- [ ] Monitor key metrics daily
- [ ] Collect user feedback
- [ ] Fix critical bugs immediately
- [ ] Publish learnings post
- [ ] Plan iteration roadmap

### SUCCESS METRICS TO TRACK
Primary KPI:
Secondary KPIs:
Warning signs to watch:

### CONTINGENCY PLANS
If site goes down:
If major bug found:
If press doesn't cover:`,
      maxTokens: 2000
    });

    return { success: true, productName, launchDate, checklist: result?.output || '' };
  }
};
