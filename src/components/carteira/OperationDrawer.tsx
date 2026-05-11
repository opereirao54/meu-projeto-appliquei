import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Edit } from '@phosphor-icons/react';
import { useCarteiraStore } from '../../store/carteiraStore';
import { useAuthStore } from '../../store/authStore';
import { formatarMoeda, formatarBRLInput, parseBRL, aplicarMascaraBRL } from '../../lib/utils/math';
import { criarOperacao, atualizarOperacao, eliminarOperacao } from '../../lib/firebase/operacoes';

interface OperationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  operacaoParaEditar?: any | null;
}

export function OperationDrawer({ 
  isOpen, 
  onClose, 
  operacaoParaEditar = null 
}: OperationDrawerProps) {
  const { user } = useAuthStore();
  const addOperacao = useCarteiraStore((state) => state.addOperacao);
  const updateOperacao = useCarteiraStore((state) => state.updateOperacao);
  const removeOperacao = useCarteiraStore((state) => state.removeOperacao);

  const [formData, setFormData] = useState({
    ticker: '',
    nomeAtivo: '',
    tipo: 'Compra' as 'Compra' | 'Venda',
    quantidade: '',
    precoUnitario: '',
    dataOperacao: new Date().toISOString().split('T')[0],
    corretora: '',
    observacoes: '',
  });

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preencher formulário quando editar
  useEffect(() => {
    if (operacaoParaEditar && isOpen) {
      setIsEditing(true);
      setFormData({
        ticker: operacaoParaEditar.ticker || '',
        nomeAtivo: operacaoParaEditar.nomeAtivo || '',
        tipo: operacaoParaEditar.tipo || 'Compra',
        quantidade: String(operacaoParaEditar.quantidade || ''),
        precoUnitario: formatarBRLInput(operacaoParaEditar.precoUnitario || 0),
        dataOperacao: operacaoParaEditar.dataOperacao 
          ? new Date(operacaoParaEditar.dataOperacao).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
        corretora: operacaoParaEditar.corretora || '',
        observacoes: operacaoParaEditar.observacoes || '',
      });
    } else {
      resetForm();
    }
  }, [operacaoParaEditar, isOpen]);

  const resetForm = () => {
    setFormData({
      ticker: '',
      nomeAtivo: '',
      tipo: 'Compra',
      quantidade: '',
      precoUnitario: '',
      dataOperacao: new Date().toISOString().split('T')[0],
      corretora: '',
      observacoes: '',
    });
    setIsEditing(false);
    setError(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Aplicar máscara BRL para preço unitário
    if (name === 'precoUnitario') {
      setFormData(prev => ({
        ...prev,
        [name]: aplicarMascaraBRL(value)
      }));
    } else if (name === 'quantidade') {
      // Apenas números para quantidade
      const numericValue = value.replace(/[^0-9]/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setError('Utilizador não autenticado');
      return;
    }

    // Validar campos obrigatórios
    if (!formData.ticker || !formData.quantidade || !formData.precoUnitario) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const operacaoData = {
        userId: user.uid,
        ticker: formData.ticker.toUpperCase(),
        nomeAtivo: formData.nomeAtivo || formData.ticker.toUpperCase(),
        tipo: formData.tipo,
        quantidade: Number(formData.quantidade),
        precoUnitario: parseBRL(formData.precoUnitario),
        dataOperacao: new Date(formData.dataOperacao).getTime(),
        corretora: formData.corretora,
        observacoes: formData.observacoes,
      };

      if (isEditing && operacaoParaEditar?.id) {
        // Atualizar operação existente
        await atualizarOperacao(operacaoParaEditar.id, operacaoData);
        updateOperacao(operacaoParaEditar.id, operacaoData);
      } else {
        // Criar nova operação
        const novaOperacao = await criarOperacao(operacaoData);
        addOperacao(novaOperacao);
      }

      resetForm();
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar operação:', err);
      setError(err.message || 'Erro ao salvar operação');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!operacaoParaEditar?.id) return;

    if (!confirm('Tem certeza que deseja eliminar esta operação?')) {
      return;
    }

    setLoading(true);
    try {
      await eliminarOperacao(operacaoParaEditar.id);
      removeOperacao(operacaoParaEditar.id);
      resetForm();
      onClose();
    } catch (err: any) {
      console.error('Erro ao eliminar operação:', err);
      setError(err.message || 'Erro ao eliminar operação');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 overflow-y-auto transition-transform duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-syne font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Editar Operação' : 'Nova Operação'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X size={24} weight="bold" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Erro */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Ticker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ticker *
            </label>
            <input
              type="text"
              name="ticker"
              value={formData.ticker}
              onChange={handleInputChange}
              placeholder="Ex: PETR4, VALE3, AAPL"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
              required
            />
          </div>

          {/* Nome do Ativo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nome do Ativo
            </label>
            <input
              type="text"
              name="nomeAtivo"
              value={formData.nomeAtivo}
              onChange={handleInputChange}
              placeholder="Ex: Petrobras PN"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Tipo de Operação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Operação *
            </label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Compra">Compra</option>
              <option value="Venda">Venda</option>
            </select>
          </div>

          {/* Quantidade e Preço Unitário */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quantidade *
              </label>
              <input
                type="text"
                name="quantidade"
                value={formData.quantidade}
                onChange={handleInputChange}
                placeholder="0"
                inputMode="numeric"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preço Unitário *
              </label>
              <input
                type="text"
                name="precoUnitario"
                value={formData.precoUnitario}
                onChange={handleInputChange}
                placeholder="R$ 0,00"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                required
              />
            </div>
          </div>

          {/* Total */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
              <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formData.quantidade && formData.precoUnitario 
                  ? formatarMoeda(parseBRL(formData.precoUnitario) * Number(formData.quantidade))
                  : formatarMoeda(0)
                }
              </span>
            </div>
          </div>

          {/* Data da Operação */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data da Operação *
            </label>
            <input
              type="date"
              name="dataOperacao"
              value={formData.dataOperacao}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </div>

          {/* Corretora */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Corretora
            </label>
            <input
              type="text"
              name="corretora"
              value={formData.corretora}
              onChange={handleInputChange}
              placeholder="Ex: XP, Rico, NuInvest"
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Observações
            </label>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleInputChange}
              rows={3}
              placeholder="Adicione observações sobre esta operação..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
            />
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            {isEditing && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 flex items-center justify-center px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
              >
                <Trash2 size={20} weight="bold" className="mr-2" />
                Eliminar
              </button>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 flex items-center justify-center px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 ${
                isEditing ? '' : 'flex-grow'
              }`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Plus size={20} weight="bold" className="mr-2" />
              )}
              {loading ? 'Salvando...' : (isEditing ? 'Atualizar' : 'Adicionar')}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
