// ============================================================
// store/transactionStore.ts — Zustand store for financial control
// ============================================================

import { create } from 'zustand';
import type { Transaction, CreditCard, CarryForwardMap, TransactionSummary } from '../types/transactions';
import { calcularResumoMes, calcularResultadoMes } from '../lib/calculations/thermometer';
import { obterSaldoCarregadoParaMes, aceitarSaldoMesAnterior, recusarSaldoMesAnterior, desfazerSaldoMesAnterior } from '../lib/calculations/carry-forward';

interface TransactionState {
  // Data
  transacoes: Transaction[];
  cartoes: CreditCard[];
  carryForward: CarryForwardMap;
  
  // Navigation
  visaoMes: number;
  visaoAno: number;
  
  // Actions
  setTransacoes: (txs: Transaction[]) => void;
  addTransacao: (tx: Transaction) => void;
  updateTransacao: (id: string, updates: Partial<Transaction>) => void;
  removeTransacao: (id: string) => void;
  removeTransacoesGrupo: (groupId: string, aPartirDe?: { mes: number; ano: number }) => void;
  
  // Credit cards
  setCartoes: (cards: CreditCard[]) => void;
  addCartao: (card: CreditCard) => void;
  updateCartao: (id: string, updates: Partial<CreditCard>) => void;
  removeCartao: (id: string) => void;
  
  // Navigation
  setVisao: (mes: number, ano: number) => void;
  mudarMes: (delta: -1 | 1) => void;
  irParaHoje: () => void;
  
  // Carry-forward
  aceitarCarry: () => void;
  recusarCarry: () => void;
  desfazerCarry: () => void;
  
  // Computed
  getResumoMes: (mes: number, ano: number) => TransactionSummary;
  getSaldoLivreMes: (mes: number, ano: number) => number;
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transacoes: [],
  cartoes: [],
  carryForward: {},
  visaoMes: new Date().getMonth(),
  visaoAno: new Date().getFullYear(),

  // Actions
  setTransacoes: (txs) => set({ transacoes: txs }),
  
  addTransacao: (tx) => set((state) => ({
    transacoes: [...state.transacoes, tx],
  })),
  
  updateTransacao: (id, updates) => set((state) => ({
    transacoes: state.transacoes.map((t) =>
      t.id === id ? { ...t, ...updates } : t
    ),
  })),
  
  removeTransacao: (id) => set((state) => ({
    transacoes: state.transacoes.filter((t) => t.id !== id),
  })),
  
  removeTransacoesGrupo: (groupId, aPartirDe) => set((state) => ({
    transacoes: state.transacoes.filter((t) => {
      if (t.groupId !== groupId) return true;
      if (!aPartirDe) return false;
      const futuro = t.ano > aPartirDe.ano || (t.ano === aPartirDe.ano && t.mes >= aPartirDe.mes);
      return !(futuro && !t.pago);
    }),
  })),

  // Credit cards
  setCartoes: (cards) => set({ cartoes: cards }),
  
  addCartao: (card) => set((state) => ({
    cartoes: [...state.cartoes, card],
  })),
  
  updateCartao: (id, updates) => set((state) => ({
    cartoes: state.cartoes.map((c) =>
      c.id === id ? { ...c, ...updates } : c
    ),
  })),
  
  removeCartao: (id) => set((state) => ({
    cartoes: state.cartoes.filter((c) => c.id !== id),
  })),

  // Navigation
  setVisao: (mes, ano) => set({ visaoMes: mes, visaoAno: ano }),
  
  mudarMes: (delta) => set((state) => {
    let m = state.visaoMes + delta;
    let a = state.visaoAno;
    if (m < 0) { m = 11; a--; }
    if (m > 11) { m = 0; a++; }
    return { visaoMes: m, visaoAno: a };
  }),
  
  irParaHoje: () => {
    const hoje = new Date();
    set({ visaoMes: hoje.getMonth(), visaoAno: hoje.getFullYear() });
  },

  // Carry-forward
  aceitarCarry: () => set((state) => {
    const mesAnt = state.visaoMes === 0 ? 11 : state.visaoMes - 1;
    const anoAnt = state.visaoMes === 0 ? state.visaoAno - 1 : state.visaoAno;
    const resumoAnt = get().getResumoMes(mesAnt, anoAnt);
    const resultado = calcularResultadoMes(resumoAnt);
    return {
      carryForward: aceitarSaldoMesAnterior(
        state.carryForward,
        state.visaoMes,
        state.visaoAno,
        resultado
      ),
    };
  }),
  
  recusarCarry: () => set((state) => ({
    carryForward: recusarSaldoMesAnterior(
      state.carryForward,
      state.visaoMes,
      state.visaoAno
    ),
  })),
  
  desfazerCarry: () => set((state) => ({
    carryForward: desfazerSaldoMesAnterior(
      state.carryForward,
      state.visaoMes,
      state.visaoAno
    ),
  })),

  // Computed
  getResumoMes: (mes, ano) => {
    return calcularResumoMes(get().transacoes, mes, ano);
  },
  
  getSaldoLivreMes: (mes, ano) => {
    const resumo = get().getResumoMes(mes, ano);
    const resultado = calcularResultadoMes(resumo);
    const carry = obterSaldoCarregadoParaMes(get().carryForward, mes, ano);
    return resultado + carry;
  },
}));
