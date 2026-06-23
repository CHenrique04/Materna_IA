import { Telegraf, Context } from 'telegraf';
import axios from 'axios';
import { GroqService } from '../groq/groq.service';
import { TranscricaoService } from '../transcricao/transcricao.service';
import { TTSService } from '../tts/tts.service';

interface UserState {
  step: 'awaiting_name' | 'awaiting_phone' | 'awaiting_birthdate' | 'awaiting_dum' | 'registered';
  nome?: string;
  telefone?: string;
  dataNascimento?: string;
  dataUltimaMenstruacao?: string;
  usuarioId?: number;
}

export class TelegramService {
  private bot: Telegraf;
  private groqService: GroqService;
  private transcricaoService: TranscricaoService;
  private ttsService: TTSService;
  private userStates: Map<number, UserState> = new Map();
  private backendUrl: string;

  constructor(token: string, backendUrl: string = 'http://localhost:3000') {
    this.bot = new Telegraf(token);
    this.groqService = new GroqService();
    this.transcricaoService = new TranscricaoService();
    this.ttsService = new TTSService();
    this.backendUrl = backendUrl;
    this.initializeEvents();
  }

  private initializeEvents() {
    // ----------------------------------------------------
    // COMANDO /START
    // ----------------------------------------------------
    this.bot.start(async (ctx) => {
      const telegramId = ctx.from.id.toString();
      const usuarioExistente = await this.verificarUsuarioPorTelegramId(telegramId);

      if (usuarioExistente) {
        this.userStates.set(ctx.from.id, { step: 'registered', usuarioId: usuarioExistente.id });
        await ctx.reply(`Bem-vinda de volta, ${usuarioExistente.nome}! 💕 Como posso ajudar hoje?`);
      } else {
        this.userStates.set(ctx.from.id, { step: 'awaiting_name' });
        await ctx.reply('Olá! Sou a assistente virtual da Materna.IA 🤰.\n\nParece que é sua primeira vez aqui. Qual é o seu nome completo, mamãe? 😊');
      }
    });

    // ----------------------------------------------------
    // MENSAGENS DE TEXTO
    // ----------------------------------------------------
    this.bot.on('text', async (ctx) => {
      const userId = ctx.from.id;
      const telegramId = userId.toString();
      const text = ctx.message.text.trim();
      let state = this.userStates.get(userId);
      const mensagem = ctx.message.text.trim().toLowerCase();
      const despedidas = ['obrigado', 'obrigada', 'valeu', 'tchau', 'até logo', 'flw', 'só isso', 'era só isso'];

      if (despedidas.some(palavra => mensagem.includes(palavra))) {
        await ctx.reply('Por nada, mamãe! Fico feliz em ajudar. 😊');
        return;
      }

      // Proteção contra reinicialização do servidor (Recupera sessão)
      if (!state) {
        const usuarioExistente = await this.verificarUsuarioPorTelegramId(telegramId);
        if (usuarioExistente) {
          state = { step: 'registered', usuarioId: usuarioExistente.id };
          this.userStates.set(userId, state);
        } else {
          state = { step: 'awaiting_name' };
          this.userStates.set(userId, state);
          await ctx.reply('Qual é o seu nome completo, mamãe? 😊');
          return;
        }
      }

      // Máquina de estados para cadastro
      switch (state.step) {
        case 'awaiting_name':
          state.nome = text;
          state.step = 'awaiting_phone';
          await ctx.reply('Ótimo! Agora, qual é o seu número de telefone com DDD? (Apenas números, ex: 11999999999)');
          break;

        case 'awaiting_phone':
          const telLimpo = text.replace(/\D/g, '');
          if (telLimpo.length < 10 || telLimpo.length > 11) {
            await ctx.reply('Número inválido. Digite apenas números, com DDD.');
            return;
          }
          state.telefone = telLimpo;
          state.step = 'awaiting_birthdate';
          await ctx.reply('Qual a sua data de nascimento? (DD/MM/AAAA)');
          break;

        case 'awaiting_birthdate':
          if (!this.isValidDate(text)) {
            await ctx.reply('Data inválida. Use o formato DD/MM/AAAA');
            return;
          }
          state.dataNascimento = this.convertDateToISO(text);
          state.step = 'awaiting_dum';
          await ctx.reply('Qual a data da sua última menstruação (DUM)? (DD/MM/AAAA)');
          break;

        case 'awaiting_dum':
          if (!this.isValidDate(text)) {
            await ctx.reply('Data inválida. Use o formato DD/MM/AAAA');
            return;
          }
          state.dataUltimaMenstruacao = this.convertDateToISO(text);
          
          try {
            const novoUsuario = await this.criarUsuario({
              telegramId: telegramId,
              nome: state.nome!,
              telefone: state.telefone!,
              dataNascimento: state.dataNascimento,
              dataUltimaMenstruacao: state.dataUltimaMenstruacao
            });
            state.step = 'registered';
            state.usuarioId = novoUsuario.id;
            await ctx.reply(`✅ Cadastro concluído com sucesso, ${state.nome}! Estou pronta para ajudar. 💕`);
          } catch (error) {
            console.error('Erro ao cadastrar:', error);
            await ctx.reply('❌ Tivemos um problema ao salvar seu cadastro. Digite /start para tentar novamente.');
            this.userStates.delete(userId);
          }
          break;

        case 'registered':
          try {
            await ctx.sendChatAction('typing');
            const resposta = await this.groqService.generateTextResponse(text, []);
            await ctx.reply(resposta);
          } catch (error) {
            console.error('Erro no Groq:', error);
            await ctx.reply('❌ Desculpe, ocorreu um erro ao processar sua mensagem.');
          }
          break;
      }
    });

    // ----------------------------------------------------
    // MENSAGENS DE ÁUDIO
    // ----------------------------------------------------
    this.bot.on('voice', async (ctx) => {
      const userId = ctx.from.id;
      const telegramId = userId.toString();
      let state = this.userStates.get(userId);

      if (!state) {
        const usuarioExistente = await this.verificarUsuarioPorTelegramId(telegramId);
        if (usuarioExistente) {
          state = { step: 'registered', usuarioId: usuarioExistente.id };
          this.userStates.set(userId, state);
        }
      }

      if (!state || state.step !== 'registered') {
        await ctx.reply('Por favor, complete seu cadastro por texto antes de enviar áudios. Digite /start se precisar recomeçar.');
        return;
      }

      try {
        await ctx.sendChatAction('record_voice');
        const fileLink = await ctx.telegram.getFileLink(ctx.message.voice.file_id);
        const textoTranscrito = await this.transcricaoService.transcreverAudio(fileLink.toString());
        
        const respostaIA = await this.groqService.generateTextResponse(textoTranscrito, []);
        const audioBuffer = await this.ttsService.textoParaAudio(respostaIA);

        await ctx.replyWithVoice({ source: audioBuffer });
        await ctx.reply(`📝 *Você disse:*\n"${textoTranscrito}"`, { parse_mode: 'Markdown' });

      } catch (error) {
        console.error('Erro ao processar áudio:', error);
        await ctx.reply('❌ Não consegui processar seu áudio. Tente novamente.');
      }
    });
  }

  // --- Funções Auxiliares ---
  private async verificarUsuarioPorTelegramId(telegramId: string): Promise<any | null> {
    try {
      const res = await axios.get(`${this.backendUrl}/api/usuarios/telegram/${telegramId}`);
      return res.data;
    } catch {
      return null;
    }
  }

  private async criarUsuario(payload: any): Promise<any> {
    const res = await axios.post(`${this.backendUrl}/api/usuarios`, payload);
    return res.data;
  }

  private isValidDate(str: string): boolean {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = str.match(regex);
    if (!match) return false;
    
    const day = match[1]!;
    const month = match[2]!;
    const year = match[3]!;
    
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return d.getFullYear() === parseInt(year) && d.getMonth() === parseInt(month) - 1 && d.getDate() === parseInt(day);
  }

  private convertDateToISO(str: string): string {
    const [day, month, year] = str.split('/');
    return `${year}-${month}-${day}`;
  }

  public start() {
    this.bot.launch();
    console.log('✅ Bot do Telegram pronto com fluxo de cadastro!');
  }

  public stop() {
    this.bot.stop('SIGINT');
  }
}