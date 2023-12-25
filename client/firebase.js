// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyAGHToD2Tw7nkzunS0dPyS_s50XX3t0FG0',
  authDomain: 'e-commerce-stripe-webhooks.firebaseapp.com',
  projectId: 'e-commerce-stripe-webhooks',
  storageBucket: 'e-commerce-stripe-webhooks.appspot.com',
  messagingSenderId: '1094916972779',
  appId: '1:1094916972779:web:4cf6350bb88f18e5451eae',
  measurementId: 'G-MMN815R3WD',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
