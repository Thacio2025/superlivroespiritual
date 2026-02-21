#!/usr/bin/env python3
"""
SUPER LIVRO — Gera um trecho, salva, "lê" com IA e opcionalmente envia ao leitor Microsoft.

Uso:
  python run.py              # Gera + salva + reflexão + (hook Microsoft)
  python run.py --only-generate
  python run.py --only-read
"""
import argparse
import os
import sys

# Permite importar src a partir da raiz do projeto
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.config import GROQ_API_KEY, ensure_livro_dir
from src.generator import generate
from src.reader import reflect
from src.storage import save_passage, load_latest_passage
from src.microsoft_reader import send_to_reader


def main() -> None:
    parser = argparse.ArgumentParser(description="Super Livro — gerar e ler conteúdo espiritual com IA")
    parser.add_argument("--only-generate", action="store_true", help="Apenas gerar e salvar um trecho")
    parser.add_argument("--only-read", action="store_true", help="Apenas 'ler' (reflexão) o último trecho")
    parser.add_argument("--theme", type=str, default=None, help="Tema opcional para a geração")
    args = parser.parse_args()

    if not GROQ_API_KEY:
        print("Erro: GROQ_API_KEY não definida. Crie um .env a partir de .env.example e preencha a chave.")
        sys.exit(1)

    ensure_livro_dir()

    if args.only_read:
        latest = load_latest_passage()
        if not latest:
            print("Nenhum trecho encontrado em livro/. Gere antes com: python run.py --only-generate")
            sys.exit(1)
        full_text = latest[1]
        # Conteúdo sem a parte da reflexão (para passar à IA)
        content = latest[0]
        if "\n\n" in content:
            content = content.split("\n\n", 1)[1]  # sem título na primeira linha para reflexão
        print("--- Último trecho ---\n")
        print(content)
        print("\n--- Reflexão (IA) ---\n")
        reflection = reflect(content)
        print(reflection)
        return

    # Gerar
    print("Gerando trecho...")
    content = generate(seed_theme=args.theme)
    title = "Trecho espiritual"
    if content.strip().startswith("#"):
        first_line, _, rest = content.partition("\n")
        title = first_line.lstrip("# ").strip()
        content = rest.strip()
    else:
        # Título a partir da primeira frase
        first = content.split("\n")[0][:50]
        title = first + "..." if len(first) >= 50 else first

    if args.only_generate:
        path = save_passage(title, content)
        print(f"Salvo em: {path}\n")
        print(content)
        return

    # Reflexão
    print("Lendo / refletindo...")
    reflection = reflect(content)
    path = save_passage(title, content, reflection)
    print(f"Salvo em: {path}\n")
    print("--- Trecho ---\n")
    print(content)
    print("\n--- Reflexão (IA) ---\n")
    print(reflection)
    # Hook para o leitor da Microsoft (texto completo para TTS/leitura)
    send_to_reader(f"{content}\n\n{reflection}", title=title)


if __name__ == "__main__":
    main()
