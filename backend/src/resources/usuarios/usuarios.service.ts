// src/resources/usuarios/usuarios.service.ts
import prisma from '../../utils/prisma';
import { CreateUsuarioDTO, UpdateUsuarioDTO, UsuarioResponse } from './usuarios.types';

export class UsuarioService {
  async listarTodos(): Promise<UsuarioResponse[]> {
    const usuarios = await prisma.usuario.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return usuarios;
  }

  async buscarPorId(id: number): Promise<UsuarioResponse | null> {
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
  

  async criar(data: CreateUsuarioDTO): Promise<UsuarioResponse> {
    // Validação simples: telefone é obrigatório
    if (!data.telefone) {
      throw new Error('Telefone é obrigatório');
    }

    const usuario = await prisma.usuario.create({
      data: {
        nome: data.nome,
        telefone: data.telefone,
        dataNascimento: data.dataNascimento ?? null,
        dataUltimaMenstruacao: data.dataUltimaMenstruacao ?? null
      }
    });
    return usuario;
  }

  async atualizar(id: number, data: UpdateUsuarioDTO): Promise<UsuarioResponse> {
    const existe = await prisma.usuario.findUnique({ where: { id } });
    if (!existe) {
      throw new Error('Usuário não encontrado');
    }

    // Constrói objeto apenas com campos que não são undefined
    const dataToUpdate: any = {};
    
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

  async deletar(id: number): Promise<void> {
    const existe = await prisma.usuario.findUnique({ where: { id } });
    if (!existe) {
      throw new Error('Usuário não encontrado');
    }

    // Remove primeiro as dependências (mensagens, exames, consultas) - se houver chaves estrangeiras com onDelete Cascade, não precisa
    await prisma.$transaction([
      prisma.mensagem.deleteMany({ where: { usuarioId: id } }),
      prisma.exame.deleteMany({ where: { usuarioId: id } }),
      prisma.consulta.deleteMany({ where: { usuarioId: id } }),
      prisma.usuario.delete({ where: { id } })
    ]);
  }

  // Método específico para buscar mensagens de um usuário (log)
  async listarMensagensDoUsuario(usuarioId: number) {
    const mensagens = await prisma.mensagem.findMany({
      where: { usuarioId },
      orderBy: { createdAt: 'asc' }
    });
    return mensagens;
  }
}