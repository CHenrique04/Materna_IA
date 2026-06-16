import { Request, Response } from 'express';
import { ExameService } from './exames.service';

const service = new ExameService();

export class ExameController {
  async listarPorUsuario(req: Request, res: Response) {
    try {
      const usuarioIdParam = req.params.usuarioId;
      if (!usuarioIdParam || typeof usuarioIdParam !== 'string') {
        return res.status(400).json({ error: 'ID de usuário inválido' });
      }
      
      const usuarioId = parseInt(usuarioIdParam);
      if (isNaN(usuarioId)) return res.status(400).json({ error: 'ID deve ser um número' });
      
      const exames = await service.listarPorUsuario(usuarioId);
      res.json(exames);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar exames' });
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

      const exame = await service.buscarPorId(id);
      if (!exame) return res.status(404).json({ error: 'Exame não encontrado' });
      res.json(exame);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar exame' });
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const exame = await service.criar(req.body);
      res.status(201).json(exame);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar exame' });
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

      const exame = await service.atualizar(id, req.body);
      res.json(exame);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar exame' });
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
      res.status(500).json({ error: 'Erro ao deletar exame' });
    }
  }
}