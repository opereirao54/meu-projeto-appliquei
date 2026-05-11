// ============================================================
// Types — Dividendos & YOC
// ============================================================

export interface DividendPayment {
  data: string;              // YYYY-MM-DD
  valor: number;             // Valor por cota
  tipo?: 'dividendo' | 'jcp' | 'rendimento';
  status?: 'pago' | 'estimado';
}

export interface DividendCache {
  ticker: string;
  pagamentos: DividendPayment[];
  lastUpdated: number;       // timestamp ms
}

export interface DividendAssetRow {
  ticker: string;
  nomeAtivo: string;
  qtdAtual: number;
  encerrada: boolean;
  investido: number;
  recebidoTotal: number;
  recebido12m: number;
  yoc: number;               // (recebidoTotal / investido) × 100
}

export interface DividendMonthlyAggregated {
  ticker: string;
  ano: number;
  mes: number;               // 0-11
  qtdMes: number;
  tsMaisRecente: number;
  somaValorCota: number;
  total: number;
  eventos: number;
}

export interface DividendPrevistoMes {
  ticker: string;
  ts: number;                // timestamp ms
  valor: number;             // valor total estimado
  valorPorAcao: number;
  qtd: number;
}

export interface DividendDashboardKPIs {
  totalRecebido: number;     // Tudo desde 1ª compra
  total12m: number;          // Últimos 12 meses
  mediaMensal: number;       // total12m / min(12, meses_carteira)
  yocCarteira: number;       // (totalRecebido / totalInvestido) × 100
}
