/**
 * Azure Speech (Microsoft Cognitive Services) no browser.
 * Obtém token do backend (Netlify function) e usa o SDK para TTS (voz pt-BR-FranciscaNeural).
 * Import estático evita "Failed to fetch dynamically imported module" após novo deploy.
 */
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

const API = "/.netlify/functions";
const VOICE = "pt-BR-FranciscaNeural";
/** Velocidade da fala: -15% = um pouco mais devagar (aceita -50% a +50%, ou "slow", "x-slow") */
const SPEECH_RATE = "-15%";

function escapeSsml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function speak(text: string): Promise<void> {
  const tokenRes = await fetch(`${API}/speech-token`);
  if (!tokenRes.ok) {
    const data = await tokenRes.json().catch(() => ({}));
    const msg = data.error || "Voz não disponível.";
    throw new Error(
      msg.includes("não configurado")
        ? `${msg} Configure AZURE_SPEECH_KEY e AZURE_SPEECH_REGION no Netlify (Environment variables).`
        : msg
    );
  }
  const { token, region } = (await tokenRes.json()) as { token: string; region: string };

  const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, region);
  speechConfig.speechSynthesisVoiceName = VOICE;

  const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
  const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-BR"><voice name="${VOICE}"><prosody rate="${SPEECH_RATE}">${escapeSsml(text)}</prosody></voice></speak>`;

  return new Promise((resolve, reject) => {
    synthesizer.speakSsmlAsync(
      ssml,
      () => {
        synthesizer.close();
        resolve();
      },
      (err) => {
        synthesizer.close();
        const msg =
          typeof err === "string"
            ? err
            : "Falha na síntese de voz. Verifique AZURE_SPEECH_KEY e AZURE_SPEECH_REGION no Netlify e permita áudio para este site no navegador.";
        reject(new Error(msg));
      }
    );
  });
}
