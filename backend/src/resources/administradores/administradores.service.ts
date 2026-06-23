import prisma from '../../utils/prisma';
import bcrypt from 'bcrypt';
import { CreateAdministradorDTO, UpdateAdministradorDTO } from './administradores.types';

const saltRounds = 10;

export class AdministradorService {
  async listarTodos() {
    return await prisma.administrador.findMany({
      orderBy: { createdAt: 'desc' },
      // omitir o campo senhaHash da resposta
      select: { id: true, nome: true, email: true, cargo: true, municipio: true, ativo: true, createdAt: true, updatedAt: true }
    });
  }

  async buscarPorId(id: number) {
    return await prisma.administrador.findUnique({
      where: { id },
      select: { id: true, nome: true, email: true, cargo: true, municipio: true, ativo: true, createdAt: true, updatedAt: true }
    });
  }

  async criar(data: CreateAdministradorDTO) {
    const senhaHash = await bcrypt.hash(data.senha, saltRounds);
    return await prisma.administrador.create({
      data: {
        nome: data.nome,
        email: data.email,
        // O "as any" desliga o aviso de erro para o Enum do Prisma
        cargo: data.cargo as any, 
        municipio: data.municipio,
        senhaHash,
        ativo: true,
      },
      select: { id: true, nome: true, email: true, cargo: true, municipio: true, ativo: true, createdAt: true, updatedAt: true }
    });
  }

  async atualizar(id: number, data: any) { // O tipo do 'data' depende de como você configurou
    // 1. Busca o admin atual no banco para saber o cargo original dele
    const adminAtual = await prisma.administrador.findUnique({ where: { id } });
    if (!adminAtual) throw new Error('Administrador não encontrado');

    // 2. Verifica se ele ERA Admin Geral e está tentando mudar para outra coisa
    if (adminAtual.cargo === 'ADMIN_GERAL' && data.cargo && data.cargo !== 'ADMIN_GERAL') {
      const totalAdminGeral = await prisma.administrador.count({
        where: { cargo: 'ADMIN_GERAL' }
      });
      
      // Se ele for o único Admin Geral no sistema, bloqueia o rebaixamento
      if (totalAdminGeral <= 1) {
        throw new Error('Ação bloqueada: Você não pode remover o cargo do único Administrador Geral do sistema.');
      }
    }

    // 3. Se houver senha nova no 'data', lembre-se de fazer o bcrypt.hash aqui antes de salvar!
    // (Seu código original de update do Prisma entra aqui embaixo)
    
    return await prisma.administrador.update({
      where: { id },
      data: data
    });
  }

 async deletar(id: number) {
    // 1. Busca quem é o admin que está tentando ser apagado
    const adminParaDeletar = await prisma.administrador.findUnique({ where: { id } });
    if (!adminParaDeletar) throw new Error('Administrador não encontrado');

    // 2. Se ele for um ADMIN_GERAL, faz a verificação
    if (adminParaDeletar.cargo === 'ADMIN_GERAL') {
      const totalAdminGeral = await prisma.administrador.count({
        where: { cargo: 'ADMIN_GERAL' }
      });
      
      // Se só tem 1 (ele mesmo), proíbe a exclusão
      if (totalAdminGeral <= 1) {
        throw new Error('Ação bloqueada: O sistema precisa ter pelo menos um Administrador Geral.');
      }
    }

    // 3. Se passou pela trava, pode deletar
    await prisma.administrador.delete({ where: { id } });
  }
}