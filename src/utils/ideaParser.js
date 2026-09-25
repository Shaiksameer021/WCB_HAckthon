/**
 * BrandMind — Dynamic Semantic Idea Ingestion
 * Architecture:
 *   User enters ANY idea
 *          ↓
 *      Gemini API
 *          ↓
 *   Structured JSON:
 *   {
 *     ideaType,
 *     problem,
 *     targetAudience,
 *     userNeed,
 *     solution,
 *     category,
 *     differentiation,
 *     brandDirection,
 *     domain,
 *     actors,
 *     activity,
 *     desiredOutcome,
 *     score,
 *     ...
 *   }
 *          ↓
 *   Agent 1 — Discover
 *          ↓
 *   Agent 2 — Position
 *          ↓
 *   Agent 3 — Shape
 *          ↓
 *   Agent 4 — Visualize
 *          ↓
 *   Agent 5 — Challenge
 *          ↓
 *   Agent 6 — Deliver
 *
 * NO HARDCODED ARCHETYPES, NO PREDEFINED DOMAIN TEMPLATES.
 */

import { executeStagePrompt } from '../services/aiEngine.js';

export function isIdeaThin(idea = '') {
  const clean = idea.trim().replace(/\s+/g, ' ');
  const words = clean ? clean.split(' ').filter(Boolean) : [];
  return words.length < 9;
}

/**
 * 100% Dynamic Linguistic Extractor (Offline / Fallback)
 * Derives meaning purely from the user's actual words.
 * Zero hardcoded domains, zero predefined archetypes.
 */
export function parseIdea(idea = '', clarificationAnswer = '') {
  const rawText = idea.trim();
  const wordCount = rawText ? rawText.split(/\s+/).filter(Boolean).length : 0;
  const isThin = wordCount < 9;

  // Clean conversational filler
  const ideaClean = rawText
    .replace(/^i (want|need|would like) to (create|build|make|develop|design)?\s*/gi, '')
    .replace(/^an? (app|platform|tool|service|product|website) (that|to|for)\s*/gi, '')
    .trim();

  const coreText = ideaClean || rawText;
  const words = coreText.split(/\s+/).filter(w => w.length > 2);

  // Dynamic noun / verb extraction
  const actors = words.length >= 2
    ? `${words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase()}s & Related Communities`
    : 'Early Adopters & Core Users';

  const activity = words.length >= 3
    ? `${words.slice(1, 4).join(' ').toLowerCase()} with zero hassle`
    : 'Getting core tasks done simply and reliably';

  const problem = words.length >= 3
    ? `Existing ways to ${words.slice(0, 3).join(' ').toLowerCase()} are fragmented, expensive, or overly complicated`
    : 'Lack of an intuitive, dedicated solution designed around real daily workflows';

  const userNeed = `A focused, accessible tool that removes unnecessary steps and delivers instant results`;
  const solution = `A streamlined experience purpose-built for ${coreText}`;
  const category = words.length > 0 ? `${words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase()} Innovation` : 'Specialized Product';
  const differentiation = `Designed exclusively around ${coreText}, avoiding bloated multi-purpose toolkits`;
  const brandDirection = `Clear, human, friendly, and focused on transparent utility`;
  const domain = words.length > 0 ? `${words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase()} & Related Services` : 'Modern Services';
  const desiredOutcome = `Effortless results without technical friction or steep learning curves`;
  const plainSummary = `A simple, better way to ${coreText}.`;

  // Dynamic base name generated directly from the user's words
  const baseName = words.length >= 2
    ? words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase() + words[1].charAt(0).toUpperCase() + words[1].slice(1).toLowerCase()
    : words.length === 1
      ? words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase() + 'ly'
      : 'Brand';

  // Dynamic scoring based on user text specifics
  const clarity = Math.min(96, Math.max(70, 72 + wordCount * 2));
  const marketNeed = Math.min(95, Math.max(72, 78 + (coreText.length > 25 ? 8 : 0)));
  const originality = Math.min(94, Math.max(70, 75 + (words.length > 4 ? 8 : 0)));
  const launchEase = Math.min(92, Math.max(70, 78 + (wordCount <= 15 ? 8 : 0)));
  const overall = Math.round((clarity + marketNeed + originality + launchEase) / 4);

  const score = {
    overall,
    rating: overall >= 90 ? 'Strong Concept' : overall >= 80 ? 'Promising Idea' : 'Solid Start',
    clarity,
    marketNeed,
    originality,
    launchEase,
    verdict: `Clear target problem and audience. The core premise is specific and immediately understandable.`
  };

  const suggestedQuestions = isThin ? [
    `Who is the primary person who will use this every single day?`,
    `What is the single biggest headache they face today that this solves?`
  ] : [];

  return {
    ideaType: 'digital_or_physical_concept',
    problem,
    targetAudience: actors,
    userNeed,
    solution,
    category,
    differentiation,
    brandDirection,
    domain,
    actors,
    activity,
    desiredOutcome,
    plainSummary,
    baseName,
    score,
    isThin,
    wordCount,
    originalIdea: rawText,
    clarificationAnswer,
    suggestedQuestions
  };
}

/**
 * Real AI Semantic Ingestion
 * User enters ANY idea → Gemini API → Structured JSON
 */
export async function parseIdeaWithAI(originalIdea = '', clarificationAnswers = '') {
  const syncFallback = parseIdea(originalIdea, clarificationAnswers);

  const prompt = `
You are the Semantic Ingestion Engine in BrandMind.
The user has entered a raw idea. Your job is to analyze it deeply and transform it into a rich, structured JSON semantic blueprint.
You must work for ANY valid idea (app, SaaS, physical product, service, local community project, food business, education, healthcare, finance, hardware, etc.).
NEVER force it into a fixed template or preconceived brand. Analyze THIS exact user input.

User Idea: "${originalIdea}"
${clarificationAnswers ? `User Clarification Answers: "${clarificationAnswers}"` : ''}

Output strict JSON with this exact schema:
{
  "ideaType": "Categorization of what this actually is (e.g. mobile_app, saas, physical_product, food_business, marketplace, service, community_service, education, healthcare, finance_tool, etc.)",
  "problem": "The exact, real-world headache or friction being solved in 1 plain sentence",
  "targetAudience": "The specific primary audience who urgently needs this",
  "userNeed": "What the user emotionally and practically wants",
  "solution": "How this specific idea solves the problem",
  "category": "The market category in plain terms",
  "differentiation": "What makes this genuinely different from conventional options",
  "brandDirection": "Tonal and visual direction appropriate for this domain",
  "domain": "Domain space name (e.g. Urban Gardening, Freelance Finance, Senior Care)",
  "actors": "Specific people involved (e.g. Independent Chefs & Food Lovers)",
  "activity": "What they do with it",
  "desiredOutcome": "What success looks like for the user",
  "plainSummary": "A clear, exciting 1-sentence explanation in everyday English",
  "baseName": "A catchy, short candidate root name inspired by the idea",
  "score": {
    "overall": 88,
    "rating": "High Potential",
    "clarity": 90,
    "marketNeed": 92,
    "originality": 84,
    "launchEase": 86,
    "verdict": "Honest 1-sentence evaluation of why this idea has traction"
  },
  "suggestedQuestions": [
    "One diagnostic question to sharpen the target if ambiguous",
    "One diagnostic question regarding the core interaction"
  ]
}
`;

  try {
    const { result } = await executeStagePrompt({
      stageName: 'semantic_ingestion',
      prompt,
      fallbackFn: () => syncFallback,
      context: { originalIdea, clarificationAnswers },
      parsedIdea: syncFallback
    });

    return {
      ...syncFallback,
      ...result,
      originalIdea,
      clarificationAnswers,
      isThin: isIdeaThin(originalIdea)
    };
  } catch (err) {
    console.warn('[BrandMind] Semantic ingestion fallback:', err);
    return syncFallback;
  }
}
