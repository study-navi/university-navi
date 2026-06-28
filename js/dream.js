
/* 4.3 夢・好き心理テスト版 */
SC.dreamTest = {
  step: 1,
  answers: [],
  result: null
};

SC.dreamQuestions = [
  {
    title:"Q1. 休日なら、どんな過ごし方が好き？",
    note:"複数選択OKです。",
    choices:[
      ["ゲームをする",["tech","creative"]],
      ["本を読む",["human","research"]],
      ["絵を描く",["creative"]],
      ["動物と過ごす",["life","care"]],
      ["動画を見る・作る",["creative","media"]],
      ["スポーツをする",["sports","care"]],
      ["人と話す",["social","care"]],
      ["調べものをする",["research"]]
    ]
  },
  {
    title:"Q2. 学校の授業で楽しいと思いやすいものは？",
    note:"得意かどうかではなく、少しでも楽しいものを選んでください。",
    choices:[
      ["実験",["science","research"]],
      ["英語・語学",["global","human"]],
      ["パソコン",["tech"]],
      ["発表",["social","global"]],
      ["計算・分析",["tech","research"]],
      ["工作・ものづくり",["creative","tech"]],
      ["文章を書く",["human","creative"]],
      ["グループ活動",["social","care"]]
    ]
  },
  {
    title:"Q3. 将来、少し興味がある働き方は？",
    note:"まだ決まっていなくてOKです。",
    choices:[
      ["人を助けたい",["care"]],
      ["何かを作りたい",["creative","tech"]],
      ["安定した仕事がいい",["social","care"]],
      ["世界で働きたい",["global"]],
      ["研究したい",["research","science"]],
      ["人に教えたい",["education","social"]],
      ["起業・企画に興味",["business","creative"]],
      ["表現する仕事がしたい",["creative","media"]]
    ]
  },
  {
    title:"Q4. 自分に近い性格は？",
    note:"自分では分からなければ、言われたことがあるものを選んでください。",
    choices:[
      ["コツコツ型",["research","care"]],
      ["好奇心旺盛",["research","creative"]],
      ["面倒見がいい",["care","education"]],
      ["リーダータイプ",["business","social"]],
      ["一人で集中したい",["tech","research"]],
      ["アイデアマン",["creative","business"]],
      ["人の気持ちを考える",["human","care"]],
      ["新しいもの好き",["tech","global"]]
    ]
  },
  {
    title:"Q5. 気になるキーワードは？",
    note:"直感で選んでください。",
    choices:[
      ["AI",["tech"]],
      ["心理",["human","care"]],
      ["医療",["care","science"]],
      ["教育",["education","social"]],
      ["音楽",["creative","media"]],
      ["スポーツ",["sports"]],
      ["法律",["social","human"]],
      ["食品",["life","science"]],
      ["建築",["creative","tech"]],
      ["国際",["global"]],
      ["経済",["business","social"]],
      ["環境",["life","science"]]
    ]
  }
];

SC.dreamTypes = {
  tech:{name:"論理型クリエイター", icon:"💻", desc:"新しい技術や仕組みに興味があり、考えたことを形にする力が伸びやすいタイプです。", fields:["情報工学","データサイエンス","工学","AI・機械学習"], jobs:["AIエンジニア","プログラマー","データ分析","ゲーム制作"]},
  creative:{name:"表現クリエイター", icon:"🎨", desc:"アイデアを形にしたり、人に伝わるものを作ったりすることに向いているタイプです。", fields:["デザイン","芸術","映像","メディア"], jobs:["デザイナー","映像制作","Web制作","企画職"]},
  care:{name:"人を支えるサポーター", icon:"🤝", desc:"人の役に立つことや、相手の気持ちを考えることに強みが出やすいタイプです。", fields:["看護","福祉","心理","医療"], jobs:["看護師","福祉職","心理職","医療スタッフ"]},
  education:{name:"教える・育てるタイプ", icon:"👨‍🏫", desc:"人の成長を支えたり、分かりやすく伝えたりすることに向いているタイプです。", fields:["教育","保育","児童学","心理"], jobs:["教師","保育士","塾講師","教育企画"]},
  research:{name:"探究型リサーチャー", icon:"🔬", desc:"なぜ？どうして？を深く考え、調べて理解することに向いているタイプです。", fields:["理学","薬学","農学","情報"], jobs:["研究者","開発職","分析職","大学院進学"]},
  global:{name:"世界志向コミュニケーター", icon:"🌍", desc:"言葉・文化・海外とのつながりに興味があり、広い世界で学ぶことに向いているタイプです。", fields:["国際","外国語","観光","経済"], jobs:["海外営業","通訳・翻訳","観光業","国際協力"]},
  business:{name:"企画・ビジネス型", icon:"📈", desc:"人やお金、仕組みを動かすことに興味が出やすいタイプです。", fields:["経営","経済","商学","政策"], jobs:["企画職","営業","起業","公務員"]},
  life:{name:"自然・いのち探究タイプ", icon:"🌱", desc:"動物・植物・食品・環境など、身近な自然や生命に関心が向きやすいタイプです。", fields:["農学","生命科学","食品","環境"], jobs:["食品開発","環境調査","動物関連","農業技術"]},
  sports:{name:"アクティブ実践タイプ", icon:"🏃", desc:"体を動かすことや、チームで力を発揮することに向いているタイプです。", fields:["スポーツ科学","体育","健康科学","教育"], jobs:["トレーナー","体育教師","スポーツ指導","健康支援"]},
  social:{name:"社会を動かす調整役", icon:"🏛️", desc:"人や社会の仕組みに興味があり、ルールや制度を考えることに向いているタイプです。", fields:["法学","政策","経済","社会学"], jobs:["公務員","法律関係","行政","NPO"]},
  human:{name:"こころ・言葉探究タイプ", icon:"📚", desc:"人の気持ち、言葉、文化、考え方に興味が向きやすいタイプです。", fields:["心理","文学","人間科学","社会学"], jobs:["心理職","編集","カウンセラー","広報"]},
  science:{name:"理系探究タイプ", icon:"🧪", desc:"実験や分析を通して、目に見えない仕組みを理解することに向いているタイプです。", fields:["理学","化学","薬学","生命科学"], jobs:["研究職","品質管理","開発職","医療系職種"]},
  media:{name:"メディア表現タイプ", icon:"🎬", desc:"映像・音・文章・SNSなどを通して、誰かに伝えることに向いているタイプです。", fields:["メディア","映像","音楽","デザイン"], jobs:["映像制作","音響","広告","SNS運用"]}
};

SC.renderDream=function(){
  this.renderCompareBar(false);
  const step=this.dreamTest.step;
  if(step>this.dreamQuestions.length) return this.renderDreamResult();
  const q=this.dreamQuestions[step-1];
  const selected=this.dreamTest.answers[step-1] || [];
  this.app().innerHTML=`<div class="card">
    <div class="dreamHero">
      <h2>💭 夢・好きから探す</h2>
      <p class="small">心理テストのように、好きなことから向いている学問を探します。偏差値は使いません。</p>
      <div class="dreamProgress"><span style="width:${Math.round(step/this.dreamQuestions.length*100)}%"></span></div>
      <p class="small">STEP ${step} / ${this.dreamQuestions.length}</p>
    </div>
    <div class="dreamQuestion">
      <h3>${q.title}</h3>
      <p class="small">${q.note}</p>
      <div class="dreamChoiceCloud">
        ${q.choices.map(([label,tags])=>`<button class="dreamChoice ${selected.includes(label)?"on":""}" onclick="SC.toggleDreamChoice('${label}')">${label}</button>`).join("")}
      </div>
    </div>
    <div class="actions">
      <button class="btn light" onclick="SC.dreamBack()">戻る</button>
      <button class="btn" onclick="SC.dreamNext()">次へ</button>
      <button class="btn light" onclick="SC.resetDreamTest()">最初から</button>
    </div>
  </div>`;
};

SC.toggleDreamChoice=function(label){
  const i=this.dreamTest.step-1;
  const arr=this.dreamTest.answers[i] || [];
  this.dreamTest.answers[i]=arr.includes(label)?arr.filter(x=>x!==label):[...arr,label];
  this.renderDream();
};

SC.dreamNext=function(){
  this.dreamTest.step=Math.min(this.dreamQuestions.length+1,this.dreamTest.step+1);
  this.renderDream();
};

SC.dreamBack=function(){
  this.dreamTest.step=Math.max(1,this.dreamTest.step-1);
  this.renderDream();
};

SC.resetDreamTest=function(){
  this.dreamTest={step:1,answers:[],result:null};
  this.renderDream();
};

SC.calcDreamScores=function(){
  const scores={};
  this.dreamQuestions.forEach((q,idx)=>{
    const selected=this.dreamTest.answers[idx]||[];
    q.choices.forEach(([label,tags])=>{
      if(selected.includes(label)){
        tags.forEach(t=>scores[t]=(scores[t]||0)+1);
      }
    });
  });
  return scores;
};

SC.renderDreamResult=function(){
  const scores=this.calcDreamScores();
  const ranked=Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  const topKey=ranked[0]?.[0] || "creative";
  const top=this.dreamTypes[topKey];
  const topFields=[...new Set(ranked.slice(0,4).flatMap(([k])=>this.dreamTypes[k]?.fields||[]))].slice(0,8);
  const topJobs=[...new Set(ranked.slice(0,4).flatMap(([k])=>this.dreamTypes[k]?.jobs||[]))].slice(0,10);

  const fieldCards=topFields.slice(0,6).map((f,i)=>`<div class="dreamFieldCard">
    <h3>${i===0?"🥇":i===1?"🥈":i===2?"🥉":"⭐"} ${f}</h3>
    <p class="small">${this.fieldComment(f)}</p>
    <button class="btn light" onclick="SC.searchDreamField('${f}')">この分野の大学を見る</button>
  </div>`).join("");

  this.app().innerHTML=`<div class="card">
    <div class="dreamTypeCard">
      <div style="font-size:42px">${top.icon}</div>
      <div class="dreamScoreStars">★★★★★</div>
      <div class="dreamTypeTitle">あなたは<br>${top.name}</div>
      <p>${top.desc}</p>
    </div>

    <h2>向いている学問</h2>
    <div class="dreamFieldGrid">${fieldCards}</div>

    <h2>おすすめ職業イメージ</h2>
    <div class="dreamJobList">${topJobs.map(j=>`<span>${j}</span>`).join("")}</div>

    <div class="dreamNote">
      この診断は偏差値ではなく「興味・性格・好きなこと」から学問との出会いを作る機能です。
      具体的な受験校を考えるときは、📈可能性診断や🤖AI進路診断も使ってください。
    </div>

    <div class="actions">
      <button class="btn" onclick="SC.searchDreamField('${topFields[0]||top.fields[0]}')">おすすめ大学を見る</button>
      <button class="btn light" onclick="SC.resetDreamTest()">もう一度診断</button>
      <button class="btn light" onclick="SC.go('ai')">AI進路診断へ</button>
    </div>
  </div>`;
};

SC.fieldComment=function(f){
  const map={
    情報工学:"AI・ゲーム・アプリなど、仕組みを作る学問です。",
    データサイエンス:"数字やデータから社会の課題を見つけます。",
    デザイン:"見た目だけでなく、使いやすさや伝え方も考えます。",
    心理:"人の気持ちや行動のしくみを学びます。",
    教育:"人の成長を支える方法を学びます。",
    看護:"人の健康と生活を支える専門分野です。",
    経営:"商品・人・お金・組織の動かし方を学びます。",
    農学:"食べ物・生命・環境を支える学問です。"
  };
  return map[f] || "あなたの興味とつながる可能性がある学問です。";
};

SC.searchDreamField=function(field){
  this.query=field;
  this.go("search");
};


/* 4.3.1 興味→学問マッピングシステム */
SC.interestStudyMap = {
  "AI":["AI","人工知能","情報","情報工学","情報科学","データサイエンス","知能情報","コンピュータ","システム工学","数理"],
  "ゲーム":["ゲーム","情報","情報工学","メディア","映像","CG","デザイン","コンピュータ","プログラミング"],
  "プログラミング":["情報","情報工学","情報科学","コンピュータ","システム","データサイエンス"],
  "データ分析":["データサイエンス","情報","統計","数理","経営","経済"],
  "ロボット":["ロボット","機械","機械工学","工学","電気電子","制御"],
  "機械":["機械","機械工学","工学","ロボット"],
  "電気":["電気","電子","電気電子","工学","情報"],
  "建築":["建築","土木","都市","デザイン","環境"],
  "デザイン":["デザイン","芸術","美術","メディア","情報"],
  "映像":["映像","メディア","芸術","デザイン","情報"],
  "教育":["教育","教員","子ども","児童","保育"],
  "子ども":["教育","保育","児童","心理","福祉"],
  "心理":["心理","人間","人間科学","教育","福祉"],
  "福祉":["福祉","社会福祉","心理","医療"],
  "法律":["法","法律","政策","政治"],
  "経済":["経済","経営","商","政策"],
  "経営":["経営","商","経済","ビジネス"],
  "公務員":["法","政策","政治","経済","行政"],
  "地域貢献":["地域","政策","社会","福祉","経済"],
  "国際":["国際","外国語","語学","観光","文化"],
  "語学":["外国語","英語","国際","語学"],
  "医療":["医療","保健","看護","医","リハビリ"],
  "看護":["看護","医療","保健"],
  "薬":["薬","薬学","生命","化学"],
  "栄養":["栄養","食品","健康","管理栄養"],
  "動物":["動物","獣医","農","生命","生物"],
  "農学":["農","農学","生命","生物","環境","食品"],
  "環境":["環境","農","生命","工","都市"],
  "食品":["食品","栄養","農","生命","化学"],
  "音楽":["音楽","芸術","メディア","表現"],
  "美術":["美術","芸術","デザイン"],
  "スポーツ":["スポーツ","体育","健康","教育"]
};

SC.fieldStudyMap = {
  "情報工学":["情報","情報工学","情報科学","データサイエンス","AI","人工知能","コンピュータ","知能情報"],
  "AI・機械学習":["AI","人工知能","情報","データサイエンス","知能情報","情報工学"],
  "データサイエンス":["データサイエンス","情報","統計","数理","経営"],
  "デザイン":["デザイン","芸術","美術","メディア"],
  "心理":["心理","人間","人間科学"],
  "教育":["教育","教員","児童","保育"],
  "看護":["看護","医療","保健"],
  "医療":["医療","保健","看護","医"],
  "経営":["経営","商","経済"],
  "経済":["経済","経営","商"],
  "農学":["農","農学","生命","生物","食品","環境"],
  "生命科学":["生命","生物","理","農","薬"],
  "食品":["食品","栄養","農"],
  "環境":["環境","農","工"],
  "建築":["建築","土木","都市"],
  "国際":["国際","外国語","語学"],
  "外国語":["外国語","英語","国際"],
  "法学":["法","法律","政策"],
  "政策":["政策","政治","法","地域"],
  "スポーツ科学":["スポーツ","体育","健康"],
  "メディア":["メディア","映像","情報","デザイン"],
  "映像":["映像","メディア","芸術"],
  "音楽":["音楽","芸術"],
  "芸術":["芸術","美術","音楽","デザイン"]
};

SC.getDreamSelectedLabels=function(){
  const labels=[];
  (this.dreamTest.answers||[]).forEach(arr=>arr.forEach(x=>labels.push(x)));
  return labels;
};

SC.keywordsForInterest=function(word){
  return this.interestStudyMap[word] || this.fieldStudyMap[word] || [word];
};

SC.searchByKeywords=function(keywords, limit=18){
  const uniq=[...new Set(keywords.filter(Boolean))];
  const scored=this.data.map(u=>{
    const text=this.qText(u);
    let score=0;
    uniq.forEach(k=>{
      if(text.includes(k)) score += k.length>=3 ? 8 : 5;
      if((u.field||"").includes(k)) score += 8;
      if((u.faculties||[]).join("").includes(k)) score += 6;
      if((u.departments||[]).join("").includes(k)) score += 6;
    });
    return {...u, mapScore:score};
  }).filter(u=>u.mapScore>0).sort((a,b)=>b.mapScore-a.mapScore || (b.career||0)-(a.career||0));
  return scored.slice(0,limit);
};

SC.searchDreamField=function(field){
  const keywords=this.keywordsForInterest(field);
  const list=this.searchByKeywords(keywords, 80);
  this.renderCompareBar(false);
  this.app().innerHTML=`<div class="card">
    <h2>🔍 ${this.esc(field)} に関連する大学</h2>
    <p class="small">「${this.esc(field)}」を、関連する学問キーワードに広げて検索しています。</p>
    <div class="mappingTags">${keywords.map(k=>`<span>${this.esc(k)}</span>`).join("")}</div>
    ${list.length ? list.map(u=>this.uniCard(u)).join("") : `<div class="mappedUniBox"><h3>候補が見つかりませんでした</h3><p class="small">キーワードを広げて再検索してみてください。</p></div>`}
    <div class="actions"><button class="btn light" onclick="SC.renderDreamResult()">診断結果へ戻る</button><button class="btn light" onclick="SC.go('dream')">もう一度診断</button></div>
  </div>`;
};

SC.renderDreamResult=function(){
  const scores=this.calcDreamScores();
  const ranked=Object.entries(scores).sort((a,b)=>b[1]-a[1]);
  const topKey=ranked[0]?.[0] || "creative";
  const top=this.dreamTypes[topKey];
  const selected=this.getDreamSelectedLabels();
  const interestKeywords=[...new Set(selected.flatMap(x=>this.keywordsForInterest(x)))];
  const topFields=[...new Set(ranked.slice(0,4).flatMap(([k])=>this.dreamTypes[k]?.fields||[]))].slice(0,8);
  const topJobs=[...new Set(ranked.slice(0,4).flatMap(([k])=>this.dreamTypes[k]?.jobs||[]))].slice(0,10);

  const fieldCards=topFields.slice(0,6).map((f,i)=>{
    const kws=this.keywordsForInterest(f).slice(0,6);
    const count=this.searchByKeywords(kws, 999).length;
    return `<div class="dreamFieldCard">
      <h3>${i===0?"🥇":i===1?"🥈":i===2?"🥉":"⭐"} ${f}</h3>
      <p class="small">${this.fieldComment(f)}</p>
      <div class="mappingTags">${kws.slice(0,4).map(k=>`<span>${this.esc(k)}</span>`).join("")}</div>
      <p class="small">関連候補：${count}校</p>
      <button class="btn light" onclick="SC.searchDreamField('${f}')">この分野の大学を見る</button>
    </div>`;
  }).join("");

  const recommended=this.searchByKeywords([...interestKeywords,...topFields.flatMap(f=>this.keywordsForInterest(f))], 6);

  this.app().innerHTML=`<div class="card">
    <div class="dreamTypeCard">
      <div style="font-size:42px">${top.icon}</div>
      <div class="dreamScoreStars">★★★★★</div>
      <div class="dreamTypeTitle">あなたは<br>${top.name}</div>
      <p>${top.desc}</p>
    </div>

    <h2>向いている学問</h2>
    <div class="dreamFieldGrid">${fieldCards}</div>

    <h2>おすすめ職業イメージ</h2>
    <div class="dreamJobList">${topJobs.map(j=>`<span>${j}</span>`).join("")}</div>

    <h2>関連しそうな大学候補</h2>
    <p class="small">選択した興味を学問キーワードに広げて候補を出しています。</p>
    <div class="mappingTags">${interestKeywords.slice(0,12).map(k=>`<span>${this.esc(k)}</span>`).join("")}</div>
    ${recommended.length ? recommended.map(u=>this.uniCard(u)).join("") : `<div class="mappedUniBox"><h3>候補が見つかりませんでした</h3><p class="small">学問カードから探してみてください。</p></div>`}

    <div class="dreamNote">
      この診断は偏差値ではなく「興味・性格・好きなこと」から学問との出会いを作る機能です。
      具体的な受験校を考えるときは、📈可能性診断や🤖AI進路診断も使ってください。
    </div>

    <div class="actions">
      <button class="btn" onclick="SC.searchDreamField('${topFields[0]||top.fields[0]}')">おすすめ分野の大学を見る</button>
      <button class="btn light" onclick="SC.resetDreamTest()">もう一度診断</button>
      <button class="btn light" onclick="SC.go('ai')">AI進路診断へ</button>
    </div>
  </div>`;
};

/* 4.7.4 夢・好き診断後の候補一覧：並び替え対応 */
SC.searchDreamField=function(field){
  const keywords=this.keywordsForInterest(field);
  const list=this.sortUniversities ? this.sortUniversities(this.searchByKeywords(keywords, 80), 55) : this.searchByKeywords(keywords, 80);
  this.renderCompareBar(false);
  this.app().innerHTML=`<div class="card">
    <h2>🔍 ${this.esc(field)} に関連する大学</h2>
    <p class="small">「${this.esc(field)}」を、関連する学問キーワードに広げて検索しています。</p>
    <div class="mappingTags">${keywords.map(k=>`<span>${this.esc(k)}</span>`).join("")}</div>
    ${this.sortControls ? this.sortControls() : ""}
    ${list.length ? list.map(u=>this.uniCard(u)).join("") : `<div class="mappedUniBox"><h3>候補が見つかりませんでした</h3><p class="small">キーワードを広げて再検索してみてください。</p></div>`}
    <div class="actions"><button class="btn light" onclick="SC.renderDreamResult()">診断結果へ戻る</button><button class="btn light" onclick="SC.go('dream')">もう一度診断</button></div>
  </div>`;
};
