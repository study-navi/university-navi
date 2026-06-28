
window.SC = {
  data: window.SC_UNIVERSITIES || [],
  route: "home",
  mode: localStorage.getItem("sc_mode") || "高校生",
  query: "",
  filters: {area:"",pref:"",type:"",field:"",min:"",max:""},
  compare: JSON.parse(localStorage.getItem("sc_compare")||"[]"),
  favorites: JSON.parse(localStorage.getItem("sc_favorites")||"[]"),
  ai: {interests:[], subjects:{}, grade:"", region:"全国", course:""},
  app(){return document.getElementById("app")},
  save(){localStorage.setItem("sc_compare",JSON.stringify(this.compare));localStorage.setItem("sc_favorites",JSON.stringify(this.favorites));localStorage.setItem("sc_mode",this.mode)},
  esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))},
  byName(name){return this.data.find(u=>u.name===name)},
  qText(u){return [u.name,u.pref,u.area,u.type,u.field,...(u.faculties||[]),...(u.departments||[])].join(" ")},
  go(route,payload){this.route=route;this.closeMenu();this.renderCompareBar(route==="home"||route==="compare");({home:this.renderHome,search:this.renderSearch,dream:this.renderDream,possibility:this.renderPossibility,ai:this.renderAI,compare:this.renderCompare,favorites:this.renderFavorites,detail:this.renderDetail,official:this.renderOfficial}[route]||this.renderHome).call(this,payload);window.scrollTo(0,0)},
  openMenu(){document.getElementById("menuOverlay").classList.add("on")},
  closeMenu(e){if(!e||e.target.id==="menuOverlay"||e.target.tagName==="BUTTON")document.getElementById("menuOverlay").classList.remove("on")},
};

/* 4.6 生徒カルテ・都道府県順 */
SC.prefOrder = ["北海道","青森","岩手","宮城","秋田","山形","福島","茨城","栃木","群馬","埼玉","千葉","東京","神奈川","新潟","富山","石川","福井","山梨","長野","岐阜","静岡","愛知","三重","滋賀","京都","大阪","兵庫","奈良","和歌山","鳥取","島根","岡山","広島","山口","徳島","香川","愛媛","高知","福岡","佐賀","長崎","熊本","大分","宮崎","鹿児島","沖縄"];
SC.regionPrefs = {
  "全国":[],
  "北海道":["北海道"],
  "東北":["青森","岩手","宮城","秋田","山形","福島"],
  "関東":["茨城","栃木","群馬","埼玉","千葉","東京","神奈川"],
  "中部":["新潟","富山","石川","福井","山梨","長野","岐阜","静岡","愛知"],
  "東海":["岐阜","静岡","愛知","三重"],
  "近畿":["三重","滋賀","京都","大阪","兵庫","奈良","和歌山"],
  "中国":["鳥取","島根","岡山","広島","山口"],
  "四国":["徳島","香川","愛媛","高知"],
  "九州・沖縄":["福岡","佐賀","長崎","熊本","大分","宮崎","鹿児島","沖縄"]
};
SC.students = JSON.parse(localStorage.getItem("sc_students") || "[]");
SC.saveStudents = function(){ localStorage.setItem("sc_students", JSON.stringify(this.students)); };

/* 5.0 マイページ保存データ */
SC.profile = JSON.parse(localStorage.getItem("sc_profile") || "{}");
SC.examRecords = JSON.parse(localStorage.getItem("sc_exam_records") || "[]");
SC.studyLogs = JSON.parse(localStorage.getItem("sc_study_logs") || "[]");
SC.saveProfile=function(){localStorage.setItem("sc_profile", JSON.stringify(this.profile||{}));};
SC.saveExamRecords=function(){localStorage.setItem("sc_exam_records", JSON.stringify(this.examRecords||[]));};
SC.saveStudyLogs=function(){localStorage.setItem("sc_study_logs", JSON.stringify(this.studyLogs||[]));};

/* 5.5 先生版・生徒管理 */
SC.teacherStudents = JSON.parse(localStorage.getItem("sc_teacher_students") || "[]");
SC.saveTeacherStudents=function(){localStorage.setItem("sc_teacher_students", JSON.stringify(this.teacherStudents||[]));};
