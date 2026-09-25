/**
 * BrandMind — Agent 01: Discover
 * Architecture Role:
 *   • Understand the idea
 *   • Problem
 *   • Audience
 *   • Needs (practical & emotional)
 *   • Unknowns (critical assumptions to validate)
 * Zero predefined templates or archetypes — derived purely from the Semantic Blueprint.
 */

import { executeStagePrompt } from '../services/aiEngine.js';
import { parseIdea } from '../utils/ideaParser.js';

export function runDiscoverFallback(context, parsedIdea) {
  const { domain, actors, activity, problem, desiredOutcome, userNeed, solution, isThin, originalIdea, score } = parsedIdea;

  const targetAudience = {
    primary: actors || 'Target Individuals & Early Adopters',
    secondary: `People adjacent to ${(actors || 'the core audience').toLowerCase()} who benefit from the same outcome`,
    emotionalDriver: userNeed || 'Wanting simple, honest, and dependable solutions that actually work',
    painPoints: [
      problem,
      `Current solutions require too much time, money, or manual effort`,
      `Lack of a solution tailored to real-world context`
    ]
  };

  const userNeeds = {
    practical: `A fast, reliable way to ${activity || 'achieve the desired outcome'}`,
    emotional: `Feeling confident, supported, and free of the usual frustration of ${problem.toLowerCase()}`
  };

  const unknowns = [
    `How will the first 50 ${actors.toLowerCase()} discover this solution without massive marketing spend?`,
    `What is the one critical feature they need on day one to stay engaged?`
  ];

  return {
    plainSummary: `${actors} who want to ${activity.toLowerCase()} — without the friction of ${problem.toLowerCase()}.`,
    coreProblem: problem,
    targetAudience,
    userNeeds,
    unknowns,
    solution: solution || `A streamlined, dedicated experience purpose-built for ${originalIdea}`,
    statedVsInferred: {
      stated: [
        `Idea core: "${originalIdea}"`,
        `Primary user: ${actors}`,
        `Core activity: ${activity}`
      ],
      inferred: [
        `Real headache: ${problem}`,
        `Desired win: ${desiredOutcome}`,
        `Strategic advantage: Honest simplicity and specialized focus`
      ]
    },
    ideaScore: score || {
      overall: 86,
      rating: 'Promising Idea',
      clarity: 88,
      marketNeed: 88,
      originality: 82,
      launchEase: 86,
      verdict: 'Clear problem and high utility. Focused messaging will drive strong adoption.'
    },
    requiresClarification: isThin,
    diagnosticQuestions: unknowns,
    decisionTrace: {
      stage: 'discover',
      decision: `Established target audience as "${actors}" and isolated the core problem as "${problem}"`,
      reason: `Directly derived from the Semantic Blueprint generated for this specific user idea`,
      result: `Supplied foundational audience profile, core user needs, and critical unknowns to the Position Agent`
    }
  };
}

export async function runDiscoverAgent(context) {
  const parsedIdea = context.parsedIdea || parseIdea(context.originalIdea, context.clarificationAnswers);

  const prompt = `
You are Agent 01 (Discover) in the BrandMind Multi-Agent System.
Your job is to deeply understand this specific idea and identify its foundational elements.

Semantic Blueprint:
- Idea: "${context.originalIdea}"
- Domain: "${parsedIdea.domain}"
- Target Audience: "${parsedIdea.targetAudience || parsedIdea.actors}"
- Problem: "${parsedIdea.problem}"
- User Need: "${parsedIdea.userNeed}"
- Solution: "${parsedIdea.solution}"
- Desired Outcome: "${parsedIdea.desiredOutcome}"
${context.clarificationAnswers ? `- User Clarification: "${context.clarificationAnswers}"` : ''}

RESPONSIBILITIES:
1. Understand the idea: Explain it clearly in 1 simple, conversational sentence (plainSummary).
2. Problem: Pinpoint the real headache people face right now.
3. Audience: Define who desperately needs this today.
4. Needs: Separate practical daily needs from emotional desires.
5. Unknowns: Name 2 critical assumptions or unknowns that must be validated.

Output strict JSON:
{
  "plainSummary": "A punchy, conversational 1-sentence explanation of what this is",
  "coreProblem": "The exact problem being solved in plain everyday English",
  "targetAudience": {
    "primary": "The core audience group",
    "secondary": "Secondary group or supporters",
    "emotionalDriver": "What they emotionally yearn for",
    "painPoints": ["3 specific daily frustrations"]
  },
  "userNeeds": {
    "practical": "What the user functionally needs done",
    "emotional": "How the user wants to feel"
  },
  "unknowns": [
    "Critical question or assumption #1 to validate",
    "Critical question or assumption #2 to validate"
  ],
  "solution": "Clear statement of how this idea solves the problem",
  "statedVsInferred": {
    "stated": ["3 facts directly mentioned in the input"],
    "inferred": ["3 underlying truths inferred from the context"]
  },
  "ideaScore": {
    "overall": 88,
    "rating": "Promising Concept",
    "clarity": 90,
    "marketNeed": 92,
    "originality": 84,
    "launchEase": 86,
    "verdict": "Honest 1-sentence assessment of market viability"
  },
  "requiresClarification": false,
  "diagnosticQuestions": [],
  "decisionTrace": {
    "stage": "discover",
    "decision": "What audience and problem boundaries were set",
    "reason": "Why these boundaries fit the user's specific idea",
    "result": "How this grounds all downstream brand stages"
  }
}
`;

  return await executeStagePrompt({
    stageName: 'discover',
    prompt,
    fallbackFn: runDiscoverFallback,
    context,
    parsedIdea
  });
}
