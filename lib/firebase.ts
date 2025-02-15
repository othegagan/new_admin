'use client';
import { initializeApp } from 'firebase/app';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTHDOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECTID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGEBUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGINGSENDERID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APPID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export default app;

type FirebaseErrorCode =
    | 'auth/user-not-found'
    | 'auth/wrong-password'
    | 'auth/invalid-email'
    | 'auth/too-many-requests'
    | 'auth/user-disabled'
    | 'auth/missing-password'
    | 'auth/invalid-credential'
    | 'auth/argument-error'
    | 'auth/invalid-phone-number'
    | 'auth/invalid-login-credentials'
    | 'auth/code-expired'
    | 'auth/invalid-verification-code'
    | 'auth/provider-already-linked'
    | 'auth/account-exists-with-different-credential'
    | 'default';

const errorMap: Record<FirebaseErrorCode, string> = {
    'auth/user-not-found': 'User account not found.',
    'auth/wrong-password': 'Incorrect password. Try again.',
    'auth/invalid-email': 'Invalid email address.',
    'auth/too-many-requests': 'Too many requests. Please try again later.',
    'auth/user-disabled': 'Account has been disabled.',
    'auth/missing-password': 'Please enter your password.',
    'auth/invalid-credential': 'Invalid Credentials. Please try again.',
    'auth/argument-error': 'Invalid argument. Please check your input and try again.',
    'auth/invalid-phone-number': 'Invalid phone number. Please enter a valid phone number.',
    'auth/invalid-login-credentials': 'Invalid Credentials. Please try again.',
    'auth/code-expired': 'Invalid OTP. Please enter a valid OTP.',
    'auth/invalid-verification-code': 'Invalid OTP. Please enter a valid OTP.',
    'auth/provider-already-linked': 'Account already linked with phone number',
    'auth/account-exists-with-different-credential':
        'Phone number has been linked with another account. Please try again with a different phone number.',
    default: 'An error occurred. Please try again.'
};

export function getFirebaseErrorMessage(code: string): string {
    return errorMap[code as FirebaseErrorCode] || errorMap.default;
}

export function sendFirebaseResetPasswordEmail(email: string) {
    return sendPasswordResetEmail(auth, email);
}

export function firebaseLogout() {
    auth.signOut();
}
