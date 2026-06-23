import OpenAI from "openai";

export class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateTextResponse(prompt: string, history?: string[]): Promise<string> {
    try {
      // Estrutura o histórico de mensagens
      const messages: OpenAI.ChatCompletionMessageParam[] = history
        ? history.map((msg, index) => ({
            role: index % 2 === 0 ? 'user' : 'assistant',
            content: msg,
          }))
        : [];

      // Adiciona a nova mensagem do usuário
      messages.push({ role: 'user', content: prompt });

      // Chama a API da OpenAI
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini', // Modelo barato e rápido. Opção: 'gpt-3.5-turbo'
        messages,
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || "Desculpe, não pude gerar uma resposta.";
    } catch (error) {
      console.error('Erro no OpenAI:', error);
      throw error;
    }
  }
}