
// Ver.15 AIスキャン導線追加
setTimeout(()=>{
  const oldStudentHome=SC.renderStudentHome;
  if(oldStudentHome && !SC.__v15StudentHomePatched){
    SC.__v15StudentHomePatched=true;
    SC.renderStudentHome=function(){
      oldStudentHome();
      setTimeout(()=>{
        const grid=document.querySelector(".modeHomeGrid");
        if(grid && !document.getElementById("aiScanTileStudent")){
          grid.insertAdjacentHTML("beforeend",`<button id="aiScanTileStudent" class="modeTile" onclick="SC.renderAIScan()"><h2>📷 AIスキャン</h2><p>模試・定期テスト・通知表・自己採点を記録。</p></button><button id="testRecordTileStudent" class="modeTile" onclick="SC.renderMyTestRecords()"><h2>🧾 テスト記録</h2><p>保存した模試・テスト結果を見る。</p></button>`);
        }
      },0);
    };
  }
  const oldGuestHome=SC.renderGuestHome;
  if(oldGuestHome && !SC.__v15GuestHomePatched){
    SC.__v15GuestHomePatched=true;
    SC.renderGuestHome=function(){
      oldGuestHome();
      setTimeout(()=>{
        const grid=document.querySelector(".modeHomeGrid");
        if(grid && !document.getElementById("aiScanTileGuest")){
          grid.insertAdjacentHTML("beforeend",`<button id="aiScanTileGuest" class="modeTile" onclick="SC.renderAIScanGuestNotice()"><h2>📷 AIスキャン</h2><p>ログインするとテスト結果を保存できます。</p></button>`);
        }
      },0);
    };
  }
},1200);
