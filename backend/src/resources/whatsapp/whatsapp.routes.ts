// src/resources/whatsapp/whatsapp.routes.ts
import { Router, Request, Response } from 'express';
import { processarMensagemWhatsApp } from '../../services/mensagem.service';

const router = Router();

/**
 * GET /api/whatsapp/webhook
 * Verificação do webhook exigida pela Meta no setup inicial.
 */
router.get('/', (req: Request, res: Response) => {
  const VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN;

  const mode      = req.query['hub.mode'] as string;
  const token     = req.query['hub.verify_token'] as string;
  const challenge = req.query['hub.challenge'] as string;

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('[WhatsApp] Webhook verificado com sucesso ✓');
    return res.status(200).send(challenge);
  }

  console.warn('[WhatsApp] Tentativa de verificação com token inválido');
  res.sendStatus(403);
});

/**
 * POST /api/whatsapp/webhook
 * Recebe mensagens e eventos do WhatsApp Business API.
 */
router.post('/', async (req: Request, res: Response) => {
  // Meta exige resposta 200 imediata — processar de forma assíncrona
  res.sendStatus(200);

  try {
    const body = req.body;

    if (body.object !== 'whatsapp_business_account') return;

    const entry    = body.entry?.[0];
    const changes  = entry?.changes?.[0];
    const value    = changes?.value;
    const messages = value?.messages;

    // Ignora se não houver mensagem (eventos de status, delivery, etc.)
    if (!messages?.length) return;

    const msg = messages[0];

    // Ignora mensagens que não sejam de texto (áudio, imagem, etc.)
    if (msg.type !== 'text' || !msg.text?.body) {
      console.log(`[WhatsApp] Tipo de mensagem ignorado: ${msg.type}`);
      return;
    }

    await processarMensagemWhatsApp({
      de:            msg.from,
      texto:         msg.text.body,
      messageId:     msg.id,
      phoneNumberId: value.metadata.phone_number_id,
    });

  } catch (error) {
    console.error('[WhatsApp] Erro ao processar mensagem:', error);
  }
});

export default router;
