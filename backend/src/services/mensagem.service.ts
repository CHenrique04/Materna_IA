// src/services/mensagem.service.ts
import prisma from '../utils/prisma';
import { classificarIntencao, chatLivreComGemini, resumirDadosParaUsuario } from './gemini.service';
import { enviarMensagem, marcarComoLida } from './whatsapp.service';
import { obterHistorico, adicionarAoHistorico } from './sessao.service';

interface DadosWebhook {
  de: string;         // número do remetente (ex: "5592999999999")
  texto: string;      // corpo da mensagem
  messageId: string;  // ID da mensagem
  phoneNumberId: string; // ID do número do negócio
}

/**
 * Orquestra o fluxo completo ao receber uma mensagem do WhatsApp.
 */
export async function processarMensagemWhatsApp(dados: DadosWebhook): Promise<void> {
  const { de, texto, messageId, phoneNumberId } = dados;

  // Marca como lida imediatamente
  await marcarComoLida(messageId, phoneNumberId).catch(() => {});

  // 1. Busca ou cria o usuário pelo telefone
  let usuario = await prisma.usuario.findUnique({ where: { telefone: de } });

  if (!usuario) {
    // Auto-cadastro: cria usuário com nome temporário
    usuario = await prisma.usuario.create({
      data: {
        nome: 'Nova Gestante',
        telefone: de,
      },
    });
  }

  // 2. Salva a mensagem de entrada no banco
  await prisma.mensagem.create({
    data: {
      texto,
      direcao: 'entrada',
      usuarioId: usuario.id,
    },
  });

  // 3. Classifica a intenção com Gemini
  const intencao = await classificarIntencao(texto);
  console.log(`[Intenção] ${de} → ${intencao}`);

  let resposta: string;

  switch (intencao) {
    case 'AGENDAMENTO':
      resposta = await tratarAgendamento(texto, usuario.id);
      break;

    case 'CONSULTA_BD':
      resposta = await tratarConsultaBD(texto, usuario.id);
      break;

    case 'CHAT_LIVRE':
    default:
      const historico = obterHistorico(de);
      resposta = await chatLivreComGemini(texto, historico);
      break;
  }

  // 4. Atualiza histórico da sessão
  adicionarAoHistorico(de, 'user', texto);
  adicionarAoHistorico(de, 'model', resposta);

  // 5. Salva a resposta no banco
  await prisma.mensagem.create({
    data: {
      texto: resposta,
      direcao: 'saida',
      usuarioId: usuario.id,
    },
  });

  // 6. Envia a resposta ao usuário
  await enviarMensagem(de, resposta, phoneNumberId);
}

/**
 * Fluxo de agendamento: lista próximas consultas ou orienta sobre agendamento.
 */
async function tratarAgendamento(texto: string, usuarioId: number): Promise<string> {
  const consultas = await prisma.consulta.findMany({
    where: {
      usuarioId,
      status: 'agendada',
    },
    orderBy: { dataHora: 'asc' },
    take: 5,
  });

  const dados = {
    consultasAgendadas: consultas,
    totalAgendadas: consultas.length,
  };

  return resumirDadosParaUsuario(texto, dados);
}

/**
 * Fluxo de consulta ao banco: exames, histórico, dados da gestante.
 */
async function tratarConsultaBD(texto: string, usuarioId: number): Promise<string> {
  const [usuario, exames, consultas] = await Promise.all([
    prisma.usuario.findUnique({ where: { id: usuarioId } }),
    prisma.exame.findMany({ where: { usuarioId }, orderBy: { id: 'desc' }, take: 5 }),
    prisma.consulta.findMany({ where: { usuarioId }, orderBy: { dataHora: 'desc' }, take: 5 }),
  ]);

  const dados = {
    gestante: {
      nome: usuario?.nome,
      dataNascimento: usuario?.dataNascimento,
      dataUltimaMenstruacao: usuario?.dataUltimaMenstruacao,
    },
    examesRecentes: exames,
    consultasRecentes: consultas,
  };

  return resumirDadosParaUsuario(texto, dados);
}
