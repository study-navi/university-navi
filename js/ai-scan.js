// Ver.15 AIスキャン土台版
const SC = window.SC || (window.SC = {});
function esc(v){return String(v??"").replace(/[<>&]/g,s=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[s]));}

SC.renderAIScanGuestNotice=function(){
  const app=document.getElementById("app");
  if(!app)return;
  app.innerHTML=`<section class="card"><h1>📷 AIスキャン</h1><div class="box">
  <p>模試・定期テスト・通知表・共通テスト自己採点の写真読み取り機能です。</p>
  <p class="help">結果を保存するには生徒ログインが必要です。</p>
  <button class="btn primary" onclick="SC.renderStudentLogin()">生徒ログインへ</button>
  <button class="btn light" onclick="SC.renderGuestHome()">戻る</button></div></section>`;
};

SC.renderAIScan=function(){
  if(!SC.currentUser || SC.currentProfile?.role!=="student"){SC.renderAIScanGuestNotice();return;}
  const app=document.getElementById("app");
  if(!app)return;
  app.innerHTML=`<section class="card"><h1>📷 AIスキャン</h1>
  <p class="help">OCR接続前の土台版です。写真を選んで、結果を確認フォームに入力して保存できます。</p>
  <div class="box"><h2>1. 写真を選ぶ</h2>
  <label>記録の種類</label><select id="scanType"><option>模試</option><option>定期テスト</option><option>通知表</option><option>共通テスト自己採点</option></select>
  <label>画像を選択</label><input id="scanImageInput" type="file" accept="image/*" capture="environment" onchange="SC.previewScanImage(event)">
  <div id="scanPreview" class="box" style="display:none;"></div>
  <p class="help">Ver.16でOCR.Space API接続予定です。</p></div>
  <div class="box"><h2>2. 結果を確認・入力</h2>
  <label>テスト名</label><input id="testName" placeholder="例：第1回全統共通テスト模試">
  <label>実施日</label><input id="testDate" type="date" value="${new Date().toISOString().slice(0,10)}">
  <label>英語</label><input id="scoreEnglish" type="number" placeholder="点数">
  <label>数学</label><input id="scoreMath" type="number" placeholder="点数">
  <label>国語</label><input id="scoreJapanese" type="number" placeholder="点数">
  <label>理科</label><input id="scoreScience" type="number" placeholder="点数">
  <label>社会</label><input id="scoreSocial" type="number" placeholder="点数">
  <label>偏差値</label><input id="testDeviation" type="number" step="0.1" placeholder="例：58.5">
  <label>判定</label><select id="testJudgement"><option value="">未入力</option><option>A判定</option><option>B判定</option><option>C判定</option><option>D判定</option><option>E判定</option></select>
  <label>メモ</label><textarea id="testMemo" placeholder="例：数学IAが課題。"></textarea>
  <div class="actions"><button class="btn primary" onclick="SC.saveTestRecord()">保存</button><button class="btn light" onclick="SC.renderStudentDashboard()">マイページへ</button></div>
  <p id="testSaveMsg" class="help"></p></div></section>`;
};

SC.previewScanImage=function(event){
  const file=event.target.files?.[0], box=document.getElementById("scanPreview");
  if(!file||!box)return;
  const url=URL.createObjectURL(file);
  box.style.display="block";
  box.innerHTML=`<b>選択した画像</b><br><img src="${url}" style="width:100%;max-height:360px;object-fit:contain;border-radius:16px;margin-top:10px;">`;
};

SC.saveTestRecord=async function(){
  if(!SC.currentUser){SC.renderLogin?.();return;}
  const msg=document.getElementById("testSaveMsg");
  const record={
    uid:SC.currentUser.uid,studentName:SC.currentProfile?.name||"",studentId:SC.currentProfile?.studentId||"",
    type:document.getElementById("scanType")?.value||"",testName:document.getElementById("testName")?.value||"",testDate:document.getElementById("testDate")?.value||"",
    scores:{english:Number(document.getElementById("scoreEnglish")?.value||0),math:Number(document.getElementById("scoreMath")?.value||0),japanese:Number(document.getElementById("scoreJapanese")?.value||0),science:Number(document.getElementById("scoreScience")?.value||0),social:Number(document.getElementById("scoreSocial")?.value||0)},
    deviation:Number(document.getElementById("testDeviation")?.value||0),judgement:document.getElementById("testJudgement")?.value||"",memo:document.getElementById("testMemo")?.value||""
  };
  try{
    const {db,collection,addDoc,serverTimestamp}=window.SCFB;
    await addDoc(collection(db,"testRecords"),{...record,createdAt:serverTimestamp(),updatedAt:serverTimestamp()});
    if(msg)msg.textContent="保存しました。";
  }catch(e){if(msg)msg.textContent="保存できませんでした。Firestore Rules を確認してください。";console.error(e);}
};

SC.renderMyTestRecords=async function(){
  if(!SC.currentUser)return;
  const app=document.getElementById("app");
  app.innerHTML=`<section class="card"><h1>🧾 テスト・模試記録</h1><div id="testRecordsBox" class="box">読み込み中...</div></section>`;
  const box=document.getElementById("testRecordsBox");
  try{
    const {db,collection,getDocs,query,where}=window.SCFB;
    const q=query(collection(db,"testRecords"),where("uid","==",SC.currentUser.uid));
    const snap=await getDocs(q), records=[];
    snap.forEach(d=>records.push({id:d.id,...d.data()}));
    records.sort((a,b)=>String(b.testDate||"").localeCompare(String(a.testDate||"")));
    box.innerHTML=`<div class="actions"><button class="btn primary" onclick="SC.renderAIScan()">AIスキャンへ</button><button class="btn light" onclick="SC.renderStudentDashboard()">マイページへ</button></div>`+
    (records.length?records.map(r=>`<div class="box"><b>${esc(r.testDate||"")}　${esc(r.testName||r.type||"")}</b><br>英語:${r.scores?.english||"-"} / 数学:${r.scores?.math||"-"} / 国語:${r.scores?.japanese||"-"}<br>偏差値:${r.deviation||"-"}　判定:${esc(r.judgement||"-")}<br><span class="help">${esc(r.memo||"")}</span></div>`).join(""):"まだ記録がありません。");
  }catch(e){box.innerHTML="読み込めませんでした。";console.error(e);}
};
