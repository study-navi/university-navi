// 進学コンパス Ver.10 スタート画面
// 最初に「先生・生徒・ゲスト」を選べるようにする

const SC = window.SC || (window.SC = {});

SC.renderWelcome = function(){
  SC.closeMenu?.();
  const app = document.getElementById("app");
  if(!app) return;

  app.innerHTML = `
  <section class="card">
    <div style="text-align:center;padding:10px 0 18px;">
      <div style="font-size:52px;">🎓</div>
      <h1 style="margin:8px 0 4px;">進学コンパス</h1>
      <p class="help">大学検索と学習管理をひとつに。</p>
    </div>

    <div class="grid">
      <button class="box" style="text-align:left;border:none;width:100%;cursor:pointer;" onclick="SC.renderLoginTeacherOnly()">
        <h2>👨‍🏫 先生として始める</h2>
        <p class="help">生徒管理・学習記録・ランキングを確認します。</p>
        <b>先生ログインへ</b>
      </button>

      <button class="box" style="text-align:left;border:none;width:100%;cursor:pointer;" onclick="SC.renderLoginStudentOnly()">
        <h2>🎓 生徒として始める</h2>
        <p class="help">学習記録・志望校・自分のマイページを使います。</p>
        <b>生徒ログインへ</b>
      </button>

      <button class="box" style="text-align:left;border:none;width:100%;cursor:pointer;" onclick="SC.startGuest()">
        <h2>🌎 ゲストとして始める</h2>
        <p class="help">ログインなしで大学検索・比較・診断を使います。</p>
        <b>ゲストで始める</b>
      </button>
    </div>

    <p class="help" style="text-align:center;margin-top:18px;">
      Ver.10 / Firebase連携・先生管理対応
    </p>
  </section>`;
};

SC.startGuest = function(){
  localStorage.setItem("sc_last_mode", "guest");
  SC.go ? SC.go("home") : null;
};

SC.renderLoginTeacherOnly = function(){
  SC.closeMenu?.();
  const app = document.getElementById("app");
  if(!app) return;

  app.innerHTML = `
  <section class="card">
    <h1>👨‍🏫 先生ログイン</h1>
    <p class="help">先生用アカウントでログインしてください。</p>
    <label>メールアドレス</label>
    <input id="teacherEmailInput" value="teacher@shingaku-compass.com">
    <label>パスワード</label>
    <input id="teacherPasswordInput" type="password" placeholder="パスワード">
    <div class="actions">
      <button class="btn navy" onclick="SC.loginTeacher()">ログイン</button>
      <button class="btn light" onclick="SC.renderWelcome()">戻る</button>
    </div>
    <p id="teacherLoginMsg" class="help"></p>
  </section>`;
};

SC.renderLoginStudentOnly = function(){
  SC.closeMenu?.();
  const app = document.getElementById("app");
  if(!app) return;

  app.innerHTML = `
  <section class="card">
    <h1>🎓 生徒ログイン</h1>
    <p class="help">生徒IDとパスワードでログインします。※生徒本人ログインは次段階で完全有効化します。</p>
    <label>生徒ID</label>
    <input id="studentIdInput" placeholder="例：KYOWA001">
    <label>パスワード</label>
    <input id="studentPasswordInput" type="password" placeholder="パスワード">
    <div class="actions">
      <button class="btn primary" onclick="SC.loginStudent()">ログイン</button>
      <button class="btn light" onclick="SC.renderWelcome()">戻る</button>
    </div>
    <p id="studentLoginMsg" class="help"></p>
  </section>`;
};

// 初回表示：ログイン状態がなければスタート画面
window.addEventListener("load", () => {
  setTimeout(() => {
    if(window.SC?.currentUser){
      if(window.SC?.currentProfile?.role === "teacher"){
        SC.renderTeacherDashboard();
        return;
      }
      if(window.SC?.currentProfile?.role === "student"){
        SC.renderStudentDashboard();
        return;
      }
    }
    const last = localStorage.getItem("sc_last_mode");
    if(last === "guest"){
      // ゲストが最後ならホームへ。ただし初回導線として戻れるようメニューにスタート画面あり
      SC.go ? SC.go("home") : SC.renderWelcome();
    }else{
      SC.renderWelcome();
    }
  }, 900);
});
