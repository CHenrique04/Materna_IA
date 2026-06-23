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
        consultas: true
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
    const dataUM = data.dataUltimaMenstruacao ? new Date(data.dataUltimaMenstruacao) : null;

    const usuario = await prisma.usuario.create({
      data: {
        telegramId: data.telegramId ?? null, // ADICIONADO AQUI
        nome: data.nome,
        telefone: data.telefone,
        dataNascimento: dataNasc, 
        dataUltimaMenstruacao: dataUM
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
    if (data.telegramId !== undefined) dataToUpdate.telegramId = data.telegramId; // ADICIONADO AQUI
    if (data.nome !== undefined) dataToUpdate.nome = data.nome;
    if (data.telefone !== undefined) dataToUpdate.telefone = data.telefone;
    if (data.dataNascimento !== undefined) dataToUpdate.dataNascimento = data.dataNascimento;
    if (data.dataUltimaMenstruacao !== undefined) dataToUpdate.dataUltimaMenstruacao = data.dataUltimaMenstruacao;

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
}