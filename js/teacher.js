// 進学コンパス Ver.8.2 先生画面・生徒追加安定版
// 生徒追加はFirestore保存だけに変更。先生ログインが切り替わる問題を防ぐ。

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
      <button class="btn light" onclick="SC.logout()">ログアウト</button>
    </div>
    <div id="teacherBox" class="box">準備完了</div>
    <div id="studentsList"></div>
  </section>`;
  await SC.loadStudents();
};

SC.renderAddStudent = function(){
  const box = document.getElementById("teacherBox");
  if(!box) return;
  box.innerHTML = `
    <h2>＋ 生徒追加</h2>
    <p class="help">まずは先生管理用の生徒データとして登録します。生徒本人ログインは次の段階で有効化します。</p>
    <label>生徒ID</label><input id="newStudentId" placeholder="例：KYOWA001">
    <label>初期パスワード</label><input id="newStudentPassword" placeholder="例：0000">
    <label>氏名</label><input id="newStudentName" placeholder="例：山田太郎">
    <label>学校</label><input id="newStudentSchool" placeholder="例：大府高校">
    <label>学年</label><input id="newStudentGrade" placeholder="例：高3">
    <button class="btn primary" onclick="SC.createStudent()">登録</button>
    <p id="createStudentMsg" class="help"></p>`;
};

SC.createStudent = async function(){
  const id = document.getElementById("newStudentId")?.value?.trim();
  const pw = document.getElementById("newStudentPassword")?.value?.trim();
  const name = document.getElementById("newStudentName")?.value?.trim();
  const school = document.getElementById("newStudentSchool")?.value?.trim();
  const grade = document.getElementById("newStudentGrade")?.value?.trim();
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
      targetUniversity: "",
      createdBy: SC.currentUser?.uid || "",
      createdAt: serverTimestamp(),
      authEnabled: false,
      note: "Ver.8.2ではFirestore管理用。生徒本人ログインは次段階で有効化。"
    };

    await setDoc(doc(db, "students", studentKey), data);
    await setDoc(doc(db, "users", studentKey), data);

    if(msg) msg.textContent = "登録しました。";
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

    if(box && !box.innerHTML.includes("生徒追加")){
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
          ログイン有効化：${s.authEnabled ? "有効" : "未設定"}
        </p>
        <button class="btn light" onclick="SC.showStudentLogs('${s.uid}','${String(s.name || "").replace(/'/g,"")}')">記録を見る</button>
      </div>`).join("");
  }catch(e){
    list.innerHTML = `<div class="box">読み込み失敗。Firestoreルールを確認してください。</div>`;
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
    const total = logs.reduce((sum,l)=>sum + Number(l.minutes || 0), 0);

    box.innerHTML = `
      <h2>📚 ${name || "生徒"} の記録</h2>
      <p>合計 ${total}分 / ${logs.length}件</p>
      ${logs.length ? logs.slice(-20).reverse().map(l => `
        <div class="box">${l.date || ""} / ${l.subject || ""} / ${l.minutes || 0}分<br>
        <span class="help">${l.memo || ""}</span></div>`).join("") : "まだ学習記録はありません。"}`;
  }catch(e){
    box.innerHTML = "学習記録を読み込めませんでした。";
    console.error(e);
  }
};
