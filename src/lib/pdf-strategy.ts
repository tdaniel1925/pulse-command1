/**
 * PDF Generation for Brand Strategy Plan
 * Creates a professional PDF with cover page and full strategy document
 */

export interface BrandStrategyPlan {
  clientId: string;
  businessName?: string;
  businessOverview: {
    whatYouDo: string;
    whoYouServe: string;
    uniqueValueProp: string;
  };
  targetAudience: {
    demographics: string;
    painPoints: string[];
    goals: string[];
  };
  contentStrategy: {
    pillars: string[];
    pillarDescriptions: Record<string, string>;
    rationale: string;
  };
  channelStrategy: {
    channels: string[];
    channelRationale: Record<string, string>;
    postingFrequency: string;
    bestTimes: string;
  };
  toneAndVoice: {
    personality: string;
    voiceGuidance: string;
    doList: string[];
    dontList: string[];
    examplePhrases: string[];
  };
  successMetrics: {
    engagementTargets: string;
    timelineExpectations: string;
    keyIndicators: string[];
  };
}

/**
 * Generate HTML for PDF (can be converted to PDF with external service)
 * This is the full document ready for printing/conversion
 */
export function generateStrategyPDF(
  strategy: BrandStrategyPlan,
  logoUrl?: string
): string {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Brand Strategy Plan - ${strategy.businessName || 'Strategy'}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: A4;
      margin: 0;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: white;
    }

    .page {
      page-break-after: always;
      width: 100%;
      height: 100vh;
      padding: 60px 40px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }

    /* Cover Page */
    .cover-page {
      background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
      color: white;
      text-align: center;
      padding: 80px 40px;
    }

    .logo-container {
      margin-bottom: 60px;
    }

    .logo {
      max-width: 120px;
      height: auto;
      filter: brightness(0) invert(1);
    }

    .cover-page h1 {
      font-size: 3.5em;
      font-weight: 800;
      margin-bottom: 20px;
      letter-spacing: -1px;
    }

    .cover-page .subtitle {
      font-size: 1.5em;
      opacity: 0.95;
      margin-bottom: 60px;
      font-weight: 300;
    }

    .business-name {
      font-size: 2.2em;
      font-weight: 600;
      margin-bottom: 30px;
      background: rgba(255, 255, 255, 0.2);
      padding: 20px 40px;
      border-radius: 12px;
      display: inline-block;
    }

    .cover-footer {
      margin-top: 80px;
      padding-top: 40px;
      border-top: 2px solid rgba(255, 255, 255, 0.3);
      font-size: 0.9em;
      opacity: 0.9;
    }

    .cover-footer p {
      margin: 5px 0;
    }

    /* Content Pages */
    .content-page {
      background: white;
      color: #333;
      padding: 60px 50px;
    }

    h1 {
      font-size: 2.5em;
      color: #1a1a1a;
      margin-bottom: 30px;
      border-bottom: 4px solid #6366f1;
      padding-bottom: 15px;
    }

    h2 {
      font-size: 2em;
      color: #4f46e5;
      margin-top: 40px;
      margin-bottom: 25px;
    }

    h3 {
      font-size: 1.2em;
      color: #666;
      margin-top: 20px;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      font-weight: 600;
    }

    p {
      margin-bottom: 15px;
      line-height: 1.8;
    }

    ul, ol {
      margin-left: 20px;
      margin-bottom: 15px;
    }

    li {
      margin-bottom: 8px;
      line-height: 1.7;
    }

    .section {
      margin-bottom: 40px;
      page-break-inside: avoid;
    }

    .highlight-box {
      background: #f0f9ff;
      border-left: 4px solid #6366f1;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }

    .highlight-box strong {
      color: #4f46e5;
    }

    .pillars-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 20px 0;
    }

    .pillar {
      background: #f9fafb;
      border-left: 4px solid #6366f1;
      padding: 15px;
      border-radius: 4px;
    }

    .pillar h4 {
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 8px;
    }

    .do-dont {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin: 20px 0;
    }

    .do-list, .dont-list {
      page-break-inside: avoid;
    }

    .do-list h4 {
      color: #15803d;
      font-weight: 700;
      margin-bottom: 12px;
    }

    .dont-list h4 {
      color: #991b1b;
      font-weight: 700;
      margin-bottom: 12px;
    }

    .do-list li:before {
      content: "✓ ";
      color: #15803d;
      font-weight: bold;
    }

    .dont-list li:before {
      content: "✗ ";
      color: #991b1b;
      font-weight: bold;
    }

    .quote {
      font-style: italic;
      color: #6366f1;
      font-size: 1.1em;
      font-weight: 600;
      margin: 15px 0;
      padding: 15px;
      background: #f9fafb;
      border-radius: 4px;
    }

    .metrics-list {
      list-style: none;
      padding: 0;
    }

    .metrics-list li {
      background: #f9fafb;
      padding: 12px 15px;
      margin-bottom: 10px;
      border-radius: 4px;
      border-left: 3px solid #6366f1;
    }

    .metrics-list li:before {
      content: "→ ";
      color: #6366f1;
      font-weight: bold;
      margin-right: 8px;
    }

    .footer {
      margin-top: 60px;
      padding-top: 30px;
      border-top: 1px solid #e5e7eb;
      font-size: 0.85em;
      color: #9ca3af;
      text-align: center;
    }

    /* Print optimizations */
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .page {
        page-break-after: always;
        margin: 0;
        padding: 0;
      }
    }
  </style>
</head>
<body>

  <!-- COVER PAGE -->
  <div class="page cover-page">
    ${logoUrl ? `
      <div class="logo-container">
        <img src="${logoUrl}" alt="Logo" class="logo">
      </div>
    ` : ''}

    <h1>Brand Strategy Plan</h1>
    <div class="subtitle">Your Personalized Content & Marketing Strategy</div>

    ${strategy.businessName ? `
      <div class="business-name">${strategy.businessName}</div>
    ` : ''}

    <div class="cover-footer">
      <p><strong>Generated:</strong> ${today}</p>
      <p><strong>By:</strong> PulseCommand AI</p>
      <p style="margin-top: 20px; opacity: 0.8;">This strategy is tailored to your business based on your brand interview.</p>
    </div>
  </div>

  <!-- BUSINESS OVERVIEW -->
  <div class="page content-page">
    <h1>Business Overview</h1>

    <div class="section">
      <h3>What You Do</h3>
      <p>${strategy.businessOverview.whatYouDo}</p>
    </div>

    <div class="section">
      <h3>Who You Serve</h3>
      <p>${strategy.businessOverview.whoYouServe}</p>
    </div>

    <div class="section">
      <h3>Unique Value Proposition</h3>
      <div class="highlight-box">
        <p><strong>${strategy.businessOverview.uniqueValueProp}</strong></p>
      </div>
    </div>
  </div>

  <!-- TARGET AUDIENCE -->
  <div class="page content-page">
    <h1>Target Audience</h1>

    <div class="section">
      <h3>Demographics</h3>
      <p>${strategy.targetAudience.demographics}</p>
    </div>

    <div class="section">
      <h3>Pain Points</h3>
      <ul>
        ${strategy.targetAudience.painPoints.map(point => `<li>${point}</li>`).join('')}
      </ul>
    </div>

    <div class="section">
      <h3>Their Goals</h3>
      <ul>
        ${strategy.targetAudience.goals.map(goal => `<li>${goal}</li>`).join('')}
      </ul>
    </div>
  </div>

  <!-- CONTENT STRATEGY -->
  <div class="page content-page">
    <h1>Content Strategy: 5 Pillars</h1>

    <p>${strategy.contentStrategy.rationale}</p>

    <div class="pillars-grid">
      ${strategy.contentStrategy.pillars.map(pillar => `
        <div class="pillar">
          <h4>${pillar}</h4>
          <p>${strategy.contentStrategy.pillarDescriptions[pillar]}</p>
        </div>
      `).join('')}
    </div>
  </div>

  <!-- CHANNEL STRATEGY -->
  <div class="page content-page">
    <h1>Channel Strategy</h1>

    <div class="section">
      <h3>Primary Channels</h3>
      <ul>
        ${strategy.channelStrategy.channels.map(ch => `<li><strong>${ch}</strong></li>`).join('')}
      </ul>
    </div>

    <div class="section">
      <h3>Posting Frequency</h3>
      <p>${strategy.channelStrategy.postingFrequency}</p>
    </div>

    <div class="section">
      <h3>Best Times to Post</h3>
      <p>${strategy.channelStrategy.bestTimes}</p>
    </div>
  </div>

  <!-- TONE & VOICE -->
  <div class="page content-page">
    <h1>Tone & Voice Guide</h1>

    <div class="section">
      <h3>Brand Personality</h3>
      <div class="quote">"${strategy.toneAndVoice.personality}"</div>
    </div>

    <div class="section">
      <h3>Voice Guidance</h3>
      <p>${strategy.toneAndVoice.voiceGuidance}</p>
    </div>

    <div class="do-dont">
      <div class="do-list">
        <h4>Do's ✓</h4>
        <ul>
          ${strategy.toneAndVoice.doList.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>

      <div class="dont-list">
        <h4>Don'ts ✗</h4>
        <ul>
          ${strategy.toneAndVoice.dontList.map(item => `<li>${item}</li>`).join('')}
        </ul>
      </div>
    </div>

    <div class="section">
      <h3>Example Phrases</h3>
      ${strategy.toneAndVoice.examplePhrases.map(phrase => `
        <div class="quote">"${phrase}"</div>
      `).join('')}
    </div>
  </div>

  <!-- SUCCESS METRICS -->
  <div class="page content-page">
    <h1>Success Metrics & Timeline</h1>

    <div class="section">
      <h3>Engagement Targets</h3>
      <p>${strategy.successMetrics.engagementTargets}</p>
    </div>

    <div class="section">
      <h3>Timeline & Expectations</h3>
      <p>${strategy.successMetrics.timelineExpectations}</p>
    </div>

    <div class="section">
      <h3>Key Performance Indicators</h3>
      <ul class="metrics-list">
        ${strategy.successMetrics.keyIndicators.map(indicator => `<li>${indicator}</li>`).join('')}
      </ul>
    </div>

    <div class="footer">
      <p>This strategy is your roadmap for the next 90 days. Review it regularly and adjust based on performance.</p>
      <p style="margin-top: 15px;">Generated by <strong>PulseCommand</strong> • ${today}</p>
    </div>
  </div>

</body>
</html>
  `;
}
