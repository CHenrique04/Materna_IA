import { Router } from 'express';
import usuariosRoutes from './resources/usuarios/usuarios.routes';

const router = Router();
router.use('/usuarios', usuariosRoutes);

export default router;