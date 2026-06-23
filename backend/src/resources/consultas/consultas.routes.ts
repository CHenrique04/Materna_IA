import { Router } from 'express';
import { ConsultaController } from './consultas.controller';

const router = Router();
const controller = new ConsultaController();

router.get('/', controller.listarTodas);
router.post('/', controller.criar);
router.get('/usuario/:usuarioId', controller.listarPorUsuario);
router.get('/:id', controller.buscarPorId);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.deletar);

export default router;