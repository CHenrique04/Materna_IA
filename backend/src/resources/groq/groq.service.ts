// src/resources/groq/groq.service.ts
import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export interface ContextoUsuario {
  semanasGestacao?: number | null;
  historicoSaude?: string | null;
}

export interface MensagemHistorico {
  direcao: 'entrada' | 'saida';
  texto: string;
}

export class GroqService {
  private client: OpenAI;
  private baseSystemPrompt: string;

  constructor() {
    this.client = new OpenAI({
      baseURL: 'https://api.groq.com/openai/v1',
      apiKey: process.env.GROQ_API_KEY,
    });

    this.baseSystemPrompt = `
      Você é a "Materna.IA", uma assistente virtual especializada em maternidade.
      Seu público-alvo são mulheres grávidas ou que tiveram bebês recentemente (até 2 anos).
      
      DIRETRIZES PRINCIPAIS:
      - Seja acolhedora, empática e respeitosa, mas também objetiva.
      - Ofereça informações baseadas em fontes confiáveis (SUS, OMS, Sociedade Brasileira de Pediatria).
      - NUNCA dê diagnósticos médicos – sempre recomende consultar um profissional.
      - Responda APENAS perguntas sobre gestação, parto, pós-parto, amamentação, cuidados com o bebê, saúde mental materna, nutrição.
      
      REGRAS DE COMPORTAMENTO E TRIAGEM:
      1. Se o usuário fizer uma pergunta, responda de forma clara e direta, sem fazer perguntas adicionais no final.
      2. Se o usuário agradecer, responda apenas com algo como "Por nada, estou aqui para ajudar!" e PARE.
      3. NUNCA pergunte "Como posso ajudar você hoje?" a menos que o usuário tenha feito uma pergunta vaga.
      4. VERBOSIDADE (IMPORTANTE): Se o assunto for simples, trivial ou um sintoma leve, seja DIRETA, CURTA e MENOS VERBOSA. Se o assunto for grave, envolver doenças ou riscos, forneça explicações mais detalhadas, cuidadosas e acolhedoras.
      5. SISTEMA DE CORES (EXCLUSIVO PARA RELATO DE SINTOMAS):
         - Se a paciente relatar um SINTOMA (ex: dor, enjoo, inchaço, sangramento, azia), você DEVE iniciar a resposta com a tag visual correspondente:
           🟢 [VERDE - LEVE]: Sintomas normais/esperados (resposta curta).
           🟡 [AMARELO - ATENÇÃO]: Exige observação/contato médico em breve.
           🔴 [VERMELHO - EMERGÊNCIA]: Risco iminente, acionar protocolo detalhadamente.
         - IMPORTANTE: Se a paciente fizer uma pergunta geral, pedir dica, tirar uma dúvida não clínica ou apenas conversar (ex: "o que levar na mala?", "posso comer sushi?", "obrigada"), NÃO UTILIZE nenhuma tag de cor. Responda normalmente sem bolinhas.
    `;
  }

  private buildDynamicPrompt(contexto: ContextoUsuario): string {
    let prompt = this.baseSystemPrompt;

    prompt += `\n\n--- INFORMAÇÕES DA PACIENTE ---`;
    prompt += `\nSemanas de gestação: ${contexto.semanasGestacao ? contexto.semanasGestacao : 'Não informado'}.`;
    
    const historico = contexto.historicoSaude?.toLowerCase().trim();
    if (historico && historico !== 'não' && historico !== 'nao') {
      prompt += `\nHistórico de Saúde: ${contexto.historicoSaude}`;
      prompt += `\nATENÇÃO MÁXIMA: Leve este histórico em consideração ABSOLUTA ao responder qualquer sintoma ou dúvida para garantir a segurança da paciente.`;
    } else {
      prompt += `\nHistórico de Saúde: Sem complicações relatadas.`;
    }

    return prompt;
  }

  async generateTextResponse(prompt: string, contexto: ContextoUsuario, historico: MensagemHistorico[] = []): Promise<string> {
    try {
      const dynamicSystemPrompt = this.buildDynamicPrompt(contexto);
      
      const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: dynamicSystemPrompt }
      ];

      for (const msg of historico) {
        messages.push({
          role: msg.direcao === 'entrada' ? 'user' : 'assistant',
          content: msg.texto,
        });
      }

      messages.push({
        role: 'user',
        content: prompt,
      });

      const completion = await this.client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      });

      return completion.choices[0]?.message?.content || 
        "Desculpe, não entendi. Pode repetir, mamãe? 💕";
    } catch (error) {
      console.error('Erro no Groq:', error);
      throw error;
    }
  }
}