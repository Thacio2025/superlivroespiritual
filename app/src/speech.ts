/**
 * Azure Speech (Microsoft Cognitive Services) no browser.
 * Obtém token do backend (Netlify function) e usa o SDK para TTS (voz pt-BR-FranciscaNeural).
 */
const API = "/.netlify/functions";
const VOICE = "pt-BR-FranciscaNeural";

export async function speak(text: string): Promise<void> {
  const tokenRes = await fetch(`${API}/speech-token`);
  if (!tokenRes.ok) {
    const data = await tokenRes.json().catch(() => ({}));
    throw new Error(data.error || "Voz não disponível. Configure AZURE_SPEECH_KEY e REGION no Netlify.");
  }
  const { token, region } = (await tokenRes.json()) as { token: string; region: string };

  const sdk = await import("microsoft-cognitiveservices-speech-sdk");
  const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, region);
  speechConfig.speechSynthesisVoiceName = VOICE;

  const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();
  const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

  return new Promise((resolve, reject) => {
    synthesizer.speakTextAsync(
      text,
      () => {
        synthesizer.close();
        resolve();
      },
      (err) => {
        synthesizer.close();
        reject(new Error(err || "Falha na síntese de voz"));
      }
    );
  });
}
