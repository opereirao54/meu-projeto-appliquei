// ============================================================
// store/dreamStore.ts — Zustand store for Dream Planner
// ============================================================

import { create } from 'zustand';
import type { Dream, DreamContribution } from '../types/dreams';
import { calcSonhoMensal, statusSonho, mesesEntre } from '../lib/calculations/dreams';

interface DreamState {
  sonhos: Dream[];
  sonhoEditandoId: string | null;

  // Actions
  setSonhos: (sonhos: Dream[]) => void;
  addSonho: (sonho: Dream) => void;
  updateSonho: (id: string, updates: Partial<Dream>) => void;
  removeSonho: (id: string) => void;
  
  // Contributions
  addAporte: (sonhoId: string, aporte: DreamContribution) => void;
  
  // Edit state
  setEditando: (id: string | null) => void;
  
  // Computed
  getSonhosAtivos: () => Dream[];
  getSonhosConquistados: () => Dream[];
  getTotalMensalNecessario: () => number;
  getProgressoGeral: () => number;

  // Sync meses restantes
  atualizarMesesRestantes: () => void;
}

export const useDreamStore = create<DreamState>((set, get) => ({
  sonhos: [],
  sonhoEditandoId: null,

  setSonhos: (sonhos) => set({ sonhos }),
  
  addSonho: (sonho) => set((state) => ({
    sonhos: [...state.sonhos, sonho],
  })),
  
  updateSonho: (id, updates) => set((state) => ({
    sonhos: state.sonhos.map((s) =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    ),
  })),
  
  removeSonho: (id) => set((state) => ({
    sonhos: state.sonhos.filter((s) => s.id !== id),
  })),

  addAporte: (sonhoId, aporte) => set((state) => ({
    sonhos: state.sonhos.map((s) => {
      if (s.id !== sonhoId) return s;
      const novosAportes = [...(s.aportes || []), aporte];
      const novoValorAtual = (s.valorAtual || 0) + aporte.valor;
      return {
        ...s,
        aportes: novosAportes,
        valorAtual: novoValorAtual,
        updatedAt: new Date().toISOString(),
      };
    }),
  })),

  setEditando: (id) => set({ sonhoEditandoId: id }),

  getSonhosAtivos: () => {
    return get().sonhos.filter((s) => statusSonho(s) === 'ativo');
  },

  getSonhosConquistados: () => {
    return get().sonhos.filter((s) => statusSonho(s) === 'conquistado');
  },

  getTotalMensalNecessario: () => {
    const { sonhos } = get();
    return sonhos.reduce((acc, s) => {
      if (s.valorAtual >= s.valorTotal || (s.mesesRestantes || 0) <= 0) return acc;
      return acc + calcSonhoMensal(s.valorTotal, s.valorAtual, s.mesesRestantes || s.prazoMeses);
    }, 0);
  },

  getProgressoGeral: () => {
    const { sonhos } = get();
    if (sonhos.length === 0) return 0;
    const totalMeta = sonhos.reduce((acc, s) => acc + s.valorTotal, 0);
    const totalAtual = sonhos.reduce((acc, s) => acc + Math.min(s.valorAtual, s.valorTotal), 0);
    return totalMeta > 0 ? (totalAtual / totalMeta) * 100 : 0;
  },

  /**
   * Atualiza mesesRestantes de todos os sonhos baseado na data atual.
   * @ref legacy/Appliquei_v13.html:9107-9115
   */
  atualizarMesesRestantes: () => set((state) => {
    const agora = new Date();
    return {
      sonhos: state.sonhos.map((s) => {
        const created = new Date(s.createdAt);
        const dataFim = new Date(created);
        dataFim.setMonth(dataFim.getMonth() + s.prazoMeses);
        
        const calendarRestantes = Math.max(0, mesesEntre(agora, dataFim));
        return {
          ...s,
          mesesRestantes: Math.max(0, calendarRestantes),
        };
      }),
    };
  }),
}));
