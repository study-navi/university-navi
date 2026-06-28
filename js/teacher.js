// 進学コンパス Ver.9 先生管理画面強化版
// 生徒ID自動発行・生徒別勉強記録・ランキング対応

const SC = window.SC || (window.SC = {});

SC.renderTeacherDashboard = async function(){
  SC.closeMenu?.();
  if(!SC.currentUser){ SC.renderLogin(); return; }

  document.getElementById("app").innerHTML = `
  <section class="card">
    <h1>👨‍🏫 先生画面</h1>
    <p class="help">生徒管理・学習記録確認の管理画面です。</p>

    <div class="actions">
      <button class="btn primary" onclick="SC.renderAddStudent()">＋ 生徒追加</button>
      <button class="btn navy" onclick="SC.loadStudents()">生徒一覧</button>
      <button class="btn navy" onclick="SC.renderTeacherRanking()">ランキング</button>
      <button class="btn light" onclick="SC.logout()">ログアウト</button>
    </div>

    <div id="teacherBox" class="box">読み込み中...</div>
    <div id="studentsList"></div>
  </section>`;

  await SC.loadStudents();
};

SC.makeStudentId = async function(){
  const { db, collection, getDocs, query, where } = window.SCFB;
  const q = query(collection(db, "users"), where("role", "==", "student"));
  const snap = await getDocs(q);
  const next = snap.size + 1;
  return "KYOWA" + String(next).padStart(3, "0");
};

SC.makePassword = function(){
  return String(Math.floor(100000 + Math.random() * 900000));
};

SC.renderAddStudent = async function(){
  const box = document.getElementById("teacherBox");
  if(!box) return;

  let nextId = "KYOWA001";
  try { nextId = await SC.makeStudentId(); } catch(e) {}

  const pw = SC.makePassword();

  box.innerHTML = `
    <h2>＋ 生徒追加</h2>
    <p class="help">生徒管理用データを作成します。生徒本人ログインは次段階で有効化します。</p>

    <label>生徒ID</label>
    <input id="newStudentId" value="${nextId}">

    <label>初期パスワード</label>
    <input id="newStudentPassword" value="${pw}">

    <label>氏名</label>
    <input id="newStudentName" placeholder="例：山田太郎">

    <label>学校</label>
    <input id="newStudentSchool" placeholder="例：大府高校">

    <label>学年</label>
    <input id="newStudentGrade" placeholder="例：高3">

    <label>志望校</label>
    <input id="newStudentTarget" placeholder="例：名古屋大学 工学部">

    <button class="btn primary" onclick="SC.createStudent()">登録</button>
    <p id="createStudentMsg" class="help"></p>
  `;
};

SC.createStudent = async function(){
  const id = document.getElementById("newStudentId")?.value?.trim();
  const pw = document.getElementById("newStudentPassword")?.value?.trim();
  const name = document.getElementById("newStudentName")?.value?.trim();
  const school = document.getElementById("newStudentSchool")?.value?.trim();
  const grade = document.getElementById("newStudentGrade")?.value?.trim();
  const target = document.getElementById("newStudentTarget")?.value?.trim();
  const msg = document.getElementById("createStudentMsg");

  if(!id || !name){
    if(msg) msg.textContent = "生徒IDと氏名は必須です。";
    return;
  }

  try{
    const { db, doc, setDoc, serverTimestamp } = window.SCFB;
    const studentKey = id.toLowerCase().replace(/\s+/g, "");

    const data = {
      role: "student",
      studentId: id,
      loginId: studentKey,
      initialPassword: pw || "",
      name,
      school: school || "",
      grade: grade || "",
      targetUniversity: target || "",
      createdBy: SC.currentUser?.uid || "",
      createdAt: serverTimestamp(),
      authEnabled: false,
      totalMinutes: 0,
      note: "Ver.9では先生管理用。生徒本人ログインは次段階で有効化。"
    };

    await setDoc(doc(db, "students", studentKey), data);
    await setDoc(doc(db, "users", studentKey), data);

    if(msg) msg.innerHTML = `登録しました。<br>生徒ID：<b>${id}</b><br>初期PW：<b>${pw || "未設定"}</b>`;
    await SC.loadStudents();

  }catch(e){
    if(msg) msg.textContent = "登録できませんでした。Firestoreルールを確認してください。";
    console.error(e);
  }
};

SC.loadStudents = async function(){
  const list = document.getElementById("studentsList");
  const box = document.getElementById("teacherBox");
  if(!list) return;

  try{
    const { db, collection, getDocs, query, where } = window.SCFB;
    const q = query(collection(db, "users"), where("role", "==", "student"));
    const snap = await getDocs(q);

    const students = [];
    snap.forEach(d => students.push({ uid:d.id, ...d.data() }));
    students.sort((a,b) => String(a.studentId || "").localeCompare(String(b.studentId || "")));

    if(box && !box.innerHTML.includes("生徒追加") && !box.innerHTML.includes("ランキング")){
      box.innerHTML = `<b>登録生徒数：</b>${students.length}名`;
    }

    if(!students.length){
      list.innerHTML = `<div class="box">まだ生徒がいません。</div>`;
      return;
    }

    list.innerHTML = students.map(s => `
      <div class="box">
        <h2>${s.name || "名前未設定"}</h2>
        <p>
          生徒ID：${s.studentId || "-"}<br>
          学校：${s.school || "-"}<br>
          学年：${s.grade || "-"}<br>
          志望校：${s.targetUniversity || "-"}<br>
          初期PW：${s.initialPassword || "-"}
        </p>
        <div class="actions">
          <button class="btn primary" onclick="SC.renderAddStudyForStudent('${s.uid}','${String(s.name || "").replace(/'/g,"")}')">記録追加</button>
          <button class="btn light" onclick="SC.showStudentLogs('${s.uid}','${String(s.name || "").replace(/'/g,"")}')">記録を見る</button>
        </div>
      </div>`).join("");

  }catch(e){
    list.innerHTML = `<div class="box">読み込み失敗。Firestoreルールを確認してください。</div>`;
    console.error(e);
  }
};

SC.renderAddStudyForStudent = function(uid, name){
  const box = document.getElementById("teacherBox");
  if(!box) return;

  const today = new Date().toISOString().slice(0,10);
  box.innerHTML = `
    <h2>📚 ${name || "生徒"} の勉強記録を追加</h2>

    <label>日付</label>
    <input id="teacherStudyDate" type="date" value="${today}">

    <label>教科</label>
    <select id="teacherStudySubject">
      <option>英語</option>
      <option>数学</option>
      <option>国語</option>
      <option>理科</option>
      <option>社会</option>
      <option>情報</option>
      <option>その他</option>
    </select>

    <label>時間（分）</label>
    <input id="teacherStudyMinutes" type="number" min="1" placeholder="例：60">

    <label>メモ</label>
    <textarea id="teacherStudyMemo" placeholder="例：英単語、数学IA、物理など"></textarea>

    <button class="btn primary" onclick="SC.saveStudyForStudent('${uid}','${String(name || "").replace(/'/g,"")}')">保存</button>
    <p id="teacherStudyMsg" class="help"></p>
  `;
};

SC.saveStudyForStudent = async function(uid, name){
  const date = document.getElementById("teacherStudyDate")?.value;
  const subject = document.getElementById("teacherStudySubject")?.value;
  const minutes = Number(document.getElementById("teacherStudyMinutes")?.value || 0);
  const memo = document.getElementById("teacherStudyMemo")?.value || "";
  const msg = document.getElementById("teacherStudyMsg");

  if(!date || !subject || minutes <= 0){
    if(msg) msg.textContent = "日付・教科・時間を入力してください。";
    return;
  }

  try{
    const { db, collection, addDoc, serverTimestamp } = window.SCFB;

    await addDoc(collection(db, "studyLogs"), {
      uid,
      studentName: name || "",
      date,
      subject,
      minutes,
      memo,
      inputBy: "teacher",
      createdBy: SC.currentUser?.uid || "",
      createdAt: serverTimestamp()
    });

    if(msg) msg.textContent = "保存しました。";
    await SC.showStudentLogs(uid, name);

  }catch(e){
    if(msg) msg.textContent = "保存できませんでした。Firestoreルールを確認してください。";
    console.error(e);
  }
};

SC.showStudentLogs = async function(uid, name){
  const box = document.getElementById("teacherBox");
  if(!box) return;

  try{
    const { db, collection, getDocs, query, where } = window.SCFB;
    const q = query(collection(db, "studyLogs"), where("uid", "==", uid));
    const snap = await getDocs(q);

    const logs = [];
    snap.forEach(d => logs.push({id:d.id, ...d.data()}));
    logs.sort((a,b) => String(b.date || "").localeCompare(String(a.date || "")));

    const total = logs.reduce((sum,l)=>sum + Number(l.minutes || 0), 0);
    const bySubject = {};
    logs.forEach(l => bySubject[l.subject || "その他"] = (bySubject[l.subject || "その他"] || 0) + Number(l.minutes || 0));

    box.innerHTML = `
      <h2>📚 ${name || "生徒"} の記録</h2>
      <p><b>合計：</b>${total}分 / ${logs.length}件</p>
      <div class="grid two">
        ${Object.entries(bySubject).map(([s,m]) => `<div class="box"><b>${s}</b><br>${m}分</div>`).join("")}
      </div>
      <button class="btn primary" onclick="SC.renderAddStudyForStudent('${uid}','${String(name || "").replace(/'/g,"")}')">記録を追加</button>
      <h3>最近の記録</h3>
      ${logs.length ? logs.slice(0,20).map(l => `
        <div class="box">
          ${l.date || ""} / ${l.subject || ""} / ${l.minutes || 0}分<br>
          <span class="help">${l.memo || ""}</span>
        </div>`).join("") : "まだ学習記録はありません。"}
    `;

  }catch(e){
    box.innerHTML = "学習記録を読み込めませんでした。";
    console.error(e);
  }
};

SC.renderTeacherRanking = async function(){
  const box = document.getElementById("teacherBox");
  const list = document.getElementById("studentsList");
  if(!box || !list) return;

  box.innerHTML = `<h2>🏆 学習時間ランキング</h2><p class="help">登録されている学習記録の合計時間です。</p>`;

  try{
    const { db, collection, getDocs } = window.SCFB;
    const logsSnap = await getDocs(collection(db, "studyLogs"));
    const usersSnap = await getDocs(collection(db, "users"));

    const names = {};
    usersSnap.forEach(d => {
      const u = d.data();
      if(u.role === "student") names[d.id] = u.name || u.studentId || d.id;
    });

    const totals = {};
    logsSnap.forEach(d => {
      const l = d.data();
      const uid = l.uid || "";
      totals[uid] = (totals[uid] || 0) + Number(l.minutes || 0);
    });

    const ranking = Object.entries(totals)
      .map(([uid, minutes]) => ({ uid, name: names[uid] || uid, minutes }))
      .sort((a,b) => b.minutes - a.minutes);

    if(!ranking.length){
      list.innerHTML = `<div class="box">まだランキングに表示できる学習記録がありません。</div>`;
      return;
    }

    list.innerHTML = ranking.map((r,i) => `
      <div class="box">
        <h2>${i+1}位　${r.name}</h2>
        <p><b>${r.minutes}分</b>（${Math.round(r.minutes/60*10)/10}時間）</p>
        <button class="btn light" onclick="SC.showStudentLogs('${r.uid}','${String(r.name || "").replace(/'/g,"")}')">詳細を見る</button>
      </div>
    `).join("");

  }catch(e){
    list.innerHTML = `<div class="box">ランキングを読み込めませんでした。Firestoreルールを確認してください。</div>`;
    console.error(e);
  }
};
