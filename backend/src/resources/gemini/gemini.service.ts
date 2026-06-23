import { GoogleGenerativeAI } from '@google/generative-ai';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    // ✅ Use 'gemini-pro' (versão 1.0) – é a mais estável para contas gratuitas
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async generateTextResponse(prompt: string, history?: string[]): Promise<string> {
    try {
      const chat = this.model.startChat({
        history: history ? history.map((msg, index) => ({
          role: index % 2 === 0 ? 'user' : 'model',
          parts: [{ text: msg }],
        })) : [],
      });
      const result = await chat.sendMessage(prompt);
      return result.response.text();
    } catch (error) {
      console.error('Erro no Gemini:', error);
      throw error;
    }
  }
}