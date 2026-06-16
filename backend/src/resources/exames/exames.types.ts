export interface CreateExameDTO {
  tipo: string;
  dataExame?: string | null;
  resultado?: string | null;
  arquivoUrl?: string | null;
  usuarioId: number;
}

export interface UpdateExameDTO {
  tipo?: string;
  dataExame?: string | null;
  resultado?: string | null;
  arquivoUrl?: string | null;
  usuarioId?: number; 
}

export interface ExameResponse {
  id: number;
  tipo: string;
  dataExame: string | null;
  resultado: string | null;
  arquivoUrl: string | null;
  usuarioId: number;
  
}