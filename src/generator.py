"""Geração de conteúdo espiritual via Groq (Padres do Deserto, monges, santos místicos)."""
from groq import Groq

from .config import GROQ_API_KEY, GROQ_MODEL

SYSTEM_PROMPT = """Tu és um escritor que compõe textos no espírito da tradição contemplativa cristã:
Padres do Deserto, monges beneditinos e cartuxos, e santos místicos (São João da Cruz, Santa Teresa, etc.).
Escreves em português, com linguagem sóbria e profunda, como aforismos ou breves meditações.
Cada texto deve ser autocontido, entre 2 e 5 parágrafos curtos, sem título no início.
Não inventes citações literais; inspira-te no estilo e nos temas (silêncio, humildade, oração, deserto interior, abandono)."""


def generate(client: Groq | None = None, seed_theme: str | None = None) -> str:
    """Gera um trecho sobre vida espiritual. Opcional: seed_theme para orientar o tema."""
    if not GROQ_API_KEY:
        raise ValueError("GROQ_API_KEY não definida. Configure no .env")
    groq = client or Groq(api_key=GROQ_API_KEY)

    user = "Gera um novo trecho de meditação ou aforismo sobre a vida espiritual."
    if seed_theme:
        user += f" Tema ou fio condutor: {seed_theme}"

    resp = groq.chat.completions.create(
        model=GROQ_MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user},
        ],
        temperature=0.8,
        max_tokens=600,
    )
    return (resp.choices[0].message.content or "").strip()
