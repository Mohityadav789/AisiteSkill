// aistie-skills/lead-generation/skill.js
// Lead Generation Engine
// CRITICAL RULE: One domain = one company. Never scrape multiple pages as separate leads.

const SKIP_DOMAINS = [
  'justdial', 'indiamart', 'sulekha', 'designrush', 'clutch.co',
  'goodfirms', 'quora', 'yellowpages', 'tradeindia', 'bark.com',
  'sortlist', 'linkedin.com', 'facebook.com', 'twitter.com',
  'instagram.com', 'wikipedia.org', 'youtube.com', 'amazon',
  'flipkart', 'zomato', 'swiggy', 'google.com', 'yelp.com',
  'trustpilot', 'glassdoor', 'indeed.com', 'naukri.com'
];

const EMAIL_SKIP = [
  'example', 'placeholder', 'youremail', 'email@', 'sentry',
  'wixpress', 'domain.com', 'test@', 'noreply', 'no-reply',
  'support@wix', 'admin@wordpress', 'user@'
];

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

function isSkippable(url) {
  try {
    const h = new URL(url).hostname.toLowerCase();
    return SKIP_DOMAINS.some(d => h.includes(d));
  } catch (e) { return true; }
}

function getDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); }
  catch (e) { return ''; }
}

function cleanCompanyName(rawTitle, domain) {
  if (!rawTitle) return domainToName(domain);
  let name = rawTitle
    .replace(/\s*[|\-–—].*$/, '')
    .replace(/official website/gi, '')
    .replace(/home page/gi, '')
    .replace(/welcome to /gi, '')
    .replace(/(pvt\.?\s*ltd\.?|limited|llp|inc\.?)/gi, '')
    .trim();

  const badPatterns = [
    'about', 'news', 'blog', 'contact', 'home', 'welcome',
    'services', 'products', 'portfolio', 'team', 'careers',
    'we are', 'our mission', 'passionate', 'disclosures',
    'research', 'privacy', 'terms', 'faq', 'help', 'error',
    '404', 'page not found'
  ];

  const isBad = badPatterns.some(p => name.toLowerCase().startsWith(p))
    || name.length > 60 || name.length < 2;

  return isBad ? domainToName(domain) : name;
}

function domainToName(domain) {
  return domain.split('.')[0]
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

function extractEmail(content) {
  const emails = (content || '').match(EMAIL_REGEX) || [];
  return emails.find(e => !EMAIL_SKIP.some(p => e.toLowerCase().includes(p))) || null;
}

module.exports = {

  // ── FIND LEADS: Core lead finding function ──────────────────────────────
  async findLeads({ industry, city, country = 'IN', count = 8, onProgress }, execute) {
    const searchResult = await execute('web:search', {
      query: industry + ' ' + city + ' official website company',
      count: 25,
      location: country
    });

    if (!searchResult?.results?.length) {
      return { success: false, leads: [], error: 'No search results found' };
    }

    const leads = [];
    const visitedDomains = new Set(); // ONE domain = ONE company

    for (const result of searchResult.results) {
      if (leads.length >= count) break;
      if (!result.url?.startsWith('http') || isSkippable(result.url)) continue;

      const domain = getDomain(result.url);
      if (!domain || visitedDomains.has(domain)) continue;

      // Mark domain as visited BEFORE fetching — prevents any subpage duplicates
      visitedDomains.add(domain);

      if (onProgress) onProgress(`Checking ${domain}... (${leads.length + 1}/${count})`);

      // Always fetch HOMEPAGE only — never the search result URL directly
      const homepageUrl = 'https://' + domain;
      let page = null;
      try {
        page = await execute('web:fetch', { url: homepageUrl });
      } catch (e) {}

      if (!page?.content) continue;

      // Get REAL company name from page title — not from search result
      const companyName = cleanCompanyName(page.title, domain);

      // Try homepage for email
      let email = extractEmail(page.content);
      let emailType = 'verified';

      // Try /contact page (same domain — NOT a new company)
      if (!email) {
        try {
          const contactPage = await execute('web:fetch', { url: homepageUrl + '/contact' });
          if (contactPage) email = extractEmail(contactPage.content);
          if (email) emailType = 'verified';
        } catch (e) {}
      }

      // Try /about page (same domain — NOT a new company)
      if (!email) {
        try {
          const aboutPage = await execute('web:fetch', { url: homepageUrl + '/about' });
          if (aboutPage) email = extractEmail(aboutPage.content);
          if (email) emailType = 'verified';
        } catch (e) {}
      }

      // Try /contact-us
      if (!email) {
        try {
          const contactUs = await execute('web:fetch', { url: homepageUrl + '/contact-us' });
          if (contactUs) email = extractEmail(contactUs.content);
          if (email) emailType = 'verified';
        } catch (e) {}
      }

      // Fallback to guessed email
      if (!email) {
        email = 'info@' + domain;
        emailType = 'guessed';
      }

      leads.push({
        name: companyName,
        domain,
        website: homepageUrl,
        email,
        emailType,       // 'verified' = green badge, 'guessed' = yellow badge
        snippet: result.snippet || '',
        foundAt: new Date().toISOString()
      });
    }

    return {
      success: true,
      leads,
      total: leads.length,
      industry,
      city
    };
  },

  // ── ENRICH LEAD: Get more info about one company ────────────────────────
  async enrichLead({ domain, companyName }, execute) {
    const [homepage, linkedinSearch, newsSearch] = await Promise.all([
      execute('web:fetch', { url: 'https://' + domain }).catch(() => null),
      execute('web:search', { query: companyName + ' company size employees founded', count: 3 }).catch(() => null),
      execute('web:search', { query: companyName + ' news recent 2024 2025', count: 3 }).catch(() => null)
    ]);

    const context = [
      homepage?.content?.slice(0, 2000) || '',
      (linkedinSearch?.results || []).map(r => r.snippet).join('\n'),
      (newsSearch?.results || []).map(r => r.snippet).join('\n')
    ].join('\n\n');

    const result = await execute('ai:generate', {
      systemPrompt: 'You are a business analyst. Extract company information. Return ONLY JSON, no markdown.',
      prompt: `Extract info about "${companyName}" (${domain}):\n\n${context}\n\nReturn JSON: { "industry": "", "size": "", "founded": "", "services": [], "location": "", "techStack": [], "painPoints": [], "decisionMaker": "", "buyingSignals": "" }`,
      maxTokens: 500
    });

    let enriched = {};
    try {
      enriched = JSON.parse((result?.output || '{}').replace(/```json|```/g, '').trim());
    } catch (e) {
      enriched = { industry: 'Unknown', size: 'Unknown' };
    }

    return {
      success: true,
      domain,
      companyName,
      enriched
    };
  },

  // ── SCORE LEADS: Rank leads by fit ──────────────────────────────────────
  async scoreLeads({ leads, idealCustomerProfile = '' }, execute) {
    const leadsText = leads.map((l, i) =>
      `${i + 1}. ${l.name} (${l.domain}) — ${l.snippet}`
    ).join('\n');

    const result = await execute('ai:generate', {
      systemPrompt: 'You are a sales qualification expert. Score leads 1-10. Be honest.',
      prompt: `Score these leads for fit.\n\nIdeal Customer: ${idealCustomerProfile || 'B2B company that needs digital services'}\n\nLeads:\n${leadsText}\n\nFor each lead return:\n[#]. [Name] — Score: X/10 — Reason: [why] — Priority: High/Medium/Low`,
      maxTokens: 800
    });

    return {
      success: true,
      scores: result?.output || '',
      leads
    };
  },

  // ── BUILD OUTREACH: Personalized email for each lead ───────────────────
  async buildOutreach({ lead, yourService, yourName, tone = 'professional' }, execute) {
    const result = await execute('ai:generate', {
      systemPrompt: `You are a cold email expert. Write emails that get replies.
Rules: Short (under 120 words), specific, one clear CTA, NO generic phrases like "I hope this email finds you well".`,
      prompt: `Write a cold outreach email to:
Company: ${lead.name}
Website: ${lead.website}
Context: ${lead.snippet || 'growing business'}

From: ${yourName}
Offering: ${yourService}
Tone: ${tone}

Write 3 variations:

VERSION 1 — Problem-focused:
Subject: ...
Body: ...

VERSION 2 — Curiosity-based:
Subject: ...
Body: ...

VERSION 3 — Direct value:
Subject: ...
Body: ...`,
      maxTokens: 800
    });

    return {
      success: true,
      lead,
      emailVariations: result?.output || ''
    };
  },

  // ── FULL CRM WORKFLOW: Find → Sheet → Email → Calendar ─────────────────
  async fullCRMWorkflow({ industry, city, yourService, yourName, emailTemplate, sheetTitle }, execute) {
    const results = {
      leads: [],
      sheetUrl: '',
      emailsSent: 0,
      calendarEvents: 0,
      errors: []
    };

    // Step 1: Find leads
    const leadsResult = await module.exports.findLeads(
      { industry, city, count: 8 },
      execute
    );

    if (!leadsResult.success || !leadsResult.leads.length) {
      return { success: false, error: 'No leads found', results };
    }

    results.leads = leadsResult.leads;

    // Step 2: Create Google Sheet
    let spreadsheetId = null;
    try {
      const sheet = await execute('sheets:create', {
        title: sheetTitle || `${industry} Leads — ${city}`,
        headers: ['Company', 'Email', 'Website', 'Email Type', 'Status', 'Follow Up Date', 'Notes']
      });
      if (sheet?.spreadsheetId) {
        spreadsheetId = sheet.spreadsheetId;
        results.sheetUrl = sheet.url;
      }
    } catch (e) {
      results.errors.push('Sheet creation failed: ' + e.message);
    }

    // Step 3: Process each lead
    for (const lead of results.leads) {
      // Send email
      try {
        const personalizedEmail = (emailTemplate || `Hi,\n\nI came across ${lead.name} and wanted to reach out about ${yourService}.\n\nWould you be open to a quick 15-minute call?\n\nBest,\n${yourName}`)
          .replace(/\{\{company\}\}/g, lead.name)
          .replace(/\{\{name\}\}/g, yourName || 'Team');

        await execute('email:send', {
          to: lead.email,
          subject: `Quick question for ${lead.name}`,
          body: personalizedEmail
        });
        results.emailsSent++;
        lead.status = 'Email Sent';
      } catch (e) {
        lead.status = 'Email Failed';
        results.errors.push(`Email to ${lead.email}: ${e.message}`);
      }

      // Save to sheet
      if (spreadsheetId) {
        const followUpDate = new Date();
        followUpDate.setDate(followUpDate.getDate() + 3);
        const dateStr = followUpDate.toISOString().split('T')[0];

        try {
          await execute('sheets:append', {
            spreadsheetId,
            rows: [[
              lead.name,
              lead.email,
              lead.website,
              lead.emailType,
              lead.status,
              dateStr,
              lead.snippet?.slice(0, 100) || ''
            ]]
          });
        } catch (e) {
          results.errors.push(`Sheet append for ${lead.name}: ${e.message}`);
        }

        // Create calendar follow-up
        try {
          await execute('calendar:create-event', {
            title: `Follow up: ${lead.name}`,
            description: `Check reply from ${lead.email}. Sent outreach about ${yourService}.`,
            date: dateStr,
            time: '10:00',
            reminder: true
          });
          results.calendarEvents++;
        } catch (e) {
          results.errors.push(`Calendar for ${lead.name}: ${e.message}`);
        }
      }
    }

    return {
      success: true,
      results,
      summary: `Found ${results.leads.length} leads, sent ${results.emailsSent} emails, created ${results.calendarEvents} follow-up reminders. Sheet: ${results.sheetUrl}`
    };
  }
};
