const SC = window.SC || (window.SC = {});



/* Ver.19 生徒ホームに学習アドバイス追加 */
setTimeout(()=>{
  const oldStudentHome = SC.renderStudentHome;
  if(oldStudentHome && !SC.__v19StudentAdviceHome){
    SC.__v19StudentAdviceHome = true;
    SC.renderStudentHome = function(){
      oldStudentHome();
      setTimeout(()=>{
        const grid=document.querySelector(".modeHomeGrid");
        if(grid && !document.getElementById("studentAdviceTile")){
          grid.insertAdjacentHTML("afterbegin", `<button id="studentAdviceTile" class="modeTile" onclick="SC.renderStudentAdvice()"><h2>🤖 学習アドバイス</h2><p>今日やること・苦手復習を確認。</p></button>`);
        }
      },0);
    };
  }
},800);
