import { create } from 'zustand';
import { AtivoCarteira, Operacao } from '../types';
import { atualizarCarteiraFIFO, parseBRL } from '../lib/utils/math';

interface CarteiraState {
  ativos: Record<string, AtivoCarteira>;
  operacoes: Operacao[];
  sidebarCollapsed: boolean;
  valoresOcultos: boolean;
  
  // Actions
  addOperacao: (operacao: Omit<Operacao, 'id' | 'userId'>) => void;
  removeOperacao: (id: string) => void;
  updateOperacao: (id: string, updates: Partial<Operacao>) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setValoresOcultos: (oculto: boolean) => void;
  loadCarteira: (operacoes: Operacao[]) => void;
}

export const useCarteiraStore = create<CarteiraState>((set, get) => ({
  ativos: {},
  operacoes: [],
  sidebarCollapsed: false,
  valoresOcultos: false,
  
  addOperacao: (novaOperacao) => {
    const operacoes = get().operacoes;
    const ticker = novaOperacao.ticker;
    
    // Adiciona operação à lista
    const operacaoComId = {
      ...novaOperacao,
      id: `op_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    const novasOperacoes = [...operacoes, operacaoComId];
    
    // Recalcula carteira usando FIFO
    const novosAtivos = recalcularCarteiraFIFO(novasOperacoes);
    
    set({ 
      operacoes: novasOperacoes,
      ativos: novosAtivos,
    });
  },
  
  removeOperacao: (id: string) => {
    const operacoes = get().operacoes.filter(op => op.id !== id);
    const novosAtivos = recalcularCarteiraFIFO(operacoes);
    
    set({
      operacoes,
      ativos: novosAtivos,
    });
  },
  
  updateOperacao: (id: string, updates: Partial<Operacao>) => {
    const operacoes = get().operacoes.map(op => 
      op.id === id ? { ...op, ...updates } : op
    );
    const novosAtivos = recalcularCarteiraFIFO(operacoes);
    
    set({
      operacoes,
      ativos: novosAtivos,
    });
  },
  
  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed });
    try {
      localStorage.setItem('appliquei_sidebar_collapsed', collapsed ? '1' : '0');
    } catch (_) {}
  },
  
  setValoresOcultos: (oculto) => {
    set({ valoresOcultos: oculto });
    try {
      localStorage.setItem('appliquei_valores_ocultos', oculto ? '1' : '0');
    } catch (_) {}
  },
  
  loadCarteira: (operacoes) => {
    const ativos = recalcularCarteiraFIFO(operacoes);
    set({ operacoes, ativos });
  },
}));

/**
 * Recalcula toda a carteira usando método FIFO
 * Baseado na lógica do código legado
 */
function recalcularCarteiraFIFO(operacoes: Operacao[]): Record<string, AtivoCarteira> {
  const consolidado: Record<string, AtivoCarteira> = {};
  
  for (const op of operacoes) {
    const ticker = op.ticker;
    
    if (!consolidado[ticker]) {
      consolidado[ticker] = {
        ticker,
        qtdTotal: 0,
        valorTotalInvestido: 0,
        precoMedio: 0,
        categoria: op.categoria,
        subcategoria: op.subcategoria,
        corretora: op.corretora,
      };
    }
    
    const ativo = consolidado[ticker];
    const precoDaOp = parseBRL(op.preco);
    
    if (op.tipo === 'compra') {
      ativo.qtdTotal += op.quantidade;
      ativo.valorTotalInvestido += op.quantidade * precoDaOp;
      ativo.precoMedio = ativo.qtdTotal > 0 
        ? ativo.valorTotalInvestido / ativo.qtdTotal 
        : 0;
    } else if (op.tipo === 'venda') {
      ativo.qtdTotal -= op.quantidade;
      ativo.valorTotalInvestido -= op.quantidade * ativo.precoMedio;
      
      // Garante que não fique negativo
      if (ativo.qtdTotal < 0) ativo.qtdTotal = 0;
      if (ativo.valorTotalInvestido < 0) ativo.valorTotalInvestido = 0;
      
      ativo.precoMedio = ativo.qtdTotal > 0 
        ? ativo.valorTotalInvestido / ativo.qtdTotal 
        : 0;
    }
    
    // Atualiza metadata se disponível
    if (op.categoria) ativo.categoria = op.categoria;
    if (op.subcategoria) ativo.subcategoria = op.subcategoria;
    if (op.corretora) ativo.corretora = op.corretora;
  }
  
  return consolidado;
}
