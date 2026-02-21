"""Configuração: carrega .env e constantes do projeto."""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Diretório do projeto e onde ficam os trechos do livro
PROJECT_ROOT = Path(__file__).resolve().parent.parent
LIVRO_DIR = PROJECT_ROOT / "livro"
AUDIO_DIR = PROJECT_ROOT / "livro" / "audio"

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GROQ_MODEL = os.environ.get("GROQ_MODEL", "llama-3.3-70b-versatile")

# Azure Speech (Microsoft Cognitive Services) — TTS nas meditações
AZURE_SPEECH_KEY = os.environ.get("AZURE_SPEECH_KEY")
AZURE_SPEECH_REGION = os.environ.get("AZURE_SPEECH_REGION")
AZURE_SPEECH_VOICE = os.environ.get("AZURE_SPEECH_VOICE", "pt-BR-FranciscaNeural")


def ensure_livro_dir() -> None:
    LIVRO_DIR.mkdir(parents=True, exist_ok=True)
