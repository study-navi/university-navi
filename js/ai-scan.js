// Ver.16 OCR接続準備版
const SC = window.SC || (window.SC = {});
SC.ocrSpaceApiKey = localStorage.getItem("sc_ocr_space_api_key") || "";
const _esc = v => String(v ?? "").replace(/[<>&]/g, s => ({ "<":"&lt;", ">":"&gt;", "&":"&amp;" }[s]));

SC.renderOCRSettings = function(){
  const app=document.getElementById("app");
  app.innerHTML = `<section class="card"><h1>⚙️ OCR設定</h1><div class="box">
    <p class="help">OCR.Space APIキーを入れると画像読み取りを試せます。未設定でも手入力で使えます。</p>
    <label>OCR.Space APIキー</label>
    <input id="ocrApiKeyInput" value="${_esc(SC.ocrSpaceApiKey)}" placeholder="APIキー">
    <div class="actions"><button class="btn primary" onclick="SC.saveOCRSettings()">保存</button><button class="btn light" onclick="SC.renderAIScan()">戻る</button></div>
    <p id="ocrSettingMsg" class="help"></p>
  </div></section>`;
};

SC.saveOCRSettings = function(){
  SC.ocrSpaceApiKey = document.getElementById("ocrApiKeyInput")?.value?.trim() || "";
  localStorage.setItem("sc_ocr_space_api_key", SC.ocrSpaceApiKey);
  document.getElementById("ocrSettingMsg").textContent = "保存しました。";
};

SC.renderAIScanGuestNotice = function(){
  document.getElementById("app").innerHTML = `<section class="card"><h1>📷 AIスキャン</h1><div class="box">
    <p>模試・定期テスト・通知表・共通テスト自己採点の記録機能です。</p>
    <p class="help">保存するには生徒ログインが必要です。</p>
    <button class="btn primary" onclick="SC.renderStudentLogin()">生徒ログインへ</button>
  </div></section>`;
};

SC.renderAIScan = function(){
  if(!SC.currentUser || SC.currentProfile?.role !== "student"){ SC.renderAIScanGuestNotice(); return; }
  document.getElementById("app").innerHTML = `<section class="card"><h1>📷 AIスキャン</h1>
    <p class="help">写真を選び、OCRで読み取り候補を出してから確認・保存します。</p>
    <div class="box"><h2>1. 写真を選ぶ</h2>
      <label>記録の種類</label><select id="scanType"><option>模試</option><option>定期テスト</option><option>通知表</option><option>共通テスト自己採点</option></select>
      <label>画像を選択</label><input id="scanImageInput" type="file" accept="image/*" capture="environment" onchange="SC.previewScanImage(event)">
      <div id="scanPreview" class="box" style="display:none;"></div>
      <div class="actions"><button class="btn navy" onclick="SC.runOCRScan()">画像を読み取る</button><button class="btn light" onclick="SC.renderOCRSettings()">OCR設定</button></div>
      <p id="ocrStatus" class="help">${SC.ocrSpaceApiKey ? "OCRキー設定済み" : "OCRキー未設定：手入力モードで利用できます。"}</p>
    </div>
    <div class="box"><h2>2. 読み取り結果</h2><textarea id="ocrRawText" placeholder="OCR結果がここに入ります。手入力もできます。" style="min-height:120px;"></textarea>
      <button class="btn light" onclick="SC.autoFillFromOCRText()">フォームへ反映</button></div>
    <div class="box"><h2>3. 確認して保存</h2>
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
      <div class="actions"><button class="btn primary" onclick="SC.saveTestRecord()">保存</button><button class="btn light" onclick="SC.renderMyTestRecords()">保存済みを見る</button></div>
      <p id="testSaveMsg" class="help"></p>
    </div></section>`;
};

SC.previewScanImage = function(e){
  const f=e.target.files?.[0], box=document.getElementById("scanPreview"); if(!f||!box)return;
  const url=URL.createObjectURL(f); box.style.display="block"; box.innerHTML=`<b>選択した画像</b><br><img src="${url}" style="width:100%;max-height:360px;object-fit:contain;border-radius:16px;margin-top:10px;">`;
};

SC.runOCRScan = async function(){
  const st=document.getElementById("ocrStatus"), raw=document.getElementById("ocrRawText"), file=document.getElementById("scanImageInput")?.files?.[0];
  if(!file){ st.textContent="先に画像を選択してください。"; return; }
  if(!SC.ocrSpaceApiKey){ st.textContent="OCRキーが未設定です。OCR設定からAPIキーを入力してください。"; return; }
  try{
    st.textContent="読み取り中...";
    const form=new FormData(); form.append("apikey",SC.ocrSpaceApiKey); form.append("language","jpn"); form.append("OCREngine","2"); form.append("file",file);
    const res=await fetch("https://api.ocr.space/parse/image",{method:"POST",body:form});
    const data=await res.json();
    if(data.IsErroredOnProcessing) throw new Error(data.ErrorMessage || "OCR失敗");
    raw.value=(data.ParsedResults||[]).map(r=>r.ParsedText||"").join("\n").trim();
    st.textContent="読み取り完了。内容を確認してください。";
    SC.autoFillFromOCRText();
  }catch(err){ st.textContent="読み取りに失敗しました。手入力で保存できます。"; console.error(err); }
};

SC.autoFillFromOCRText = function(){
  const text=(document.getElementById("ocrRawText")?.value||"").replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xFEE0));
  const find=labels=>{for(const l of labels){const m=text.match(new RegExp(l+"[^0-9]{0,8}([0-9]{1,3})")); if(m)return m[1];} return "";};
  const map={scoreEnglish:find(["英語","英"]),scoreMath:find(["数学","数"]),scoreJapanese:find(["国語","国"]),scoreScience:find(["理科","理"]),scoreSocial:find(["社会","社"])};
  for(const [id,v] of Object.entries(map)){ if(v) document.getElementById(id).value=v; }
  const dev=(text.match(/偏差値[^0-9]{0,8}([0-9]{2}(?:\.[0-9])?)/)||[])[1]||""; if(dev) document.getElementById("testDeviation").value=dev;
  const judge=(text.match(/[ABCDE]判定/)||[])[0]||""; if(judge) document.getElementById("testJudgement").value=judge;
  if(!document.getElementById("testName").value) document.getElementById("testName").value=document.getElementById("scanType").value;
};

SC.saveTestRecord = async function(){
  const msg=document.getElementById("testSaveMsg");
  try{
    const {db,collection,addDoc,serverTimestamp}=window.SCFB;
    await addDoc(collection(db,"testRecords"),{
      uid:SC.currentUser.uid, studentName:SC.currentProfile?.name||"", studentId:SC.currentProfile?.studentId||"",
      type:document.getElementById("scanType").value, testName:document.getElementById("testName").value, testDate:document.getElementById("testDate").value,
      scores:{english:+(document.getElementById("scoreEnglish").value||0),math:+(document.getElementById("scoreMath").value||0),japanese:+(document.getElementById("scoreJapanese").value||0),science:+(document.getElementById("scoreScience").value||0),social:+(document.getElementById("scoreSocial").value||0)},
      deviation:+(document.getElementById("testDeviation").value||0), judgement:document.getElementById("testJudgement").value, memo:document.getElementById("testMemo").value, rawText:document.getElementById("ocrRawText").value,
      createdAt:serverTimestamp(), updatedAt:serverTimestamp()
    });
    msg.textContent="保存しました。";
  }catch(e){ msg.textContent="保存できませんでした。Firestore Rules を確認してください。"; console.error(e); }
};

SC.renderMyTestRecords = async function(){
  const app=document.getElementById("app"); app.innerHTML=`<section class="card"><h1>🧾 テスト・模試記録</h1><div id="testRecordsBox" class="box">読み込み中...</div></section>`;
  const box=document.getElementById("testRecordsBox");
  try{
    const {db,collection,getDocs,query,where}=window.SCFB; const q=query(collection(db,"testRecords"),where("uid","==",SC.currentUser.uid));
    const snap=await getDocs(q), rec=[]; snap.forEach(d=>rec.push({id:d.id,...d.data()})); rec.sort((a,b)=>String(b.testDate||"").localeCompare(String(a.testDate||"")));
    box.innerHTML=`<div class="actions"><button class="btn primary" onclick="SC.renderAIScan()">AIスキャンへ</button><button class="btn light" onclick="SC.renderStudentDashboard()">マイページへ</button></div>`+
    (rec.length?rec.map(r=>`<div class="box"><b>${_esc(r.testDate||"")} ${_esc(r.testName||r.type||"")}</b><br>英語:${r.scores?.english||"-"} / 数学:${r.scores?.math||"-"} / 国語:${r.scores?.japanese||"-"}<br>理科:${r.scores?.science||"-"} / 社会:${r.scores?.social||"-"}<br>偏差値:${r.deviation||"-"} 判定:${_esc(r.judgement||"-")}<br><span class="help">${_esc(r.memo||"")}</span></div>`).join(""):"まだ記録がありません。");
  }catch(e){ box.innerHTML="読み込めませんでした。"; console.error(e); }
};
