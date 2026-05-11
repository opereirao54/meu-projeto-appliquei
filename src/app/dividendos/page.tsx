'use client';

import React, { useMemo, useState } from 'react';
import { DividendBarChart } from '../../components/dividendos/DividendBarChart';
import { DividendHistory } from '../../components/dividendos/DividendHistory';
import { YOCBadge } from '../../components/dividendos/YOCBadge';
import { formatarMoeda } from '../../lib/formatters';
import { calcularYOC } from '../../lib/calculations/dividends';
import type { DividendPayment } from '../../types/dividends';

/**
 * Dividends Page — Gestão de Proventos e Yield on Cost.
 * 
 * Implementa a Phase 5 do Roadmap:
 *   - Gráfico de barras (últimos 12 meses)
 *   - Badges de YOC por ativo
 *   - Histórico de pagamentos
 *   - KPIs de Dividend Yield e Receita Anual
 * 
 * @ref legacy/Appliquei_v13.html:6100-6400
 */
export default function DividendsPage() {
  // Mock de pagamentos (em prod viria do Firebase)
  const [pagamentos] = useState<DividendPayment[]>([
    { id: '1', ticker: 'PETR4', valor: 0.50, data: '2024-05-10', tipo: 'dividendo', quantidadeNaData: 100 },
    { id: '2', ticker: 'VALE3', valor: 2.10, data: '2024-04-15', tipo: 'jcp', quantidadeNaData: 50 },
    { id: '3', ticker: 'PETR4', valor: 0.45, data: '2024-04-20', tipo: 'dividendo', quantidadeNaData: 100 },
    { id: '4', ticker: 'KNCR11', valor: 1.10, data: '2024-05-15', tipo: 'rendimento', quantidadeNaData: 200 },
  ]);

  // Mock de ativos para YOC
  const assetsForYOC = [
    { ticker: 'PETR4', totalInvestido: 2500 },
    { ticker: 'VALE3', totalInvestido: 4500 },
    { ticker: 'KNCR11', totalInvestido: 20000 },
  ];

  const monthlyAggregated = useMemo(() => {
    // Agregação simplificada para o chart
    return pagamentos.map(p => ({
      ano: new Date(p.data).getFullYear(),
      mes: new Date(p.data).getMonth(),
      total: p.valor * (p.quantidadeNaData || 0)
    }));
  }, [pagamentos]);

  const totalRecebido = pagamentos.reduce((acc, p) => acc + (p.valor * (p.quantidadeNaData || 0)), 0);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--cor-texto-principal)', marginBottom: '4px' }}>
          Dividendos & Proventos
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--cor-texto-mutado)' }}>
          Acompanhe sua renda passiva e a rentabilidade real dos seus ativos.
        </p>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <KPIMiniCard title="Total Recebido" value={formatarMoeda(totalRecebido)} sub="Histórico total" color="var(--cor-primaria)" />
        <KPIMiniCard title="Média Mensal" value={formatarMoeda(totalRecebido / 12)} sub="Últimos 12 meses" />
        <KPIMiniCard title="Proventos Pendentes" value={formatarMoeda(450.20)} sub="Próximos 30 dias" color="var(--cor-info)" />
        <KPIMiniCard title="Yield on Cost Médio" value="7.45%" sub="Carteira total" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {/* Dividend Chart */}
        <div style={{ 
          background: 'var(--cor-branco)', 
          padding: '24px', 
          borderRadius: '16px', 
          border: '1px solid var(--cor-borda)',
          boxShadow: 'var(--shadow-card)'
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '24px' }}>Receita Mensal</h2>
          <DividendBarChart data={monthlyAggregated} height={300} />
        </div>

        {/* YOC Badges */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Yield on Cost (Destaques)</h2>
          {assetsForYOC.map(asset => {
            const totalAtivo = pagamentos
              .filter(p => p.ticker === asset.ticker)
              .reduce((acc, p) => acc + (p.valor * (p.quantidadeNaData || 0)), 0);
            const yoc = asset.totalInvestido > 0 ? (totalAtivo / asset.totalInvestido) * 100 : 0;
            
            return (
              <YOCBadge 
                key={asset.ticker}
                ticker={asset.ticker}
                yoc={yoc}
                totalProventos={totalAtivo}
                totalInvestido={asset.totalInvestido}
              />
            );
          })}
        </div>
      </div>

      {/* History */}
      <div>
        <h2 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Histórico de Lançamentos</h2>
        <DividendHistory payments={pagamentos} />
      </div>
    </div>
  );
}

function KPIMiniCard({ title, value, sub, color }: any) {
  return (
    <div style={{ 
      background: 'var(--cor-branco)', 
      padding: '18px', 
      borderRadius: '14px', 
      border: '1px solid var(--cor-borda)',
      boxShadow: 'var(--shadow-card)'
    }}>
      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cor-texto-mutado)', textTransform: 'uppercase', marginBottom: '6px' }}>{title}</div>
      <div style={{ fontSize: '20px', fontWeight: 800, fontFamily: "'DM Mono', monospace", color: color || 'var(--cor-texto-principal)', marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '11px', color: 'var(--cor-texto-mutado)' }}>{sub}</div>
    </div>
  );
}
