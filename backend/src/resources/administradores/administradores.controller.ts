import { Request, Response } from 'express';
import { AdministradorService } from './administradores.service';

const service = new AdministradorService();

export class AdministradorController {
  async listar(req: Request, res: Response) {
    try {
      const admins = await service.listarTodos();
      res.json(admins);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar administradores' });
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

      const admin = await service.buscarPorId(id);
      if (!admin) return res.status(404).json({ error: 'Administrador não encontrado' });
      res.json(admin);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar administrador' });
    }
  }

  async criar(req: Request, res: Response) {
    try {
      const { senha, ...rest } = req.body;
      if (!senha) return res.status(400).json({ error: 'Senha é obrigatória' });
      const novoAdmin = await service.criar({ ...rest, senha });
      res.status(201).json(novoAdmin);
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(409).json({ error: 'E-mail já cadastrado' });
      } else {
        res.status(500).json({ error: 'Erro ao criar administrador' });
      }
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

      const adminAtualizado = await service.atualizar(id, req.body);
      res.json(adminAtualizado);
    } catch (error: any) {
      if (error.code === 'P2002') {
        res.status(409).json({ error: 'E-mail já cadastrado' });
      } else if (error.message?.includes('not found')) {
        res.status(404).json({ error: 'Administrador não encontrado' });
      } else {
        res.status(500).json({ error: 'Erro ao atualizar administrador' });
      }
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
      res.status(500).json({ error: 'Erro ao deletar administrador' });
    }
  }
}