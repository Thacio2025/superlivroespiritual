/**
 * Azure Speech (Microsoft Cognitive Services) no browser.
 * Sintetiza para MP3 em stream e toca via elemento <audio> (compatível com iOS
 * quando o áudio é "desbloqueado" no clique, no App).
 */
import * as sdk from "microsoft-cognitiveservices-speech-sdk";

const API = "/.netlify/functions";
const VOICE = "pt-BR-JulioNeural";
const SPEECH_RATE = "70%";
/** Token válido por 9 min (Azure dura 10). Assim o primeiro clique já usa token e o áudio sai. */
const TOKEN_TTL_MS = 9 * 60 * 1000;
/** Tamanho máximo por bloco de síntese (evita timeout em textos muito longos). */
const CHUNK_MAX_CHARS = 3500;

/** Coleta os bytes de áudio da síntese para tocar via HTML Audio. */
class StreamCollector extends sdk.PushAudioOutputStreamCallback {
  private chunks: ArrayBuffer[] = [];
  write(dataBuffer: ArrayBuffer): void {
    this.chunks.push(dataBuffer);
  }
  close(): void {}
  getBlob(): Blob {
    return new Blob(this.chunks, { type: "audio/mpeg" });
  }
}

/** Toca um Blob de áudio via elemento Audio (mesmo caminho da música, compatível com iOS). */
function playBlobAsAudio(blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.onended = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Falha ao reproduzir áudio"));
    };
    audio.play().catch(reject);
  });
}

let cached: { token: string; region: string; at: number } | null = null;

function escapeSsml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function getToken(): Promise<{ token: string; region: string }> {
  if (cached && Date.now() - cached.at < TOKEN_TTL_MS) {
    return { token: cached.token, region: cached.region };
  }
  const res = await fetch(`${API}/speech-token`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data.error || "Voz não disponível.";
    throw new Error(
      msg.includes("não configurado")
        ? `${msg} Configure AZURE_SPEECH_KEY e AZURE_SPEECH_REGION no Netlify.`
        : msg
    );
  }
  const { token, region } = (await res.json()) as { token: string; region: string };
  cached = { token, region, at: Date.now() };
  return { token, region };
}

/** Pré-busca o token quando há texto (chame ao exibir o fragmento). Assim o primeiro "Ouvir" já tem token. */
export async function prefetchToken(): Promise<void> {
  try {
    await getToken();
  } catch {
    // ignora; ao clicar Ouvir o erro será mostrado
  }
}

function splitIntoChunks(text: string): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.length <= CHUNK_MAX_CHARS) return [trimmed];

  const chunks: string[] = [];
  let rest = trimmed;

  while (rest.length > 0) {
    if (rest.length <= CHUNK_MAX_CHARS) {
      chunks.push(rest);
      break;
    }
    const slice = rest.slice(0, CHUNK_MAX_CHARS);
    const lastBreak = Math.max(slice.lastIndexOf("\n\n"), slice.lastIndexOf(". "), slice.lastIndexOf(" "));
    const cut = lastBreak > CHUNK_MAX_CHARS / 2 ? lastBreak + 1 : CHUNK_MAX_CHARS;
    chunks.push(rest.slice(0, cut).trim());
    rest = rest.slice(cut).trim();
  }

  return chunks.filter(Boolean);
}

/** Sintetiza um bloco SSML para MP3 e toca via HTML Audio (compatível com iPhone). */
async function synthesizeAndPlayChunk(
  speechConfig: sdk.SpeechConfig,
  ssml: string
): Promise<void> {
  const collector = new StreamCollector();
  const stream = sdk.PushAudioOutputStream.create(collector);
  const audioConfig = sdk.AudioConfig.fromStreamOutput(stream);
  const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

  await new Promise<void>((resolve, reject) => {
    synthesizer.speakSsmlAsync(
      ssml,
      () => {
        synthesizer.close();
        resolve();
      },
      (err) => {
        synthesizer.close();
        const msg = typeof err === "string" ? err : "Falha na síntese de voz.";
        reject(new Error(msg));
      }
    );
  });

  const blob = collector.getBlob();
  if (blob.size > 0) {
    await playBlobAsAudio(blob);
  }
}

export async function speak(text: string): Promise<void> {
  const { token, region } = await getToken();

  const speechConfig = sdk.SpeechConfig.fromAuthorizationToken(token, region);
  speechConfig.speechSynthesisVoiceName = VOICE;
  speechConfig.speechSynthesisOutputFormat =
    sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

  const chunks = splitIntoChunks(text);
  const ssmlParts = chunks.map(
    (chunk) =>
      `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="pt-BR"><voice name="${VOICE}"><prosody rate="${SPEECH_RATE}">${escapeSsml(chunk)}</prosody></voice></speak>`
  );

  for (const ssml of ssmlParts) {
    await synthesizeAndPlayChunk(speechConfig, ssml);
  }
}
