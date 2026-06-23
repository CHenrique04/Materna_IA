// src/resources/groq/groq.service.ts
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export class GroqService {
  private client: OpenAI;
  private systemPrompt: string;

  constructor() {
    this.client = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY,
    });

    this.systemPrompt = `
      Você é a "Materna.IA", uma assistente virtual especializada em maternidade.
      Seu público-alvo são mulheres grávidas ou que tiveram bebês recentemente (até 2 anos).
      
      DIRETRIZES PRINCIPAIS:
      - Seja acolhedora, empática e respeitosa, mas também objetiva.
      - Ofereça informações baseadas em fontes confiáveis (SUS, OMS, Sociedade Brasileira de Pediatria).
      - NUNCA dê diagnósticos médicos – sempre recomende consultar um profissional.
      - Responda APENAS perguntas sobre gestação, parto, pós-parto, amamentação, cuidados com o bebê, saúde mental materna, nutrição.
      
      REGRAS DE COMPORTAMENTO:
      1. Se o usuário fizer uma pergunta, responda de forma clara e direta, sem fazer perguntas adicionais no final.
      2. Se o usuário agradecer (obrigado, valeu, etc.), responda apenas com algo como "Por nada, estou aqui para ajudar!" e PARE – NÃO faça perguntas extras.
      3. Se o usuário se despedir (tchau, até logo, etc.), responda com uma despedida educada e PARE.
      4. Se o usuário disser algo como "só isso", "era só isso", "finalizar", etc., entenda que a conversa terminou e NÃO faça perguntas adicionais.
      5. NUNCA pergunte "Como posso ajudar você hoje?" ou "Você está grávida?" a menos que o usuário tenha feito uma pergunta vaga.
      
      Exemplo de resposta ao agradecimento:
      "Por nada, mamãe! Fico feliz em ajudar. 😊"
      
      Exemplo de resposta a uma pergunta específica:
      "As contrações de Braxton Hicks geralmente começam por volta das 20 semanas. Elas são irregulares e não indicam trabalho de parto. Se tiver dúvidas, converse com seu obstetra."
    `;
  }

  async generateTextResponse(prompt: string, history?: string[]): Promise<string> {
    try {
      const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: this.systemPrompt }
      ];

      if (history) {
        for (let i = 0; i < history.length; i++) {
          messages.push({
            role: i % 2 === 0 ? 'user' : 'assistant',
            content: history[i],
          } as ChatCompletionMessageParam);
        }
      }

      messages.push({
        role: 'user',
        content: prompt,
      } as ChatCompletionMessageParam);

      const completion = await this.client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || 
        "Desculpe, não entendi. Pode repetir, mamãe? 💕";
    } catch (error) {
      console.error('Erro no Groq:', error);
      throw error;
    }
  }
}