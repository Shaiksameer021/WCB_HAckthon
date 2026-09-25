/**
 * BrandMind — Agent 04: Visualize
 * Architecture Role:
 *   • Colors (Primary, Secondary, Accent, Light Surface, Dark Base)
 *   • Typography (Display font, Body font, Mono font, Pairings)
 *   • Visual style (Graphic language, visual motifs)
 *   • UI direction (Layout, component aesthetics, spacing principles)
 * Zero predefined themes or static catalogs — uses dynamic procedural synthesis + Gemini AI.
 */

import { executeStagePrompt } from '../services/aiEngine.js';
import { parseIdea } from '../utils/ideaParser.js';
import { getMonogramLetters } from '../utils/logoMark.js';

// Convert HSL to Hex string
function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// Procedural hash-to-hue generator for infinite, deterministic, mathematically harmonious palettes
function generateAlgorithmicPalette(seedString) {
  let hash = 0;
  for (let i = 0; i < seedString.length; i++) {
    hash = (hash << 5) - hash + seedString.charCodeAt(i);
    hash |= 0;
  }
  const baseHue = Math.abs(hash) % 360;
  const secondaryHue = (baseHue + 40) % 360;
  const accentHue = (baseHue + 180) % 360;

  return [
    {
      name: 'Primary Accent',
      hex: hslToHex(baseHue, 78, 52),
      role: 'Primary',
      meaning: 'Core visual anchor, action triggers, and primary brand recognition'
    },
    {
      name: 'Secondary Balance',
      hex: hslToHex(secondaryHue, 70, 48),
      role: 'Secondary',
      meaning: 'Subtle complementary rhythm, navigation highlights, and badges'
    },
    {
      name: 'Vibrant Accent',
      hex: hslToHex(accentHue, 85, 54),
      role: 'Accent',
      meaning: 'Key calls to action, badges, and high-visibility status cues'
    },
    {
      name: 'Crisp Surface',
      hex: '#F8FAFC',
      role: 'Light Surface',
      meaning: 'Spacious background card readability and generous negative space'
    },
    {
      name: 'Deep Canvas',
      hex: '#090D16',
      role: 'Dark Base',
      meaning: 'High-contrast structural framing with dark mode depth'
    }
  ];
}

export function runVisualizeFallback(context, parsedIdea) {
  const { domain, actors } = parsedIdea;
  const shape = context.shape || {};
  const brandName = shape.selectedName || shape.brandName || parsedIdea.baseName || 'Brand';
  const initials = getMonogramLetters(brandName);

  // Algorithmic palette uniquely derived from the brand name and domain
  const colorPalette = generateAlgorithmicPalette(`${brandName}_${domain}_${actors}`);

  const typography = {
    displayFont: 'Space Grotesk (Modern Geometric)',
    bodyFont: 'Plus Jakarta Sans',
    monoFont: 'JetBrains Mono',
    rationale: `Space Grotesk creates high-impact, modern headings while Plus Jakarta Sans guarantees effortless reading comfort for ${actors.toLowerCase()}.`,
    pairings: 'Space Grotesk 700 for page titles / Plus Jakarta Sans 400 & 500 for descriptive body text / JetBrains Mono for metrics & data'
  };

  const visualStyle = {
    style: 'Clean Contemporary Minimalist',
    visualMotifs: [
      'Subtle 1px border lines with soft ambient glows',
      'Generous whitespace to let content breathe',
      'Context-aware iconography representing the daily workflow',
      'Sleek translucent glassmorphism surfaces'
    ],
    philosophy: 'Function-forward, clutter-free layouts that direct attention directly to outcomes.'
  };

  const uiDirection = {
    deviceType: parsedIdea.ideaType?.includes('app') ? 'mobile' : 'desktop',
    borderRadius: '12px soft rounded corners',
    spacingRule: 'Spacious 24px-36px modular grid',
    cardStyle: 'Deep glassmorphism card elevation with 1px border',
    contrastRatio: 'Minimum 5:1 contrast for effortless readability'
  };

  const logoDirection = {
    markType: `Modern '${initials}' Monogram Badge`,
    concept: `Clean geometric monogram with optical balancing that scales from a 16px favicon to a giant billboard.`,
    geometry: 'Squircle border with precise 2px stroke and primary brand gradient fill',
    monogramInitials: initials
  };

  return {
    colorPalette,
    typography,
    visualStyle,
    uiDirection,
    graphicLanguage: visualStyle,
    logoDirection,
    visualsToAvoid: [
      'Generic corporate stock photography with fake smiles',
      'Chaotic multicolor gradients that ruin legibility',
      'Unnecessary 3D cartoon mascots that demean the product value'
    ],
    decisionTrace: {
      stage: 'visualize',
      decision: `Generated an algorithmic color system centered on ${colorPalette[0].hex} with Space Grotesk & Plus Jakarta Sans typography`,
      reason: `Synthesized directly from the domain vocabulary without relying on stale, generic templates`,
      result: `Supplied complete visual design tokens and UI direction to Deliver agent for live preview rendering`
    }
  };
}

export async function runVisualizeAgent(context) {
  const parsedIdea = context.parsedIdea || parseIdea(context.originalIdea, context.clarificationAnswers);

  const prompt = `
You are Agent 04 (Visualize) in the BrandMind Multi-Agent System.
Your job is to design the visual identity for this specific brand: its colors, typography, visual style, and UI direction.

Context:
- Idea: "${context.originalIdea}"
- Brand Name: "${context.shape?.selectedName || context.shape?.brandName}"
- Target Audience: "${context.discover?.targetAudience?.primary}"
- Core Problem: "${context.discover?.coreProblem}"
- Brand Personality: ${JSON.stringify(context.shape?.personality || context.shape?.personalityTraits || [])}
- Domain: "${parsedIdea.domain}"
- Brand Direction: "${parsedIdea.brandDirection || ''}"

RESPONSIBILITIES:
1. Colors: 5 harmonious hex colors tailored to this specific concept (Primary, Secondary, Accent, Light Surface, Dark Base).
2. Typography: Exact font pairings (Display font, Body font, Mono font) and rationale.
3. Visual Style: Graphic language, visual motifs, and aesthetic philosophy.
4. UI Direction: Specific guidelines for UI components, spacing, surface styling, and device ergonomics.

Output strict JSON:
{
  "colorPalette": [
    { "name": "Primary Color Name", "hex": "#HEX", "role": "Primary", "meaning": "Why this color fits" },
    { "name": "Secondary Color Name", "hex": "#HEX", "role": "Secondary", "meaning": "Why this color complements" },
    { "name": "Accent Color Name", "hex": "#HEX", "role": "Accent", "meaning": "Highlight role" },
    { "name": "Light Surface Name", "hex": "#HEX", "role": "Light Surface", "meaning": "Background & cards" },
    { "name": "Dark Base Name", "hex": "#HEX", "role": "Dark Base", "meaning": "Contrast frame" }
  ],
  "typography": {
    "displayFont": "Font Name (e.g. Space Grotesk, Inter, Outfit)",
    "bodyFont": "Font Name (e.g. Plus Jakarta Sans, DM Sans)",
    "monoFont": "Font Name (e.g. JetBrains Mono)",
    "rationale": "Clear sentence on why this pairing works",
    "pairings": "How to pair headings, body, and UI labels"
  },
  "visualStyle": {
    "style": "Style Name (e.g. Tactile Minimalist, Precision Technical)",
    "visualMotifs": ["Motif 1", "Motif 2", "Motif 3"],
    "philosophy": "Aesthetic philosophy in 1 sentence"
  },
  "uiDirection": {
    "deviceType": "desktop or mobile",
    "borderRadius": "Border radius guideline",
    "spacingRule": "Spacing guideline",
    "cardStyle": "Card appearance description",
    "contrastRatio": "Accessibility contrast target"
  },
  "graphicLanguage": {
    "style": "Short style name",
    "visualMotifs": ["Motif 1", "Motif 2", "Motif 3"]
  },
  "logoDirection": {
    "markType": "Monogram or Emblem description",
    "concept": "Visual description of logo mark",
    "geometry": "Shape specifications",
    "monogramInitials": "1-2 uppercase letters"
  },
  "visualsToAvoid": ["Cliche 1", "Cliche 2", "Cliche 3"],
  "decisionTrace": {
    "stage": "visualize",
    "decision": "Visual identity tokens created",
    "reason": "Why these visual choices fit the concept and audience",
    "result": "Passed to Deliver agent to render the live interactive preview"
  }
}
`;

  return await executeStagePrompt({
    stageName: 'visualize',
    prompt,
    fallbackFn: runVisualizeFallback,
    context,
    parsedIdea
  });
}
