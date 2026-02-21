"""Azure Speech (Microsoft Cognitive Services) — text-to-speech nas meditações.

Usa a mesma configuração do retiro: AZURE_SPEECH_KEY e AZURE_SPEECH_REGION.
Voz neural pt-BR (FranciscaNeural). A chave só existe em variáveis de ambiente
(.env ou painel do Netlify no outro app); nunca no código.
"""
from pathlib import Path
from datetime import datetime

from .config import (
    AZURE_SPEECH_KEY,
    AZURE_SPEECH_REGION,
    AZURE_SPEECH_VOICE,
    AUDIO_DIR,
)


def _ensure_audio_dir() -> None:
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)


def send_to_reader(text: str, title: str = "Super Livro") -> Path | None:
    """
    Sintetiza o texto com Azure Speech (voz pt-BR-FranciscaNeural) e salva em áudio.

    Requer AZURE_SPEECH_KEY e AZURE_SPEECH_REGION no .env (Chave 1 do recurso
    Speech no portal Azure; região ex.: brazilsouth).

    Retorna o caminho do arquivo .wav gerado, ou None se as variáveis não
    estiverem configuradas (só imprime o texto no console).
    """
    if not text.strip():
        return None

    if not AZURE_SPEECH_KEY or not AZURE_SPEECH_REGION:
        print("\n" + "=" * 60)
        print(f"[Azure Speech] Título: {title}")
        print("(Configure AZURE_SPEECH_KEY e AZURE_SPEECH_REGION no .env para TTS.)")
        print("=" * 60)
        print(text)
        print("=" * 60 + "\n")
        return None

    try:
        import azure.cognitiveservices.speech as speechsdk
    except ImportError:
        print("[Azure Speech] Instale: pip install azure-cognitiveservices-speech")
        return None

    _ensure_audio_dir()
    safe_title = "".join(c if c.isalnum() or c in " -_" else "_" for c in title)[:50]
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{stamp}_{safe_title.strip() or 'meditacao'}.wav"
    out_path = AUDIO_DIR / filename

    speech_config = speechsdk.SpeechConfig(
        subscription=AZURE_SPEECH_KEY,
        region=AZURE_SPEECH_REGION,
    )
    speech_config.speech_synthesis_voice_name = AZURE_SPEECH_VOICE
    audio_config = speechsdk.audio.AudioOutputConfig(filename=str(out_path))
    synthesizer = speechsdk.SpeechSynthesizer(
        speech_config=speech_config,
        audio_config=audio_config,
    )

    result = synthesizer.speak_text_async(text).get()

    if result.reason == speechsdk.ResultReason.SynthesizingAudioCompleted:
        print(f"\n[Azure Speech] Áudio salvo: {out_path}")
        # Opcional: reproduzir no macOS
        _play_audio_if_macos(out_path)
        return out_path
    else:
        print(f"[Azure Speech] Falha: {result.reason} - {getattr(result, 'error_details', '')}")
        return None


def _play_audio_if_macos(path: Path) -> None:
    """Reproduz o áudio no macOS com afplay (opcional)."""
    import sys
    if sys.platform == "darwin":
        import subprocess
        try:
            subprocess.run(["afplay", str(path)], check=False)
        except FileNotFoundError:
            pass
