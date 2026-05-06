// aistie-skills/ai-transformation/skill.js
// AI Transformation Discovery Tool
// Inspired by glebis/claude-skills discovery skill
// Frameworks: BCG 10/20/70, Andrew Ng, Deloitte AI Maturity

module.exports = {

  async assessMaturity({ company, industry, size = '', currentAIUse = '', challenges = [] }, execute) {
    const search = await execute('web:search', {
      query: industry + ' AI adoption maturity challenges opportunities 2025',
      count: 6
    });
    const benchmarks = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are an AI transformation consultant from McKinsey. Use Deloitte AI Maturity Model and Andrew Ng's AI Transformation Playbook.`,
      prompt: `Assess AI maturity for: "${company}"
Industry: ${industry}
Size: ${size || 'not specified'}
Current AI use: ${currentAIUse || 'minimal'}
Challenges: ${challenges.join(', ') || 'not specified'}
Industry benchmarks: ${benchmarks}

## AI MATURITY ASSESSMENT

### Maturity Score: X/5
Level: Experimenting / Developing / Defined / Managed / Optimizing

### Scoring Breakdown (Deloitte AI Maturity Model)
| Dimension | Score | Assessment |
|-----------|-------|------------|
| Strategy & Leadership | X/5 | ... |
| Data & Technology | X/5 | ... |
| Talent & Culture | X/5 | ... |
| Process & Operations | X/5 | ... |
| Ethics & Governance | X/5 | ... |

### Where You Are vs Industry
Industry average: X/5
Your score: X/5
Gap: X levels

### Biggest Strengths
1.
2.

### Critical Gaps Holding You Back
1. Gap: — Impact: — Fix:
2.
3.

### Quick Wins (implement in 30 days)
1.
2.
3.

### 12-Month AI Transformation Roadmap
Phase 1 (0-3 months):
Phase 2 (3-6 months):
Phase 3 (6-12 months):

### Resource Requirements
People: (roles to hire/train)
Technology: (tools/platforms needed)
Budget estimate: (rough range)`,
      maxTokens: 2000
    });

    return { success: true, company, industry, assessment: result?.output || '' };
  },

  async buildStrategy({ company, industry, goals = [], budget = '', timeline = '12 months' }, execute) {
    const search = await execute('web:search', {
      query: industry + ' AI strategy implementation best practices 2025 ROI',
      count: 6
    });
    const data = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are an AI strategy consultant. Use Andrew Ng's AI Transformation Playbook and BCG's 10/20/70 framework (10% algorithms, 20% technology, 70% people/process).`,
      prompt: `Build AI transformation strategy for "${company}" in ${industry}:
Goals: ${goals.join(', ')}
Budget: ${budget || 'not specified'}
Timeline: ${timeline}
Industry data: ${data}

## AI TRANSFORMATION STRATEGY

### Vision Statement
Where AI will take this company in 3 years:

### Strategic Objectives (using OKR format)
Objective 1: [Business outcome]
- KR1: [Measurable result]
- KR2:

### BCG 10/20/70 Allocation
10% — Algorithms & Models:
- Which AI/ML technologies to use
- Build vs Buy decision

20% — Technology & Infrastructure:
- Data infrastructure needs
- Tools and platforms

70% — People & Process (most important):
- Culture change needed
- Training programs
- Process redesign
- Change management

### Priority Use Cases (ranked by ROI)
| Use Case | Effort | Impact | ROI | Priority |
|----------|--------|--------|-----|----------|
| ... | L/M/H | L/M/H | X% | 1 |

### Implementation Roadmap
Quarter 1: Foundation (data, team, pilot)
Quarter 2: First use cases live
Quarter 3: Scale what works
Quarter 4: Optimize and expand

### Success Metrics
How we know the strategy is working:

### Risk Mitigation
Top 3 risks and how to prevent them:`,
      maxTokens: 2000
    });

    return { success: true, company, strategy: result?.output || '' };
  },

  async identifyUseCases({ industry, department = 'all', painPoints = [], dataAvailable = [] }, execute) {
    const search = await execute('web:search', {
      query: industry + ' AI use cases ROI implementation examples 2025',
      count: 8
    });
    const examples = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are an AI use case expert. Identify practical, high-ROI AI applications. Be specific — not "use AI for customer service" but "deploy GPT-4 chatbot to handle 70% of tier-1 support tickets."`,
      prompt: `Identify AI use cases for ${industry} ${department !== 'all' ? '— ' + department : ''}:
Pain points: ${painPoints.join(', ')}
Data available: ${dataAvailable.join(', ')}
Industry examples: ${examples}

## AI USE CASE CATALOG

### HIGH IMPACT — QUICK WIN (start here)
Use Case 1: [Specific name]
- What it does: [specific description]
- Technology: [GPT-4/vision/custom model/etc]
- Data needed: [what data required]
- Implementation time: X weeks
- Expected ROI: X%
- Difficulty: Low/Medium/High

(5-6 high-impact quick wins)

### HIGH IMPACT — STRATEGIC (plan for these)
(3-4 larger transformational use cases)

### AVOID (common mistakes in your industry)
1. [Use case that sounds good but rarely works] — Why:
2.

### RECOMMENDED PILOT PROJECT
The single best place to start:
Why: (highest chance of success + visible impact)
Success metrics: (how to know it worked)
Timeline: X weeks
Budget estimate: $X-X`,
      maxTokens: 2000
    });

    return { success: true, industry, department, useCases: result?.output || '' };
  },

  async calculateROI({ useCase, implementation = {}, timeframe = '12 months' }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are an AI ROI analyst. Give realistic, conservative estimates. Show your math. Avoid hype.`,
      prompt: `Calculate ROI for AI use case: "${useCase}"
Implementation details: ${JSON.stringify(implementation)}
Timeframe: ${timeframe}

## AI ROI ANALYSIS: ${useCase}

### Investment Required
| Cost Item | One-time | Monthly | Annual |
|-----------|----------|---------|--------|
| Software/API | $X | $X | $X |
| Implementation | $X | - | - |
| Training | $X | - | - |
| Maintenance | - | $X | $X |
| **Total** | **$X** | **$X** | **$X** |

### Expected Benefits
| Benefit | Calculation | Annual Value |
|---------|-------------|--------------|
| Time saved | X hours × $Y/hour | $Z |
| Error reduction | X% fewer errors × $Y cost | $Z |
| Revenue increase | X% improvement × $Y revenue | $Z |
| **Total Benefits** | | **$X** |

### ROI Calculation
ROI = (Benefits - Costs) / Costs × 100
Year 1: X%
Year 2: X%
Year 3: X%
Payback period: X months

### Break-even Analysis
Month X: costs and benefits equal
After month X: net positive

### Conservative vs Optimistic Scenarios
Conservative (50% of expected): $X ROI
Realistic (75% of expected): $X ROI
Optimistic (100% of expected): $X ROI

### Non-Financial Benefits
(employee satisfaction, competitive advantage, etc)`,
      maxTokens: 1500
    });

    return { success: true, useCase, roi: result?.output || '' };
  },

  async changeManagement({ company, changeType, affectedTeams = [], resistance = [], timeline = '' }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are a change management expert trained in Kotter's 8-Step Model and ADKAR framework.`,
      prompt: `Create change management plan for "${company}" implementing: "${changeType}"
Affected teams: ${affectedTeams.join(', ')}
Expected resistance: ${resistance.join(', ')}
Timeline: ${timeline}

## CHANGE MANAGEMENT PLAN

### Change Impact Assessment
Who is affected and how:
Magnitude of change: Low/Medium/High/Transformational

### ADKAR Analysis
Awareness — Do they know why? Current state: X/5
Desire — Do they want to change? X/5
Knowledge — Do they know how? X/5
Ability — Can they do it? X/5
Reinforcement — Will it stick? X/5

### Resistance Analysis
| Resistance | Root Cause | How to Address |
|------------|------------|----------------|
${resistance.map(r => `| ${r} | ... | ... |`).join('\n')}

### Communication Plan
Week 1: (who says what to whom)
Month 1:
Ongoing:

### Training Plan
Who needs training:
Training format:
Timeline:
Success criteria:

### Champions and Change Agents
Who to identify as internal champions:
How to empower them:

### Success Metrics
Adoption rate target: X% by [date]
How to measure:

### Kotter's 8 Steps Applied
1. Create urgency:
2. Build coalition:
3. Form strategic vision:
4. Enlist volunteers:
5. Enable action:
6. Generate wins:
7. Sustain acceleration:
8. Institute change:`,
      maxTokens: 2000
    });

    return { success: true, company, changeType, plan: result?.output || '' };
  }
};
