'use client';

import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFirebaseApp } from './config';

export function initializeFirebase() {
  const app = getFirebaseApp();
  const auth = getAuth(app);
  const db = getFirestore(app);
  return { app, auth, db };
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
