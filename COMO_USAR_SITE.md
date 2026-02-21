# Super Livro — Como usar o site (app)

O **site** é a versão em que você abre no navegador: gera trechos, reflete e ouve com a voz do Azure, sem usar Terminal nem Python.

---

## O que o site faz

1. Você clica em **“Gerar novo trecho”** → a IA escreve um trecho espiritual (Padres do Deserto, monges, místicos).
2. Opcional: pode digitar um **tema** (ex.: “silêncio no deserto”) antes de gerar.
3. Você clica em **“Refletir (IA)”** → a IA “lê” o trecho e devolve uma reflexão ou pergunta para meditação.
4. Você clica em **“Ouvir (voz)”** → o texto (trecho + reflexão) é lido em voz alta no navegador, com a voz **Francisca** (pt-BR), usando Azure Speech — igual ao retiro.

Tudo isso acontece na própria página; não precisa instalar nada no computador para **usar** o site. Quem precisa configurar e publicar o site é você (ou alguém que te ajude), uma vez.

---

## Duas formas de usar o site

### A) Usar o site já publicado

Se alguém já publicou o site (por exemplo no Netlify), você só abre o endereço no celular ou no PC e usa: **Gerar** → **Refletir** → **Ouvir**.

Nada a fazer além de abrir o link.

---

### B) Publicar o site você mesmo (Netlify)

Para ter *seu* site no ar, com *suas* chaves (Groq e Azure), faça o seguinte.

1. **Ter as chaves**
   - **Groq:** [console.groq.com](https://console.groq.com/) — mesma chave que você usa no outro app.
   - **Azure Speech:** mesma **Chave 1** e **região** do recurso “Speech” que você usa no retiro (ex.: `brazilsouth`).

2. **Ter o projeto no GitHub**
   - Crie um repositório no GitHub e suba a pasta do projeto (a pasta **SUPER LIVRO**, com a pasta **app**, a pasta **netlify**, o **netlify.toml**, etc.).  
   - Não suba a pasta **livro** nem o arquivo **.env** (eles podem ficar no .gitignore).

3. **Conectar no Netlify**
   - Entre em [netlify.com](https://www.netlify.com/) e faça login.
   - “Add new site” → “Import an existing project” → escolha **GitHub** e o repositório do Super Livro.
   - O Netlify vai ler o **netlify.toml** e já sugerir o comando de build e a pasta de publicação. Não precisa mudar nada se o projeto estiver igual ao que foi criado.

4. **Configurar variáveis de ambiente no Netlify**
   - No painel do site: **Site configuration** (ou **Site settings**) → **Environment variables**.
   - Adicione (uma a uma):
     - **GROQ_API_KEY** = sua chave Groq  
     - **GROQ_MODEL** = `llama-3.3-70b-versatile` (ou outro modelo que preferir)  
     - **AZURE_SPEECH_KEY** = Chave 1 do recurso Speech no Azure  
     - **AZURE_SPEECH_REGION** = ex.: `brazilsouth`  
   - Salve. Essas variáveis são as mesmas do retiro; a chave **nunca** fica no código, só no Netlify (ou no .env local).

5. **Fazer o deploy**
   - “Deploy site” (ou deixe o deploy automático após o primeiro deploy).  
   - Quando terminar, o Netlify mostra o endereço do site (ex.: `https://nome-do-site.netlify.app`).

A partir daí, o site funciona assim: **Gerar** → **Refletir** → **Ouvir (voz)**. A voz usa o Azure Speech com a mesma lógica do retiro (token vindo do backend; no site, a função `speech-token` do Netlify devolve esse token para o navegador).

---

## Rodar o site no seu computador (antes de publicar)

Se quiser testar tudo na sua máquina antes de publicar:

1. Instale **Node.js** (versão 18 ou 20): [nodejs.org](https://nodejs.org/).
2. Abra o Terminal na pasta **SUPER LIVRO** (a raiz do projeto, onde está o **netlify.toml**).
3. Rode:
   - `npm install`
   - `cd app && npm install && cd ..`
   - `npx netlify dev`
4. Abra o endereço que aparecer (ex.: `http://localhost:8888`).  
5. Para a voz funcionar em local, crie um arquivo **.env** na raiz com as mesmas variáveis (GROQ e Azure) e rode de novo `npx netlify dev`. O Netlify Dev lê o .env e as funções usam essas variáveis.

Assim você vê o site funcionando igual ao que será publicado: gerar, refletir e ouvir.

---

## Resumo

- **Usar o site:** abrir o link e clicar em Gerar → Refletir → Ouvir.
- **Publicar o site:** subir o projeto no GitHub, conectar no Netlify, configurar as variáveis de ambiente (Groq + Azure Speech) e fazer o deploy. A chave do Azure fica só no Netlify (ou no .env local), como no retiro.

Se algo falhar (por exemplo “Voz não disponível”), confira no Netlify se **AZURE_SPEECH_KEY** e **AZURE_SPEECH_REGION** estão corretas e se o deploy foi feito depois de salvar as variáveis.
