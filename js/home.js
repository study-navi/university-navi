
/* 4.5 モード別ホーム画面 */
SC.modeMeta={
  "高校生":{icon:"🌱",headline:"未来の自分を見つけよう。",desc:"診断・検索・お気に入りから、自分の進路を考えるモードです。"},
  "保護者":{icon:"🏠",headline:"お子さまの進路を、安心して見守る。",desc:"志望校・入試情報・学習状況を保護者目線で確認するモードです。"},
  "先生":{icon:"🧑‍🏫",headline:"面談と進路指導を、もっとスムーズに。",desc:"生徒管理・面談記録・志望校情報を使う先生向けモードです。"}
};

SC.changeMode=function(v){
  this.mode=v;
  this.save();
  this.go("home");
};

SC.modeChipRow=function(){
  return `<div class="modeSwitchRow">
    ${["高校生","保護者","先生"].map(m=>`<button class="${this.mode===m?"on":""}" onclick="SC.changeMode('${m}')">${this.modeMeta[m].icon} ${m}</button>`).join("")}
  </div>`;
};

SC.homeSearch=function(){
  this.query=document.getElementById("homeSearch")?.value?.trim()||"";
  this.go("search");
};

SC.modeCard=function(icon,title,desc,route){
  return `<button class="modeActionCard" onclick="SC.go('${route}')">
    <span class="modeIcon">${icon}</span>
    <h3>${title}</h3>
    <p>${desc}</p>
  </button>`;
};

SC.renderHome=function(){
  this.renderCompareBar(true);
  const meta=this.modeMeta[this.mode]||this.modeMeta["高校生"];
  let body="";
  if(this.mode==="保護者") body=this.renderParentHome();
  else if(this.mode==="先生") body=this.renderTeacherHome();
  else body=this.renderStudentHome();

  this.app().innerHTML=`<div class="card">
    <div class="modeHomeHeader">
      <h1>${meta.icon} ${meta.headline}</h1>
      <p>${meta.desc}</p>
      ${this.modeChipRow()}
    </div>
    ${body}
  </div>`;
};

SC.renderStudentHome=function(){
  return `
    <div class="hero">
      <span class="badge">🛡️ 公式データベース対応</span>
      <div class="searchLine">
        <span class="searchIcon">🔍</span>
        <input id="homeSearch" placeholder="大学名・学部・キーワード" onkeydown="if(event.key==='Enter')SC.homeSearch()">
        <button onclick="SC.homeSearch()">検索</button>
      </div>
    </div>
    <div class="modeDashboard">
      <div class="modeDashCard">♥ お気に入り：${this.favorites.length}校<p>気になる大学をあとで見返せます。</p></div>
      <div class="modeDashCard">📊 比較リスト：${this.compare.length}/3校<p>候補校を横並びで確認できます。</p></div>
      <div class="modeDashCard">📚 今日の進路アクション<p>診断か検索から、1校でも候補を増やしましょう。</p></div>
    </div>
    <div class="modeMainGrid">
      ${this.modeCard("💭","夢・好きから探す","心理テスト感覚で学問と出会う","dream")}
      ${this.modeCard("🤖","AI進路診断","学力・興味・条件から総合提案","ai")}
      ${this.modeCard("📈","可能性診断","偏差値から候補校を見る","possibility")}
      ${this.modeCard("🏫","大学検索","全国の大学を探す","search")}
      ${this.modeCard("📊","大学比較","大学を見比べる","compare")}
      ${this.modeCard("♥","お気に入り","保存した大学を見る","favorites")}
    </div>
    <div class="message">あなたの未来は、一つではありません。</div>
  `;
};

SC.renderParentHome=function(){
  return `
    <div class="modeDashboard">
      <div class="modeDashCard">🎯 志望校確認<p>第一志望・併願校を一緒に確認できます。</p></div>
      <div class="modeDashCard">📚 入試情報<p>受験科目・小論文・面接を確認できます。</p></div>
      <div class="modeDashCard">📈 学習状況<p>今後、生徒カルテと連携予定です。</p></div>
    </div>
    <div class="parentAdvice">
      保護者モードでは、合格可能性だけでなく「何を準備すればよいか」「いつ面談すべきか」「学費や通学面で注意すること」を見やすくしていきます。
    </div>
    <div class="modeMainGrid">
      ${this.modeCard("🎯","志望校を見る","登録した志望校を確認","favorites")}
      ${this.modeCard("📚","入試情報を確認","学部別の受験科目を見る","search")}
      ${this.modeCard("📊","大学比較","候補校を比べる","compare")}
      ${this.modeCard("🤖","保護者向けAI相談","学習サポートの方針を考える","ai")}
      ${this.modeCard("💰","学費・通学メモ","今後追加予定","search")}
      ${this.modeCard("📅","面談準備","面談で確認したいことを整理","official")}
    </div>
  `;
};

SC.renderTeacherHome=function(){
  return `
    <div class="modeDashboard">
      <div class="modeDashCard">👨‍🎓 担当生徒<p>今後、生徒カルテをここに表示します。</p></div>
      <div class="modeDashCard">📝 面談記録<p>面談メモ・宿題・次回課題を管理予定。</p></div>
      <div class="modeDashCard">🏫 志望校管理<p>学部別入試情報と連携します。</p></div>
    </div>
    <div class="teacherStudentCard">
      <strong>サンプル：高3 看護志望</strong>
      <p class="small">第一志望：名古屋市立大学 医学部 保健医療学科 看護学専攻</p>
      <div class="actions">
        <button class="btn light" onclick="SC.go('detail','名古屋市立大学')">入試情報を見る</button>
        <button class="btn light" onclick="SC.go('ai')">AIで学習方針</button>
      </div>
    </div>
    <div class="modeMainGrid">
      ${this.modeCard("👨‍🎓","生徒カルテ","生徒ごとの志望校・記録を管理予定","favorites")}
      ${this.modeCard("📝","面談記録","面談内容・次回課題を残す予定","official")}
      ${this.modeCard("🏫","志望校検索","大学・学部・入試方式を確認","search")}
      ${this.modeCard("📚","受験科目確認","学部別入試情報を見る","search")}
      ${this.modeCard("📊","大学比較","面談中に候補校を比較","compare")}
      ${this.modeCard("🤖","AI分析","生徒に合わせた方針を考える","ai")}
    </div>
  `;
};

/* 4.6 生徒カルテ */
SC.sampleStudent=function(){
  return {
    id:Date.now(),
    name:"高3 看護志望",
    grade:"高校3年",
    firstChoice:"名古屋市立大学",
    faculty:"医学部 保健医療学科 看護学専攻",
    deviation:"55",
    evalAvg:"3.8",
    memo:"英語長文と小論文を優先。面接では看護志望理由を深める。",
    todo:"英語長文3題／医療ニュース1本要約／小論文テーマ1本"
  };
};
SC.addSampleStudent=function(){
  if(!this.students.some(s=>s.firstChoice==="名古屋市立大学"&&s.faculty.includes("看護"))){
    this.students.push(this.sampleStudent());
    this.saveStudents();
  }
  this.go("home");
};
SC.renderStudentCards=function(){
  if(!this.students.length){
    return `<div class="teacherStudentCard"><strong>生徒カルテはまだありません</strong><p class="small">まずはサンプル生徒を追加して、先生モードの使い方を確認できます。</p><button class="btn light" onclick="SC.addSampleStudent()">名市大看護志望サンプルを追加</button></div>`;
  }
  return `<div class="studentList">${this.students.map(s=>`<div class="studentCard">
    <h3>${this.esc(s.name)}</h3>
    <span class="studentTag">${this.esc(s.grade)}</span><span class="studentTag">偏差値 ${this.esc(s.deviation)}</span><span class="studentTag">評定 ${this.esc(s.evalAvg)}</span>
    <p class="small"><strong>第一志望：</strong>${this.esc(s.firstChoice)}<br>${this.esc(s.faculty)}</p>
    <p class="small"><strong>面談メモ：</strong>${this.esc(s.memo)}</p>
    <p class="small"><strong>今週やること：</strong>${this.esc(s.todo)}</p>
    <div class="actions"><button class="btn light" onclick="SC.go('detail','${this.esc(s.firstChoice)}')">志望校情報</button><button class="btn light" onclick="SC.editStudent(${s.id})">編集</button><button class="btn light" onclick="SC.deleteStudent(${s.id})">削除</button></div>
  </div>`).join("")}</div>`;
};
SC.renderStudentForm=function(s={}){
  this.app().innerHTML=`<div class="card"><h2>👨‍🎓 生徒カルテ</h2><div class="karteForm">
    <label>生徒名<input id="stName" value="${this.esc(s.name||"")}" placeholder="例：高3 看護志望"></label>
    <label>学年<input id="stGrade" value="${this.esc(s.grade||"高校3年")}"></label>
    <label>第一志望<input id="stChoice" value="${this.esc(s.firstChoice||"名古屋市立大学")}"></label>
    <label>学部・学科<input id="stFaculty" value="${this.esc(s.faculty||"医学部 保健医療学科 看護学専攻")}"></label>
    <label>偏差値<input id="stDev" value="${this.esc(s.deviation||"")}"></label>
    <label>評定平均<input id="stEval" value="${this.esc(s.evalAvg||"")}"></label>
    <label class="wide">面談メモ<textarea id="stMemo" class="karteTextArea">${this.esc(s.memo||"")}</textarea></label>
    <label class="wide">今週やること<textarea id="stTodo" class="karteTextArea">${this.esc(s.todo||"")}</textarea></label>
  </div><div class="actions"><button class="btn" onclick="SC.saveStudentForm(${s.id||0})">保存</button><button class="btn light" onclick="SC.go('home')">戻る</button></div></div>`;
};
SC.editStudent=function(id){
  const s=this.students.find(x=>x.id===id);
  this.renderStudentForm(s||{});
};
SC.deleteStudent=function(id){
  this.students=this.students.filter(x=>x.id!==id);
  this.saveStudents();
  this.go("home");
};
SC.saveStudentForm=function(id){
  const s={id:id||Date.now(),name:document.getElementById("stName").value,grade:document.getElementById("stGrade").value,firstChoice:document.getElementById("stChoice").value,faculty:document.getElementById("stFaculty").value,deviation:document.getElementById("stDev").value,evalAvg:document.getElementById("stEval").value,memo:document.getElementById("stMemo").value,todo:document.getElementById("stTodo").value};
  this.students=this.students.filter(x=>x.id!==s.id);
  this.students.push(s);
  this.saveStudents();
  this.go("home");
};
SC.renderTeacherHome=function(){
  return `
    <div class="modeDashboard">
      <div class="modeDashCard">👨‍🎓 担当生徒：${this.students.length}人<p>志望校・面談記録・今週やることを管理します。</p></div>
      <div class="modeDashCard">📝 面談記録<p>生徒カルテにメモを保存できます。</p></div>
      <div class="modeDashCard">🏫 志望校管理<p>学部別入試情報と連携します。</p></div>
    </div>
    <div class="actions"><button class="btn" onclick="SC.renderStudentForm()">生徒を追加</button><button class="btn light" onclick="SC.addSampleStudent()">名市大看護サンプル</button></div>
    ${this.renderStudentCards()}
    <div class="modeMainGrid">
      ${this.modeCard("👨‍🎓","生徒カルテ","生徒ごとの志望校・記録を管理","home")}
      ${this.modeCard("📝","面談記録","面談内容・次回課題を残す","home")}
      ${this.modeCard("🏫","志望校検索","大学・学部・入試方式を確認","search")}
      ${this.modeCard("📚","受験科目確認","学部別入試情報を見る","search")}
      ${this.modeCard("📊","大学比較","面談中に候補校を比較","compare")}
      ${this.modeCard("🤖","AI分析","生徒に合わせた方針を考える","ai")}
    </div>
  `;
};

/* 4.7 ホーム整理・2モード版 */
SC.modeMeta={
  "高校生":{icon:"🌱",headline:"未来の自分を見つけよう。",desc:"診断・検索・お気に入りから、自分の進路を考えるモードです。"},
  "先生":{icon:"🧑‍🏫",headline:"面談と進路指導を、もっとスムーズに。",desc:"生徒カルテ・志望校情報・面談記録を使う先生向けモードです。"}
};

SC.changeMode=function(v){
  if(v==="保護者") v="高校生";
  this.mode=v;
  this.save();
  this.go("home");
};

SC.home47Modes=function(){
  return `<div class="home47Modes">
    ${["高校生","先生"].map(m=>`<button class="${this.mode===m?"on":""}" onclick="SC.changeMode('${m}')">${this.modeMeta[m].icon} ${m}</button>`).join("")}
  </div>`;
};

SC.home47Card=function(icon,title,desc,route){
  return `<button class="home47Card" onclick="SC.go('${route}')"><span class="home47Icon">${icon}</span><h3>${title}</h3><p>${desc}</p></button>`;
};

SC.homeSearch=function(){
  this.query=document.getElementById("homeSearch")?.value?.trim()||"";
  this.go("search");
};

SC.renderHome=function(){
  this.renderCompareBar(true);
  if(this.mode==="保護者") this.mode="高校生";
  const meta=this.modeMeta[this.mode]||this.modeMeta["高校生"];
  const body=this.mode==="先生" ? this.renderTeacherHome47() : this.renderStudentHome47();
  this.app().innerHTML=`<div class="card">
    <div class="home47Header">
      <h1>${meta.icon} ${meta.headline}</h1>
      <p>${meta.desc}</p>
      ${this.home47Modes()}
    </div>
    ${body}
  </div>`;
};

SC.renderStudentHome47=function(){
  return `
    <div class="home47Search">
      <span class="badge">🛡️ 公式データベース対応</span>
      <div class="searchLine">
        <span class="searchIcon">🔍</span>
        <input id="homeSearch" placeholder="大学名・学部・キーワード" onkeydown="if(event.key==='Enter')SC.homeSearch()">
        <button onclick="SC.homeSearch()">検索</button>
      </div>
    </div>

    <div class="home47Grid">
      ${this.home47Card("💭","夢・好きから探す","心理テスト感覚で学問と出会う","dream")}
      ${this.home47Card("🤖","AI進路診断","学力・興味・条件から総合提案","ai")}
      ${this.home47Card("📈","可能性診断","偏差値から候補校を見る","possibility")}
      ${this.home47Card("🏫","大学検索","全国の大学を探す","search")}
      ${this.home47Card("📊","大学比較","大学を見比べる","compare")}
      ${this.home47Card("♥","お気に入り","保存した大学を見る","favorites")}
    </div>

    <div class="home47MiniRow">
      <div class="home47Mini">♥ お気に入り：${this.favorites.length}校<span>あとで見返せます</span></div>
      <div class="home47Mini">📊 比較：${this.compare.length}/3校<span>候補校を横比較</span></div>
    </div>
    <div class="home47Action">📚 今日の進路アクション：診断か検索から、1校でも候補を増やしましょう。</div>
  `;
};

SC.renderTeacherHome47=function(){
  return `
    <div class="home47TeacherNotice">
      先生モードでは、生徒カルテ・志望校情報・学部別入試情報を使って、面談中にそのまま計画を立てられる形を目指します。
    </div>
    <div class="home47Grid">
      ${this.home47Card("👨‍🎓","生徒カルテ","志望校・面談記録を管理","home")}
      ${this.home47Card("🏫","志望校検索","大学・学部・入試方式を確認","search")}
      ${this.home47Card("📚","受験科目確認","学部別入試情報を見る","search")}
      ${this.home47Card("📊","大学比較","面談中に候補校を比較","compare")}
      ${this.home47Card("🤖","AI分析","生徒に合わせた方針を考える","ai")}
      ${this.home47Card("📝","面談記録","次回課題を整理","home")}
    </div>
    <div class="actions" style="margin-top:12px">
      <button class="btn" onclick="SC.renderStudentForm()">生徒を追加</button>
      <button class="btn light" onclick="SC.addSampleStudent()">名市大看護サンプル</button>
    </div>
    ${this.renderStudentCards ? this.renderStudentCards() : ""}
  `;
};

/* 4.8.5 ホームにデータ管理を追加 */
const oldRenderStudentHome47_485 = SC.renderStudentHome47;
SC.renderStudentHome47=function(){
  const html=oldRenderStudentHome47_485.call(this);
  return html.replace(`</div>

    <div class="home47MiniRow">`, `${this.home47Card("🛡️","公式確認データ","データ整備状況を見る","data")}</div>

    <div class="home47MiniRow">`);
};

const oldRenderTeacherHome47_485 = SC.renderTeacherHome47;
SC.renderTeacherHome47=function(){
  const base=oldRenderTeacherHome47_485.call(this);
  return base.replace(`</div>
    <div class="actions"`, `${this.home47Card("🛡️","データ拡張管理","公式確認と追加予定を確認","data")}</div>
    <div class="actions"`);
};

/* 5.0 ホームにマイページ導線を追加 */
const oldRenderStudentHome47_50 = SC.renderStudentHome47;
SC.renderStudentHome47=function(){
  const html=oldRenderStudentHome47_50.call(this);
  if(html.includes("マイページ")) return html;
  return html.replace(`</div>

    <div class="home47MiniRow">`, `${this.home47Card("👤","マイページ","志望校・成績・学習記録を管理","mypage")}</div>

    <div class="home47MiniRow">`);
};
