import React, { useState } from 'react';
import { 
  TrendUp, 
  TrendDown, 
  Plus, 
  PencilSimple, 
  Trash, 
  CaretDown, 
  CaretUp,
  MagnifyingGlass
} from '@phosphor-icons/react';
import { useCarteiraStore } from '../../store/carteiraStore';
import { formatarMoeda, formatarPercentual, isPositivo, isNegativo } from '../../lib/utils/math';
import type { AtivoCarteira } from '../../types';

interface PortfolioTableProps {
  onEditarOperacao?: (operacao: any) => void;
  onNovaOperacao?: () => void;
}

export function PortfolioTable({ 
  onEditarOperacao, 
  onNovaOperacao 
}: PortfolioTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [filtro, setFiltro] = useState('');
  
  const ativos = useCarteiraStore((state) => state.ativos);
  const hideValues = useCarteiraStore((state) => state.hideValues);
  const totalInvestido = useCarteiraStore((state) => state.totalInvestido);
  const patrimonioTotal = useCarteiraStore((state) => state.patrimonioTotal);
  const totalGainLoss = useCarteiraStore((state) => state.totalGainLoss);
  const totalGainLossPercent = useCarteiraStore((state) => state.totalGainLossPercent);

  // Filtrar ativos
  const ativosFiltrados = ativos.filter(ativo => 
    ativo.ticker.toLowerCase().includes(filtro.toLowerCase()) ||
    ativo.nomeAtivo?.toLowerCase().includes(filtro.toLowerCase())
  );

  const toggleExpand = (ticker: string) => {
    setExpandedRow(expandedRow === ticker ? null : ticker);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden">
      {/* Header da Tabela */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-syne font-bold text-gray-900 dark:text-white">
              Meus Ativos
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {ativos.length} {ativos.length === 1 ? 'ativo' : 'ativos'} na carteira
            </p>
          </div>

          {/* Barra de Pesquisa e Botão Nova Operação */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <MagnifyingGlass 
                size={18} 
                weight="bold" 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
              <input
                type="text"
                placeholder="Buscar ativo..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="pl-10 pr-4 py-2 w-48 md:w-64 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              onClick={onNovaOperacao}
              className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus size={20} weight="bold" className="mr-2" />
              Nova Operação
            </button>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50">
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ativo
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Quantidade
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Preço Médio
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Preço Atual
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Investido
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Atual
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Gain/Loss
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                % Carteira
              </th>
              <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {ativosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                      <TrendUp size={32} weight="bold" className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                      {filtro ? 'Nenhum ativo encontrado' : 'Nenhum ativo na carteira'}
                    </p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      {filtro ? 'Tente buscar por outro termo' : 'Adicione sua primeira operação para começar'}
                    </p>
                    {!filtro && (
                      <button
                        onClick={onNovaOperacao}
                        className="mt-4 flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        <Plus size={20} weight="bold" className="mr-2" />
                        Adicionar Operação
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              ativosFiltrados.map((ativo) => {
                const gainLossPercent = ativo.gainLossPercent || 0;
                const gainLoss = ativo.gainLoss || 0;
                const isPositive = gainLoss >= 0;

                return (
                  <React.Fragment key={ativo.ticker}>
                    {/* Linha Principal */}
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleExpand(ativo.ticker)}
                            className="mr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            {expandedRow === ativo.ticker ? (
                              <CaretUp size={20} weight="bold" />
                            ) : (
                              <CaretDown size={20} weight="bold" />
                            )}
                          </button>
                          <div>
                            <p className="font-bold text-gray-900 dark:text-white">
                              {ativo.ticker}
                            </p>
                            {ativo.nomeAtivo && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {ativo.nomeAtivo}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className={`font-mono ${hideValues ? 'blur-sm select-none' : ''}`}>
                          {hideValues ? '••••' : ativo.quantidade.toLocaleString('pt-BR')}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className={`font-mono ${hideValues ? 'blur-sm select-none' : ''}`}>
                          {hideValues ? '••••' : formatarMoeda(ativo.precoMedio)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className={`font-mono ${hideValues ? 'blur-sm select-none' : ''}`}>
                          {hideValues ? '••••' : formatarMoeda(ativo.precoAtual || 0)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className={`font-mono ${hideValues ? 'blur-sm select-none' : ''}`}>
                          {hideValues ? '••••' : formatarMoeda(ativo.totalInvestido)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className={`font-mono font-semibold ${hideValues ? 'blur-sm select-none' : ''}`}>
                          {hideValues ? '••••' : formatarMoeda(ativo.valorAtual)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`font-mono font-semibold ${
                            isPositive 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : 'text-red-600 dark:text-red-400'
                          } ${hideValues ? 'blur-sm select-none' : ''}`}>
                            {hideValues ? '••••' : formatarMoeda(gainLoss)}
                          </span>
                          <span className={`text-xs font-mono ${
                            isPositive 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : 'text-red-600 dark:text-red-400'
                          } ${hideValues ? 'blur-sm select-none' : ''}`}>
                            {hideValues ? '•••%' : formatarPercentual(gainLossPercent)}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <span className={`font-mono ${hideValues ? 'blur-sm select-none' : ''}`}>
                          {hideValues ? '•••%' : formatarPercentual(ativo.percentualCarteira)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => onEditarOperacao?.(ativo)}
                          className="p-2 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                          title="Editar operações"
                        >
                          <PencilSimple size={20} weight="bold" />
                        </button>
                      </td>
                    </tr>

                    {/* Linha Expandida com Detalhes */}
                    {expandedRow === ativo.ticker && (
                      <tr className="bg-gray-50/50 dark:bg-gray-800/30">
                        <td colSpan={9} className="px-6 py-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Total Investido
                              </p>
                              <p className={`font-mono font-semibold ${hideValues ? 'blur-sm select-none' : ''}`}>
                                {hideValues ? '••••' : formatarMoeda(ativo.totalInvestido)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Valor Atual
                              </p>
                              <p className={`font-mono font-semibold ${hideValues ? 'blur-sm select-none' : ''}`}>
                                {hideValues ? '••••' : formatarMoeda(ativo.valorAtual)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Gain/Loss Total
                              </p>
                              <p className={`font-mono font-semibold ${
                                isPositive 
                                  ? 'text-emerald-600 dark:text-emerald-400' 
                                  : 'text-red-600 dark:text-red-400'
                              } ${hideValues ? 'blur-sm select-none' : ''}`}>
                                {hideValues ? '••••' : formatarMoeda(gainLoss)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                Rentabilidade
                              </p>
                              <p className={`font-mono font-semibold ${
                                isPositive 
                                  ? 'text-emerald-600 dark:text-emerald-400' 
                                  : 'text-red-600 dark:text-red-400'
                              } ${hideValues ? 'blur-sm select-none' : ''}`}>
                                {hideValues ? '•••%' : formatarPercentual(gainLossPercent)}
                              </p>
                            </div>
                          </div>

                          {/* Operações deste ativo */}
                          {ativo.operacoes && ativo.operacoes.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                                Operações ({ativo.operacoes.length})
                              </p>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {ativo.operacoes.map((op, idx) => (
                                  <div 
                                    key={idx}
                                    className="flex items-center justify-between p-2 bg-white dark:bg-gray-900 rounded-lg"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className={`px-2 py-1 text-xs font-semibold rounded ${
                                        op.tipo === 'Compra' 
                                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                      }`}>
                                        {op.tipo}
                                      </span>
                                      <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {new Date(op.dataOperacao).toLocaleDateString('pt-BR')}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-mono text-gray-900 dark:text-white">
                                        {op.quantidade} x {hideValues ? '••••' : formatarMoeda(op.precoUnitario)}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Total: {hideValues ? '••••' : formatarMoeda(op.quantidade * op.precoUnitario)}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer com Totais */}
      {ativos.length > 0 && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-800">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Investido</p>
              <p className={`text-xl font-bold font-mono ${hideValues ? 'blur-sm select-none' : ''}`}>
                {hideValues ? '••••••' : formatarMoeda(totalInvestido)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Patrimônio Total</p>
              <p className={`text-xl font-bold font-mono ${hideValues ? 'blur-sm select-none' : ''}`}>
                {hideValues ? '••••••' : formatarMoeda(patrimonioTotal)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Gain/Loss Total</p>
              <div className="flex flex-col items-end">
                <p className={`text-xl font-bold font-mono ${
                  totalGainLoss >= 0 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-red-600 dark:text-red-400'
                } ${hideValues ? 'blur-sm select-none' : ''}`}>
                  {hideValues ? '••••••' : formatarMoeda(totalGainLoss)}
                </p>
                <p className={`text-sm font-mono ${
                  totalGainLoss >= 0 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : 'text-red-600 dark:text-red-400'
                } ${hideValues ? 'blur-sm select-none' : ''}`}>
                  {hideValues ? '•••%' : formatarPercentual(totalGainLossPercent)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
