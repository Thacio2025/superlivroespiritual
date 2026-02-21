"""Leitor IA: reflexão / meditação sobre um trecho do livro (via Groq)."""
from groq import Groq

from .config import GROQ_API_KEY, GROQ_MODEL

SYSTEM_PROMPT = """Tu és um leitor contemplativo. Recebes um trecho sobre vida espiritual (Padres do Deserto, monges, místicos)
e respondes com uma breve reflexão ou uma pergunta de meditação, em português.
Sê conciso: um parágrafo ou duas frases que ajudem a interiorizar o texto, sem repetir o que já foi dito."""


def reflect(content: str, client: Groq | None = None) -> str:
    """Lê o trecho e devolve uma reflexão ou pergunta de meditação."""
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY não definida. Configure no .env")
    groq = client or Groq(api_key=GROQ_API_KEY)

    resp = groq.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Trecho para refletir:\n\n{content}"},
        ],
        temperature=0.5,
        max_tokens=350,
    )
    return (resp.choices[0].message.content or "").strip()
