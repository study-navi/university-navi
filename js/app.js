
SC.renderOfficial=function(){this.renderCompareBar(false);const confirmed=this.data.filter(u=>u.quality?.confirmationStatus&&u.quality.confirmationStatus!=="確認予定");this.app().innerHTML=`<div class="card"><h2>🛡️ 公式確認進捗</h2><div class="uniCard"><strong>${confirmed.length} / ${this.data.length}大学</strong><p class="small">確認した大学だけを情報確認済みとして扱います。</p></div>${confirmed.slice(0,80).map(u=>`<span class="pill">${this.esc(u.name)}</span>`).join("")}</div>`};
document.addEventListener("DOMContentLoaded",()=>{SC.go("home");SC.startOpening();});

/* 4.8.5 データ管理画面ルート */
const oldGo485 = SC.go.bind(SC);
SC.go=function(route,param){
  this.route=route;
  if(route==="data") return this.renderDataDashboard();
  return oldGo485(route,param);
};

/* 5.0 マイページルート */
const oldGo50 = SC.go.bind(SC);
SC.go=function(route,param){
  this.route=route;
  if(route==="mypage") return this.renderMyPage();
  return oldGo50(route,param);
};

/* 5.1 下メニュー修正を毎回適用 */
const oldGo51 = SC.go.bind(SC);
SC.go=function(route,param){
  const result=oldGo51(route,param);
  setTimeout(()=>SC.fixBottomNav51&&SC.fixBottomNav51(),50);
  return result;
};

/* 5.1.1 メニュー表示補正 */
const oldGo511 = SC.go.bind(SC);
SC.go=function(route,param){
  const result=oldGo511(route,param);
  setTimeout(()=>SC.fixMenus511&&SC.fixMenus511(),50);
  return result;
};
setTimeout(()=>SC.fixMenus511&&SC.fixMenus511(),300);

/* 5.5 先生版ルート */
const oldGo55 = SC.go.bind(SC);
SC.go=function(route,param){
  this.route=route;
  if(route==="teacherStudents") return this.renderTeacherStudents55();
  return oldGo55(route,param);
};
