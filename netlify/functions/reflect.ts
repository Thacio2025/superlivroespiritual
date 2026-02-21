import type { Handler } from "@netlify/functions";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const SYSTEM_PROMPT = `Tu és um leitor contemplativo. Recebes um trecho sobre vida espiritual (Padres do Deserto, monges, místicos)
e respondes com uma breve reflexão ou uma pergunta de meditação, em português.
Sê conciso: um parágrafo ou duas frases que ajudem a interiorizar o texto, sem repetir o que já foi dito.`;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return { statusCode: 500, body: JSON.stringify({ error: "GROQ_API_KEY não configurada" }) };
  }

  let body: { content?: string } = {};
  try {
    body = typeof event.body === "string" ? JSON.parse(event.body || "{}") : event.body || {};
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "body inválido" }) };
  }

  const content = body.content?.trim();
  if (!content) {
    return { statusCode: 400, body: JSON.stringify({ error: "content é obrigatório" }) };
  }

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Trecho para refletir:\n\n${content}` },
      ],
      temperature: 0.5,
      max_tokens: 350,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return { statusCode: res.status, body: JSON.stringify({ error: err }) };
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const reflection = data.choices?.[0]?.message?.content?.trim() ?? "";

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reflection }),
  };
};
