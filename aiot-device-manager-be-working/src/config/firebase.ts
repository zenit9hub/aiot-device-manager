import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { env } from './env';

export const getFirebaseAdmin = () => {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: env.firebase.projectId,
        clientEmail: env.firebase.clientEmail,
        privateKey: env.firebase.privateKey
      })
    });
  }

  return getApp();
};

export const firebaseAuth = () => getAuth(getFirebaseAdmin());
