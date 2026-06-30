
// Ver.15 先生ダッシュボード強化
const __v15OldTeacherDashboard = SC.renderTeacherDashboard;
SC.renderTeacherDashboard = async function(){
  SC.closeMenu?.();
  if(!SC.currentUser){SC.renderLogin?.();return;}
  document.getElementById("app").innerHTML=`<section class="card"><h1>👨‍🏫 先生ダッシュボード</h1><p class="help">今日見るべき情報をまとめています。</p><div class="actions"><button class="btn primary" onclick="SC.renderAddStudentPage ? SC.renderAddStudentPage() : SC.renderAddStudent()">＋ 生徒追加</button><button class="btn navy" onclick="SC.loadStudents()">生徒一覧</button><button class="btn navy" onclick="SC.renderTeacherRanking()">ランキング</button><button class="btn light" onclick="SC.renderTeacherHome()">先生ホーム</button></div><div id="teacherBox" class="box">読み込み中...</div><div id="studentsList"></div></section>`;
  try{
    const data=await SC.getAllStudentsAndLogs();
    const students=data.students||[], logs=data.logs||[];
    const today=new Date().toISOString().slice(0,10), month=new Date().toISOString().slice(0,7);
    const activeToday=new Set(logs.filter(l=>l.date===today).map(l=>l.uid)).size;
    const noLog=Math.max(0,students.length-activeToday);
    const monthMin=logs.filter(l=>String(l.date||"").startsWith(month)).reduce((s,l)=>s+Number(l.minutes||0),0);
    const examSoon=students.filter(s=>{if(!s.firstExamDate)return false;const t=new Date(s.firstExamDate+"T00:00:00");const n=new Date();n.setHours(0,0,0,0);const days=Math.ceil((t-n)/(1000*60*60*24));return days>=0&&days<=60;});
    document.getElementById("teacherBox").innerHTML=`<h2>📊 全体サマリー</h2><div class="grid two"><div class="box"><b>登録生徒</b><br>${students.length}名</div><div class="box"><b>今日記録あり</b><br>${activeToday}名</div><div class="box"><b>今日未記録</b><br>${noLog}名</div><div class="box"><b>今月合計</b><br>${monthMin}分</div></div><h2>⏳ 試験が近い生徒</h2>`+(examSoon.length?examSoon.map(s=>`<div class="box"><b>${s.name||s.studentId||"生徒"}</b><br>${s.targetUniversity||"第一志望未設定"}：${s.firstExamDate}</div>`).join(""):`<div class="box">60日以内の試験日はまだ登録されていません。</div>`);
    await SC.loadStudents();
  }catch(e){
    console.error(e);
    if(__v15OldTeacherDashboard) await __v15OldTeacherDashboard();
  }
};
