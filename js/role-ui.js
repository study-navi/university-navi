const SC = window.SC || (window.SC = {});
SC.currentMode = localStorage.getItem("sc_current_mode") || "guest";
SC.historyStack = [];
SC.isNavigatingBack = false;

SC.pushHistory = function(viewName){
  if(SC.isNavigatingBack) return;
  if(viewName) SC.historyStack.push(viewName);
  SC.updateBackButton();
};
SC.goBack = function(){
  if(SC.historyStack.length <= 1){
    const mode=SC.currentProfile?.role||SC.currentMode||"guest";
    if(mode==="teacher") SC.renderTeacherHome();
    else if(mode==="student") SC.renderStudentHome();
    else SC.renderGuestHome();
    return;
  }
  SC.isNavigatingBack = true;
  SC.historyStack.pop();
  const prev = SC.historyStack.pop();
  SC.updateBackButton();
  if(prev && SC[prev]) SC[prev]();
  SC.isNavigatingBack = false;
};
SC.updateBackButton=function(){
  const btn=document.getElementById("backBtn");
  if(!btn)return;
  btn.style.display=SC.historyStack.length>1?"inline-block":"none";
};

const setMode = m => {SC.currentMode=m;localStorage.setItem("sc_current_mode",m);setTimeout(()=>SC.updateRoleNav?.(),0)};
const roleText = () => SC.currentProfile?.role==="teacher"?"先生ログイン中":SC.currentProfile?.role==="student"?"生徒ログイン中":SC.currentMode==="guest"?"ゲスト利用中":"未選択";
SC.closeMenu=()=>document.querySelector(".menuPanel")?.remove();
SC.openMenu=function(){SC.closeMenu();const p=document.createElement("div");p.className="menuPanel";p.innerHTML=`<h2>メニュー</h2>${SC.renderRoleMenu()}<button onclick="SC.closeMenu()">閉じる</button>`;document.body.appendChild(p)};

SC.renderRoleSelect=function(){
  SC.pushHistory("renderRoleSelect"); SC.closeMenu();
  const teacherLogged=SC.currentUser&&SC.currentProfile?.role==="teacher";
  const studentLogged=SC.currentUser&&SC.currentProfile?.role==="student";
  document.getElementById("app").innerHTML=`<section class="roleHero"><div class="roleHeroTitle"><div class="roleLogo">🎓</div><h1>進学コンパス</h1><p class="help">利用するモードを選んでください。</p><span class="rolePill">${roleText()}</span></div><div class="roleCards">
  <button class="roleCard" onclick="SC.enterTeacherMode()"><h2>👨‍🏫 先生</h2><p>生徒管理・学習記録・ランキングを使います。</p><b>${teacherLogged?"ログイン済み・先生ホームへ":"先生ログインへ"}</b></button>
  <button class="roleCard" onclick="SC.enterStudentMode()"><h2>🎓 生徒</h2><p>マイページ・勉強記録・AIスキャンを使います。</p><b>${studentLogged?"ログイン済み・生徒ホームへ":"生徒ログインへ"}</b></button>
  <button class="roleCard" onclick="SC.enterGuestMode()"><h2>🌎 ゲスト</h2><p>大学検索・比較・夢好き診断だけ使います。</p><b>ゲストで始める</b></button>
  </div></section>`;SC.updateRoleNav();SC.updateBackButton();
};
SC.enterTeacherMode=()=>{setMode("teacher");(SC.currentUser&&SC.currentProfile?.role==="teacher")?SC.renderTeacherHome():SC.renderTeacherLogin()};
SC.enterStudentMode=()=>{setMode("student");(SC.currentUser&&SC.currentProfile?.role==="student")?SC.renderStudentHome():SC.renderStudentLogin()};
SC.enterGuestMode=()=>{setMode("guest");SC.renderGuestHome()};

SC.renderTeacherLogin=()=>{SC.pushHistory("renderTeacherLogin");document.getElementById("app").innerHTML=`<section class="card"><h1>👨‍🏫 先生ログイン</h1><label>メールアドレス</label><input id="teacherEmailInput" value="teacher@shingaku-compass.com"><label>パスワード</label><input id="teacherPasswordInput" type="password"><div class="actions"><button class="btn navy" onclick="SC.loginTeacher()">ログイン</button><button class="btn light" onclick="SC.renderRoleSelect()">戻る</button></div><p id="teacherLoginMsg" class="help"></p></section>`;SC.updateBackButton();};
SC.renderStudentLogin=()=>{SC.pushHistory("renderStudentLogin");document.getElementById("app").innerHTML=`<section class="card"><h1>🎓 生徒ログイン</h1><label>生徒ID</label><input id="studentIdInput" placeholder="例：KYOWA001"><label>パスワード</label><input id="studentPasswordInput" type="password"><div class="actions"><button class="btn primary" onclick="SC.loginStudent()">ログイン</button><button class="btn light" onclick="SC.renderRoleSelect()">戻る</button></div><p id="studentLoginMsg" class="help"></p></section>`;SC.updateBackButton();};

SC.renderTeacherHome=function(){SC.pushHistory("renderTeacherHome");setMode("teacher");document.getElementById("app").innerHTML=`<section class="card"><h1>👨‍🏫 先生ホーム</h1><div class="modeNotice">先生用：生徒管理・学習管理・進路相談に必要な機能だけ表示しています。</div><div class="modeHomeGrid"><button class="modeTile" onclick="SC.renderTeacherDashboard()"><h2>📊 ダッシュボード</h2><p>生徒一覧・学習時間・ランキング。</p></button><button class="modeTile" onclick="SC.renderAddStudentPage()"><h2>＋ 生徒追加</h2><p>生徒IDと初期パスワードを発行。</p></button><button class="modeTile" onclick="SC.renderTeacherRanking()"><h2>🏆 ランキング</h2><p>学習時間の順位。</p></button><button class="modeTile" onclick="SC.renderAllTestRecordsForTeacher()"><h2>🧾 テスト記録</h2><p>模試・テスト結果を確認。</p></button><button class="modeTile" onclick="SC.goSearch()"><h2>🔍 大学検索</h2><p>志望校相談に使う。</p></button></div></section>`;SC.updateBackButton();};
SC.renderStudentHome=function(){SC.pushHistory("renderStudentHome");setMode("student");document.getElementById("app").innerHTML=`<section class="card"><h1>🎓 生徒ホーム</h1><div class="modeNotice">生徒用：自分の学習・進路に関係する機能だけ表示しています。</div><div class="modeHomeGrid"><button class="modeTile" onclick="SC.renderStudentDashboard()"><h2>👤 マイページ</h2><p>学習状況・受験日数を確認。</p></button><button class="modeTile" onclick="SC.renderStudyForm()"><h2>📚 勉強記録</h2><p>今日の勉強時間を入力。</p></button><button class="modeTile" onclick="SC.loadMyStudyLogs()"><h2>📈 自分の記録</h2><p>日別・教科別の記録。</p></button><button class="modeTile" onclick="SC.renderAIScan()"><h2>📷 AIスキャン</h2><p>模試・定期テスト・自己採点を記録。</p></button><button class="modeTile" onclick="SC.renderMyTestRecords()"><h2>🧾 テスト記録</h2><p>保存した結果を見る。</p></button><button class="modeTile" onclick="SC.goDream()"><h2>💭 夢・好き</h2><p>興味から進路を探す。</p></button><button class="modeTile" onclick="SC.goSearch()"><h2>🔍 大学検索</h2><p>志望校や学部を調べる。</p></button></div></section>`;SC.updateBackButton();};
SC.renderGuestHome=function(){SC.pushHistory("renderGuestHome");setMode("guest");document.getElementById("app").innerHTML=`<section class="card"><h1>🌎 ゲストホーム</h1><div class="modeNotice">ゲスト用：ログインなしで使える進路検索機能だけ表示しています。</div><div class="modeHomeGrid"><button class="modeTile" onclick="SC.goDream()"><h2>💭 夢・好き</h2><p>興味から進路を探す。</p></button><button class="modeTile" onclick="SC.goSearch()"><h2>🔍 大学検索</h2><p>大学・学部・分野から探す。</p></button><button class="modeTile" onclick="SC.goCompare()"><h2>📊 大学比較</h2><p>候補大学を比べる。</p></button><button class="modeTile" onclick="SC.renderAIScanGuestNotice()"><h2>📷 AIスキャン</h2><p>ログインすると保存できます。</p></button></div></section>`;SC.updateBackButton();};

SC.updateRoleNav=function(){const nav=document.querySelector(".bottomNav");if(!nav)return;const mode=SC.currentProfile?.role||SC.currentMode||"guest";if(mode==="teacher")nav.innerHTML=`<button onclick="SC.renderTeacherHome()">🏠<span>先生</span></button><button onclick="SC.renderTeacherDashboard()">👥<span>生徒管理</span></button><button onclick="SC.renderTeacherRanking()">📊<span>ランキング</span></button><button onclick="SC.openMenu()">☰<span>メニュー</span></button>`;else if(mode==="student")nav.innerHTML=`<button onclick="SC.renderStudentHome()">🏠<span>ホーム</span></button><button onclick="SC.renderStudyForm()">📚<span>勉強</span></button><button onclick="SC.renderAIScan()">📷<span>スキャン</span></button><button onclick="SC.renderStudentDashboard()">👤<span>マイページ</span></button>`;else nav.innerHTML=`<button onclick="SC.renderGuestHome()">🏠<span>ホーム</span></button><button onclick="SC.goDream()">💭<span>夢・好き</span></button><button onclick="SC.goSearch()">🔍<span>検索</span></button><button onclick="SC.goCompare()">📊<span>比較</span></button>`};
SC.renderRoleMenu=function(){const mode=SC.currentProfile?.role||SC.currentMode||"guest";if(mode==="teacher")return`<button onclick="SC.renderTeacherHome()">👨‍🏫 先生ホーム</button><button onclick="SC.renderTeacherDashboard()">📊 ダッシュボード</button><button onclick="SC.renderAddStudentPage()">＋ 生徒追加</button><button onclick="SC.renderAllTestRecordsForTeacher()">🧾 テスト記録</button><button onclick="SC.renderRoleSelect()">切替</button><button onclick="SC.logout()">🚪 ログアウト</button>`;if(mode==="student")return`<button onclick="SC.renderStudentHome()">🎓 生徒ホーム</button><button onclick="SC.renderStudentDashboard()">👤 マイページ</button><button onclick="SC.renderStudyForm()">📚 勉強記録</button><button onclick="SC.renderAIScan()">📷 AIスキャン</button><button onclick="SC.renderMyTestRecords()">🧾 テスト記録</button><button onclick="SC.renderRoleSelect()">切替</button><button onclick="SC.logout()">🚪 ログアウト</button>`;return`<button onclick="SC.renderGuestHome()">🌎 ゲストホーム</button><button onclick="SC.goDream()">💭 夢・好き</button><button onclick="SC.goSearch()">🔍 大学検索</button><button onclick="SC.goCompare()">📊 大学比較</button><button onclick="SC.renderRoleSelect()">切替</button>`};
SC.goDream=()=>{SC.pushHistory("goDream");document.getElementById("app").innerHTML=`<section class="card"><h1>💭 夢・好き</h1><div class="box">興味から進路を探す機能です。</div></section>`;SC.updateBackButton();};
SC.goSearch=()=>{SC.pushHistory("goSearch");document.getElementById("app").innerHTML=`<section class="card"><h1>🔍 大学検索</h1><div class="box">大学検索機能です。</div></section>`;SC.updateBackButton();};
SC.goCompare=()=>{SC.pushHistory("goCompare");document.getElementById("app").innerHTML=`<section class="card"><h1>📊 大学比較</h1><div class="box">大学比較機能です。</div></section>`;SC.updateBackButton();};
window.addEventListener("load",()=>setTimeout(()=>{if(SC.currentUser&&SC.currentProfile?.role==="teacher")SC.renderTeacherHome();else if(SC.currentUser&&SC.currentProfile?.role==="student")SC.renderStudentHome();else SC.renderRoleSelect()},800));
