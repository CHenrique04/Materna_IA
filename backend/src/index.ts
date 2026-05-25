import express from "express";
import cors from "cors";
import dotenv from 'dotenv';
import router from './router';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('API do Chatbot Gestante funcionando!');
});
app.use('/api', router);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

