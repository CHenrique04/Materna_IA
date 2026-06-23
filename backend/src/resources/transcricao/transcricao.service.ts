import axios from 'axios';
import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

export class TranscricaoService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY,
    });
  }

  async transcreverAudio(fileUrl: string, maxRetries = 3): Promise<string> {
    let lastError: any;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await axios({
          method: 'GET',
          url: fileUrl,
          responseType: 'stream',
        });

        const tempFilePath = path.join(__dirname, `temp_audio_${Date.now()}.ogg`);
        const writer = fs.createWriteStream(tempFilePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        const transcription = await this.client.audio.transcriptions.create({
          file: fs.createReadStream(tempFilePath),
          model: 'whisper-large-v3',
          language: 'pt',
        });

        fs.unlinkSync(tempFilePath);
        return transcription.text || '';
      } catch (error) {
        lastError = error;
        console.log(`🔊 Tentativa ${attempt} de transcrição falhou. Aguardando 2s...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    throw new Error(`Não foi possível transcrever o áudio após ${maxRetries} tentativas.`);
  }
}