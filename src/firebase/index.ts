'use client';

/**
 * @fileOverview Firebase Initialization and Export Barrel
 * 
 * This file centralizes Firebase app, auth, and firestore initialization
 * and provides a clean export interface for the rest of the application.
 */

import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFirebaseApp } from './config';

export function initializeFirebase() {
  const app = getFirebaseApp();
  const auth = getAuth(app);
  const db = getFirestore(app);
  return { app, auth, db };
}

// Re-export hooks and providers for clean '@/firebase' imports
export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
