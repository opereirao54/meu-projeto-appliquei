import { auth, db } from './config';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: number;
  lastLoginAt: number;
}

/**
 * Login com email e senha
 */
export async function loginWithEmail(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Atualizar último login
    await updateLastLogin(user.uid);

    return { user, error: null };
  } catch (error: any) {
    console.error('Erro no login:', error);
    return { 
      user: null, 
      error: getAuthErrorMessage(error.code) 
    };
  }
}

/**
 * Registro de novo utilizador
 */
export async function registerUser(email: string, password: string, displayName?: string) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Atualizar perfil se displayName fornecido
    if (displayName) {
      await updateProfile(user, { displayName });
    }

    // Criar documento do utilizador no Firestore
    const userData: UserData = {
      uid: user.uid,
      email: user.email!,
      displayName: displayName || email.split('@')[0],
      createdAt: Date.now(),
      lastLoginAt: Date.now(),
    };

    await setDoc(doc(db, 'users', user.uid), userData);

    return { user, error: null };
  } catch (error: any) {
    console.error('Erro no registro:', error);
    return { 
      user: null, 
      error: getAuthErrorMessage(error.code) 
    };
  }
}

/**
 * Logout
 */
export async function logout() {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    console.error('Erro no logout:', error);
    return { error: 'Erro ao fazer logout' };
  }
}

/**
 * Observar estado de autenticação
 */
export function onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Atualizar último login
 */
async function updateLastLogin(uid: string) {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      await setDoc(userRef, { lastLoginAt: Date.now() }, { merge: true });
    } else {
      // Criar documento se não existir
      const user = auth.currentUser;
      if (user) {
        const userData: UserData = {
          uid: user.uid,
          email: user.email!,
          displayName: user.displayName || user.email!.split('@')[0],
          createdAt: Date.now(),
          lastLoginAt: Date.now(),
        };
        await setDoc(userRef, userData);
      }
    }
  } catch (error) {
    console.error('Erro ao atualizar último login:', error);
  }
}

/**
 * Obter dados do utilizador
 */
export async function getUserData(uid: string): Promise<UserData | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error('Erro ao obter dados do utilizador:', error);
    return null;
  }
}

/**
 * Mapear códigos de erro do Firebase para mensagens em PT-BR
 */
function getAuthErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    'auth/invalid-email': 'Email inválido',
    'auth/user-disabled': 'Utilizador desativado',
    'auth/user-not-found': 'Utilizador não encontrado',
    'auth/wrong-password': 'Senha incorreta',
    'auth/email-already-in-use': 'Email já está em uso',
    'auth/weak-password': 'Senha muito fraca (mínimo 6 caracteres)',
    'auth/operation-not-allowed': 'Operação não permitida',
    'auth/network-request-failed': 'Erro de conexão. Verifique sua internet.',
    'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
  };

  return errorMessages[code] || 'Ocorreu um erro. Tente novamente.';
}
