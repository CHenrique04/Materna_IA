import { Router } from 'express';
import usuariosRoutes from './resources/usuarios/usuarios.routes';
import administradoresRoutes from './resources/administradores/administradores.routes';

const router = Router();
router.use('/usuarios', usuariosRoutes);
router.use('/administradores', administradoresRoutes);

export default router;