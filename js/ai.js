
SC.aiFull = {
  step: 1,
  profile: {
    grade:"", course:"", region:"全国", type:"こだわらない", commute:"どちらでもよい",
    evalAvg:"", mock:"", status:"",
    dev:{英語:"",国語:"",数学:"",理科:"",社会:"",情報:"",総合:""},
    feel:{英語:"普通",国語:"普通",数学:"普通",理科:"普通",社会:"普通",情報:"普通"},
    examSubjects:[],
    interests:[],
    personalities:[],
    futureGoals:[],
    conditions:[],
    interview:{teacher:"", place:"", priority:"", money:"", challenge:""}
  }
};
SC.aiSteps = ["基本","学力","得意苦手","受験科目","興味","性格","将来","条件","面談","AI分析","学習計画"];

SC.renderAI = function(){
  this.renderCompareBar(false);
  const s=this.aiFull.step;
  let body="";
  if(s===1) body=this.aiStepBasic();
  if(s===2) body=this.aiStepDeviation();
  if(s===3) body=this.aiStepFeeling();
  if(s===4) body=this.aiStepExamSubjects();
  if(s===5) body=this.aiStepInterests();
  if(s===6) body=this.aiStepPersonality();
  if(s===7) body=this.aiStepFuture();
  if(s===8) body=this.aiStepConditions();
  if(s===9) body=this.aiStepInterview();
  if(s===10) body=this.aiStepResult();
  if(s===11) body=this.aiStepPlan();

  this.app().innerHTML=`<div class="card">
    <div class="aiStepHeader">
      <h2>🤖 AI進路診断</h2>
      <p class="small">学力・興味・性格・将来像・条件をまとめて、面談のように進路候補を考えます。</p>
      <div class="aiProgress"><span style="width:${Math.round(s/11*100)}%"></span></div>
      <div class="aiStepTabs">${this.aiSteps.map((x,i)=>`<button class="${s===i+1?"on":""}" onclick="SC.aiFull.step=${i+1};SC.renderAI()">STEP${i+1} ${x}</button>`).join("")}</div>
    </div>
    ${body}
    <div class="actions">
      <button class="btn light" onclick="SC.aiBack()">戻る</button>
      <button class="btn" onclick="SC.aiNext()">次へ</button>
      <button class="btn light" onclick="SC.go('home')">ホーム</button>
    </div>
  </div>`;
};

SC.aiNext=function(){this.aiFull.step=Math.min(11,this.aiFull.step+1);this.renderAI()};
SC.aiBack=function(){this.aiFull.step=Math.max(1,this.aiFull.step-1);this.renderAI()};
SC.aiSetP=function(k,v){this.aiFull.profile[k]=v};
SC.aiSetDev=function(k,v){this.aiFull.profile.dev[k]=v};
SC.aiSetFeel=function(k,v){this.aiFull.profile.feel[k]=v;this.renderAI()};
SC.aiSetInterview=function(k,v){this.aiFull.profile.interview[k]=v;this.renderAI()};
SC.aiToggle=function(key,val){
  const arr=this.aiFull.profile[key];
  this.aiFull.profile[key]=arr.includes(val)?arr.filter(x=>x!==val):[...arr,val];
  this.renderAI();
};
SC.aiCloud=function(key,values){
  const arr=this.aiFull.profile[key]||[];
  return `<div class="aiChoiceCloud">${values.map(v=>`<button class="${arr.includes(v)?"on":""}" onclick="SC.aiToggle('${key}','${v}')">${v}</button>`).join("")}</div>`;
};
SC.aiSingleCloud=function(key,values){
  const now=this.aiFull.profile.interview[key]||"";
  return `<div class="aiChoiceCloud">${values.map(v=>`<button class="${now===v?"on":""}" onclick="SC.aiSetInterview('${key}','${v}')">${v}</button>`).join("")}</div>`;
};
SC.aiSelect=function(label,key,values){
  const now=this.aiFull.profile[key]||"";
  return `<label>${label}<select onchange="SC.aiSetP('${key}',this.value)"><option value="">選択なし</option>${values.map(v=>`<option ${now===v?"selected":""}>${v}</option>`).join("")}</select></label>`;
};

SC.aiStepBasic=function(){
  return `<div class="aiPanel"><h3>STEP1 基本情報</h3><div class="formGrid">
    ${this.aiSelect("学年","grade",["中学生","高校1年","高校2年","高校3年","既卒"])}
    ${this.aiSelect("文理選択","course",["文系","理系","未定","文理融合"])}
    ${this.aiSelect("希望地域","region",["全国","地元優先","北海道","東北","関東","北陸","甲信越","東海","関西","中国","四国","九州"])}
    ${this.aiSelect("大学種別","type",["こだわらない","国公立中心","私立中心","医療系重視","芸術系重視"])}
    ${this.aiSelect("通学・生活","commute",["自宅通学優先","一人暮らし可","どちらでもよい"])}
    ${this.aiSelect("模試の種類","mock",["未受験","学校模試","進研模試","河合塾 全統模試","駿台模試","その他"])}
    <label>評定平均<input type="number" step="0.1" min="1" max="5" value="${this.aiFull.profile.evalAvg}" placeholder="例：3.8" onchange="SC.aiSetP('evalAvg',this.value)"></label>
    ${this.aiSelect("志望状況","status",["第一志望が決まっている","学部だけ決まっている","文理だけ決まっている","全く決まっていない"])}
  </div></div>`;
};

SC.aiStepDeviation=function(){
  const keys=["英語","国語","数学","理科","社会","情報","総合"];
  return `<div class="aiPanel"><h3>STEP2 偏差値・学力目安</h3><p class="small">分からない科目は空欄でOKです。</p><div class="aiSubjectGrid">
    ${keys.map(k=>`<div class="aiSubjectBox"><label>${k}</label><input type="number" min="20" max="80" value="${this.aiFull.profile.dev[k]}" placeholder="例：55" onchange="SC.aiSetDev('${k}',this.value)"></div>`).join("")}
  </div></div>`;
};

SC.aiStepFeeling=function(){
  const keys=["英語","国語","数学","理科","社会","情報"];
  return `<div class="aiPanel"><h3>STEP3 得意・苦手</h3><p class="small">本人の感覚も進路選びでは大切です。選んだボタンは色が変わります。</p><div class="aiSubjectGrid">
    ${keys.map(k=>`<div class="aiSubjectBox"><label>${k}</label><div class="aiLevelButtons">${["得意","普通","苦手"].map(v=>`<button class="${this.aiFull.profile.feel[k]===v?"on":""}" onclick="SC.aiSetFeel('${k}','${v}')">${v==="得意"?"😊":v==="普通"?"😐":"😥"} ${v}</button>`).join("")}</div></div>`).join("")}
  </div></div>`;
};

SC.aiStepExamSubjects=function(){
  const subjects=["英語","国語","数学ⅠA","数学ⅡBC","物理","化学","生物","地学","日本史","世界史","地理","公共・政経","公共・倫理","情報Ⅰ","小論文","面接","実技"];
  return `<div class="aiPanel"><h3>STEP4 受験で使う予定の科目</h3><p class="small">まだ決まっていなければ、使えそうな科目を選んでください。</p>${this.aiCloud("examSubjects",subjects)}</div>`;
};

SC.aiStepInterests=function(){
  return `<div class="aiPanel"><h3>STEP5 興味・関心</h3><p class="small">好きなこと、少し気になることを選んでください。</p>
    <h3>情報・ものづくり</h3>${this.aiCloud("interests",["AI","プログラミング","ゲーム","データ分析","ロボット","機械","電気","建築","デザイン","映像"])}
    <h3>人・社会</h3>${this.aiCloud("interests",["教育","子ども","心理","福祉","法律","経済","経営","公務員","地域貢献","国際","語学"])}
    <h3>医療・自然・表現</h3>${this.aiCloud("interests",["医療","看護","薬","栄養","動物","農学","環境","食品","音楽","美術","スポーツ"])}
  </div>`;
};

SC.aiStepPersonality=function(){
  return `<div class="aiPanel"><h3>STEP6 性格・学習スタイル</h3>${this.aiCloud("personalities",["コツコツ型","短期集中型","一人で集中したい","人と話すのが好き","リーダータイプ","サポート役が得意","新しいもの好き","安定志向","チャレンジ志向","研究が好き","実践で学びたい","文章を書くのが好き"])}</div>`;
};

SC.aiStepFuture=function(){
  return `<div class="aiPanel"><h3>STEP7 将来やりたいこと</h3>${this.aiCloud("futureGoals",["まだ決まっていない","教師","保育士","看護師","薬剤師","医師","理学療法士","心理職","公務員","IT企業","ゲーム制作","建築士","研究者","管理栄養士","スポーツ関係","デザイナー","音楽関係","観光・ホテル","地元就職","大企業","起業"])}</div>`;
};

SC.aiStepConditions=function(){
  return `<div class="aiPanel"><h3>STEP8 希望条件</h3>${this.aiCloud("conditions",["国公立希望","私立OK","地元優先","全国OK","一人暮らしOK","学費重視","就職重視","資格重視","留学したい","部活と両立","キャンパス重視","女子大もOK","共学希望","少人数教育","面倒見重視"])}</div>`;
};

SC.aiStepInterview=function(){
  return `<div class="aiPanel"><h3>STEP9 AI面談：追加質問</h3><p class="small">追加で答えると、提案がより現実的になります。</p>
    <h3>教育に興味がある場合、どれに近い？</h3>${this.aiSingleCloud("teacher",["小学校の先生","中学校の先生","高校の先生","教育にはこだわらない"])}
    <h3>将来働く場所は？</h3>${this.aiSingleCloud("place",["地元就職を重視","全国も視野","まだ決めていない"])}
    <h3>大学選びで一番大切なのは？</h3>${this.aiSingleCloud("priority",["資格を取りたい","就職に強い大学","研究したい","大学生活の充実"])}
    <h3>費用面は？</h3>${this.aiSingleCloud("money",["学費を抑えたい","私立も検討できる","まだ分からない"])}
    <h3>挑戦度は？</h3>${this.aiSingleCloud("challenge",["チャレンジしたい","安全重視","バランス重視"])}
  </div>`;
};

SC.aiAverage=function(){
  const p=this.aiFull.profile;
  if(p.dev.総合) return Number(p.dev.総合);
  const vals=Object.entries(p.dev).filter(([k,v])=>k!=="総合"&&v!=="").map(([k,v])=>Number(v));
  return vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):50;
};

SC.aiText=function(u){
  return [u.name,u.field,u.type,u.pref,u.area,...(u.faculties||[]),...(u.departments||[])].join("");
};

SC.aiInterestScore=function(u){
  const p=this.aiFull.profile;
  const text=this.aiText(u);
  let score=0;
  const map={
    AI:["情報","AI","データ"],プログラミング:["情報","工"],ゲーム:["情報","デザイン","芸術"],データ分析:["情報","経営"],ロボット:["工","機械"],
    教育:["教育"],子ども:["子ども","教育","保育"],心理:["心理"],福祉:["福祉"],法律:["法"],経済:["経済"],経営:["経営","商"],公務員:["法","経済","政策"],国際:["国際"],語学:["外国語","国際"],
    医療:["医","保健","医療"],看護:["看護"],薬:["薬"],栄養:["栄養","食品"],動物:["獣医","動物","農"],農学:["農"],環境:["環境"],食品:["食品","栄養"],音楽:["音楽"],美術:["美術","芸術"],スポーツ:["スポーツ","体育"],
    教師:["教育"],看護師:["看護"],薬剤師:["薬"],IT企業:["情報"],ゲーム制作:["情報","デザイン"],建築士:["建築"],研究者:["理","工","薬","農"],地元就職:["地域","経営"]
  };
  [...p.interests,...p.futureGoals].forEach(i=>(map[i]||[i]).forEach(k=>{if(text.includes(k))score+=8}));
  return score;
};

SC.aiScoreUni=function(u){
  const p=this.aiFull.profile;
  const avg=this.aiAverage();
  let s=60-Math.abs((u.level||50)-avg)*2;
  s+=this.aiInterestScore(u);
  if(p.region==="地元優先"&&(u.area==="東海"||u.pref==="愛知"))s+=12;
  if(p.region&&p.region!=="全国"&&p.region!=="地元優先"&&u.area===p.region)s+=12;
  if(p.type==="国公立中心"&&(u.type==="国立"||u.type==="公立"))s+=14;
  if(p.type==="私立中心"&&u.type==="私立")s+=8;
  if(p.conditions.includes("国公立希望")&&(u.type==="国立"||u.type==="公立"))s+=14;
  if(p.conditions.includes("地元優先")&&(u.area==="東海"||u.pref==="愛知"))s+=12;
  if(p.conditions.includes("資格重視")&&/看護|薬|教育|栄養|福祉|医療/.test(this.aiText(u)))s+=10;
  if(p.interview.money==="学費を抑えたい"&&(u.type==="国立"||u.type==="公立"))s+=16;
  if(p.interview.challenge==="安全重視"&&(u.level||50)<=avg)s+=10;
  if(p.interview.challenge==="チャレンジしたい"&&(u.level||50)>avg)s+=8;
  return Math.round(s);
};

SC.aiClassify=function(u){
  const d=(u.level||50)-this.aiAverage();
  if(d>=4) return ["challenge","チャレンジ校"];
  if(d<=-5) return ["safe","安全校"];
  return ["match","実力相応校"];
};

SC.aiMainComment=function(){
  const p=this.aiFull.profile;
  const strong=Object.entries(p.feel).filter(([k,v])=>v==="得意").map(([k])=>k);
  const weak=Object.entries(p.feel).filter(([k,v])=>v==="苦手").map(([k])=>k);
  let msg=`あなたの現在の学力目安は偏差値${this.aiAverage()}前後です。`;
  if(p.interests.length) msg+=` 興味は「${p.interests.slice(0,5).join("・")}」が中心です。`;
  if(strong.length) msg+=` 強みになりそうな科目は${strong.join("・")}です。`;
  if(weak.length) msg+=` ${weak.join("・")}は今後の伸びしろとして見ていきましょう。`;
  if(p.conditions.includes("地元優先")) msg+=" 地元優先の条件があるため、東海地方の大学を高めに評価しています。";
  msg+=" これは合否判定ではなく、面談のたたき台です。";
  return msg;
};

SC.aiStepResult=function(){
  const ranked=this.data.map(u=>({...u,aiScore:this.aiScoreUni(u)})).sort((a,b)=>b.aiScore-a.aiScore).slice(0,24);
  const groups={challenge:[],match:[],safe:[]};
  ranked.forEach(u=>{const [k]=this.aiClassify(u);if(groups[k].length<5)groups[k].push(u)});
  const card=(u)=>{
    const [k,label]=this.aiClassify(u);
    return `<div class="aiRouteCard ${k}"><span class="aiRouteLabel ${k}">${label}</span><h3>${this.esc(u.name)}</h3><span class="pill">相性スコア ${u.aiScore}</span><p class="small">${this.esc(u.type)}｜${this.esc(u.pref)}｜${this.esc(u.field)}｜偏差値目安 ${u.level||"未登録"}</p><p class="small">理由：学力目安・興味・地域条件から候補に入ります。</p><div class="actions"><button class="btn light" onclick="SC.go('detail','${this.esc(u.name)}')">詳細</button><button class="btn light" onclick="SC.addCompare('${this.esc(u.name)}')">比較</button></div></div>`;
  };
  return `<div class="aiPanel"><h3>STEP10 AI分析</h3><div class="aiComment">${this.aiMainComment()}</div><div class="aiResultGrid"><div><h3>🔥 チャレンジ校</h3>${groups.challenge.map(card).join("")||"<p class='small'>候補なし</p>"}</div><div><h3>🟢 実力相応校</h3>${groups.match.map(card).join("")||"<p class='small'>候補なし</p>"}</div><div><h3>🔵 安全校</h3>${groups.safe.map(card).join("")||"<p class='small'>候補なし</p>"}</div></div></div>`;
};

SC.aiPlanSubjects=function(){
  const p=this.aiFull.profile;
  const weak=Object.entries(p.feel).filter(([k,v])=>v==="苦手").map(([k])=>k);
  const exam=p.examSubjects;
  const plan=[];
  if(exam.includes("英語")||p.feel.英語==="得意")plan.push("英語：単語と長文読解を毎日。得点源にできる可能性があります。");
  if(weak.includes("数学")&&(exam.includes("数学ⅠA")||exam.includes("数学ⅡBC")))plan.push("数学：基礎問題を固定し、配点が高い大学選びには注意しましょう。");
  if(exam.includes("国語"))plan.push("国語：現代文の根拠取りと古文単語を継続しましょう。");
  if(exam.includes("情報Ⅰ"))plan.push("情報Ⅰ：用語とプログラムの基礎を早めに固めましょう。");
  if(exam.includes("小論文"))plan.push("小論文：志望分野のニュースを週1でまとめる練習をしましょう。");
  if(!plan.length)plan.push("まずは英語・国語・数学の基礎確認と、受験科目の決定から始めましょう。");
  return plan;
};

SC.aiStepPlan=function(){
  const plan=this.aiPlanSubjects();
  const top=this.data.map(u=>({...u,aiScore:this.aiScoreUni(u)})).sort((a,b)=>b.aiScore-a.aiScore).slice(0,5);
  return `<div class="aiPanel"><h3>STEP11 学習プラン・共有用まとめ</h3><div class="aiPlan"><h3>今後3か月の優先</h3>${plan.map((p,i)=>`<div class="aiPlanStep"><strong>${i+1}</strong> ${p}</div>`).join("")}</div><div class="aiComment"><strong>先生・保護者に見せる要約</strong><br>偏差値目安：${this.aiAverage()}。<br>興味：${this.aiFull.profile.interests.slice(0,6).join("・")||"未選択"}。<br>希望条件：${this.aiFull.profile.conditions.slice(0,6).join("・")||"未選択"}。<br>候補大学：${top.map(u=>this.esc(u.name)).join("、")}。</div></div>`;
};
