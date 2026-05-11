import { db } from './config';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  Timestamp,
  QueryConstraint
} from 'firebase/firestore';
import type { Operacao, TipoOperacao, TipoAtivo } from '../../types';

const COLECAO_OPERACOES = 'operacoes';

/**
 * Criar uma nova operação
 */
export async function criarOperacao(operacao: Omit<Operacao, 'id'>) {
  try {
    const docRef = await addDoc(collection(db, COLECAO_OPERACOES), {
      ...operacao,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { id: docRef.id, ...operacao, createdAt: Date.now(), updatedAt: Date.now() };
  } catch (error) {
    console.error('Erro ao criar operação:', error);
    throw error;
  }
}

/**
 * Atualizar uma operação existente
 */
export async function atualizarOperacao(id: string, dados: Partial<Operacao>) {
  try {
    const operacaoRef = doc(db, COLECAO_OPERACOES, id);
    await updateDoc(operacaoRef, {
      ...dados,
      updatedAt: Timestamp.now(),
    });
    return true;
  } catch (error) {
    console.error('Erro ao atualizar operação:', error);
    throw error;
  }
}

/**
 * Eliminar uma operação
 */
export async function eliminarOperacao(id: string) {
  try {
    await deleteDoc(doc(db, COLECAO_OPERACOES, id));
    return true;
  } catch (error) {
    console.error('Erro ao eliminar operação:', error);
    throw error;
  }
}

/**
 * Obter uma operação por ID
 */
export async function obterOperacao(id: string): Promise<Operacao | null> {
  try {
    const operacaoRef = doc(db, COLECAO_OPERACOES, id);
    const operacaoSnap = await getDoc(operacaoRef);

    if (operacaoSnap.exists()) {
      const data = operacaoSnap.data();
      return {
        id: operacaoSnap.id,
        ...data,
        createdAt: data.createdAt?.toMillis() || Date.now(),
        updatedAt: data.updatedAt?.toMillis() || Date.now(),
      } as Operacao;
    }
    return null;
  } catch (error) {
    console.error('Erro ao obter operação:', error);
    return null;
  }
}

/**
 * Obter todas as operações de um utilizador
 */
export async function obterOperacoesPorUsuario(uid: string): Promise<Operacao[]> {
  try {
    const q = query(
      collection(db, COLECAO_OPERACOES),
      where('userId', '==', uid),
      orderBy('dataOperacao', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const operacoes: Operacao[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      operacoes.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toMillis() || Date.now(),
        updatedAt: data.updatedAt?.toMillis() || Date.now(),
      } as Operacao);
    });

    return operacoes;
  } catch (error) {
    console.error('Erro ao obter operações:', error);
    return [];
  }
}

/**
 * Obter operações por ativo
 */
export async function obterOperacoesPorAtivo(
  uid: string, 
  ticker: string
): Promise<Operacao[]> {
  try {
    const q = query(
      collection(db, COLECAO_OPERACOES),
      where('userId', '==', uid),
      where('ticker', '==', ticker),
      orderBy('dataOperacao', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const operacoes: Operacao[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      operacoes.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toMillis() || Date.now(),
        updatedAt: data.updatedAt?.toMillis() || Date.now(),
      } as Operacao);
    });

    return operacoes;
  } catch (error) {
    console.error('Erro ao obter operações por ativo:', error);
    return [];
  }
}

/**
 * Obter operações por tipo
 */
export async function obterOperacoesPorTipo(
  uid: string, 
  tipo: TipoOperacao
): Promise<Operacao[]> {
  try {
    const q = query(
      collection(db, COLECAO_OPERACOES),
      where('userId', '==', uid),
      where('tipo', '==', tipo),
      orderBy('dataOperacao', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const operacoes: Operacao[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      operacoes.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toMillis() || Date.now(),
        updatedAt: data.updatedAt?.toMillis() || Date.now(),
      } as Operacao);
    });

    return operacoes;
  } catch (error) {
    console.error('Erro ao obter operações por tipo:', error);
    return [];
  }
}

/**
 * Obter operações por período
 */
export async function obterOperacoesPorPeriodo(
  uid: string,
  dataInicio: number,
  dataFim: number
): Promise<Operacao[]> {
  try {
    const q = query(
      collection(db, COLECAO_OPERACOES),
      where('userId', '==', uid),
      where('dataOperacao', '>=', dataInicio),
      where('dataOperacao', '<=', dataFim),
      orderBy('dataOperacao', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const operacoes: Operacao[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      operacoes.push({
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toMillis() || Date.now(),
        updatedAt: data.updatedAt?.toMillis() || Date.now(),
      } as Operacao);
    });

    return operacoes;
  } catch (error) {
    console.error('Erro ao obter operações por período:', error);
    return [];
  }
}
