import type { Handler } from "@netlify/functions";

/**
 * Devolve um token de autorização para o cliente usar com o Azure Speech SDK
 * (text-to-speech no browser, voz pt-BR). Igual ao retiro: a chave fica só
 * no servidor (Netlify env); o cliente só recebe um token temporário.
 */
export const handler: Handler = async () => {
  const key = process.env.AZURE_SPEECH_KEY;
  const region = process.env.AZURE_SPEECH_REGION;

  if (!key || !region) {
    return {
      statusCode: 503,
      body: JSON.stringify({ error: "Azure Speech não configurado (AZURE_SPEECH_KEY / REGION)" }),
    };
  }

  const tokenUrl = `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`;
  const res = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      "Content-Length": "0",
    },
  });

  if (!res.ok) {
    return {
      statusCode: res.status,
      body: JSON.stringify({ error: "Falha ao obter token Azure Speech" }),
    };
  }

  const token = await res.text();
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, region }),
  };
};
