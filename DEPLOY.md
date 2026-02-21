# Deploy — Git + Netlify

Quando você criar o repositório no Git e o projeto no Netlify, use este checklist.

---

## 1. Subir o código no Git

- Crie o repositório no GitHub (ou GitLab, etc.).
- Na pasta do projeto (SUPER LIVRO), rode no Terminal:

```bash
git init
git add .
git commit -m "Super Livro — site e funções Netlify"
git branch -M main
git remote add origin URL_DO_SEU_REPOSITORIO
git push -u origin main
```

**Importante:** o arquivo **.env** não deve ser commitado (já está no `.gitignore`). As chaves você coloca só no Netlify.

---

## 2. Conectar no Netlify

1. Netlify → **Add new site** → **Import an existing project**.
2. Escolha **GitHub** (ou o Git que você usou) e autorize.
3. Selecione o repositório do **Super Livro**.
4. O Netlify lê o **netlify.toml** e preenche:
   - **Build command:** `cd app && npm ci && npm run build`
   - **Publish directory:** `app/dist`
   - **Functions directory:** `netlify/functions`
5. **Não** preencha variáveis de ambiente ainda; faça isso no passo 3.
6. Clique em **Deploy site**. O primeiro deploy pode falhar nas funções (gerar/refletir/voz) até você configurar as variáveis; a página vai abrir.

---

## 3. Variáveis de ambiente no Netlify

No painel do site: **Site configuration** → **Environment variables** → **Add a variable** (ou **Add environment variables**).

Adicione:

| Nome | Valor | Obrigatório |
|------|--------|-------------|
| **GROQ_API_KEY** | Sua chave da Groq (console.groq.com) | Sim |
| **GROQ_MODEL** | `llama-3.3-70b-versatile` | Não (tem padrão) |
| **AZURE_SPEECH_KEY** | Chave 1 do recurso Speech no Azure | Para "Ouvir (voz)" |
| **AZURE_SPEECH_REGION** | Ex.: `brazilsouth` | Para "Ouvir (voz)" |

Depois de salvar: **Deploys** → **Trigger deploy** → **Deploy site** (para rodar de novo com as variáveis).

---

## 4. Pronto

O site estará no endereço que o Netlify mostrar. Este projeto está em: **https://superlivroespiritual.netlify.app**  
**Gerar novo trecho** → **Refletir (IA)** → **Ouvir (voz)**.

Se algo falhar, confira no Netlify o log do deploy (Build log) e se as variáveis estão corretas.
