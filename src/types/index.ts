export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export type TipoOperacao = 'Compra' | 'Venda';
export type TipoAtivo = 'acao' | 'fii' | 'tesouro' | 'cri' | 'cra' | 'cdb' | 'lci' | 'lca' | 'cripto' | 'outro';

export interface Operacao {
  id?: string;
  userId: string;
  ticker: string;
  nomeAtivo?: string;
  tipo: TipoOperacao;
  quantidade: number;
  precoUnitario: number;
  dataOperacao: number; // timestamp
  corretora?: string;
  observacoes?: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface AtivoCarteira {
  ticker: string;
  nomeAtivo?: string;
  quantidade: number;
  precoMedio: number;
  precoAtual?: number;
  totalInvestido: number;
  valorAtual: number;
  gainLoss: number;
  gainLossPercent: number;
  percentualCarteira: number;
  operacoes?: Operacao[];
}

export interface CarteiraState {
  ativos: AtivoCarteira[];
  operacoes: Operacao[];
  totalInvestido: number;
  patrimonioTotal: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  sidebarCollapsed: boolean;
  hideValues: boolean;
  loading: boolean;
  error: string | null;
}
