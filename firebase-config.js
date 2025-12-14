// firebase-config.js - Firebase Configuration & Initialization

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDXlGMYQVXn6HP6hdhLhInJ1QriBu6CtN0",
    authDomain: "joshua-63b67.firebaseapp.com",
    databaseURL: "https://joshua-63b67-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "joshua-63b67",
    storageBucket: "joshua-63b67.firebasestorage.app",
    messagingSenderId: "550948274290",
    appId: "1:550948274290:web:b54ae3df43fe66227442eb",
    measurementId: "G-E8MMFF33BR"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const storage = firebase.storage();

console.log('🔥 Firebase initialized successfully');
