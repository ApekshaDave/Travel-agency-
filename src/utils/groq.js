// src/utils/groq.js
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

// llama-3.1-8b-instant hard limits:
//   Context window : 131 072 tokens  (input + output combined)
//   Max output     : 8 192 tokens
// We stay well inside both to avoid rate-limit / overflow errors.
const MODEL = "llama-3.1-8b-instant";
const MAX_OUTPUT_TOKENS = 2048;   // safe ceiling for output
const MAX_PROMPT_CHARS  = 12000;  // ~3 000 tokens — keeps total context low

/**
 * Truncate a string to `maxChars` characters, appending a notice so the
 * model knows the content was cut. Truncates from the *middle* so both
 * the start and end of the text are preserved (better for structured data).
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
 * Trim every message's content so the combined prompt fits the budget.
 * System prompt is trimmed first if needed; user messages share the rest.
 */
function trimMessages(messages, system) {
  const trimmedSystem = truncate(system, 3000);

  // Budget the remaining chars across all messages
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

  const response = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: trimmedSystem },
      ...trimmedMessages,
    ],
    max_tokens: Math.min(options.maxTokens ?? MAX_OUTPUT_TOKENS, MAX_OUTPUT_TOKENS),
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
 * Handles: markdown code fences, leading/trailing text, truncated JSON.
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

  // 3. Extract first JSON object or array with brace matching
  const firstBrace   = cleaned.indexOf("{");
  const firstBracket = cleaned.indexOf("[");
  const start =
    firstBrace === -1   ? firstBracket
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

    // 4. Truncated JSON — repair and retry
    const partial = cleaned.slice(start);
    let openBraces = 0, openBrackets = 0;
    let inString = false, escape = false;

    for (const ch of partial) {
      if (escape)              { escape = false; continue; }
      if (ch === "\\" && inString) { escape = true; continue; }
      if (ch === '"')          { inString = !inString; continue; }
      if (inString)            continue;
      if      (ch === "{")     openBraces++;
      else if (ch === "}")     openBraces--;
      else if (ch === "[")     openBrackets++;
      else if (ch === "]")     openBrackets--;
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
 * Always instructs the model to return only raw JSON (no markdown fences).
 */
export async function askGroqJSON(prompt, system, options = {}) {
  const jsonSystem =
    system.trimEnd() +
    "\n\nIMPORTANT: Respond with raw JSON only — no markdown, no code fences, no commentary.";

  const result = await askGroq(prompt, jsonSystem, {
    ...options,
    // Cap at MAX_OUTPUT_TOKENS; never ask for more than the model can give
    maxTokens: Math.min(options.maxTokens ?? MAX_OUTPUT_TOKENS, MAX_OUTPUT_TOKENS),
    temperature: options.temperature ?? 0.2, // lower temp → more reliable JSON
  });

  try {
    return robustParseJSON(result);
  } catch (error) {
    console.error("Invalid JSON returned by Groq:", result);
    throw new Error(`AI returned invalid JSON: ${error.message}`, { cause: error });
  }
}