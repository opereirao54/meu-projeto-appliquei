// ============================================================
// Types — Snapshots Patrimoniais (Firestore: snapshots/{id})
// Ref: docs/02_MODELO_DADOS_FIRESTORE.md §2.9
// ============================================================

export interface Snapshot {
  id: string;
  userId: string;
  month: string;             // YYYY-MM
  totalPatrimony: number;
  totalInvested: number;
  totalGains: number;
  categoryBreakdown: {
    rendaVariavel: number;
    rendaFixa: number;
    previdencia: number;
    reserva: number;
  };
  createdAt?: string;
}

export interface EvolutionDataPoint {
  date: Date;
  label: string;             // "jan/25", "fev/25"
  investido: number;         // Capital aplicado
  mercado: number;           // Valor de mercado
  dividendos: number;        // Dividendos no mês
  ganhoCapital: number;      // mercado - investido (quando >0)
  perdaCapital: number;      // mercado - investido (quando <0)
}

export interface DistributionSlice {
  category: string;
  label: string;
  value: number;
  percentage: number;
  color: string;
}

export type EvolutionPeriod = 1 | 3 | 6 | 12 | 0; // 0 = Tudo
