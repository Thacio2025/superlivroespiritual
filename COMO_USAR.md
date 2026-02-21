# Super Livro — Guia para quem não é programador

Este guia explica **o que o projeto faz** e **o que você precisa fazer** para usar, sem assumir que você programa.

---

## O que o projeto faz (em palavras simples)

1. **A IA “escreve” um trecho**  
   Sobre vida espiritual, no estilo dos Padres do Deserto, monges e santos místicos. Esse texto é novo cada vez.

2. **O trecho é guardado**  
   Em arquivos de texto (Markdown) na pasta `livro/`, para você reler quando quiser.

3. **Outra “leitura” da IA**  
   A IA “lê” o trecho e devolve uma reflexão ou pergunta para meditação.

4. **A voz lê em voz alta**  
   Se você configurar o Azure Speech, o texto (trecho + reflexão) vira áudio em português (voz Francisca) e pode ser salvo e ouvido.

Resumindo: **você roda um comando → a IA gera um trecho → a IA reflete sobre ele → opcionalmente a voz lê em áudio.** Tudo no mesmo tema espiritual.

---

## O que você precisa fazer

### Passo 1: Ter o Python no computador

- O projeto roda com **Python** (linguagem que o computador entende para executar o programa).
- Se não tiver: baixe em [python.org](https://www.python.org/downloads/) e instale. Na instalação, marque a opção **“Add Python to PATH”** se aparecer.

Para ver se já tem, abra o **Terminal** (Mac) ou **Prompt de Comando** (Windows) e digite:

```text
python3 --version
```

Se aparecer algo como `Python 3.10` ou `3.11`, está ok.

---

### Passo 2: Abrir o Terminal na pasta do projeto

- No Mac: abra o **Terminal**.
- Vá até a pasta do projeto. No Terminal você pode digitar (trocando pelo seu nome de usuário):

```text
cd /Users/SEU_USUARIO/Desktop/SUPER LIVRO
```

Ou: arraste a pasta **SUPER LIVRO** para a janela do Terminal e ele preenche o caminho sozinho (às vezes precisa dar Enter depois).

---

### Passo 3: Instalar as “dependências”

O projeto usa duas coisas da internet: **Groq** (para a IA escrever e refletir) e **Azure Speech** (para a voz). Para isso, o Python precisa de uns “pacotes” instalados.

No Terminal, ainda na pasta do projeto, digite:

```text
pip3 install -r requirements.txt
```

(Se der erro, tente: `python3 -m pip install -r requirements.txt`)

Espere terminar. Quando voltar o cursor, está instalado.

---

### Passo 4: Criar o arquivo `.env` (suas chaves em segredo)

O programa não pode ter suas chaves de API escritas no código. Por isso usamos um arquivo **`.env`** que fica só no seu computador.

1. Na pasta **SUPER LIVRO**, procure o arquivo **`.env.example`**.
2. **Copie** esse arquivo e **cole** na mesma pasta.
3. **Renomeie** a cópia para **`.env`** (só o nome, sem “.example”).
4. Abra o **`.env`** com o Bloco de Notas ou outro editor de texto.

Você vai ver linhas como:

```text
GROQ_API_KEY=sua_chave_aqui
AZURE_SPEECH_KEY=
AZURE_SPEECH_REGION=brazilsouth
```

- **GROQ:** pegue sua chave em [console.groq.com](https://console.groq.com/) (onde você já usa no outro app) e cole no lugar de `sua_chave_aqui`.
- **Azure Speech:** use a mesma **Chave 1** e **região** que você usa no retiro (ou no painel do Azure, recurso “Speech”). Cole no `AZURE_SPEECH_KEY=` e ajuste o `AZURE_SPEECH_REGION=` se for diferente (ex.: `brazilsouth`).
- Salve o arquivo e feche.

**Importante:** o arquivo `.env` não deve ser enviado para ninguém e não deve ir para internet (não coloque no GitHub, etc.). Ele fica só na sua máquina.

---

### Passo 5: Rodar o programa

No Terminal, ainda na pasta **SUPER LIVRO**, digite:

```text
python3 run.py
```

O que deve acontecer:

1. Diz “Gerando trecho...” e depois mostra o texto gerado.
2. Diz “Lendo / refletindo...” e mostra a reflexão.
3. Se o Azure estiver configurado, gera o áudio e mostra algo como “Áudio salvo: livro/audio/…”. No Mac, o áudio pode tocar sozinho.

Se aparecer erro de “GROQ_API_KEY não definida”, volte ao Passo 4 e confira o `.env`.

---

## Resumo do que é cada coisa

| O que você vê        | O que é em termos simples |
|----------------------|---------------------------|
| `run.py`             | O “botão de ligar”: é o arquivo que você manda executar. |
| `src/`               | O “motor” do programa: geração de texto, reflexão, voz. |
| `livro/`             | Onde ficam os trechos em texto (e, se configurou voz, em `livro/audio/` os áudios). |
| `.env`               | Arquivo secreto só no seu PC com as chaves (Groq e Azure). |
| `requirements.txt`   | Lista do que o Python precisa instalar (você só roda o comando do Passo 3). |

---

## Se algo der errado

- **“GROQ_API_KEY não definida”** → Crie o `.env`, copie do `.env.example`, preencha `GROQ_API_KEY` e salve.
- **“pip não encontrado”** → Use `python3 -m pip install -r requirements.txt` no lugar de `pip3 install ...`.
- **Voz não fala / não gera áudio** → Confira `AZURE_SPEECH_KEY` e `AZURE_SPEECH_REGION` no `.env`. Se estiverem vazios, o programa só mostra o texto (e avisa que pode configurar TTS).

Se quiser, pode copiar a mensagem de erro e mandar; dá para te orientar passo a passo com base nela.
