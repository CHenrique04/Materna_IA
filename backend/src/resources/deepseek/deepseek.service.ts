import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export class DeepSeekService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: process.env.DEEPSEEK_API_KEY,
    });
  }

  async generateTextResponse(prompt: string, history?: string[]): Promise<string> {
    try {
      const messages: ChatCompletionMessageParam[] = history 
        ? history.map((msg, index) => ({
            role: index % 2 === 0 ? 'user' : 'assistant',
            content: msg,
          } as ChatCompletionMessageParam))
        : [];

      messages.push({ 
        role: 'user', 
        content: prompt 
      } as ChatCompletionMessageParam);

      const completion = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages,
        stream: false,
      });

      return completion.choices[0]?.message?.content || "Desculpe, não pude gerar uma resposta.";
    } catch (error) {
      console.error('Erro no DeepSeek:', error);
      throw error;
    }
  }
}