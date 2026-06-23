import { Client, LocalAuth } from 'whatsapp-web.js';
import qrcode from 'qrcode-terminal';

export class WhatsAppService {
  private client: Client;
  private isReady = false;
  private isInitializing = false;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private backoffDelay = 1000; // 1 segundo inicial
  private readonly maxBackoffDelay = 60000; // 1 minuto máximo

  constructor() {
    this.client = this.createClient();
    this.setupEventListeners();
  }

  /**
   * Cria uma nova instância do Client com configurações otimizadas
   */
  private createClient(): Client {
    return new Client({
      authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth' // pasta onde a sessão será salva
      }),
      puppeteer: {
        headless: false, // Mantenha false em desenvolvimento (visível)
        devtools: false,  // Ative apenas se precisar debuggar
        timeout: 180000,  // 3 minutos para carregamento
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ]
      }
    });
  }

  /**
   * Configura todos os eventos do cliente
   */
  private setupEventListeners(): void {
    // --- QR Code ---
    this.client.on('qr', (qr) => {
      console.log('\n📱 Escaneie o QR Code abaixo com o WhatsApp:');
      qrcode.generate(qr, { small: true });
      console.log('⏳ O QR Code expira em 60 segundos. Escaneie rapidamente!\n');
    });

    // --- Cliente pronto ---
    this.client.on('ready', () => {
      console.log('✅ Bot da Materna.IA conectado com sucesso!');
      this.isReady = true;
      this.isInitializing = false;
      this.reconnectAttempts = 0;
      this.backoffDelay = 1000; // reset do backoff
    });

    // --- Autenticação falhou ---
    this.client.on('auth_failure', (msg) => {
      console.error('❌ Falha na autenticação:', msg);
      this.isInitializing = false;
      // Não tenta reconectar automaticamente; aguarda ação manual
    });

    // --- Mensagens recebidas ---
    this.client.on('message', async (msg) => {
      if (!this.isReady) {
        console.log('⏳ Bot ainda não pronto, ignorando mensagem.');
        return;
      }

      console.log(`📩 Mensagem de ${msg.from}: ${msg.body}`);

      // Resposta de exemplo com delay para evitar spam
      try {
        // Delay artificial para não parecer robótico
        await new Promise(resolve => setTimeout(resolve, 2000));

        const text = msg.body.toLowerCase().trim();
        if (text === 'oi' || text === 'olá' || text === 'ola') {
          await msg.reply('Olá! Sou a assistente virtual da Materna.IA 🤰. Qual é o seu nome completo?');
        } else if (text.includes('obrigado')) {
          await msg.reply('Por nada! 😊 Estou aqui para ajudar.');
        }
        // Adicione mais regras conforme necessário
      } catch (error) {
        console.error('Erro ao processar mensagem:', error);
      }
    });

    // --- Desconexão ---
    this.client.on('disconnected', async (reason) => {
      console.log(`🔴 Desconectado: ${reason}`);
      this.isReady = false;
      this.isInitializing = false;

      // Se for LOGOUT (sessão expirada), tentamos reconectar com backoff
      if (reason === 'LOGOUT') {
        this.reconnectAttempts++;
        if (this.reconnectAttempts > this.maxReconnectAttempts) {
          console.log('❌ Número máximo de tentativas de reconexão atingido. Encerrando processo.');
          // Em vez de process.exit, emitimos um evento ou simplesmente paramos
          // Para manter o app rodando, podemos apenas resetar as tentativas após um tempo
          // Mas é melhor deixar o usuário decidir. Vamos apenas desativar futuras tentativas.
          console.log('⚠️ O bot não tentará mais reconectar automaticamente. Reinicie manualmente.');
          return;
        }

        // Backoff exponencial: 1s, 2s, 4s, 8s, 16s, 32s, 60s (máx)
        const delay = Math.min(this.backoffDelay * Math.pow(2, this.reconnectAttempts - 1), this.maxBackoffDelay);
        console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts} em ${delay/1000}s...`);

        setTimeout(() => {
          // Destroi o cliente antigo para limpar recursos
          this.client.destroy().catch((err) => {
            console.warn('Erro ao destruir cliente:', err);
          });
          // Cria um novo cliente e reconfigura os eventos
          this.client = this.createClient();
          this.setupEventListeners();
          this.client.initialize().catch((err) => {
            console.error('Erro ao reinicializar:', err);
          });
        }, delay);
      } else {
        // Outros motivos (ex: rede) – tentamos reconectar com o mesmo cliente
        console.log('🔄 Reconectando em 30 segundos...');
        setTimeout(() => {
          this.client.initialize().catch((err) => {
            console.error('Erro na reconexão:', err);
          });
        }, 30000);
      }
    });
  }

  /**
   * Inicia o bot (deve ser chamado uma única vez)
   */
  public start(): void {
    if (this.isReady) {
      console.log('⚠️ Bot já está rodando.');
      return;
    }
    if (this.isInitializing) {
      console.log('⏳ Bot já está sendo inicializado.');
      return;
    }

    this.isInitializing = true;
    console.log('🚀 Iniciando o bot...');

    this.client.initialize().catch((err) => {
      console.error('❌ Erro fatal na inicialização:', err);
      this.isInitializing = false;
      // Tenta novamente após 1 minuto (para não sobrecarregar)
      setTimeout(() => this.start(), 60000);
    });
  }

  /**
   * Para o bot (destrói o cliente)
   */
  public async stop(): Promise<void> {
    if (this.client) {
      try {
        await this.client.destroy();
      } catch (err) {
        console.warn('Erro ao destruir cliente:', err);
      }
      this.isReady = false;
      this.isInitializing = false;
      console.log('🛑 Bot parado.');
    }
  }

  /**
   * Retorna se o bot está pronto para receber mensagens
   */
  public getReady(): boolean {
    return this.isReady;
  }
}