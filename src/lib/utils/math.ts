/**
 * Formata um número como moeda BRL (R$)
 * Exatamente como no código legado: formatarMoeda(valor)
 */
export function formatarMoeda(valor: number | string | null | undefined): string {
  const num = typeof valor === 'number' ? valor : parseBRL(valor);
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

/**
 * Parse de string BRL para número
 * Exatamente como no código legado: parseBRL(str)
 * Remove caracteres não numéricos, trata separadores brasileiros
 */
export function parseBRL(str: string | number | null | undefined): number {
  if (str == null) return 0;
  if (typeof str === 'number') return str;
  
  const limpo = String(str)
    .replace(/[^\d,-]/g, '')
    .replace(/\.(?=\d{3}(\D|$))/g, '')
    .replace(',', '.');
  
  const n = parseFloat(limpo);
  return isNaN(n) ? 0 : n;
}

/**
 * Formata número para input BRL com 2 casas decimais
 * Exatamente como no código legado: formatarBRLInput(valor)
 */
export function formatarBRLInput(valor: number | string): string {
  const n = typeof valor === 'number' ? valor : parseBRL(valor);
  return n.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Aplica máscara BRL em tempo real num input
 * Exatamente como no código legado: aplicarMascaraBRL(input)
 */
export function aplicarMascaraBRL(value: string): string {
  const apenasDigitos = value.replace(/\D/g, '');
  if (!apenasDigitos) return '';
  
  const numero = Number(apenasDigitos) / 100;
  return numero.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Calcula preço médio usando método FIFO (First In, First Out)
 * Baseado na lógica do código legado (linhas ~4969-4980, ~6004-6034)
 * 
 * Para compras: soma quantidade e valor investido, recalcula média
 * Para vendas: subtrai quantidade e valor baseado no preço médio atual
 */
export function calcularPrecoMedioFIFO(
  operacoes: Array<{
    tipo: 'compra' | 'venda';
    quantidade: number;
    preco: number;
  }>
): { qtdTotal: number; valorTotalInvestido: number; precoMedio: number } {
  let qtdTotal = 0;
  let valorTotalInvestido = 0;
  
  for (const op of operacoes) {
    const precoDaOp = op.preco;
    
    if (op.tipo === 'compra') {
      qtdTotal += op.quantidade;
      valorTotalInvestido += op.quantidade * precoDaOp;
    } else if (op.tipo === 'venda') {
      // Venda reduz quantidade e valor baseado no preço médio atual
      const precoMedioAtual = qtdTotal > 0 ? valorTotalInvestido / qtdTotal : 0;
      qtdTotal -= op.quantidade;
      valorTotalInvestido -= op.quantidade * precoMedioAtual;
      
      // Garante que não fique negativo
      if (qtdTotal < 0) qtdTotal = 0;
      if (valorTotalInvestido < 0) valorTotalInvestido = 0;
    }
  }
  
  const precoMedio = qtdTotal > 0 ? valorTotalInvestido / qtdTotal : 0;
  
  return {
    qtdTotal,
    valorTotalInvestido,
    precoMedio,
  };
}

/**
 * Atualiza carteira com uma nova operação (FIFO)
 * Retorna o estado atualizado do ativo
 */
export function atualizarCarteiraFIFO(
  ativoExistente: {
    qtdTotal: number;
    valorTotalInvestido: number;
    precoMedio: number;
  } | null,
  operacao: {
    tipo: 'compra' | 'venda';
    quantidade: number;
    preco: number;
  }
): { qtdTotal: number; valorTotalInvestido: number; precoMedio: number } {
  const base = ativoExistente ?? { qtdTotal: 0, valorTotalInvestido: 0, precoMedio: 0 };
  
  if (operacao.tipo === 'compra') {
    const novaQtd = base.qtdTotal + operacao.quantidade;
    const novoValor = base.valorTotalInvestido + operacao.quantidade * operacao.preco;
    const novoPrecoMedio = novaQtd > 0 ? novoValor / novaQtd : 0;
    
    return {
      qtdTotal: novaQtd,
      valorTotalInvestido: novoValor,
      precoMedio: novoPrecoMedio,
    };
  } else {
    // Venda
    const novaQtd = base.qtdTotal - operacao.quantidade;
    const novoValor = base.valorTotalInvestido - operacao.quantidade * base.precoMedio;
    
    return {
      qtdTotal: Math.max(0, novaQtd),
      valorTotalInvestido: Math.max(0, novoValor),
      precoMedio: novaQtd > 0 ? novoValor / novaQtd : 0,
    };
  }
}

/**
 * Formata porcentagem com sinal (+/-)
 */
export function formatarPercentual(valor: number, mostrarSinal = true): string {
  const sinal = mostrarSinal && valor >= 0 ? '+' : '';
  return `${sinal}${valor.toFixed(2)}%`;
}

/**
 * Verifica se valor é positivo (para cores condicionais)
 */
export function isPositivo(valor: number): boolean {
  return valor > 0;
}

/**
 * Verifica se valor é negativo (para cores condicionais)
 */
export function isNegativo(valor: number): boolean {
  return valor < 0;
}
