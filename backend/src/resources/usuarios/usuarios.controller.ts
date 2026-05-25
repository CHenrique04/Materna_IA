// src/resources/usuarios/usuarios.controller.ts
import { Request, Response } from 'express';
import { UsuarioService } from './usuarios.service';

const usuarioService = new UsuarioService();

export class UsuarioController {
  async listar(req: Request, res: Response) {
    try {
      const usuarios = await usuarioService.listarTodos();
      res.json(usuarios);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao listar usuários' });
    }
  }

    async buscarPorId(req: Request, res: Response) {
    try {
        const { id } = req.params;
        if (!id || typeof id !== 'string') {
        return res.status(400).json({ error: 'ID não fornecido ou inválido' });
        }
        const numericId = parseInt(id);
        if (isNaN(numericId)) {
        return res.status(400).json({ error: 'ID deve ser um número' });
        }

        const usuario = await usuarioService.buscarPorId(numericId);
        if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
    }

  async criar(req: Request, res: Response) {
    try {
      const novoUsuario = await usuarioService.criar(req.body);
      res.status(201).json(novoUsuario);
    } catch (error: any) {
      if (error.message === 'Telefone é obrigatório') {
        res.status(400).json({ error: error.message });
      } else if (error.code === 'P2002') {
        res.status(409).json({ error: 'Telefone já cadastrado' });
      } else {
        res.status(500).json({ error: 'Erro ao criar usuário' });
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

        const usuarioAtualizado = await usuarioService.atualizar(id, req.body);
        res.json(usuarioAtualizado);
    } catch (error: any) {
        if (error.message === 'Usuário não encontrado') {
        res.status(404).json({ error: error.message });
        } else {
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
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

        await usuarioService.deletar(id);
        res.status(204).send();
    } catch (error: any) {
        if (error.message === 'Usuário não encontrado') {
        res.status(404).json({ error: error.message });
        } else {
        res.status(500).json({ error: 'Erro ao deletar usuário' });
        }
    }
    }

    async listarMensagens(req: Request, res: Response) {
    try {
        const idParam = req.params.id;
        if (!idParam || typeof idParam !== 'string') {
        return res.status(400).json({ error: 'ID inválido' });
        }
        const usuarioId = parseInt(idParam);
        if (isNaN(usuarioId)) return res.status(400).json({ error: 'ID deve ser um número' });

        const usuario = await usuarioService.buscarPorId(usuarioId);
        if (!usuario) return res.status(404).json({ error: 'Usuário não encontrado' });

        const mensagens = await usuarioService.listarMensagensDoUsuario(usuarioId);
        res.json(mensagens);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar mensagens' });
    }
    }
}