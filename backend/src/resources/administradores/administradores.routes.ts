import { Router } from 'express';
import { AdministradorController } from './administradores.controller';

const router = Router();
const controller = new AdministradorController();

router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.deletar);

export default router;