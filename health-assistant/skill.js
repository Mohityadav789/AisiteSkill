// aistie-skills/health-assistant/skill.js
// Personal Health Assistant
// IMPORTANT: Always recommends professional consultation for medical decisions

module.exports = {

  async analyzeMetrics({ age, weight, height, gender, activityLevel = 'moderate', goals = [] }, execute) {
    const heightCm = typeof height === 'string' && height.includes('ft')
      ? parseFloat(height) * 30.48
      : parseFloat(height);
    const weightKg = typeof weight === 'string' && weight.includes('lb')
      ? parseFloat(weight) * 0.453592
      : parseFloat(weight);

    const bmi = weightKg / ((heightCm / 100) ** 2);
    const bmr = gender?.toLowerCase() === 'female'
      ? 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * parseInt(age))
      : 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * parseInt(age));

    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, very_active: 1.9
    };
    const tdee = bmr * (activityMultipliers[activityLevel] || 1.55);

    const search = await execute('web:search', {
      query: 'personalized health recommendations BMI ' + bmi.toFixed(1) + ' age ' + age + ' wellness 2025',
      count: 4
    });
    const healthData = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a certified health and wellness advisor. Give evidence-based, personalized health insights.
ALWAYS include: "This is for educational purposes only. Consult a healthcare professional for medical decisions."
Be specific and actionable, not generic.`,
      prompt: `Analyze health metrics:
Age: ${age} | Gender: ${gender} | Weight: ${weightKg.toFixed(1)}kg | Height: ${heightCm.toFixed(0)}cm
BMI: ${bmi.toFixed(1)} | BMR: ${bmr.toFixed(0)} cal | TDEE: ${tdee.toFixed(0)} cal
Activity: ${activityLevel} | Goals: ${goals.join(', ')}

Health research: ${healthData}

## PERSONAL HEALTH ANALYSIS

### Key Metrics
BMI: ${bmi.toFixed(1)} — Category: [Underweight/Normal/Overweight/Obese]
BMR: ${bmr.toFixed(0)} calories/day (base metabolic rate)
TDEE: ${tdee.toFixed(0)} calories/day (to maintain current weight)

### Goal-Based Calorie Targets
To lose 0.5kg/week: ${(tdee - 500).toFixed(0)} calories/day
To maintain: ${tdee.toFixed(0)} calories/day
To gain 0.5kg/week: ${(tdee + 500).toFixed(0)} calories/day

### Health Assessment
Strengths (based on metrics):
Areas to focus on:

### Personalized Recommendations
1. Nutrition: [specific to their metrics]
2. Exercise: [specific to their level and goals]
3. Lifestyle: [sleep, stress, hydration]
4. Priority focus: [most important thing to change]

### Warning Signs to Watch
(symptoms or metrics that should prompt doctor visit)

⚠️ This analysis is for educational purposes only. Please consult a healthcare professional before making significant changes to your diet or exercise routine.`,
      maxTokens: 1500
    });

    return {
      success: true,
      metrics: {
        bmi: parseFloat(bmi.toFixed(1)),
        bmr: parseFloat(bmr.toFixed(0)),
        tdee: parseFloat(tdee.toFixed(0)),
        bmiCategory: bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'
      },
      analysis: result?.output || '',
      disclaimer: 'For educational purposes only. Consult a healthcare professional for medical decisions.'
    };
  },

  async generateMealPlan({ calories, goal = 'balanced', dietType = 'omnivore', allergies = [], days = 7 }, execute) {
    const search = await execute('web:search', {
      query: `${dietType} meal plan ${calories} calories ${goal} nutrition 2025`,
      count: 5
    });
    const nutrition = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a registered dietitian. Create practical, delicious meal plans with exact macro breakdowns.`,
      prompt: `Create a ${days}-day meal plan:
Daily calories: ${calories}
Goal: ${goal}
Diet type: ${dietType}
Allergies/restrictions: ${allergies.join(', ') || 'none'}
Nutrition research: ${nutrition}

## ${days}-DAY MEAL PLAN (${calories} cal/day)

### Macro Split
Protein: Xg (X%) | Carbs: Xg (X%) | Fat: Xg (X%)

### DAY 1
**Breakfast** (Xcal): [Meal name]
- Ingredients: [with portions]
- Prep time: X min
- Macros: P:Xg C:Xg F:Xg

**Lunch** (Xcal): [Meal name]
[same format]

**Dinner** (Xcal): [Meal name]
[same format]

**Snacks** (Xcal): [Options]

Daily total: Xcal | P:Xg C:Xg F:Xg

[Continue for all ${days} days]

### Weekly Shopping List
Proteins:
Vegetables:
Fruits:
Grains:
Dairy/Alternatives:
Pantry:

### Meal Prep Strategy
What to prep Sunday:
Time required: X hours`,
      maxTokens: 3000
    });

    return { success: true, calories, goal, dietType, mealPlan: result?.output || '' };
  },

  async generateWorkoutPlan({ fitnessLevel = 'beginner', goal = 'general fitness', daysPerWeek = 4, equipment = 'gym', limitations = [] }, execute) {
    const search = await execute('web:search', {
      query: `${fitnessLevel} ${goal} workout plan ${daysPerWeek} days ${equipment} 2025`,
      count: 5
    });
    const fitnessData = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a certified personal trainer. Create progressive, safe, effective workout plans.`,
      prompt: `Create workout plan:
Level: ${fitnessLevel} | Goal: ${goal}
Days/week: ${daysPerWeek} | Equipment: ${equipment}
Limitations: ${limitations.join(', ') || 'none'}
Research: ${fitnessData}

## ${daysPerWeek}-DAY WORKOUT PLAN

### Program Overview
Goal: ${goal}
Progression model: [how it gets harder over time]
Duration: X weeks before reassessing

### Day 1: [Focus — e.g. Upper Body Push]
**Warm-up (5-10 min)**
- [Exercise] × [duration]

**Main Workout**
| Exercise | Sets | Reps | Rest | Notes |
|----------|------|------|------|-------|
| [Exercise] | 3 | 8-12 | 60s | [form cue] |
(8-10 exercises)

**Cool-down (5-10 min)**

[Continue for all ${daysPerWeek} days]

### Progression Rules
Week 1-2: [starting weights/intensity]
Week 3-4: [how to progress]
When to increase: [specific rule]

### Key Exercises to Master
1. [Exercise] — Why it's important — Common mistakes:
2.
3.

### Recovery Guidelines
Sleep: X hours minimum
Nutrition timing: [pre/post workout]
Active recovery days: [what to do]`,
      maxTokens: 2500
    });

    return { success: true, fitnessLevel, goal, daysPerWeek, workoutPlan: result?.output || '' };
  },

  async wellnessAdvice({ concern, lifestyle = {}, age = '', gender = '' }, execute) {
    const search = await execute('web:search', {
      query: concern + ' evidence based wellness advice research 2025',
      count: 6
    });
    const evidence = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a holistic wellness advisor. Give evidence-based advice. Always recommend professional consultation for serious concerns. Be specific and practical.`,
      prompt: `Wellness advice for: "${concern}"
Age: ${age || 'not specified'} | Gender: ${gender || 'not specified'}
Lifestyle: ${JSON.stringify(lifestyle) || 'not specified'}
Evidence: ${evidence}

## WELLNESS ADVICE: ${concern}

### Understanding the Issue
What's happening and why:
Contributing factors:

### Evidence-Based Interventions
1. [Intervention] — Evidence level: Strong/Moderate/Emerging
   How to implement:
   Timeline to see results:

2. [Intervention] — Evidence level:
3.

### Lifestyle Changes (ranked by impact)
Highest impact: [change] — How to start:
Medium impact: [change]
Low hanging fruit: [easy wins]

### What Research Shows
[Specific studies/findings — be honest about certainty level]

### Warning Signs
See a doctor if:
Urgent: seek immediate care if:

### Tracking Progress
What to monitor:
How to know it's working:

⚠️ This information is educational. Please consult a qualified healthcare provider for personalized medical advice.`,
      maxTokens: 1500
    });

    return {
      success: true,
      concern,
      advice: result?.output || '',
      disclaimer: 'Educational purposes only. Consult a healthcare professional.'
    };
  },

  async trackSymptoms({ symptoms = [], duration = '', severity = 5, otherFactors = [] }, execute) {
    const search = await execute('web:search', {
      query: symptoms.join(' ') + ' symptoms causes when to see doctor 2025',
      count: 5
    });
    const medData = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are a health information assistant. Provide general information only — NEVER diagnose.
Always emphasize seeing a doctor for medical concerns. Severity assessment is not medical advice.`,
      prompt: `Help understand these symptoms:
Symptoms: ${symptoms.join(', ')}
Duration: ${duration}
Severity (1-10): ${severity}
Other factors: ${otherFactors.join(', ')}
General health data: ${medData}

## SYMPTOM INFORMATION

### General Information About These Symptoms
Common causes (NOT a diagnosis):

### Severity Assessment
Based on described severity and duration:
Monitoring level: Can monitor at home / Should see doctor soon / Seek urgent care

### When to See a Doctor
See a doctor if:
- Duration exceeds:
- Severity reaches:
- You also have:
- Warning signs:

### Immediate Care Situations
Go to emergency if:

### Self-Care While Monitoring (if appropriate)
1.
2.
3.

### Tracking Template
Track daily: [symptoms, severity 1-10, triggers, relief methods]
Bring this to your doctor:

⚠️ IMPORTANT: This is general health information only, NOT medical advice or diagnosis. Please consult a qualified healthcare professional for proper evaluation and treatment. If you have severe symptoms, seek emergency care immediately.`,
      maxTokens: 1200
    });

    return {
      success: true,
      symptoms,
      information: result?.output || '',
      disclaimer: 'NOT medical advice. Consult a healthcare professional immediately for any medical concerns.'
    };
  }
};
