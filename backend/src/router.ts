import { Router } from 'express';
import usuariosRoutes from './resources/usuarios/usuarios.routes';
import administradoresRoutes from './resources/administradores/administradores.routes';
import whatsappRoutes from './resources/whatsapp/whatsapp.routes';

const router = Router();

router.use('/usuarios', usuariosRoutes);
router.use('/administradores', administradoresRoutes);
router.use('/whatsapp/webhook', whatsappRoutes);

export default router;
