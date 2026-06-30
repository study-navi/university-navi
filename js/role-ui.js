
// Ver.16 AIスキャン導線
setTimeout(()=>{
  const oldS=SC.renderStudentHome;
  if(oldS && !SC.__v16s){SC.__v16s=true;SC.renderStudentHome=function(){oldS();setTimeout(()=>{const g=document.querySelector(".modeHomeGrid");if(g&&!document.getElementById("aiScanTileStudent"))g.insertAdjacentHTML("beforeend",`<button id="aiScanTileStudent" class="modeTile" onclick="SC.renderAIScan()"><h2>📷 AIスキャン</h2><p>模試・定期テスト・通知表・自己採点を記録。</p></button><button id="testRecordTileStudent" class="modeTile" onclick="SC.renderMyTestRecords()"><h2>🧾 テスト記録</h2><p>保存した結果を見る。</p></button>`);},0);};}
  const oldT=SC.renderTeacherHome;
  if(oldT && !SC.__v16t){SC.__v16t=true;SC.renderTeacherHome=function(){oldT();setTimeout(()=>{const g=document.querySelector(".modeHomeGrid");if(g&&!document.getElementById("testRecordTileTeacher"))g.insertAdjacentHTML("beforeend",`<button id="testRecordTileTeacher" class="modeTile" onclick="SC.renderAllTestRecordsForTeacher && SC.renderAllTestRecordsForTeacher()"><h2>🧾 テスト記録</h2><p>生徒の模試・テスト結果を確認。</p></button>`);},0);};}
},1200);
