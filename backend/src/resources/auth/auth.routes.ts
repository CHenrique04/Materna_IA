import { Router } from 'express';
import { AuthController } from './auth.controller';

const router = Router();
const controller = new AuthController();

router.get('/check-setup', controller.checkSetup);
router.post('/setup', controller.setup);
router.post('/login', controller.login);

export default router;