import prisma from '../../utils/prisma';
import { CreateExameDTO, UpdateExameDTO, ExameResponse } from './exames.types';

export class ExameService {
  async listarPorUsuario(usuarioId: number): Promise<ExameResponse[]> {
    return await prisma.exame.findMany({
      where: { usuarioId },
      orderBy: { dataExame: 'desc' }
    });
  }

  async buscarPorId(id: number): Promise<ExameResponse | null> {
    return await prisma.exame.findUnique({ where: { id } });
  }

  async criar(data: CreateExameDTO): Promise<ExameResponse> {
    return await prisma.exame.create({ data });
  }

  async atualizar(id: number, data: UpdateExameDTO): Promise<ExameResponse> {
    const dataToUpdate: any = {};
    if (data.tipo !== undefined) dataToUpdate.tipo = data.tipo;
    if (data.dataExame !== undefined) dataToUpdate.dataExame = data.dataExame;
    if (data.resultado !== undefined) dataToUpdate.resultado = data.resultado;
    if (data.arquivoUrl !== undefined) dataToUpdate.arquivoUrl = data.arquivoUrl;
    if (data.usuarioId !== undefined) dataToUpdate.usuarioId = data.usuarioId;

    return await prisma.exame.update({
      where: { id },
      data: dataToUpdate
    });
  }

  async deletar(id: number): Promise<void> {
    await prisma.exame.delete({ where: { id } });
  }
}