/**
 * BrandMind — Deterministic SVG Monogram Generator
 * Generates an ultra-crisp, modern geometric monogram based on brand name and brand color tokens.
 */

// Simple deterministic string hash
function hashString(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Extract 1 or 2 letter monogram from brand name
 */
export function getMonogramLetters(name = '') {
  const cleaned = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  if (parts.length === 1 && parts[0].length >= 2) {
    // If camelCase or PascalCase, check for capital letters
    const capitals = parts[0].match(/[A-Z]/g);
    if (capitals && capitals.length >= 2) {
      return (capitals[0] + capitals[1]).toUpperCase();
    }
    return parts[0].slice(0, 2).toUpperCase();
  }
  return (name[0] || 'B').toUpperCase();
}

/**
 * Generate SVG Monogram definition and raw markup
 */
export function generateLogoMark({
  brandName = 'BrandMind',
  primaryColor = '#6366F1',
  secondaryColor = '#06B6D4',
  accentColor = '#10B981',
  size = 64
}) {
  const letters = getMonogramLetters(brandName);
  const hash = hashString(brandName);
  const variant = hash % 4; // 4 distinct geometric styles

  // Unique gradient IDs
  const gradId = `bm-grad-${hash}`;
  const maskId = `bm-mask-${hash}`;

  let glyphMarkup = '';

  switch (variant) {
    case 0:
      // Rounded Hexagon / Shield with interlocking badge
      glyphMarkup = `
        <defs>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${primaryColor}" />
            <stop offset="100%" stop-color="${secondaryColor}" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" rx="20" fill="#0C101A" />
        <rect x="6" y="6" width="88" height="88" rx="16" fill="url(#${gradId})" fill-opacity="0.12" stroke="url(#${gradId})" stroke-width="2" />
        <circle cx="50" cy="50" r="32" fill="#141A29" stroke="${primaryColor}" stroke-width="1.5" stroke-dasharray="3 3" />
        <text x="50" y="58" font-family="'Space Grotesk', sans-serif" font-size="30" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">
          ${letters}
        </text>
        <circle cx="74" cy="26" r="5" fill="${accentColor}" />
      `;
      break;

    case 1:
      // Diamond / Kinetic Grid Frame
      glyphMarkup = `
        <defs>
          <linearGradient id="${gradId}" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="${secondaryColor}" />
            <stop offset="100%" stop-color="${primaryColor}" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" rx="20" fill="#0C101A" />
        <g transform="translate(50, 50) rotate(45) translate(-36, -36)">
          <rect x="0" y="0" width="72" height="72" rx="12" fill="url(#${gradId})" fill-opacity="0.15" stroke="url(#${gradId})" stroke-width="2" />
        </g>
        <text x="50" y="59" font-family="'Space Grotesk', sans-serif" font-size="32" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="-0.5">
          ${letters}
        </text>
        <circle cx="50" cy="80" r="4" fill="${accentColor}" />
      `;
      break;

    case 2:
      // Double Nested Offset Ring
      glyphMarkup = `
        <defs>
          <linearGradient id="${gradId}" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="${primaryColor}" />
            <stop offset="100%" stop-color="${accentColor}" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" rx="20" fill="#0C101A" />
        <rect x="8" y="8" width="84" height="84" rx="14" fill="#141A29" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" />
        <path d="M26 26 L74 26 L74 74 L26 74 Z" fill="none" stroke="url(#${gradId})" stroke-width="2.5" stroke-linejoin="round" />
        <text x="50" y="58" font-family="'Space Grotesk', sans-serif" font-size="30" font-weight="700" fill="#FFFFFF" text-anchor="middle">
          ${letters}
        </text>
        <circle cx="26" cy="26" r="4" fill="${primaryColor}" />
        <circle cx="74" cy="74" r="4" fill="${accentColor}" />
      `;
      break;

    case 3:
    default:
      // Precision Architectural Chevron
      glyphMarkup = `
        <defs>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${primaryColor}" />
            <stop offset="50%" stop-color="${secondaryColor}" />
            <stop offset="100%" stop-color="${accentColor}" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" rx="20" fill="#0C101A" />
        <circle cx="50" cy="50" r="40" fill="url(#${gradId})" fill-opacity="0.12" stroke="url(#${gradId})" stroke-width="2" />
        <text x="50" y="58" font-family="'Space Grotesk', sans-serif" font-size="31" font-weight="700" fill="#FFFFFF" text-anchor="middle" letter-spacing="-1">
          ${letters}
        </text>
        <path d="M38 72 L50 80 L62 72" fill="none" stroke="${accentColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
      `;
      break;
  }

  const svgXml = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}" aria-label="${brandName} Logo Monogram">${glyphMarkup}</svg>`;

  return {
    letters,
    svgXml,
    variant,
    primaryColor,
    secondaryColor
  };
}
