// /**
//  * BrandMind — Agent 03: Shape
//  * Architecture Role:
//  *   • Brand name
//  *   • Tagline
//  *   • Personality
//  *   • Voice
//  * Translates Discover and Position insights into living brand assets.
//  */

// import { executeStagePrompt } from '../services/aiEngine.js';
// import { parseIdea } from '../utils/ideaParser.js';

// export function runShapeFallback(context, parsedIdea) {
//   const discover = context.discover || {};
//   const position = context.position || {};
//   const audience = discover.targetAudience?.primary || parsedIdea.actors || 'Users';
//   const coreProblem = discover.coreProblem || parsedIdea.problem || 'friction';

//   const brandName = parsedIdea.baseName || 'BrandMind';
//   const draftTagline = `The simplest way for ${audience.toLowerCase()} to succeed without ${coreProblem.toLowerCase()}.`;

//   const personality = [
//     'Empathetic & Attentive',
//     'Clear & Unpretentious',
//     'Practical & Dependable'
//   ];

//   const voice = {
//     tone: `Warm, direct, and conversational — like a competent colleague explaining something simply.`,
//     rules: {
//       do: [
//         'Use plain, active verbs that respect the user’s time',
//         'Speak directly to the user as "you"',
//         'State concrete facts and real-world outcomes'
//       ],
//       dont: [
//         'Never use corporate buzzwords like "synergy", "paradigm", or "revolutionary"',
//         'Avoid passive sentences that obscure who is doing what',
//         'Never make hyperbolic claims that cannot be proven'
//       ]
//     }
//   };

//   const guidingPrinciples = [
//     `Solve the user's real daily pain (${coreProblem.toLowerCase()}) before adding new bells and whistles.`,
//     `Speak with complete transparency: clear pricing, clear language, clear outcomes.`,
//     `Respect the intelligence and time of ${audience.toLowerCase()} in every touchpoint.`
//   ];

//   return {
//     brandName,
//     selectedName: brandName,
//     draftTagline,
//     personality,
//     personalityTraits: personality,
//     voice,
//     voiceAndStyle: {
//       tone: voice.tone,
//       personalityTraits: personality
//     },
//     guidingPrinciples,
//     messageHierarchy: {
//       primaryHeadline: `${brandName}: Built for ${audience}`,
//       subheadline: draftTagline,
//       keyProofPoints: [
//         `Laser-focused on solving "${coreProblem.toLowerCase()}"`,
//         `Intuitive from minute one — zero steep onboarding curve`,
//         `Built around real ${audience.toLowerCase()} feedback`
//       ]
//     },
//     decisionTrace: {
//       stage: 'shape',
//       decision: `Shaped the brand as "${brandName}" with draft tagline "${draftTagline}"`,
//       reason: `Name is derived directly from the concept core; voice prioritizes clarity over corporate jargon`,
//       result: `Delivered name, tagline, personality, and voice rules to Visualize and Challenge agents`
//     }
//   };
// }

// export async function runShapeAgent(context) {
//   const parsedIdea = context.parsedIdea || parseIdea(context.originalIdea, context.clarificationAnswers);

//   const prompt = `
// You are Agent 03 (Shape) in the BrandMind Multi-Agent System.
// Your job is to give this brand its human form: its name, tagline, personality, and voice.

// Context:
// - Idea: "${context.originalIdea}"
// - Audience: "${context.discover?.targetAudience?.primary || parsedIdea.actors}"
// - Core Problem: "${context.discover?.coreProblem || parsedIdea.problem}"
// - Category: "${context.position?.category || parsedIdea.category}"
// - Value Proposition: "${context.position?.valueProposition}"
// - Differentiator: "${context.position?.differentiator}"

// RESPONSIBILITIES:
// 1. Brand Name: Create a punchy, memorable, modern name (1-2 words max). Avoid generic buzzwords.
// 2. Tagline: An initial draft tagline (this will be stress-tested by Agent 05 Challenge).
// 3. Personality: 3 distinct character traits that define how the brand acts.
// 4. Voice: Tone definition and clear DOs / DONTs for writing copy.

// Output strict JSON:
// {
//   "brandName": "A catchy, modern name (e.g. Lumio, ToolNest, LedgerFlow)",
//   "selectedName": "Same as brandName",
//   "draftTagline": "A clear, active draft tagline summarizing the primary benefit",
//   "personality": ["Trait 1", "Trait 2", "Trait 3"],
//   "personalityTraits": ["Trait 1", "Trait 2", "Trait 3"],
//   "voice": {
//     "tone": "Description of voice tone in everyday words",
//     "rules": {
//       "do": ["Do rule 1", "Do rule 2"],
//       "dont": ["Dont rule 1", "Dont rule 2"]
//     }
//   },
//   "guidingPrinciples": ["Principle 1", "Principle 2", "Principle 3"],
//   "messageHierarchy": {
//     "primaryHeadline": "Hero headline for the concept",
//     "subheadline": "Supporting subhead",
//     "keyProofPoints": ["Proof point 1", "Proof point 2", "Proof point 3"]
//   },
//   "decisionTrace": {
//     "stage": "shape",
//     "decision": "Brand name, tagline, and personality established",
//     "reason": "Why these choices emotionally connect with the target audience",
//     "result": "Passed to Visualize for visual branding and Challenge for critique"
//   }
// }
// `;

//   return await executeStagePrompt({
//     stageName: 'shape',
//     prompt,
//     fallbackFn: runShapeFallback,
//     context,
//     parsedIdea
//   });
// }

/**
 * BrandMind — Agent 03: Shape
 *
 * Architecture Role:
 *   • Brand name
 *   • Alternative naming directions
 *   • Tagline
 *   • Personality
 *   • Anti-traits
 *   • Brand principles
 *   • Voice
 *   • Messaging hierarchy
 *
 * IMPORTANT:
 * This file must return ONE consistent schema for both:
 *   1. Gemini success
 *   2. Fallback mode
 *
 * The UI depends on this exact contract.
 */

import { executeStagePrompt } from '../services/aiEngine.js';
import { parseIdea } from '../utils/ideaParser.js';

/* =========================================================
   SMALL UTILITIES
   ========================================================= */

/**
 * Safely convert any value to a usable string.
 */
function toText(value, fallback = '') {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => toText(item))
      .filter(Boolean)
      .join(', ');
  }

  if (value && typeof value === 'object') {
    if (typeof value.name === 'string') return value.name.trim();
    if (typeof value.text === 'string') return value.text.trim();
    if (typeof value.value === 'string') return value.value.trim();
  }

  return fallback;
}

/**
 * Convert an array into a clean string array.
 */
function cleanStringArray(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => toText(item))
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Convert naming direction objects into the UI format.
 *
 * Expected:
 * [
 *   {
 *     name: "...",
 *     style: "..."
 *   }
 * ]
 */
function cleanNamingDirections(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === 'string') {
        return {
          name: item.trim(),
          style: 'Concept direction'
        };
      }

      if (!item || typeof item !== 'object') return null;

      const name = toText(
        item.name || item.title || item.label
      );

      const style = toText(
        item.style ||
        item.direction ||
        item.rationale ||
        item.reason,
        'Concept direction'
      );

      if (!name) return null;

      return {
        name,
        style
      };
    })
    .filter(Boolean);
}

/**
 * Clean personality traits.
 */
function cleanTraits(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (typeof item === 'string') return item.trim();

      if (item && typeof item === 'object') {
        return toText(
          item.trait ||
          item.name ||
          item.label ||
          item.value
        );
      }

      return '';
    })
    .filter(Boolean);
}

/**
 * Clean voice rules.
 */
function cleanVoiceRules(value) {
  const source = value && typeof value === 'object'
    ? value
    : {};

  return {
    do: cleanStringArray(
      source.do ||
      source.dos ||
      source.positive ||
      []
    ),

    dont: cleanStringArray(
      source.dont ||
      source.donts ||
      source.negative ||
      []
    )
  };
}

/**
 * Extract a few useful words from the original idea.
 *
 * This is ONLY used for fallback naming.
 * It does not claim these words are market facts.
 */
function extractIdeaWords(idea) {
  const stopWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'for',
    'to',
    'of',
    'in',
    'on',
    'with',
    'that',
    'this',
    'is',
    'are',
    'be',
    'from',
    'by',
    'it',
    'its',
    'their',
    'they',
    'them',
    'help',
    'helps',
    'want',
    'create',
    'creating',
    'make',
    'makes',
    'app',
    'application',
    'platform',
    'service',
    'system',
    'tool'
  ]);

  return String(idea || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/gi, ' ')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(
      (word) =>
        word.length >= 4 &&
        !stopWords.has(word)
    )
    .slice(0, 8);
}

/**
 * Convert a phrase into a readable title.
 */
function titleCase(value) {
  return String(value || '')
    .split(/\s+/)
    .filter(Boolean)
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1)
    )
    .join(' ');
}

/* =========================================================
   FALLBACK
   ========================================================= */

/**
 * Idea-grounded fallback.
 *
 * IMPORTANT:
 * Do NOT use generic startup templates here.
 *
 * The previous fallback generated:
 *
 * "The simplest way for X to succeed without Y..."
 *
 * That was responsible for malformed output such as:
 *
 * "without existing ways to wellness app..."
 *
 * This fallback now stays close to the actual idea.
 */
export function runShapeFallback(context, parsedIdea = {}) {
  const originalIdea = String(
    context?.originalIdea || ''
  ).trim();

  const discover = context?.discover || {};
  const position = context?.position || {};

  const ideaWords = extractIdeaWords(originalIdea);

  /* ---------------------------------------------------------
     NAME
     --------------------------------------------------------- */

  let brandName =
    toText(parsedIdea?.baseName) ||
    toText(context?.shape?.selectedName);

  if (!brandName && ideaWords.length > 0) {
    brandName = titleCase(
      ideaWords.slice(0, 2).join(' ')
    );
  }

  if (!brandName) {
    brandName = 'Brand Concept';
  }

  /* ---------------------------------------------------------
     TAGLINE
     --------------------------------------------------------- */

  /*
   * Never manufacture a fake problem statement.
   *
   * If we have a useful value proposition from Position,
   * use it.
   *
   * Otherwise describe the concept directly.
   */

  const valueProposition = toText(
    position.valueProposition
  );

  const discoverSummary = toText(
    discover.plainSummary
  );

  let draftTagline = '';

  if (valueProposition) {
    draftTagline = valueProposition;
  } else if (discoverSummary) {
    draftTagline = discoverSummary;
  } else if (originalIdea) {
    /*
     * Use the original idea rather than inventing
     * a market problem.
     */
    draftTagline =
      originalIdea.length > 120
        ? `${originalIdea.slice(0, 117).trim()}...`
        : originalIdea;
  } else {
    draftTagline = 'A brand shaped around the idea.';
  }

  /* ---------------------------------------------------------
     PERSONALITY
     --------------------------------------------------------- */

  /*
   * Fallback personality is derived from the actual concept
   * where possible instead of returning the same three traits
   * for every idea.
   */

  const personality = [];

  const ideaLower = originalIdea.toLowerCase();

  if (
    ideaLower.includes('learn') ||
    ideaLower.includes('education') ||
    ideaLower.includes('student') ||
    ideaLower.includes('course')
  ) {
    personality.push(
      'Encouraging',
      'Clear',
      'Approachable'
    );
  } else if (
    ideaLower.includes('community') ||
    ideaLower.includes('neighbor') ||
    ideaLower.includes('local') ||
    ideaLower.includes('share')
  ) {
    personality.push(
      'Welcoming',
      'Trustworthy',
      'Practical'
    );
  } else if (
    ideaLower.includes('food') ||
    ideaLower.includes('restaurant') ||
    ideaLower.includes('bakery') ||
    ideaLower.includes('meal')
  ) {
    personality.push(
      'Inviting',
      'Warm',
      'Distinctive'
    );
  } else {
    /*
     * These are neutral descriptors rather than claims
     * about the market.
     */
    personality.push(
      'Clear',
      'Purposeful',
      'Approachable'
    );
  }

  /* ---------------------------------------------------------
     ANTI-TRAITS
     --------------------------------------------------------- */

  const traitsToAvoid = [
    'Unclear messaging',
    'Unnecessary complexity',
    'Generic language'
  ];

  /* ---------------------------------------------------------
     BRAND PRINCIPLES
     --------------------------------------------------------- */

  const brandPrinciples = [];

  if (originalIdea) {
    brandPrinciples.push(
      `Stay closely connected to the original idea: "${originalIdea}".`
    );
  }

  if (valueProposition) {
    brandPrinciples.push(
      `Make the core value easy to understand: "${valueProposition}".`
    );
  } else {
    brandPrinciples.push(
      'Explain the concept in plain, specific language.'
    );
  }

  brandPrinciples.push(
    'Avoid claims that the available information cannot support.'
  );

  /* ---------------------------------------------------------
     ALTERNATIVE NAMES
     --------------------------------------------------------- */

  const namingDirections = [];

  /*
   * Generate simple directions from words actually found
   * in the user's idea.
   */
  if (ideaWords.length >= 1) {
    namingDirections.push({
      name: titleCase(ideaWords[0]),
      style: 'Direct concept reference'
    });
  }

  if (ideaWords.length >= 2) {
    namingDirections.push({
      name: titleCase(
        `${ideaWords[0]} ${ideaWords[1]}`
      ),
      style: 'Descriptive combination'
    });
  }

  if (ideaWords.length >= 3) {
    namingDirections.push({
      name: titleCase(
        `${ideaWords[1]} ${ideaWords[2]}`
      ),
      style: 'Concept combination'
    });
  }

  /*
   * Remove duplicates.
   */
  const uniqueNames = [];
  const seenNames = new Set();

  for (const item of namingDirections) {
    const key = item.name.toLowerCase();

    if (
      !seenNames.has(key) &&
      key !== brandName.toLowerCase()
    ) {
      seenNames.add(key);
      uniqueNames.push(item);
    }
  }

  /* ---------------------------------------------------------
     VOICE
     --------------------------------------------------------- */

  const voiceRules = {
    do: [
      'Use clear language that is easy to understand.',
      'Describe the idea specifically rather than relying on buzzwords.',
      'Keep claims connected to what the concept actually provides.'
    ],

    dont: [
      'Do not exaggerate the value of the concept.',
      'Do not invent customer or market claims.',
      'Do not use unnecessary corporate or technical jargon.'
    ]
  };

  const voice = {
    tone:
      'Clear, natural, confident, and appropriate to the idea.',

    rules: voiceRules
  };

  /* ---------------------------------------------------------
     MESSAGE HIERARCHY
     --------------------------------------------------------- */

  const primaryHeadline =
    valueProposition ||
    discoverSummary ||
    brandName;

  const subheadline =
    draftTagline;

  const keyProofPoints = [];

  if (position.differentiator) {
    keyProofPoints.push(
      toText(position.differentiator)
    );
  }

  if (valueProposition) {
    keyProofPoints.push(
      valueProposition
    );
  }

  if (originalIdea) {
    keyProofPoints.push(
      `Built from the original concept: ${originalIdea}`
    );
  }

  /* ---------------------------------------------------------
     RESULT
     --------------------------------------------------------- */

  return {
    brandName,
    selectedName: brandName,

    draftTagline,

    namingDirections: uniqueNames,

    personality,
    personalityTraits: personality,

    traitsToAvoid,

    brandPrinciples,
    guidingPrinciples: brandPrinciples,

    voice,
    voiceAndStyle: {
      tone: voice.tone,
      personalityTraits: personality
    },

    voiceRules,

    messageHierarchy: {
      primaryHeadline,
      subheadline,
      keyProofPoints: keyProofPoints
        .filter(Boolean)
        .slice(0, 3)
    },

    decisionTrace: {
      stage: 'shape',
      decision:
        `Created the initial brand direction for "${brandName}".`,

      reason:
        'The fallback uses information available in the original idea and previous stages without inventing unsupported market claims.',

      result:
        'Provided the brand name, naming directions, tagline, personality, principles, voice, and messaging for the next stages.'
    }
  };
}

/* =========================================================
   NORMALIZATION
   ========================================================= */

/**
 * Normalize Gemini output into the exact structure
 * expected by App.jsx.
 *
 * This is important because Gemini may occasionally:
 * - omit a field
 * - rename a field
 * - return an object instead of an array
 * - return partial JSON
 */
function normalizeShapeResult(result, context, parsedIdea) {
  const source =
    result && typeof result === 'object'
      ? result
      : {};

  const fallback = runShapeFallback(
    context,
    parsedIdea
  );

  /* ---------------------------------------------------------
     BASIC FIELDS
     --------------------------------------------------------- */

  const brandName =
    toText(
      source.brandName ||
      source.selectedName
    ) ||
    fallback.brandName;

  const selectedName =
    toText(
      source.selectedName ||
      source.brandName
    ) ||
    brandName;

  const draftTagline =
    toText(source.draftTagline) ||
    fallback.draftTagline;

  /* ---------------------------------------------------------
     NAMING
     --------------------------------------------------------- */

  let namingDirections =
    cleanNamingDirections(
      source.namingDirections ||
      source.alternativeNames ||
      source.nameDirections
    );

  if (namingDirections.length === 0) {
    namingDirections =
      fallback.namingDirections;
  }

  /* ---------------------------------------------------------
     PERSONALITY
     --------------------------------------------------------- */

  let personalityTraits =
    cleanTraits(
      source.personalityTraits ||
      source.personality ||
      source.brandPersonality
    );

  if (personalityTraits.length === 0) {
    personalityTraits =
      fallback.personalityTraits;
  }

  /* ---------------------------------------------------------
     ANTI-TRAITS
     --------------------------------------------------------- */

  let traitsToAvoid =
    cleanTraits(
      source.traitsToAvoid ||
      source.antiTraits ||
      source.antiPersonality
    );

  if (traitsToAvoid.length === 0) {
    traitsToAvoid =
      fallback.traitsToAvoid;
  }

  /* ---------------------------------------------------------
     PRINCIPLES
     --------------------------------------------------------- */

  let brandPrinciples =
    cleanStringArray(
      source.brandPrinciples ||
      source.guidingPrinciples ||
      source.coreRules ||
      source.principles
    );

  if (brandPrinciples.length === 0) {
    brandPrinciples =
      fallback.brandPrinciples;
  }

  /* ---------------------------------------------------------
     VOICE
     --------------------------------------------------------- */

  const sourceVoice =
    source.voice &&
      typeof source.voice === 'object'
      ? source.voice
      : {};

  const voiceRules = cleanVoiceRules(
    source.voiceRules ||
    sourceVoice.rules ||
    source.voiceAndStyle?.rules
  );

  if (
    voiceRules.do.length === 0 &&
    voiceRules.dont.length === 0
  ) {
    voiceRules.do =
      fallback.voiceRules.do;

    voiceRules.dont =
      fallback.voiceRules.dont;
  }

  const voice = {
    tone:
      toText(
        sourceVoice.tone ||
        source.voiceTone ||
        source.voiceAndStyle?.tone
      ) ||
      fallback.voice.tone,

    rules: voiceRules
  };

  /* ---------------------------------------------------------
     MESSAGE HIERARCHY
     --------------------------------------------------------- */

  const sourceMessage =
    source.messageHierarchy &&
      typeof source.messageHierarchy === 'object'
      ? source.messageHierarchy
      : {};

  const messageHierarchy = {
    primaryHeadline:
      toText(
        sourceMessage.primaryHeadline ||
        sourceMessage.headline ||
        source.primaryHeadline
      ) ||
      fallback.messageHierarchy.primaryHeadline,

    subheadline:
      toText(
        sourceMessage.subheadline ||
        sourceMessage.subHead ||
        source.subheadline
      ) ||
      draftTagline,

    keyProofPoints:
      cleanStringArray(
        sourceMessage.keyProofPoints ||
        sourceMessage.proofPoints ||
        source.keyProofPoints
      ).slice(0, 3)
  };

  if (
    messageHierarchy.keyProofPoints.length === 0
  ) {
    messageHierarchy.keyProofPoints =
      fallback.messageHierarchy.keyProofPoints;
  }

  /* ---------------------------------------------------------
     DECISION TRACE
     --------------------------------------------------------- */

  const decisionTrace =
    source.decisionTrace &&
      typeof source.decisionTrace === 'object'
      ? {
        stage:
          toText(source.decisionTrace.stage) ||
          'shape',

        decision:
          toText(source.decisionTrace.decision) ||
          `Created the initial brand direction for "${brandName}".`,

        reason:
          toText(source.decisionTrace.reason) ||
          'Brand direction was derived from the available concept information.',

        result:
          toText(source.decisionTrace.result) ||
          'Passed the shaped brand direction to the following stages.'
      }
      : fallback.decisionTrace;

  /* ---------------------------------------------------------
     FINAL NORMALIZED OBJECT
     --------------------------------------------------------- */

  return {
    ...source,

    brandName,
    selectedName,

    draftTagline,

    namingDirections,

    personality: personalityTraits,
    personalityTraits,

    traitsToAvoid,

    brandPrinciples,
    guidingPrinciples: brandPrinciples,

    voice,
    voiceAndStyle: {
      tone: voice.tone,
      personalityTraits
    },

    voiceRules,

    messageHierarchy,

    decisionTrace
  };
}

/* =========================================================
   GEMINI SHAPE AGENT
   ========================================================= */

export async function runShapeAgent(context) {
  const parsedIdea =
    context.parsedIdea ||
    parseIdea(
      context.originalIdea,
      context.clarificationAnswers
    );

  /*
   * Keep the prompt grounded in previous stages.
   *
   * Do not ask the model to manufacture a generic
   * startup story.
   */
  const prompt = `
You are responsible for the "Shape" stage of BrandMind.

Your job is to turn the existing concept into a coherent brand identity.

IMPORTANT:
The original user idea is the primary source of truth.

Use the original idea plus the available Discover and Position information.

Do NOT invent facts about:
- market demand
- competitors
- customer behavior
- pricing
- existing alternatives
- market size
- urgency
- product features
- customer pain points

unless they are explicitly present in the supplied context.

If something is not known, make a reasonable brand-direction decision without presenting it as a factual market claim.

Avoid generic startup language and meaningless buzzwords.

Do not copy wording from the examples because there are no examples to imitate.

==================================================
SOURCE CONTEXT
==================================================

Original idea:
"${context.originalIdea || ''}"

Discover summary:
"${context.discover?.plainSummary || ''}"

Discover audience:
"${context.discover?.targetAudience?.primary || ''}"

Discover core problem:
"${context.discover?.coreProblem || ''}"

Position category:
"${context.position?.category || ''}"

Position value proposition:
"${context.position?.valueProposition || ''}"

Position differentiator:
"${context.position?.differentiator || ''}"

==================================================
TASK
==================================================

Create:

1. A brand name.
2. 3–5 alternative naming directions.
3. A concise draft tagline.
4. 3–5 personality traits.
5. 2–4 anti-traits describing what the brand should avoid.
6. 3–5 core brand principles.
7. A clear brand voice.
8. Voice DO rules.
9. Voice DON'T rules.
10. A primary headline.
11. A supporting subheadline.
12. Up to 3 proof points that are grounded in the supplied information.
13. A short decision trace explaining the brand choices.

==================================================
BRAND NAME
==================================================

Create a memorable name appropriate to the actual concept.

Prefer 1–2 words.

Do not automatically use generic technology/startup words.

The name should be inspired by the concept, not by a fixed industry template.

==================================================
ALTERNATIVE NAMES
==================================================

Return 3–5 alternatives.

Each must include:

"name"
"style"

The style should explain the naming direction in a few words.

==================================================
TAGLINE
==================================================

Create a concise tagline.

It should communicate the actual concept or value.

Do NOT use unsupported claims such as:

"the simplest way"
"revolutionary"
"the future of"
"for everyone"
"solves the problem"
"fragmented"
"expensive"
"complicated"

unless the supplied context explicitly supports the claim.

==================================================
PERSONALITY
==================================================

Return 3–5 traits that fit this particular idea.

Do not automatically use generic traits such as:
"innovative"
"modern"
"friendly"
"trustworthy"

unless they genuinely fit.

==================================================
ANTI-TRAITS
==================================================

Return 2–4 things this brand should deliberately avoid.

Make them relevant to the actual concept.

==================================================
CORE PRINCIPLES
==================================================

Return 3–5 concise principles that guide how the brand should behave and communicate.

They must be specific enough to be useful.

==================================================
VOICE
==================================================

Return:

voice:
{
  "tone": "...",
  "rules": {
    "do": ["...", "...", "..."],
    "dont": ["...", "...", "..."]
  }
}

==================================================
MESSAGE HIERARCHY
==================================================

Return:

messageHierarchy:
{
  "primaryHeadline": "...",
  "subheadline": "...",
  "keyProofPoints": ["...", "...", "..."]
}

Do not invent proof.

Only use information supported by the supplied context.

==================================================
STRICT JSON OUTPUT
==================================================

Return ONLY valid JSON.

Use exactly this structure:

{
  "brandName": "",
  "selectedName": "",

  "draftTagline": "",

  "namingDirections": [
    {
      "name": "",
      "style": ""
    }
  ],

  "personality": [],
  "personalityTraits": [],

  "traitsToAvoid": [],

  "brandPrinciples": [],
  "guidingPrinciples": [],

  "voice": {
    "tone": "",
    "rules": {
      "do": [],
      "dont": []
    }
  },

  "voiceRules": {
    "do": [],
    "dont": []
  },

  "messageHierarchy": {
    "primaryHeadline": "",
    "subheadline": "",
    "keyProofPoints": []
  },

  "decisionTrace": {
    "stage": "shape",
    "decision": "",
    "reason": "",
    "result": ""
  }
}

Do not return markdown.

Do not wrap the JSON in \`\`\`.

Do not add explanations outside the JSON.
`;

  /* =======================================================
     EXECUTE GEMINI
     ======================================================= */

  const result = await executeStagePrompt({
    stageName: 'shape',
    prompt,

    fallbackFn: runShapeFallback,

    context,

    parsedIdea
  });

  /* =======================================================
     NORMALIZE GEMINI OR FALLBACK RESULT
     ======================================================= */

  return normalizeShapeResult(
    result,
    context,
    parsedIdea
  );
}
