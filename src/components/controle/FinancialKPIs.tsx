'use client';

import React from 'react';
import { formatarMoeda } from '../../lib/formatters';

interface FinancialKPIsProps {
  receita: number;
  despesa: number;
  cartao: number;
  investimento: number;
  saldoLivre: number;
  saldoCarregado: number;
  className?: string;
}

/**
 * KPI Cards — Hero saldo + grid 2×2 do controle financeiro.
 * 
 * Reproduz os cards KPI do legacy:
 *   kpiReceitaMes, kpiDespesasMes, kpiCartaoMes, kpiInvestimentosMes, kpiSaldoLivre
 * 
 * @ref legacy/Appliquei_v13.html:7811-7835
 */
export function FinancialKPIs({
  receita,
  despesa,
  cartao,
  investimento,
  saldoLivre,
  saldoCarregado,
  className = '',
}: FinancialKPIsProps) {
  const saldoCor = saldoLivre >= 0 ? 'var(--cor-primaria, #059669)' : 'var(--cor-erro, #dc2626)';

  return (
    <div className={className}>
      {/* Hero — Saldo Livre */}
      <div
        style={{
          background: 'var(--cor-branco, #ffffff)',
          border: '1px solid var(--cor-borda, #dfe7e0)',
          borderRadius: 'var(--radius, 14px)',
          padding: '20px 24px',
          marginBottom: '12px',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            textTransform: 'uppercase' as const,
            letterSpacing: '0.5px',
            color: 'var(--cor-texto-mutado)',
            marginBottom: '6px',
          }}
        >
          Saldo Livre do Mês
        </div>
        <div
          style={{
            fontSize: '28px',
            fontWeight: 800,
            fontFamily: "'DM Mono', monospace",
            color: saldoCor,
            lineHeight: 1.1,
            letterSpacing: '-1px',
          }}
        >
          {formatarMoeda(saldoLivre)}
        </div>
        {saldoCarregado !== 0 && (
          <div
            style={{
              fontSize: '11px',
              color: 'var(--cor-texto-mutado)',
              marginTop: '4px',
              fontWeight: 500,
            }}
          >
            ({saldoCarregado > 0 ? '+' : ''}
            {formatarMoeda(saldoCarregado)} do mês anterior)
          </div>
        )}
      </div>

      {/* Grid 2×2 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px',
        }}
      >
        <KPICard
          icon="↓"
          iconColor="#10b981"
          label="Receita"
          valor={receita}
          valorColor="#10b981"
        />
        <KPICard
          icon="↑"
          iconColor="#ef4444"
          label="Despesas"
          valor={despesa}
          valorColor="#ef4444"
        />
        <KPICard
          icon="💳"
          iconColor="#f59e0b"
          label="Cartão"
          valor={cartao}
          valorColor="#f59e0b"
        />
        <KPICard
          icon="📈"
          iconColor="#2563eb"
          label="Investimentos"
          valor={investimento}
          valorColor="#2563eb"
        />
      </div>
    </div>
  );
}

function KPICard({
  icon,
  iconColor,
  label,
  valor,
  valorColor,
}: {
  icon: string;
  iconColor: string;
  label: string;
  valor: number;
  valorColor: string;
}) {
  return (
    <div
      style={{
        background: 'var(--cor-branco, #ffffff)',
        border: '1px solid var(--cor-borda, #dfe7e0)',
        borderRadius: 'var(--radius-sm, 10px)',
        padding: '14px 16px',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '6px',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            color: iconColor,
          }}
        >
          {icon}
        </span>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--cor-texto-mutado)',
            textTransform: 'uppercase' as const,
            letterSpacing: '0.4px',
          }}
        >
          {label}
        </span>
      </div>
      <div
        style={{
          fontSize: '16px',
          fontWeight: 700,
          fontFamily: "'DM Mono', monospace",
          color: valorColor,
          lineHeight: 1.1,
        }}
      >
        {formatarMoeda(valor)}
      </div>
    </div>
  );
}

export default FinancialKPIs;
