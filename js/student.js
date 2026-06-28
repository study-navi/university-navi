// 進学コンパス Ver.14.1 生徒マイページ・第一志望保存修正版

const SC = window.SC || (window.SC = {});

function todayStr(){
  return new Date().toISOString().slice(0,10);
}

function dateDaysAgo(n){
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0,10);
}

function ymStr(){
  return new Date().toISOString().slice(0,7);
}

function safeText(v){
  return String(v ?? "").replace(/[<>&]/g, s => ({ "<":"&lt;", ">":"&gt;", "&":"&amp;" }[s]));
}

function daysUntil(dateStr){
  if(!dateStr) return null;
  const today = new Date();
  today.setHours(0,0,0,0);
  const target = new Date(dateStr + "T00:00:00");
  if(Number.isNaN(target.getTime())) return null;
  return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

SC.commonTestDate = "2027-01-16";

SC.renderStudentDashboard = async function(){
  SC.closeMenu?.();
  if(!SC.currentUser){
    SC.renderLogin?.();
    return;
  }

  const app = document.getElementById("app");
  if(!app) return;

  app.innerHTML = `
  <section class="card">
    <h1>👤 マイページ</h1>
    <p class="help">学習状況・受験までの日数・最近の記録を確認できます。</p>
    <div id="studentDashboardBox" class="box">読み込み中...</div>
  </section>`;

  await SC.loadStudentDashboard();
};

SC.reloadMyProfile = async function(){
  if(!SC.currentUser) return null;
  const { db, doc, getDoc } = window.SCFB;
  const snap = await getDoc(doc(db, "users", SC.currentUser.uid));
  if(snap.exists()){
    SC.currentProfile = { id: snap.id, ...snap.data() };
  }
  return SC.currentProfile;
};

SC.loadStudentDashboard = async function(){
  const box = document.getElementById("studentDashboardBox");
  if(!box || !SC.currentUser) return;

  try{
    const profile = await SC.reloadMyProfile() || {};
    const logs = await SC.getMyStudyLogs();

    const today = todayStr();
    const weekStart = dateDaysAgo(6);
    const month = ymStr();

    const todayMin = logs.filter(l => l.date === today).reduce((s,l)=>s+Number(l.minutes||0),0);
    const weekMin = logs.filter(l => String(l.date||"") >= weekStart).reduce((s,l)=>s+Number(l.minutes||0),0);
    const monthMin = logs.filter(l => String(l.date||"").startsWith(month)).reduce((s,l)=>s+Number(l.minutes||0),0);
    const totalMin = logs.reduce((s,l)=>s+Number(l.minutes||0),0);

    const bySubject = {};
    logs.forEach(l => {
      bySubject[l.subject || "その他"] = (bySubject[l.subject || "その他"] || 0) + Number(l.minutes || 0);
    });

    const commonDays = daysUntil(SC.commonTestDate);
    const firstExamDate = profile.firstExamDate || "";
    const firstExamDays = daysUntil(firstExamDate);

    const candidates = [
      "名古屋大学", "名古屋市立大学", "愛知教育大学", "愛知県立大学",
      "南山大学", "中京大学", "名城大学", "愛知大学", "愛知学院大学",
      "藤田医科大学", "日本福祉大学", "愛知淑徳大学", "椙山女学園大学",
      "金城学院大学", "岐阜大学", "三重大学", "静岡大学"
    ];

    box.innerHTML = `
      <h2>${safeText(profile.name || "生徒")} さん</h2>
      <p>
        生徒ID：${safeText(profile.studentId || "-")}<br>
        学校：${safeText(profile.school || "-")} / 学年：${safeText(profile.grade || "-")}<br>
        第一志望：${safeText(profile.targetUniversity || "-")}
      </p>

      <h2>⏳ 受験カウントダウン</h2>
      <div class="grid two">
        <div class="box">
          <b>共通テストまで</b><br>
          <span style="font-size:28px;font-weight:900;">${commonDays === null ? "-" : commonDays}</span> 日<br>
          <span class="help">${SC.commonTestDate}</span>
        </div>
        <div class="box">
          <b>第一志望の試験まで</b><br>
          <span style="font-size:28px;font-weight:900;">${firstExamDays === null ? "-" : firstExamDays}</span> 日<br>
          <span class="help">${firstExamDate || "未設定"}</span>
        </div>
      </div>

      <div class="box">
        <h3>🎯 第一志望・試験日設定</h3>
        <p class="help">大学名を入力し、試験日を設定するとカウントダウンに反映されます。</p>

        <label>第一志望</label>
        <input id="studentTargetUniversity" list="universityCandidateList" value="${safeText(profile.targetUniversity || "")}" placeholder="例：名古屋市立大学">
        <datalist id="universityCandidateList">
          ${candidates.map(u => `<option value="${u}"></option>`).join("")}
        </datalist>

        <label>第一志望の試験日</label>
        <input id="studentFirstExamDate" type="date" value="${safeText(firstExamDate || "")}">

        <div class="actions">
          <button class="btn primary" onclick="SC.saveStudentGoal()">保存</button>
          <button class="btn light" onclick="SC.clearStudentGoal()">クリア</button>
        </div>
        <p id="studentGoalMsg" class="help"></p>
      </div>

      <h2>📊 学習サマリー</h2>
      <div class="grid two">
        <div class="box"><b>今日</b><br>${todayMin}分</div>
        <div class="box"><b>直近7日</b><br>${weekMin}分</div>
        <div class="box"><b>今月</b><br>${monthMin}分</div>
        <div class="box"><b>合計</b><br>${totalMin}分</div>
      </div>

      <h2>📚 教科別</h2>
      <div class="grid two">
        ${Object.keys(bySubject).length ? Object.entries(bySubject).map(([s,m]) => `
          <div class="box"><b>${safeText(s)}</b><br>${m}分</div>
        `).join("") : `<div class="box">まだ記録がありません。</div>`}
      </div>

      <div class="actions">
        <button class="btn primary" onclick="SC.renderStudyForm()">勉強記録を入力</button>
        <button class="btn navy" onclick="SC.loadMyStudyLogs()">記録一覧を見る</button>
      </div>

      <h2>📝 最近の記録</h2>
      ${logs.length ? logs.slice(0,5).map(l => SC.studyLogCard(l, true)).join("") : `<div class="box">まだ学習記録がありません。</div>`}
    `;
  }catch(e){
    box.innerHTML = "マイページを読み込めませんでした。";
    console.error(e);
  }
};

SC.saveStudentGoal = async function(){
  if(!SC.currentUser) return;

  const targetUniversity = document.getElementById("studentTargetUniversity")?.value?.trim() || "";
  const firstExamDate = document.getElementById("studentFirstExamDate")?.value || "";
  const msg = document.getElementById("studentGoalMsg");

  try{
    const { db, doc, setDoc, serverTimestamp } = window.SCFB;

    const payload = {
      targetUniversity,
      firstExamDate,
      updatedAt: serverTimestamp()
    };

    await setDoc(doc(db, "users", SC.currentUser.uid), payload, { merge:true });
    await setDoc(doc(db, "students", SC.currentUser.uid), payload, { merge:true });

    SC.currentProfile = {
      ...(SC.currentProfile || {}),
      ...payload
    };

    if(msg) msg.textContent = "保存しました。カウントダウンに反映します。";
    await SC.loadStudentDashboard();
  }catch(e){
    if(msg) msg.textContent = "保存できませんでした。Firestore Rules を確認してください。";
    console.error(e);
  }
};

SC.clearStudentGoal = async function(){
  document.getElementById("studentTargetUniversity").value = "";
  document.getElementById("studentFirstExamDate").value = "";
  await SC.saveStudentGoal();
};

SC.renderStudyForm = function(){
  SC.closeMenu?.();
  if(!SC.currentUser){
    SC.renderLogin?.();
    return;
  }

  const app = document.getElementById("app");
  if(!app) return;

  const today = todayStr();

  app.innerHTML = `
  <section class="card">
    <h1>📚 勉強記録</h1>
    <p class="help">今日の学習を記録しましょう。</p>
    <div class="box">
      <label>日付</label>
      <input id="studyDate" type="date" value="${today}">

      <label>教科</label>
      <select id="studySubject">
        <option>英語</option>
        <option>数学</option>
        <option>国語</option>
        <option>理科</option>
        <option>社会</option>
        <option>情報</option>
        <option>その他</option>
      </select>

      <label>時間（分）</label>
      <input id="studyMinutes" type="number" min="1" placeholder="例：60">

      <label>メモ</label>
      <textarea id="studyMemo" placeholder="例：英単語100個、数学IA 二次関数"></textarea>

      <div class="actions">
        <button class="btn primary" onclick="SC.saveStudyLog()">保存</button>
        <button class="btn light" onclick="SC.renderStudentDashboard()">マイページへ</button>
      </div>
      <p id="studySaveMsg" class="help"></p>
    </div>
  </section>`;
};

SC.saveStudyLog = async function(){
  if(!SC.currentUser){
    SC.renderLogin?.();
    return;
  }

  const date = document.getElementById("studyDate")?.value;
  const subject = document.getElementById("studySubject")?.value;
  const minutes = Number(document.getElementById("studyMinutes")?.value || 0);
  const memo = document.getElementById("studyMemo")?.value || "";
  const msg = document.getElementById("studySaveMsg");

  if(!date || !subject || minutes <= 0){
    if(msg) msg.textContent = "日付・教科・時間を入力してください。";
    return;
  }

  try{
    const { db, collection, addDoc, serverTimestamp } = window.SCFB;
    await addDoc(collection(db, "studyLogs"), {
      uid: SC.currentUser.uid,
      studentName: SC.currentProfile?.name || "",
      studentId: SC.currentProfile?.studentId || "",
      date,
      subject,
      minutes,
      memo,
      inputBy: "student",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    if(msg) msg.textContent = "保存しました。";
    setTimeout(() => SC.renderStudentDashboard(), 500);
  }catch(e){
    if(msg) msg.textContent = "保存できませんでした。";
    console.error(e);
  }
};

SC.getMyStudyLogs = async function(){
  if(!SC.currentUser) return [];
  const { db, collection, getDocs, query, where } = window.SCFB;
  const q = query(collection(db, "studyLogs"), where("uid", "==", SC.currentUser.uid));
  const snap = await getDocs(q);
  const logs = [];
  snap.forEach(d => logs.push({ id:d.id, ...d.data() }));
  logs.sort((a,b) => String(b.date || "").localeCompare(String(a.date || "")));
  return logs;
};

SC.studyLogCard = function(l, compact=false){
  return `
    <div class="box">
      <b>${safeText(l.date || "")}　${safeText(l.subject || "")}　${Number(l.minutes || 0)}分</b><br>
      <span class="help">${safeText(l.memo || "")}</span>
      ${compact ? "" : `
      <div class="actions">
        <button class="btn light" onclick="SC.renderEditMyStudyLog('${l.id}')">編集</button>
        <button class="btn light" onclick="SC.deleteMyStudyLog('${l.id}')">削除</button>
      </div>`}
    </div>`;
};

SC.loadMyStudyLogs = async function(){
  SC.closeMenu?.();
  if(!SC.currentUser){
    SC.renderLogin?.();
    return;
  }

  const app = document.getElementById("app");
  if(!app) return;

  app.innerHTML = `
  <section class="card">
    <h1>📈 自分の学習記録</h1>
    <div id="myStudyLogsBox" class="box">読み込み中...</div>
  </section>`;

  const box = document.getElementById("myStudyLogsBox");

  try{
    const logs = await SC.getMyStudyLogs();

    const today = todayStr();
    const weekStart = dateDaysAgo(6);
    const month = ymStr();

    const todayMin = logs.filter(l => l.date === today).reduce((s,l)=>s+Number(l.minutes||0),0);
    const weekMin = logs.filter(l => String(l.date||"") >= weekStart).reduce((s,l)=>s+Number(l.minutes||0),0);
    const monthMin = logs.filter(l => String(l.date||"").startsWith(month)).reduce((s,l)=>s+Number(l.minutes||0),0);

    box.innerHTML = `
      <h2>📊 まとめ</h2>
      <div class="grid two">
        <div class="box"><b>今日</b><br>${todayMin}分</div>
        <div class="box"><b>直近7日</b><br>${weekMin}分</div>
        <div class="box"><b>今月</b><br>${monthMin}分</div>
        <div class="box"><b>記録数</b><br>${logs.length}件</div>
      </div>

      <div class="actions">
        <button class="btn primary" onclick="SC.renderStudyForm()">記録を追加</button>
        <button class="btn light" onclick="SC.renderStudentDashboard()">マイページへ</button>
      </div>

      <h2>📝 記録一覧</h2>
      ${logs.length ? logs.map(l => SC.studyLogCard(l)).join("") : "まだ学習記録がありません。"}
    `;
  }catch(e){
    box.innerHTML = "学習記録を読み込めませんでした。";
    console.error(e);
  }
};

SC.renderEditMyStudyLog = async function(logId){
  if(!SC.currentUser) return;
  const app = document.getElementById("app");
  if(!app) return;

  try{
    const { db, doc, getDoc } = window.SCFB;
    const snap = await getDoc(doc(db, "studyLogs", logId));
    if(!snap.exists()){
      app.innerHTML = `<section class="card">記録が見つかりません。</section>`;
      return;
    }

    const l = snap.data();

    app.innerHTML = `
    <section class="card">
      <h1>✏️ 学習記録を編集</h1>
      <div class="box">
        <label>日付</label>
        <input id="editStudyDate" type="date" value="${safeText(l.date || todayStr())}">

        <label>教科</label>
        <select id="editStudySubject">
          ${["英語","数学","国語","理科","社会","情報","その他"].map(s => `<option ${s === (l.subject || "") ? "selected" : ""}>${s}</option>`).join("")}
        </select>

        <label>時間（分）</label>
        <input id="editStudyMinutes" type="number" min="1" value="${Number(l.minutes || 0)}">

        <label>メモ</label>
        <textarea id="editStudyMemo">${safeText(l.memo || "")}</textarea>

        <div class="actions">
          <button class="btn primary" onclick="SC.updateMyStudyLog('${logId}')">保存</button>
          <button class="btn light" onclick="SC.loadMyStudyLogs()">戻る</button>
        </div>
        <p id="editStudyMsg" class="help"></p>
      </div>
    </section>`;
  }catch(e){
    app.innerHTML = `<section class="card">編集画面を開けませんでした。</section>`;
    console.error(e);
  }
};

SC.updateMyStudyLog = async function(logId){
  const msg = document.getElementById("editStudyMsg");

  try{
    const { db, doc, updateDoc, serverTimestamp } = window.SCFB;
    await updateDoc(doc(db, "studyLogs", logId), {
      date: document.getElementById("editStudyDate").value,
      subject: document.getElementById("editStudySubject").value,
      minutes: Number(document.getElementById("editStudyMinutes").value || 0),
      memo: document.getElementById("editStudyMemo").value || "",
      updatedAt: serverTimestamp(),
      updatedBy: SC.currentUser?.uid || ""
    });

    if(msg) msg.textContent = "更新しました。";
    setTimeout(() => SC.loadMyStudyLogs(), 500);
  }catch(e){
    if(msg) msg.textContent = "更新できませんでした。";
    console.error(e);
  }
};

SC.deleteMyStudyLog = async function(logId){
  if(!confirm("この学習記録を削除しますか？")) return;

  try{
    const { db, doc, deleteDoc } = window.SCFB;
    await deleteDoc(doc(db, "studyLogs", logId));
    await SC.loadMyStudyLogs();
  }catch(e){
    alert("削除できませんでした。");
    console.error(e);
  }
};

SC.showComingSoon = function(label="この機能"){
  alert(`${label} は準備中です。`);
};
