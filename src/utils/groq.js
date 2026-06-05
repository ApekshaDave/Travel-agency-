// src/utils/groq.js
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

export async function callGroq(messages, system, options = {}) {
  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: system },
      ...messages,
    ],
    max_tokens: options.maxTokens ?? 1000,
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
 * Robustly parse JSON from Groq response.
 * Handles: markdown code fences, leading/trailing text, truncated JSON.
 */
function robustParseJSON(raw) {
  // 1. Strip markdown code fences (```json ... ``` or ``` ... ```)
  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '');
  cleaned = cleaned.trim();

  // 2. Try direct parse first
  try {
    return JSON.parse(cleaned);
  } catch (_) { /* fall through */ }

  // 3. Extract first JSON object or array with brace matching
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  const start = firstBrace === -1 ? firstBracket
    : firstBracket === -1 ? firstBrace
    : Math.min(firstBrace, firstBracket);

  if (start !== -1) {
    const opener = cleaned[start];
    const closer = opener === '{' ? '}' : ']';
    let depth = 0;
    let end = -1;
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
      } catch (_) { /* fall through */ }
    }

    // 4. Truncated JSON — try to close it gracefully
    const partial = cleaned.slice(start);
    // Count unclosed braces/brackets
    let openBraces = 0, openBrackets = 0;
    let inString = false;
    let escape = false;
    for (const ch of partial) {
      if (escape) { escape = false; continue; }
      if (ch === '\\' && inString) { escape = true; continue; }
      if (ch === '"') { inString = !inString; continue; }
      if (inString) continue;
      if (ch === '{') openBraces++;
      else if (ch === '}') openBraces--;
      else if (ch === '[') openBrackets++;
      else if (ch === ']') openBrackets--;
    }
    // Close any dangling string
    let repaired = inString ? partial + '"' : partial;
    // Close open arrays and objects
    repaired += ']'.repeat(Math.max(0, openBrackets));
    repaired += '}'.repeat(Math.max(0, openBraces));
    try {
      return JSON.parse(repaired);
    } catch (_) { /* fall through */ }
  }

  throw new SyntaxError(`Could not parse Groq response as JSON.\n\nRaw: ${raw.slice(0, 300)}`);
}

export async function askGroqJSON(prompt, system, options = {}) {
  const result = await askGroq(prompt, system, {
    ...options,
    maxTokens: options.maxTokens ?? 4096,
  });

  try {
    return robustParseJSON(result);
  } catch (error) {
    console.error("Invalid JSON returned by Groq:", result);
    throw new Error(`AI returned invalid JSON: ${error.message}`);
  }
}