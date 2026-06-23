import { Telegraf, Context } from 'telegraf';
import axios from 'axios';
import { GeminiService } from '../gemini/gemini.service';

interface UserState {
  step: 'idle' | 'awaiting_name' | 'awaiting_phone' | 'awaiting_birthdate' | 'awaiting_dum' | 'registered';
  nome?: string;
  telefone?: string;
  dataNascimento?: string;
  dataUltimaMenstruacao?: string;
  usuarioId?: number;
}

export class TelegramService {
  private bot: Telegraf;
  private gemini: GeminiService;
  private userStates: Map<number, UserState> = new Map();
  private backendUrl: string;

  constructor(token: string, geminiApiKey: string, backendUrl: string = 'http://localhost:3000') {
    this.bot = new Telegraf(token);
    this.gemini = new GeminiService(geminiApiKey);
    this.backendUrl = backendUrl;
    this.initialize();
    
  }
  

  private initialize() {
    // Ao iniciar, pedimos o telefone para verificar se já existe no banco
    this.bot.start((ctx) => {
      const userId = ctx.from.id;
      this.userStates.set(userId, { step: 'awaiting_phone' });
      ctx.reply('Olá! Sou a assistente da Materna.IA 🤰.\nPara começarmos, digite seu telefone com DDD (apenas números):');
    });

    this.bot.on('text', async (ctx) => {
      const userId = ctx.from.id;
      const text = ctx.message.text.trim();
      let state = this.userStates.get(userId);

      if (!state) {
        this.userStates.set(userId, { step: 'awaiting_phone' });
        ctx.reply('Olá! Digite seu telefone com DDD para continuarmos:');
        return;
      }

      // Lógica de recuperação de cadastro via Telefone
      if (state.step === 'awaiting_phone' && !state.telefone) {
        const telLimpo = text.replace(/\D/g, '');
        if (!/^\d{10,11}$/.test(telLimpo)) {
          ctx.reply('Número inválido. Digite apenas números com DDD.');
          return;
        }
        
        const usuarioExistente = await this.verificarUsuarioNoBanco(telLimpo);
        if (usuarioExistente) {
          this.userStates.set(userId, { step: 'registered', usuarioId: usuarioExistente.id });
          ctx.reply(`Bem-vinda de volta, ${usuarioExistente.nome}! Estou pronta para ajudar.`);
          return;
        }
        
        state.telefone = telLimpo;
        state.step = 'awaiting_name';
        ctx.reply('Não encontrei seu cadastro. Qual é o seu nome completo?');
        return;
      }

      switch (state.step) {
        case 'awaiting_name':
          state.nome = text;
          state.step = 'awaiting_birthdate';
          ctx.reply('Qual a sua data de nascimento? (DD/MM/AAAA)');
          break;

        case 'awaiting_birthdate':
          if (!this.isValidDate(text)) {
            ctx.reply('Data inválida. Use DD/MM/AAAA');
            return;
          }
          state.dataNascimento = this.convertDateToISO(text);
          state.step = 'awaiting_dum';
          ctx.reply('Qual a data da sua última menstruação? (DD/MM/AAAA)');
          break;

        case 'awaiting_dum':
          if (!this.isValidDate(text)) {
            ctx.reply('Data inválida. Use DD/MM/AAAA');
            return;
          }
          state.dataUltimaMenstruacao = this.convertDateToISO(text);
          try {
            const usuario = await this.criarUsuario(state);
            state.step = 'registered';
            state.usuarioId = usuario.id;
            ctx.reply(`✅ Cadastro concluído, ${usuario.nome}!`);
          } catch (e) {
            ctx.reply('Erro ao salvar cadastro. Tente novamente.');
          }
          break;

        case 'registered':
          await this.handleFreeConversation(ctx, text);
          break;
      }
    });

    this.bot.on('voice', async (ctx) => {
      const userId = ctx.from.id;
      const state = this.userStates.get(userId);
      if (!state || state.step !== 'registered') {
        ctx.reply('Por favor, complete seu cadastro primeiro.');
        return;
      }
      await this.handleAudioMessage(ctx);
    });
  }

  private async verificarUsuarioNoBanco(telefone: string) {
    try {
      const res = await axios.get(`${this.backendUrl}/api/usuarios/telefone/${telefone}`);
      return res.data;
    } catch { return null; }
  }

  // ... (mantenha os métodos handleFreeConversation, handleAudioMessage, isValidDate, etc. iguais)
  private async handleFreeConversation(ctx: Context, text: string) {
    const response = await this.gemini.generateTextResponse(text);
    await ctx.reply(response);
  }

  private async handleAudioMessage(ctx: Context) {
    const message = ctx.message as any;
    const voice = message?.voice;
    if (!voice) return;
    const fileLink = await ctx.telegram.getFileLink(voice.file_id);
    const response = await this.gemini.generateResponseFromAudio(fileLink.toString(), 'audio/ogg');
    await ctx.reply(response);
  }

 private isValidDate(str: string): boolean {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = str.match(regex);
    if (!match) return false;
    
    // Convertemos cada parte para string e garantimos que não é undefined
    const day = match[1]!;
    const month = match[2]!;
    const year = match[3]!;
    
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    return d.getFullYear() === parseInt(year) && 
           d.getMonth() === parseInt(month) - 1 && 
           d.getDate() === parseInt(day);
  }

  private convertDateToISO(str: string): string {
    const [day, month, year] = str.split('/');
    return `${year}-${month}-${day}`;
  }

  private async criarUsuario(state: UserState): Promise<any> {
    const response = await axios.post(`${this.backendUrl}/api/usuarios`, state);
    return response.data;
  }

  public start() {
    this.bot.launch();
    console.log('✅ Bot do Telegram pronto!');
  }

  // ESTE É O MÉTODO QUE ESTÁ DANDO ERRO NO INDEX.TS
  public stop() {
    this.bot.stop('SIGINT');
    console.log('🛑 Bot do Telegram encerrado.');
  }
}