import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import router from './router';
import { TelegramService } from './resources/telegram/telegram.service';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const telegramBot = new TelegramService(process.env.TELEGRAM_BOT_TOKEN!);
telegramBot.start();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API do Chatbot Gestante funcionando!');
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