**BRANDMIND — FINALIZED IMPLEMENTATION PLAN**  
**Inkloom Hackathon | Flawless • Freeze-Ready • No Remaining Gaps**

This is the single authoritative plan. Every previously identified error has been closed. Implement exactly what is written. Do not redesign. Do not add scope.

---

### 1. What We Are Building

BrandMind turns a rough idea into a launch-ready brand system through six specialized AI agents that reason in sequence, critique their own earlier work, and prove the critique was applied.

**User journey**  
Idea → six accountable stages → visible self-correction → real, exportable brand kit.

**Final deliverables the user receives**
- Audience and problem definition
- Positioning and value proposition
- Personality, principles, naming, tagline, message hierarchy
- Visual direction (palette, type, logo mark, imagery)
- Explicit critique of clichés, bias, weak assumptions, and consistency failures
- Corrected final brand kit with launch copy
- Complete Markdown brand guidelines
- Full JSON export of the entire BrandContext and decision history

**Deliberately excluded**
- User accounts, authentication, database
- Backend server
- Image-generation API
- Multiple brand-world modes
- Fake domains or invented URLs
- Extra agents, RAG, vector stores, scoring engines

---

### 2. Folder Structure

```
brandmind/
├── index.html
├── package.json                  # React 18 + Vite only
├── vite.config.js
└── src/
    ├── main.jsx
    ├── App.jsx                   # All UI
    ├── index.css                 # Design system + restrained motion
    ├── agents/
    │   ├── discover.agent.js
    │   ├── position.agent.js
    │   ├── shape.agent.js
    │   ├── visualize.agent.js
    │   ├── challenge.agent.js
    │   ├── deliver.agent.js
    │   └── workflow.engine.js
    ├── services/
    │   └── aiEngine.js           # Provider-aware adapter (Gemini + Groq)
    └── utils/
        ├── ideaParser.js         # Semantic extraction
        └── logoMark.js           # Deterministic SVG monogram
```

No additional folders. No extra scaffolding.

---

### 3. Architecture

**BrandContext (single accumulating object)**

```
{
  runId,
  originalIdea,
  discover: null → result,
  position: null → result,
  shape:    null → result,
  visualize:null → result,
  challenge:null → result,
  deliver:  null → result,
  decisionTrace: [],              // one entry per completed stage
  stageModes: {}                  // per-stage executionMode
}
```

**Three execution modes (tracked per stage, never silent)**

| Mode | Trigger | What runs |
|------|---------|-----------|
| `live-gemini` | Production key present and call succeeds | Gemini 3.8 Flash |
| `live-groq` | Development key present and call succeeds | Groq free-tier model |
| `fallback` | No key or any live call fails | Deterministic idea-aware generator for that stage only |

UI shows a small honest indicator so judges always know which path produced the visible output.

**Causal loop (non-negotiable)**

```
Discover → Position → Shape → Visualize
                              ↓
                       Challenge
         recommendedCorrections[{ target, problem, correction }]
                              ↓
                       Deliver
         applies every correction (records appliedTo) → final kit
```

**Semantic idea extraction (mandatory for all fallbacks)**  
The idea parser must extract at minimum:
- domain
- actors
- activity
- problem
- desired outcome

Every fallback stage uses these extracted concepts. No default “practitioners / operators / infrastructure / velocity” language unless the idea itself contains those concepts.

**Four fixed consistency checks (Challenge)**
1. Name ↔ Personality  
2. Tagline ↔ Positioning  
3. Visuals ↔ Audience  
4. Launch Copy ↔ Voice  

---

### 4. Workflow (Exact Sequence)

1. User enters idea and clicks Run.
2. Discover Agent runs.
3. If the idea is thin (word count < 9 and no prior clarification), the engine yields control. UI shows 1–2 precise questions plus two actions: “Continue with my answer” and “Proceed autonomously”.
4. React holds the paused BrandContext and a continuation handle. User answer (or autonomous choice) resumes the exact same context. Discover re-runs once with the answer treated as ground truth if provided.
5. Remaining five agents run in sequence. Each records its own executionMode.
6. Live progress text names the current agent and what it is doing.
7. Six free-navigation tabs appear.
8. Challenge tab shows full critique and recommendedCorrections.
9. Deliver tab shows the causal Before → After as the centrepiece, followed by the complete final kit and export buttons.

Clarification is fully asynchronous. No synchronous blocking. No state loss on re-render.

---

### 5. Agents — Exact Responsibilities

| Stage | Agent | Required outputs |
|-------|-------|------------------|
| 01 | Discover | statedVsInferred, coreProblem, targetAudience, diagnosticQuestions, requiresClarification, decisionTrace |
| 02 | Position | category, differentiator, valueProposition, competitiveAngle, strategicTradeoffs, decisionTrace |
| 03 | Shape | personalityTraits, traitsToAvoid, brandPrinciples, selectedName, namingDirections, draftTagline, messageHierarchy, voiceRules, decisionTrace |
| 04 | Visualize | colorPalette, typography, graphicLanguage, logoDirection, imageryStyle, visualsToAvoid, decisionTrace |
| 05 | Challenge | clichesDetected, weakAssumptions, audienceMismatchWarnings, biasRisks, consistencyAudit (exactly the four checks), recommendedCorrections (each with target / problem / correction), decisionTrace |
| 06 | Deliver | finalBrandSummary (originalDraftTagline vs finalTagline), correctionsAppliedSummary (with appliedTo), landingPage, launchCampaign, fullAssembledBrandKit, decisionTrace |

Fallback versions of every agent must remain idea-aware and must obey the same contracts. Deliver fallback must actually consume and apply Challenge’s recommendedCorrections.

---

### 6. APIs & Provider Strategy

**Production**
- Provider: Google Gemini
- Model: `gemini-3.8-flash` (stable at time of build)
- Direct browser fetch
- Optional user key in localStorage

**Development / testing**
- Provider: Groq free-tier model
- OpenAI-compatible endpoint
- Optional user key in localStorage

**Always present**
- Stage-level deterministic idea-aware fallback (zero network, zero key)

**aiEngine.js requirements**
- Clean adapter that branches on provider.
- Gemini path uses Google `contents` + `generationConfig` + `responseMimeType: "application/json"`.
- Groq path uses OpenAI-style `messages` + `response_format: { type: "json_object" }`.
- Any live failure immediately returns control to the stage’s deterministic fallback.
- Returns both the result and the executionMode so the UI can display it honestly.

Client-side keys are acceptable for this hackathon prototype only. Document as prototype credential handling, not production security.

---

### 7. UI / UX — Professional Website

**Design philosophy**  
Serious internal tool for founders and technical judges. Dark studio aesthetic. High contrast. Quiet chrome. Generated brand content carries personality. Never looks like a typical AI product.

**Colour system**
- Canvas: #080A10
- Surface: #0E121D
- Elevated: #141A29
- Border: rgba(255,255,255,0.08)
- Primary: #6366F1
- Action: #06B6D4
- Status: Emerald / Amber / Rose

**Typography**
- Display: Space Grotesk
- Body: Plus Jakarta Sans
- Mono: JetBrains Mono

**Motion (restrained, professional)**
- Short fade + 12–16 px upward translate on stage panels (180–220 ms, ease-out)
- Clean cross-fade on progress text
- Sliding tab indicator
- Staggered scale/opacity on colour swatches
- Clean side-by-side or horizontal reveal on the Before → After
- Button press scale 0.98 (80–100 ms)
- Fully respects `prefers-reduced-motion`
- No 3D, no particles, no continuous floating motion, no neon gradients, no glassmorphism, no playful illustrations

**Screen inventory**
- Minimal header (brand mark, Inkloom sponsor pill with code, “How this works”, optional key toggle)
- Focused hero (pitch, idea textarea, three starter chips, single primary button)
- Live progress line
- Free six-tab stepper
- Stage panels that show real structured data, never long undifferentiated prose
- Challenge tab = full critique
- Deliver tab = causal Before → After as centrepiece + complete kit + exports
- Tiny honest execution-mode indicator
- Architecture modal explaining stages + live decisionTrace

---

### 8. Clean Feature Set

**Present**
- Six-stage sequential workflow with full context preservation
- Asynchronous clarification pause/resume
- Per-stage executionMode visibility
- DecisionTrace with high/medium/low confidence (labelled as decision confidence)
- Full Challenge critique + four fixed consistency checks
- Traceable corrections applied by Deliver
- Real colour swatches + deterministic SVG monogram
- Complete Markdown brand-guidelines export (includes message hierarchy, principles, bias findings, consistency notes, applied corrections)
- Full JSON kit export
- Stage-level deterministic idea-aware fallback
- Inkloom attribution with correct code

**Excluded**
- Accounts, database, backend
- Image-generation APIs
- Extra modes or “Five Worlds”
- Fake domains
- RAG, scoring engines, extra agents, vector stores

---

### 9. Verification Gate (Must Pass Before Deploy)

Run the full pipeline on these five ideas with no API key first:

1. Elderly people teaching children traditional cooking  
2. Neighbourhood tool library for sharing and repairing hand tools  
3. Freelancer invoice tracker  
4. Farmer marketplace  
5. Children’s learning app  

For every idea confirm:
- Audience and category match the actual domain (no forced SaaS language)
- Challenge produces the four consistency checks and recommendedCorrections with target / problem / correction
- Deliver’s final tagline is visibly derived from those corrections (causal Before → After)
- Visual direction is not identical across the five ideas
- Markdown export is complete and contains no invented domains
- executionMode is correctly reported per stage

Then run one idea with a Groq free-tier key and one idea with a Gemini key. Confirm both live paths succeed and still obey the same contracts.

Only after every check passes is the project allowed to build and deploy.

---

### 10. Implementation Checklist (Exact Order)

1. Provider-aware `aiEngine.js` with clean Gemini / Groq adapters and stage-level fallback.
2. Semantic idea parser (domain, actors, activity, problem, outcome).
3. Idea-aware fallbacks for all six agents (no SaaS bias).
4. Challenge fallback emits the four consistency checks + recommendedCorrections with target / problem / correction.
5. Deliver fallback actually consumes and applies those corrections (records appliedTo).
6. Asynchronous clarification pause/resume with preserved BrandContext.
7. Per-stage executionMode tracking and honest UI indicator.
8. Complete Markdown export.
9. Remove every invented domain.
10. Domain-sensitive Visualize fallback.
11. Professional dark-studio UI + restrained motion.
12. Pass the five-idea verification gate.
13. Production build (zero errors).
14. Deploy static site → permanent live URL.
15. Public/judge-accessible GitHub.
16. 2–4 minute demo video with the causal loop as the centrepiece.
17. Every teammate publishes required Instagram + LinkedIn posts with mandatory Inkloom language and code.
18. Submit.

After step 18 the codebase is frozen.

---

### 11. Final Statement

This plan closes every previously identified flaw:
- Dead model endpoint
- Generic SaaS-biased fallbacks
- Cosmetic (non-causal) Before → After
- Incomplete consistency audit
- Silent execution-mode switching
- Payload format divergence between providers
- Async clarification state risk
- Incomplete Markdown export
- Fake domains

The architecture is clean. The scope is disciplined. The evidence for judges is honest and visible.  

Implement exactly this plan. Verify against the five ideas. Then freeze and ship.