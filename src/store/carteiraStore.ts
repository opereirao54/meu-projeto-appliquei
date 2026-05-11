import { create } from 'zustand';
import type { AtivoCarteira, Operacao, CarteiraState as CarteiraStateType } from '../types';

interface CarteiraState extends CarteiraStateType {
  addOperacao: (operacao: Operacao) => void;
  removeOperacao: (id: string) => void;
  updateOperacao: (id: string, updates: Partial<Operacao>) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  setHideValues: (hidden: boolean) => void;
  toggleHideValues: () => void;
  loadOperacoes: (operacoes: Operacao[]) => void;
  recalculateCarteira: () => void;
}

const initialState: Omit<CarteiraState, 'addOperacao' | 'removeOperacao' | 'updateOperacao' | 'setSidebarCollapsed' | 'toggleSidebar' | 'setHideValues' | 'toggleHideValues' | 'loadOperacoes' | 'recalculateCarteira'> = {
  ativos: [],
  operacoes: [],
  totalInvestido: 0,
  patrimonioTotal: 0,
  totalGainLoss: 0,
  totalGainLossPercent: 0,
  sidebarCollapsed: false,
  hideValues: false,
  loading: false,
  error: null,
};

export const useCarteiraStore = create<CarteiraState>((set, get) => ({
  ...initialState,

  addOperacao: (novaOperacao) => {
    const operacoes = [...get().operacoes, novaOperacao];
    set({ operacoes });
    get().recalculateCarteira();
  },

  removeOperacao: (id: string) => {
    const operacoes = get().operacoes.filter(op => op.id !== id);
    set({ operacoes });
    get().recalculateCarteira();
  },

  updateOperacao: (id: string, updates: Partial<Operacao>) => {
    const operacoes = get().operacoes.map(op =>
      op.id === id ? { ...op, ...updates } : op
    );
    set({ operacoes });
    get().recalculateCarteira();
  },

  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed });
    try {
      localStorage.setItem('appliquei_sidebar_collapsed', collapsed ? '1' : '0');
    } catch (_) {}
  },

  toggleSidebar: () => {
    const collapsed = !get().sidebarCollapsed;
    get().setSidebarCollapsed(collapsed);
  },

  setHideValues: (hidden) => {
    set({ hideValues: hidden });
    try {
      localStorage.setItem('appliquei_hide_values', hidden ? '1' : '0');
    } catch (_) {}
  },

  toggleHideValues: () => {
    const hidden = !get().hideValues;
    get().setHideValues(hidden);
  },

  loadOperacoes: (operacoes) => {
    set({ operacoes });
    get().recalculateCarteira();
  },

  recalculateCarteira: () => {
    const operacoes = get().operacoes;
    const ativosMap: Record<string, {
      ticker: string;
      nomeAtivo?: string;
      quantidade: number;
      precoMedio: number;
      totalInvestido: number;
      operacoes: Operacao[];
    }> = {};

    for (const op of operacoes) {
      const ticker = op.ticker;

      if (!ativosMap[ticker]) {
        ativosMap[ticker] = {
          ticker,
          nomeAtivo: op.nomeAtivo,
          quantidade: 0,
          precoMedio: 0,
          totalInvestido: 0,
          operacoes: [],
        };
      }

      const ativo = ativosMap[ticker];
      ativo.operacoes.push(op);

      if (op.tipo === 'Compra') {
        ativo.quantidade += op.quantidade;
        ativo.totalInvestido += op.quantidade * op.precoUnitario;
        ativo.precoMedio = ativo.quantidade > 0
          ? ativo.totalInvestido / ativo.quantidade
          : 0;
      } else if (op.tipo === 'Venda') {
        ativo.quantidade -= op.quantidade;
        ativo.totalInvestido -= op.quantidade * ativo.precoMedio;

        if (ativo.quantidade < 0) ativo.quantidade = 0;
        if (ativo.totalInvestido < 0) ativo.totalInvestido = 0;

        ativo.precoMedio = ativo.quantidade > 0
          ? ativo.totalInvestido / ativo.quantidade
          : 0;
      }

      if (op.nomeAtivo && !ativo.nomeAtivo) {
        ativo.nomeAtivo = op.nomeAtivo;
      }
    }

    const ativos: AtivoCarteira[] = Object.values(ativosMap).map(ativo => ({
      ticker: ativo.ticker,
      nomeAtivo: ativo.nomeAtivo || ativo.ticker,
      quantidade: ativo.quantidade,
      precoMedio: ativo.precoMedio,
      precoAtual: 0,
      totalInvestido: ativo.totalInvestido,
      valorAtual: ativo.quantidade * ativo.precoMedio,
      gainLoss: 0,
      gainLossPercent: 0,
      percentualCarteira: 0,
      operacoes: ativo.operacoes.sort((a, b) => b.dataOperacao - a.dataOperacao),
    }));

    const totalInvestido = ativos.reduce((sum, ativo) => sum + ativo.totalInvestido, 0);
    const patrimonioTotal = ativos.reduce((sum, ativo) => sum + ativo.valorAtual, 0);
    const totalGainLoss = patrimonioTotal - totalInvestido;
    const totalGainLossPercent = totalInvestido > 0 
      ? (totalGainLoss / totalInvestido) * 100 
      : 0;

    ativos.forEach(ativo => {
      ativo.percentualCarteira = patrimonioTotal > 0
        ? (ativo.valorAtual / patrimonioTotal) * 100
        : 0;
    });

    set({
      ativos,
      totalInvestido,
      patrimonioTotal,
      totalGainLoss,
      totalGainLossPercent,
    });
  },
}));

if (typeof window !== 'undefined') {
  try {
    const savedCollapsed = localStorage.getItem('appliquei_sidebar_collapsed');
    const savedHideValues = localStorage.getItem('appliquei_hide_values');
    
    if (savedCollapsed !== null) {
      useCarteiraStore.getState().setSidebarCollapsed(savedCollapsed === '1');
    }
    if (savedHideValues !== null) {
      useCarteiraStore.getState().setHideValues(savedHideValues === '1');
    }
  } catch (_) {}
}
