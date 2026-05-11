'use client';

import React from 'react';
import type { DividendPayment } from '../../types/dividends';
import { formatarMoeda, formatarDataBR } from '../../lib/formatters';

interface DividendHistoryProps {
  payments: DividendPayment[];
  className?: string;
}

/**
 * Dividend History — Lista cronológica de dividendos recebidos.
 * 
 * @ref legacy/Appliquei_v13.html — Aba Dividendos
 */
export function DividendHistory({
  payments,
  className = '',
}: DividendHistoryProps) {
  const sorted = [...payments].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());

  if (payments.length === 0) {
    return (
      <div
        className={className}
        style={{
          padding: '30px',
          textAlign: 'center',
          color: 'var(--cor-texto-mutado)',
          fontSize: '13px',
          fontStyle: 'italic',
        }}
      >
        Nenhum provento registrado.
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
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead style={{ background: 'var(--cor-superficie)' }}>
          <tr>
            <th style={thStyle}>Data</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Ticker</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Tipo</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Qtd</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Valor Unit.</th>
            <th style={{ ...thStyle, textAlign: 'right' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, i) => {
            const total = (p.quantidadeNaData || 0) * p.valor;
            return (
              <tr key={i} style={{ borderBottom: '1px solid var(--cor-borda)' }}>
                <td style={tdStyle}>{formatarDataBR(p.data)}</td>
                <td style={{ ...tdStyle, textAlign: 'left', fontWeight: 700 }}>{p.ticker}</td>
                <td style={{ ...tdStyle, textAlign: 'left' }}>
                  <span style={{ 
                    fontSize: '10px', 
                    padding: '2px 6px', 
                    borderRadius: '4px', 
                    background: 'var(--cor-bg-info)', 
                    color: 'var(--cor-info)',
                    fontWeight: 700
                  }}>
                    {p.tipo.toUpperCase()}
                  </span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', fontFamily: "'DM Mono', monospace" }}>{p.quantidadeNaData}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontFamily: "'DM Mono', monospace" }}>{formatarMoeda(p.valor)}</td>
                <td style={{ ...tdStyle, textAlign: 'right', fontFamily: "'DM Mono', monospace", fontWeight: 700, color: 'var(--cor-primaria)' }}>
                  {formatarMoeda(total)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  fontSize: '11px',
  fontWeight: 700,
  color: 'var(--cor-texto-mutado)',
  textTransform: 'uppercase',
};

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  textAlign: 'center',
  color: 'var(--cor-texto-principal)',
};

export default DividendHistory;
