import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import router from './router';
import { WhatsAppService } from './resources/whatsapp/whatsapp.service';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const whatsappService = new WhatsAppService();
// 🛑 BOT DESLIGADO TEMPORARIAMENTE
// whatsappService.start(); 

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API do Chatbot Gestante funcionando!');
});

// Rota de status fixada como desconectada para não dar erro
app.get('/status', (req, res) => {
  res.json({
    botReady: false, 
    status: 'desconectado'
  });
});

app.use('/api', router);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor (Ctrl+C)...');
  // await whatsappService.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Encerrando servidor (SIGTERM)...');
  // await whatsappService.stop();
  process.exit(0);
});