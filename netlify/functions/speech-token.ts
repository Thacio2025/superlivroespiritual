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
    const body = await res.text();
    const msg =
      res.status === 401
        ? "Chave Azure inválida. Confira AZURE_SPEECH_KEY no Netlify (Chave 1 do recurso Speech)."
        : res.status === 404
          ? "Região inválida. Confira AZURE_SPEECH_REGION (ex.: brazilsouth)."
          : `Falha ao obter token Azure (${res.status}). ${body || ""}`;
    return {
      statusCode: res.status,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: msg }),
    };
  }

  const token = await res.text();
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, region }),
  };
};
