import { Request, Response } from 'express';
import { ConsultaService } from './consultas.service';

const service = new ConsultaService();

export class ConsultaController {
  async listarTodas(req: Request, res: Response) {
    try {
      const consultas = await service.listarTodas();
      res.json(consultas);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar consultas' });
    }
  }
  
  async listarPorUsuario(req: Request, res: Response) {
    try {
      const usuarioIdParam = req.params.usuarioId;
      if (!usuarioIdParam || typeof usuarioIdParam !== 'string') {
        return res.status(400).json({ error: 'ID de usuário inválido' });
      }
      
      const usuarioId = parseInt(usuarioIdParam);
      if (isNaN(usuarioId)) return res.status(400).json({ error: 'ID deve ser um número' });

      const consultas = await service.listarPorUsuario(usuarioId);
      res.json(consultas);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar consultas' });
    }
  }

  async buscarPorId(req: Request, res: Response) {
    try {
      const idParam = req.params.id;
      if (!idParam || typeof idParam !== 'string') {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const id = parseInt(idParam);
      if (isNaN(id)) return res.status(400).json({ error: 'ID deve ser um número' });

      const consulta = await service.buscarPorId(id);
      if (!consulta) return res.status(404).json({ error: 'Consulta não encontrada' });
      res.json(consulta);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar consulta' });
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const consulta = await service.criar(req.body);
      res.status(201).json(consulta);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar consulta' });
    }
  }

  async atualizar(req: Request, res: Response) {
    try {
      const idParam = req.params.id;
      if (!idParam || typeof idParam !== 'string') {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const id = parseInt(idParam);
      if (isNaN(id)) return res.status(400).json({ error: 'ID deve ser um número' });

      const consulta = await service.atualizar(id, req.body);
      res.json(consulta);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar consulta' });
    }
  }

  async deletar(req: Request, res: Response) {
    try {
      const idParam = req.params.id;
      if (!idParam || typeof idParam !== 'string') {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const id = parseInt(idParam);
      if (isNaN(id)) return res.status(400).json({ error: 'ID deve ser um número' });

      await service.deletar(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Erro ao deletar consulta' });
    }
    
  }
}