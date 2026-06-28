import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const SC = window.SC || (window.SC = {});
SC.currentUser = null;
SC.currentProfile = null;

function studentIdToEmail(id){
  return String(id || "").trim().toLowerCase().replace(/\s+/g,"") + "@shingaku-compass.local";
}

async function loadProfile(uid){
  const { db, doc, getDoc } = window.SCFB;
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

SC.renderLogin = function(){
  SC.closeMenu?.();
  document.getElementById("app").innerHTML = `
  <section class="card">
    <h1>🔐 ログイン</h1>
    <p class="help">生徒はメールアドレスなしで、生徒IDだけでログインできます。</p>
    <div class="grid two">
      <div class="box">
        <h2>🎓 生徒ログイン</h2>
        <label>生徒ID</label><input id="studentIdInput" placeholder="例：OBU001">
        <label>パスワード</label><input id="studentPasswordInput" type="password">
        <button class="btn primary" onclick="SC.loginStudent()">ログイン</button>
        <p id="studentLoginMsg" class="help"></p>
      </div>
      <div class="box">
        <h2>👨‍🏫 先生ログイン</h2>
        <label>メールアドレス</label><input id="teacherEmailInput" placeholder="teacher@shingaku-compass.local">
        <label>パスワード</label><input id="teacherPasswordInput" type="password">
        <button class="btn navy" onclick="SC.loginTeacher()">ログイン</button>
        <p id="teacherLoginMsg" class="help"></p>
      </div>
    </div>
  </section>`;
};

SC.loginStudent = async function(){
  const id = document.getElementById("studentIdInput").value;
  const pw = document.getElementById("studentPasswordInput").value;
  try{
    await signInWithEmailAndPassword(window.SCFB.auth, studentIdToEmail(id), pw);
    SC.renderStudentDashboard();
  }catch(e){
    document.getElementById("studentLoginMsg").textContent = "ログインできませんでした。";
    console.error(e);
  }
};

SC.loginTeacher = async function(){
  const email = document.getElementById("teacherEmailInput").value;
  const pw = document.getElementById("teacherPasswordInput").value;
  try{
    await signInWithEmailAndPassword(window.SCFB.auth, email, pw);
    SC.renderTeacherDashboard();
  }catch(e){
    document.getElementById("teacherLoginMsg").textContent = "ログインできませんでした。";
    console.error(e);
  }
};

SC.logout = async function(){
  await signOut(window.SCFB.auth);
  SC.currentUser = null;
  SC.currentProfile = null;
  SC.renderLogin();
};

onAuthStateChanged(window.SCFB.auth, async user => {
  SC.currentUser = user || null;
  SC.currentProfile = user ? await loadProfile(user.uid) : null;
});
