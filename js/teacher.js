import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
const SC = window.SC || (window.SC = {});

function studentIdToEmail(id){
  return String(id || "").trim().toLowerCase().replace(/\s+/g,"") + "@shingaku-compass.local";
}

SC.renderTeacherDashboard = async function(){
  SC.closeMenu?.();
  if(!SC.currentUser){ SC.renderLogin(); return; }
  document.getElementById("app").innerHTML = `
  <section class="card">
    <h1>👨‍🏫 先生画面</h1>
    <div class="actions">
      <button class="btn primary" onclick="SC.renderAddStudent()">＋ 生徒追加</button>
      <button class="btn navy" onclick="SC.loadStudents()">生徒一覧</button>
      <button class="btn light" onclick="SC.logout()">ログアウト</button>
    </div>
    <div id="teacherBox" class="box">準備完了</div>
    <div id="studentsList"></div>
  </section>`;
  SC.loadStudents();
};

SC.renderAddStudent = function(){
  document.getElementById("teacherBox").innerHTML = `
    <h2>＋ 生徒追加</h2>
    <label>生徒ID</label><input id="newStudentId" placeholder="OBU001">
    <label>初期パスワード</label><input id="newStudentPassword" placeholder="12345678">
    <label>氏名</label><input id="newStudentName" placeholder="山田太郎">
    <label>学校</label><input id="newStudentSchool" placeholder="大府高校">
    <label>学年</label><input id="newStudentGrade" placeholder="高3">
    <button class="btn primary" onclick="SC.createStudent()">登録</button>
    <p id="createStudentMsg" class="help"></p>`;
};

SC.createStudent = async function(){
  const id = document.getElementById("newStudentId").value.trim();
  const pw = document.getElementById("newStudentPassword").value.trim();
  const name = document.getElementById("newStudentName").value.trim();
  const school = document.getElementById("newStudentSchool").value.trim();
  const grade = document.getElementById("newStudentGrade").value.trim();
  try{
    const cred = await createUserWithEmailAndPassword(window.SCFB.auth, studentIdToEmail(id), pw);
    await window.SCFB.setDoc(window.SCFB.doc(window.SCFB.db, "users", cred.user.uid), {
      role:"student", studentId:id, name, school, grade, createdAt:window.SCFB.serverTimestamp()
    });
    document.getElementById("createStudentMsg").textContent = "登録しました。";
    SC.loadStudents();
  }catch(e){
    document.getElementById("createStudentMsg").textContent = "登録できませんでした。";
    console.error(e);
  }
};

SC.loadStudents = async function(){
  const list = document.getElementById("studentsList");
  if(!list) return;
  try{
    const q = window.SCFB.query(window.SCFB.collection(window.SCFB.db,"users"), window.SCFB.where("role","==","student"));
    const snap = await window.SCFB.getDocs(q);
    const students = [];
    snap.forEach(d => students.push({uid:d.id, ...d.data()}));
    list.innerHTML = students.length ? students.map(s => `
      <div class="box">
        <h2>${s.name || "名前未設定"}</h2>
        <p>生徒ID：${s.studentId || "-"}<br>学校：${s.school || "-"}<br>学年：${s.grade || "-"}</p>
        <button class="btn light" onclick="SC.showStudentLogs('${s.uid}','${s.name || ""}')">記録を見る</button>
      </div>`).join("") : `<div class="box">まだ生徒がいません。</div>`;
  }catch(e){
    list.innerHTML = `<div class="box">読み込み失敗。Firestoreルールを確認してください。</div>`;
    console.error(e);
  }
};

SC.showStudentLogs = async function(uid, name){
  const box = document.getElementById("teacherBox");
  const q = window.SCFB.query(window.SCFB.collection(window.SCFB.db,"studyLogs"), window.SCFB.where("uid","==",uid));
  const snap = await window.SCFB.getDocs(q);
  const logs = [];
  snap.forEach(d => logs.push(d.data()));
  const total = logs.reduce((s,l)=>s+Number(l.minutes||0),0);
  box.innerHTML = `<h2>📚 ${name} の記録</h2><p>合計 ${total}分 / ${logs.length}件</p>` +
    logs.slice(-20).reverse().map(l => `<div class="box">${l.date} / ${l.subject} / ${l.minutes}分<br>${l.memo || ""}</div>`).join("");
};
