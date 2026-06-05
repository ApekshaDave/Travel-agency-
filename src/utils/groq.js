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

export async function askGroqJSON(prompt, system, options = {}) {
  const result = await askGroq(prompt, system, options);

  try {
    return JSON.parse(result);
  } catch (error) {
    console.error("Invalid JSON returned by Groq:", result);
    throw error;
  }
}