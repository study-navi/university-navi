import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
import { getFirestore, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";
const firebaseConfig={apiKey:"AIzaSyCQBhzH003xOkUbrtREIO0tNZIJPQn5OOo",authDomain:"shingaku-compass.firebaseapp.com",projectId:"shingaku-compass",storageBucket:"shingaku-compass.firebasestorage.app",messagingSenderId:"890481721554",appId:"1:890481721554:web:fef9cfbc749b59dd40ad0b",measurementId:"G-K1K3ER8WEB"};
const app=initializeApp(firebaseConfig);
window.SCFB_CONFIG=firebaseConfig;
window.SCFB={app,auth:getAuth(app),db:getFirestore(app),collection,doc,getDoc,getDocs,setDoc,addDoc,updateDoc,deleteDoc,query,where,serverTimestamp};
window.dispatchEvent(new Event("scfb-ready"));
