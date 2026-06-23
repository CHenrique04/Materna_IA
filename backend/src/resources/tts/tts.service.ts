import { ElevenLabsClient } from 'elevenlabs';

export class TTSService {
  private client: ElevenLabsClient;
  private voiceId: string;

  constructor() {
    // 1. Garantimos que a chave existe ou lançamos um erro claro
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) {
      throw new Error("ELEVENLABS_API_KEY não definida no .env");
    }

    this.client = new ElevenLabsClient({
      apiKey: apiKey, // O TS agora sabe que apiKey é string, não undefined
    });
    
    this.voiceId = process.env.ELEVENLABS_VOICE_ID || 'hpp4J3VqNfWAUOO0d1Us';
  }

  async textoParaAudio(text: string): Promise<Buffer> {
    try {
      console.log('🔊 Gerando áudio via ElevenLabs...');
      
      const audioStream = await this.client.generate({
        voice: this.voiceId,
        text: text,
        model_id: "eleven_multilingual_v2",
      });

      // Converte o stream de resposta para Buffer
      const chunks: Buffer[] = [];
      for await (const chunk of audioStream) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
      
    } catch (error) {
      console.error('Erro na ElevenLabs:', error);
      throw new Error('Falha ao gerar áudio com ElevenLabs.');
    }
  }
}