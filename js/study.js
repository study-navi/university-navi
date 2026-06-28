const SC = window.SC || (window.SC = {});

SC.saveStudyLog = async function(){
  if(!SC.currentUser){ SC.renderLogin(); return; }
  const date = document.getElementById("studyDate").value;
  const subject = document.getElementById("studySubject").value;
  const minutes = Number(document.getElementById("studyMinutes").value || 0);
  const memo = document.getElementById("studyMemo").value || "";
  if(!date || !subject || minutes <= 0){
    document.getElementById("studySaveMsg").textContent = "日付・教科・時間を入力してください。";
    return;
  }
  try{
    await window.SCFB.addDoc(window.SCFB.collection(window.SCFB.db,"studyLogs"), {
      uid:SC.currentUser.uid,
      studentName:SC.currentProfile?.name || "",
      studentId:SC.currentProfile?.studentId || "",
      date, subject, minutes, memo,
      createdAt:window.SCFB.serverTimestamp()
    });
    document.getElementById("studySaveMsg").textContent = "保存しました。";
  }catch(e){
    document.getElementById("studySaveMsg").textContent = "保存できませんでした。";
    console.error(e);
  }
};

SC.loadMyStudyLogs = async function(){
  if(!SC.currentUser){ SC.renderLogin(); return; }
  const q = window.SCFB.query(window.SCFB.collection(window.SCFB.db,"studyLogs"), window.SCFB.where("uid","==",SC.currentUser.uid));
  const snap = await window.SCFB.getDocs(q);
  const logs = [];
  snap.forEach(d => logs.push(d.data()));
  const total = logs.reduce((s,l)=>s+Number(l.minutes||0),0);
  document.getElementById("studentMain").innerHTML =
    `<h2>📊 自分の学習記録</h2><p>合計 ${total}分 / ${logs.length}件</p>` +
    logs.slice(-20).reverse().map(l => `<div class="box">${l.date} / ${l.subject} / ${l.minutes}分<br>${l.memo || ""}</div>`).join("");
};
