# SUPER LIVRO — Livro Infinito Espiritual

**Site:** [superlivroespiritual.netlify.app](https://superlivroespiritual.netlify.app)

Projeto que usa **IA para gerar** conteúdo infinito sobre vida espiritual (Padres do Deserto, monges, santos místicos) e **IA para “ler”** esse conteúdo (reflexão, meditação). Inclui **site (app)** para usar no navegador e **versão em Python** para rodar no terminal.

---

## Site (app) — usar no navegador

O **site** é a forma mais simples de usar: você abre no celular ou no PC, clica em **Gerar novo trecho**, depois **Refletir (IA)** e **Ouvir (voz)**. A voz usa Azure Speech (pt-BR, FranciscaNeural), como no retiro.

- **Publicar no Netlify:** depois de criar o repositório Git e o projeto no Netlify, use o checklist **[DEPLOY.md](DEPLOY.md)**. Detalhes para quem não programa: **[COMO_USAR_SITE.md](COMO_USAR_SITE.md)**.
- **Testar na sua máquina:** na raiz do projeto: `npm install`, `cd app && npm install`, depois `npx netlify dev`; abra o endereço que aparecer (ex.: http://localhost:8888).

Estrutura do site: pasta **`app/`** (frontend React + Vite) e **`netlify/functions/`** (gerar, refletir, speech-token). O **netlify.toml** define build e publicação.

---

## Versão em Python (terminal)

Você também pode rodar tudo no terminal: gera trechos, salva em `livro/` e opcionalmente gera áudio com Azure Speech. Veja **[COMO_USAR.md](COMO_USAR.md)** para passo a passo.

---

## Como funciona

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Gerador    │ ──► │  Armazenamento │ ──► │  Leitor IA  │
│  (Groq)     │     │  (trechos)     │     │  (Groq)     │
└─────────────┘     └──────────────┘     └──────┬──────┘
        ▲                                          │
        │         (opcional: próxima geração        │
        └──────────────────────────────────────────┘
                    usa a reflexão como contexto
```

- **Gerador**: Groq gera trechos no estilo dos Padres do Deserto / monges / místicos.
- **Armazenamento**: trechos ficam em `livro/` em Markdown.
- **Leitor IA**: Groq “lê” o trecho e devolve reflexão ou pergunta de meditação.
- **Leitor Microsoft**: você pode enviar o texto para o leitor da Microsoft (TTS/Immersive Reader) no seu outro app.

## Configuração

1. **Python 3.10+**

2. **Variáveis de ambiente** (copie e preencha):
   ```bash
   cp .env.example .env
   # Edite .env e coloque sua GROQ_API_KEY
   ```

3. **Dependências**:
   ```bash
   pip install -r requirements.txt
   ```

## Uso

- **Gerar um trecho e ver a “leitura” (reflexão) no terminal**:
  ```bash
  python run.py
  ```
- **Só gerar** (acumula em `livro/`):
  ```bash
  python run.py --only-generate
  ```
- **Só “ler”** o último trecho (reflexão IA):
  ```bash
  python run.py --only-read
  ```

O texto gerado fica em `livro/`. Use seu app que já integra o **leitor da Microsoft** para reproduzir esse texto em voz ou no Immersive Reader.

## Estrutura

```
SUPER LIVRO/
├── README.md
├── COMO_USAR.md        # Guia para a versão Python (terminal)
├── COMO_USAR_SITE.md   # Guia para publicar e usar o site
├── netlify.toml        # Configuração Netlify (site)
├── package.json        # Scripts e deps para Netlify dev
├── app/                 # Frontend do site (React + Vite)
│   ├── index.html
│   ├── src/App.tsx, main.tsx, speech.ts, index.css
│   └── package.json
├── netlify/functions/  # Funções serverless (Gerar, Refletir, speech-token)
│   ├── generate.ts
│   ├── reflect.ts
│   └── speech-token.ts
├── .env.example
├── run.py              # Versão Python (terminal)
├── requirements.txt
├── livro/              # Trechos (Markdown) + livro/audio/ (TTS .wav)
└── src/                # Código Python (gerador, leitor, storage, Azure TTS)
```

## Azure Speech (TTS nas meditações)

O projeto usa **Azure Speech (Microsoft Cognitive Services)** para text-to-speech com voz neural pt-BR (**FranciscaNeural**), como no retiro.

- **Variáveis de ambiente** (no `.env`; a chave nunca fica no código):
  - `AZURE_SPEECH_KEY` — Chave 1 do recurso “Speech” no portal Azure
  - `AZURE_SPEECH_REGION` — Região do recurso (ex.: `brazilsouth`)
  - `AZURE_SPEECH_VOICE` — Opcional; padrão: `pt-BR-FranciscaNeural`

- Ao rodar `python run.py`, após gerar trecho e reflexão, o texto é enviado ao Azure Speech e o áudio é salvo em **`livro/audio/`** (arquivos `.wav`). No macOS, o áudio é reproduzido em seguida com `afplay`.

- No outro app (retiro), você usa Netlify (`speech-token.ts`) para obter token e o **microsoft-cognitiveservices-speech-sdk** no cliente. Aqui a síntese é feita no **backend em Python** com o SDK `azure-cognitiveservices-speech`, usando a mesma chave e região; não há endpoint de token, só uso direto da chave no ambiente local.
