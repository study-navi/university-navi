const SC = window.SC || (window.SC = {});
SC.ocrSpaceApiKey = localStorage.getItem("sc_ocr_space_api_key") || "";
SC.selectedScanFile = null;
SC.selectedUploadFiles = { scoreSheet: [], questionPapers: [], answerSheets: [] };
const escAI = v => String(v ?? "").replace(/[<>&]/g, s => ({ "<":"&lt;", ">":"&gt;", "&":"&amp;" }[s]));

SC.commonTestSubjects = ["国語","数学Ⅰ・A","数学Ⅱ・B・C","英語（リーディング）","英語（リスニング）","物理","化学","生物","地学","日本史探究","世界史探究","地理探究","公共・政治経済","公共・倫理","情報Ⅰ"];

SC.renderAIScanGuestNotice=function(){SC.pushHistory?.("renderAIScanGuestNotice");document.getElementById("app").innerHTML=`<section class="card"><h1>📷 AIスキャン</h1><div class="box">保存するには生徒ログインが必要です。</div></section>`;SC.updateBackButton?.();};

SC.renderOCRSettings=function(){SC.pushHistory?.("renderOCRSettings");document.getElementById("app").innerHTML=`<section class="card"><h1>⚙️ OCR設定</h1><div class="box"><label>OCR.Space APIキー</label><input id="ocrApiKeyInput" value="${escAI(SC.ocrSpaceApiKey)}"><div class="actions"><button class="btn primary" onclick="SC.saveOCRSettings()">保存</button><button class="btn light" onclick="SC.renderAIScan()">AIスキャンへ</button></div><p id="ocrSettingMsg" class="help"></p></div></section>`;SC.updateBackButton?.();};
SC.saveOCRSettings=function(){SC.ocrSpaceApiKey=document.getElementById("ocrApiKeyInput").value.trim();localStorage.setItem("sc_ocr_space_api_key",SC.ocrSpaceApiKey);document.getElementById("ocrSettingMsg").textContent="保存しました。";};

SC.renderSubjectInputs=function(){
 return `<div class="subjectGrid">`+SC.commonTestSubjects.map(s=>`<div class="subjectRow" id="subjectRow_${s}"><div class="subjectHead" onclick="SC.toggleSubjectDetail('${s}')"><b>${s}</b><input id="score_${s}" type="number" placeholder="点"></div><div class="subjectDetails"><label>偏差値</label><input id="deviation_${s}" type="number" step="0.1"><label>苦手単元・ミス傾向</label><textarea id="weak_${s}" placeholder="例：二次関数、時間不足、読み違い"></textarea><label>間違えた問題</label><textarea id="wrong_${s}" placeholder="例：大問3 問2"></textarea></div></div>`).join("")+`</div>`;
};
SC.toggleSubjectDetail=s=>document.getElementById(`subjectRow_${s}`)?.classList.toggle("open");

SC.renderAIScan=function(){
 SC.pushHistory?.("renderAIScan");
 if(!SC.currentUser||SC.currentProfile?.role!=="student"){SC.renderAIScanGuestNotice();return;}
 SC.selectedScanFile=null;SC.selectedUploadFiles={scoreSheet:[],questionPapers:[],answerSheets:[]};
 document.getElementById("app").innerHTML=`<section class="card"><h1>📷 AIスキャン</h1><p class="help">テストごとに、成績表・問題用紙・解答用紙・分析メモをまとめて保存します。</p>
 <div class="box"><h2>① テスト情報</h2><label>種類</label><select id="testType"><option>模試</option><option>定期テスト</option><option>通知表</option><option>学校実力テスト</option><option>その他</option></select><label>テスト名</label><input id="testName" placeholder="例：第2回全統共通テスト模試"><label>実施日</label><input id="testDate" type="date" value="${new Date().toISOString().slice(0,10)}"><label>判定</label><select id="testJudgement"><option></option><option>A判定</option><option>B判定</option><option>C判定</option><option>D判定</option><option>E判定</option></select><label>総合偏差値</label><input id="testDeviation" type="number" step="0.1"></div>
 <div class="box"><h2>② 成績表を読み取る</h2><div class="scanButtons"><button type="button" class="scanChoice" onclick="document.getElementById('scanCameraInput').click()">📷 カメラで撮影</button><button type="button" class="scanChoice" onclick="document.getElementById('scanFileInput').click()">🖼 写真・ファイルから選択</button></div><input id="scanCameraInput" class="hiddenFileInput" type="file" accept="image/*" capture="environment" onchange="SC.handleScanFile(event)"><input id="scanFileInput" class="hiddenFileInput" type="file" accept="image/*,.jpg,.jpeg,.png,.webp,.heic" onchange="SC.handleScanFile(event)"><div id="scanPreview" style="display:none"></div><div class="actions"><button class="btn navy" onclick="SC.runOCRScan()">画像を読み取る</button><button class="btn light" onclick="SC.renderOCRSettings()">OCR設定</button></div><p id="ocrStatus" class="help">${SC.ocrSpaceApiKey?"OCRキー設定済み":"OCRキー未設定：手入力可能"}</p><label>読み取り結果</label><textarea id="ocrRawText"></textarea><button class="btn light" onclick="SC.autoFillFromOCRText()">フォームへ反映</button></div>
 <div class="box"><h2>③ 共通テスト基準の科目入力</h2><p class="help">点数だけ入力し、詳しく残す科目はタップして詳細入力できます。</p>${SC.renderSubjectInputs()}</div>
 <div class="box"><h2>④ 添付資料</h2><div class="fileGroup"><b>成績表</b><input type="file" id="scoreSheetFiles" accept="image/*,.pdf" multiple onchange="SC.handleAttachmentFiles('scoreSheet',event)"><div id="scoreSheetList" class="fileList"></div></div><div class="fileGroup"><b>問題用紙</b><input type="file" id="questionPaperFiles" accept="image/*,.pdf" multiple onchange="SC.handleAttachmentFiles('questionPapers',event)"><div id="questionPapersList" class="fileList"></div></div><div class="fileGroup"><b>解答用紙</b><input type="file" id="answerSheetFiles" accept="image/*,.pdf" multiple onchange="SC.handleAttachmentFiles('answerSheets',event)"><div id="answerSheetsList" class="fileList"></div></div></div>
 <div class="box"><h2>⑤ 分析・復習メモ</h2><label>AI分析・気づき</label><textarea id="analysisMemo"></textarea><label>復習メモ</label><textarea id="reviewMemo"></textarea><label>次回改善点</label><textarea id="nextActionMemo"></textarea><div class="actions"><button class="btn primary" onclick="SC.saveTestRecord()">このテストを保存</button><button class="btn light" onclick="SC.renderMyTestRecords()">保存済みを見る</button></div><p id="testSaveMsg" class="help"></p></div></section>`;
 SC.updateBackButton?.();
};

SC.handleScanFile=function(e){const f=e.target.files?.[0];SC.selectedScanFile=f||null;const b=document.getElementById("scanPreview");if(!f||!b)return;const url=URL.createObjectURL(f);b.style.display="block";b.innerHTML=`<p class="ok">選択しました：${escAI(f.name||"画像")}</p><img class="previewImg" src="${url}">`;};
SC.handleAttachmentFiles=function(kind,e){const files=Array.from(e.target.files||[]);SC.selectedUploadFiles[kind]=files;const id=kind==="scoreSheet"?"scoreSheetList":kind==="questionPapers"?"questionPapersList":"answerSheetsList";document.getElementById(id).innerHTML=files.map(f=>`・${escAI(f.name)} <span class="pill">${Math.round(f.size/1024)}KB</span>`).join("<br>");};

SC.runOCRScan=async function(){const st=document.getElementById("ocrStatus"),raw=document.getElementById("ocrRawText"),file=SC.selectedScanFile;if(!file){st.textContent="画像を選択してください。";return}if(!SC.ocrSpaceApiKey){st.textContent="OCRキー未設定です。";return}try{st.textContent="読み取り中...";const form=new FormData();form.append("apikey",SC.ocrSpaceApiKey);form.append("language","jpn");form.append("OCREngine","2");form.append("isOverlayRequired","false");form.append("file",file);const res=await fetch("https://api.ocr.space/parse/image",{method:"POST",body:form});const data=await res.json();if(data.IsErroredOnProcessing)throw new Error(data.ErrorMessage||"OCRエラー");raw.value=(data.ParsedResults||[]).map(r=>r.ParsedText||"").join("\n").trim();st.innerHTML=`<span class="ok">読み取り完了。</span>`;SC.autoFillFromOCRText();}catch(e){st.innerHTML=`<span class="warn">読み取り失敗。</span> 手入力で保存できます。`;console.error(e)}};

SC.autoFillFromOCRText=function(){const text=(document.getElementById("ocrRawText")?.value||"").replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xFEE0)).replace(/Ⅰ/g,"I").replace(/Ⅱ/g,"II");const pats=[["国語",["国語","国"]],["数学Ⅰ・A",["数学I・A","数学IA","数学1A","数IA"]],["数学Ⅱ・B・C",["数学II・B・C","数学IIBC","数学2BC","数IIBC"]],["英語（リーディング）",["英語R","リーディング"]],["英語（リスニング）",["英語L","リスニング"]],["物理",["物理"]],["化学",["化学"]],["生物",["生物"]],["地学",["地学"]],["日本史探究",["日本史探究","日本史"]],["世界史探究",["世界史探究","世界史"]],["地理探究",["地理探究","地理"]],["公共・政治経済",["公共政治経済","公共・政治経済","政治経済","政経"]],["公共・倫理",["公共倫理","公共・倫理","倫理"]],["情報Ⅰ",["情報I","情報1","情報"]]];for(const [sub,labels] of pats){for(const lab of labels){const m=text.match(new RegExp(lab+"[^0-9]{0,12}([0-9]{1,3})"));if(m){const el=document.getElementById(`score_${sub}`);if(el)el.value=m[1];break}}}const dev=(text.match(/偏差値[^0-9]{0,12}([0-9]{2}(?:\.[0-9])?)/)||[])[1];if(dev)document.getElementById("testDeviation").value=dev;const judge=(text.match(/[ABCDEＡＢＣＤＥ]判定/)||[])[0];if(judge)document.getElementById("testJudgement").value=judge.replace("Ａ","A").replace("Ｂ","B").replace("Ｃ","C").replace("Ｄ","D").replace("Ｅ","E");};

SC.collectSubjectScores=function(){const scores={};for(const s of SC.commonTestSubjects){scores[s]={score:+(document.getElementById(`score_${s}`)?.value||0),deviation:+(document.getElementById(`deviation_${s}`)?.value||0),weak:document.getElementById(`weak_${s}`)?.value||"",wrong:document.getElementById(`wrong_${s}`)?.value||""};}return scores;};

SC.uploadFile=async function(file,path){const {storage,ref,uploadBytes,getDownloadURL}=window.SCFB;const r=ref(storage,path);await uploadBytes(r,file);return {name:file.name,type:file.type,size:file.size,url:await getDownloadURL(r),path};};
SC.uploadAttachments=async function(recordId){const uid=SC.currentUser.uid,base=`testRecords/${uid}/${recordId}`,result={scoreSheet:[],questionPapers:[],answerSheets:[]};for(const [kind,files] of Object.entries(SC.selectedUploadFiles)){for(let i=0;i<files.length;i++){const f=files[i],name=`${Date.now()}_${i}_${f.name}`.replace(/[^\w.\-ぁ-んァ-ヶ一-龠]/g,"_");result[kind].push(await SC.uploadFile(f,`${base}/${kind}/${name}`));}}return result;};

SC.saveTestRecord=async function(){const msg=document.getElementById("testSaveMsg");try{msg.textContent="保存中...";const {db,collection,addDoc,updateDoc,serverTimestamp}=window.SCFB;const rec={uid:SC.currentUser.uid,studentName:SC.currentProfile?.name||"",studentId:SC.currentProfile?.studentId||"",type:document.getElementById("testType").value,testName:document.getElementById("testName").value||document.getElementById("testType").value,testDate:document.getElementById("testDate").value,judgement:document.getElementById("testJudgement").value,deviation:+(document.getElementById("testDeviation").value||0),subjects:SC.collectSubjectScores(),analysisMemo:document.getElementById("analysisMemo").value,reviewMemo:document.getElementById("reviewMemo").value,nextActionMemo:document.getElementById("nextActionMemo").value,rawText:document.getElementById("ocrRawText").value,createdAt:serverTimestamp(),updatedAt:serverTimestamp()};const docRef=await addDoc(collection(db,"testRecords"),rec);try{const attachments=await SC.uploadAttachments(docRef.id);await updateDoc(docRef,{attachments,updatedAt:serverTimestamp()});}catch(e){console.warn(e);await updateDoc(docRef,{attachmentError:"Storage未設定またはアップロード失敗",updatedAt:serverTimestamp()});}msg.innerHTML=`<span class="ok">保存しました。</span>`;}catch(e){msg.textContent="保存できませんでした。Firestore / Storage Rulesを確認してください。";console.error(e)}};

SC.renderMyTestRecords=async function(){SC.pushHistory?.("renderMyTestRecords");document.getElementById("app").innerHTML=`<section class="card"><h1>🧾 テスト記録</h1><div id="myTests" class="box">読み込み中...</div></section>`;const box=document.getElementById("myTests");try{const {db,collection,getDocs,query,where}=window.SCFB;const q=query(collection(db,"testRecords"),where("uid","==",SC.currentUser.uid));const snap=await getDocs(q);const rec=[];snap.forEach(d=>rec.push({id:d.id,...d.data()}));rec.sort((a,b)=>String(b.testDate||"").localeCompare(String(a.testDate||"")));box.innerHTML=rec.length?rec.map(SC.renderTestRecordCard).join(""):"まだ記録がありません。";}catch(e){box.textContent="読み込めませんでした。";console.error(e)}SC.updateBackButton?.();};
SC.renderTestRecordCard=function(r){const subs=r.subjects||{};const scores=Object.entries(subs).filter(([_,v])=>v&&(v.score||v.deviation||v.weak||v.wrong)).map(([s,v])=>`<span class="pill">${escAI(s)}：${v.score||"-"}点</span>`).join("");const links=[];for(const arr of Object.values(r.attachments||{})){if(Array.isArray(arr))for(const f of arr)links.push(`<a href="${f.url}" target="_blank">${escAI(f.name)}</a>`)}return `<div class="box"><h2>${escAI(r.testName||r.type||"テスト")}</h2><p>${escAI(r.testDate||"")} / ${escAI(r.type||"")}<br>判定：${escAI(r.judgement||"-")} / 総合偏差値：${r.deviation||"-"}</p><div>${scores||"<span class='help'>科目点未入力</span>"}</div><p class="help">${escAI(r.analysisMemo||"")}</p>${links.length?`<div class="box">${links.join("<br>")}</div>`:""}</div>`;};


const SC = window.SC || (window.SC = {});



/* 模試成績表レイアウト基準の科目 */
SC.commonTestSubjects = ["英語","リスニング","英語＋L","数学ⅠA","数学ⅡBC","数学①②","国語","理科①","理科②","地歴公民①","地歴公民②","総合1","総合2"];

SC.renderSubjectInputs = function(){
  return `<div class="mockSubjectNote">模試の成績表に近い並びで入力します。各科目をタップすると、偏差値・苦手単元・間違えた問題も残せます。</div><div class="subjectGrid">` + SC.commonTestSubjects.map(subject => `
    <div class="subjectRow" id="subjectRow_${subject}">
      <div class="subjectHead" onclick="SC.toggleSubjectDetail('${subject}')">
        <b>${subject}</b><input id="score_${subject}" type="number" placeholder="点">
      </div>
      <div class="subjectDetails">
        <label>正式科目・内容</label><input id="detailName_${subject}" placeholder="例：物理 / 化学 / 倫理政経">
        <label>偏差値</label><input id="deviation_${subject}" type="number" step="0.1" placeholder="例：60.7">
        <label>学力レベル</label><input id="level_${subject}" placeholder="例：A / S / B">
        <label>苦手単元・ミス傾向</label><textarea id="weak_${subject}" placeholder="例：時間不足、計算ミス、読み違い"></textarea>
        <label>間違えた問題</label><textarea id="wrong_${subject}" placeholder="例：大問3 問2"></textarea>
      </div>
    </div>`).join("") + `</div>`;
};
SC.toggleSubjectDetail = function(subject){ document.getElementById(`subjectRow_${subject}`)?.classList.toggle("open"); };
SC.collectSubjectScores = function(){
  const scores={};
  for(const subject of SC.commonTestSubjects){
    scores[subject]={score:Number(document.getElementById(`score_${subject}`)?.value||0),detailName:document.getElementById(`detailName_${subject}`)?.value||"",deviation:Number(document.getElementById(`deviation_${subject}`)?.value||0),level:document.getElementById(`level_${subject}`)?.value||"",weak:document.getElementById(`weak_${subject}`)?.value||"",wrong:document.getElementById(`wrong_${subject}`)?.value||""};
  }
  return scores;
};

SC.autoFillFromOCRText = function(){
  const text=(document.getElementById("ocrRawText")?.value||"").replace(/[０-９]/g,c=>String.fromCharCode(c.charCodeAt(0)-0xFEE0)).replace(/Ⅰ/g,"I").replace(/Ⅱ/g,"II").replace(/Ⅲ/g,"III");
  const lines=text.split(/\n|\r/).map(s=>s.trim()).filter(Boolean);
  const findLine=labels=>lines.find(line=>labels.some(label=>line.includes(label)));
  const firstScore=line=>{if(!line)return"";const m=line.match(/([0-9]{1,3})\s*\/\s*(100|200|900)/);if(m)return m[1];const nums=line.match(/[0-9]{1,3}(?:\.[0-9])?/g)||[];return nums[0]||"";};
  const deviationFromLine=line=>{if(!line)return"";const nums=line.match(/[0-9]{2}\.[0-9]/g)||[];return nums[0]||"";};
  const set=(s,v)=>{const el=document.getElementById(`score_${s}`);if(el&&v)el.value=v;};
  const setDev=(s,v)=>{const el=document.getElementById(`deviation_${s}`);if(el&&v)el.value=v;};
  const setDetail=(s,v)=>{const el=document.getElementById(`detailName_${s}`);if(el&&v&&!el.value)el.value=v;};

  const map=[
    ["英語",["英語 "]],["リスニング",["リスニング"]],["英語＋L",["英語+L","英語＋L","英語 + L"]],
    ["数学ⅠA",["数学1A","数学I A","数学IA","数学I・A"]],["数学ⅡBC",["数学2BC","数学II B","数学IIB","数学IIBC","数学II・B"]],
    ["数学①②",["数学①②","数学(1)(2)","数学1 2"]],["国語",["国語"]],
    ["理科①",["理科①","第1 物理","第１ 物理","物理"]],["理科②",["理科②","第2 化学","第２ 化学","化学"]],
    ["地歴公民①",["地歴公民①","第1 倫理","倫理政経","倫理、政治","倫理政治"]],["地歴公民②",["地歴公民②"]],
    ["総合1",["総合1","総合１","5-7理系","５－７理系"]],["総合2",["総合2","総合２"]]
  ];
  for(const [subject,labels] of map){
    const line=findLine(labels);
    if(line){set(subject,firstScore(line));setDev(subject,deviationFromLine(line));if(subject==="理科①"&&line.includes("物理"))setDetail(subject,"物理");if(subject==="理科②"&&line.includes("化学"))setDetail(subject,"化学");if(subject==="地歴公民①"&&(line.includes("倫理")||line.includes("政経")))setDetail(subject,"倫理政経");}
  }
  const fallback=[["英語",/英語[^0-9]{0,15}([0-9]{1,3})\s*\/\s*(100|200)/],["リスニング",/リスニング[^0-9]{0,15}([0-9]{1,3})\s*\/\s*(100|200)/],["英語＋L",/英語[＋+]\s*L[^0-9]{0,15}([0-9]{1,3})\s*\/\s*(100|200)/],["数学ⅠA",/数学[I1]?\s*[・ ]?A[^0-9]{0,15}([0-9]{1,3})\s*\/\s*100/],["数学ⅡBC",/数学[II2]?\s*[・ ]?B[^0-9]{0,15}([0-9]{1,3})\s*\/\s*100/],["国語",/国語[^0-9]{0,15}([0-9]{1,3})\s*\/\s*(100|200)/],["総合1",/総合1[^0-9]{0,15}([0-9]{1,3})\s*\/\s*900/]];
  for(const [subject,re] of fallback){const el=document.getElementById(`score_${subject}`);if(el&&!el.value){const m=text.match(re);if(m)el.value=m[1];}}
  const dev=(text.match(/偏差値[^0-9]{0,12}([0-9]{2}(?:\.[0-9])?)/)||[])[1];const totalDev=document.getElementById("testDeviation");if(totalDev&&dev)totalDev.value=dev;
};
