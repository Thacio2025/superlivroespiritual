import type { Handler } from "@netlify/functions";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const SYSTEM_PROMPT = `Tu és um escritor que compõe textos no espírito da tradição contemplativa cristã:
Padres do Deserto, monges beneditinos e cartuxos, e santos místicos (São João da Cruz, Santa Teresa, etc.).
Escreves em português, com linguagem sóbria e profunda, como aforismos ou breves meditações.
Cada texto deve ser autocontido, entre 2 e 5 parágrafos curtos, sem título no início.
Não inventes citações literais; inspira-te no estilo e nos temas (silêncio, humildade, oração, deserto interior, abandono).`;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return { statusCode: 500, body: JSON.stringify({ error: "GROQ_API_KEY não configurada" }) };
  }

  let body: { theme?: string } = {};
  try {
    body = typeof event.body === "string" ? JSON.parse(event.body || "{}") : event.body || {};
  } catch {
    // body opcional
  }

  const userMessage = body.theme
    ? `Gera um novo trecho de meditação ou aforismo sobre a vida espiritual. Tema ou fio condutor: ${body.theme}`
    : "Gera um novo trecho de meditação ou aforismo sobre a vida espiritual.";

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
        { role: "user", content: userMessage },
      ],
      temperature: 0.8,
      max_tokens: 600,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return { statusCode: res.status, body: JSON.stringify({ error: err }) };
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content?.trim() ?? "";

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  };
};
