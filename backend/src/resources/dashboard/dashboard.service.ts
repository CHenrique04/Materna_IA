import prisma from '../../utils/prisma';

export class DashboardService {
  async obterMetricas() {
    const totalGestantes = await prisma.usuario.count();
    const totalConsultas = await prisma.consulta.count();
    const totalExames = await prisma.exame.count();
    const totalMensagens = await prisma.mensagem.count();

    // Consultas por status (opcional)
    const consultasAgendadas = await prisma.consulta.count({ where: { status: 'agendada' } });
    const consultasRealizadas = await prisma.consulta.count({ where: { status: 'realizada' } });

    // Cadastros por semana (últimas 5 semanas)
    const hoje = new Date();
    const semanas = [];
    for (let i = 4; i >= 0; i--) {
      const inicio = new Date(hoje);
      inicio.setDate(hoje.getDate() - (hoje.getDay() + 7 * i));
      const fim = new Date(inicio);
      fim.setDate(inicio.getDate() + 6);
      const count = await prisma.usuario.count({
        where: {
          createdAt: { gte: inicio, lte: fim }
        }
      });
      semanas.push(count);
    }

    return {
      totalGestantes,
      totalConsultas,
      totalExames,
      totalMensagens,
      consultasAgendadas,
      consultasRealizadas,
      cadastrosPorSemana: semanas
    };
  }
}