export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

export interface Operacao {
  id?: string;
  userId: string;
  ticker: string;
  tipo: 'compra' | 'venda' | 'dividendo';
  quantidade: number;
  preco: number;
  data: string; // ISO date
  categoria?: string;
  subcategoria?: string;
  corretora?: string;
  observacoes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AtivoCarteira {
  ticker: string;
  nome?: string;
  qtdTotal: number;
  valorTotalInvestido: number;
  precoMedio: number;
  categoria?: string;
  subcategoria?: string;
  corretora?: string;
  vencimento?: string;
  rentabilidade?: number;
}

export interface CarteiraState {
  ativos: Record<string, AtivoCarteira>;
  operacoes: Operacao[];
  totalInvestido: number;
  patrimonio: number;
}
