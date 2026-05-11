// ============================================================
// Types — Dream Planner (Planejador de Sonhos)
// ============================================================

export type DreamPriority = 'essential' | 'important' | 'nice_to_have';
export type DreamStatus = 'active' | 'paused' | 'completed' | 'cancelled';
export type DreamCategory = 'viagem' | 'educacao' | 'moradia' | 'veiculo' | 'reserva' | 'objetivo' | 'outro';

export interface DreamContribution {
  id: string;
  valor: number;
  data: string;              // YYYY-MM-DD
  tipo: 'manual' | 'mensal_pago' | 'migrado';
  origem?: 'livre' | 'compromisso' | 'saldo_ativo';
  ativoOrigem?: string;      // Ticker se vier de venda
  txId?: string;             // ID da transação vinculada
}

export interface Dream {
  id: string;
  titulo: string;
  descricao?: string;
  emoji?: string;            // ex: "🏠", "✈️", "🎓"
  valorTotal: number;
  valorAtual: number;
  prazoMeses: number;
  mesesRestantes?: number;
  prioridade: DreamPriority;
  categoria: DreamCategory;
  status: DreamStatus;
  aporteMensalPlano?: number;
  planoVinculado?: boolean;  // Se tem lançamentos no controle financeiro
  aportes: DreamContribution[];
  imagem?: string;           // URL da imagem
  cor?: string;              // Cor do card (#hex)
  createdAt: string;
  updatedAt?: string;
}

export interface DreamProgress {
  dreamId: string;
  percentual: number;        // (valorAtual / valorTotal) × 100
  mesesDecorridos: number;
  mesesRestantes: number;
  noTrack: boolean;          // Está atrasado vs. ritmo esperado
  pmtNecessario: number;     // Valor mensal necessário para atingir no prazo
  tempoEstimado: number;     // Meses ao ritmo atual
}

export interface FinancialHealthScore {
  score: number;             // 0 a 100
  breakdown: {
    termometro60: number;    // 0-20 (gastos dentro do limite)
    investimentos: number;   // 0-20 (tem aportes regulares)
    sonhos: number;          // 0-20 (sonhos em dia)
    reserva: number;         // 0-20 (reserva emergência ok)
    diversificacao: number;  // 0-20 (carteira diversificada)
  };
  nivel: 'critico' | 'atencao' | 'bom' | 'excelente';
  mensagem: string;
}
