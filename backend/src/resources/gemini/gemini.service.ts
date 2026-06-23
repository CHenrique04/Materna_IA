import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use um modelo que tenha certeza de estar disponível
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
  }

  async generateTextResponse(prompt: string, history?: string[]): Promise<string> {
    try {
      const chat = this.model.startChat({
        history: history ? history.map((msg, index) => ({
          role: index % 2 === 0 ? 'user' : 'model',
          parts: [{ text: msg }],
        })) : [],
      });

      // Await direto no sendMessage para garantir a execução correta
      const result = await chat.sendMessage(prompt);
      return result.response.text();
      
    } catch (error: any) {
      // Verificamos o código de erro 429
      if (error.status === 429 || (error.message && error.message.includes('429'))) {
        console.warn('⚠️ Limite de requisições atingido (429). Aguardando 25 segundos para tentar novamente...');
        
        // Pausa a execução por 25 segundos
        await new Promise(resolve => setTimeout(resolve, 25000));
        
        // Tenta a chamada novamente e retorna o resultado da nova tentativa
        return await this.generateTextResponse(prompt, history);
      }
      
      console.error('Erro crítico no Gemini (texto):', error);
      throw error;
    }
  }

  async generateResponseFromAudio(audioUrl: string, mimeType: string = 'audio/ogg'): Promise<string> {
    try {
      const response = await axios.get(audioUrl, { responseType: 'arraybuffer' });
      const base64Audio = Buffer.from(response.data, 'binary').toString('base64');
      const result = await this.model.generateContent([
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Audio,
          },
        },
        { text: 'Transcreva e responda a esta mensagem de áudio de uma gestante de forma empática.' }
      ]);
      return result.response.text();
    } catch (error) {
      console.error('Erro no Gemini (áudio):', error);
      throw error;
    }
  }
}