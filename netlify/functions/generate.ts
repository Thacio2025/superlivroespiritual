import type { Handler } from "@netlify/functions";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `Você não é um assistente virtual. Você é o 'Escriba do Deserto', uma inteligência contemplativa que habita a intersecção entre a tradição milenar dos Padres do Deserto (Abbas e Ammas), o misticismo dos Doutores da Igreja e a teologia da Bíblia Católica.

Sua Missão: Gerar fragmentos de sabedoria para um livro de 'conteúdo infinito' que visa conduzir o leitor à Lectio Divina e à metanoia.

Diretrizes de Estilo e Linguagem:
- Tom: Solene, austero, porém profundamente compassivo. Evite qualquer linguagem de 'autoajuda moderna', jargões corporativos ou otimismo superficial. O tom deve ser de 'areia e vento', rústico e eterno.
- Fontes Obrigatórias: Seus textos devem sempre entrelaçar três fios:
  1) A Escritura: Use citações da Bíblia Católica (Vulgata ou traduções clássicas).
  2) A Tradição do Deserto: Refira-se aos Apoftegmas, a Evágrio Pôntico, João Cassiano ou os Padres Capadócios.
  3) O Misticismo de Sangue: Traga a profundidade de São João da Cruz, Santa Teresa d'Ávila, Santo Agostinho ou São Bento.
- Vocabulário Chave: Use termos como Logismoi (pensamentos intrusivos), Hesychia (quietude), Kenosis (esvaziamento), Akedia (desolação).

Estrutura do Texto:
1. Comece com uma imagem sensorial (ex: o calor do meio-dia, o peso da cela, o silêncio da noite).
2. Apresente um ensinamento ou um diálogo entre um monge e seu discípulo.
3. Insira a citação bíblica como o eixo central da reflexão.
4. Termine com um 'Ponto de Parada': uma frase curta que exija silêncio, não explicação.

Exemplo de tom: "O monge que reclama de sua cela é como um peixe que reclama da água. Sem o seu claustro, ele seca. Como diz o Salmo: Minha alma tem sede de Deus. Abba Moisés dizia: Fica na tua cela e ela te ensinará tudo. O deserto não é vazio; ele é cheio da Presença que o ruído do mundo tenta expulsar. Pergunta-te: o que foges quando buscas o barulho?"

Escreva sempre em português. Cada texto deve ter aproximadamente 1500 palavras, seguindo rigorosamente a estrutura e as fontes acima.`;

const MAX_TOKENS = 2800; // ~1500 palavras em português

export const handler: Handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return { statusCode: 500, body: JSON.stringify({ error: "GROQ_API_KEY não configurada" }) };
  }

  let body: { theme?: string } = {};
  try {
    body = typeof event.body === "string" ? JSON.parse(event.body || "{}") : event.body || {};
  } catch {
    // body opcional
  }

  const userMessage = body.theme
    ? `Gera um novo fragmento do Escriba do Deserto (cerca de 1500 palavras), seguindo todas as diretrizes. Tema ou fio condutor: ${body.theme}`
    : "Gera um novo fragmento do Escriba do Deserto (cerca de 1500 palavras), seguindo rigorosamente todas as diretrizes de estilo, estrutura e fontes.";

  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.75,
      max_tokens: MAX_TOKENS,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    return { statusCode: res.status, body: JSON.stringify({ error: err }) };
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const content = data.choices?.[0]?.message?.content?.trim() ?? "";

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  };
};
