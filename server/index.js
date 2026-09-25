import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.join(__dirname, '..', 'dist');

const GEMINI_MODEL = 'gemini-2.5-flash';

function sendJson(res, status, data) {
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
    });

    res.end(JSON.stringify(data));
}

/**
 * Sleep for ms milliseconds.
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Call the Gemini API with exponential backoff retry.
 * Retries on 503 (service unavailable / high demand) and 429 (rate limit).
 * Base delay: 1s → 2s → 4s → 8s (jitter ±20%).
 */
async function callGeminiWithRetry(url, payload, maxRetries = 4) {
    let lastError = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        if (attempt > 0) {
            const baseDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
            const jitter = baseDelay * 0.2 * (Math.random() * 2 - 1);
            const delay = Math.round(baseDelay + jitter);
            console.log(`[BrandMind] Gemini retry attempt ${attempt}/${maxRetries} in ${delay}ms...`);
            await sleep(delay);
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': GEMINI_API_KEY
                },
                body: JSON.stringify(payload)
            });

            // These status codes are retryable
            if (response.status === 503 || response.status === 429) {
                const errData = await response.json().catch(() => ({}));
                const msg = errData?.error?.message || `HTTP ${response.status}`;
                lastError = new Error(msg);
                console.warn(`[BrandMind] Gemini ${response.status} on attempt ${attempt}: ${msg}`);
                continue; // retry
            }

            return response; // success or non-retryable error — caller handles it
        } catch (err) {
            // Network-level errors (fetch failed, ECONNRESET, etc.) — also retryable
            lastError = err;
            console.warn(`[BrandMind] Gemini fetch error on attempt ${attempt}:`, err.message);
        }
    }

    throw lastError || new Error('All Gemini retry attempts exhausted.');
}

function getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();

    const types = {
        '.html': 'text/html',
        '.js': 'application/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon',
        '.webp': 'image/webp'
    };

    return types[ext] || 'application/octet-stream';
}

async function handleGemini(req, res) {
    if (!GEMINI_API_KEY) {
        return sendJson(res, 500, {
            error: 'Gemini API key is not configured on the server.'
        });
    }

    let body = '';

    req.on('data', chunk => {
        body += chunk;

        if (body.length > 1_000_000) {
            req.destroy();
        }
    });

    req.on('end', async () => {
        try {
            const parsed = JSON.parse(body || '{}');
            const prompt = parsed.prompt;

            if (!prompt || typeof prompt !== 'string') {
                return sendJson(res, 400, {
                    error: 'Prompt is required.'
                });
            }

            const url =
                `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

            const payload = {
                contents: [
                    {
                        role: 'user',
                        parts: [{ text: prompt }]
                    }
                ],
                generationConfig: {
                    // NOTE: No responseMimeType — gemini-2.5-flash is a thinking
                    // model and returns empty if this key is present.
                    // JSON is extracted from the text output below.
                    temperature: 0.6,
                    maxOutputTokens: 16384
                }
            };

            // Use retry wrapper — handles 503 "high demand" and 429 rate limits
            const response = await callGeminiWithRetry(url, payload);

            const data = await response.json();

            if (!response.ok) {
                console.error('Gemini error:', data);
                return sendJson(res, response.status, {
                    error: data?.error?.message || 'Gemini API request failed.'
                });
            }

            const text =
                data?.candidates?.[0]?.content?.parts
                    ?.map(part => part.text || '')
                    .join('') || '';

            if (!text) {
                return sendJson(res, 502, {
                    error: 'Gemini returned an empty response.'
                });
            }

            let result;

            try {
                // Thinking models may wrap output in markdown code fences — strip them
                const cleaned = text
                    .replace(/^```json\s*/i, '')
                    .replace(/^```\s*/i, '')
                    .replace(/```\s*$/i, '')
                    .trim();
                result = JSON.parse(cleaned);
            } catch {
                // Fallback: find first {...} block in the raw text
                const match = text.match(/\{[\s\S]*\}/);
                if (!match) {
                    return sendJson(res, 502, {
                        error: 'Gemini returned invalid JSON.'
                    });
                }
                result = JSON.parse(match[0]);
            }

            return sendJson(res, 200, { result });

        } catch (error) {
            console.error('Backend error:', error);

            return sendJson(res, 500, {
                error: 'Server failed to process the Gemini request.'
            });
        }
    });
}

function serveStatic(req, res) {
    let requestPath = decodeURIComponent(req.url.split('?')[0]);

    if (requestPath === '/') {
        requestPath = '/index.html';
    }

    let filePath = path.join(DIST_DIR, requestPath);

    if (!filePath.startsWith(DIST_DIR)) {
        return sendJson(res, 403, {
            error: 'Forbidden'
        });
    }

    if (
        !fs.existsSync(filePath) ||
        fs.statSync(filePath).isDirectory()
    ) {
        filePath = path.join(DIST_DIR, 'index.html');
    }

    if (!fs.existsSync(filePath)) {
        return sendJson(res, 404, {
            error:
                'Frontend build not found. Run npm run build first.'
        });
    }

    res.writeHead(200, {
        'Content-Type': getContentType(filePath)
    });

    fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
    if (
        req.method === 'POST' &&
        req.url === '/api/gemini'
    ) {
        return handleGemini(req, res);
    }

    if (
        req.method === 'GET' &&
        req.url === '/api/health'
    ) {
        return sendJson(res, 200, {
            status: 'ok'
        });
    }

    if (req.method === 'GET') {
        return serveStatic(req, res);
    }

    return sendJson(res, 405, {
        error: 'Method not allowed'
    });
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(
        `BrandMind server running on port ${PORT}`
    );
});