import firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore"
// export const apiKey = "AIzaSyBc96_jWraidNSTEP5OcsUJGq4gHdPptAo";

const firebaseConfig = {
    apiKey: "AIzaSyBc96_jWraidNSTEP5OcsUJGq4gHdPptAo",
    authDomain: "image-community-b0bbf.firebaseapp.com",
    projectId: "image-community-b0bbf",
    storageBucket: "image-community-b0bbf.appspot.com",
    messagingSenderId: "454732979477",
    appId: "1:454732979477:web:005e7ed3819899cdfe9d1c",
    measurementId: "G-B5Q6FMW98C"

};

firebase.initializeApp(firebaseConfig);

// apiKey위의 방법 또는 이 방법으로 exort
const apiKey = firebaseConfig.apiKey;
// 다른 파일에서 가져가 쓸수있도록
const auth = firebase.auth();

const firestore = firebase.firestore();

export{auth, apiKey, firestore};