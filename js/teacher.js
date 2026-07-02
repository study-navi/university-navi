import { initializeApp, deleteApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as secondarySignOut } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";
const SC = window.SC || (window.SC = {});
const safe=v=>String(v??"").replace(/[<>&]/g,s=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[s]));
const today=()=>new Date().toISOString().slice(0,10);
const normPw=p=>{p=String(p||"").trim();return p.length>=6?p:(p.padEnd(6,"0")||"000000")};
async function createStudentAuth(id,pw){const app=initializeApp(window.SCFB_CONFIG,"studentCreate_"+Date.now()),auth=getAuth(app),email=SC.studentIdToEmail(id),pass=normPw(pw);try{const cred=await createUserWithEmailAndPassword(auth,email,pass);await secondarySignOut(auth);await deleteApp(app);return{uid:cred.user.uid,email,password:pass}}catch(e){if(e.code==="auth/email-already-in-use"){const cred=await signInWithEmailAndPassword(auth,email,pass);await secondarySignOut(auth);await deleteApp(app);return{uid:cred.user.uid,email,password:pass}}try{await deleteApp(app)}catch(_){}throw e}}
SC.getAllStudentsAndLogs=async function(){const{db,collection,getDocs,query,where}=window.SCFB;const qs=query(collection(db,"users"),where("role","==","student"));const ss=await getDocs(qs);const students=[];ss.forEach(d=>students.push({uid:d.id,...d.data()}));const ls=await getDocs(collection(db,"studyLogs"));const logs=[];ls.forEach(d=>logs.push({id:d.id,...d.data()}));return{students,logs}};
SC.renderTeacherDashboard=async function(){SC.pushHistory?.("renderTeacherDashboard");document.getElementById("app").innerHTML=`<section class="card"><h1>👨‍🏫 先生ダッシュボード</h1><div class="actions"><button class="btn primary" onclick="SC.renderAddStudentPage()">＋ 生徒追加</button><button class="btn navy" onclick="SC.loadStudents()">生徒一覧</button><button class="btn navy" onclick="SC.renderTeacherRanking()">ランキング</button></div><div id="teacherBox" class="box">読み込み中...</div><div id="studentsList"></div></section>`;await SC.renderTeacherSummary();await SC.loadStudents();SC.updateBackButton?.()};
SC.renderTeacherSummary=async function(){const box=document.getElementById("teacherBox");try{const{students,logs}=await SC.getAllStudentsAndLogs();const t=today(),m=t.slice(0,7);const active=new Set(logs.filter(l=>l.date===t).map(l=>l.uid)).size;const month=logs.filter(l=>String(l.date||"").startsWith(m)).reduce((s,l)=>s+Number(l.minutes||0),0);box.innerHTML=`<h2>📊 全体サマリー</h2><div class="grid two"><div class="box"><b>登録生徒</b><br>${students.length}名</div><div class="box"><b>今日記録あり</b><br>${active}名</div><div class="box"><b>今日未記録</b><br>${Math.max(0,students.length-active)}名</div><div class="box"><b>今月合計</b><br>${month}分</div></div>`}catch(e){box.innerHTML="読み込めませんでした";console.error(e)}};
SC.renderAddStudentPage=async function(){SC.pushHistory?.("renderAddStudentPage");document.getElementById("app").innerHTML=`<section class="card"><h1>＋ 生徒追加</h1><div id="teacherBox" class="box"></div><div id="studentsList"></div></section>`;await SC.renderAddStudent();SC.updateBackButton?.()};
SC.makeStudentId=async function(){const{students}=await SC.getAllStudentsAndLogs();return"KYOWA"+String(students.length+1).padStart(3,"0")};
SC.renderAddStudent=async function(){let id="KYOWA001";try{id=await SC.makeStudentId()}catch(e){}const pw=String(Math.floor(100000+Math.random()*900000));document.getElementById("teacherBox").innerHTML=`<label>生徒ID</label><input id="newStudentId" value="${id}"><label>初期パスワード</label><input id="newStudentPassword" value="${pw}"><label>氏名</label><input id="newStudentName"><label>学校</label><input id="newStudentSchool"><label>学年</label><input id="newStudentGrade"><label>志望校</label><input id="newStudentTarget"><button class="btn primary" onclick="SC.createStudent()">登録</button><p id="createStudentMsg" class="help"></p>`};
SC.createStudent=async function(){const id=document.getElementById("newStudentId").value.trim(),pw=document.getElementById("newStudentPassword").value.trim(),name=document.getElementById("newStudentName").value.trim();const msg=document.getElementById("createStudentMsg");try{msg.textContent="登録中...";const c=await createStudentAuth(id,pw);const{db,doc,setDoc,serverTimestamp}=window.SCFB;const data={role:"student",studentId:id,email:c.email,initialPassword:c.password,name,school:document.getElementById("newStudentSchool").value,grade:document.getElementById("newStudentGrade").value,targetUniversity:document.getElementById("newStudentTarget").value,authEnabled:true,createdAt:serverTimestamp()};await setDoc(doc(db,"users",c.uid),data,{merge:true});await setDoc(doc(db,"students",c.uid),data,{merge:true});msg.innerHTML=`登録しました。<br>生徒ID：<b>${id}</b><br>PW：<b>${c.password}</b>`}catch(e){msg.textContent="登録できませんでした。";console.error(e)}};
SC.loadStudents=async function(){const list=document.getElementById("studentsList");if(!list)return;const{students}=await SC.getAllStudentsAndLogs();list.innerHTML=students.length?students.map(s=>`<div class="box"><h2>${safe(s.name||"名前未設定")}</h2><p>生徒ID：${safe(s.studentId||"-")}<br>学校：${safe(s.school||"-")} / 学年：${safe(s.grade||"-")}<br>第一志望：${safe(s.targetUniversity||"-")}<br>試験日：${safe(s.firstExamDate||"-")}</p></div>`).join(""):`<div class="box">まだ生徒がいません。</div>`};
SC.renderTeacherRanking=async function(){SC.pushHistory?.("renderTeacherRanking");document.getElementById("app").innerHTML=`<section class="card"><h1>🏆 ランキング</h1><div id="rankBox" class="box">読み込み中...</div></section>`;const{students,logs}=await SC.getAllStudentsAndLogs();const totals={};logs.forEach(l=>totals[l.uid]=(totals[l.uid]||0)+Number(l.minutes||0));const rows=students.map(s=>({name:s.name||s.studentId||"生徒",min:totals[s.uid]||0})).sort((a,b)=>b.min-a.min);document.getElementById("rankBox").innerHTML=rows.length?rows.map((r,i)=>`<div class="box"><b>${i+1}位 ${safe(r.name)}</b><br>${r.min}分</div>`).join(""):"記録がありません。";SC.updateBackButton?.()};
SC.renderAllTestRecordsForTeacher=async function(){SC.pushHistory?.("renderAllTestRecordsForTeacher");document.getElementById("app").innerHTML=`<section class="card"><h1>🧾 テスト記録</h1><div id="allTestRecordsBox" class="box">読み込み中...</div></section>`;const box=document.getElementById("allTestRecordsBox");try{const{db,collection,getDocs}=window.SCFB;const snap=await getDocs(collection(db,"testRecords"));const rec=[];snap.forEach(d=>rec.push(d.data()));box.innerHTML=rec.length?rec.map(r=>`<div class="box"><b>${safe(r.studentName||r.studentId||"生徒")}</b><br>${safe(r.testDate||"")} ${safe(r.testName||r.type||"")}<br>英:${r.scores?.english||"-"} 数:${r.scores?.math||"-"} 国:${r.scores?.japanese||"-"}<br>偏差値:${r.deviation||"-"} 判定:${safe(r.judgement||"-")}</div>`).join(""):"まだ記録がありません。"}catch(e){box.innerHTML="読み込めませんでした";console.error(e)}SC.updateBackButton?.()};


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
