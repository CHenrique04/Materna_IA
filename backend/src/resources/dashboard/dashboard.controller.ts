import { Request, Response } from 'express';
import { DashboardService } from './dashboard.service';

const service = new DashboardService();

export class DashboardController {
  async getMetricas(req: Request, res: Response) {
    try {
      const metricas = await service.obterMetricas();
      res.json(metricas);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao obter métricas' });
    }
  }
}