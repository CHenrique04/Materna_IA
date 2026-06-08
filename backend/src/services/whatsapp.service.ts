// src/services/whatsapp.service.ts
import fetch from 'node-fetch';

const WA_API_URL = 'https://graph.facebook.com/v19.0';

/**
 * Envia uma mensagem de texto simples para o usuário no WhatsApp.
 */
export async function enviarMensagem(para: string, texto: string, phoneNumberId: string): Promise<void> {
  const url = `${WA_API_URL}/${phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WA_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: para,
      type: 'text',
      text: { body: texto },
    }),
  });

  if (!response.ok) {
    const erro = await response.text();
    console.error('[WhatsApp] Erro ao enviar mensagem:', erro);
    throw new Error(`Falha ao enviar mensagem WhatsApp: ${response.status}`);
  }
}

/**
 * Marca a mensagem como lida (read receipt).
 */
export async function marcarComoLida(messageId: string, phoneNumberId: string): Promise<void> {
  const url = `${WA_API_URL}/${phoneNumberId}/messages`;

  await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WA_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    }),
  });
}
