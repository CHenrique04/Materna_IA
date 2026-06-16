import { Router } from 'express';
import usuariosRoutes from './resources/usuarios/usuarios.routes';
import administradoresRoutes from './resources/administradores/administradores.routes';
import examesRoutes from './resources/exames/exames.routes';
import dashboardRoutes from './resources/dashboard/dashboard.routes';
const router = Router();
router.use('/exames', examesRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/administradores', administradoresRoutes);
router.use('/dashboard', dashboardRoutes);


export default router;

