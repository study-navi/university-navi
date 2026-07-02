const SC = window.SC || (window.SC = {});
const esc=v=>String(v??"").replace(/[<>&]/g,s=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[s]));
const today=()=>new Date().toISOString().slice(0,10);
const daysUntil=d=>{if(!d)return null;const n=new Date();n.setHours(0,0,0,0);const t=new Date(d+"T00:00:00");return Math.ceil((t-n)/(1000*60*60*24))};
SC.commonTestDate="2027-01-16";
SC.reloadMyProfile=async function(){const{db,doc,getDoc}=window.SCFB;const snap=await getDoc(doc(db,"users",SC.currentUser.uid));if(snap.exists())SC.currentProfile={id:snap.id,...snap.data()};return SC.currentProfile};
SC.getMyStudyLogs=async function(){const{db,collection,getDocs,query,where}=window.SCFB;const q=query(collection(db,"studyLogs"),where("uid","==",SC.currentUser.uid));const snap=await getDocs(q);const logs=[];snap.forEach(d=>logs.push({id:d.id,...d.data()}));logs.sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")));return logs};
SC.renderStudentDashboard=async function(){SC.pushHistory?.("renderStudentDashboard");document.getElementById("app").innerHTML=`<section class="card"><h1>👤 マイページ</h1><div id="studentDashboardBox" class="box">読み込み中...</div></section>`;const box=document.getElementById("studentDashboardBox");const p=await SC.reloadMyProfile()||{},logs=await SC.getMyStudyLogs();const cd=daysUntil(SC.commonTestDate),fd=daysUntil(p.firstExamDate),total=logs.reduce((s,l)=>s+Number(l.minutes||0),0);box.innerHTML=`<h2>${esc(p.name||"生徒")} さん</h2><p>生徒ID：${esc(p.studentId||"-")}<br>第一志望：${esc(p.targetUniversity||"-")}</p><h2>⏳ カウントダウン</h2><div class="grid two"><div class="box"><b>共通テストまで</b><br><span style="font-size:28px;font-weight:900">${cd}</span>日</div><div class="box"><b>第一志望試験まで</b><br><span style="font-size:28px;font-weight:900">${fd??"-"}</span>日<br><span class="help">${p.firstExamDate||"未設定"}</span></div></div><div class="box"><h3>🎯 第一志望・試験日</h3><label>第一志望</label><input id="studentTargetUniversity" value="${esc(p.targetUniversity||"")}"><label>試験日</label><input id="studentFirstExamDate" type="date" value="${esc(p.firstExamDate||"")}"><button class="btn primary" onclick="SC.saveStudentGoal()">保存</button><p id="studentGoalMsg" class="help"></p></div><h2>📊 学習</h2><div class="box">合計 ${total}分 / ${logs.length}件</div><div class="actions"><button class="btn primary" onclick="SC.renderStudyForm()">勉強記録</button><button class="btn navy" onclick="SC.loadMyStudyLogs()">記録一覧</button></div>`;SC.updateBackButton?.()};
SC.saveStudentGoal=async function(){const{db,doc,setDoc,serverTimestamp}=window.SCFB;const payload={targetUniversity:document.getElementById("studentTargetUniversity").value,firstExamDate:document.getElementById("studentFirstExamDate").value,updatedAt:serverTimestamp()};await setDoc(doc(db,"users",SC.currentUser.uid),payload,{merge:true});try{await setDoc(doc(db,"students",SC.currentUser.uid),payload,{merge:true})}catch(e){}document.getElementById("studentGoalMsg").textContent="保存しました。";setTimeout(()=>SC.renderStudentDashboard(),500)};
SC.renderStudyForm=function(){SC.pushHistory?.("renderStudyForm");document.getElementById("app").innerHTML=`<section class="card"><h1>📚 勉強記録</h1><div class="box"><label>日付</label><input id="studyDate" type="date" value="${today()}"><label>教科</label><select id="studySubject"><option>英語</option><option>数学</option><option>国語</option><option>理科</option><option>社会</option><option>情報</option><option>その他</option></select><label>時間（分）</label><input id="studyMinutes" type="number"><label>メモ</label><textarea id="studyMemo"></textarea><button class="btn primary" onclick="SC.saveStudyLog()">保存</button><p id="studySaveMsg" class="help"></p></div></section>`;SC.updateBackButton?.()};
SC.saveStudyLog=async function(){const{db,collection,addDoc,serverTimestamp}=window.SCFB;await addDoc(collection(db,"studyLogs"),{uid:SC.currentUser.uid,studentName:SC.currentProfile?.name||"",date:document.getElementById("studyDate").value,subject:document.getElementById("studySubject").value,minutes:+document.getElementById("studyMinutes").value,memo:document.getElementById("studyMemo").value,createdAt:serverTimestamp()});document.getElementById("studySaveMsg").textContent="保存しました。"};
SC.loadMyStudyLogs=async function(){SC.pushHistory?.("loadMyStudyLogs");document.getElementById("app").innerHTML=`<section class="card"><h1>📈 自分の記録</h1><div id="logs" class="box">読み込み中...</div></section>`;const logs=await SC.getMyStudyLogs();document.getElementById("logs").innerHTML=logs.length?logs.map(l=>`<div class="box"><b>${esc(l.date)} ${esc(l.subject)} ${l.minutes}分</b><br><span class="help">${esc(l.memo||"")}</span></div>`).join(""):"まだ記録がありません。";SC.updateBackButton?.()};


const SC = window.SC || (window.SC = {});



/* Ver.19 生徒向けルールベースアドバイス */
SC.renderStudentAdvice = async function(){
  SC.pushHistory?.("renderStudentAdvice");
  document.getElementById("app").innerHTML=`<section class="card"><h1>🤖 学習アドバイス</h1><div id="studentAdviceBox" class="box">読み込み中...</div></section>`;
  const box=document.getElementById("studentAdviceBox");
  try{
    const profile=await SC.reloadMyProfile?.() || SC.currentProfile || {};
    const logs=await SC.getMyStudyLogs?.() || [];
    let tests=[];
    try{
      const {db,collection,getDocs,query,where}=window.SCFB;
      const q=query(collection(db,"testRecords"),where("uid","==",SC.currentUser.uid));
      const snap=await getDocs(q); snap.forEach(d=>tests.push({id:d.id,...d.data()}));
      tests.sort((a,b)=>String(b.testDate||"").localeCompare(String(a.testDate||"")));
    }catch(_){}
    const today=new Date().toISOString().slice(0,10);
    const d=new Date(); d.setDate(d.getDate()-6); const weekStart=d.toISOString().slice(0,10);
    const week=logs.filter(l=>String(l.date||"")>=weekStart).reduce((s,l)=>s+Number(l.minutes||0),0);
    const todayMin=logs.filter(l=>l.date===today).reduce((s,l)=>s+Number(l.minutes||0),0);
    const advice=[];
    if(todayMin===0) advice.push("今日はまだ勉強記録がありません。まずは30分だけでも記録しましょう。");
    if(week<300) advice.push("直近7日の学習時間が少なめです。毎日60分以上を目標にしましょう。");
    const latest=tests[0];
    if(latest?.subjects){
      const weak=[]; Object.entries(latest.subjects).forEach(([name,v])=>{ if(v?.weak || v?.wrong || (v?.score && Number(v.score)<50)) weak.push(name); });
      if(weak.length) advice.push(`次の復習は「${weak.slice(0,3).join("・")}」を優先しましょう。`);
    }
    const days=SC.daysUntil?.(profile.firstExamDate);
    if(days!==null && days!==undefined) advice.push(`第一志望の試験まであと${days}日です。復習メモに残した内容から優先して取り組みましょう。`);
    box.innerHTML=`<h2>今日やること</h2><div class="adviceBox">${(advice.length?advice:["今の調子で記録を続けましょう。次のテスト後に優先順位を更新します。"]).map(a=>`<div class="todoItem">✅ <div>${a}</div></div>`).join("")}</div><div class="actions"><button class="btn primary" onclick="SC.renderStudyForm()">勉強記録を入力</button><button class="btn light" onclick="SC.renderAIScan()">テストを記録</button></div>`;
  }catch(e){ box.textContent="読み込めませんでした。"; console.error(e); }
  SC.updateBackButton?.();
};
