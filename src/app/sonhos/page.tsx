'use client';

import React, { useMemo } from 'react';
import { useDreamStore } from '../../store/dreamStore';
import { DreamCard } from '../../components/sonhos/DreamCard';
import { FinancialHealthPanel } from '../../components/sonhos/FinancialHealthPanel';
import { formatarMoeda } from '../../lib/formatters';
import { analisarSaudeFinanceiraSonhos } from '../../lib/calculations/dreams';
import { useTransactionStore } from '../../store/transactionStore';

/**
 * Dream Planner Page — Gestão de Metas e Sonhos.
 * 
 * Implementa a Phase 7 do Roadmap:
 *   - Grid de cards de sonhos (ativos e conquistados)
 *   - Painel de Saúde Financeira com score real
 *   - KPIs de total necessário e progresso geral
 * 
 * @ref legacy/Appliquei_v13.html:8500-9200
 */
export default function DreamPlannerPage() {
  const { sonhos, getProgressoGeral, getTotalMensalNecessario } = useDreamStore();
  const { getResumoMes } = useTransactionStore();

  const progressoGeral = getProgressoGeral();
  const totalMensal = getTotalMensalNecessario();

  // Mock de resumos mensais para análise de saúde (em prod viria do store/banco)
  const resumosMensais = useMemo(() => {
    const hoje = new Date();
    return Array.from({ length: 4 }).map((_, i) => {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      return {
        mes: d.getMonth(),
        ano: d.getFullYear(),
        resumo: getResumoMes(d.getMonth(), d.getFullYear()),
      };
    });
  }, [getResumoMes]);

  const saude = useMemo(() => analisarSaudeFinanceiraSonhos(resumosMensais, sonhos), [resumosMensais, sonhos]);

  const sonhosAtivos = sonhos.filter(s => s.valorAtual < s.valorTotal);
  const sonhosConquistados = sonhos.filter(s => s.valorAtual >= s.valorTotal);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--cor-texto-principal)', marginBottom: '4px' }}>
            Dream Planner
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--cor-texto-mutado)' }}>
            Planeje suas metas de vida com precisão matemática.
          </p>
        </div>
        
        <button 
          style={{
            padding: '10px 20px',
            background: 'var(--cor-primaria)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(5,150,105,0.2)'
          }}
        >
          + Novo Sonho
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '32px', flexWrap: 'wrap' }}>
        {/* Left: Dream List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Metas Ativas</h2>
            <span style={{ fontSize: '11px', fontWeight: 700, background: 'var(--cor-bg-primaria)', color: 'var(--cor-primaria)', padding: '2px 8px', borderRadius: '99px' }}>
              {sonhosAtivos.length}
            </span>
          </div>

          {sonhosAtivos.length > 0 ? (
            sonhosAtivos.map(s => (
              <DreamCard key={s.id} dream={s} />
            ))
          ) : (
            <EmptyDreams onAdd={() => {}} />
          )}

          {sonhosConquistados.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--cor-texto-mutado)' }}>Conquistados</h2>
                <span style={{ fontSize: '11px', fontWeight: 700, background: 'var(--cor-superficie)', color: 'var(--cor-texto-mutado)', padding: '2px 8px', borderRadius: '99px' }}>
                  {sonhosConquistados.length}
                </span>
              </div>
              <div style={{ opacity: 0.7 }}>
                {sonhosConquistados.map(s => (
                  <DreamCard key={s.id} dream={s} className="grayscale" />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Health & KPIs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <FinancialHealthPanel 
            score={saude} 
            mesesComDados={resumosMensais.length}
            planoSugerido={[
              'Mantenha seu termômetro abaixo de 60% para acelerar os sonhos.',
              'Aumente o aporte no sonho "Intercâmbio" para evitar o atraso de 2 meses.',
              'Considere resgatar parte da reserva para quitar o saldo negativo de Julho.'
            ]}
          />

          <div style={{ 
            background: 'var(--cor-branco)', 
            padding: '24px', 
            borderRadius: '16px', 
            border: '1px solid var(--cor-borda)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '20px' }}>Resumo de Metas</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <KPIMini label="Progresso Geral" value={`${progressoGeral.toFixed(1)}%`} color="var(--cor-primaria)" />
              <KPIMini label="Aporte Mensal Total" value={formatarMoeda(totalMensal)} color="var(--cor-primaria)" />
              <KPIMini label="Total em Metas" value={formatarMoeda(sonhos.reduce((acc, s) => acc + s.valorTotal, 0))} color="var(--cor-texto-principal)" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KPIMini({ label, value, color }: any) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--cor-texto-mutado)' }}>{label}</span>
      <strong style={{ fontSize: '15px', fontWeight: 700, fontFamily: "'DM Mono', monospace", color }}>{value}</strong>
    </div>
  );
}

function EmptyDreams({ onAdd }: any) {
  return (
    <div style={{ padding: '60px 40px', textAlign: 'center', background: 'var(--cor-superficie)', borderRadius: '16px', border: '1px dashed var(--cor-borda)' }}>
      <div style={{ fontSize: '40px', marginBottom: '16px' }}>🌈</div>
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>Você ainda não tem sonhos cadastrados</h3>
      <p style={{ fontSize: '14px', color: 'var(--cor-texto-mutado)', marginBottom: '24px', maxWidth: '300px', margin: '0 auto 24px' }}>
        Defina suas metas e prazos para que possamos calcular o plano ideal para você.
      </p>
      <button 
        onClick={onAdd}
        style={{ padding: '8px 24px', background: 'var(--cor-primaria)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
      >
        Começar agora
      </button>
    </div>
  );
}
