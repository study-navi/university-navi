// 進学コンパス Ver.13.1 先生画面・ログイン有効化対応

import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signOut as secondarySignOut } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

const SC = window.SC || (window.SC = {});

function todayStr(){ return new Date().toISOString().slice(0,10); }
function dateDaysAgo(n){ const d = new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); }
function ymStr(){ return new Date().toISOString().slice(0,7); }
function safeText(v){ return String(v ?? "").replace(/[<>&]/g, s => ({ "<":"&lt;", ">":"&gt;", "&":"&amp;" }[s])); }

async function createStudentAuthAccount(studentId, password){
  const appName = "studentCreateApp_" + Date.now();
  const secondaryApp = initializeApp(window.SCFB_CONFIG, appName);
  const secondaryAuth = getAuth(secondaryApp);
  try{
    const email = SC.studentIdToEmail ? SC.studentIdToEmail(studentId) : (String(studentId).toLowerCase() + "@student.shingaku-compass.com");
    const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    await secondarySignOut(secondaryAuth);
    await deleteApp(secondaryApp);
    return { uid: cred.user.uid, email };
  }catch(e){
    try{ await deleteApp(secondaryApp); }catch(_){}
    throw e;
  }
}

SC.renderTeacherDashboard = async function(){
  SC.closeMenu?.();
  if(!SC.currentUser){ SC.renderLogin(); return; }

  document.getElementById("app").innerHTML = `
  <section class="card">
    <h1>👨‍🏫 先生ダッシュボード</h1>
    <p class="help">生徒管理・学習記録・ランキングを確認できます。</p>
    <div class="actions">
      <button class="btn primary" onclick="SC.renderAddStudent()">＋ 生徒追加</button>
      <button class="btn navy" onclick="SC.loadStudents()">生徒一覧</button>
      <button class="btn navy" onclick="SC.renderTeacherRanking()">ランキング</button>
      <button class="btn light" onclick="SC.logout()">ログアウト</button>
    </div>
    <div id="teacherBox" class="box">読み込み中...</div>
    <div id="studentsList"></div>
  </section>`;

  await SC.renderTeacherSummary();
  await SC.loadStudents();
};

SC.getAllStudentsAndLogs = async function(){
  const { db, collection, getDocs, query, where } = window.SCFB;
  const studentsQ = query(collection(db, "users"), where("role", "==", "student"));
  const studentsSnap = await getDocs(studentsQ);
  const students = [];
  studentsSnap.forEach(d => students.push({uid:d.id, ...d.data()}));
  const logsSnap = await getDocs(collection(db, "studyLogs"));
  const logs = [];
  logsSnap.forEach(d => logs.push({id:d.id, ...d.data()}));
  return { students, logs };
};

SC.renderTeacherSummary = async function(){
  const box = document.getElementById("teacherBox");
  if(!box) return;
  try{
    const { students, logs } = await SC.getAllStudentsAndLogs();
    const today = todayStr(), weekStart = dateDaysAgo(6), month = ymStr();
    const todayMin = logs.filter(l => l.date === today).reduce((s,l)=>s+Number(l.minutes||0),0);
    const weekMin = logs.filter(l => String(l.date||"") >= weekStart).reduce((s,l)=>s+Number(l.minutes||0),0);
    const monthMin = logs.filter(l => String(l.date||"").startsWith(month)).reduce((s,l)=>s+Number(l.minutes||0),0);
    box.innerHTML = `
      <h2>📊 全体サマリー</h2>
      <div class="grid two">
        <div class="box"><b>登録生徒</b><br>${students.length}名</div>
        <div class="box"><b>今日</b><br>${todayMin}分</div>
        <div class="box"><b>直近7日</b><br>${weekMin}分</div>
        <div class="box"><b>今月</b><br>${monthMin}分</div>
      </div>`;
  }catch(e){
    box.innerHTML = "サマリーを読み込めませんでした。";
    console.error(e);
  }
};

SC.makeStudentId = async function(){
  const { db, collection, getDocs, query, where } = window.SCFB;
  const q = query(collection(db, "users"), where("role", "==", "student"));
  const snap = await getDocs(q);
  return "KYOWA" + String(snap.size + 1).padStart(3, "0");
};

SC.makePassword = function(){ return String(Math.floor(100000 + Math.random() * 900000)); };

SC.renderAddStudent = async function(){
  const box = document.getElementById("teacherBox");
  if(!box) return;
  let nextId = "KYOWA001";
  try{ nextId = await SC.makeStudentId(); }catch(e){}
  const pw = SC.makePassword();

  box.innerHTML = `
    <h2>＋ 生徒追加</h2>
    <p class="help">登録後、生徒はこのIDとパスワードでログインできます。</p>
    <label>生徒ID</label><input id="newStudentId" value="${nextId}">
    <label>初期パスワード</label><input id="newStudentPassword" value="${pw}">
    <label>氏名</label><input id="newStudentName" placeholder="例：山田太郎">
    <label>学校</label><input id="newStudentSchool" placeholder="例：大府高校">
    <label>学年</label><input id="newStudentGrade" placeholder="例：高3">
    <label>志望校</label><input id="newStudentTarget" placeholder="例：名古屋大学 工学部">
    <button class="btn primary" onclick="SC.createStudent()">登録</button>
    <p id="createStudentMsg" class="help"></p>`;
};

SC.createStudent = async function(){
  const id = document.getElementById("newStudentId")?.value?.trim();
  const pw = document.getElementById("newStudentPassword")?.value?.trim();
  const name = document.getElementById("newStudentName")?.value?.trim();
  const school = document.getElementById("newStudentSchool")?.value?.trim();
  const grade = document.getElementById("newStudentGrade")?.value?.trim();
  const target = document.getElementById("newStudentTarget")?.value?.trim();
  const msg = document.getElementById("createStudentMsg");

  if(!id || !pw || !name){
    if(msg) msg.textContent = "生徒ID・パスワード・氏名は必須です。";
    return;
  }

  try{
    if(msg) msg.textContent = "登録中...";
    const created = await createStudentAuthAccount(id, pw);

    const { db, doc, setDoc, serverTimestamp } = window.SCFB;
    const studentKey = id.toLowerCase().replace(/\s+/g,"");

    const data = {
      role:"student",
      studentId:id,
      loginId:studentKey,
      email:created.email,
      initialPassword:pw,
      name,
      school:school || "",
      grade:grade || "",
      targetUniversity:target || "",
      createdBy:SC.currentUser?.uid || "",
      createdAt:serverTimestamp(),
      authEnabled:true
    };

    await setDoc(doc(db, "students", created.uid), data);
    await setDoc(doc(db, "users", created.uid), data);

    if(msg) msg.innerHTML = `登録しました。<br>生徒ID：<b>${id}</b><br>初期PW：<b>${pw}</b>`;
    await SC.loadStudents();
  }catch(e){
    let text = "登録できませんでした。";
    if(e?.code === "auth/email-already-in-use") text = "この生徒IDはすでにログイン有効化されています。";
    if(e?.code === "auth/weak-password") text = "パスワードは6文字以上にしてください。";
    if(msg) msg.textContent = text;
    console.error(e);
  }
};

SC.enableStudentLogin = async function(uid, studentId, password, name){
  try{
    const created = await createStudentAuthAccount(studentId, password || "123456");
    const { db, doc, getDoc, setDoc, deleteDoc, serverTimestamp } = window.SCFB;
    const oldSnap = await getDoc(doc(db, "users", uid));
    const oldData = oldSnap.exists() ? oldSnap.data() : {};

    const data = {
      ...oldData,
      role:"student",
      studentId,
      email: created.email,
      initialPassword: password || "123456",
      authEnabled:true,
      authUid: created.uid,
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, "users", created.uid), data);
    await setDoc(doc(db, "students", created.uid), data);
    if(uid !== created.uid){
      await deleteDoc(doc(db, "users", uid));
    }
    alert(`${name || studentId} のログインを有効化しました。`);
    await SC.loadStudents();
  }catch(e){
    alert("有効化できませんでした。IDが既に使われている可能性があります。");
    console.error(e);
  }
};

SC.loadStudents = async function(){
  const list = document.getElementById("studentsList");
  if(!list) return;
  try{
    const { students, logs } = await SC.getAllStudentsAndLogs();
    students.sort((a,b)=>String(a.studentId||"").localeCompare(String(b.studentId||"")));
    if(!students.length){ list.innerHTML = `<div class="box">まだ生徒がいません。</div>`; return; }

    const today = todayStr(), weekStart = dateDaysAgo(6), month = ymStr();

    list.innerHTML = students.map(s=>{
      const myLogs = logs.filter(l=>l.uid === s.uid);
      const todayMin = myLogs.filter(l=>l.date===today).reduce((a,l)=>a+Number(l.minutes||0),0);
      const weekMin = myLogs.filter(l=>String(l.date||"")>=weekStart).reduce((a,l)=>a+Number(l.minutes||0),0);
      const monthMin = myLogs.filter(l=>String(l.date||"").startsWith(month)).reduce((a,l)=>a+Number(l.minutes||0),0);
      const pw = s.initialPassword || "123456";
      return `
      <div class="box">
        <h2>${safeText(s.name || "名前未設定")}</h2>
        <p>
          生徒ID：${safeText(s.studentId || "-")}<br>
          学校：${safeText(s.school || "-")} / 学年：${safeText(s.grade || "-")}<br>
          志望校：${safeText(s.targetUniversity || "-")}<br>
          ログイン：${s.authEnabled ? "有効" : "未設定"}<br>
          初期PW：${safeText(s.initialPassword || "-")}<br>
          今日：${todayMin}分 / 直近7日：${weekMin}分 / 今月：${monthMin}分
        </p>
        <div class="actions">
          ${s.authEnabled ? "" : `<button class="btn navy" onclick="SC.enableStudentLogin('${s.uid}','${safeText(s.studentId || "")}','${safeText(pw)}','${String(s.name||"").replace(/'/g,"")}')">ログイン有効化</button>`}
          <button class="btn primary" onclick="SC.renderAddStudyForStudent('${s.uid}','${String(s.name||"").replace(/'/g,"")}')">記録追加</button>
          <button class="btn light" onclick="SC.showStudentLogs('${s.uid}','${String(s.name||"").replace(/'/g,"")}')">記録を見る</button>
        </div>
      </div>`;
    }).join("");
  }catch(e){
    list.innerHTML = `<div class="box">読み込み失敗。Firestoreルールを確認してください。</div>`;
    console.error(e);
  }
};

SC.renderAddStudyForStudent = function(uid, name){
  const box = document.getElementById("teacherBox");
  const today = todayStr();
  box.innerHTML = `
    <h2>📚 ${safeText(name || "生徒")} の勉強記録を追加</h2>
    <label>日付</label><input id="teacherStudyDate" type="date" value="${today}">
    <label>教科</label>
    <select id="teacherStudySubject"><option>英語</option><option>数学</option><option>国語</option><option>理科</option><option>社会</option><option>情報</option><option>その他</option></select>
    <label>時間（分）</label><input id="teacherStudyMinutes" type="number" min="1" placeholder="例：60">
    <label>メモ</label><textarea id="teacherStudyMemo" placeholder="例：英単語、数学IA、物理など"></textarea>
    <button class="btn primary" onclick="SC.saveStudyForStudent('${uid}','${String(name||"").replace(/'/g,"")}')">保存</button>
    <p id="teacherStudyMsg" class="help"></p>`;
};

SC.saveStudyForStudent = async function(uid, name){
  const date = document.getElementById("teacherStudyDate")?.value;
  const subject = document.getElementById("teacherStudySubject")?.value;
  const minutes = Number(document.getElementById("teacherStudyMinutes")?.value || 0);
  const memo = document.getElementById("teacherStudyMemo")?.value || "";
  const msg = document.getElementById("teacherStudyMsg");
  if(!date || !subject || minutes <= 0){ if(msg) msg.textContent = "日付・教科・時間を入力してください。"; return; }

  try{
    const { db, collection, addDoc, serverTimestamp } = window.SCFB;
    await addDoc(collection(db, "studyLogs"), {
      uid, studentName:name || "", date, subject, minutes, memo,
      inputBy:"teacher", createdBy:SC.currentUser?.uid || "",
      createdAt:serverTimestamp(), updatedAt:serverTimestamp()
    });
    if(msg) msg.textContent = "保存しました。";
    await SC.showStudentLogs(uid, name);
  }catch(e){
    if(msg) msg.textContent = "保存できませんでした。";
    console.error(e);
  }
};

SC.showStudentLogs = async function(uid, name){
  const box = document.getElementById("teacherBox");
  try{
    const { db, collection, getDocs, query, where } = window.SCFB;
    const q = query(collection(db, "studyLogs"), where("uid","==",uid));
    const snap = await getDocs(q);
    const logs = [];
    snap.forEach(d=>logs.push({id:d.id, ...d.data()}));
    logs.sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")));
    const total = logs.reduce((sum,l)=>sum+Number(l.minutes||0),0);
    box.innerHTML = `
      <h2>📚 ${safeText(name || "生徒")} の記録</h2>
      <p><b>合計：</b>${total}分 / ${logs.length}件</p>
      <button class="btn primary" onclick="SC.renderAddStudyForStudent('${uid}','${String(name||"").replace(/'/g,"")}')">記録を追加</button>
      <h3>最近の記録</h3>
      ${logs.length ? logs.slice(0,30).map(l=>`
        <div class="box">
          ${safeText(l.date||"")} / ${safeText(l.subject||"")} / ${Number(l.minutes||0)}分<br>
          <span class="help">${safeText(l.memo||"")}</span>
          <div class="actions">
            <button class="btn light" onclick="SC.renderEditStudyLog('${l.id}','${uid}','${String(name||"").replace(/'/g,"")}')">編集</button>
            <button class="btn light" onclick="SC.deleteStudyLog('${l.id}','${uid}','${String(name||"").replace(/'/g,"")}')">削除</button>
          </div>
        </div>`).join("") : "まだ学習記録はありません。"}`;
  }catch(e){
    box.innerHTML = "学習記録を読み込めませんでした。";
    console.error(e);
  }
};

SC.renderEditStudyLog = async function(logId, uid, name){
  const box = document.getElementById("teacherBox");
  try{
    const { db, doc, getDoc } = window.SCFB;
    const snap = await getDoc(doc(db, "studyLogs", logId));
    if(!snap.exists()){ box.innerHTML = "記録が見つかりません。"; return; }
    const l = snap.data();
    box.innerHTML = `
      <h2>✏️ 学習記録を編集</h2>
      <label>日付</label><input id="editStudyDate" type="date" value="${safeText(l.date || todayStr())}">
      <label>教科</label>
      <select id="editStudySubject">${["英語","数学","国語","理科","社会","情報","その他"].map(s=>`<option ${s===(l.subject||"")?"selected":""}>${s}</option>`).join("")}</select>
      <label>時間（分）</label><input id="editStudyMinutes" type="number" min="1" value="${Number(l.minutes || 0)}">
      <label>メモ</label><textarea id="editStudyMemo">${safeText(l.memo || "")}</textarea>
      <div class="actions">
        <button class="btn primary" onclick="SC.updateStudyLog('${logId}','${uid}','${String(name||"").replace(/'/g,"")}')">保存</button>
        <button class="btn light" onclick="SC.showStudentLogs('${uid}','${String(name||"").replace(/'/g,"")}')">戻る</button>
      </div>
      <p id="editStudyMsg" class="help"></p>`;
  }catch(e){ box.innerHTML = "編集画面を開けませんでした。"; console.error(e); }
};

SC.updateStudyLog = async function(logId, uid, name){
  const msg = document.getElementById("editStudyMsg");
  try{
    const { db, doc, updateDoc, serverTimestamp } = window.SCFB;
    await updateDoc(doc(db, "studyLogs", logId), {
      date:document.getElementById("editStudyDate").value,
      subject:document.getElementById("editStudySubject").value,
      minutes:Number(document.getElementById("editStudyMinutes").value || 0),
      memo:document.getElementById("editStudyMemo").value || "",
      updatedAt:serverTimestamp(),
      updatedBy:SC.currentUser?.uid || ""
    });
    if(msg) msg.textContent = "更新しました。";
    await SC.showStudentLogs(uid, name);
  }catch(e){ if(msg) msg.textContent = "更新できませんでした。"; console.error(e); }
};

SC.deleteStudyLog = async function(logId, uid, name){
  if(!confirm("この学習記録を削除しますか？")) return;
  try{
    const { db, doc, deleteDoc } = window.SCFB;
    await deleteDoc(doc(db, "studyLogs", logId));
    await SC.showStudentLogs(uid, name);
  }catch(e){ alert("削除できませんでした。"); console.error(e); }
};

SC.renderTeacherRanking = async function(){
  const box = document.getElementById("teacherBox");
  const list = document.getElementById("studentsList");
  if(!box || !list){ SC.renderTeacherDashboard(); return; }
  box.innerHTML = `<h2>🏆 学習時間ランキング</h2><p class="help">今日・直近7日・今月を確認できます。</p>`;
  try{
    const { students, logs } = await SC.getAllStudentsAndLogs();
    const today = todayStr(); const weekStart = dateDaysAgo(6); const month = ymStr();
    const names = {}; students.forEach(s=>names[s.uid]=s.name||s.studentId||s.uid);
    function makeRanking(filterFn, title){
      const totals = {};
      logs.filter(filterFn).forEach(l=>{ totals[l.uid]=(totals[l.uid]||0)+Number(l.minutes||0); });
      const ranking = Object.entries(totals).map(([uid,minutes])=>({uid,name:names[uid]||uid,minutes})).sort((a,b)=>b.minutes-a.minutes);
      return `<h2>${title}</h2>` + (ranking.length ? ranking.map((r,i)=>`
        <div class="box"><b>${i+1}位　${safeText(r.name)}</b><br>${r.minutes}分（${Math.round(r.minutes/60*10)/10}時間）
        <div><button class="btn light" onclick="SC.showStudentLogs('${r.uid}','${String(r.name||"").replace(/'/g,"")}')">詳細</button></div></div>`).join("") : `<div class="box">記録なし</div>`);
    }
    list.innerHTML = makeRanking(l=>l.date===today,"今日") + makeRanking(l=>String(l.date||"")>=weekStart,"直近7日") + makeRanking(l=>String(l.date||"").startsWith(month),"今月");
  }catch(e){ list.innerHTML = `<div class="box">ランキングを読み込めませんでした。</div>`; console.error(e); }
};
