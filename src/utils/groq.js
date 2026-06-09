// src/utils/groq.js
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

// llama-3.1-8b-instant limits:
//   Context window : 131 072 tokens
//   Max output     : 8 192 tokens
//   Free TPM       : 6 000 tokens/minute
//
// Strategy: multiModalApi.js splits large requests into two calls of
// ~2500 tokens each with a 1.1s gap. This file just enforces a hard
// ceiling so no single call ever exceeds what the model allows.

const MODEL = "llama-3.1-8b-instant";

// Hard ceiling per call — model supports 8192 but free TPM is 6000/min,
// so we cap at 4000 to leave headroom for the input tokens.
const HARD_MAX_OUTPUT = 4000;

// Input prompt character budget (~1 token ≈ 4 chars)
const MAX_PROMPT_CHARS = 12000; // ~3000 tokens input

/**
 * Truncate a string to maxChars, preserving start and end (middle cut).
 */
function truncate(text, maxChars = MAX_PROMPT_CHARS) {
  if (!text || text.length <= maxChars) return text;
  const half = Math.floor(maxChars / 2);
  return (
    text.slice(0, half) +
    "\n\n[... content truncated to fit token limit ...]\n\n" +
    text.slice(text.length - half)
  );
}

/**
 * Trim messages so the combined prompt fits within the character budget.
 */
function trimMessages(messages, system) {
  const trimmedSystem = truncate(system, 3000);
  const perMsgBudget = Math.floor(
    (MAX_PROMPT_CHARS - trimmedSystem.length) / Math.max(messages.length, 1)
  );
  const trimmedMessages = messages.map((m) => ({
    ...m,
    content: truncate(String(m.content ?? ""), perMsgBudget),
  }));
  return { trimmedSystem, trimmedMessages };
}

export async function callGroq(messages, system, options = {}) {
  const { trimmedSystem, trimmedMessages } = trimMessages(messages, system);

  // Respect the caller's requested maxTokens but never exceed HARD_MAX_OUTPUT
  const maxTokens = Math.min(
    options.maxTokens ?? 1000,
    HARD_MAX_OUTPUT
  );

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: trimmedSystem },
      ...trimmedMessages,
    ],
    max_tokens: maxTokens,
    temperature: options.temperature ?? 0.7,
  });

  return response.choices[0]?.message?.content ?? "";
}

export async function askGroq(prompt, system, options = {}) {
  return callGroq(
    [{ role: "user", content: prompt }],
    system,
    options
  );
}

/**
 * Robustly parse JSON from a Groq response.
 * Handles: markdown fences, leading/trailing text, truncated JSON.
 */
function robustParseJSON(raw) {
  // 1. Strip markdown code fences
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
  cleaned = cleaned.trim();

  // 2. Direct parse
  try {
    return JSON.parse(cleaned);
  } catch { /* fall through */ }

  // 3. Extract first JSON object or array via brace matching
  const firstBrace   = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");
  const start =
    firstBrace === -1    ? firstBracket
    : firstBracket === -1 ? firstBrace
    : Math.min(firstBrace, firstBracket);

  if (start !== -1) {
    const opener = cleaned[start];
    const closer = opener === "{" ? "}" : "]";
    let depth = 0;
    let end   = -1;

    for (let i = start; i < cleaned.length; i++) {
      if (cleaned[i] === opener) depth++;
      else if (cleaned[i] === closer) {
        depth--;
        if (depth === 0) { end = i; break; }
      }
    }

    if (end !== -1) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch { /* fall through */ }
    }

    // 4. Truncated JSON — attempt repair
    const partial = cleaned.slice(start);
    let openBraces = 0, openBrackets = 0;
    let inString = false, escape = false;

    for (const ch of partial) {
      if (escape)                  { escape = false; continue; }
      if (ch === "\\" && inString) { escape = true;  continue; }
      if (ch === '"')              { inString = !inString; continue; }
      if (inString)                continue;
      if      (ch === "{")  openBraces++;
      else if (ch === "}")  openBraces--;
      else if (ch === "[")  openBrackets++;
      else if (ch === "]")  openBrackets--;
    }

    let repaired = inString ? partial + '"' : partial;
    repaired += "]".repeat(Math.max(0, openBrackets));
    repaired += "}".repeat(Math.max(0, openBraces));

    try {
      return JSON.parse(repaired);
    } catch { /* fall through */ }
  }

  throw new SyntaxError(
    `Could not parse Groq response as JSON.\n\nRaw: ${raw.slice(0, 300)}`
  );
}

/**
 * Ask Groq and parse the response as JSON.
 * Instructs the model to return only raw JSON (no markdown).
 */
export async function askGroqJSON(prompt, system, options = {}) {
  const jsonSystem =
    system.trimEnd() +
    "\n\nIMPORTANT: Respond with raw JSON only — no markdown, no code fences, no commentary.";

  const result = await askGroq(prompt, jsonSystem, {
    ...options,
    maxTokens: Math.min(options.maxTokens ?? 1000, HARD_MAX_OUTPUT),
    temperature: options.temperature ?? 0.2,
  });

  try {
    return robustParseJSON(result);
  } catch (error) {
    console.error("Invalid JSON returned by Groq:", result);
    throw new Error(`AI returned invalid JSON: ${error.message}`, { cause: error });
  }
}