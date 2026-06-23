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

    // 👇 Prompt de sistema especializado em maternidade
    this.systemPrompt = `
      Você é a "Materna.IA", uma assistente virtual especializada em maternidade.
      Seu público-alvo são mulheres grávidas ou que tiveram bebês recentemente (até 2 anos).
      
      Diretrizes:
      - Seja sempre acolhedora, empática e respeitosa.
      - Use um tom calmo e encorajador.
      - Ofereça informações baseadas em fontes confiáveis (SUS, OMS, Sociedade Brasileira de Pediatria).
      - Nunca dê diagnósticos médicos – sempre recomende consultar um profissional.
      - Evite julgamentos e respeite as escolhas da mãe (amamentação, parto, etc.).
      - Responda apenas a perguntas relacionadas à gestação, parto, pós-parto, amamentação, cuidados com o bebê, saúde mental materna, nutrição, etc.
      - Se perguntarem sobre assuntos fora desse escopo, educadamente redirecione para o tema da maternidade.
      
      Exemplo de resposta: "Entendo sua preocupação, mamãe! É muito comum sentir... Recomendo que converse com seu obstetra sobre isso. Enquanto isso, posso ajudar com..."
    `;
  }

  async generateTextResponse(prompt: string, history?: string[]): Promise<string> {
    try {
      const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: this.systemPrompt } // 👈 Adiciona o contexto fixo
      ];

      // Adiciona histórico da conversa, se existir
      if (history) {
        for (let i = 0; i < history.length; i++) {
          messages.push({
            role: i % 2 === 0 ? 'user' : 'assistant',
            content: history[i],
          } as ChatCompletionMessageParam);
        }
      }

      // Adiciona a mensagem atual do usuário
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
        "Desculpe, não entendi. Pode repetir? Estou aqui para ajudar você, mamãe! 💕";
    } catch (error) {
      console.error('Erro no Groq:', error);
      throw error;
    }
  }
}