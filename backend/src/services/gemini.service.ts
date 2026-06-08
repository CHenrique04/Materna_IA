// src/services/gemini.service.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genai.getGenerativeModel({ model: 'gemini-1.5-flash' });

export type Intencao = 'AGENDAMENTO' | 'CONSULTA_BD' | 'CHAT_LIVRE';

/**
 * Classifica a intenção da mensagem recebida via WhatsApp.
 */
export async function classificarIntencao(texto: string): Promise<Intencao> {
  const prompt = `
Você é um classificador de mensagens de um chatbot para gestantes.
Classifique a mensagem abaixo em UMA das categorias:
- AGENDAMENTO (marcar, cancelar, reagendar ou verificar consultas)
- CONSULTA_BD (checar exames, histórico, dados cadastrais, consultas passadas)
- CHAT_LIVRE (dúvidas gerais sobre gravidez, saúde, nutrição, ou qualquer outro assunto)

Responda APENAS com a categoria, sem explicação, sem pontuação.

Mensagem: "${texto}"
`.trim();

  const result = await model.generateContent(prompt);
  const resposta = result.response.text().trim().toUpperCase();

  if (resposta === 'AGENDAMENTO') return 'AGENDAMENTO';
  if (resposta === 'CONSULTA_BD') return 'CONSULTA_BD';
  return 'CHAT_LIVRE';
}

/**
 * Chat livre com contexto de histórico.
 */
export async function chatLivreComGemini(
  texto: string,
  historico: { role: 'user' | 'model'; content: string }[] = []
): Promise<string> {
  const chat = model.startChat({
    history: historico.map((h) => ({
      role: h.role,
      parts: [{ text: h.content }],
    })),
    systemInstruction: {
      parts: [{
        text: `Você é Materna, uma assistente virtual especializada em saúde materna e gestação.
Responda sempre em português brasileiro, com linguagem acolhedora e empática.
Não substitua consultas médicas — sempre que necessário, oriente a procurar um profissional de saúde.
Seja objetiva e clara. Limite suas respostas a no máximo 3 parágrafos curtos.`
      }]
    },
    generationConfig: { maxOutputTokens: 600 },
  });

  const result = await chat.sendMessage(texto);
  return result.response.text();
}

/**
 * Resumir dados do banco para resposta contextualizada.
 */
export async function resumirDadosParaUsuario(
  pergunta: string,
  dadosBanco: object
): Promise<string> {
  const prompt = `
Você é Materna, assistente virtual para gestantes.
A usuária perguntou: "${pergunta}"

Com base nos seguintes dados do sistema, responda de forma clara e acolhedora:
${JSON.stringify(dadosBanco, null, 2)}

Responda em português, de forma humanizada, sem listar JSON cru.
Limite a resposta a no máximo 3 parágrafos curtos.
`.trim();

  const result = await model.generateContent(prompt);
  return result.response.text();
}
