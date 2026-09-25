/**
 * BrandMind — Provider-Aware AI Engine
 * Keys are auto-loaded from .env (VITE_GEMINI_API_KEY / VITE_GROQ_API_KEY).
 * Falls back to deterministic engine if keys not set or call fails.
 */

// Read from .env automatically via Vite
function getEnvKeys() {
  return {
    geminiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    groqKey: import.meta.env.VITE_GROQ_API_KEY || '',
  };
}

const STORAGE_KEYS = {
  GEMINI: 'brandmind_gemini_key',
  GROQ: 'brandmind_groq_key',
  PROVIDER: 'brandmind_provider'
};

export function getStoredCredentials() {
  const envKeys = getEnvKeys();
  try {
    return {
      geminiKey: localStorage.getItem(STORAGE_KEYS.GEMINI) || envKeys.geminiKey,
      groqKey: localStorage.getItem(STORAGE_KEYS.GROQ) || envKeys.groqKey,
      provider: localStorage.getItem(STORAGE_KEYS.PROVIDER) || 'auto'
    };
  } catch {
    return {
      geminiKey: envKeys.geminiKey,
      groqKey: envKeys.groqKey,
      provider: 'auto'
    };
  }
}

export function saveStoredCredentials({ geminiKey, groqKey, provider }) {
  try {
    if (geminiKey !== undefined) localStorage.setItem(STORAGE_KEYS.GEMINI, geminiKey.trim());
    if (groqKey !== undefined) localStorage.setItem(STORAGE_KEYS.GROQ, groqKey.trim());
    if (provider !== undefined) localStorage.setItem(STORAGE_KEYS.PROVIDER, provider);
  } catch {}
}

/**
 * Fetch with a timeout — prevents hanging forever on network errors
 */
async function fetchWithTimeout(url, options, timeoutMs = 25000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Gemini direct browser fetch — tries multiple models in priority order.
 *
 * IMPORTANT — Thinking vs Non-Thinking models:
 *   • gemini-2.5-* are "thinking" models. They do NOT support responseMimeType:'application/json'
 *     and return an empty response ("model output must contain either output text or tool calls")
 *     when that config key is present.
 *   • gemini-2.0-flash and gemini-1.5-flash are standard models that fully support JSON mode.
 *
 * Strategy:
 *   1. Try non-thinking models with native JSON mode first (fast & reliable).
 *   2. Fall back to thinking models using plain text mode + manual JSON extraction.
 */
async function callGemini(apiKey, prompt) {
  // Tier 1 — non-thinking models: support responseMimeType:'application/json'
  const jsonModeModels = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-001',
    'gemini-1.5-flash',
    'gemini-1.5-flash-001',
  ];

  // Tier 2 — thinking models: must use text mode, JSON extracted from output
  const thinkingModeModels = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-preview-05-20',
  ];

  let lastError = null;

  // --- Tier 1: JSON mode ---
  for (const model of jsonModeModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const payload = {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.6,
          maxOutputTokens: 4096
        }
      };

      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }, 28000);

      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 404 || response.status === 400) {
          console.warn(`[BrandMind] Model "${model}" not available (${response.status}), trying next...`);
          lastError = new Error(`${response.status}: model unavailable: ${model}`);
          continue;
        }
        if (response.status === 429) {
          throw new Error(`Rate limit reached. Please wait a moment and try again.`);
        }
        if (response.status === 401 || response.status === 403) {
          throw new Error(`Gemini API key is invalid or missing permissions. Please check your key.`);
        }
        throw new Error(`Gemini API error ${response.status}: ${errText.slice(0, 200)}`);
      }

      const data = await response.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) {
        lastError = new Error(`${model} returned empty content.`);
        continue;
      }
      const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
      return JSON.parse(cleaned);

    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('Gemini API request timed out. Check your network connection.');
      }
      if (err.message?.includes('rate limit') || err.message?.includes('invalid') || err.message?.includes('permission')) {
        throw err;
      }
      lastError = err;
      if (err.message?.includes('404') || err.message?.includes('400') || err.message?.includes('unavailable') || err.message?.includes('empty')) continue;
      throw err;
    }
  }

  // --- Tier 2: Thinking models — text mode, extract JSON block manually ---
  const jsonInstructions = '\n\nIMPORTANT: Respond with ONLY valid JSON. No markdown fences, no explanation text before or after.';
  for (const model of thinkingModeModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
      const payload = {
        contents: [{ role: 'user', parts: [{ text: prompt + jsonInstructions }] }],
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 8192
          // NOTE: No responseMimeType here — thinking models reject it
        }
      };

      const response = await fetchWithTimeout(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }, 45000);

      if (!response.ok) {
        const errText = await response.text();
        if (response.status === 404 || response.status === 400) {
          console.warn(`[BrandMind] Thinking model "${model}" not available (${response.status}), skipping...`);
          lastError = new Error(`${response.status}: model unavailable: ${model}`);
          continue;
        }
        if (response.status === 429) throw new Error('Rate limit reached. Please wait a moment and try again.');
        if (response.status === 401 || response.status === 403) throw new Error('Gemini API key is invalid or missing permissions.');
        throw new Error(`Gemini API error ${response.status}: ${errText.slice(0, 200)}`);
      }

      const data = await response.json();
      const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!raw) {
        lastError = new Error(`${model} returned empty content.`);
        continue;
      }

      // Extract JSON from thinking model output (may be wrapped in markdown or thinking tags)
      const jsonMatch = raw.match(/```json\s*([\s\S]*?)```/) ||
                        raw.match(/```\s*([\s\S]*?)```/) ||
                        raw.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : raw;
      return JSON.parse(jsonStr.trim());

    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('Gemini API request timed out. Check your network connection.');
      }
      if (err.message?.includes('rate limit') || err.message?.includes('invalid') || err.message?.includes('permission')) {
        throw err;
      }
      lastError = err;
    }
  }

  throw lastError || new Error('All Gemini models failed. Check your API key and network connection.');
}

/**
 * Groq OpenAI-compatible endpoint
 */
async function callGroq(apiKey, prompt) {
  const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'You are BrandMind, an expert brand strategist. Always respond with valid JSON matching the schema exactly. Use clear, human language — avoid corporate jargon and buzzwords.'
        },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.6,
      max_tokens: 4096
    })
  }, 30000);

  if (!response.ok) {
    const err = await response.text();
    if (response.status === 429) throw new Error('Groq rate limit reached. Please wait and try again.');
    if (response.status === 401) throw new Error('Groq API key is invalid.');
    throw new Error(`Groq ${response.status}: ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  const raw = data?.choices?.[0]?.message?.content;
  if (!raw) throw new Error('Groq returned an empty response.');
  return JSON.parse(raw);
}

/**
 * Main stage dispatcher — auto-selects live AI or falls back to idea-aware engine
 */
export async function executeStagePrompt({ stageName, prompt, fallbackFn, context, parsedIdea }) {
  const creds = getStoredCredentials();

  // Explicit offline mode or no keys provided
  if (creds.provider === 'fallback' || (!creds.geminiKey && !creds.groqKey)) {
    return { result: fallbackFn(context, parsedIdea), executionMode: 'fallback' };
  }

  // Try Gemini first if available
  if ((creds.provider === 'auto' || creds.provider === 'gemini') && creds.geminiKey) {
    try {
      const result = await callGemini(creds.geminiKey, prompt);
      return { result, executionMode: 'live-gemini' };
    } catch (err) {
      console.warn(`[BrandMind] Gemini failed for "${stageName}":`, err.message);
      // If it's a timeout/network error, don't try Groq either — fail clearly
      if (err.message?.includes('timed out') || err.message?.includes('network') || err.name === 'AbortError') {
        console.warn(`[BrandMind] Network appears down. Falling back to offline engine for "${stageName}".`);
        return { result: fallbackFn(context, parsedIdea), executionMode: 'fallback' };
      }
      // Fall through to Groq
    }
  }

  // Try Groq if available
  if ((creds.provider === 'auto' || creds.provider === 'groq') && creds.groqKey) {
    try {
      const result = await callGroq(creds.groqKey, prompt);
      return { result, executionMode: 'live-groq' };
    } catch (err) {
      console.warn(`[BrandMind] Groq failed for "${stageName}":`, err.message);
    }
  }

  // Deterministic fallback — always works offline
  return { result: fallbackFn(context, parsedIdea), executionMode: 'fallback' };
}
