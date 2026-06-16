import prisma from '../../utils/prisma';
import { CreateConsultaDTO, UpdateConsultaDTO, ConsultaResponse } from './consultas.types';

export class ConsultaService {
  async listarPorUsuario(usuarioId: number): Promise<ConsultaResponse[]> {
    return await prisma.consulta.findMany({
      where: { usuarioId },
      orderBy: { dataHora: 'asc' }
    });
  }

  async buscarPorId(id: number): Promise<ConsultaResponse | null> {
    return await prisma.consulta.findUnique({ where: { id } });
  }

  async criar(data: CreateConsultaDTO): Promise<ConsultaResponse> {
    return await prisma.consulta.create({
      data: {
        ...data,
        status: data.status || 'agendada'
      }
    });
  }

  async atualizar(id: number, data: UpdateConsultaDTO): Promise<ConsultaResponse> {
    const dataToUpdate: any = {};
    if (data.dataHora !== undefined) dataToUpdate.dataHora = data.dataHora;
    if (data.local !== undefined) dataToUpdate.local = data.local;
    if (data.status !== undefined) dataToUpdate.status = data.status;
    if (data.usuarioId !== undefined) dataToUpdate.usuarioId = data.usuarioId;

    return await prisma.consulta.update({ where: { id }, data: dataToUpdate });
  }

  async deletar(id: number): Promise<void> {
    await prisma.consulta.delete({ where: { id } });
  }
}