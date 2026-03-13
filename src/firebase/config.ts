import { getApps, initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSy...", // These values are placeholders and will be replaced by your project config
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};

export const getFirebaseConfig = () => {
  return firebaseConfig;
};

export function getFirebaseApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  return initializeApp(firebaseConfig);
}
