// ============================================================
// Types — Controle Financeiro (Firestore: users/{uid}/transactions)
// Ref: docs/02_MODELO_DADOS_FIRESTORE.md §3.2
// ============================================================

export type TransactionTipo =
  | 'receita'
  | 'resgate_investimento'
  | 'despesa_fixa'
  | 'despesa_variavel'
  | 'cartao_credito'
  | 'investimento_fixo'
  | 'investimento_variavel'
  | 'sonho';

export type TransactionStatus = 'pendente' | 'pago';

export interface Transaction {
  id: string;
  tipo: TransactionTipo;
  descricao: string;
  valor: number;             // sempre positivo
  dataVencimento: string;    // ISO date string (YYYY-MM-DD)
  dataPagamento?: string;
  status: TransactionStatus;
  categoria: string;
  cartaoId?: string;
  parcelas?: number;
  parcelaAtual?: number;
  isRecorrente?: boolean;
  recorrenciaFim?: string;
  isAportePrevidencia?: boolean;
  originDreamId?: string;
  observacao?: string;
  bancoInstituicao?: string;
  groupId?: string;          // Grupo de transações recorrentes/parceladas
  compromissoId?: string;    // ID da operação de previdência vinculada
  cartaoFixoMensal?: boolean;
  sonhoId?: string;          // ID do sonho vinculado
  mes: number;               // 0-11
  ano: number;
  pago: boolean;
  gerado?: boolean;          // Gerado automaticamente
  createdAt?: string;
  updatedAt?: string;
}

export interface CreditCard {
  id: string;
  nome: string;
  limite: number;
  diaFechamento: number;     // 1-31
  diaVencimento: number;     // 1-31
  arquivado: boolean;
  bandeira?: string;
  cor?: string;              // hex (#RRGGBB)
  createdAt?: string;
}

export interface TransactionSummary {
  receita: number;
  resgate: number;
  despFixa: number;
  despVar: number;
  cartao: number;
  invFixo: number;
  invVar: number;
  sonho: number;
}

export interface CarryForwardEntry {
  valor: number;
  origemAno: number | null;
  origemMes: number | null;
  recusado?: boolean;
}

export type CarryForwardMap = Record<string, CarryForwardEntry>;
