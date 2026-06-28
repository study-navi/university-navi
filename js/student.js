const SC = window.SC || (window.SC = {});

SC.renderStudentDashboard = function(){
  SC.closeMenu?.();
  if(!SC.currentUser){ SC.renderLogin(); return; }
  const p = SC.currentProfile || {};
  document.getElementById("app").innerHTML = `
  <section class="card">
    <h1>🎓 生徒画面</h1>
    <p class="help">${p.name || "生徒"}さんの学習記録を保存できます。</p>
    <div class="actions">
      <button class="btn primary" onclick="SC.renderStudyForm()">勉強記録を入力</button>
      <button class="btn navy" onclick="SC.loadMyStudyLogs()">自分の記録</button>
      <button class="btn light" onclick="SC.go('home')">大学検索へ</button>
      <button class="btn light" onclick="SC.logout()">ログアウト</button>
    </div>
    <div id="studentMain" class="box">学習記録を入力できます。</div>
  </section>`;
};

SC.renderStudyForm = function(){
  const today = new Date().toISOString().slice(0,10);
  document.getElementById("studentMain").innerHTML = `
    <h2>📚 勉強記録</h2>
    <label>日付</label><input id="studyDate" type="date" value="${today}">
    <label>教科</label>
    <select id="studySubject"><option>英語</option><option>数学</option><option>国語</option><option>理科</option><option>社会</option><option>情報</option><option>その他</option></select>
    <label>時間（分）</label><input id="studyMinutes" type="number" min="1">
    <label>メモ</label><textarea id="studyMemo"></textarea>
    <button class="btn primary" onclick="SC.saveStudyLog()">保存</button>
    <p id="studySaveMsg" class="help"></p>`;
};
