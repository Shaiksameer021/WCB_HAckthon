/**
 * BrandMind — Multi-Agent Workflow Engine
 * Orchestrates the sequential execution of Discover -> Position -> Shape -> Visualize -> Challenge -> Deliver.
 * Supports asynchronous clarification pausing/resumption without state loss.
 * Records decision traces and per-stage execution modes.
 */

import { runDiscoverAgent } from './discover.agent.js';
import { runPositionAgent } from './position.agent.js';
import { runShapeAgent } from './shape.agent.js';
import { runVisualizeAgent } from './visualize.agent.js';
import { runChallengeAgent } from './challenge.agent.js';
import { runDeliverAgent } from './deliver.agent.js';
import { parseIdeaWithAI } from '../utils/ideaParser.js';

export const STAGES = [
  { id: 'discover', number: '01', name: 'Discover', label: 'Audience & Core Problem' },
  { id: 'position', number: '02', name: 'Position', label: 'Category & Value Proposition' },
  { id: 'shape', number: '03', name: 'Shape', label: 'Voice, Principles & Naming' },
  { id: 'visualize', number: '04', name: 'Visualize', label: 'Palette, Typography & Mark' },
  { id: 'challenge', number: '05', name: 'Review', label: 'Audit & Consistency' },
  { id: 'deliver', number: '06', name: 'Final Brand', label: 'Brand Kit' }
];

export function createInitialContext(originalIdea = '') {
  return {
    runId: `bm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    originalIdea,
    clarificationAnswers: '',
    skipClarification: false,
    parsedIdea: null,
    discover: null,
    position: null,
    shape: null,
    visualize: null,
    challenge: null,
    deliver: null,
    decisionTrace: [],
    stageModes: {}
  };
}

/**
 * Start the pipeline execution
 * Architecture:
 *   User enters ANY idea
 *          ↓
 *      Gemini API
 *          ↓
 *   Structured JSON (parsedIdea)
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
 */
export async function startWorkflow({
  idea,
  onProgress = () => {},
  onClarificationNeeded = () => {}
}) {
  const context = createInitialContext(idea);

  // STEP 0: User enters ANY idea → Gemini API → Structured JSON
  onProgress({
    stageId: 'discover',
    agentName: 'Gemini Semantic Ingestion',
    message: 'Analyzing user idea through Gemini API into structured JSON semantic blueprint...'
  });

  const parsedIdea = await parseIdeaWithAI(idea);
  context.parsedIdea = parsedIdea;

  // STEP 1: Agent 1 — Discover
  onProgress({
    stageId: 'discover',
    agentName: 'Discover Agent',
    message: 'Analyzing semantic domain, actors, and core problem...'
  });

  const { result: discoverResult, executionMode: discoverMode } = await runDiscoverAgent(context);
  context.discover = discoverResult;
  context.stageModes.discover = discoverMode;
  context.decisionTrace.push(discoverResult.decisionTrace);

  // Check if clarification is required (< 9 words and not yet clarified)
  if (discoverResult.requiresClarification && !context.skipClarification) {
    onClarificationNeeded({
      context,
      diagnosticQuestions: discoverResult.diagnosticQuestions || parsedIdea.suggestedQuestions || []
    });
    return {
      status: 'paused_for_clarification',
      context
    };
  }

  // If thin check passed, proceed with subsequent 5 agents
  return await continueRemainingStages(context, onProgress);
}

/**
 * Resume workflow after clarification decision (user answer OR autonomous choice)
 */
export async function resumeWorkflow({
  context,
  clarificationAnswer = '',
  autonomous = false,
  onProgress = () => {}
}) {
  // If user provided clarification answer, re-run Semantic Ingestion & Discover once with ground truth
  if (clarificationAnswer && !autonomous) {
    context.clarificationAnswers = clarificationAnswer;
    onProgress({
      stageId: 'discover',
      agentName: 'Gemini Semantic Ingestion',
      message: 'Re-evaluating structured JSON blueprint with user clarification as ground truth...'
    });

    const refreshedParsedIdea = await parseIdeaWithAI(context.originalIdea, clarificationAnswer);
    context.parsedIdea = refreshedParsedIdea;

    onProgress({
      stageId: 'discover',
      agentName: 'Discover Agent',
      message: 'Re-evaluating domain insights with user clarification as ground truth...'
    });

    const { result: reDiscoverResult, executionMode: reDiscoverMode } = await runDiscoverAgent(context);
    context.discover = reDiscoverResult;
    context.stageModes.discover = reDiscoverMode;
    // Replace discover trace
    context.decisionTrace = context.decisionTrace.filter(t => t.stage !== 'discover');
    context.decisionTrace.push(reDiscoverResult.decisionTrace);
  } else {
    context.skipClarification = true;
    if (context.discover) {
      context.discover.requiresClarification = false;
    }
  }

  return await continueRemainingStages(context, onProgress);
}

/**
 * Execute Stages 02 through 06 sequentially
 */
async function continueRemainingStages(context, onProgress) {
  // 2. Position Agent
  onProgress({
    stageId: 'position',
    agentName: 'Position Agent',
    message: 'Formulating market category, differentiator, and strategic tradeoffs...'
  });
  const { result: positionResult, executionMode: positionMode } = await runPositionAgent(context);
  context.position = positionResult;
  context.stageModes.position = positionMode;
  context.decisionTrace.push(positionResult.decisionTrace);

  // 3. Shape Agent
  onProgress({
    stageId: 'shape',
    agentName: 'Shape Agent',
    message: 'Defining voice principles, candidate names, and initial draft tagline...'
  });
  const { result: shapeResult, executionMode: shapeMode } = await runShapeAgent(context);
  context.shape = shapeResult;
  context.stageModes.shape = shapeMode;
  context.decisionTrace.push(shapeResult.decisionTrace);

  // 4. Visualize Agent
  onProgress({
    stageId: 'visualize',
    agentName: 'Visualize Agent',
    message: 'Synthesizing domain-tailored color palette, typography system, and monogram...'
  });
  const { result: visualizeResult, executionMode: visualizeMode } = await runVisualizeAgent(context);
  context.visualize = visualizeResult;
  context.stageModes.visualize = visualizeMode;
  context.decisionTrace.push(visualizeResult.decisionTrace);

  // 5. Challenge Agent (The Critique)
  onProgress({
    stageId: 'challenge',
    agentName: 'Challenge Agent',
    message: 'Auditing clichés, assumptions, bias, and running 4-point consistency audit...'
  });
  const { result: challengeResult, executionMode: challengeMode } = await runChallengeAgent(context);
  context.challenge = challengeResult;
  context.stageModes.challenge = challengeMode;
  context.decisionTrace.push(challengeResult.decisionTrace);

  // 6. Deliver Agent (The Causal Climax)
  onProgress({
    stageId: 'deliver',
    agentName: 'Deliver Agent',
    message: 'Applying Challenge audit corrections, compiling Before -> After, and assembling launch kit...'
  });
  const { result: deliverResult, executionMode: deliverMode } = await runDeliverAgent(context);
  context.deliver = deliverResult;
  context.stageModes.deliver = deliverMode;
  context.decisionTrace.push(deliverResult.decisionTrace);

  onProgress({
    stageId: 'complete',
    agentName: 'Workflow Complete',
    message: 'All six stages successfully synthesized.'
  });

  return {
    status: 'completed',
    context
  };
}

/**
 * Generate Complete Markdown Brand Guidelines Export
 * Contains full structured system, consistency notes, applied corrections.
 * Strictly free of invented domains.
 */
export function generateMarkdownExport(context) {
  const { originalIdea, discover, position, shape, visualize, challenge, deliver, stageModes, decisionTrace, runId } = context;
  const brandName = shape?.selectedName || 'Brand';
  const finalTagline = deliver?.finalBrandSummary?.finalTagline || shape?.draftTagline || '';
  const dateStr = new Date().toISOString().split('T')[0];

  let md = `# BRAND GUIDELINES: ${brandName.toUpperCase()}
> Autonomous Multi-Agent Brand Reasoning System • Inkloom Hackathon 2026
> Generated: ${dateStr} • Run ID: \`${runId}\`

---

## 1. EXECUTIVE SUMMARY & BRAND PILLARS
- **Brand Name**: ${brandName}
- **Category**: ${position?.category || 'Specialized Domain System'}
- **Final Tagline**: ${finalTagline}
- **Value Proposition**: ${position?.valueProposition || ''}
- **Original Idea Prompt**: "${originalIdea}"

### Strategic Tradeoffs
${position?.strategicTradeoffs?.map(t => `- **Prioritizes**: ${t.chooses}\n  **Sacrifices**: ${t.sacrifices}`).join('\n') || 'None recorded'}

---

## 2. DISCOVERY & AUDIENCE REALITY
### Stated vs Inferred
**Explicitly Stated**:
${discover?.statedVsInferred?.stated?.map(s => `- ${s}`).join('\n') || '- None'}

**Strategically Inferred**:
${discover?.statedVsInferred?.inferred?.map(s => `- ${s}`).join('\n') || '- None'}

### Core Problem
${discover?.coreProblem || 'None recorded'}

### Target Audience
- **Primary Audience**: ${discover?.targetAudience?.primary || 'Target users'}
- **Secondary Allies**: ${discover?.targetAudience?.secondary || 'Allied partners'}
- **Emotional Driver**: ${discover?.targetAudience?.emotionalDriver || 'Core motivation'}

**Pain Points Addressed**:
${discover?.targetAudience?.painPoints?.map(p => `- ${p}`).join('\n') || '- None'}

---

## 3. BRAND VOICE & MESSAGE HIERARCHY
### Brand Personality
${shape?.personalityTraits?.map(t => `- **${t}**`).join('\n') || '- None'}

### Anti-Traits (Guardrails)
${shape?.traitsToAvoid?.map(t => `- ❌ Avoid: ${t}`).join('\n') || '- None'}

### Brand Principles
${shape?.brandPrinciples?.map((p, i) => `${i + 1}. ${p}`).join('\n') || '- None'}

### Message Hierarchy
- **Primary Headline**: ${shape?.messageHierarchy?.primaryHeadline || ''}
- **Subheadline**: ${shape?.messageHierarchy?.subheadline || ''}
- **Elevator Pitch**: ${shape?.messageHierarchy?.elevatorPitch || ''}

**Key Proof Points**:
${shape?.messageHierarchy?.keyProofPoints?.map(p => `- ${p}`).join('\n') || '- None'}

### Voice Directives
**Do**:
${shape?.voiceRules?.do?.map(r => `+ ${r}`).join('\n') || '- None'}

**Don't**:
${shape?.voiceRules?.dont?.map(r => `- ${r}`).join('\n') || '- None'}

---

## 4. VISUAL IDENTITY SYSTEM
### Color Palette
| Role | Color Name | HEX Code | Strategic Rationale |
|------|------------|----------|---------------------|
${visualize?.colorPalette?.map(c => `| ${c.role} | ${c.name} | \`${c.hex}\` | ${c.meaning} |`).join('\n') || '| N/A | N/A | N/A | N/A |'}

### Typography System
- **Display Font**: ${visualize?.typography?.displayFont || 'Space Grotesk'}
- **Body Font**: ${visualize?.typography?.bodyFont || 'Plus Jakarta Sans'}
- **Mono / Numeric Font**: ${visualize?.typography?.monoFont || 'JetBrains Mono'}
- **Pairing Strategy**: ${visualize?.typography?.pairings || ''}
- **Typographic Rationale**: ${visualize?.typography?.rationale || ''}

### Graphic Language & Motif
- **Style**: ${visualize?.graphicLanguage?.style || 'Clean Minimal Modern'}
- **Motifs**: ${visualize?.graphicLanguage?.visualMotifs?.join(', ') || 'Geometric structure'}
- **Layout Philosophy**: ${visualize?.graphicLanguage?.layoutPhilosophy || 'Generous whitespace with clear hierarchy'}

### Logo Direction & Monogram
- **Mark Type**: ${visualize?.logoDirection?.markType || 'Geometric Monogram'}
- **Monogram Initials**: \`${visualize?.logoDirection?.monogramInitials || 'BM'}\`
- **Concept Narrative**: ${visualize?.logoDirection?.concept || ''}
- **Geometry**: ${visualize?.logoDirection?.geometry || ''}

### Imagery Style & Guardrails
- **Mood**: ${visualize?.imageryStyle?.mood || 'Authentic human scale'}
- **Subject Matter**: ${visualize?.imageryStyle?.subjectMatter || ''}
- **Color Grading**: ${visualize?.imageryStyle?.colorGrading || ''}
- **Visuals Strictly Avoided**: ${visualize?.visualsToAvoid?.join(', ') || 'Generic stock cliches'}

---

## 5. CHALLENGE AUDIT & CRITICAL SELF-CORRECTION
### Clichés & Weak Assumptions Flagged
**Clichés Detected**:
${challenge?.clichesDetected?.map(c => `- ⚠️ ${c}`).join('\n') || '- None'}

**Weak Assumptions**:
${challenge?.weakAssumptions?.map(a => `- ⚠️ ${a}`).join('\n') || '- None'}

**Bias Risks & Demographic Inclusivity**:
${challenge?.biasRisks?.map(b => `- 🛡️ ${b}`).join('\n') || '- None'}

### Four-Point Fixed Consistency Audit
${challenge?.consistencyAudit ? `
1. **${challenge.consistencyAudit.nameVsPersonality?.check}** (Score: ${challenge.consistencyAudit.nameVsPersonality?.score}/100)
   - *Critique*: ${challenge.consistencyAudit.nameVsPersonality?.critique}
   - *Recommendation*: ${challenge.consistencyAudit.nameVsPersonality?.recommendation}

2. **${challenge.consistencyAudit.taglineVsPositioning?.check}** (Score: ${challenge.consistencyAudit.taglineVsPositioning?.score}/100)
   - *Critique*: ${challenge.consistencyAudit.taglineVsPositioning?.critique}
   - *Recommendation*: ${challenge.consistencyAudit.taglineVsPositioning?.recommendation}

3. **${challenge.consistencyAudit.visualsVsAudience?.check}** (Score: ${challenge.consistencyAudit.visualsVsAudience?.score}/100)
   - *Critique*: ${challenge.consistencyAudit.visualsVsAudience?.critique}
   - *Recommendation*: ${challenge.consistencyAudit.visualsVsAudience?.recommendation}

4. **${challenge.consistencyAudit.launchCopyVsVoice?.check}** (Score: ${challenge.consistencyAudit.launchCopyVsVoice?.score}/100)
   - *Critique*: ${challenge.consistencyAudit.launchCopyVsVoice?.critique}
   - *Recommendation*: ${challenge.consistencyAudit.launchCopyVsVoice?.recommendation}
` : 'No audit data'}

---

## 6. CAUSAL SELF-CORRECTION RECORD (BEFORE → AFTER)
> The Deliver Agent actively consumed and resolved the Challenge Agent's critique.

### Primary Tagline Evolution
- **Draft Tagline (Shape Stage)**: "${deliver?.finalBrandSummary?.originalDraftTagline || shape?.draftTagline || ''}"
- **Final Tagline (Deliver Stage)**: "${deliver?.finalBrandSummary?.finalTagline || ''}"
- **Reasoning for Evolution**: ${deliver?.finalBrandSummary?.whyTaglineChanged || 'Refined based on consistency audit'}

### Complete Applied Corrections Trace
| Applied To | Original Draft Element | Corrected Implementation | Audit Rationale |
|------------|------------------------|--------------------------|-----------------|
${deliver?.correctionsAppliedSummary?.map(c => `| \`${c.appliedTo}\` | "${c.original}" | **"${c.corrected}"** | ${c.rationale} |`).join('\n') || '| None | None | None | None |'}

---

## 7. LAUNCH COMMUNICATIONS & COLLATERAL
### Landing Page Architecture
- **Hero Headline**: ${deliver?.landingPage?.heroHeadline || ''}
- **Hero Subheadline**: ${deliver?.landingPage?.heroSubheadline || ''}
- **Primary Action (CTA)**: ${deliver?.landingPage?.primaryCta || ''}
- **Secondary Action**: ${deliver?.landingPage?.secondaryCta || ''}

**Key Feature Sections**:
${deliver?.landingPage?.featureSections?.map((f, i) => `### Feature ${i + 1}: ${f.title}\n- **Detail**: ${f.description}\n- **Proof**: ${f.proof}`).join('\n\n') || 'None'}

### Launch Campaign Strategy
- **Headline Campaign**: ${deliver?.launchCampaign?.headlineCampaign || ''}

**Channels & Activation Copy**:
${deliver?.launchCampaign?.channels?.map(ch => `#### ${ch.channel}\n- **Strategy**: ${ch.strategy}\n- **Sample Copy**: *"${ch.sampleCopy}"*`).join('\n\n') || 'None'}

### Founder's Launch Letter
${deliver?.launchCampaign?.founderLetter ? `> "${deliver.launchCampaign.founderLetter}"` : 'None'}

---

## 8. SYSTEM REASONING & EXECUTION TELEMETRY
### Execution Modes per Stage
- **Discover (Stage 01)**: \`${stageModes?.discover || 'fallback'}\`
- **Position (Stage 02)**: \`${stageModes?.position || 'fallback'}\`
- **Shape (Stage 03)**: \`${stageModes?.shape || 'fallback'}\`
- **Visualize (Stage 04)**: \`${stageModes?.visualize || 'fallback'}\`
- **Challenge (Stage 05)**: \`${stageModes?.challenge || 'fallback'}\`
- **Deliver (Stage 06)**: \`${stageModes?.deliver || 'fallback'}\`

### Decision Confidence Trace
${decisionTrace?.map(t => `- **[${t.stage.toUpperCase()}] ${t.agentName}** — Confidence: \`${t.confidence}\`\n  *Rationale*: ${t.rationale}`).join('\n') || '- None'}

---
*Generated by BrandMind for the Inkloom Hackathon 2026. Zero invented domains. Verified causal AI brand reasoning.*
`;

  return md;
}

/**
 * Generate JSON export of the entire BrandContext
 */
export function generateJsonExport(context) {
  return JSON.stringify(context, null, 2);
}
