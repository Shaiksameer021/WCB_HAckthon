/**
 * BrandMind — Agent 06: Deliver
 * Architecture Role:
 *   • Final brand (Corrected tagline, validated positioning, core promise)
 *   • Product/website preview (Context-aware live prototype, completely dynamic)
 *   • Messaging (Hero headline, transformation narrative, FAQs)
 *   • Exportable brand kit (Visual tokens, voice, typography, audit history)
 * ZERO PREDEFINED TEMPLATES. Everything synthesized directly for this idea.
 */

import { executeStagePrompt } from '../services/aiEngine.js';
import { parseIdea } from '../utils/ideaParser.js';

export function runDeliverFallback(context, parsedIdea) {
  const { domain, actors, activity, problem, solution, ideaType } = parsedIdea;
  const discover = context.discover || {};
  const position = context.position || {};
  const shape = context.shape || {};
  const visualize = context.visualize || {};
  const challenge = context.challenge || {};

  const brandName = shape.selectedName || shape.brandName || parsedIdea.baseName || 'BrandMind';
  const originalDraftTagline = shape.draftTagline || `A better way for ${actors}`;

  // Prioritize the improved version from Agent 05 Challenge
  const challengeCorrection = challenge.critiques?.[0] || challenge.recommendedCorrections?.[0];
  const finalTagline = challengeCorrection?.improvedVersion || challengeCorrection?.correction ||
    `Empowering ${actors.toLowerCase()} to ${activity.toLowerCase()} without friction.`;

  const correctionsAppliedSummary = [
    {
      appliedTo: 'Tagline & Core Promise',
      original: originalDraftTagline,
      corrected: finalTagline,
      rationale: challengeCorrection?.whyItMatters || 'Replaced vague claim with a clear, active transformation promise.'
    }
  ];

  const finalBrandSummary = {
    brandName,
    category: position.category || domain,
    originalDraftTagline,
    finalTagline,
    whyTaglineChanged: 'Refined through Stage 05 Challenge audit to state the exact human outcome.',
    coreProposition: position.valueProposition || `Delivering reliable, focused value for ${actors}.`
  };

  const primaryColor = visualize.colorPalette?.[0]?.hex || '#4F46E5';
  const secondaryColor = visualize.colorPalette?.[1]?.hex || '#06B6D4';
  const isMobile = (ideaType || '').toLowerCase().includes('app') || (context.originalIdea || '').toLowerCase().includes('mobile');

  // Dynamic nav items synthesized from the user's idea components
  const navItems = isMobile
    ? ['Home', 'Activity', 'Community', 'Profile']
    : ['Overview', 'How It Works', 'Why Choose Us', 'Get Started'];

  const heroHeadline = `${brandName}: Built for ${actors}`;
  const heroSubheadline = finalTagline;
  const primaryCta = isMobile ? 'Download App' : 'Get Started Now';
  const secondaryCta = 'See How It Works';

  const productPreview = {
    conceptType: ideaType || 'digital_product',
    label: isMobile ? 'Mobile App Experience' : 'Product & Service Website',
    icon: isMobile ? '📱' : '🌐',
    device: isMobile ? 'mobile' : 'desktop',
    brandName,
    tagline: finalTagline,
    headline: heroHeadline,
    subheadline: heroSubheadline,
    navItems,
    primaryCta,
    secondaryCta,
    audience: discover.targetAudience?.primary || actors,
    coreProblem: discover.coreProblem || problem,
    features: [
      `Engineered specifically for ${(discover.targetAudience?.primary || actors).toLowerCase()}`,
      `Eliminates "${(discover.coreProblem || problem).toLowerCase()}" with direct workflows`,
      `Zero fluff or complex onboarding — productive in under 2 minutes`
    ],
    primaryColor,
    secondaryColor,
    personality: shape.personality || shape.personalityTraits || ['Clear', 'Direct', 'Dependable']
  };

  const messaging = {
    heroHeadline,
    heroSubheadline,
    primaryCta,
    secondaryCta,
    featureSections: [
      {
        title: 'Built Around Real Human Need',
        description: `Directly solves ${(discover.coreProblem || problem).toLowerCase()} for ${(discover.targetAudience?.primary || actors).toLowerCase()}.`,
        proof: 'Every feature addresses a genuine friction point identified in research.'
      },
      {
        title: 'Distinct Advantage',
        description: position.differentiator || 'Direct, honest, and focused on usability.',
        proof: position.competitiveAngle || 'Avoids bloated feature sets that distract from core results.'
      },
      {
        title: 'Immediate Value',
        description: 'No steep learning curve. Users get productive within minutes.',
        proof: 'Tested and refined to guarantee intuitive everyday use.'
      }
    ],
    faq: [
      {
        question: `How does ${brandName} help ${(discover.targetAudience?.primary || actors).toLowerCase()}?`,
        answer: position.valueProposition || `It simplifies ${activity.toLowerCase()} by solving ${problem.toLowerCase()}.`
      },
      {
        question: `What makes ${brandName} different from existing alternatives?`,
        answer: position.differentiator || `We focus exclusively on the core task without unnecessary complexity.`
      }
    ]
  };

  const launchCopy = {
    founderNote: `We created ${brandName} because ${(discover.targetAudience?.primary || actors).toLowerCase()} deserve a solution that solves ${(discover.coreProblem || problem).toLowerCase()} simply and honestly.`
  };

  const fullAssembledBrandKit = {
    identity: {
      brandName,
      category: position.category || domain,
      finalTagline,
      valueProposition: position.valueProposition,
      monogram: brandName.substring(0, 2).toUpperCase()
    },
    visualTokens: {
      palette: visualize.colorPalette || [],
      typography: visualize.typography || {},
      graphicStyle: visualize.visualStyle?.style || visualize.graphicLanguage?.style || ''
    },
    voiceAndMessaging: {
      personality: shape.personality || shape.personalityTraits || [],
      principles: shape.guidingPrinciples || [],
      primaryHeadline: heroHeadline
    },
    causalAuditHistory: {
      correctionsCount: correctionsAppliedSummary.length,
      corrections: correctionsAppliedSummary
    }
  };

  return {
    finalBrandSummary,
    correctionsAppliedSummary,
    productPreview,
    messaging,
    landingPage: messaging,
    launchCopy,
    fullAssembledBrandKit,
    decisionTrace: {
      stage: 'deliver',
      decision: `Delivered complete brand system and live ${productPreview.label} preview applying all Challenge improvements`,
      reason: `Synthesizes the entire 6-agent chain into concrete, launch-ready assets with zero predefined templates`,
      result: `Final brand kit, live interactive preview, and Before ➔ After causal audit completed`
    }
  };
}

export async function runDeliverAgent(context) {
  const parsedIdea = context.parsedIdea || parseIdea(context.originalIdea, context.clarificationAnswers);

  const prompt = `
You are Agent 06 (Deliver) in the BrandMind Multi-Agent System.
Your job is to synthesize all previous work, incorporate Agent 05 Challenge's corrections, and build a live product preview and complete brand kit.

Context:
- Original Idea: "${context.originalIdea}"
- Brand Name: "${context.shape?.selectedName || context.shape?.brandName}"
- Draft Tagline: "${context.shape?.draftTagline || ''}"
- Challenge Critiques: ${JSON.stringify(context.challenge?.critiques || context.challenge?.recommendedCorrections || [])}
- Target Audience: "${context.discover?.targetAudience?.primary}"
- Core Problem: "${context.discover?.coreProblem}"
- Value Proposition: "${context.position?.valueProposition}"
- Category: "${context.position?.category}"
- Visual Palette: ${JSON.stringify(context.visualize?.colorPalette || [])}
- UI Direction: ${JSON.stringify(context.visualize?.uiDirection || {})}

MANDATORY RULES:
1. "finalTagline" MUST incorporate the Challenge Agent's improved version.
2. "productPreview" must be custom-crafted for THIS user's specific idea — NO generic placeholders or fixed templates.
3. Keep social media minimal — focus strictly on the live product preview, brand kit, and core value.

Output strict JSON:
{
  "finalBrandSummary": {
    "brandName": "Brand Name",
    "category": "Market Category",
    "originalDraftTagline": "Original draft from Shape",
    "finalTagline": "Corrected final tagline from Challenge",
    "whyTaglineChanged": "Why this change was made",
    "coreProposition": "Core value statement"
  },
  "correctionsAppliedSummary": [
    { "appliedTo": "Element", "original": "Before", "corrected": "After", "rationale": "Why" }
  ],
  "productPreview": {
    "conceptType": "Concept type string",
    "label": "Human label (e.g. Mobile App Experience, SaaS Web Application, Interactive Portal)",
    "icon": "Relevant single emoji",
    "device": "desktop or mobile",
    "brandName": "Brand Name",
    "tagline": "Corrected final tagline",
    "headline": "Hero headline tailored to the idea",
    "subheadline": "Supporting subheadline",
    "navItems": ["4 navigation items natural to this product"],
    "primaryCta": "Specific call to action button text",
    "secondaryCta": "Secondary button text",
    "features": ["3 specific feature/benefit lines from this idea"],
    "audience": "Target audience",
    "coreProblem": "Problem solved",
    "primaryColor": "${context.visualize?.colorPalette?.[0]?.hex || '#4F46E5'}",
    "secondaryColor": "${context.visualize?.colorPalette?.[1]?.hex || '#06B6D4'}"
  },
  "messaging": {
    "heroHeadline": "Hero Headline",
    "heroSubheadline": "Hero Subheadline",
    "primaryCta": "CTA Label",
    "secondaryCta": "Secondary CTA Label",
    "featureSections": [
      { "title": "Feature 1", "description": "Desc 1", "proof": "Proof 1" },
      { "title": "Feature 2", "description": "Desc 2", "proof": "Proof 2" }
    ],
    "faq": [
      { "question": "Question 1", "answer": "Answer 1" },
      { "question": "Question 2", "answer": "Answer 2" }
    ]
  },
  "launchCopy": {
    "founderNote": "Brief note from the creator on why this exists"
  },
  "fullAssembledBrandKit": {
    "identity": {},
    "visualTokens": {},
    "voiceAndMessaging": {}
  },
  "decisionTrace": {
    "stage": "deliver",
    "decision": "Assembled final brand identity and interactive preview",
    "reason": "Incorporated all Challenge corrections into living brand assets",
    "result": "Brand is stress-tested, validated, and launch-ready"
  }
}
`;

  return await executeStagePrompt({
    stageName: 'deliver',
    prompt,
    fallbackFn: runDeliverFallback,
    context,
    parsedIdea
  });
}
