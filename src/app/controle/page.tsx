'use client';

import React, { useEffect } from 'react';
import { useTransactionStore } from '../../store/transactionStore';
import { MonthNavigator } from '../../components/controle/MonthNavigator';
import { FinancialKPIs } from '../../components/controle/FinancialKPIs';
import { Thermometer60 } from '../../components/controle/Thermometer60';
import { CarryForwardBanner } from '../../components/controle/CarryForwardBanner';
import { Statement } from '../../components/controle/Statement';
import { DRETable } from '../../components/controle/DRETable';
import { CompositionBar } from '../../components/controle/CompositionBar';

/**
 * Financial Control Page — Controle de Caixa Mensal.
 * 
 * Implementa a Phase 4 do Roadmap:
 *   - Navegação entre meses
 *   - KPIs e Termômetro 60%
 *   - Banner de Carry-Forward
 *   - Extrato e Tabela DRE
 * 
 * @ref legacy/Appliquei_v13.html:7300-8000
 */
export default function FinancialControlPage() {
  const {
    visaoMes,
    visaoAno,
    mudarMes,
    irParaHoje,
    getResumoMes,
    getSaldoLivreMes,
    carryForward,
    aceitarCarry,
    recusarCarry,
    desfazerCarry,
    transacoes,
  } = useTransactionStore();

  const resumo = getResumoMes(visaoMes, visaoAno);
  const saldoLivre = getSaldoLivreMes(visaoMes, visaoAno);
  
  // Saldo do mês anterior para o banner
  const mesAnt = visaoMes === 0 ? 11 : visaoMes - 1;
  const anoAnt = visaoMes === 0 ? visaoAno - 1 : visaoAno;
  const resumoAnt = getResumoMes(mesAnt, anoAnt);
  const resultadoMesAnterior = resumoAnt.receita + resumoAnt.resgate - (resumoAnt.despFixa + resumoAnt.despVar + resumoAnt.cartao) - (resumoAnt.invFixo + resumoAnt.invVar) - resumoAnt.sonho;

  const currentCarry = carryForward[`${visaoAno}-${String(visaoMes).padStart(2, '0')}`];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header with Navigation */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--cor-texto-principal)', margin: 0 }}>
            Controle de Caixa
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--cor-texto-mutado)', marginTop: '4px' }}>
            Gerencie suas receitas e despesas com a regra dos 60%.
          </p>
        </div>
        <MonthNavigator 
          mes={visaoMes} 
          ano={visaoAno} 
          onNavigate={mudarMes} 
          onGoToToday={irParaHoje} 
        />
      </div>

      {/* Carry Forward Banner */}
      <CarryForwardBanner 
        mesAtual={visaoMes}
        anoAtual={visaoAno}
        resultadoMesAnterior={resultadoMesAnterior}
        carryForwardMap={carryForward}
        onAceitar={aceitarCarry}
        onRecusar={recusarCarry}
        onDesfazer={desfazerCarry}
        style={{ marginBottom: '24px' }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {/* Left Column: KPIs & Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <FinancialKPIs 
            receita={resumo.receita + resumo.resgate}
            despesa={resumo.despFixa + resumo.despVar + resumo.cartao}
            cartao={resumo.cartao}
            investimento={resumo.invFixo + resumo.invVar}
            saldoLivre={saldoLivre}
            saldoCarregado={currentCarry?.valor || 0}
          />
          
          <Thermometer60 resumo={resumo} />
          
          <div style={{ 
            background: 'var(--cor-branco)', 
            padding: '20px', 
            borderRadius: '14px', 
            border: '1px solid var(--cor-borda)',
            boxShadow: 'var(--shadow-card)'
          }}>
            <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px' }}>Composição dos Gastos</h3>
            <CompositionBar resumo={resumo} height={250} />
          </div>
        </div>

        {/* Right Column: Statement */}
        <div>
          <Statement 
            transactions={transacoes.filter(t => t.mes === visaoMes && t.ano === visaoAno)} 
            // Mock functions for now
            onEdit={() => {}}
            onDelete={() => {}}
            onTogglePago={() => {}}
          />
        </div>
      </div>

      {/* DRE Table */}
      <div style={{ marginTop: '32px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Demonstrativo de Resultados (DRE)</h2>
        <DRETable 
          mesBase={visaoMes}
          anoBase={visaoAno}
          calcResumo={getResumoMes}
          carryForward={carryForward}
        />
      </div>
    </div>
  );
}
