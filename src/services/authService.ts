import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, isFirebaseConfigured } from './firebase';

const DEMO_USER_STORAGE_KEY = '@mission_control_demo_user';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName?: string | null;
  isDemoUser?: boolean;
}

export class AuthService {
  /**
   * Listen to Firebase auth state changes or persistent demo login
   */
  public subscribeToAuthState(onUserChanged: (user: AuthUser | null) => void): () => void {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          onUserChanged({
            uid: fbUser.uid,
            email: fbUser.email,
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Mission Controller',
            isDemoUser: false,
          });
        } else {
          // Check if a demo user is stored locally
          const storedDemo = await AsyncStorage.getItem(DEMO_USER_STORAGE_KEY);
          if (storedDemo) {
            try {
              onUserChanged(JSON.parse(storedDemo));
              return;
            } catch {
              // Ignore corrupt json
            }
          }
          onUserChanged(null);
        }
      });
      return unsubscribe;
    }

    // Offline / Demo fallback listener
    let active = true;
    (async () => {
      const storedDemo = await AsyncStorage.getItem(DEMO_USER_STORAGE_KEY);
      if (active) {
        if (storedDemo) {
          try {
            onUserChanged(JSON.parse(storedDemo));
            return;
          } catch {
            // Ignore
          }
        }
        onUserChanged(null);
      }
    })();

    return () => {
      active = false;
    };
  }

  /**
   * Log in with Email and Password
   */
  public async login(email: string, pass: string): Promise<AuthUser> {
    if (!email || !pass) {
      throw new Error('Please enter both email and password.');
    }

    if (isFirebaseConfigured && auth) {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      return {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || email.split('@')[0],
        isDemoUser: false,
      };
    }

    // In demo / unconfigured mode: simulate auth
    const demoUser: AuthUser = {
      uid: 'demo-operator-01',
      email: email.trim(),
      displayName: email.split('@')[0] || 'Flight Director',
      isDemoUser: true,
    };
    await AsyncStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
    return demoUser;
  }

  /**
   * Register a new user
   */
  public async register(email: string, pass: string): Promise<AuthUser> {
    if (!email || !pass) {
      throw new Error('Please enter both email and password.');
    }
    if (pass.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }

    if (isFirebaseConfigured && auth) {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      return {
        uid: cred.user.uid,
        email: cred.user.email,
        displayName: cred.user.displayName || email.split('@')[0],
        isDemoUser: false,
      };
    }

    // Offline / Demo fallback registration
    const demoUser: AuthUser = {
      uid: `operator-${Date.now()}`,
      email: email.trim(),
      displayName: email.split('@')[0] || 'Flight Director',
      isDemoUser: true,
    };
    await AsyncStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
    return demoUser;
  }

  /**
   * Instant Exhibition Guest / Demo Bypass Login
   */
  public async loginAsDemoOperator(): Promise<AuthUser> {
    const demoUser: AuthUser = {
      uid: 'exhibition-operator',
      email: 'flight-director@mission-control.local',
      displayName: 'Flight Director (Demo)',
      isDemoUser: true,
    };
    await AsyncStorage.setItem(DEMO_USER_STORAGE_KEY, JSON.stringify(demoUser));
    return demoUser;
  }

  /**
   * Sign out
   */
  public async logout(): Promise<void> {
    await AsyncStorage.removeItem(DEMO_USER_STORAGE_KEY);
    if (isFirebaseConfigured && auth) {
      await firebaseSignOut(auth);
    }
  }
}

export const authService = new AuthService();
