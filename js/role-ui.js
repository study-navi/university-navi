// 進学コンパス Ver.13.3 UI修正版
// 左上ボタン短縮・役割別ホーム完全分離・下ナビ安定化

const SC = window.SC || (window.SC = {});
SC.currentMode = localStorage.getItem("sc_current_mode") || "guest";

function appEl(){ return document.getElementById("app"); }

function setMode(mode){
  SC.currentMode = mode;
  localStorage.setItem("sc_current_mode", mode);
  setTimeout(() => SC.updateRoleNav?.(), 0);
}

function roleText(){
  if(SC.currentProfile?.role === "teacher") return "先生ログイン中";
  if(SC.currentProfile?.role === "student") return "生徒ログイン中";
  if(SC.currentMode === "guest") return "ゲスト利用中";
  return "未選択";
}

function injectRoleStyles(){
  if(document.getElementById("roleUiStyle")) return;
  const style = document.createElement("style");
  style.id = "roleUiStyle";
  style.textContent = `
    .topbar{
      display:grid !important;
      grid-template-columns:64px minmax(0,1fr) auto;
      align-items:center;
      gap:8px;
      padding-left:10px !important;
      padding-right:10px !important;
    }
    .brand{
      min-width:0;
      justify-content:center;
      overflow:hidden;
    }
    .brand span{
      white-space:nowrap !important;
      overflow:hidden;
      text-overflow:ellipsis;
      font-size:clamp(22px, 6vw, 32px) !important;
      line-height:1.1 !important;
    }
    .brand img{width:24px;height:24px;flex:0 0 auto;}
    #roleSwitchBtn{
      border:0 !important;
      background:rgba(255,255,255,.16) !important;
      color:white !important;
      font-weight:900 !important;
      border-radius:999px !important;
      padding:8px 10px !important;
      font-size:13px !important;
      white-space:nowrap !important;
      width:58px !important;
      max-width:58px !important;
      overflow:visible !important;
      text-align:center !important;
    }
    .topMenu{
      white-space:nowrap;
      font-size:clamp(17px,4.2vw,26px) !important;
    }
    .roleHero{
      margin:20px auto;
      border-radius:30px;
      padding:30px 22px;
      background:linear-gradient(160deg,#ffffff 0%,#eef6ff 52%,#dcecff 100%);
      box-shadow:0 18px 45px rgba(20,59,115,.12);
      border:1px solid #d6e6fb;
    }
    .roleHeroTitle{text-align:center;margin-bottom:24px;}
    .roleLogo{
      width:78px;height:78px;border-radius:24px;margin:0 auto 12px;
      display:flex;align-items:center;justify-content:center;
      background:linear-gradient(160deg,#143b73,#2268bd);
      color:white;font-size:42px;box-shadow:0 12px 28px rgba(20,59,115,.25);
    }
    .roleCards{display:grid;gap:14px;}
    .roleCard{
      width:100%;border:0;border-radius:24px;padding:20px;
      text-align:left;background:white;color:#0b2d5c;
      box-shadow:0 10px 24px rgba(20,59,115,.10);
      border:1px solid #dce9f8;
      cursor:pointer;
    }
    .roleCard h2{font-size:24px;margin:0 0 8px;}
    .roleCard p{margin:0 0 12px;line-height:1.55;color:#58708f;}
    .roleCard b{color:#0a63c7;font-size:16px;}
    .rolePill{
      display:inline-block;border-radius:999px;padding:7px 12px;
      background:#e8f2ff;color:#143b73;font-weight:800;font-size:13px;
    }
    .modeHomeGrid{display:grid;gap:14px;}
    .modeTile{
      border:none;border-radius:22px;background:white;padding:18px;text-align:left;
      box-shadow:0 8px 22px rgba(20,59,115,.09);
      border:1px solid #dce9f8;color:#0b2d5c;
    }
    .modeTile h2{margin:0 0 8px;font-size:22px;}
    .modeTile p{margin:0;color:#58708f;line-height:1.5;}
    .modeNotice{
      border-radius:18px;
      padding:14px 16px;
      background:#f3f8ff;
      border:1px solid #dce9f8;
      color:#143b73;
      margin-bottom:14px;
      font-weight:700;
    }
    @media (min-width:720px){
      .roleCards{grid-template-columns:1fr 1fr 1fr;}
      .modeHomeGrid{grid-template-columns:1fr 1fr;}
    }
  `;
  document.head.appendChild(style);

  const btn = document.getElementById("roleSwitchBtn");
  if(btn) btn.textContent = "切替";
}

SC.renderRoleSelect = function(){
  injectRoleStyles();
  const btn = document.getElementById("roleSwitchBtn");
  if(btn) btn.textContent = "切替";

  SC.closeMenu?.();
  setTimeout(() => SC.updateRoleNav?.(), 0);

  const app = appEl();
  if(!app) return;

  const teacherLogged = SC.currentUser && SC.currentProfile?.role === "teacher";
  const studentLogged = SC.currentUser && SC.currentProfile?.role === "student";

  app.innerHTML = `
  <section class="roleHero">
    <div class="roleHeroTitle">
      <div class="roleLogo">🎓</div>
      <h1>進学コンパス</h1>
      <p class="help">利用するモードを選んでください。</p>
      <span class="rolePill">${roleText()}</span>
    </div>

    <div class="roleCards">
      <button class="roleCard" onclick="SC.enterTeacherMode()">
        <h2>👨‍🏫 先生</h2>
        <p>生徒管理・学習記録・ランキングを使います。</p>
        <b>${teacherLogged ? "ログイン済み・先生ホームへ" : "先生ログインへ"}</b>
      </button>
      <button class="roleCard" onclick="SC.enterStudentMode()">
        <h2>🎓 生徒</h2>
        <p>マイページ・勉強記録・夢好き診断を使います。</p>
        <b>${studentLogged ? "ログイン済み・生徒ホームへ" : "生徒ログインへ"}</b>
      </button>
      <button class="roleCard" onclick="SC.enterGuestMode()">
        <h2>🌎 ゲスト</h2>
        <p>大学検索・比較・夢好き診断だけ使います。</p>
        <b>ゲストで始める</b>
      </button>
    </div>
  </section>`;
};

SC.enterTeacherMode = function(){
  setMode("teacher");
  if(SC.currentUser && SC.currentProfile?.role === "teacher") SC.renderTeacherHome();
  else SC.renderTeacherLogin();
};

SC.enterStudentMode = function(){
  setMode("student");
  if(SC.currentUser && SC.currentProfile?.role === "student") SC.renderStudentHome();
  else SC.renderStudentLogin();
};

SC.enterGuestMode = function(){
  setMode("guest");
  SC.renderGuestHome();
};

SC.renderTeacherLogin = function(){
  injectRoleStyles();
  appEl().innerHTML = `
  <section class="card">
    <h1>👨‍🏫 先生ログイン</h1>
    <p class="help">ログアウトするまでログイン状態は保持されます。</p>
    <label>メールアドレス</label>
    <input id="teacherEmailInput" value="teacher@shingaku-compass.com">
    <label>パスワード</label>
    <input id="teacherPasswordInput" type="password" placeholder="パスワード">
    <div class="actions">
      <button class="btn navy" onclick="SC.loginTeacher()">ログイン</button>
      <button class="btn light" onclick="SC.renderRoleSelect()">戻る</button>
    </div>
    <p id="teacherLoginMsg" class="help"></p>
  </section>`;
};

SC.renderStudentLogin = function(){
  injectRoleStyles();
  appEl().innerHTML = `
  <section class="card">
    <h1>🎓 生徒ログイン</h1>
    <p class="help">先生から発行された生徒IDとパスワードでログインします。</p>
    <label>生徒ID</label>
    <input id="studentIdInput" placeholder="例：KYOWA001">
    <label>パスワード</label>
    <input id="studentPasswordInput" type="password" placeholder="パスワード">
    <div class="actions">
      <button class="btn primary" onclick="SC.loginStudent()">ログイン</button>
      <button class="btn light" onclick="SC.renderRoleSelect()">戻る</button>
    </div>
    <p id="studentLoginMsg" class="help"></p>
  </section>`;
};

SC.renderTeacherHome = function(){
  injectRoleStyles();
  setMode("teacher");
  appEl().innerHTML = `
  <section class="card">
    <h1>👨‍🏫 先生ホーム</h1>
    <div class="modeNotice">先生用：生徒管理・学習管理・進路相談に必要な機能だけ表示しています。</div>
    <div class="modeHomeGrid">
      <button class="modeTile" onclick="SC.renderTeacherDashboard()"><h2>📊 ダッシュボード</h2><p>生徒一覧・学習時間・ランキング。</p></button>
      <button class="modeTile" onclick="SC.renderAddStudent()"><h2>＋ 生徒追加</h2><p>生徒IDと初期パスワードを発行。</p></button>
      <button class="modeTile" onclick="SC.renderTeacherRanking()"><h2>🏆 ランキング</h2><p>今日・直近7日・今月の順位。</p></button>
      <button class="modeTile" onclick="SC.go('search')"><h2>🔍 大学検索</h2><p>生徒の志望校相談に使う。</p></button>
    </div>
  </section>`;
};

SC.renderStudentHome = function(){
  injectRoleStyles();
  setMode("student");
  appEl().innerHTML = `
  <section class="card">
    <h1>🎓 生徒ホーム</h1>
    <div class="modeNotice">生徒用：自分の学習・進路に関係する機能だけ表示しています。</div>
    <div class="modeHomeGrid">
      <button class="modeTile" onclick="SC.renderStudentDashboard()"><h2>👤 マイページ</h2><p>自分の情報・学習状況を確認。</p></button>
      <button class="modeTile" onclick="SC.renderStudyForm()"><h2>📚 勉強記録</h2><p>今日の勉強時間を入力。</p></button>
      <button class="modeTile" onclick="SC.loadMyStudyLogs()"><h2>📈 自分の記録</h2><p>教科別・日別の記録を確認。</p></button>
      <button class="modeTile" onclick="SC.go('dream')"><h2>💭 夢・好き</h2><p>興味から進路を探す。</p></button>
      <button class="modeTile" onclick="SC.go('search')"><h2>🔍 大学検索</h2><p>志望校や学部を調べる。</p></button>
    </div>
  </section>`;
};

SC.renderGuestHome = function(){
  injectRoleStyles();
  setMode("guest");
  appEl().innerHTML = `
  <section class="card">
    <h1>🌎 ゲストホーム</h1>
    <div class="modeNotice">ゲスト用：ログインなしで使える進路検索機能だけ表示しています。</div>
    <div class="modeHomeGrid">
      <button class="modeTile" onclick="SC.go('dream')"><h2>💭 夢・好き</h2><p>興味から進路を探す。</p></button>
      <button class="modeTile" onclick="SC.go('search')"><h2>🔍 大学検索</h2><p>大学・学部・分野から探す。</p></button>
      <button class="modeTile" onclick="SC.go('compare')"><h2>📊 大学比較</h2><p>候補大学を比べる。</p></button>
      <button class="modeTile" onclick="SC.go('ai')"><h2>🤖 AI進路診断</h2><p>興味や条件から考える。</p></button>
    </div>
  </section>`;
};

SC.updateRoleNav = function(){
  const nav = document.querySelector(".bottomNav");
  if(!nav) return;

  const mode = SC.currentProfile?.role || SC.currentMode || "guest";

  if(mode === "teacher"){
    nav.innerHTML = `
      <button onclick="SC.renderTeacherHome()">🏠<span>先生</span></button>
      <button onclick="SC.renderTeacherDashboard()">👥<span>生徒管理</span></button>
      <button onclick="SC.renderTeacherRanking()">📊<span>ランキング</span></button>
      <button onclick="SC.openMenu()">☰<span>メニュー</span></button>`;
  }else if(mode === "student"){
    nav.innerHTML = `
      <button onclick="SC.renderStudentHome()">🏠<span>ホーム</span></button>
      <button onclick="SC.renderStudyForm()">📚<span>勉強</span></button>
      <button onclick="SC.go('dream')">💭<span>夢・好き</span></button>
      <button onclick="SC.renderStudentDashboard()">👤<span>マイページ</span></button>`;
  }else{
    nav.innerHTML = `
      <button onclick="SC.renderGuestHome()">🏠<span>ホーム</span></button>
      <button onclick="SC.go('dream')">💭<span>夢・好き</span></button>
      <button onclick="SC.go('search')">🔍<span>検索</span></button>
      <button onclick="SC.go('compare')">📊<span>比較</span></button>`;
  }
};

SC.renderRoleMenu = function(){
  const mode = SC.currentProfile?.role || SC.currentMode || "guest";
  if(mode === "teacher"){
    return `
      <button onclick="SC.renderTeacherHome()">👨‍🏫 先生ホーム</button>
      <button onclick="SC.renderTeacherDashboard()">📊 ダッシュボード</button>
      <button onclick="SC.renderAddStudent()">＋ 生徒追加</button>
      <button onclick="SC.renderTeacherRanking()">🏆 ランキング</button>
      <button onclick="SC.go('search')">🔍 大学検索</button>
      <button onclick="SC.renderRoleSelect()">切替</button>
      <button onclick="SC.logout()">🚪 ログアウト</button>`;
  }
  if(mode === "student"){
    return `
      <button onclick="SC.renderStudentHome()">🎓 生徒ホーム</button>
      <button onclick="SC.renderStudentDashboard()">👤 マイページ</button>
      <button onclick="SC.renderStudyForm()">📚 勉強記録</button>
      <button onclick="SC.loadMyStudyLogs()">📈 自分の記録</button>
      <button onclick="SC.go('dream')">💭 夢・好き</button>
      <button onclick="SC.go('search')">🔍 大学検索</button>
      <button onclick="SC.renderRoleSelect()">切替</button>
      <button onclick="SC.logout()">🚪 ログアウト</button>`;
  }
  return `
    <button onclick="SC.renderGuestHome()">🌎 ゲストホーム</button>
    <button onclick="SC.go('dream')">💭 夢・好き</button>
    <button onclick="SC.go('search')">🔍 大学検索</button>
    <button onclick="SC.go('compare')">📊 大学比較</button>
    <button onclick="SC.go('ai')">🤖 AI進路診断</button>
    <button onclick="SC.renderRoleSelect()">切替</button>`;
};

const originalOpenMenu = SC.openMenu;
SC.openMenu = function(){
  if(originalOpenMenu) originalOpenMenu.call(SC);
  setTimeout(() => {
    const panel = document.querySelector(".menuPanel");
    if(panel){
      panel.innerHTML = `<h2>メニュー</h2>${SC.renderRoleMenu()}<button onclick="SC.closeMenu()">閉じる</button>`;
    }
  }, 0);
};

window.addEventListener("load", () => {
  injectRoleStyles();
  const btn = document.getElementById("roleSwitchBtn");
  if(btn) btn.textContent = "切替";

  setTimeout(() => {
    if(SC.currentUser && SC.currentProfile?.role === "teacher"){
      setMode("teacher");
      SC.renderTeacherHome();
      return;
    }
    if(SC.currentUser && SC.currentProfile?.role === "student"){
      setMode("student");
      SC.renderStudentHome();
      return;
    }
    const last = localStorage.getItem("sc_current_mode");
    if(last === "guest") SC.renderGuestHome();
    else SC.renderRoleSelect();
  }, 1000);
});
