import prisma from '../../utils/prisma';
import { CreateUsuarioDTO, UpdateUsuarioDTO } from './usuarios.types';

export class UsuarioService {
  async listarTodos() {
    const usuarios = await prisma.usuario.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return usuarios;
  }
  
  async buscarPorTelefone(telefone: string) {
    return await prisma.usuario.findUnique({
      where: { telefone: telefone }
    });
  }

  async buscarPorId(id: number) {
    const usuario = await prisma.usuario.findUnique({
      where: { id },
      include: {
        mensagens: { orderBy: { createdAt: 'asc' } },
        exames: true,
        consultas: true,
        topicos: true, // NOVO: Traz os tópicos ao buscar o usuário
        alertas: true  // NOVO: Traz os alertas ao buscar o usuário
      }
    });
    return usuario;
  }
  
  async buscarPorTelegramId(telegramId: string) {
    return await prisma.usuario.findUnique({
      where: { telegramId: telegramId }
    });
  }
  
  async criar(data: CreateUsuarioDTO) {
    if (!data.telefone) {
      throw new Error('Telefone é obrigatório');
    }

    const dataNasc = data.dataNascimento ? new Date(data.dataNascimento) : null;

    const usuario = await prisma.usuario.create({
      data: {
        telegramId: data.telegramId ?? null,
        nome: data.nome,
        telefone: data.telefone,
        dataNascimento: dataNasc, 
        semanasGestacao: data.semanasGestacao ?? null,
        nomeEmergencia: data.nomeEmergencia ?? null, 
        numeroEmergencia: data.numeroEmergencia ?? null,
        historicoSaude: data.historicoSaude ?? null
      }
    });
    return usuario;
  }

  async atualizar(id: number, data: UpdateUsuarioDTO) {
    const existe = await prisma.usuario.findUnique({ where: { id } });
    if (!existe) {
      throw new Error('Usuário não encontrado');
    }

    const dataToUpdate: any = {};
    if (data.telegramId !== undefined) dataToUpdate.telegramId = data.telegramId;
    if (data.nome !== undefined) dataToUpdate.nome = data.nome;
    if (data.telefone !== undefined) dataToUpdate.telefone = data.telefone;
    
    if (data.dataNascimento !== undefined) {
      dataToUpdate.dataNascimento = data.dataNascimento ? new Date(data.dataNascimento) : null;
    }
    if (data.semanasGestacao !== undefined) dataToUpdate.semanasGestacao = data.semanasGestacao;
    if (data.numeroEmergencia !== undefined) dataToUpdate.numeroEmergencia = data.numeroEmergencia;
    if (data.historicoSaude !== undefined) dataToUpdate.historicoSaude = data.historicoSaude;
    if (data.nomeEmergencia !== undefined) dataToUpdate.nomeEmergencia = data.nomeEmergencia;

    const usuarioAtualizado = await prisma.usuario.update({
      where: { id },
      data: dataToUpdate
    });
    return usuarioAtualizado;
  }

  async deletar(id: number) {
    const existe = await prisma.usuario.findUnique({ where: { id } });
    if (!existe) {
      throw new Error('Usuário não encontrado');
    }

    await prisma.$transaction([
      prisma.mensagem.deleteMany({ where: { usuarioId: id } }),
      prisma.exame.deleteMany({ where: { usuarioId: id } }),
      prisma.consulta.deleteMany({ where: { usuarioId: id } }),
      prisma.topicoConsulta.deleteMany({ where: { usuarioId: id } }),
      prisma.alertaCritico.deleteMany({ where: { usuarioId: id } }),
      prisma.usuario.delete({ where: { id } })
    ]);
  }

  async listarMensagensDoUsuario(usuarioId: number) {
    const mensagens = await prisma.mensagem.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'asc' }
    });
    return mensagens;
  }

  // ATUALIZADO: Agora aceita o sentimento
  async salvarMensagem(usuarioId: number, texto: string, direcao: 'entrada' | 'saida', sentimento?: string) {
    return await prisma.mensagem.create({
      data: {
        texto,
        direcao,
        sentimento: sentimento ?? null,
        usuarioId
      }
    });
  }

  async buscarUltimasMensagens(usuarioId: number, limite: number = 10) {
    const mensagens = await prisma.mensagem.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'desc' }, 
      take: limite
    });
    return mensagens.reverse();
  }

  // --- NOVAS FUNÇÕES PARA AS INOVAÇÕES ---

  async salvarExame(usuarioId: number, tipo: string, arquivoUrl: string) {
    return await prisma.exame.create({
      data: {
        usuarioId,
        tipo,
        arquivoUrl,
        dataExame: new Date()
      }
    });
  }

  async salvarTopico(usuarioId: number, textoResumo: string) {
    return await prisma.topicoConsulta.create({
      data: {
        usuarioId,
        textoResumo
      }
    });
  }

  async salvarAlerta(usuarioId: number, resumo: string) {
    return await prisma.alertaCritico.create({
      data: {
        usuarioId,
        resumo
      }
    });
  }

  async listarAlertasPendentes() {
    return await prisma.alertaCritico.findMany({
      where: { status: 'pendente' },
      include: {
        usuario: {
          select: { nome: true, telefone: true, nomeEmergencia: true, numeroEmergencia: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async resolverAlerta(alertaId: number) {
    return await prisma.alertaCritico.update({
      where: { id: alertaId },
      data: { status: 'resolvido' }
    });
  }
}