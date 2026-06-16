import { Router } from 'express';
import { ExameController } from './exames.controller';

const router = Router();
const controller = new ExameController();

router.get('/usuario/:usuarioId', controller.listarPorUsuario);
router.get('/:id', controller.buscarPorId);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.deletar);

export default router;