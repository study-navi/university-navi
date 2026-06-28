
/* 4.2.1 可能性診断：選択チップ版 */
SC.possibilityState = {
  dev:"",
  area:"全国",
  type:"こだわらない"
};

SC.setPossibilityChip=function(key,value){
  this.possibilityState[key]=value;
  this.renderPossibility();
};

SC.possibilityChipGroup=function(title,key,values){
  const current=this.possibilityState[key];
  return `<div class="chipSelectBlock">
    <div class="chipSelectTitle">${title}</div>
    <div class="selectChipGroup">
      ${values.map(v=>`<button class="selectChip ${current===v?"on":""}" onclick="SC.setPossibilityChip('${key}','${v}')">${v}</button>`).join("")}
    </div>
  </div>`;
};

SC.renderPossibility=function(){
  this.renderCompareBar(false);
  this.app().innerHTML=`<div class="card">
    <h2>📈 可能性診断</h2>
    <p class="small">偏差値・地域・種別から、チャレンジ校／実力相応校／安全校を分けて表示します。</p>

    <div class="possibilityFormClean">
      <div class="possibilityInputBox">
        <label>総合偏差値</label>
        <input id="posDev" type="number" placeholder="例：55" value="${this.possibilityState.dev}" oninput="SC.possibilityState.dev=this.value">
      </div>
      ${this.possibilityChipGroup("希望地域","area",["全国","北海道","東北","関東","北陸","甲信越","東海","関西","中国","四国","九州"])}
      ${this.possibilityChipGroup("大学種別","type",["こだわらない","国立","公立","私立"])}
    </div>

    <button class="btn" onclick="SC.possibilityResult()">診断する</button>
    <div id="possibilityResult"></div>
  </div>`;
};

SC.possibilityResult=function(){
  const dev=Number(this.possibilityState.dev || document.getElementById("posDev")?.value || 50);
  const area=this.possibilityState.area;
  const type=this.possibilityState.type;

  let list=this.data.filter(u=>{
    const areaOK = area==="全国" || u.area===area;
    const typeOK = type==="こだわらない" || u.type===type;
    return areaOK && typeOK;
  }).map(u=>({...u,diff:(u.level||50)-dev}));

  const challenge=list.filter(u=>u.diff>=4&&u.diff<=9).slice(0,5);
  const match=list.filter(u=>Math.abs(u.diff)<=3).slice(0,5);
  const safe=list.filter(u=>u.diff<=-4).slice(0,5);

  document.getElementById("possibilityResult").innerHTML=
    `<h3>🔥 チャレンジ校</h3>${challenge.map(u=>this.uniCard(u)).join("")||"<p class='small'>候補なし</p>"}
     <h3>🟢 実力相応校</h3>${match.map(u=>this.uniCard(u)).join("")||"<p class='small'>候補なし</p>"}
     <h3>🔵 安全校</h3>${safe.map(u=>this.uniCard(u)).join("")||"<p class='small'>候補なし</p>"}`;
};
