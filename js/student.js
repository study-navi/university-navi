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
