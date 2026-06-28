// 進学コンパス Ver.12 認証・ログイン継続
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const SC = window.SC || (window.SC = {});
SC.currentUser = null;
SC.currentProfile = null;

setPersistence(window.SCFB.auth, browserLocalPersistence).catch(console.error);

function studentIdToEmail(id){
  return String(id || "").trim().toLowerCase().replace(/\s+/g,"") + "@shingaku-compass.local";
}

async function loadProfile(uid){
  const { db, doc, getDoc } = window.SCFB;
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

SC.renderLogin = function(){
  if(SC.renderRoleSelect) SC.renderRoleSelect();
};

SC.loginTeacher = async function(){
  const email = document.getElementById("teacherEmailInput")?.value;
  const pw = document.getElementById("teacherPasswordInput")?.value;
  const msg = document.getElementById("teacherLoginMsg");
  try{
    await signInWithEmailAndPassword(window.SCFB.auth, email, pw);
    localStorage.setItem("sc_current_mode", "teacher");
    setTimeout(() => SC.renderTeacherHome ? SC.renderTeacherHome() : SC.renderTeacherDashboard(), 600);
  }catch(e){
    if(msg) msg.textContent = "ログインできませんでした。";
    console.error(e);
  }
};

SC.loginStudent = async function(){
  const id = document.getElementById("studentIdInput")?.value;
  const pw = document.getElementById("studentPasswordInput")?.value;
  const msg = document.getElementById("studentLoginMsg");
  try{
    await signInWithEmailAndPassword(window.SCFB.auth, studentIdToEmail(id), pw);
    localStorage.setItem("sc_current_mode", "student");
    setTimeout(() => SC.renderStudentHome ? SC.renderStudentHome() : SC.renderStudentDashboard(), 600);
  }catch(e){
    if(msg) msg.textContent = "ログインできませんでした。先生側で生徒ログイン有効化後に使えます。";
    console.error(e);
  }
};

SC.logout = async function(){
  await signOut(window.SCFB.auth);
  SC.currentUser = null;
  SC.currentProfile = null;
  localStorage.removeItem("sc_current_mode");
  if(SC.renderRoleSelect) SC.renderRoleSelect();
};

onAuthStateChanged(window.SCFB.auth, async user => {
  SC.currentUser = user || null;
  SC.currentProfile = null;

  if(user){
    try{
      SC.currentProfile = await loadProfile(user.uid);
      if(SC.currentProfile?.role === "teacher") localStorage.setItem("sc_current_mode", "teacher");
      if(SC.currentProfile?.role === "student") localStorage.setItem("sc_current_mode", "student");
    }catch(e){
      console.warn("profile load failed", e);
    }
  }
});
