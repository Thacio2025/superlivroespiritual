"""Armazenamento dos trechos do livro (Markdown em disco)."""
from pathlib import Path
from datetime import datetime

from .config import LIVRO_DIR, ensure_livro_dir


def save_passage(title: str, content: str, reflection: str | None = None) -> Path:
    """Salva um trecho em Markdown. Retorna o caminho do arquivo."""
    ensure_livro_dir()
    safe_title = "".join(c if c.isalnum() or c in " -_" else "_" for c in title)[:60]
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    name = f"{stamp}_{safe_title.strip() or 'trecho'}.md"
    path = LIVRO_DIR / name

    body = f"# {title}\n\n{content}"
    if reflection:
        body += f"\n\n---\n\n## Reflexão (IA)\n\n{reflection}"

    path.write_text(body, encoding="utf-8")
    return path


def load_latest_passage() -> tuple[str, str] | None:
    """Carrega o trecho mais recente. Retorna (título+conteúdo, texto_completo) ou None."""
    ensure_livro_dir()
    files = sorted(LIVRO_DIR.glob("*.md"), key=lambda p: p.stat().st_mtime, reverse=True)
    if not files:
        return None
    text = files[0].read_text(encoding="utf-8")
    # Primeira linha é o título (# Título)
    lines = text.split("\n")
    title = lines[0].lstrip("# ").strip() if lines else "Sem título"
    content = "\n".join(lines[2:]).split("\n\n---\n\n")[0].strip()  # até reflexão
    return (f"{title}\n\n{content}", text)


def list_passages(limit: int = 20) -> list[Path]:
    """Lista os arquivos de trechos, do mais recente ao mais antigo."""
    ensure_livro_dir()
    files = sorted(LIVRO_DIR.glob("*.md"), key=lambda p: p.stat().st_mtime, reverse=True)
    return list(files)[:limit]
