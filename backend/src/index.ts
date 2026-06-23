import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import router from './router';
import { TelegramService } from './resources/telegram/telegram.service';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Inicializa o bot do Telegram
const telegramBot = new TelegramService(
  process.env.TELEGRAM_BOT_TOKEN || "8823013374:AAEjoxRonsXKGDsSXMdx0JehinIwZhwPrbo",
  process.env.GEMINI_API_KEY || "sua_chave",
  `http://localhost:${port}`
);
telegramBot.start();

app.get('/', (req, res) => {
  res.send('API do Chatbot Gestante funcionando!');
});

app.get('/status', (req, res) => {
  res.json({ status: 'online' });
});

app.use('/api', router);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando...');
  telegramBot.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Encerrando (SIGTERM)...');
  telegramBot.stop();
  process.exit(0);
});