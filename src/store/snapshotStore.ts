// ============================================================
// store/snapshotStore.ts — Zustand store for portfolio snapshots
// ============================================================

import { create } from 'zustand';
import type { Snapshot, EvolutionPeriod } from '../types/snapshots';

interface SnapshotState {
  snapshots: Snapshot[];
  periodoEvolucao: EvolutionPeriod;
  filtroTipo: string;
  filtroAtivo: string;

  // Actions
  setSnapshots: (snapshots: Snapshot[]) => void;
  addSnapshot: (snapshot: Snapshot) => void;
  setPeriodo: (periodo: EvolutionPeriod) => void;
  setFiltroTipo: (tipo: string) => void;
  setFiltroAtivo: (ativo: string) => void;
  
  // Computed
  getUltimoSnapshot: () => Snapshot | null;
  getVariacaoMensal: () => { valor: number; percentual: number };
}

export const useSnapshotStore = create<SnapshotState>((set, get) => ({
  snapshots: [],
  periodoEvolucao: 12,
  filtroTipo: 'todos',
  filtroAtivo: '',

  setSnapshots: (snapshots) => set({ snapshots }),
  
  addSnapshot: (snapshot) => set((state) => ({
    snapshots: [...state.snapshots, snapshot],
  })),
  
  setPeriodo: (periodo) => set({ periodoEvolucao: periodo }),
  setFiltroTipo: (tipo) => set({ filtroTipo: tipo }),
  setFiltroAtivo: (ativo) => set({ filtroAtivo: ativo }),

  getUltimoSnapshot: () => {
    const { snapshots } = get();
    if (snapshots.length === 0) return null;
    return snapshots.reduce((latest, s) =>
      s.month > latest.month ? s : latest
    );
  },

  getVariacaoMensal: () => {
    const { snapshots } = get();
    if (snapshots.length < 2) return { valor: 0, percentual: 0 };
    
    const sorted = [...snapshots].sort((a, b) => b.month.localeCompare(a.month));
    const atual = sorted[0];
    const anterior = sorted[1];
    
    const valor = atual.totalPatrimony - anterior.totalPatrimony;
    const percentual = anterior.totalPatrimony > 0
      ? ((valor / anterior.totalPatrimony) * 100)
      : 0;
    
    return { valor, percentual };
  },
}));
