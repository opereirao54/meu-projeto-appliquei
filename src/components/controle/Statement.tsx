'use client';

import React, { useMemo } from 'react';
import type { Transaction } from '../../types/transactions';
import { formatarMoeda } from '../../lib/formatters';
import { CATEGORIAS_NOMES } from '../../lib/constants';

interface StatementProps {
  transactions: Transaction[];
  onEdit?: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
  onTogglePago?: (tx: Transaction) => void;
  className?: string;
}

/**
 * Statement (Extrato) — Lista de lançamentos do mês.
 * 
 * Reproduz o visual do legacy:
 *   - Agrupamento por categoria
 *   - Status pago/pendente com ícone
 *   - Cores: Receita (Verde), Despesa (Vermelho), Investimento (Azul)
 * 
 * @ref legacy/Appliquei_v13.html:7634-7750
 */
export function Statement({
  transactions,
  onEdit,
  onDelete,
  onTogglePago,
  className = '',
}: StatementProps) {
  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      // Sort by day desc, then by value desc
      if (a.dia !== b.dia) return b.dia - a.dia;
      return b.valor - a.valor;
    });
  }, [transactions]);

  if (transactions.length === 0) {
    return (
      <div
        className={className}
        style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: 'var(--cor-texto-mutado)',
          fontSize: '14px',
          fontStyle: 'italic',
          background: 'var(--cor-branco)',
          borderRadius: '14px',
          border: '1px solid var(--cor-borda)',
        }}
      >
        Nenhum lançamento encontrado para este mês.
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        background: 'var(--cor-branco)',
        borderRadius: '14px',
        border: '1px solid var(--cor-borda)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--cor-borda)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h3
          style={{
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--cor-texto-principal)',
            margin: 0,
          }}
        >
          Extrato Detalhado
        </h3>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--cor-texto-mutado)',
            background: 'var(--cor-superficie)',
            padding: '2px 8px',
            borderRadius: '99px',
          }}
        >
          {transactions.length} itens
        </span>
      </div>

      <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '13px',
            fontFamily: "'Figtree', sans-serif",
          }}
        >
          <thead
            style={{
              position: 'sticky',
              top: 0,
              background: 'var(--cor-superficie)',
              zIndex: 2,
            }}
          >
            <tr>
              <th style={thStyle}>Data</th>
              <th style={{ ...thStyle, textAlign: 'left' }}>Descrição</th>
              <th style={{ ...thStyle, textAlign: 'left' }}>Categoria</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Valor</th>
              <th style={{ ...thStyle, width: '40px' }}></th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions.map((tx) => (
              <tr
                key={tx.id}
                onClick={() => onEdit?.(tx)}
                style={{
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--cor-borda)',
                  transition: 'background 0.15s',
                  opacity: tx.pago ? 1 : 0.75,
                }}
                className="row-hover"
              >
                <td
                  style={{
                    padding: '12px 16px',
                    textAlign: 'center',
                    fontFamily: "'DM Mono', monospace",
                    color: 'var(--cor-texto-mutado)',
                    fontWeight: 600,
                  }}
                >
                  {String(tx.dia).padStart(2, '0')}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePago?.(tx);
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: tx.pago ? 'var(--cor-primaria)' : 'var(--cor-texto-mutado)',
                      }}
                      title={tx.pago ? 'Pago' : 'Pendente'}
                    >
                      {tx.pago ? '✅' : '⭕'}
                    </button>
                    <span
                      style={{
                        fontWeight: 600,
                        color: 'var(--cor-texto-principal)',
                        textDecoration: tx.pago ? 'none' : 'italic',
                      }}
                    >
                      {tx.descricao}
                    </span>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--cor-texto-mutado)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.4px',
                    }}
                  >
                    {CATEGORIAS_NOMES[tx.categoria] || tx.categoria}
                  </span>
                </td>
                <td
                  style={{
                    padding: '12px 16px',
                    textAlign: 'right',
                    fontFamily: "'DM Mono', monospace",
                    fontWeight: 700,
                    color: getValorColor(tx),
                  }}
                >
                  {tx.tipo === 'saida' && tx.valor > 0 ? '-' : ''}
                  {formatarMoeda(tx.valor)}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete?.(tx.id);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--cor-erro)',
                      opacity: 0.5,
                      fontSize: '14px',
                    }}
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  fontSize: '11px',
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  color: 'var(--cor-texto-mutado)',
  borderBottom: '1px solid var(--cor-borda)',
};

function getValorColor(tx: Transaction): string {
  if (tx.categoria === 'receita' || tx.categoria === 'resgate') return 'var(--cor-primaria)';
  if (tx.categoria === 'inv_fixa' || tx.categoria === 'inv_variavel' || tx.categoria === 'sonho') return 'var(--cor-info)';
  return 'var(--cor-erro)';
}

export default Statement;
