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
        cargo: data.cargo,
        municipio: data.municipio,
        senhaHash,
        ativo: true,
      },
      select: { id: true, nome: true, email: true, cargo: true, municipio: true, ativo: true, createdAt: true, updatedAt: true }
    });
  }

  async atualizar(id: number, data: UpdateAdministradorDTO) {
    const updateData: any = {};
    if (data.nome !== undefined) updateData.nome = data.nome;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.cargo !== undefined) updateData.cargo = data.cargo;
    if (data.municipio !== undefined) updateData.municipio = data.municipio;
    if (data.senha) {
      updateData.senhaHash = await bcrypt.hash(data.senha, saltRounds);
    }

    return await prisma.administrador.update({
      where: { id },
      data: updateData,
      select: { id: true, nome: true, email: true, cargo: true, municipio: true, ativo: true, createdAt: true, updatedAt: true }
    });
  }

  async deletar(id: number) {
    await prisma.administrador.delete({ where: { id } });
  }
}