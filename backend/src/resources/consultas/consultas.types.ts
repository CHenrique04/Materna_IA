export interface CreateConsultaDTO {
  dataHora: string;
  local: string;
  status?: string;
  usuarioId: number;
}

export interface UpdateConsultaDTO {
  dataHora?: string;
  local?: string;
  status?: string;
  usuarioId?: number;
}

export interface ConsultaResponse {
  id: number;
  dataHora: string;
  local: string;
  status: string;
  usuarioId: number;
}