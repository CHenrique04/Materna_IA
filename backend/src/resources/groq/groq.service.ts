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

// NOVO: Interface estruturada de resposta
export interface RespostaIA {
  resposta: string;
  sentimento: string | null;
  resumoAlerta: string | null;
  topicoConsulta: string | null;
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
      - Seja acolhedora, empática e respeitosa, mas objetiva.
      - Ofereça informações baseadas em fontes confiáveis.
      - NUNCA dê diagnósticos médicos.
      
      REGRAS DE COMPORTAMENTO E TRIAGEM:
      1. Se o assunto for simples/leve, seja DIRETA e MENOS VERBOSA. Se for grave, seja detalhada e acolhedora.
      2. SISTEMA DE CORES (EXCLUSIVO PARA SINTOMAS):
         - 🟢 [VERDE - LEVE]: Sintomas normais/esperados.
         - 🟡 [AMARELO - ATENÇÃO]: Exige observação/contato médico.
         - 🔴 [VERMELHO - EMERGÊNCIA]: Risco iminente. Acionar protocolo.
         - IMPORTANTE: Dúvidas gerais ou conversa casual NÃO devem ter bolinhas.
      
      3. OBRIGATÓRIO: Você deve retornar EXCLUSIVAMENTE um objeto JSON válido, sem formatação Markdown ao redor (sem \`\`\`json), contendo as seguintes chaves:
         {
           "resposta": "Sua resposta formatada para a paciente (incluindo as bolinhas se for o caso).",
           "sentimento": "Uma única palavra definindo o humor dela: Tranquila, Ansiosa, Dor, Estressada, Dúvida ou Feliz",
           "resumoAlerta": "Se a resposta for 🔴 VERMELHA, crie um resumo de até 5 palavras do risco. Caso contrário, null.",
           "topicoConsulta": "Se houver uma queixa amarela/vermelha ou se a paciente pedir para lembrar de algo, escreva um resumo de 1 linha para o médico. Caso contrário, null."
         }
    `;
  }

  private buildDynamicPrompt(contexto: ContextoUsuario): string {
    let prompt = this.baseSystemPrompt;

    prompt += `\n\n--- INFORMAÇÕES DA PACIENTE ---`;
    prompt += `\nSemanas de gestação: ${contexto.semanasGestacao ? contexto.semanasGestacao : 'Não informado'}.`;
    
    const historico = contexto.historicoSaude?.toLowerCase().trim();
    if (historico && historico !== 'não' && historico !== 'nao') {
      prompt += `\nHistórico de Saúde: ${contexto.historicoSaude}`;
      prompt += `\nATENÇÃO MÁXIMA: Leve este histórico em consideração ABSOLUTA ao responder.`;
    } else {
      prompt += `\nHistórico de Saúde: Sem complicações relatadas.`;
    }

    return prompt;
  }

  async generateTextResponse(prompt: string, contexto: ContextoUsuario, historico: MensagemHistorico[] = []): Promise<RespostaIA> {
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
        max_tokens: 600,
        response_format: { type: "json_object" } // Força a saída em JSON nativo
      });

      const rawContent = completion.choices[0]?.message?.content || "{}";
      
      // Parseia o JSON retornado pela IA
      try {
        const parsedData = JSON.parse(rawContent) as RespostaIA;
        return parsedData;
      } catch (parseError) {
        console.error("Falha ao parsear JSON da IA:", rawContent);
        return {
          resposta: "Desculpe, mamãe, tive um probleminha para processar isso. Pode repetir? 💕",
          sentimento: null,
          resumoAlerta: null,
          topicoConsulta: null
        };
      }
    } catch (error) {
      console.error('Erro no Groq:', error);
      throw error;
    }
  }
}