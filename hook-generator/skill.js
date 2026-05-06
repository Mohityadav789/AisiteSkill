// aistie-skills/hook-generator/skill.js
// Hook Generator — 5 frameworks, scroll-stopping hooks

module.exports = {

  // ── GENERATE HOOKS: 25+ hooks across 5 frameworks ──────────────────────
  async generateHooks({ topic, platform = 'instagram', audience = 'general', niche = '', count = 5 }, execute) {
    // Get real-world hook examples for context
    const search = await execute('web:search', {
      query: 'viral hooks examples ' + platform + ' ' + niche + ' best performing 2025',
      count: 5
    });
    const hookExamples = (search?.results || []).map(r => r.snippet).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: `You are the world's best hook writer. You've written hooks that generated 100M+ views.
RULES:
- Every hook must stop scroll in 1-3 seconds
- Be specific — use numbers, names, surprising facts
- Sound human — not like AI wrote it
- Test your hooks: would YOU stop scrolling for this?
- NEVER start with "I", "Are you", "Do you", "Have you"`,
      prompt: `Write ${count} hooks per framework for topic: "${topic}"
Platform: ${platform} | Audience: ${audience} | Niche: ${niche || 'general'}

Viral hook context: ${hookExamples}

═══════════════════════════════════════
FRAMEWORK 1 — PAS (Problem → Agitate → Solution)
Focus: Lead with their exact painful problem
═══════════════════════════════════════
${Array.from({length: count}, (_, i) => `Hook ${i+1}: `).join('\n')}

═══════════════════════════════════════
FRAMEWORK 2 — AIDA (Attention → Interest → Desire → Action)
Focus: Bold statement that demands attention
═══════════════════════════════════════
${Array.from({length: count}, (_, i) => `Hook ${i+1}: `).join('\n')}

═══════════════════════════════════════
FRAMEWORK 3 — BAB (Before → After → Bridge)
Focus: Paint the transformation
═══════════════════════════════════════
${Array.from({length: count}, (_, i) => `Hook ${i+1}: `).join('\n')}

═══════════════════════════════════════
FRAMEWORK 4 — STAR (Situation → Task → Action → Result)
Focus: Story-based, result-first
═══════════════════════════════════════
${Array.from({length: count}, (_, i) => `Hook ${i+1}: `).join('\n')}

═══════════════════════════════════════
FRAMEWORK 5 — SLAY (Shocking → Lesson → Action → You)
Focus: Shocking stat or hot take
═══════════════════════════════════════
${Array.from({length: count}, (_, i) => `Hook ${i+1}: `).join('\n')}

═══════════════════════════════════════
🏆 TOP 5 HOOKS OVERALL
(highest scroll-stop probability — ready to copy-paste)
═══════════════════════════════════════
1.
2.
3.
4.
5.

📊 A/B TEST RECOMMENDATION
Test these two head-to-head: [Hook #] vs [Hook #]
Why: (reason)`,
      maxTokens: 1500
    });

    return {
      success: true,
      topic,
      platform,
      audience,
      hooks: result?.output || ''
    };
  },

  // ── REWRITE HOOK: Make any weak hook stronger ────────────────────────────
  async rewriteHook({ weakHook, platform = 'instagram', reason = '' }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are a hook editor. Diagnose what's wrong and fix it precisely.
Be direct — don't sugarcoat bad hooks. Be specific about improvements.`,
      prompt: `Rewrite this weak hook for ${platform}:
"${weakHook}"
${reason ? 'Why it's failing: ' + reason : ''}

## DIAGNOSIS
What's wrong with this hook:
- Problem 1:
- Problem 2:
- Problem 3:

## REWRITES (5 improved versions)

Version 1 — PAS angle:
Version 2 — Shock/Curiosity:
Version 3 — Specific number:
Version 4 — Hot take:
Version 5 — Story-based:

## BEST REWRITE
(with explanation of why it works better)

## BEFORE vs AFTER
Original: "${weakHook}"
Best rewrite: [version]
Improvement: X% more likely to stop scroll because...`,
      maxTokens: 800
    });

    return {
      success: true,
      original: weakHook,
      rewrites: result?.output || ''
    };
  },

  // ── HOOK FOR PLATFORM: Platform-specific hooks ───────────────────────────
  async hookForPlatform({ topic, platforms = ['instagram', 'linkedin', 'twitter', 'youtube', 'email'], audience = '' }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are a platform-specific content expert.
Each platform has DIFFERENT hook rules — Instagram ≠ LinkedIn ≠ YouTube ≠ Email.
Write hooks that fit the platform's culture and algorithm.`,
      prompt: `Write platform-optimized hooks for: "${topic}"
Audience: ${audience || 'general'}

For each platform, write 3 hooks that fit that platform specifically:

📸 INSTAGRAM (3 hooks)
Rules: First line visible before "more" — must create curiosity OR immediate value
[Platform uses emojis, short punchy lines, emotional hooks]
Hook 1:
Hook 2:
Hook 3:

💼 LINKEDIN (3 hooks)
Rules: Professional but not boring. Data and stories win. No fluff.
[First line = bold statement or counterintuitive insight]
Hook 1:
Hook 2:
Hook 3:

🐦 TWITTER/X (3 hooks)
Rules: Under 100 chars for hook. Controversial or extremely useful.
[Hot takes and data points win]
Hook 1:
Hook 2:
Hook 3:

📺 YOUTUBE (3 hooks)
Rules: Title + Thumbnail hook combo. Promise specific result.
[Numbers and "How I" hooks dominate]
Hook 1 (title):
Hook 2 (title):
Hook 3 (title):

📧 EMAIL (3 hooks)
Rules: Subject line = hook. Curiosity gap or specific benefit.
[Lowercase often outperforms. Short wins.]
Hook 1 (subject):
Hook 2 (subject):
Hook 3 (subject):`,
      maxTokens: 1200
    });

    return {
      success: true,
      topic,
      hooks: result?.output || ''
    };
  },

  // ── VIRAL HOOK FORMULAS: Proven templates to fill in ───────────────────
  async viralHookFormulas({ topic, niche = 'general' }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are a viral content researcher. Apply proven formulas to specific topics.`,
      prompt: `Apply these 20 viral hook formulas to the topic: "${topic}" (niche: ${niche})

Fill in each formula with specific, compelling content:

1. "I [did X] for [time period] and here's what happened:"
→

2. "[Number] things [audience] wish they knew about [topic]:"
→

3. "Stop [common behavior]. Here's why:"
→

4. "Nobody talks about this, but [surprising truth about topic]:"
→

5. "The [adjective] truth about [topic] that [authority] won't tell you:"
→

6. "I went from [bad state] to [good state] in [timeframe]. Here's how:"
→

7. "[Number]% of [audience] make this [topic] mistake:"
→

8. "Unpopular opinion: [controversial take on topic]"
→

9. "The [topic] advice I wish I got [time] ago:"
→

10. "This [topic] changed my [life/business/results]:"
→

11. "Why [common approach to topic] doesn't work anymore:"
→

12. "The only [topic] guide you'll ever need:"
→

13. "Hot take: [bold statement about topic]"
→

14. "[Famous person/brand] [topic] secret that nobody noticed:"
→

15. "I've [done topic thing] [X] times. Here's the pattern:"
→

## TOP 5 FORMULAS FOR THIS TOPIC
(which formulas work best for "${topic}" and why)`,
      maxTokens: 1500
    });

    return {
      success: true,
      topic,
      niche,
      formulas: result?.output || ''
    };
  }
};
