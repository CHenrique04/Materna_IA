import { Router } from 'express';
import { UsuarioController } from './usuarios.controller';

const router = Router();
const controller = new UsuarioController();

// Novas Rotas Globais (Colocadas ANTES do /:id para não dar conflito de rotas)
router.get('/alertas/pendentes', controller.listarAlertasPendentes);
router.put('/alertas/:id/resolver', controller.resolverAlerta);

// Rotas Originais
router.get('/', controller.listar);
router.get('/telefone/:telefone', controller.buscarPorTelefone);
router.get('/telegram/:telegramId', controller.buscarPorTelegramId);

// Rotas com ID (Parâmetros de URL)
router.get('/:id', controller.buscarPorId);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.deletar);
router.get('/:id/mensagens', controller.listarMensagens);

export default router;