// 進学コンパス Ver.12 役割別ホーム整理版
// 入口：先生・生徒・ゲスト
// ホーム：従来ホーム
// 左上：ユーザー選択へ戻る
// 表示機能：役割別に出し分け

const SC = window.SC || (window.SC = {});

SC.currentMode = localStorage.getItem("sc_current_mode") || "guest";

function appEl(){
  return document.getElementById("app");
}

function roleLabel(){
  if(SC.currentProfile?.role === "teacher") return "先生ログイン中";
  if(SC.currentProfile?.role === "student") return "生徒ログイン中";
  if(SC.currentMode === "guest") return "ゲスト利用中";
  return "未選択";
}

function setMode(mode){
  SC.currentMode = mode;
  localStorage.setItem("sc_current_mode", mode);
}

SC.renderRoleSelect = function(){
  SC.closeMenu?.();
  const app = appEl();
  if(!app) return;

  const teacherLogged = SC.currentUser && SC.currentProfile?.role === "teacher";
  const studentLogged = SC.currentUser && SC.currentProfile?.role === "student";

  app.innerHTML = `
  <section class="card">
    <div style="text-align:center;padding:12px 0 18px;">
      <div style="font-size:54px;">🎓</div>
      <h1>進学コンパス</h1>
      <p class="help">利用するモードを選んでください。</p>
      <p class="help">${roleLabel()}</p>
    </div>

    <div class="grid">
      <button class="box" style="text-align:left;border:none;width:100%;cursor:pointer;" onclick="SC.enterTeacherMode()">
        <h2>👨‍🏫 先生として利用する ${teacherLogged ? "（ログイン済）" : ""}</h2>
        <p class="help">生徒管理・学習記録・ランキング・大学検索。</p>
        <b>${teacherLogged ? "先生画面へ" : "先生ログインへ"}</b>
      </button>

      <button class="box" style="text-align:left;border:none;width:100%;cursor:pointer;" onclick="SC.enterStudentMode()">
        <h2>🎓 生徒として利用する ${studentLogged ? "（ログイン済）" : ""}</h2>
        <p class="help">マイページ・学習記録・志望校・大学検索。</p>
        <b>${studentLogged ? "生徒画面へ" : "生徒ログインへ"}</b>
      </button>

      <button class="box" style="text-align:left;border:none;width:100%;cursor:pointer;" onclick="SC.enterGuestMode()">
        <h2>🌎 ゲストとして利用する</h2>
        <p class="help">ログインなしで大学検索・比較・診断。</p>
        <b>ゲストで始める</b>
      </button>
    </div>
  </section>`;
};

SC.enterTeacherMode = function(){
  setMode("teacher");
  if(SC.currentUser && SC.currentProfile?.role === "teacher"){
    SC.renderTeacherHome();
  }else{
    SC.renderTeacherLogin();
  }
};

SC.enterStudentMode = function(){
  setMode("student");
  if(SC.currentUser && SC.currentProfile?.role === "student"){
    SC.renderStudentHome();
  }else{
    SC.renderStudentLogin();
  }
};

SC.enterGuestMode = function(){
  setMode("guest");
  SC.renderGuestHome();
};

SC.renderTeacherLogin = function(){
  const app = appEl();
  app.innerHTML = `
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
  const app = appEl();
  app.innerHTML = `
  <section class="card">
    <h1>🎓 生徒ログイン</h1>
    <p class="help">生徒IDとパスワードでログインします。</p>
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
  setMode("teacher");
  const app = appEl();
  if(!app) return;

  app.innerHTML = `
  <section class="card">
    <h1>👨‍🏫 先生ホーム</h1>
    <p class="help">先生向け機能をまとめています。</p>
    <div class="grid">
      <button class="box" onclick="SC.renderTeacherDashboard()" style="text-align:left;border:none;cursor:pointer;">
        <h2>📊 先生ダッシュボード</h2>
        <p class="help">生徒一覧・学習時間・ランキング。</p>
      </button>
      <button class="box" onclick="SC.renderAddStudent()" style="text-align:left;border:none;cursor:pointer;">
        <h2>＋ 生徒追加</h2>
        <p class="help">生徒IDと初期パスワードを発行。</p>
      </button>
      <button class="box" onclick="SC.renderTeacherRanking()" style="text-align:left;border:none;cursor:pointer;">
        <h2>🏆 ランキング</h2>
        <p class="help">今日・直近7日・今月の学習時間。</p>
      </button>
      <button class="box" onclick="SC.go('home')" style="text-align:left;border:none;cursor:pointer;">
        <h2>🎓 大学検索ホーム</h2>
        <p class="help">従来の大学検索・比較・診断へ。</p>
      </button>
    </div>
  </section>`;
};

SC.renderStudentHome = function(){
  setMode("student");
  const app = appEl();
  if(!app) return;

  app.innerHTML = `
  <section class="card">
    <h1>🎓 生徒ホーム</h1>
    <p class="help">自分の学習記録・志望校管理を使います。</p>
    <div class="grid">
      <button class="box" onclick="SC.renderStudentDashboard()" style="text-align:left;border:none;cursor:pointer;">
        <h2>👤 マイページ</h2>
        <p class="help">自分の情報・学習状況を確認。</p>
      </button>
      <button class="box" onclick="SC.renderStudyForm()" style="text-align:left;border:none;cursor:pointer;">
        <h2>📚 勉強記録</h2>
        <p class="help">今日の勉強時間を入力。</p>
      </button>
      <button class="box" onclick="SC.loadMyStudyLogs()" style="text-align:left;border:none;cursor:pointer;">
        <h2>📈 自分の記録</h2>
        <p class="help">教科別・日別の記録を確認。</p>
      </button>
      <button class="box" onclick="SC.go('home')" style="text-align:left;border:none;cursor:pointer;">
        <h2>🎓 大学検索ホーム</h2>
        <p class="help">大学検索・比較・診断へ。</p>
      </button>
    </div>
  </section>`;
};

SC.renderGuestHome = function(){
  setMode("guest");
  const app = appEl();
  if(!app) return;

  app.innerHTML = `
  <section class="card">
    <h1>🌎 ゲストホーム</h1>
    <p class="help">ログインなしで進路検索機能を利用できます。</p>
    <div class="grid">
      <button class="box" onclick="SC.go('home')" style="text-align:left;border:none;cursor:pointer;">
        <h2>🏠 ホーム</h2>
        <p class="help">進学コンパスの通常ホーム。</p>
      </button>
      <button class="box" onclick="SC.go('search')" style="text-align:left;border:none;cursor:pointer;">
        <h2>🔍 大学検索</h2>
        <p class="help">大学・学部・分野から探す。</p>
      </button>
      <button class="box" onclick="SC.go('compare')" style="text-align:left;border:none;cursor:pointer;">
        <h2>📊 大学比較</h2>
        <p class="help">候補大学を比べる。</p>
      </button>
      <button class="box" onclick="SC.go('ai')" style="text-align:left;border:none;cursor:pointer;">
        <h2>🤖 AI進路診断</h2>
        <p class="help">興味や条件から考える。</p>
      </button>
    </div>
  </section>`;
};

// 通常ホームへ戻る動きは既存の SC.go('home') を維持。
// 役割選択へ戻る専用ボタンは SC.renderRoleSelect。

// メニューも役割別に整理
SC.renderRoleMenu = function(){
  const mode = SC.currentProfile?.role || SC.currentMode || "guest";

  if(mode === "teacher"){
    return `
      <button onclick="SC.renderTeacherHome()">👨‍🏫 先生ホーム</button>
      <button onclick="SC.renderTeacherDashboard()">📊 ダッシュボード</button>
      <button onclick="SC.renderAddStudent()">＋ 生徒追加</button>
      <button onclick="SC.renderTeacherRanking()">🏆 ランキング</button>
      <button onclick="SC.go('search')">🔍 大学検索</button>
      <button onclick="SC.renderRoleSelect()">← ユーザー選択へ</button>
      <button onclick="SC.logout()">🚪 ログアウト</button>
    `;
  }

  if(mode === "student"){
    return `
      <button onclick="SC.renderStudentHome()">🎓 生徒ホーム</button>
      <button onclick="SC.renderStudentDashboard()">👤 マイページ</button>
      <button onclick="SC.renderStudyForm()">📚 勉強記録</button>
      <button onclick="SC.loadMyStudyLogs()">📈 自分の記録</button>
      <button onclick="SC.go('search')">🔍 大学検索</button>
      <button onclick="SC.renderRoleSelect()">← ユーザー選択へ</button>
      <button onclick="SC.logout()">🚪 ログアウト</button>
    `;
  }

  return `
    <button onclick="SC.renderGuestHome()">🌎 ゲストホーム</button>
    <button onclick="SC.go('home')">🏠 ホーム</button>
    <button onclick="SC.go('search')">🔍 大学検索</button>
    <button onclick="SC.go('compare')">📊 大学比較</button>
    <button onclick="SC.go('ai')">🤖 AI進路診断</button>
    <button onclick="SC.renderRoleSelect()">← ユーザー選択へ</button>
  `;
};

// 既存メニューを開いた時、パネル内容を役割別に差し替える
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

// 起動時の分岐
window.addEventListener("load", () => {
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
    if(last === "guest"){
      SC.renderGuestHome();
    }else{
      SC.renderRoleSelect();
    }
  }, 1000);
});
