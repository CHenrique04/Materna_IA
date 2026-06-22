import { Request, Response } from 'express';
import { AuthService } from './auth.service';

const service = new AuthService();

export class AuthController {
  async checkSetup(req: Request, res: Response) {
    const isComplete = await service.isSetupComplete();
    res.json({ isSetupComplete: isComplete });
  }

  async setup(req: Request, res: Response) {
    try {
      const admin = await service.setup(req.body);
      res.status(201).json(admin);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, senha } = req.body;
      const resultado = await service.login(email, senha);
      res.json(resultado);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  }
}