import prisma from '../../utils/prisma';
import { CreateConsultaDTO, UpdateConsultaDTO } from './consultas.types';

export class ConsultaService {
  async listarPorUsuario(usuarioId: number) {
    return await prisma.consulta.findMany({
      where: { usuarioId },
      orderBy: { dataHora: 'asc' }
    });
  }

  async buscarPorId(id: number) {
    return await prisma.consulta.findUnique({ where: { id } });
  }

async criar(data: CreateConsultaDTO) {
    return await prisma.consulta.create({
      data: {
        dataHora: new Date(data.dataHora), 
        local: data.local,
        // O "as any" desliga o aviso de erro do TypeScript para esse campo
        status: (data.status || 'agendada') as any, 
        usuarioId: data.usuarioId
      }
    });
  }

  async atualizar(id: number, data: UpdateConsultaDTO) {
    const dataToUpdate: any = {};
    if (data.dataHora !== undefined) dataToUpdate.dataHora = new Date(data.dataHora);
    if (data.local !== undefined) dataToUpdate.local = data.local;
    // Também colocamos o "as any" aqui na atualização
    if (data.status !== undefined) dataToUpdate.status = data.status as any; 
    if (data.usuarioId !== undefined) dataToUpdate.usuarioId = data.usuarioId;

    return await prisma.consulta.update({ where: { id }, data: dataToUpdate });
  }

  async deletar(id: number) {
    await prisma.consulta.delete({ where: { id } });
  }

  async listarTodas() {
    return await prisma.consulta.findMany({
      include: { usuario: { select: { nome: true } } },
      orderBy: { dataHora: 'asc' }
    });
  }
}