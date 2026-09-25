/**
 * BrandMind — Agent 02: Position
 * Architecture Role:
 *   • Category
 *   • Value proposition
 *   • Differentiator
 *   • Market position
 * Derived dynamically from the Semantic Blueprint and Discover findings.
 */

import { executeStagePrompt } from '../services/aiEngine.js';
import { parseIdea } from '../utils/ideaParser.js';

export function runPositionFallback(context, parsedIdea) {
  const { domain, actors, activity, problem, differentiation, category: parsedCategory } = parsedIdea;
  const discover = context.discover || {};
  const audience = discover.targetAudience?.primary || actors || 'Users';
  const coreProblem = discover.coreProblem || problem || 'Inefficient existing tools';

  const category = parsedCategory || `${domain} for ${audience}`;
  const differentiator = differentiation || `Built solely around the genuine everyday workflow of ${audience.toLowerCase()}, removing unnecessary corporate complexity`;
  const valueProposition = `Helping ${audience.toLowerCase()} ${activity.toLowerCase()} without ${coreProblem.toLowerCase()}.`;
  const marketPosition = `The honest, focused alternative to bloated legacy tools in the ${domain} space.`;

  return {
    category,
    valueProposition,
    differentiator,
    marketPosition,
    competitiveAngle: `Unlike generic competitors who treat ${audience.toLowerCase()} as an afterthought, this is designed for their exact daily reality from day one.`,
    strategicTradeoffs: [
      {
        chooses: `Deep simplicity and focus on ${coreProblem.toLowerCase()}`,
        sacrifices: `Cluttering the interface with feature bloat that looks impressive on paper but adds friction`
      },
      {
        chooses: `Transparent, direct communication for ${audience.toLowerCase()}`,
        sacrifices: `Vague corporate marketing buzzwords that mean nothing to real people`
      }
    ],
    decisionTrace: {
      stage: 'position',
      decision: `Defined category as "${category}" and positioned as "${marketPosition}"`,
      reason: `Directly targets the underserved needs of "${audience}" without fighting incumbents on their generic terms`,
      result: `Provides strategic guardrails for name, voice, tagline, and visual identity`
    }
  };
}

export async function runPositionAgent(context) {
  const parsedIdea = context.parsedIdea || parseIdea(context.originalIdea, context.clarificationAnswers);

  const prompt = `
You are Agent 02 (Position) in the BrandMind Multi-Agent System.
Your job is to position this specific idea in the market so it clearly stands out.

Context:
- Idea: "${context.originalIdea}"
- Audience: "${context.discover?.targetAudience?.primary || parsedIdea.actors}"
- Core Problem: "${context.discover?.coreProblem || parsedIdea.problem}"
- User Needs: ${JSON.stringify(context.discover?.userNeeds || {})}
- Semantic Category: "${parsedIdea.category}"
- Semantic Differentiation: "${parsedIdea.differentiation}"

RESPONSIBILITIES:
1. Category: A clear, memorable definition of what space this lives in.
2. Value Proposition: A crisp, 1-sentence promise of what users gain and why it matters.
3. Differentiator: The ONE specific, credible reason to choose this over alternatives.
4. Market Position: The brand's strategic stance in the landscape.

Output strict JSON:
{
  "category": "Clear, plain-language category description",
  "valueProposition": "1 clear sentence: who it's for, what they achieve, and the transformation",
  "differentiator": "The sharp, credible difference that competitors cannot easily copy",
  "marketPosition": "Strategic posture (e.g. The honest, specialized alternative for ...)",
  "competitiveAngle": "Why alternatives fail this audience",
  "strategicTradeoffs": [
    { "chooses": "What this brand commits to prioritizing", "sacrifices": "What it deliberately gives up" },
    { "chooses": "What this brand commits to prioritizing", "sacrifices": "What it deliberately gives up" }
  ],
  "decisionTrace": {
    "stage": "position",
    "decision": "Positioning choice made",
    "reason": "Why this creates a defensible, authentic advantage",
    "result": "How this informs voice and design"
  }
}
`;

  return await executeStagePrompt({
    stageName: 'position',
    prompt,
    fallbackFn: runPositionFallback,
    context,
    parsedIdea
  });
}
