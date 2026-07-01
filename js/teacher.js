const SC = window.SC || (window.SC = {});



/* Ver.19 先生カルテ */
SC.daysUntil = function(dateStr){
  if(!dateStr) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const target = new Date(dateStr + "T00:00:00");
  if(Number.isNaN(target.getTime())) return null;
  return Math.ceil((target - today)/(1000*60*60*24));
};
SC.getStudentLogs = async function(uid){
  const {db,collection,getDocs,query,where}=window.SCFB;
  const q=query(collection(db,"studyLogs"),where("uid","==",uid));
  const snap=await getDocs(q); const logs=[];
  snap.forEach(d=>logs.push({id:d.id,...d.data()}));
  logs.sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")));
  return logs;
};
SC.getStudentTests = async function(uid){
  const {db,collection,getDocs,query,where}=window.SCFB;
  const q=query(collection(db,"testRecords"),where("uid","==",uid));
  const snap=await getDocs(q); const tests=[];
  snap.forEach(d=>tests.push({id:d.id,...d.data()}));
  tests.sort((a,b)=>String(b.testDate||"").localeCompare(String(a.testDate||"")));
  return tests;
};
SC.studySummary = function(logs){
  const today = new Date().toISOString().slice(0,10);
  const d = new Date(); d.setDate(d.getDate()-6);
  const weekStart = d.toISOString().slice(0,10);
  const month = today.slice(0,7);
  return {
    today: logs.filter(l=>l.date===today).reduce((s,l)=>s+Number(l.minutes||0),0),
    week: logs.filter(l=>String(l.date||"")>=weekStart).reduce((s,l)=>s+Number(l.minutes||0),0),
    month: logs.filter(l=>String(l.date||"").startsWith(month)).reduce((s,l)=>s+Number(l.minutes||0),0),
    total: logs.reduce((s,l)=>s+Number(l.minutes||0),0)
  };
};
SC.subjectStudySummary = function(logs){
  const map={}; logs.forEach(l=>{const s=l.subject||"その他"; map[s]=(map[s]||0)+Number(l.minutes||0);});
  return Object.entries(map).sort((a,b)=>b[1]-a[1]);
};
SC.makeRuleAdvice = function(student, logs, tests){
  const advice=[]; const sum=SC.studySummary(logs); const subjectTimes=SC.subjectStudySummary(logs);
  if(sum.week < 300) advice.push("直近7日の学習時間が少なめです。まずは1日60分以上の記録を目標にしましょう。");
  if(sum.today === 0) advice.push("今日はまだ学習記録がありません。短時間でも記録を残すと継続しやすくなります。");
  const latest = tests[0];
  if(latest?.subjects){
    const weak=[]; Object.entries(latest.subjects).forEach(([name,v])=>{ if(v?.weak || v?.wrong || (v?.score && Number(v.score)<50)) weak.push(name); });
    if(weak.length) advice.push(`直近のテストでは「${weak.slice(0,3).join("・")}」の復習優先度が高いです。`);
  }
  if(subjectTimes.length){
    const min=subjectTimes[subjectTimes.length-1], max=subjectTimes[0];
    if(max[1] >= min[1]*3 && min[1] < 120) advice.push(`学習時間が「${max[0]}」に偏っています。「${min[0]}」も少し増やすとバランスが良くなります。`);
  }
  const days=SC.daysUntil(student.firstExamDate);
  if(days!==null && days<=60) advice.push(`第一志望の試験まであと${days}日です。過去のミスの復習を優先しましょう。`);
  else if(days!==null && days<=180) advice.push(`第一志望の試験まであと${days}日です。苦手単元を今のうちに潰す時期です。`);
  return advice.length ? advice : ["大きな偏りはありません。今の記録を継続し、次のテスト結果で優先順位を調整しましょう。"];
};
SC.renderTeacherTestCard = function(t){
  const subjects=t.subjects||{};
  const scores=Object.entries(subjects).filter(([_,v])=>v&&(v.score||v.deviation||v.weak||v.wrong)).map(([s,v])=>`<span class="pill">${s}：${v.score||"-"}点</span>`).join("");
  const links=[]; for(const arr of Object.values(t.attachments||{})){ if(Array.isArray(arr)) for(const f of arr) links.push(`<a href="${f.url}" target="_blank">${f.name}</a>`); }
  return `<div class="testCard"><h3>${t.testName||t.type||"テスト"}</h3><p>${t.testDate||""} / ${t.type||""}<br>判定：${t.judgement||"-"} / 偏差値：${t.deviation||"-"}</p><div>${scores||"<span class='help'>科目点未入力</span>"}</div>${t.analysisMemo?`<p class="help">${t.analysisMemo}</p>`:""}${links.length?`<div class="box">${links.join("<br>")}</div>`:""}</div>`;
};
SC.renderStudentKarte = async function(uid){
  SC.pushHistory?.("renderStudentKarte");
  document.getElementById("app").innerHTML=`<section class="card"><h1>👤 生徒カルテ</h1><div id="karteBox" class="box">読み込み中...</div></section>`;
  const box=document.getElementById("karteBox");
  try{
    const {db,doc,getDoc}=window.SCFB;
    const snap=await getDoc(doc(db,"users",uid));
    if(!snap.exists()){box.textContent="生徒情報が見つかりません。";return;}
    const student={uid:snap.id,...snap.data()};
    const logs=await SC.getStudentLogs(uid);
    const tests=await SC.getStudentTests(uid);
    const sum=SC.studySummary(logs), subj=SC.subjectStudySummary(logs), advice=SC.makeRuleAdvice(student,logs,tests), days=SC.daysUntil(student.firstExamDate);
    box.innerHTML=`
      <div class="karteHeader"><h2>${student.name||"名前未設定"}</h2><p>生徒ID：${student.studentId||"-"}<br>学校：${student.school||"-"} / 学年：${student.grade||"-"}<br>第一志望：${student.targetUniversity||"-"}<br>試験日：${student.firstExamDate||"-"} ${days!==null?`/ あと${days}日`:""}</p></div>
      <h2>📚 学習状況</h2><div class="statGrid"><div class="statBox"><b>今日</b><span>${sum.today}</span>分</div><div class="statBox"><b>直近7日</b><span>${sum.week}</span>分</div><div class="statBox"><b>今月</b><span>${sum.month}</span>分</div><div class="statBox"><b>合計</b><span>${sum.total}</span>分</div></div>
      <h2>🤖 ルールベースアドバイス</h2><div class="adviceBox">${advice.map(a=>`<div class="todoItem">✅ <div>${a}</div></div>`).join("")}</div>
      <h2>📊 教科別学習時間</h2>${subj.length?subj.map(([s,m])=>`<span class="pill">${s}：${m}分</span>`).join(""):"<div class='box'>記録がありません。</div>"}
      <h2>🧾 テスト・模試一覧</h2>${tests.length?tests.map(t=>SC.renderTeacherTestCard(t)).join(""):"<div class='box'>まだテスト記録がありません。</div>"}
      <h2>📝 最近の学習記録</h2>${logs.slice(0,8).map(l=>`<div class="box"><b>${l.date||""} ${l.subject||""} ${l.minutes||0}分</b><br><span class="help">${l.memo||""}</span></div>`).join("") || "<div class='box'>記録がありません。</div>"}
    `;
  }catch(e){ box.textContent="読み込めませんでした。"; console.error(e); }
  SC.updateBackButton?.();
};
SC.loadStudents = async function(){
  const list=document.getElementById("studentsList"); if(!list) return;
  const {students}=await SC.getAllStudentsAndLogs();
  list.innerHTML = students.length ? students.map(s=>`<div class="box clickable" onclick="SC.renderStudentKarte('${s.uid}')"><h2>${s.name||"名前未設定"}</h2><p>生徒ID：${s.studentId||"-"}<br>学校：${s.school||"-"} / 学年：${s.grade||"-"}<br>第一志望：${s.targetUniversity||"-"}<br>試験日：${s.firstExamDate||"-"}</p><span class="pill">タップして詳細</span></div>`).join("") : `<div class="box">まだ生徒がいません。</div>`;
};
