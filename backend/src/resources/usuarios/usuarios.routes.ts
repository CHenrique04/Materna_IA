import { Router } from 'express';
import { UsuarioController } from './usuarios.controller';

const router = Router();
const controller = new UsuarioController();

router.get('/', controller.listar);
router.get('/:id', controller.buscarPorId);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.deletar);
router.get('/:id/mensagens', controller.listarMensagens);
router.get('/telefone/:telefone', controller.buscarPorTelefone);

export default router;