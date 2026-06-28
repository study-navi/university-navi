
SC.setQuery=function(v){this.query=v};
SC.setFilter=function(k,v){this.filters[k]=v};
SC.clearFilters=function(){this.query="";this.filters={area:"",pref:"",type:"",field:"",min:"",max:""};this.go("search")};
SC.filtered=function(){const f=this.filters;return this.data.filter(u=>{if(this.query&&!this.qText(u).includes(this.query))return false;if(f.area&&u.area!==f.area)return false;if(f.pref&&u.pref!==f.pref)return false;if(f.type&&u.type!==f.type)return false;if(f.field&&!(u.field||"").includes(f.field))return false;if(f.min&&Number(u.level||0)<Number(f.min))return false;if(f.max&&Number(u.level||999)>Number(f.max))return false;return true}).slice(0,120)};
SC.select=function(key,label,arr){return `<label>${label}<select onchange="SC.setFilter('${key}',this.value)"><option value="">すべて</option>${arr.map(v=>`<option ${this.filters[key]===v?'selected':''}>${this.esc(v)}</option>`).join("")}</select></label>`};
SC.badge=function(u){return `<span class="pill">情報確認状況：${this.esc(u.quality?.confirmationStatus||"確認予定")}</span>`};
SC.uniCard=function(u){const fav=this.favorites.includes(u.name);return `<div class="uniCard"><h3>${this.esc(u.name)}</h3><p class="small">${this.esc(u.type)} ／ ${this.esc(u.pref)} ／ ${this.esc(u.field)} ／ 偏差値目安 ${u.level||"未登録"}</p><p>${this.badge(u)}</p><div class="actions"><button class="btn light" onclick="SC.go('detail','${this.esc(u.name)}')">詳細</button><button class="btn light" onclick="SC.toggleFavorite('${this.esc(u.name)}')">${fav?"♥ 保存済み":"♡ 保存"}</button><button class="btn light" onclick="SC.addCompare('${this.esc(u.name)}')">📊 比較に追加</button></div></div>`};
SC.renderSearch=function(){this.renderCompareBar(false);const areas=[...new Set(this.data.map(u=>u.area).filter(Boolean))].sort(),prefs=[...new Set(this.data.map(u=>u.pref).filter(Boolean))].sort(),types=[...new Set(this.data.map(u=>u.type).filter(Boolean))].sort(),fields=[...new Set(this.data.map(u=>u.field).filter(Boolean))].slice(0,80);const list=this.filtered();this.app().innerHTML=`<div class="card"><h2>🔍 大学検索</h2><div class="searchLine"><span class="searchIcon">🔍</span><input value="${this.esc(this.query)}" placeholder="大学名・学部・キーワード" oninput="SC.setQuery(this.value)"><button onclick="SC.go('search')">検索</button></div><details><summary class="modeBox">検索条件を開く</summary><div class="formGrid">${this.select("area","地域",areas)}${this.select("pref","都道府県",prefs)}${this.select("type","種別",types)}${this.select("field","分野",fields)}<label>偏差値下限<input type="number" value="${this.filters.min}" onchange="SC.setFilter('min',this.value)"></label><label>偏差値上限<input type="number" value="${this.filters.max}" onchange="SC.setFilter('max',this.value)"></label></div><div class="actions"><button class="btn" onclick="SC.go('search')">検索更新</button><button class="btn light" onclick="SC.clearFilters()">条件クリア</button></div></details><p class="small">${list.length}件表示</p>${list.map(u=>this.uniCard(u)).join("")||`<div class="uniCard">該当する大学がありません。</div>`}</div>`};
SC.renderDetail=function(name){this.renderCompareBar(false);const u=this.byName(name);if(!u)return this.go("search");const q=u.quality||{},e=u.entrance||{};this.app().innerHTML=`<div class="card"><h2>${this.esc(u.name)}</h2><p class="small">${this.esc(u.type)} ／ ${this.esc(u.pref)} ／ ${this.esc(u.area)} ／ ${this.esc(u.field)}</p><p>${this.badge(u)} <span class="pill">最終確認：${this.esc(q.lastChecked||e.lastChecked||"未確認")}</span></p><h3>学部・学科</h3><p>${this.esc((u.faculties||[]).join("、")||"未登録")}</p><p class="small">${this.esc((u.departments||[]).join("、")||"")}</p><h3>入試メモ</h3><p class="small">${this.esc(e.note||"詳細は公式情報で確認してください。")}</p><div class="actions">${q.officialUrl||e.officialUrl?`<a class="btn light" href="${q.officialUrl||e.officialUrl}" target="_blank">公式</a>`:""}${q.admissionUrl||e.admissionUrl?`<a class="btn light" href="${q.admissionUrl||e.admissionUrl}" target="_blank">入試</a>`:""}<button class="btn" onclick="SC.toggleFavorite('${this.esc(u.name)}')">${this.favorites.includes(u.name)?"♥ 保存済み":"♡ 保存"}</button><button class="btn light" onclick="SC.addCompare('${this.esc(u.name)}')">📊 比較に追加</button></div></div>`};


/* 4.4 学部別入試情報・学習計画 */
SC.renderEntranceDetails=function(u){
  const details=u.entranceDetails||[];
  if(!details.length){
    return `<div class="entranceDetailBox"><h3>📚 学部別入試情報</h3><p class="small">この大学はまだ学部・学科別の受験科目データが登録されていません。</p></div>`;
  }
  return details.map(d=>`<div class="entranceDetailBox">
    <h3>📚 ${this.esc(d.displayName||((d.faculty||"")+" "+(d.department||"")))}</h3>
    <p>${this.badge(u)} <span class="pill">確認：${this.esc(d.confirmedLevel||"公式確認済み")}</span> <span class="pill">最終確認：${this.esc(d.lastChecked||"未確認")}</span></p>
    <div class="officialWarn">年度により科目・配点・方式が変わる可能性があります。出願前は必ず公式募集要項で最終確認してください。</div>
    ${(d.methods||[]).map(m=>`<div class="methodCard">
      <h4>🎯 ${this.esc(m.method)}</h4>
      <p class="small">選抜：${this.esc(m.selection||"")}</p>
      <strong>共通テスト</strong>
      <div class="subjectTags">${(m.commonTest?.subjects||[]).map(s=>`<span>${this.esc(s)}</span>`).join("")}</div>
      <p class="small">${this.esc(m.commonTest?.note||"")}</p>
      <strong>個別試験・二次試験</strong>
      <div class="subjectTags">${(m.secondTest?.subjects||[]).length ? (m.secondTest.subjects||[]).map(s=>`<span>${this.esc(s)}</span>`).join("") : "<span>なし</span>"}</div>
      <p class="small">${this.esc(m.secondTest?.note||"")}</p>
      <strong>配点</strong>
      <p class="small">共通テスト：${this.esc(m.points?.common||"公式要項で確認")} ／ 個別：${this.esc(m.points?.second||"公式要項で確認")}</p>
      <p class="small">${this.esc(m.points?.note||"")}</p>
      <strong>優先して対策したいこと</strong>
      <div class="subjectTags">${(m.studyPriority||[]).map(s=>`<span>${this.esc(s)}</span>`).join("")}</div>
      <p class="small">${this.esc(m.teacherMemo||"")}</p>
    </div>`).join("")}
    <h3>📅 学習計画のたたき台</h3>
    <div class="planTimeline">${(d.monthlyPlan||[]).map(p=>`<div class="planMonth"><strong>${this.esc(p.month)}</strong><ul>${(p.tasks||[]).map(t=>`<li>${this.esc(t)}</li>`).join("")}</ul></div>`).join("")}</div>
    <div class="studentRecord">
      <strong>📈 生徒記録テンプレート</strong>
      <p class="small">この志望校に合わせて、進捗を記録する項目です。</p>
      <div class="recordGrid">${(d.recordTemplate?.subjects||[]).map(s=>`<div class="recordItem">${this.esc(s)}：□ 未記録</div>`).join("")}</div>
      <p class="small">面談メモ例：${(d.recordTemplate?.memoPrompts||[]).map(x=>this.esc(x)).join(" ／ ")}</p>
    </div>
    <div class="actions">
      ${d.sourceUrl?`<a class="btn light" href="${d.sourceUrl}" target="_blank">看護学部入試情報</a>`:""}
      ${d.outlineUrl?`<a class="btn light" href="${d.outlineUrl}" target="_blank">選抜要項</a>`:""}
      ${d.changesUrl?`<a class="btn light" href="${d.changesUrl}" target="_blank">変更点</a>`:""}
    </div>
  </div>`).join("");
};

SC.renderDetail=function(name){
  this.renderCompareBar(false);
  const u=this.byName(name);
  if(!u)return this.go("search");
  const q=u.quality||{}, e=u.entrance||{};
  this.app().innerHTML=`<div class="card">
    <h2>${this.esc(u.name)}</h2>
    <p class="small">${this.esc(u.type)} ／ ${this.esc(u.pref)} ／ ${this.esc(u.area)} ／ ${this.esc(u.field)}</p>
    <p>${this.badge(u)} <span class="pill">最終確認：${this.esc(q.lastChecked||e.lastChecked||"未確認")}</span></p>
    <h3>学部・学科</h3>
    <p>${this.esc((u.faculties||[]).join("、")||"未登録")}</p>
    <p class="small">${this.esc((u.departments||[]).join("、")||"")}</p>
    ${this.renderEntranceDetails(u)}
    <div class="actions">
      ${q.officialUrl||e.officialUrl?`<a class="btn light" href="${q.officialUrl||e.officialUrl}" target="_blank">公式</a>`:""}
      ${q.admissionUrl||e.admissionUrl?`<a class="btn light" href="${q.admissionUrl||e.admissionUrl}" target="_blank">入試</a>`:""}
      <button class="btn" onclick="SC.toggleFavorite('${this.esc(u.name)}')">${this.favorites.includes(u.name)?"♥ 保存済み":"♡ 保存"}</button>
      <button class="btn light" onclick="SC.addCompare('${this.esc(u.name)}')">📊 比較に追加</button>
    </div>
  </div>`;
};

/* 4.6 地域・都道府県チップ検索 */
SC.setRegionChip=function(area){
  this.filters.area=area==="全国" ? "" : area;
  this.filters.pref="";
  this.go("search");
};
SC.setPrefChip=function(pref){
  this.filters.pref=this.filters.pref===pref ? "" : pref;
  this.go("search");
};
SC.setTypeChip=function(type){
  this.filters.type=type==="すべて" ? "" : type;
  this.go("search");
};
SC.prefChipSection=function(){
  const region = this.filters.area || "全国";
  const regions = ["全国","北海道","東北","関東","中部","東海","近畿","中国","四国","九州・沖縄"];
  const prefs = region==="全国" ? [] : (this.regionPrefs[region]||[]);
  return `<div class="prefChipSection">
    <div class="prefChipTitle">地域</div>
    <div class="prefChipGroup">${regions.map(r=>`<button class="prefChip ${(this.filters.area||"全国")===r?"on":""}" onclick="SC.setRegionChip('${r}')">${r}</button>`).join("")}</div>
    ${prefs.length?`<div class="prefChipTitle" style="margin-top:10px">都道府県</div><div class="prefChipGroup">${prefs.map(p=>`<button class="prefChip ${this.filters.pref===p?"on":""}" onclick="SC.setPrefChip('${p}')">${p}</button>`).join("")}</div>`:""}
    <div class="prefChipTitle" style="margin-top:10px">種別</div>
    <div class="prefChipGroup">${["すべて","国立","公立","私立"].map(t=>`<button class="prefChip ${(!this.filters.type&&t==="すべて")||this.filters.type===t?"on":""}" onclick="SC.setTypeChip('${t}')">${t}</button>`).join("")}</div>
  </div>`;
};

SC.renderSearch=function(){
  this.renderCompareBar(false);
  const list=this.filtered();
  this.app().innerHTML=`<div class="card">
    <h2>🔍 大学検索</h2>
    <div class="searchLine"><span class="searchIcon">🔍</span><input value="${this.esc(this.query)}" placeholder="大学名・学部・キーワード" oninput="SC.setQuery(this.value)"><button onclick="SC.go('search')">検索</button></div>
    <details open><summary class="modeBox">検索条件を開く</summary>
      ${this.prefChipSection()}
      <div class="formGrid">
        <label>偏差値下限<input type="number" value="${this.filters.min}" onchange="SC.setFilter('min',this.value)"></label>
        <label>偏差値上限<input type="number" value="${this.filters.max}" onchange="SC.setFilter('max',this.value)"></label>
      </div>
      <div class="actions"><button class="btn" onclick="SC.go('search')">検索更新</button><button class="btn light" onclick="SC.clearFilters()">条件クリア</button></div>
    </details>
    <p class="small">${list.length}件表示</p>
    ${list.map(u=>this.uniCard(u)).join("")||`<div class="uniCard">該当する大学がありません。</div>`}
  </div>`;
};

SC.selectedFacultyIndex = 0;
SC.renderEntranceDetails=function(u){
  const details=u.entranceDetails||[];
  if(!details.length){
    return `<div class="entranceDetailBox"><h3>📚 学部別入試情報</h3><p class="small">この大学はまだ学部・学科別の受験科目データが登録されていません。</p></div>`;
  }
  const idx = Math.min(this.selectedFacultyIndex||0, details.length-1);
  const d = details[idx];
  const tabs = `<div class="facultyTabs">${details.map((x,i)=>`<button class="${i===idx?"on":""}" onclick="SC.selectedFacultyIndex=${i};SC.renderDetail('${this.esc(u.name)}')">${this.esc((x.displayName||x.faculty||"").replace("名古屋市立大学 ",""))}</button>`).join("")}</div>`;
  const body = `<div class="entranceDetailBox">
    <h3>📚 ${this.esc(d.displayName||((d.faculty||"")+" "+(d.department||"")))}</h3>
    <p>${this.badge(u)} <span class="pill">確認：${this.esc(d.confirmedLevel||"公式確認済み")}</span> <span class="pill">最終確認：${this.esc(d.lastChecked||"未確認")}</span></p>
    <div class="officialWarn">年度により科目・配点・方式が変わる可能性があります。出願前は必ず公式募集要項で最終確認してください。</div>
    ${(d.methods||[]).map(m=>`<details class="entranceFold" open><summary>🎯 ${this.esc(m.method)}</summary><div class="methodCard">
      <p class="small">選抜：${this.esc(m.selection||"")}</p>
      <strong>共通テスト</strong>
      <div class="subjectTags">${(m.commonTest?.subjects||[]).map(s=>`<span>${this.esc(s)}</span>`).join("")}</div>
      <p class="small">${this.esc(m.commonTest?.note||"")}</p>
      <strong>個別試験・二次試験</strong>
      <div class="subjectTags">${(m.secondTest?.subjects||[]).length ? (m.secondTest.subjects||[]).map(s=>`<span>${this.esc(s)}</span>`).join("") : "<span>なし</span>"}</div>
      <p class="small">${this.esc(m.secondTest?.note||"")}</p>
      <strong>配点</strong>
      <p class="small">共通テスト：${this.esc(m.points?.common||"公式要項で確認")} ／ 個別：${this.esc(m.points?.second||"公式要項で確認")}</p>
      <p class="small">${this.esc(m.points?.note||"")}</p>
      <strong>優先して対策したいこと</strong>
      <div class="subjectTags">${(m.studyPriority||[]).map(s=>`<span>${this.esc(s)}</span>`).join("")}</div>
      <p class="small">${this.esc(m.teacherMemo||"")}</p>
    </div></details>`).join("")}
    <h3>📅 学習計画のたたき台</h3>
    <div class="planTimeline">${(d.monthlyPlan||[]).map(p=>`<div class="planMonth"><strong>${this.esc(p.month)}</strong><ul>${(p.tasks||[]).map(t=>`<li>${this.esc(t)}</li>`).join("")}</ul></div>`).join("")}</div>
    <div class="studentRecord"><strong>📈 生徒記録テンプレート</strong><p class="small">この志望校に合わせて、進捗を記録する項目です。</p><div class="recordGrid">${(d.recordTemplate?.subjects||[]).map(s=>`<div class="recordItem">${this.esc(s)}：□ 未記録</div>`).join("")}</div><p class="small">面談メモ例：${(d.recordTemplate?.memoPrompts||[]).map(x=>this.esc(x)).join(" ／ ")}</p></div>
    <div class="actions">${d.sourceUrl?`<a class="btn light" href="${d.sourceUrl}" target="_blank">学部・入試情報</a>`:""}${d.outlineUrl?`<a class="btn light" href="${d.outlineUrl}" target="_blank">選抜要項</a>`:""}${d.changesUrl?`<a class="btn light" href="${d.changesUrl}" target="_blank">変更点</a>`:""}</div>
  </div>`;
  return tabs + body;
};

/* 4.7.1 学部アコーディオン版 */
SC.openFacultyAcc = SC.openFacultyAcc || 0;

SC.facultyIcon=function(name){
  if((name||"").includes("医")) return "🏥";
  if((name||"").includes("薬")) return "💊";
  if((name||"").includes("経済")) return "📈";
  if((name||"").includes("人文") || (name||"").includes("社会")) return "📚";
  if((name||"").includes("芸術")) return "🎨";
  if((name||"").includes("生命") || (name||"").includes("理")) return "🧪";
  if((name||"").includes("データ") || (name||"").includes("情報")) return "💻";
  if((name||"").includes("教育")) return "👨‍🏫";
  return "🏫";
};

SC.facultyStatusLabel=function(d){
  const text=(d.confirmedLevel||"");
  if(text.includes("入試方式まで") || text.includes("詳細")) return "✅ 詳細登録";
  if(text.includes("科目") || text.includes("配点")) return "🟢 科目登録";
  if(text.includes("確認済み")) return "🟡 登録中";
  return "⚪ 確認予定";
};

SC.toggleFacultyAcc=function(i, universityName){
  this.openFacultyAcc = (this.openFacultyAcc===i ? -1 : i);
  this.renderDetail(universityName);
};

SC.renderMethodSummary=function(d){
  const methods=d.methods||[];
  const first=methods[0]||{};
  const common=(first.commonTest?.subjects||[]).slice(0,5);
  const second=(first.secondTest?.subjects||[]).slice(0,5);
  return `<div class="facultyQuickInfo">
    <strong>確認状況：</strong>${this.esc(d.confirmedLevel||"確認予定")}<br>
    <strong>主な方式：</strong>${this.esc(methods.map(m=>m.method).join(" ／ ")||"今後追加")}<br>
    <strong>共通テスト：</strong>${this.esc(common.join("・")||"公式要項で確認")}<br>
    <strong>個別試験：</strong>${this.esc(second.join("・")||"公式要項で確認")}
  </div>`;
};

SC.renderSingleEntranceDetail=function(u,d){
  return `<div>
    <p>${this.badge(u)} <span class="pill">確認：${this.esc(d.confirmedLevel||"公式確認済み")}</span> <span class="pill">最終確認：${this.esc(d.lastChecked||"未確認")}</span></p>
    <div class="officialWarn">年度により科目・配点・方式が変わる可能性があります。出願前は必ず公式募集要項で最終確認してください。</div>
    ${(d.methods||[]).map(m=>`<details class="entranceFold" open><summary>🎯 ${this.esc(m.method)}</summary><div class="methodCard">
      <p class="small">選抜：${this.esc(m.selection||"")}</p>
      <strong>共通テスト</strong>
      <div class="subjectTags">${(m.commonTest?.subjects||[]).map(s=>`<span>${this.esc(s)}</span>`).join("")}</div>
      <p class="small">${this.esc(m.commonTest?.note||"")}</p>
      <strong>個別試験・二次試験</strong>
      <div class="subjectTags">${(m.secondTest?.subjects||[]).length ? (m.secondTest.subjects||[]).map(s=>`<span>${this.esc(s)}</span>`).join("") : "<span>なし</span>"}</div>
      <p class="small">${this.esc(m.secondTest?.note||"")}</p>
      <strong>配点</strong>
      <p class="small">共通テスト：${this.esc(m.points?.common||"公式要項で確認")} ／ 個別：${this.esc(m.points?.second||"公式要項で確認")}</p>
      <p class="small">${this.esc(m.points?.note||"")}</p>
      <strong>優先して対策したいこと</strong>
      <div class="subjectTags">${(m.studyPriority||[]).map(s=>`<span>${this.esc(s)}</span>`).join("")}</div>
      <p class="small">${this.esc(m.teacherMemo||"")}</p>
    </div></details>`).join("")}
    <h3>📅 学習計画のたたき台</h3>
    <div class="planTimeline">${(d.monthlyPlan||[]).map(p=>`<div class="planMonth"><strong>${this.esc(p.month)}</strong><ul>${(p.tasks||[]).map(t=>`<li>${this.esc(t)}</li>`).join("")}</ul></div>`).join("")}</div>
    <div class="studentRecord"><strong>📈 生徒記録テンプレート</strong><p class="small">この志望校に合わせて、進捗を記録する項目です。</p><div class="recordGrid">${(d.recordTemplate?.subjects||[]).map(s=>`<div class="recordItem">${this.esc(s)}：□ 未記録</div>`).join("")}</div><p class="small">面談メモ例：${(d.recordTemplate?.memoPrompts||[]).map(x=>this.esc(x)).join(" ／ ")}</p></div>
    <div class="actions">${d.sourceUrl?`<a class="btn light" href="${d.sourceUrl}" target="_blank">学部・入試情報</a>`:""}${d.outlineUrl?`<a class="btn light" href="${d.outlineUrl}" target="_blank">選抜要項</a>`:""}${d.changesUrl?`<a class="btn light" href="${d.changesUrl}" target="_blank">変更点</a>`:""}</div>
  </div>`;
};

SC.renderEntranceDetails=function(u){
  const details=u.entranceDetails||[];
  if(!details.length){
    return `<div class="entranceDetailBox"><h3>📚 学部別入試情報</h3><p class="small">この大学はまだ学部・学科別の受験科目データが登録されていません。</p></div>`;
  }
  if(this.openFacultyAcc < 0 || this.openFacultyAcc >= details.length) this.openFacultyAcc = 0;
  return `<div class="entranceDetailBox">
    <h3>📚 学部・学科別 入試情報</h3>
    <p class="small">見たい学部・学科をタップして開いてください。</p>
    <div class="facultyAccordion">
      ${details.map((d,i)=>{
        const isOpen=this.openFacultyAcc===i;
        const title=d.displayName||((d.faculty||"")+" "+(d.department||""));
        const dept=d.department||"";
        return `<div class="facultyAccItem">
          <button class="facultyAccHead" onclick="SC.toggleFacultyAcc(${i},'${this.esc(u.name)}')">
            <span class="left">
              <span>${this.facultyIcon(d.faculty||title)} ${this.esc(title)}</span>
              <span class="sub">${this.esc(dept)}</span>
            </span>
            <span class="facultyAccStatus">${this.facultyStatusLabel(d)}</span>
          </button>
          <div class="facultyAccBody ${isOpen?"":"closed"}">
            <div class="departmentChips"><span>${this.esc(d.faculty||"学部")}</span>${dept?`<span>${this.esc(dept)}</span>`:""}</div>
            ${this.renderMethodSummary(d)}
            ${isOpen ? this.renderSingleEntranceDetail(u,d) : ""}
          </div>
        </div>`;
      }).join("")}
    </div>
  </div>`;
};

/* 4.7.2 学部リスト→専攻詳細画面 */
SC.groupEntranceDetails=function(details){
  const groups={};
  (details||[]).forEach((d,i)=>{
    const key=d.faculty||"その他";
    if(!groups[key]) groups[key]=[];
    groups[key].push({...d,_index:i});
  });
  return groups;
};

SC.facultyIcon=function(name){
  if((name||"").includes("医")) return "🏥";
  if((name||"").includes("薬")) return "💊";
  if((name||"").includes("経済")) return "📈";
  if((name||"").includes("人文") || (name||"").includes("社会")) return "📚";
  if((name||"").includes("芸術")) return "🎨";
  if((name||"").includes("生命") || (name||"").includes("理")) return "🧪";
  if((name||"").includes("データ") || (name||"").includes("情報")) return "💻";
  if((name||"").includes("教育")) return "👨‍🏫";
  return "🏫";
};

SC.facultyStatusLabel=function(d){
  const text=(d.confirmedLevel||"");
  if(text.includes("入試方式まで") || text.includes("詳細")) return "✅ 詳細";
  if(text.includes("科目") || text.includes("配点")) return "🟢 科目";
  if(text.includes("確認済み")) return "🟡 登録中";
  return "⚪ 予定";
};

SC.renderEntranceDetails=function(u){
  const details=u.entranceDetails||[];
  if(!details.length){
    return `<div class="facultyListBox"><h3>📚 学部別入試情報</h3><p class="small">この大学はまだ学部・学科別の受験科目データが登録されていません。</p></div>`;
  }
  const groups=this.groupEntranceDetails(details);
  return `<div class="facultyListBox">
    <div class="facultyListHeader">
      <div>
        <h3>📚 学部・学科を選択</h3>
        <p class="small">見たい学科・専攻をタップすると、受験科目や学習計画を別画面で開きます。</p>
      </div>
      <span class="pill">${details.length}件</span>
    </div>
    ${Object.entries(groups).map(([faculty,items])=>`<div class="facultyGroup">
      <div class="facultyGroupHead">
        <div>${this.facultyIcon(faculty)} ${this.esc(faculty)}<span class="sub">${items.length}件の学科・専攻</span></div>
        <span class="majorStatus">${items.some(x=>(x.confirmedLevel||"").includes("入試方式まで"))?"✅ 詳細あり":"🟡 登録中"}</span>
      </div>
      <div class="majorList">
        ${items.map(d=>`<button class="majorRow" onclick="SC.renderMajorDetail('${this.esc(u.name)}',${d._index})">
          <span>
            ${this.esc((d.displayName||d.department||faculty).replace(faculty,"").trim() || d.department || d.displayName || faculty)}
            <span class="majorSub">${this.esc(d.department||"")}</span>
          </span>
          <span class="majorStatus">${this.facultyStatusLabel(d)}</span>
        </button>`).join("")}
      </div>
    </div>`).join("")}
  </div>`;
};

SC.renderMajorDetail=function(universityName,index){
  const u=this.byName(universityName);
  if(!u) return this.go("search");
  const d=(u.entranceDetails||[])[index];
  if(!d) return this.renderDetail(universityName);
  this.renderCompareBar(false);

  const methods=d.methods||[];
  const methodHtml=methods.map(m=>`<div class="detailSectionCard">
    <h3>🎯 ${this.esc(m.method)}</h3>
    <p class="small">選抜：${this.esc(m.selection||"")}</p>
    <strong>共通テスト</strong>
    <div class="subjectTags">${(m.commonTest?.subjects||[]).map(s=>`<span>${this.esc(s)}</span>`).join("")}</div>
    <p class="small">${this.esc(m.commonTest?.note||"")}</p>
    <strong>個別試験・二次試験</strong>
    <div class="subjectTags">${(m.secondTest?.subjects||[]).length ? (m.secondTest.subjects||[]).map(s=>`<span>${this.esc(s)}</span>`).join("") : "<span>なし</span>"}</div>
    <p class="small">${this.esc(m.secondTest?.note||"")}</p>
    <strong>配点</strong>
    <p class="small">共通テスト：${this.esc(m.points?.common||"公式要項で確認")} ／ 個別：${this.esc(m.points?.second||"公式要項で確認")}</p>
    <p class="small">${this.esc(m.points?.note||"")}</p>
    <strong>優先して対策したいこと</strong>
    <div class="subjectTags">${(m.studyPriority||[]).map(s=>`<span>${this.esc(s)}</span>`).join("")}</div>
    <p class="small">${this.esc(m.teacherMemo||"")}</p>
  </div>`).join("");

  const planHtml=`<div class="detailSectionCard">
    <h3>📅 学習計画のたたき台</h3>
    <div class="planTimeline">${(d.monthlyPlan||[]).map(p=>`<div class="planMonth"><strong>${this.esc(p.month)}</strong><ul>${(p.tasks||[]).map(t=>`<li>${this.esc(t)}</li>`).join("")}</ul></div>`).join("")}</div>
  </div>`;

  const recordHtml=`<div class="detailSectionCard studentRecord">
    <strong>📈 生徒記録テンプレート</strong>
    <p class="small">この志望校に合わせて、進捗を記録する項目です。</p>
    <div class="recordGrid">${(d.recordTemplate?.subjects||[]).map(s=>`<div class="recordItem">${this.esc(s)}：□ 未記録</div>`).join("")}</div>
    <p class="small">面談メモ例：${(d.recordTemplate?.memoPrompts||[]).map(x=>this.esc(x)).join(" ／ ")}</p>
  </div>`;

  this.app().innerHTML=`<div class="card">
    <div class="backStrip">
      <button class="btn light" onclick="SC.renderDetail('${this.esc(u.name)}')">← 学部一覧へ</button>
      <button class="btn light" onclick="SC.go('home')">ホーム</button>
    </div>
    <div class="detailPageHeader">
      <h2>${this.facultyIcon(d.faculty)} ${this.esc(d.displayName||d.department||d.faculty)}</h2>
      <p class="small">${this.esc(u.name)} ／ ${this.esc(d.faculty||"")} ／ ${this.esc(d.department||"")}</p>
      <p><span class="pill">${this.facultyStatusLabel(d)}</span> <span class="pill">最終確認：${this.esc(d.lastChecked||"未確認")}</span></p>
      <div class="officialWarn">年度により科目・配点・方式が変わる可能性があります。出願前は必ず公式募集要項で最終確認してください。</div>
    </div>

    <div class="detailMiniNav">
      <button onclick="document.getElementById('examSec').scrollIntoView({behavior:'smooth'})">受験科目</button>
      <button onclick="document.getElementById('planSec').scrollIntoView({behavior:'smooth'})">学習計画</button>
      <button onclick="document.getElementById('recordSec').scrollIntoView({behavior:'smooth'})">記録</button>
      <button onclick="document.getElementById('linkSec').scrollIntoView({behavior:'smooth'})">公式</button>
    </div>

    <div id="examSec">${methodHtml}</div>
    <div id="planSec">${planHtml}</div>
    <div id="recordSec">${recordHtml}</div>
    <div id="linkSec" class="detailSectionCard">
      <h3>🔗 公式確認リンク</h3>
      <div class="actions">
        ${d.sourceUrl?`<a class="btn light" href="${d.sourceUrl}" target="_blank">学部・入試情報</a>`:""}
        ${d.outlineUrl?`<a class="btn light" href="${d.outlineUrl}" target="_blank">選抜要項</a>`:""}
        ${d.changesUrl?`<a class="btn light" href="${d.changesUrl}" target="_blank">変更点</a>`:""}
        <button class="btn" onclick="SC.addCompare('${this.esc(u.name)}')">大学を比較に追加</button>
      </div>
    </div>
  </div>`;
};

/* 4.7.3 学部だけ表示→学科展開 */
SC.openFacultyGroup = SC.openFacultyGroup || "";

SC.toggleFacultyGroup=function(faculty, universityName){
  this.openFacultyGroup = (this.openFacultyGroup===faculty ? "" : faculty);
  this.renderDetail(universityName);
};

SC.renderEntranceDetails=function(u){
  const details=u.entranceDetails||[];
  if(!details.length){
    return `<div class="facultyListBox"><h3>📚 学部別入試情報</h3><p class="small">この大学はまだ学部・学科別の受験科目データが登録されていません。</p></div>`;
  }
  const groups=this.groupEntranceDetails(details);
  return `<div class="facultyListBox">
    <div class="facultyListHeader">
      <div>
        <h3>📚 学部を選択</h3>
        <p class="small">まず学部をタップしてください。学科・専攻が表示されます。</p>
      </div>
      <span class="pill">${Object.keys(groups).length}学部</span>
    </div>
    <div class="facultyOnlyList">
      ${Object.entries(groups).map(([faculty,items])=>{
        const isOpen=this.openFacultyGroup===faculty;
        const hasDetailed=items.some(x=>(x.confirmedLevel||"").includes("入試方式まで") || (x.confirmedLevel||"").includes("詳細"));
        return `<div class="facultyOnlyItem">
          <button class="facultyOnlyHead" onclick="SC.toggleFacultyGroup('${this.esc(faculty)}','${this.esc(u.name)}')">
            <span class="facultyName">
              <span>${this.facultyIcon(faculty)} ${this.esc(faculty)}</span>
              <span class="facultySub">${items.length}件の学科・専攻</span>
            </span>
            <span style="display:flex;align-items:center;gap:8px">
              <span class="facultyOpenStatus">${hasDetailed?"✅ 詳細あり":"🟡 登録中"}</span>
              <span class="arrow">${isOpen?"▲":"▼"}</span>
            </span>
          </button>
          <div class="majorHiddenList ${isOpen?"open":""}">
            ${items.map(d=>`<button class="majorCompactRow" onclick="SC.renderMajorDetail('${this.esc(u.name)}',${d._index})">
              <span class="majorName">
                <span>${this.esc((d.displayName||d.department||faculty).replace(faculty,"").trim() || d.department || d.displayName || faculty)}</span>
                <span class="majorNote">${this.esc(d.department||"")}</span>
              </span>
              <span class="majorStatus">${this.facultyStatusLabel(d)} ＞</span>
            </button>`).join("")}
          </div>
        </div>`;
      }).join("")}
    </div>
  </div>`;
};

/* 4.7.4 並び替え・大学名タップ */
SC.sortMode = SC.sortMode || "おすすめ順";

SC.setSortMode=function(mode){
  this.sortMode=mode;
  if(this.route==="favorites") this.renderFavorites();
  else if(this.route==="search") this.go("search");
};

SC.sortControls=function(){
  const modes=["おすすめ順","偏差値が高い順","偏差値が近い順","公式確認済み優先","国公立優先","私立優先"];
  return `<div class="sortBox">
    <div class="sortBoxTitle">並び替え</div>
    <div class="sortChips">${modes.map(m=>`<button class="sortChip ${this.sortMode===m?"on":""}" onclick="SC.setSortMode('${m}')">${m}</button>`).join("")}</div>
  </div>`;
};

SC.sortUniversities=function(list, targetLevel=55){
  const arr=[...list];
  const verifiedScore=u=>((u.quality?.confirmationStatus||"").includes("確認済")|| (u.quality?.confirmationStatus||"").includes("詳細") ? 1 : 0);
  if(this.sortMode==="偏差値が高い順") arr.sort((a,b)=>(b.level||0)-(a.level||0));
  else if(this.sortMode==="偏差値が近い順") arr.sort((a,b)=>Math.abs((a.level||50)-targetLevel)-Math.abs((b.level||50)-targetLevel));
  else if(this.sortMode==="公式確認済み優先") arr.sort((a,b)=>verifiedScore(b)-verifiedScore(a) || (b.level||0)-(a.level||0));
  else if(this.sortMode==="国公立優先") arr.sort((a,b)=>((b.type==="国立"||b.type==="公立")?1:0)-((a.type==="国立"||a.type==="公立")?1:0) || (b.level||0)-(a.level||0));
  else if(this.sortMode==="私立優先") arr.sort((a,b)=>(b.type==="私立"?1:0)-(a.type==="私立"?1:0) || (b.level||0)-(a.level||0));
  else arr.sort((a,b)=>(b.mapScore||0)-(a.mapScore||0) || (b.aiScore||0)-(a.aiScore||0) || verifiedScore(b)-verifiedScore(a));
  return arr;
};

SC.uniCard=function(u){
  const fav=this.favorites.includes(u.name);
  return `<div class="uniCard clickable">
    <button class="uniTitleButton" onclick="SC.go('detail','${this.esc(u.name)}')"><h3>${this.esc(u.name)}</h3></button>
    <p class="small">${this.esc(u.type)} ／ ${this.esc(u.pref)} ／ ${this.esc(u.field)} ／ 偏差値目安 ${u.level||"未登録"}</p>
    <p>${this.badge(u)}</p>
    <div class="actions">
      <button class="btn light" onclick="SC.go('detail','${this.esc(u.name)}')">詳細</button>
      <button class="btn light" onclick="SC.toggleFavorite('${this.esc(u.name)}')">${fav?"♥ 保存済み":"♡ 保存"}</button>
      <button class="btn light" onclick="SC.addCompare('${this.esc(u.name)}')">📊 比較に追加</button>
    </div>
  </div>`;
};

/* 検索画面にも並び替えを反映 */
const oldRenderSearch474 = SC.renderSearch;
SC.renderSearch=function(){
  this.renderCompareBar(false);
  const target=Number(this.filters?.min || this.filters?.max || 55);
  const list=this.sortUniversities(this.filtered(), target);
  this.app().innerHTML=`<div class="card">
    <h2>🔍 大学検索</h2>
    <div class="searchLine"><span class="searchIcon">🔍</span><input value="${this.esc(this.query)}" placeholder="大学名・学部・キーワード" oninput="SC.setQuery(this.value)"><button onclick="SC.go('search')">検索</button></div>
    <details open><summary class="modeBox">検索条件を開く</summary>
      ${this.prefChipSection ? this.prefChipSection() : ""}
      <div class="formGrid">
        <label>偏差値下限<input type="number" value="${this.filters.min}" onchange="SC.setFilter('min',this.value)"></label>
        <label>偏差値上限<input type="number" value="${this.filters.max}" onchange="SC.setFilter('max',this.value)"></label>
      </div>
      <div class="actions"><button class="btn" onclick="SC.go('search')">検索更新</button><button class="btn light" onclick="SC.clearFilters()">条件クリア</button></div>
    </details>
    ${this.sortControls()}
    <p class="small">${list.length}件表示</p>
    ${list.map(u=>this.uniCard(u)).join("")||`<div class="uniCard">該当する大学がありません。</div>`}
  </div>`;
};

/* 4.7.5 戻る導線・お気に入り操作 */
SC.lastListRoute = SC.lastListRoute || "search";
SC.lastListLabel = SC.lastListLabel || "検索結果へ戻る";

SC.rememberListRoute=function(route,label){
  this.lastListRoute=route;
  this.lastListLabel=label;
};

SC.goBackSmart=function(){
  if(this.lastListRoute==="favorites") return this.go("favorites");
  if(this.lastListRoute==="dreamResult") return this.renderDreamResult ? this.renderDreamResult() : this.go("dream");
  if(this.lastListRoute==="ai") return this.go("ai");
  return this.go("search");
};

SC.showFavToast=function(saved){
  const old=document.getElementById("favToast");
  if(old) old.remove();
  const div=document.createElement("div");
  div.id="favToast";
  div.className="favToast";
  div.textContent=saved ? "♥ お気に入りに保存しました" : "♡ お気に入りから外しました";
  document.body.appendChild(div);
  setTimeout(()=>div.remove(),1300);
};

SC.toggleFavoriteSmooth=function(name, rerender=true){
  const was=this.favorites.includes(name);
  this.favorites=was ? this.favorites.filter(x=>x!==name) : [...this.favorites,name];
  this.save();
  this.showFavToast(!was);
  if(rerender) this.renderDetail(name);
};

SC.detailTopNav=function(u){
  const saved=this.favorites.includes(u.name);
  return `<div class="detailTopNav">
    <button class="backBtn475" onclick="SC.goBackSmart()">← ${this.esc(this.lastListLabel||"検索結果へ戻る")}</button>
    <button class="favRoundBtn ${saved?"saved":""}" onclick="SC.toggleFavoriteSmooth('${this.esc(u.name)}')">${saved?"♥":"♡"}</button>
  </div>`;
};

SC.uniCard=function(u){
  const fav=this.favorites.includes(u.name);
  return `<div class="uniCard clickable">
    <button class="uniTitleButton" onclick="SC.rememberListRoute(SC.route==='favorites'?'favorites':'search', SC.route==='favorites'?'お気に入りへ戻る':'検索結果へ戻る');SC.go('detail','${this.esc(u.name)}')"><h3>${this.esc(u.name)}</h3></button>
    <p class="small">${this.esc(u.type)} ／ ${this.esc(u.pref)} ／ ${this.esc(u.field)} ／ 偏差値目安 ${u.level||"未登録"}</p>
    <p>${this.badge(u)}</p>
    <div class="actions">
      <button class="btn light" onclick="SC.rememberListRoute(SC.route==='favorites'?'favorites':'search', SC.route==='favorites'?'お気に入りへ戻る':'検索結果へ戻る');SC.go('detail','${this.esc(u.name)}')">詳細</button>
      <button class="btn light" onclick="SC.toggleFavoriteSmooth('${this.esc(u.name)}', false); if(SC.route==='favorites') SC.renderFavorites();">${fav?"♥ 保存済み":"♡ 保存"}</button>
      <button class="btn light" onclick="SC.addCompare('${this.esc(u.name)}')">📊 比較に追加</button>
    </div>
  </div>`;
};

/* 大学詳細に戻る導線と右上お気に入りを追加 */
SC.renderDetail=function(name){
  this.renderCompareBar(false);
  const u=this.byName(name);
  if(!u)return this.go("search");
  const q=u.quality||{}, e=u.entrance||{};
  this.app().innerHTML=`<div class="card">
    ${this.detailTopNav(u)}
    <div class="detailTitleRow">
      <h2>${this.esc(u.name)}</h2>
    </div>
    <p class="small">${this.esc(u.type)} ／ ${this.esc(u.pref)} ／ ${this.esc(u.area)} ／ ${this.esc(u.field)}</p>
    <p>${this.badge(u)} <span class="pill">最終確認：${this.esc(q.lastChecked||e.lastChecked||"未確認")}</span></p>
    <h3>学部・学科</h3>
    <p>${this.esc((u.faculties||[]).join("、")||"未登録")}</p>
    <p class="small">${this.esc((u.departments||[]).join("、")||"")}</p>
    ${this.renderEntranceDetails(u)}
    <div class="actions">
      ${q.officialUrl||e.officialUrl?`<a class="btn light" href="${q.officialUrl||e.officialUrl}" target="_blank">公式</a>`:""}
      ${q.admissionUrl||e.admissionUrl?`<a class="btn light" href="${q.admissionUrl||e.admissionUrl}" target="_blank">入試</a>`:""}
      <button class="btn" onclick="SC.toggleFavoriteSmooth('${this.esc(u.name)}')">${this.favorites.includes(u.name)?"♥ 保存済み":"♡ 保存"}</button>
      <button class="btn light" onclick="SC.addCompare('${this.esc(u.name)}')">📊 比較に追加</button>
    </div>
  </div>`;
};

/* 専攻詳細にも戻る導線 */
const oldRenderMajorDetail475 = SC.renderMajorDetail;
SC.renderMajorDetail=function(universityName,index){
  const u=this.byName(universityName);
  if(!u) return this.go("search");
  const d=(u.entranceDetails||[])[index];
  if(!d) return this.renderDetail(universityName);
  this.renderCompareBar(false);
  const methods=d.methods||[];
  const methodHtml=methods.map(m=>`<div class="detailSectionCard">
    <h3>🎯 ${this.esc(m.method)}</h3>
    <p class="small">選抜：${this.esc(m.selection||"")}</p>
    <strong>共通テスト</strong>
    <div class="subjectTags">${(m.commonTest?.subjects||[]).map(s=>`<span>${this.esc(s)}</span>`).join("")}</div>
    <p class="small">${this.esc(m.commonTest?.note||"")}</p>
    <strong>個別試験・二次試験</strong>
    <div class="subjectTags">${(m.secondTest?.subjects||[]).length ? (m.secondTest.subjects||[]).map(s=>`<span>${this.esc(s)}</span>`).join("") : "<span>なし</span>"}</div>
    <p class="small">${this.esc(m.secondTest?.note||"")}</p>
    <strong>配点</strong>
    <p class="small">共通テスト：${this.esc(m.points?.common||"公式要項で確認")} ／ 個別：${this.esc(m.points?.second||"公式要項で確認")}</p>
    <p class="small">${this.esc(m.points?.note||"")}</p>
    <strong>優先して対策したいこと</strong>
    <div class="subjectTags">${(m.studyPriority||[]).map(s=>`<span>${this.esc(s)}</span>`).join("")}</div>
    <p class="small">${this.esc(m.teacherMemo||"")}</p>
  </div>`).join("");
  const planHtml=`<div class="detailSectionCard"><h3>📅 学習計画のたたき台</h3><div class="planTimeline">${(d.monthlyPlan||[]).map(p=>`<div class="planMonth"><strong>${this.esc(p.month)}</strong><ul>${(p.tasks||[]).map(t=>`<li>${this.esc(t)}</li>`).join("")}</ul></div>`).join("")}</div></div>`;
  const recordHtml=`<div class="detailSectionCard studentRecord"><strong>📈 生徒記録テンプレート</strong><p class="small">この志望校に合わせて、進捗を記録する項目です。</p><div class="recordGrid">${(d.recordTemplate?.subjects||[]).map(s=>`<div class="recordItem">${this.esc(s)}：□ 未記録</div>`).join("")}</div><p class="small">面談メモ例：${(d.recordTemplate?.memoPrompts||[]).map(x=>this.esc(x)).join(" ／ ")}</p></div>`;

  this.app().innerHTML=`<div class="card">
    <div class="detailTopNav">
      <button class="backBtn475" onclick="SC.renderDetail('${this.esc(u.name)}')">← 学部一覧へ</button>
      <button class="favRoundBtn ${this.favorites.includes(u.name)?"saved":""}" onclick="SC.toggleFavoriteSmooth('${this.esc(u.name)}', false); SC.renderMajorDetail('${this.esc(u.name)}',${index})">${this.favorites.includes(u.name)?"♥":"♡"}</button>
    </div>
    <div class="detailPageHeader">
      <h2>${this.facultyIcon(d.faculty)} ${this.esc(d.displayName||d.department||d.faculty)}</h2>
      <p class="small">${this.esc(u.name)} ／ ${this.esc(d.faculty||"")} ／ ${this.esc(d.department||"")}</p>
      <p><span class="pill">${this.facultyStatusLabel(d)}</span> <span class="pill">最終確認：${this.esc(d.lastChecked||"未確認")}</span></p>
      <div class="officialWarn">年度により科目・配点・方式が変わる可能性があります。出願前は必ず公式募集要項で最終確認してください。</div>
    </div>
    <div class="detailMiniNav">
      <button onclick="document.getElementById('examSec').scrollIntoView({behavior:'smooth'})">受験科目</button>
      <button onclick="document.getElementById('planSec').scrollIntoView({behavior:'smooth'})">学習計画</button>
      <button onclick="document.getElementById('recordSec').scrollIntoView({behavior:'smooth'})">記録</button>
      <button onclick="document.getElementById('linkSec').scrollIntoView({behavior:'smooth'})">公式</button>
    </div>
    <div id="examSec">${methodHtml}</div>
    <div id="planSec">${planHtml}</div>
    <div id="recordSec">${recordHtml}</div>
    <div id="linkSec" class="detailSectionCard">
      <h3>🔗 公式確認リンク</h3>
      <div class="actions">
        ${d.sourceUrl?`<a class="btn light" href="${d.sourceUrl}" target="_blank">学部・入試情報</a>`:""}
        ${d.outlineUrl?`<a class="btn light" href="${d.outlineUrl}" target="_blank">選抜要項</a>`:""}
        ${d.changesUrl?`<a class="btn light" href="${d.changesUrl}" target="_blank">変更点</a>`:""}
        <button class="btn" onclick="SC.addCompare('${this.esc(u.name)}')">大学を比較に追加</button>
      </div>
    </div>
  </div>`;
};

/* 4.7.6 学部一覧UI改善 */
SC.renderEntranceDetails=function(u){
  const details=u.entranceDetails||[];
  if(!details.length){
    return `<div class="facultyListBox"><h3>🏫 学部一覧</h3><p class="small">この大学はまだ学部・学科別の受験科目データが登録されていません。</p></div>`;
  }
  const groups=this.groupEntranceDetails(details);
  const facultyCount=Object.keys(groups).length;
  return `<div class="facultyListBox">
    <div class="facultyListHeader">
      <div>
        <h3>🏫 学部一覧</h3>
        <p class="small">学部をタップすると、学科・専攻が表示されます。</p>
      </div>
      <span class="facultyCountBadge">${facultyCount}学部</span>
    </div>
    <div class="facultyOnlyList">
      ${Object.entries(groups).map(([faculty,items])=>{
        const isOpen=this.openFacultyGroup===faculty;
        const hasDetailed=items.some(x=>(x.confirmedLevel||"").includes("入試方式まで") || (x.confirmedLevel||"").includes("詳細"));
        return `<div class="facultyOnlyItem">
          <button class="facultyOnlyHead" onclick="SC.toggleFacultyGroup('${this.esc(faculty)}','${this.esc(u.name)}')">
            <span class="facultyName">
              <span>${this.facultyIcon(faculty)} ${this.esc(faculty)}</span>
              <span class="facultySub">${items.length}件の学科・専攻</span>
            </span>
            <span style="display:flex;align-items:center;gap:6px">
              <span class="facultyOpenStatus">${hasDetailed?"✅ 詳細あり":"🟡 登録中"}</span>
              <span class="arrow">${isOpen?"▲":"▼"}</span>
            </span>
          </button>
          <div class="majorHiddenList ${isOpen?"open":""}">
            ${items.map(d=>`<button class="majorCompactRow" onclick="SC.renderMajorDetail('${this.esc(u.name)}',${d._index})">
              <span class="majorName">
                <span>${this.esc((d.displayName||d.department||faculty).replace(faculty,"").trim() || d.department || d.displayName || faculty)}</span>
                <span class="majorNote">${this.esc(d.department||"")}</span>
              </span>
              <span class="majorStatus">${this.facultyStatusLabel(d)} ＞</span>
            </button>`).join("")}
          </div>
        </div>`;
      }).join("")}
    </div>
  </div>`;
};

/* 4.8 入試データ：出願条件・AIアドバイス表示 */
SC.renderMethodExtra48=function(m){
  return `<div class="requirementBox"><strong>📌 出願条件・注意点</strong><br>${this.esc(m.admissionRequirements||"出願条件は公式募集要項で確認してください。")}</div>
          <div class="aiAdviceBox"><strong>🤖 AI学習アドバイス</strong><br>${this.esc(m.aiAdvice||"共通テストと個別試験の両方から、優先科目を決めて対策しましょう。")}</div>`;
};

SC.renderMajorDetail=function(universityName,index){
  const u=this.byName(universityName);
  if(!u) return this.go("search");
  const d=(u.entranceDetails||[])[index];
  if(!d) return this.renderDetail(universityName);
  this.renderCompareBar(false);
  const methods=d.methods||[];
  const methodHtml=methods.map(m=>`<div class="detailSectionCard">
    <h3>🎯 ${this.esc(m.method)}</h3>
    <div class="dataQualityRow"><span>${this.esc(d.confirmedLevel||"確認中")}</span><span>最終確認：${this.esc(d.lastChecked||"未確認")}</span></div>
    <p class="small">選抜：${this.esc(m.selection||"")}</p>
    ${this.renderMethodExtra48(m)}
    <strong>共通テスト</strong>
    <div class="subjectTags">${(m.commonTest?.subjects||[]).map(s=>`<span>${this.esc(s)}</span>`).join("")}</div>
    <p class="small">${this.esc(m.commonTest?.note||"")}</p>
    <strong>個別試験・二次試験</strong>
    <div class="subjectTags">${(m.secondTest?.subjects||[]).length ? (m.secondTest.subjects||[]).map(s=>`<span>${this.esc(s)}</span>`).join("") : "<span>なし</span>"}</div>
    <p class="small">${this.esc(m.secondTest?.note||"")}</p>
    <strong>配点</strong>
    <p class="small">共通テスト：${this.esc(m.points?.common||"公式要項で確認")} ／ 個別：${this.esc(m.points?.second||"公式要項で確認")}</p>
    <p class="small">${this.esc(m.points?.note||"")}</p>
    <strong>優先して対策したいこと</strong>
    <div class="subjectTags">${(m.studyPriority||[]).map(s=>`<span>${this.esc(s)}</span>`).join("")}</div>
    <p class="small">${this.esc(m.teacherMemo||"")}</p>
  </div>`).join("");
  const planHtml=`<div class="detailSectionCard"><h3>📅 学習計画のたたき台</h3><div class="planTimeline">${(d.monthlyPlan||[]).map(p=>`<div class="planMonth"><strong>${this.esc(p.month)}</strong><ul>${(p.tasks||[]).map(t=>`<li>${this.esc(t)}</li>`).join("")}</ul></div>`).join("")}</div></div>`;
  const recordHtml=`<div class="detailSectionCard studentRecord"><strong>📈 生徒記録テンプレート</strong><p class="small">この志望校に合わせて、進捗を記録する項目です。</p><div class="recordGrid">${(d.recordTemplate?.subjects||[]).map(s=>`<div class="recordItem">${this.esc(s)}：□ 未記録</div>`).join("")}</div><p class="small">面談メモ例：${(d.recordTemplate?.memoPrompts||[]).map(x=>this.esc(x)).join(" ／ ")}</p></div>`;

  this.app().innerHTML=`<div class="card">
    <div class="detailTopNav">
      <button class="backBtn475" onclick="SC.renderDetail('${this.esc(u.name)}')">← 学部一覧へ</button>
      <button class="favRoundBtn ${this.favorites.includes(u.name)?"saved":""}" onclick="SC.toggleFavoriteSmooth('${this.esc(u.name)}', false); SC.renderMajorDetail('${this.esc(u.name)}',${index})">${this.favorites.includes(u.name)?"♥":"♡"}</button>
    </div>
    <div class="detailPageHeader">
      <h2>${this.facultyIcon(d.faculty)} ${this.esc(d.displayName||d.department||d.faculty)}</h2>
      <p class="small">${this.esc(u.name)} ／ ${this.esc(d.faculty||"")} ／ ${this.esc(d.department||"")}</p>
      <p><span class="pill">${this.facultyStatusLabel(d)}</span> <span class="pill">最終確認：${this.esc(d.lastChecked||"未確認")}</span></p>
      <div class="officialWarn">年度により科目・配点・方式が変わる可能性があります。出願前は必ず公式募集要項で最終確認してください。</div>
    </div>
    <div class="detailMiniNav">
      <button onclick="document.getElementById('examSec').scrollIntoView({behavior:'smooth'})">受験科目</button>
      <button onclick="document.getElementById('planSec').scrollIntoView({behavior:'smooth'})">学習計画</button>
      <button onclick="document.getElementById('recordSec').scrollIntoView({behavior:'smooth'})">記録</button>
      <button onclick="document.getElementById('linkSec').scrollIntoView({behavior:'smooth'})">公式</button>
    </div>
    <div id="examSec">${methodHtml}</div>
    <div id="planSec">${planHtml}</div>
    <div id="recordSec">${recordHtml}</div>
    <div id="linkSec" class="detailSectionCard">
      <h3>🔗 公式確認リンク</h3>
      <div class="actions">
        ${d.sourceUrl?`<a class="btn light" href="${d.sourceUrl}" target="_blank">学部・入試情報</a>`:""}
        ${d.outlineUrl?`<a class="btn light" href="${d.outlineUrl}" target="_blank">選抜要項</a>`:""}
        ${d.changesUrl?`<a class="btn light" href="${d.changesUrl}" target="_blank">変更点</a>`:""}
        <button class="btn" onclick="SC.addCompare('${this.esc(u.name)}')">大学を比較に追加</button>
      </div>
    </div>
  </div>`;
};

/* 4.8.1 配点カード表示 */
SC.renderExamSummary481=function(d){
  const s=d.examSummary||{};
  if(!Object.keys(s).length) return "";
  return `<div class="examSummaryCard">
    <h3>📊 入試概要</h3>
    <div class="examSummaryGrid">
      <div class="examSummaryMini">難易度<br>${this.esc(s.difficultyLabel||"要確認")}</div>
      <div class="examSummaryMini">募集人数<br>${this.esc(s.recruitment||"公式要項で確認")}</div>
      <div class="examSummaryMini">特徴<br>${this.esc(s.examFeature||"要項確認")}</div>
      <div class="examSummaryMini">配点<br>${this.esc(s.pointStatus||"公式要項で確認")}</div>
    </div>
  </div>`;
};

SC.renderScoreCards481=function(d){
  const cards=d.scoreCards||[];
  if(!cards.length) return "";
  return cards.map(c=>`<div class="scoreCard">
    <h4>📘 ${this.esc(c.title||"配点")}</h4>
    <div class="scoreGrid">
      <div class="scorePanel"><strong>共通テスト：${this.esc(c.commonTotal||"公式要項で確認")}</strong>
        ${(c.commonBreakdown||[]).map(([k,v])=>`<div class="scoreLine"><span>${this.esc(k)}</span><span>${this.esc(v)}</span></div>`).join("")}
      </div>
      <div class="scorePanel"><strong>個別試験：${this.esc(c.secondTotal||"公式要項で確認")}</strong>
        ${(c.secondBreakdown||[]).map(([k,v])=>`<div class="scoreLine"><span>${this.esc(k)}</span><span>${this.esc(v)}</span></div>`).join("")}
      </div>
    </div>
    <div class="examRatio">${this.esc(c.ratio||"比率は公式要項で確認")}<br>${this.esc(c.memo||"")}</div>
  </div>`).join("");
};

SC.renderCompetition481=function(d){
  const c=d.competition||{};
  if(!c.latestMemo && !(c.past||[]).length) return "";
  return `<div class="competitionBox">
    <h3>📈 倍率・入試結果メモ</h3>
    <p class="small">${this.esc(c.latestMemo||"年度別の入試結果を今後追加します。")}</p>
    <div class="subjectTags">${(c.past||[]).map(x=>`<span>${this.esc(x[0])}：${this.esc(x[1])}</span>`).join("")}</div>
  </div>`;
};

SC.renderMajorDetail=function(universityName,index){
  const u=this.byName(universityName);
  if(!u) return this.go("search");
  const d=(u.entranceDetails||[])[index];
  if(!d) return this.renderDetail(universityName);
  this.renderCompareBar(false);
  const methods=d.methods||[];
  const methodHtml=methods.map(m=>`<div class="detailSectionCard">
    <h3>🎯 ${this.esc(m.method)}</h3>
    <div class="dataQualityRow"><span>${this.esc(d.confirmedLevel||"確認中")}</span><span>最終確認：${this.esc(d.lastChecked||"未確認")}</span></div>
    <p class="small">選抜：${this.esc(m.selection||"")}</p>
    ${this.renderMethodExtra48 ? this.renderMethodExtra48(m) : ""}
    <strong>共通テスト</strong>
    <div class="subjectTags">${(m.commonTest?.subjects||[]).map(s=>`<span>${this.esc(s)}</span>`).join("")}</div>
    <p class="small">${this.esc(m.commonTest?.note||"")}</p>
    <strong>個別試験・二次試験</strong>
    <div class="subjectTags">${(m.secondTest?.subjects||[]).length ? (m.secondTest.subjects||[]).map(s=>`<span>${this.esc(s)}</span>`).join("") : "<span>なし</span>"}</div>
    <p class="small">${this.esc(m.secondTest?.note||"")}</p>
    <strong>配点</strong>
    <p class="small">共通テスト：${this.esc(m.points?.common||"公式要項で確認")} ／ 個別：${this.esc(m.points?.second||"公式要項で確認")}</p>
    <p class="small">${this.esc(m.points?.note||"")}</p>
    <strong>優先して対策したいこと</strong>
    <div class="subjectTags">${(m.studyPriority||[]).map(s=>`<span>${this.esc(s)}</span>`).join("")}</div>
    <p class="small">${this.esc(m.teacherMemo||"")}</p>
  </div>`).join("");
  const planHtml=`<div class="detailSectionCard"><h3>📅 学習計画のたたき台</h3><div class="planTimeline">${(d.monthlyPlan||[]).map(p=>`<div class="planMonth"><strong>${this.esc(p.month)}</strong><ul>${(p.tasks||[]).map(t=>`<li>${this.esc(t)}</li>`).join("")}</ul></div>`).join("")}</div></div>`;
  const recordHtml=`<div class="detailSectionCard studentRecord"><strong>📈 生徒記録テンプレート</strong><p class="small">この志望校に合わせて、進捗を記録する項目です。</p><div class="recordGrid">${(d.recordTemplate?.subjects||[]).map(s=>`<div class="recordItem">${this.esc(s)}：□ 未記録</div>`).join("")}</div><p class="small">面談メモ例：${(d.recordTemplate?.memoPrompts||[]).map(x=>this.esc(x)).join(" ／ ")}</p></div>`;
  this.app().innerHTML=`<div class="card">
    <div class="detailTopNav">
      <button class="backBtn475" onclick="SC.renderDetail('${this.esc(u.name)}')">← 学部一覧へ</button>
      <button class="favRoundBtn ${this.favorites.includes(u.name)?"saved":""}" onclick="SC.toggleFavoriteSmooth('${this.esc(u.name)}', false); SC.renderMajorDetail('${this.esc(u.name)}',${index})">${this.favorites.includes(u.name)?"♥":"♡"}</button>
    </div>
    <div class="detailPageHeader">
      <h2>${this.facultyIcon(d.faculty)} ${this.esc(d.displayName||d.department||d.faculty)}</h2>
      <p class="small">${this.esc(u.name)} ／ ${this.esc(d.faculty||"")} ／ ${this.esc(d.department||"")}</p>
      <p><span class="pill">${this.facultyStatusLabel(d)}</span> <span class="pill">最終確認：${this.esc(d.lastChecked||"未確認")}</span></p>
      <div class="officialWarn">年度により科目・配点・方式が変わる可能性があります。出願前は必ず公式募集要項で最終確認してください。</div>
    </div>
    <div class="detailMiniNav">
      <button onclick="document.getElementById('summarySec').scrollIntoView({behavior:'smooth'})">概要</button>
      <button onclick="document.getElementById('scoreSec').scrollIntoView({behavior:'smooth'})">配点</button>
      <button onclick="document.getElementById('examSec').scrollIntoView({behavior:'smooth'})">科目</button>
      <button onclick="document.getElementById('planSec').scrollIntoView({behavior:'smooth'})">計画</button>
    </div>
    <div id="summarySec">${this.renderExamSummary481(d)}</div>
    <div id="scoreSec">${this.renderScoreCards481(d)}${this.renderCompetition481(d)}</div>
    <div id="examSec">${methodHtml}</div>
    <div id="planSec">${planHtml}</div>
    <div id="recordSec">${recordHtml}</div>
    <div id="linkSec" class="detailSectionCard">
      <h3>🔗 公式確認リンク</h3>
      <div class="actions">
        ${d.sourceUrl?`<a class="btn light" href="${d.sourceUrl}" target="_blank">学部・入試情報</a>`:""}
        ${d.outlineUrl?`<a class="btn light" href="${d.outlineUrl}" target="_blank">選抜要項</a>`:""}
        ${d.changesUrl?`<a class="btn light" href="${d.changesUrl}" target="_blank">変更点</a>`:""}
        <button class="btn" onclick="SC.addCompare('${this.esc(u.name)}')">大学を比較に追加</button>
      </div>
    </div>
  </div>`;
};

/* 4.8.2 専攻詳細アコーディオン整理 */
SC.renderMethodSubjects482=function(methods, part){
  return (methods||[]).map(m=>{
    const data = part==="common" ? m.commonTest : m.secondTest;
    const title = part==="common" ? "共通テスト" : "個別試験・二次試験";
    const points = part==="common" ? (m.points?.common||"公式要項で確認") : (m.points?.second||"公式要項で確認");
    const subs = data?.subjects || [];
    return `<div class="compactMethodCard">
      <h4>🎯 ${this.esc(m.method)}</h4>
      <strong>${title}：${this.esc(points)}</strong>
      <div class="subjectTags">${subs.length ? subs.map(s=>`<span>${this.esc(s)}</span>`).join("") : "<span>なし</span>"}</div>
      <p class="small">${this.esc(data?.note||"")}</p>
    </div>`;
  }).join("");
};

SC.renderRequirements482=function(methods){
  return (methods||[]).map(m=>`<div class="requirementBox">
    <strong>🎯 ${this.esc(m.method)}</strong><br>
    ${this.esc(m.admissionRequirements||m.selection||"出願条件は公式募集要項で確認してください。")}
  </div>`).join("");
};

SC.renderAiAdvice482=function(methods){
  return (methods||[]).map(m=>`<div class="aiAdviceBox">
    <strong>🤖 ${this.esc(m.method)}</strong><br>
    ${this.esc(m.aiAdvice||"共通テストと個別試験の両方から、優先科目を決めて対策しましょう。")}
    <div class="subjectTags">${(m.studyPriority||[]).map(s=>`<span>${this.esc(s)}</span>`).join("")}</div>
    <p class="small">${this.esc(m.teacherMemo||"")}</p>
  </div>`).join("");
};

SC.renderMajorDetail=function(universityName,index){
  const u=this.byName(universityName);
  if(!u) return this.go("search");
  const d=(u.entranceDetails||[])[index];
  if(!d) return this.renderDetail(universityName);
  this.renderCompareBar(false);
  const methods=d.methods||[];

  const summaryHtml = `${this.renderExamSummary481 ? this.renderExamSummary481(d) : ""}${this.renderCompetition481 ? this.renderCompetition481(d) : ""}`;
  const scoreHtml = `${this.renderScoreCards481 ? this.renderScoreCards481(d) : ""}`;
  const commonHtml = this.renderMethodSubjects482(methods, "common");
  const secondHtml = this.renderMethodSubjects482(methods, "second");
  const reqHtml = this.renderRequirements482(methods);
  const aiHtml = this.renderAiAdvice482(methods);
  const planHtml=`<div class="planTimeline">${(d.monthlyPlan||[]).map(p=>`<div class="planMonth"><strong>${this.esc(p.month)}</strong><ul>${(p.tasks||[]).map(t=>`<li>${this.esc(t)}</li>`).join("")}</ul></div>`).join("")}</div>`;
  const recordHtml=`<div class="studentRecord"><strong>📈 生徒記録テンプレート</strong><p class="small">この志望校に合わせて、進捗を記録する項目です。</p><div class="recordGrid">${(d.recordTemplate?.subjects||[]).map(s=>`<div class="recordItem">${this.esc(s)}：□ 未記録</div>`).join("")}</div><p class="small">面談メモ例：${(d.recordTemplate?.memoPrompts||[]).map(x=>this.esc(x)).join(" ／ ")}</p></div>`;
  const linkHtml=`<div class="actions">
      ${d.sourceUrl?`<a class="btn light" href="${d.sourceUrl}" target="_blank">学部・入試情報</a>`:""}
      ${d.outlineUrl?`<a class="btn light" href="${d.outlineUrl}" target="_blank">選抜要項</a>`:""}
      ${d.changesUrl?`<a class="btn light" href="${d.changesUrl}" target="_blank">変更点</a>`:""}
      <button class="btn" onclick="SC.addCompare('${this.esc(u.name)}')">大学を比較に追加</button>
    </div>`;

  this.app().innerHTML=`<div class="card">
    <div class="detailTopNav">
      <button class="backBtn475" onclick="SC.renderDetail('${this.esc(u.name)}')">← 学部一覧へ</button>
      <button class="favRoundBtn ${this.favorites.includes(u.name)?"saved":""}" onclick="SC.toggleFavoriteSmooth('${this.esc(u.name)}', false); SC.renderMajorDetail('${this.esc(u.name)}',${index})">${this.favorites.includes(u.name)?"♥":"♡"}</button>
    </div>
    <div class="detailPageHeader">
      <h2>${this.facultyIcon(d.faculty)} ${this.esc(d.displayName||d.department||d.faculty)}</h2>
      <p class="small">${this.esc(u.name)} ／ ${this.esc(d.faculty||"")} ／ ${this.esc(d.department||"")}</p>
      <p><span class="pill">${this.facultyStatusLabel(d)}</span> <span class="pill">最終確認：${this.esc(d.lastChecked||"未確認")}</span></p>
      <div class="officialWarn">年度により科目・配点・方式が変わる可能性があります。出願前は必ず公式募集要項で最終確認してください。</div>
    </div>

    <div class="detailMiniNav">
      <button onclick="document.getElementById('accSummary').scrollIntoView({behavior:'smooth'})">概要</button>
      <button onclick="document.getElementById('accCommon').scrollIntoView({behavior:'smooth'})">共テ</button>
      <button onclick="document.getElementById('accSecond').scrollIntoView({behavior:'smooth'})">個別</button>
      <button onclick="document.getElementById('accPlan').scrollIntoView({behavior:'smooth'})">計画</button>
      <button onclick="document.getElementById('accAi').scrollIntoView({behavior:'smooth'})">AI</button>
      <button onclick="document.getElementById('accLinks').scrollIntoView({behavior:'smooth'})">公式</button>
    </div>

    <div class="detailAccordionWrap">
      <details class="detailAcc" id="accSummary" open>
        <summary><span>📊 入試概要</span><span class="detailAccHint">最初に確認</span></summary>
        <div class="detailAccBody">${summaryHtml || "<p class='small'>概要は今後追加します。</p>"}</div>
      </details>

      <details class="detailAcc" id="accScore">
        <summary><span>📘 配点カード</span><span class="detailAccHint">得点配分</span></summary>
        <div class="detailAccBody">${scoreHtml || "<p class='small'>配点は公式要項で確認してください。</p>"}</div>
      </details>

      <details class="detailAcc" id="accCommon">
        <summary><span>📝 共通テスト</span><span class="detailAccHint">必要科目</span></summary>
        <div class="detailAccBody">${commonHtml}</div>
      </details>

      <details class="detailAcc" id="accSecond">
        <summary><span>✍️ 個別試験・二次試験</span><span class="detailAccHint">英語・小論文・面接など</span></summary>
        <div class="detailAccBody">${secondHtml}</div>
      </details>

      <details class="detailAcc" id="accReq">
        <summary><span>📌 出願条件・注意点</span><span class="detailAccHint">方式別</span></summary>
        <div class="detailAccBody">${reqHtml}</div>
      </details>

      <details class="detailAcc" id="accPlan">
        <summary><span>📅 学習計画</span><span class="detailAccHint">時期別</span></summary>
        <div class="detailAccBody">${planHtml}</div>
      </details>

      <details class="detailAcc" id="accAi">
        <summary><span>🤖 AIアドバイス</span><span class="detailAccHint">優先科目</span></summary>
        <div class="detailAccBody">${aiHtml}</div>
      </details>

      <details class="detailAcc" id="accRecord">
        <summary><span>📈 学習記録テンプレート</span><span class="detailAccHint">先生モード向け</span></summary>
        <div class="detailAccBody">${recordHtml}</div>
      </details>

      <details class="detailAcc" id="accLinks">
        <summary><span>🔗 公式リンク</span><span class="detailAccHint">最終確認</span></summary>
        <div class="detailAccBody">${linkHtml}</div>
      </details>
    </div>
  </div>`;
};

/* 4.8.3 共通テスト配点表示 */
SC.parsePointNumber483=function(v){
  const n=String(v||"").match(/\d+/);
  return n ? Number(n[0]) : null;
};

SC.renderCommonScoreBars483=function(d){
  const cards=d.scoreCards||[];
  if(!cards.length){
    return `<div class="scoreUnknown">共通テストの配点は、現在「公式要項で確認」として登録されています。</div>`;
  }
  return cards.map(c=>{
    const rows=(c.commonBreakdown||[]);
    const numeric=rows.map(([k,v])=>[k,v,this.parsePointNumber483(v)]).filter(x=>x[2]!==null);
    const total=this.parsePointNumber483(c.commonTotal) || numeric.reduce((a,b)=>a+b[2],0);
    const hasNumeric=numeric.length>0 && total>0;
    if(!hasNumeric){
      return `<div class="commonScoreCard">
        <div class="commonScoreHeader"><h4>📘 ${this.esc(c.title||"共通テスト")}</h4><span class="totalBadge">${this.esc(c.commonTotal||"要確認")}</span></div>
        <div class="scoreUnknown">この方式の共通テスト配点は、公式要項で確認してください。</div>
        <div class="subjectTags">${rows.map(([k,v])=>`<span>${this.esc(k)}：${this.esc(v)}</span>`).join("")}</div>
      </div>`;
    }
    const target80=Math.round(total*0.8);
    return `<div class="commonScoreCard">
      <div class="commonScoreHeader">
        <h4>📘 ${this.esc(c.title||"共通テスト")}</h4>
        <span class="totalBadge">共通 ${this.esc(c.commonTotal||total+"点")}</span>
      </div>
      ${numeric.map(([k,v,n])=>{
        const pct=Math.max(4,Math.round(n/total*100));
        return `<div class="scoreBarLine">
          <span class="scoreSubject">${this.esc(k)}</span>
          <span class="scoreBarTrack"><span class="scoreBarFill" style="width:${pct}%"></span></span>
          <span class="scorePoint">${this.esc(v)}点</span>
        </div>`;
      }).join("")}
      <div class="scoreTargetBox">
        目標目安：共通テスト全体で80％を狙うなら、${target80}点前後が目安です。配点が高い科目から優先して安定させましょう。
      </div>
    </div>`;
  }).join("");
};

SC.renderMethodSubjects482=function(methods, part){
  return (methods||[]).map(m=>{
    const data = part==="common" ? m.commonTest : m.secondTest;
    const title = part==="common" ? "共通テスト" : "個別試験・二次試験";
    const points = part==="common" ? (m.points?.common||"公式要項で確認") : (m.points?.second||"公式要項で確認");
    const subs = data?.subjects || [];
    return `<div class="compactMethodCard">
      <h4>🎯 ${this.esc(m.method)}</h4>
      <strong>${title}：${this.esc(points)}</strong>
      <div class="subjectTags">${subs.length ? subs.map(s=>`<span>${this.esc(s)}</span>`).join("") : "<span>なし</span>"}</div>
      <p class="small">${this.esc(data?.note||"")}</p>
    </div>`;
  }).join("");
};

SC.renderMajorDetail=function(universityName,index){
  const u=this.byName(universityName);
  if(!u) return this.go("search");
  const d=(u.entranceDetails||[])[index];
  if(!d) return this.renderDetail(universityName);
  this.renderCompareBar(false);
  const methods=d.methods||[];

  const summaryHtml = `${this.renderExamSummary481 ? this.renderExamSummary481(d) : ""}${this.renderCompetition481 ? this.renderCompetition481(d) : ""}`;
  const scoreHtml = `${this.renderScoreCards481 ? this.renderScoreCards481(d) : ""}`;
  const commonScoreHtml = this.renderCommonScoreBars483(d);
  const commonHtml = this.renderMethodSubjects482(methods, "common");
  const secondHtml = this.renderMethodSubjects482(methods, "second");
  const reqHtml = this.renderRequirements482 ? this.renderRequirements482(methods) : "";
  const aiHtml = this.renderAiAdvice482 ? this.renderAiAdvice482(methods) : "";
  const planHtml=`<div class="planTimeline">${(d.monthlyPlan||[]).map(p=>`<div class="planMonth"><strong>${this.esc(p.month)}</strong><ul>${(p.tasks||[]).map(t=>`<li>${this.esc(t)}</li>`).join("")}</ul></div>`).join("")}</div>`;
  const recordHtml=`<div class="studentRecord"><strong>📈 生徒記録テンプレート</strong><p class="small">この志望校に合わせて、進捗を記録する項目です。</p><div class="recordGrid">${(d.recordTemplate?.subjects||[]).map(s=>`<div class="recordItem">${this.esc(s)}：□ 未記録</div>`).join("")}</div><p class="small">面談メモ例：${(d.recordTemplate?.memoPrompts||[]).map(x=>this.esc(x)).join(" ／ ")}</p></div>`;
  const linkHtml=`<div class="actions">
      ${d.sourceUrl?`<a class="btn light" href="${d.sourceUrl}" target="_blank">学部・入試情報</a>`:""}
      ${d.outlineUrl?`<a class="btn light" href="${d.outlineUrl}" target="_blank">選抜要項</a>`:""}
      ${d.changesUrl?`<a class="btn light" href="${d.changesUrl}" target="_blank">変更点</a>`:""}
      <button class="btn" onclick="SC.addCompare('${this.esc(u.name)}')">大学を比較に追加</button>
    </div>`;

  this.app().innerHTML=`<div class="card">
    <div class="detailTopNav">
      <button class="backBtn475" onclick="SC.renderDetail('${this.esc(u.name)}')">← 学部一覧へ</button>
      <button class="favRoundBtn ${this.favorites.includes(u.name)?"saved":""}" onclick="SC.toggleFavoriteSmooth('${this.esc(u.name)}', false); SC.renderMajorDetail('${this.esc(u.name)}',${index})">${this.favorites.includes(u.name)?"♥":"♡"}</button>
    </div>
    <div class="detailPageHeader">
      <h2>${this.facultyIcon(d.faculty)} ${this.esc(d.displayName||d.department||d.faculty)}</h2>
      <p class="small">${this.esc(u.name)} ／ ${this.esc(d.faculty||"")} ／ ${this.esc(d.department||"")}</p>
      <p><span class="pill">${this.facultyStatusLabel(d)}</span> <span class="pill">最終確認：${this.esc(d.lastChecked||"未確認")}</span></p>
      <div class="officialWarn">年度により科目・配点・方式が変わる可能性があります。出願前は必ず公式募集要項で最終確認してください。</div>
    </div>

    <div class="detailMiniNav">
      <button onclick="document.getElementById('accSummary').scrollIntoView({behavior:'smooth'})">概要</button>
      <button onclick="document.getElementById('accCommonScore').scrollIntoView({behavior:'smooth'})">共テ配点</button>
      <button onclick="document.getElementById('accSecond').scrollIntoView({behavior:'smooth'})">個別</button>
      <button onclick="document.getElementById('accPlan').scrollIntoView({behavior:'smooth'})">計画</button>
      <button onclick="document.getElementById('accAi').scrollIntoView({behavior:'smooth'})">AI</button>
      <button onclick="document.getElementById('accLinks').scrollIntoView({behavior:'smooth'})">公式</button>
    </div>

    <div class="detailAccordionWrap">
      <details class="detailAcc" id="accSummary" open>
        <summary><span>📊 入試概要</span><span class="detailAccHint">最初に確認</span></summary>
        <div class="detailAccBody">${summaryHtml || "<p class='small'>概要は今後追加します。</p>"}</div>
      </details>

      <details class="detailAcc" id="accCommonScore" open>
        <summary><span>📘 共通テスト配点</span><span class="detailAccHint">科目別の点数</span></summary>
        <div class="detailAccBody">${commonScoreHtml}</div>
      </details>

      <details class="detailAcc" id="accScore">
        <summary><span>📗 配点カード全体</span><span class="detailAccHint">共通＋個別</span></summary>
        <div class="detailAccBody">${scoreHtml || "<p class='small'>配点は公式要項で確認してください。</p>"}</div>
      </details>

      <details class="detailAcc" id="accCommon">
        <summary><span>📝 共通テスト科目</span><span class="detailAccHint">必要科目</span></summary>
        <div class="detailAccBody">${commonHtml}</div>
      </details>

      <details class="detailAcc" id="accSecond">
        <summary><span>✍️ 個別試験・二次試験</span><span class="detailAccHint">英語・小論文・面接など</span></summary>
        <div class="detailAccBody">${secondHtml}</div>
      </details>

      <details class="detailAcc" id="accReq">
        <summary><span>📌 出願条件・注意点</span><span class="detailAccHint">方式別</span></summary>
        <div class="detailAccBody">${reqHtml}</div>
      </details>

      <details class="detailAcc" id="accPlan">
        <summary><span>📅 学習計画</span><span class="detailAccHint">時期別</span></summary>
        <div class="detailAccBody">${planHtml}</div>
      </details>

      <details class="detailAcc" id="accAi">
        <summary><span>🤖 AIアドバイス</span><span class="detailAccHint">優先科目</span></summary>
        <div class="detailAccBody">${aiHtml}</div>
      </details>

      <details class="detailAcc" id="accRecord">
        <summary><span>📈 学習記録テンプレート</span><span class="detailAccHint">先生モード向け</span></summary>
        <div class="detailAccBody">${recordHtml}</div>
      </details>

      <details class="detailAcc" id="accLinks">
        <summary><span>🔗 公式リンク</span><span class="detailAccHint">最終確認</span></summary>
        <div class="detailAccBody">${linkHtml}</div>
      </details>
    </div>
  </div>`;
};

/* 4.8.4 共通テスト配点UI改善 */
SC.subjectMaxPoint484=function(numeric){
  const max = Math.max(...numeric.map(x=>x[2]||0), 0);
  if(max <= 0) return 200;
  return Math.min(200, Math.max(max, 100));
};

SC.priorityStars484=function(point, maxPoint){
  const ratio = maxPoint ? point / maxPoint : 0;
  if(ratio >= .9) return "★★★★★";
  if(ratio >= .6) return "★★★★☆";
  if(ratio >= .4) return "★★★☆☆";
  if(ratio >= .2) return "★★☆☆☆";
  return "★☆☆☆☆";
};

SC.optionKey484=function(subject){
  if(subject.includes("理科")) return "理科";
  if(subject.includes("地歴") || subject.includes("社会") || subject.includes("公民")) return "地歴公民";
  if(subject.includes("情報")) return "情報Ⅰ";
  return "";
};

SC.renderOptionDetails484=function(c){
  const options=c.commonOptions||{};
  if(!Object.keys(options).length) return "";
  return `<div class="optionDetails">
    ${Object.entries(options).map(([k,v])=>`<details>
      <summary>${this.esc(k)}の選択科目</summary>
      <div class="optionBody">
        <p class="small">${this.esc(v.selectRule||"選択方法は公式要項で確認してください。")}</p>
        <div class="subjectTags">${(v.subjects||[]).map(s=>`<span>${this.esc(s)}</span>`).join("")}</div>
      </div>
    </details>`).join("")}
  </div>`;
};

SC.renderCommonScoreBars483=function(d){
  const cards=d.scoreCards||[];
  if(!cards.length){
    return `<div class="scoreUnknown">共通テストの配点は、現在「公式要項で確認」として登録されています。</div>`;
  }
  return cards.map(c=>{
    const rows=(c.commonBreakdown||[]);
    const numeric=rows.map(([k,v])=>[k,v,this.parsePointNumber483(v)]).filter(x=>x[2]!==null);
    const total=this.parsePointNumber483(c.commonTotal) || numeric.reduce((a,b)=>a+b[2],0);
    const hasNumeric=numeric.length>0 && total>0;
    if(!hasNumeric){
      return `<div class="commonScoreCard">
        <div class="commonScoreHeader"><h4>📘 ${this.esc(c.title||"共通テスト")}</h4><span class="totalBadge">${this.esc(c.commonTotal||"要確認")}</span></div>
        <div class="scoreUnknown">この方式の共通テスト配点は、公式要項で確認してください。</div>
        <div class="subjectTags">${rows.map(([k,v])=>`<span>${this.esc(k)}：${this.esc(v)}</span>`).join("")}</div>
        ${this.renderOptionDetails484(c)}
      </div>`;
    }
    const maxPoint=this.subjectMaxPoint484(numeric);
    const target80=Math.round(total*0.8);
    return `<div class="commonScoreCard">
      <div class="commonScoreHeader">
        <h4>📘 ${this.esc(c.title||"共通テスト")}</h4>
        <span class="totalBadge">共通 ${this.esc(c.commonTotal||total+"点")}</span>
      </div>
      ${numeric.map(([k,v,n])=>{
        const pct=Math.max(5,Math.round(n/maxPoint*100));
        const key=this.optionKey484(k);
        const selectable = key ? "／選択あり" : "";
        return `<div class="scoreBarLine">
          <span class="scoreSubject">${this.esc(k)}</span>
          <span class="scoreBarTrack"><span class="scoreBarFill" style="width:${pct}%"></span></span>
          <span class="scorePoint">${this.esc(v)}点</span>
        </div>
        <div class="priorityStars">${this.priorityStars484(n,maxPoint)} ${this.esc(k)}${selectable}</div>`;
      }).join("")}
      ${this.renderOptionDetails484(c)}
      <div class="scoreTargetBox">
        目標目安：共通テスト全体で80％を狙うなら、${target80}点前後が目安です。配点が高い科目から優先して安定させましょう。
      </div>
    </div>`;
  }).join("");
};

/* 共通テスト科目セクションは配点表示と重複するため非表示 */
SC.renderMajorDetail=function(universityName,index){
  const u=this.byName(universityName);
  if(!u) return this.go("search");
  const d=(u.entranceDetails||[])[index];
  if(!d) return this.renderDetail(universityName);
  this.renderCompareBar(false);
  const methods=d.methods||[];
  const summaryHtml = `${this.renderExamSummary481 ? this.renderExamSummary481(d) : ""}${this.renderCompetition481 ? this.renderCompetition481(d) : ""}`;
  const scoreHtml = `${this.renderScoreCards481 ? this.renderScoreCards481(d) : ""}`;
  const commonScoreHtml = this.renderCommonScoreBars483(d);
  const secondHtml = this.renderMethodSubjects482(methods, "second");
  const reqHtml = this.renderRequirements482 ? this.renderRequirements482(methods) : "";
  const aiHtml = this.renderAiAdvice482 ? this.renderAiAdvice482(methods) : "";
  const planHtml=`<div class="planTimeline">${(d.monthlyPlan||[]).map(p=>`<div class="planMonth"><strong>${this.esc(p.month)}</strong><ul>${(p.tasks||[]).map(t=>`<li>${this.esc(t)}</li>`).join("")}</ul></div>`).join("")}</div>`;
  const recordHtml=`<div class="studentRecord"><strong>📈 生徒記録テンプレート</strong><p class="small">この志望校に合わせて、進捗を記録する項目です。</p><div class="recordGrid">${(d.recordTemplate?.subjects||[]).map(s=>`<div class="recordItem">${this.esc(s)}：□ 未記録</div>`).join("")}</div><p class="small">面談メモ例：${(d.recordTemplate?.memoPrompts||[]).map(x=>this.esc(x)).join(" ／ ")}</p></div>`;
  const linkHtml=`<div class="actions">
      ${d.sourceUrl?`<a class="btn light" href="${d.sourceUrl}" target="_blank">学部・入試情報</a>`:""}
      ${d.outlineUrl?`<a class="btn light" href="${d.outlineUrl}" target="_blank">選抜要項</a>`:""}
      ${d.changesUrl?`<a class="btn light" href="${d.changesUrl}" target="_blank">変更点</a>`:""}
      <button class="btn" onclick="SC.addCompare('${this.esc(u.name)}')">大学を比較に追加</button>
    </div>`;

  this.app().innerHTML=`<div class="card">
    <div class="detailTopNav">
      <button class="backBtn475" onclick="SC.renderDetail('${this.esc(u.name)}')">← 学部一覧へ</button>
      <button class="favRoundBtn ${this.favorites.includes(u.name)?"saved":""}" onclick="SC.toggleFavoriteSmooth('${this.esc(u.name)}', false); SC.renderMajorDetail('${this.esc(u.name)}',${index})">${this.favorites.includes(u.name)?"♥":"♡"}</button>
    </div>
    <div class="detailPageHeader">
      <h2>${this.facultyIcon(d.faculty)} ${this.esc(d.displayName||d.department||d.faculty)}</h2>
      <p class="small">${this.esc(u.name)} ／ ${this.esc(d.faculty||"")} ／ ${this.esc(d.department||"")}</p>
      <p><span class="pill">${this.facultyStatusLabel(d)}</span> <span class="pill">最終確認：${this.esc(d.lastChecked||"未確認")}</span></p>
      <div class="officialWarn">年度により科目・配点・方式が変わる可能性があります。出願前は必ず公式募集要項で最終確認してください。</div>
    </div>

    <div class="detailMiniNav">
      <button onclick="document.getElementById('accSummary').scrollIntoView({behavior:'smooth'})">概要</button>
      <button onclick="document.getElementById('accCommonScore').scrollIntoView({behavior:'smooth'})">共テ配点</button>
      <button onclick="document.getElementById('accSecond').scrollIntoView({behavior:'smooth'})">個別</button>
      <button onclick="document.getElementById('accPlan').scrollIntoView({behavior:'smooth'})">計画</button>
      <button onclick="document.getElementById('accAi').scrollIntoView({behavior:'smooth'})">AI</button>
      <button onclick="document.getElementById('accLinks').scrollIntoView({behavior:'smooth'})">公式</button>
    </div>

    <div class="detailAccordionWrap">
      <details class="detailAcc" id="accSummary" open>
        <summary><span>📊 入試概要</span><span class="detailAccHint">最初に確認</span></summary>
        <div class="detailAccBody">${summaryHtml || "<p class='small'>概要は今後追加します。</p>"}</div>
      </details>

      <details class="detailAcc" id="accCommonScore" open>
        <summary><span>📘 共通テスト配点</span><span class="detailAccHint">科目別の点数・選択科目</span></summary>
        <div class="detailAccBody">${commonScoreHtml}</div>
      </details>

      <details class="detailAcc" id="accScore">
        <summary><span>📗 配点カード全体</span><span class="detailAccHint">共通＋個別</span></summary>
        <div class="detailAccBody">${scoreHtml || "<p class='small'>配点は公式要項で確認してください。</p>"}</div>
      </details>

      <details class="detailAcc" id="accSecond">
        <summary><span>✍️ 個別試験・二次試験</span><span class="detailAccHint">英語・小論文・面接など</span></summary>
        <div class="detailAccBody">${secondHtml}</div>
      </details>

      <details class="detailAcc" id="accReq">
        <summary><span>📌 出願条件・注意点</span><span class="detailAccHint">方式別</span></summary>
        <div class="detailAccBody">${reqHtml}</div>
      </details>

      <details class="detailAcc" id="accPlan">
        <summary><span>📅 学習計画</span><span class="detailAccHint">時期別</span></summary>
        <div class="detailAccBody">${planHtml}</div>
      </details>

      <details class="detailAcc" id="accAi">
        <summary><span>🤖 AIアドバイス</span><span class="detailAccHint">優先科目</span></summary>
        <div class="detailAccBody">${aiHtml}</div>
      </details>

      <details class="detailAcc" id="accRecord">
        <summary><span>📈 学習記録テンプレート</span><span class="detailAccHint">先生モード向け</span></summary>
        <div class="detailAccBody">${recordHtml}</div>
      </details>

      <details class="detailAcc" id="accLinks">
        <summary><span>🔗 公式リンク</span><span class="detailAccHint">最終確認</span></summary>
        <div class="detailAccBody">${linkHtml}</div>
      </details>
    </div>
  </div>`;
};

/* 4.8.5 データ拡張管理 */
SC.dataPriorityList = [
  {name:"名古屋市立大学", area:"愛知", priority:"最優先", progress:65, next:"未精査学部の配点・募集人数・倍率を追加", status:"看護・データサイエンスは強化済み"},
  {name:"名古屋大学", area:"愛知", priority:"高", progress:10, next:"学部一覧・入試方式・共通テスト科目を整理", status:"基本データから開始"},
  {name:"愛知県立大学", area:"愛知", priority:"高", progress:10, next:"外国語・看護・情報系を優先確認", status:"基本データから開始"},
  {name:"愛知教育大学", area:"愛知", priority:"高", progress:10, next:"教育学部の専攻別データを整理", status:"基本データから開始"},
  {name:"南山大学", area:"愛知", priority:"中", progress:8, next:"一般選抜方式・共通テスト利用方式を整理", status:"私立方式別データが必要"},
  {name:"名城大学", area:"愛知", priority:"中", progress:8, next:"理工・薬・農・情報系を優先", status:"私立方式別データが必要"},
  {name:"中京大学", area:"愛知", priority:"中", progress:8, next:"心理・スポーツ・情報系を優先", status:"私立方式別データが必要"}
];

SC.calcDataStats=function(){
  const total=this.universities.length;
  const detailed=this.universities.filter(u=>(u.entranceDetails||[]).length>0).length;
  const official=this.universities.filter(u=>((u.quality?.confirmationStatus||"").includes("確認済") || (u.quality?.confirmationStatus||"").includes("強化"))).length;
  const ncu=this.byName("名古屋市立大学");
  const ncuDetails=(ncu?.entranceDetails||[]).length;
  return {total,detailed,official,ncuDetails};
};

SC.renderDataDashboard=function(){
  this.renderCompareBar(false);
  const s=this.calcDataStats();
  this.app().innerHTML=`<div class="card">
    <div class="dataDashHero">
      <h2>🛡️ データ拡張管理</h2>
      <p class="small">大学データを増やすための進捗確認画面です。今後はここを見ながら、公式確認済みデータを一校ずつ増やしていきます。</p>
    </div>

    <div class="dataStatsGrid">
      <div class="dataStat"><strong>${s.total}</strong><span>登録大学数</span></div>
      <div class="dataStat"><strong>${s.detailed}</strong><span>学部別データあり</span></div>
      <div class="dataStat"><strong>${s.official}</strong><span>確認済み表示あり</span></div>
      <div class="dataStat"><strong>${s.ncuDetails}</strong><span>名市大 専攻ページ</span></div>
    </div>

    <div class="todoChecklist">
      <strong>次に増やすデータの順番</strong><br>
      ① 名古屋市立大学の未精査配点を埋める<br>
      ② 名古屋大学を学部別に分解<br>
      ③ 愛知県立大学・愛知教育大学を追加<br>
      ④ 南山・名城・中京など主要私立へ拡張
    </div>

    <div class="dataNeedBox">
      <h3>📌 1学部ごとに入れる項目</h3>
      <div class="needList">
        ${["共通テスト科目","共通テスト配点","個別試験科目","個別試験配点","募集人数","倍率・入試結果","面接・小論文・実技","出願条件","公式リンク","学習計画","AIアドバイス","学習記録テンプレート"].map(x=>`<div class="needItem">□ ${x}</div>`).join("")}
      </div>
    </div>

    <h2>🎯 優先追加大学</h2>
    ${this.dataPriorityList.map(d=>`<div class="priorityUni">
      <h3>${this.esc(d.name)}</h3>
      <div class="priorityMeta"><span>${this.esc(d.area)}</span><span>優先度：${this.esc(d.priority)}</span><span>${this.esc(d.status)}</span></div>
      <div class="progressBar"><span style="width:${d.progress}%"></span></div>
      <p class="small">次の作業：${this.esc(d.next)}</p>
      <div class="actions">
        <button class="btn light" onclick="SC.go('detail','${this.esc(d.name)}')">大学ページを見る</button>
        <button class="btn light" onclick="SC.query='${this.esc(d.name)}';SC.go('search')">検索</button>
      </div>
    </div>`).join("")}
  </div>`;
};

/* 4.9.0 データ品質メーター */
SC.dataQualityScore490=function(u){
  const details=u.entranceDetails||[];
  if(!details.length) return {score:10,label:"基本情報のみ",checks:["学部別データ未登録"]};
  let checks=[];
  let score=20;
  checks.push("学部・学科ページあり");
  const hasScore=details.some(d=>(d.scoreCards||[]).length>0);
  const hasPlan=details.some(d=>(d.monthlyPlan||[]).length>0);
  const hasAi=details.some(d=>(d.methods||[]).some(m=>m.aiAdvice));
  const hasOfficial=!!(u.quality?.guideUrl||u.quality?.admissionUrl);
  const hasPoints=details.some(d=>(d.scoreCards||[]).some(c=>String(c.commonTotal||"").includes("点")));
  if(hasScore){score+=20;checks.push("配点カードあり");}
  if(hasPlan){score+=15;checks.push("学習計画あり");}
  if(hasAi){score+=15;checks.push("AIアドバイスあり");}
  if(hasOfficial){score+=15;checks.push("公式リンクあり");}
  if(hasPoints){score+=15;checks.push("数値配点あり");}
  const label=score>=80?"充実":score>=55?"整備中":score>=30?"基本整備":"基本情報のみ";
  return {score:Math.min(score,100),label,checks};
};

SC.renderQualityMeter490=function(u){
  const q=this.dataQualityScore490(u);
  return `<div class="qualityMeter">
    <h3>🛡️ データ完成度：${q.label} ${q.score}%</h3>
    <div class="qualityBar"><span style="width:${q.score}%"></span></div>
    <div class="qualityChecks">${q.checks.map(c=>`<span>✓ ${this.esc(c)}</span>`).join("")}</div>
  </div>`;
};

const oldRenderDetail490 = SC.renderDetail;
SC.renderDetail=function(name){
  this.renderCompareBar(false);
  const u=this.byName(name);
  if(!u)return this.go("search");
  const q=u.quality||{}, e=u.entrance||{};
  this.app().innerHTML=`<div class="card">
    ${this.detailTopNav ? this.detailTopNav(u) : ""}
    <div class="detailTitleRow"><h2>${this.esc(u.name)}</h2></div>
    <p class="small">${this.esc(u.type)} ／ ${this.esc(u.pref)} ／ ${this.esc(u.area)} ／ ${this.esc(u.field)}</p>
    <p>${this.badge(u)} <span class="pill">最終確認：${this.esc(q.lastChecked||e.lastChecked||"未確認")}</span></p>
    ${this.renderQualityMeter490(u)}
    <div class="templateNotice">この大学は共通テンプレートで表示しています。学部→学科→入試方式→共通テスト→個別試験→配点→学習計画の順にデータを追加できます。</div>
    <h3>学部・学科</h3>
    <p>${this.esc((u.faculties||[]).join("、")||"未登録")}</p>
    <p class="small">${this.esc((u.departments||[]).join("、")||"")}</p>
    ${this.renderEntranceDetails(u)}
    <div class="actions">
      ${q.officialUrl||e.officialUrl?`<a class="btn light" href="${q.officialUrl||e.officialUrl}" target="_blank">公式</a>`:""}
      ${q.admissionUrl||e.admissionUrl?`<a class="btn light" href="${q.admissionUrl||e.admissionUrl}" target="_blank">入試</a>`:""}
      <button class="btn" onclick="SC.toggleFavoriteSmooth ? SC.toggleFavoriteSmooth('${this.esc(u.name)}') : SC.toggleFavorite('${this.esc(u.name)}')">${this.favorites.includes(u.name)?"♥ 保存済み":"♡ 保存"}</button>
      <button class="btn light" onclick="SC.addCompare('${this.esc(u.name)}')">📊 比較に追加</button>
    </div>
  </div>`;
};

/* 4.9.0 データ管理リスト更新 */
SC.dataPriorityList = [
  {name:"名古屋市立大学", area:"愛知", priority:"最優先", progress:70, next:"未精査学部の配点・倍率を追加", status:"看護・DSは強化済み"},
  {name:"名古屋大学", area:"愛知", priority:"最優先", progress:35, next:"配点・募集人数を公式要項から精査", status:"学部別テンプレート登録済み"},
  {name:"愛知県立大学", area:"愛知", priority:"高", progress:10, next:"外国語・看護・情報系を優先確認", status:"基本データから開始"},
  {name:"愛知教育大学", area:"愛知", priority:"高", progress:10, next:"教育学部の専攻別データを整理", status:"基本データから開始"},
  {name:"南山大学", area:"愛知", priority:"中", progress:8, next:"一般選抜方式・共通テスト利用方式を整理", status:"私立方式別データが必要"},
  {name:"名城大学", area:"愛知", priority:"中", progress:8, next:"理工・薬・農・情報系を優先", status:"私立方式別データが必要"},
  {name:"中京大学", area:"愛知", priority:"中", progress:8, next:"心理・スポーツ・情報系を優先", status:"私立方式別データが必要"}
];

/* 4.9.1 情報源・不足データパネル */
SC.renderSourcePanel491=function(d){
  const sources=d.dataSources||[];
  if(!sources.length) return "";
  return `<div class="sourcePanel491">
    <h3>🔗 情報源・確認状況</h3>
    <p class="small">最終確認：${this.esc(d.lastChecked||"未確認")}　<span class="templateBadge491">${this.esc(d.templateVersion||"テンプレート")}</span></p>
    <div class="sourceList491">${sources.map(s=>`<a href="${s.url}" target="_blank">${this.esc(s.label)}</a>`).join("")}</div>
  </div>`;
};

SC.renderMissingPanel491=function(d){
  const list=d.missingData||[];
  if(!list.length) return "";
  return `<div class="missingBox491">
    <strong>📌 今後追加・精査するデータ</strong><br>
    推測で埋めず、公式要項・入試結果で確認できたものから追加します。
    <div class="missingTags491">${list.map(x=>`<span>${this.esc(x)}</span>`).join("")}</div>
  </div>`;
};

const oldRenderMajorDetail491 = SC.renderMajorDetail;
SC.renderMajorDetail=function(universityName,index){
  const u=this.byName(universityName);
  if(!u) return this.go("search");
  const d=(u.entranceDetails||[])[index];
  if(!d) return this.renderDetail(universityName);
  this.renderCompareBar(false);
  const methods=d.methods||[];
  const summaryHtml = `${this.renderExamSummary481 ? this.renderExamSummary481(d) : ""}${this.renderCompetition481 ? this.renderCompetition481(d) : ""}`;
  const scoreHtml = `${this.renderScoreCards481 ? this.renderScoreCards481(d) : ""}`;
  const commonScoreHtml = this.renderCommonScoreBars483 ? this.renderCommonScoreBars483(d) : "";
  const secondHtml = this.renderMethodSubjects482 ? this.renderMethodSubjects482(methods, "second") : "";
  const reqHtml = this.renderRequirements482 ? this.renderRequirements482(methods) : "";
  const aiHtml = this.renderAiAdvice482 ? this.renderAiAdvice482(methods) : "";
  const sourceHtml = this.renderSourcePanel491(d) + this.renderMissingPanel491(d);
  const planHtml=`<div class="planTimeline">${(d.monthlyPlan||[]).map(p=>`<div class="planMonth"><strong>${this.esc(p.month)}</strong><ul>${(p.tasks||[]).map(t=>`<li>${this.esc(t)}</li>`).join("")}</ul></div>`).join("")}</div>`;
  const recordHtml=`<div class="studentRecord"><strong>📈 生徒記録テンプレート</strong><p class="small">この志望校に合わせて、進捗を記録する項目です。</p><div class="recordGrid">${(d.recordTemplate?.subjects||[]).map(s=>`<div class="recordItem">${this.esc(s)}：□ 未記録</div>`).join("")}</div><p class="small">面談メモ例：${(d.recordTemplate?.memoPrompts||[]).map(x=>this.esc(x)).join(" ／ ")}</p></div>`;
  const linkHtml=`<div class="actions">
      ${d.sourceUrl?`<a class="btn light" href="${d.sourceUrl}" target="_blank">学部・入試情報</a>`:""}
      ${d.outlineUrl?`<a class="btn light" href="${d.outlineUrl}" target="_blank">選抜要項</a>`:""}
      ${d.changesUrl?`<a class="btn light" href="${d.changesUrl}" target="_blank">変更点</a>`:""}
      <button class="btn" onclick="SC.addCompare('${this.esc(u.name)}')">大学を比較に追加</button>
    </div>`;

  this.app().innerHTML=`<div class="card">
    <div class="detailTopNav">
      <button class="backBtn475" onclick="SC.renderDetail('${this.esc(u.name)}')">← 学部一覧へ</button>
      <button class="favRoundBtn ${this.favorites.includes(u.name)?"saved":""}" onclick="SC.toggleFavoriteSmooth('${this.esc(u.name)}', false); SC.renderMajorDetail('${this.esc(u.name)}',${index})">${this.favorites.includes(u.name)?"♥":"♡"}</button>
    </div>
    <div class="detailPageHeader">
      <h2>${this.facultyIcon(d.faculty)} ${this.esc(d.displayName||d.department||d.faculty)}</h2>
      <p class="small">${this.esc(u.name)} ／ ${this.esc(d.faculty||"")} ／ ${this.esc(d.department||"")}</p>
      <p><span class="pill">${this.facultyStatusLabel(d)}</span> <span class="pill">最終確認：${this.esc(d.lastChecked||"未確認")}</span></p>
      <div class="officialWarn">年度により科目・配点・方式が変わる可能性があります。出願前は必ず公式募集要項で最終確認してください。</div>
    </div>
    <div class="detailMiniNav">
      <button onclick="document.getElementById('accSummary').scrollIntoView({behavior:'smooth'})">概要</button>
      <button onclick="document.getElementById('accCommonScore').scrollIntoView({behavior:'smooth'})">共テ配点</button>
      <button onclick="document.getElementById('accSecond').scrollIntoView({behavior:'smooth'})">個別</button>
      <button onclick="document.getElementById('accPlan').scrollIntoView({behavior:'smooth'})">計画</button>
      <button onclick="document.getElementById('accSource').scrollIntoView({behavior:'smooth'})">情報源</button>
      <button onclick="document.getElementById('accLinks').scrollIntoView({behavior:'smooth'})">公式</button>
    </div>
    <div class="detailAccordionWrap">
      <details class="detailAcc" id="accSummary" open><summary><span>📊 入試概要</span><span class="detailAccHint">最初に確認</span></summary><div class="detailAccBody">${summaryHtml || "<p class='small'>概要は今後追加します。</p>"}</div></details>
      <details class="detailAcc" id="accCommonScore" open><summary><span>📘 共通テスト配点</span><span class="detailAccHint">科目別の点数・選択科目</span></summary><div class="detailAccBody">${commonScoreHtml}</div></details>
      <details class="detailAcc" id="accScore"><summary><span>📗 配点カード全体</span><span class="detailAccHint">共通＋個別</span></summary><div class="detailAccBody">${scoreHtml || "<p class='small'>配点は公式要項で確認してください。</p>"}</div></details>
      <details class="detailAcc" id="accSecond"><summary><span>✍️ 個別試験・二次試験</span><span class="detailAccHint">英語・小論文・面接など</span></summary><div class="detailAccBody">${secondHtml}</div></details>
      <details class="detailAcc" id="accReq"><summary><span>📌 出願条件・注意点</span><span class="detailAccHint">方式別</span></summary><div class="detailAccBody">${reqHtml}</div></details>
      <details class="detailAcc" id="accPlan"><summary><span>📅 学習計画</span><span class="detailAccHint">時期別</span></summary><div class="detailAccBody">${planHtml}</div></details>
      <details class="detailAcc" id="accAi"><summary><span>🤖 AIアドバイス</span><span class="detailAccHint">優先科目</span></summary><div class="detailAccBody">${aiHtml}</div></details>
      <details class="detailAcc" id="accRecord"><summary><span>📈 学習記録テンプレート</span><span class="detailAccHint">先生モード向け</span></summary><div class="detailAccBody">${recordHtml}</div></details>
      <details class="detailAcc" id="accSource" open><summary><span>🛡️ 情報源・不足データ</span><span class="detailAccHint">信頼性確認</span></summary><div class="detailAccBody">${sourceHtml}</div></details>
      <details class="detailAcc" id="accLinks"><summary><span>🔗 公式リンク</span><span class="detailAccHint">最終確認</span></summary><div class="detailAccBody">${linkHtml}</div></details>
    </div>
  </div>`;
};

/* 4.9.1 データ管理リスト更新 */
SC.dataPriorityList = [
  {name:"名古屋市立大学", area:"愛知", priority:"最優先", progress:82, next:"倍率・合格最低点・未精査学部の配点を追加", status:"完成型テンプレート登録済み"},
  {name:"名古屋大学", area:"愛知", priority:"最優先", progress:35, next:"配点・募集人数を公式要項から精査", status:"学部別テンプレート登録済み"},
  {name:"愛知県立大学", area:"愛知", priority:"高", progress:10, next:"外国語・看護・情報系を優先確認", status:"基本データから開始"},
  {name:"愛知教育大学", area:"愛知", priority:"高", progress:10, next:"教育学部の専攻別データを整理", status:"基本データから開始"},
  {name:"南山大学", area:"愛知", priority:"中", progress:8, next:"一般選抜方式・共通テスト利用方式を整理", status:"私立方式別データが必要"}
];

/* 5.0 マイページ・バックアップ */
SC.renderMyPage=function(){
  this.renderCompareBar(false);
  const p=this.profile||{};
  const first=p.firstChoice||"未登録";
  const major=p.firstMajor||"";
  const latest=(this.examRecords||[]).slice().sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")))[0];
  this.app().innerHTML=`<div class="card">
    <div class="myHero">
      <h2>👤 マイページ</h2>
      <p>志望校・模試・テスト・学習記録をまとめる受験カルテです。入力していない情報は無理に表示しません。</p>
    </div>

    <div class="mypageQuick">
      <button onclick="SC.renderProfileForm()">志望校を編集</button>
      <button onclick="SC.renderExamForm()">成績を追加</button>
      <button onclick="SC.renderStudyLogForm()">学習記録を追加</button>
      <button onclick="SC.scrollToBackup()">バックアップ</button>
    </div>

    <div class="myGrid">
      <div class="myCard">
        <h3>🎯 志望校</h3>
        ${p.firstChoice?`<div class="goalBox"><strong>第一志望</strong><br>${this.esc(p.firstChoice)}<br><span class="small">${this.esc(major||"学部・学科未登録")}</span></div>`:`<div class="empty">まだ志望校が登録されていません。登録すると、大学詳細や合格ライン比較とつながります。</div>`}
        ${p.secondChoice?`<div class="goalBox"><strong>第二志望</strong><br>${this.esc(p.secondChoice)}<br><span class="small">${this.esc(p.secondMajor||"")}</span></div>`:""}
      </div>

      <div class="myCard">
        <h3>📈 最新の成績記録</h3>
        ${latest?`<div class="recordItem50"><strong>${this.esc(latest.type||"成績記録")}</strong><br>${this.esc(latest.date||"日付未登録")} ／ ${this.esc(latest.name||"")}<br>総合点：${this.esc(latest.total||"未入力")}点<p class="small">${this.esc(latest.memo||"")}</p></div>`:`<div class="empty">模試・学校テストの記録がありません。登録すると、今後「合格ラインとの差」や成績推移に使えます。</div>`}
      </div>

      <div class="myCard">
        <h3>📚 学習記録</h3>
        ${this.renderStudyLogList50()}
      </div>

      <div class="myCard">
        <h3>⭐ お気に入り大学</h3>
        ${this.favorites.length?`<div class="subjectTags">${this.favorites.slice(0,8).map(n=>`<span>${this.esc(n)}</span>`).join("")}</div><div class="actions"><button class="btn light" onclick="SC.go('favorites')">一覧を見る</button></div>`:`<div class="empty">お気に入りはまだありません。大学ページから保存できます。</div>`}
      </div>
    </div>

    <div class="myCard">
      <h3>📊 成績記録一覧</h3>
      ${this.renderExamRecordList50()}
    </div>

    <div class="myCard" id="backupSection">
      <h3>💾 データ管理</h3>
      <div class="backupBox">
        データはこの端末のブラウザ内に保存されます。機種変更やブラウザデータ削除に備えて、定期的にバックアップを書き出してください。
      </div>
      <div class="actions">
        <button class="btn" onclick="SC.exportBackup50()">📤 バックアップを書き出す</button>
        <button class="btn light" onclick="document.getElementById('backupFile50').click()">📥 バックアップを読み込む</button>
        <input id="backupFile50" type="file" accept="application/json" style="display:none" onchange="SC.importBackup50(this.files[0])">
      </div>
    </div>
  </div>`;
};

SC.renderStudyLogList50=function(){
  const logs=(this.studyLogs||[]).slice().sort((a,b)=>String(b.date||"").localeCompare(String(a.date||""))).slice(0,3);
  if(!logs.length) return `<div class="empty">学習記録はまだありません。最初は「英語90分」くらいの簡単な記録で十分です。</div>`;
  return logs.map(l=>`<div class="recordItem50"><strong>${this.esc(l.date||"日付未登録")}</strong><br>${this.esc(l.subject||"科目未登録")}：${this.esc(l.minutes||"")}分<p class="small">${this.esc(l.memo||"")}</p></div>`).join("");
};

SC.renderExamRecordList50=function(){
  const records=(this.examRecords||[]).slice().sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")));
  if(!records.length) return `<div class="empty">記録がありません。共通テスト模試・記述模試・学校テスト・定期テストを追加できます。</div>`;
  return records.map(r=>`<div class="recordItem50">
    <strong>${this.esc(r.type||"成績記録")}</strong>　${this.esc(r.date||"")}
    <br>${this.esc(r.name||"")}
    <br>総合：${this.esc(r.total||"未入力")}点
    <p class="small">${["英語","数学","国語","理科","社会","情報Ⅰ"].map(s=>r[s]?`${s}:${this.esc(r[s])}`:"").filter(Boolean).join(" ／ ")}</p>
    <div class="actions"><button class="btn light" onclick="SC.deleteExamRecord50(${r.id})">削除</button></div>
  </div>`).join("");
};

SC.renderProfileForm=function(){
  const p=this.profile||{};
  this.app().innerHTML=`<div class="card"><h2>🎯 志望校を編集</h2>
    <div class="myForm">
      <label>第一志望<input id="pfFirst" value="${this.esc(p.firstChoice||"")}" placeholder="例：名古屋市立大学"></label>
      <label>学部・学科<input id="pfFirstMajor" value="${this.esc(p.firstMajor||"")}" placeholder="例：医学部 保健医療学科 看護学専攻"></label>
      <label>第二志望<input id="pfSecond" value="${this.esc(p.secondChoice||"")}"></label>
      <label>学部・学科<input id="pfSecondMajor" value="${this.esc(p.secondMajor||"")}"></label>
      <label class="wide">メモ<textarea id="pfMemo">${this.esc(p.memo||"")}</textarea></label>
    </div>
    <div class="actions"><button class="btn" onclick="SC.saveProfileForm50()">保存</button><button class="btn light" onclick="SC.go('mypage')">戻る</button></div>
  </div>`;
};

SC.saveProfileForm50=function(){
  this.profile={
    firstChoice:document.getElementById("pfFirst").value.trim(),
    firstMajor:document.getElementById("pfFirstMajor").value.trim(),
    secondChoice:document.getElementById("pfSecond").value.trim(),
    secondMajor:document.getElementById("pfSecondMajor").value.trim(),
    memo:document.getElementById("pfMemo").value.trim()
  };
  this.saveProfile();
  this.go("mypage");
};

SC.renderExamForm=function(){
  this.app().innerHTML=`<div class="card"><h2>📈 成績を追加</h2>
    <div class="myForm">
      <label>種類<select id="exType"><option>共通テスト模試</option><option>記述模試</option><option>学校実力テスト</option><option>定期テスト</option><option>その他</option></select></label>
      <label>日付<input id="exDate" type="date"></label>
      <label class="wide">模試・テスト名<input id="exName" placeholder="例：第1回共通テスト模試"></label>
      <label>総合点<input id="exTotal" type="number" placeholder="例：650"></label>
      <label>英語<input id="exEnglish" type="number"></label>
      <label>数学<input id="exMath" type="number"></label>
      <label>国語<input id="exJapanese" type="number"></label>
      <label>理科<input id="exScience" type="number"></label>
      <label>社会<input id="exSocial" type="number"></label>
      <label>情報Ⅰ<input id="exInfo" type="number"></label>
      <label class="wide">メモ<textarea id="exMemo" placeholder="良かった点・次回の課題など"></textarea></label>
    </div>
    <div class="actions"><button class="btn" onclick="SC.saveExamForm50()">保存</button><button class="btn light" onclick="SC.go('mypage')">戻る</button></div>
  </div>`;
};

SC.saveExamForm50=function(){
  const rec={
    id:Date.now(),
    type:document.getElementById("exType").value,
    date:document.getElementById("exDate").value,
    name:document.getElementById("exName").value.trim(),
    total:document.getElementById("exTotal").value,
    "英語":document.getElementById("exEnglish").value,
    "数学":document.getElementById("exMath").value,
    "国語":document.getElementById("exJapanese").value,
    "理科":document.getElementById("exScience").value,
    "社会":document.getElementById("exSocial").value,
    "情報Ⅰ":document.getElementById("exInfo").value,
    memo:document.getElementById("exMemo").value.trim()
  };
  this.examRecords.push(rec);
  this.saveExamRecords();
  this.go("mypage");
};

SC.deleteExamRecord50=function(id){
  this.examRecords=this.examRecords.filter(r=>r.id!==id);
  this.saveExamRecords();
  this.go("mypage");
};

SC.renderStudyLogForm=function(){
  this.app().innerHTML=`<div class="card"><h2>📚 学習記録を追加</h2>
    <div class="myForm">
      <label>日付<input id="slDate" type="date"></label>
      <label>科目<input id="slSubject" placeholder="例：英語"></label>
      <label>学習時間（分）<input id="slMinutes" type="number" placeholder="例：90"></label>
      <label class="wide">メモ<textarea id="slMemo" placeholder="やった内容"></textarea></label>
    </div>
    <div class="actions"><button class="btn" onclick="SC.saveStudyLogForm50()">保存</button><button class="btn light" onclick="SC.go('mypage')">戻る</button></div>
  </div>`;
};

SC.saveStudyLogForm50=function(){
  const log={id:Date.now(),date:document.getElementById("slDate").value,subject:document.getElementById("slSubject").value.trim(),minutes:document.getElementById("slMinutes").value,memo:document.getElementById("slMemo").value.trim()};
  this.studyLogs.push(log);
  this.saveStudyLogs();
  this.go("mypage");
};

SC.scrollToBackup=function(){
  const el=document.getElementById("backupSection");
  if(el) el.scrollIntoView({behavior:"smooth"});
};

SC.exportBackup50=function(){
  const payload={
    app:"進学コンパス",
    version:"5.0",
    exportedAt:new Date().toISOString(),
    profile:this.profile||{},
    favorites:this.favorites||[],
    compare:this.compare||[],
    students:this.students||[],
    examRecords:this.examRecords||[],
    studyLogs:this.studyLogs||[],
    mode:this.mode||"高校生"
  };
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  const date=new Date().toISOString().slice(0,10);
  a.href=url;
  a.download=`shingaku-compass-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

SC.importBackup50=function(file){
  if(!file) return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const data=JSON.parse(reader.result);
      this.profile=data.profile||{};
      this.favorites=data.favorites||[];
      this.compare=data.compare||[];
      this.students=data.students||[];
      this.examRecords=data.examRecords||[];
      this.studyLogs=data.studyLogs||[];
      this.mode=data.mode||this.mode||"高校生";
      this.saveProfile();
      this.save();
      if(this.saveStudents) this.saveStudents();
      this.saveExamRecords();
      this.saveStudyLogs();
      alert("バックアップを読み込みました。");
      this.go("mypage");
    }catch(e){
      alert("読み込みに失敗しました。JSONファイルを確認してください。");
    }
  };
  reader.readAsText(file);
};

/* 5.1 下メニュー修正・志望校選択式 */
SC.fixBottomNav51=function(){
  const nav=document.querySelector(".bottomNav");
  if(!nav) return;
  const buttons=Array.from(nav.querySelectorAll("button"));
  // 既存の5番目がメニューなら隠す。4番目をマイページにする。
  if(buttons[3]){
    buttons[3].innerHTML="👤<span>マイページ</span>";
    buttons[3].onclick=()=>SC.go("mypage");
  }
  if(buttons[4]) buttons[4].style.display="none";
};

setTimeout(()=>SC.fixBottomNav51&&SC.fixBottomNav51(),300);

SC.uniSearchTerm51="";
SC.selectedUniForProfile51=null;
SC.selectedFacultyForProfile51="";

SC.getProfileUniversity51=function(){
  const name=this.selectedUniForProfile51 || this.profile?.firstChoice || "";
  return this.byName(name);
};

SC.renderProfileForm=function(){
  const p=this.profile||{};
  this.selectedUniForProfile51=p.firstChoice||"";
  this.selectedFacultyForProfile51=p.firstFaculty||"";
  const u=this.getProfileUniversity51();
  const faculties=(u?.faculties||[]);
  const details=(u?.entranceDetails||[]);
  const faculty=this.selectedFacultyForProfile51;
  const departments=faculty ? details.filter(d=>d.faculty===faculty).map(d=>d.department||d.displayName).filter(Boolean) : [];

  this.app().innerHTML=`<div class="card"><h2>🎯 志望校を編集</h2>
    <div class="linkedSelectHint">大学名・学部・学科は手入力ではなく、候補から選べるようにしました。大学を選ぶと、その大学の学部だけが表示されます。</div>

    <div class="myForm">
      <label class="wide">大学検索<input id="uniSearch51" value="${this.esc(this.uniSearchTerm51||"")}" placeholder="例：名古屋、市立、看護" oninput="SC.uniSearchTerm51=this.value;SC.renderProfileForm()"></label>
      <div class="wide mypageSelectBox">
        <strong>大学を選択</strong>
        <div class="universityPickList">
          ${this.profileUniCandidates51().map(u=>`<button class="universityPickItem" onclick="SC.pickProfileUniversity51('${this.esc(u.name)}')">${this.esc(u.name)}<small>${this.esc(u.type)} ／ ${this.esc(u.pref)} ／ ${this.esc(u.field||"")}</small></button>`).join("")}
        </div>
      </div>

      <label>第一志望大学<input id="pfFirst" value="${this.esc(p.firstChoice||"")}" readonly></label>
      <label>学部<select id="pfFaculty" onchange="SC.selectedFacultyForProfile51=this.value;SC.profile.firstFaculty=this.value;SC.saveProfile();SC.renderProfileForm()">
        <option value="">学部を選択</option>
        ${faculties.map(f=>`<option value="${this.esc(f)}" ${faculty===f?"selected":""}>${this.esc(f)}</option>`).join("")}
      </select></label>

      <label class="wide">学科・専攻<select id="pfFirstMajor">
        <option value="">学科・専攻を選択</option>
        ${departments.map(d=>`<option value="${this.esc(d)}" ${(p.firstMajor||"")===d?"selected":""}>${this.esc(d)}</option>`).join("")}
      </select></label>

      <label>第二志望<input id="pfSecond" value="${this.esc(p.secondChoice||"")}" placeholder="必要なら入力"></label>
      <label>学部・学科<input id="pfSecondMajor" value="${this.esc(p.secondMajor||"")}" placeholder="必要なら入力"></label>
      <label class="wide">メモ<textarea id="pfMemo">${this.esc(p.memo||"")}</textarea></label>
    </div>
    <div class="actions"><button class="btn" onclick="SC.saveProfileForm50()">保存</button><button class="btn light" onclick="SC.go('mypage')">戻る</button></div>
  </div>`;
};

SC.profileUniCandidates51=function(){
  const q=(this.uniSearchTerm51||"").trim().toLowerCase();
  let list=this.universities||[];
  if(q){
    list=list.filter(u=>{
      const text=[u.name,u.pref,u.area,u.field,(u.faculties||[]).join(" "),(u.departments||[]).join(" ")].join(" ").toLowerCase();
      return text.includes(q);
    });
  }else{
    const priority=["名古屋市立大学","名古屋大学","愛知県立大学","愛知教育大学","南山大学","名城大学","中京大学","愛知大学"];
    list=[...list].sort((a,b)=>{
      const ai=priority.indexOf(a.name), bi=priority.indexOf(b.name);
      return (ai===-1?999:ai)-(bi===-1?999:bi);
    });
  }
  return list.slice(0,40);
};

SC.pickProfileUniversity51=function(name){
  this.profile=this.profile||{};
  this.profile.firstChoice=name;
  this.profile.firstFaculty="";
  this.profile.firstMajor="";
  this.selectedUniForProfile51=name;
  this.selectedFacultyForProfile51="";
  this.uniSearchTerm51=name;
  this.saveProfile();
  this.renderProfileForm();
};

/* 5.1 保存処理を学部込みに更新 */
SC.saveProfileForm50=function(){
  this.profile={
    firstChoice:document.getElementById("pfFirst").value.trim(),
    firstFaculty:document.getElementById("pfFaculty")?.value || "",
    firstMajor:document.getElementById("pfFirstMajor")?.value || "",
    secondChoice:document.getElementById("pfSecond").value.trim(),
    secondMajor:document.getElementById("pfSecondMajor").value.trim(),
    memo:document.getElementById("pfMemo").value.trim()
  };
  this.saveProfile();
  this.go("mypage");
};

/* 5.1 模試・テスト種類を選択しやすく */
SC.renderExamForm=function(){
  const examTypes=["共通テスト模試","全統共通テスト模試","全統記述模試","駿台全国模試","進研模試","学校実力テスト","定期テスト","1学期中間","1学期期末","2学期中間","2学期期末","学年末","その他"];
  this.app().innerHTML=`<div class="card"><h2>📈 成績を追加</h2>
    <div class="myForm">
      <label>種類<select id="exType">${examTypes.map(x=>`<option>${x}</option>`).join("")}</select></label>
      <label>日付<input id="exDate" type="date"></label>
      <label class="wide">模試・テスト名<input id="exName" placeholder="例：第1回共通テスト模試"></label>
      <label>総合点<input id="exTotal" type="number" placeholder="例：650"></label>
      <label>英語<input id="exEnglish" type="number"></label>
      <label>数学<input id="exMath" type="number"></label>
      <label>国語<input id="exJapanese" type="number"></label>
      <label>理科<input id="exScience" type="number"></label>
      <label>社会<input id="exSocial" type="number"></label>
      <label>情報Ⅰ<input id="exInfo" type="number"></label>
      <label class="wide">メモ<textarea id="exMemo" placeholder="良かった点・次回の課題など"></textarea></label>
    </div>
    <div class="actions"><button class="btn" onclick="SC.saveExamForm50()">保存</button><button class="btn light" onclick="SC.go('mypage')">戻る</button></div>
  </div>`;
};

/* 5.1 マイページ志望校表示に学部を追加 */
const oldRenderMyPage51 = SC.renderMyPage;
SC.renderMyPage=function(){
  oldRenderMyPage51.call(this);
  setTimeout(()=>SC.fixBottomNav51&&SC.fixBottomNav51(),50);
};

/* 5.1.1 右上メニューはメニュー、下だけマイページ */
SC.fixMenus511=function(){
  // 下メニュー：4番目をマイページ、5番目は非表示
  const nav=document.querySelector(".bottomNav");
  if(nav){
    const buttons=Array.from(nav.querySelectorAll("button"));
    if(buttons[3]){
      buttons[3].innerHTML="👤<span>マイページ</span>";
      buttons[3].onclick=()=>SC.go("mypage");
    }
    if(buttons[4]) buttons[4].style.display="none";
  }

  // 右上メニュー：もし「マイページ」になっていたら「メニュー」に戻す
  const allButtons=Array.from(document.querySelectorAll("button"));
  allButtons.forEach(btn=>{
    const text=(btn.textContent||"").trim();
    const isBottom = btn.closest(".bottomNav");
    if(!isBottom && text.includes("マイページ") && (btn.onclick || btn.getAttribute("onclick")||"").toString().includes("toggleMenu")){
      btn.innerHTML="☰ メニュー";
    }
  });
};

setTimeout(()=>SC.fixMenus511&&SC.fixMenus511(),200);

/* 5.1.2 志望校選択UI整理 */
SC.renderSelectedGoalCard512=function(){
  const p=this.profile||{};
  if(!p.firstChoice){
    return `<div class="selectedGoalCard512"><h3>🎯 第一志望</h3><div class="noResult512">まだ大学が選択されていません。下の検索結果から大学を選んでください。</div></div>`;
  }
  const u=this.byName(p.firstChoice);
  return `<div class="selectedGoalCard512">
    <h3>🎯 第一志望</h3>
    <div class="uniName">🏫 ${this.esc(p.firstChoice)}</div>
    <div class="meta">${u?`${this.esc(u.type)} ／ ${this.esc(u.pref)} ／ 偏差値目安 ${this.esc(u.level||"未登録")}`:""}</div>
    ${p.firstFaculty?`<div class="goalBox"><strong>${this.esc(p.firstFaculty)}</strong><br>${this.esc(p.firstMajor||"学科・専攻未選択")}</div>`:""}
  </div>`;
};

SC.renderProfileForm=function(){
  const p=this.profile||{};
  this.selectedUniForProfile51=p.firstChoice||"";
  this.selectedFacultyForProfile51=p.firstFaculty||"";
  const u=this.getProfileUniversity51();
  const faculties=(u?.faculties||[]);
  const details=(u?.entranceDetails||[]);
  const faculty=this.selectedFacultyForProfile51;
  const departments=faculty ? details.filter(d=>d.faculty===faculty).map(d=>d.department||d.displayName).filter(Boolean) : [];
  const candidates=this.profileUniCandidates51();

  this.app().innerHTML=`<div class="card"><h2>🎯 志望校を編集</h2>
    <div class="linkedSelectHint">大学を検索してカードをタップしてください。大学を選ぶと、その大学の学部だけが表示されます。</div>

    ${this.renderSelectedGoalCard512()}

    <div class="myForm">
      <label class="wide">大学検索<input id="uniSearch51" value="${this.esc(this.uniSearchTerm51||"")}" placeholder="例：名古屋、市立、看護" oninput="SC.uniSearchTerm51=this.value;SC.renderProfileForm()"></label>
    </div>

    <div class="searchResultTitle512">検索結果</div>
    <div class="universityPickList">
      ${candidates.length ? candidates.map(u=>`<button class="universityPickItem" onclick="SC.pickProfileUniversity51('${this.esc(u.name)}')">
        <span class="pickTitle">🏫 ${this.esc(u.name)}</span>
        <span class="pickMeta">${this.esc(u.type)} ／ ${this.esc(u.pref)} ／ ${this.esc(u.field||"")} ／ 偏差値目安 ${this.esc(u.level||"未登録")}</span>
      </button>`).join("") : `<div class="noResult512">該当する大学がありません。別のキーワードで検索してください。</div>`}
    </div>

    <div class="myForm">
      ${p.firstChoice?`
      <label>学部<select id="pfFaculty" onchange="SC.selectedFacultyForProfile51=this.value;SC.profile.firstFaculty=this.value;SC.profile.firstMajor='';SC.saveProfile();SC.renderProfileForm()">
        <option value="">学部を選択</option>
        ${faculties.map(f=>`<option value="${this.esc(f)}" ${faculty===f?"selected":""}>${this.esc(f)}</option>`).join("")}
      </select></label>

      <label>学科・専攻<select id="pfFirstMajor">
        <option value="">学科・専攻を選択</option>
        ${departments.map(d=>`<option value="${this.esc(d)}" ${(p.firstMajor||"")===d?"selected":""}>${this.esc(d)}</option>`).join("")}
      </select></label>`:""}

      <label>第二志望<input id="pfSecond" value="${this.esc(p.secondChoice||"")}" placeholder="必要なら入力"></label>
      <label>学部・学科<input id="pfSecondMajor" value="${this.esc(p.secondMajor||"")}" placeholder="必要なら入力"></label>
      <label class="wide">メモ<textarea id="pfMemo">${this.esc(p.memo||"")}</textarea></label>
    </div>
    <div class="actions"><button class="btn" onclick="SC.saveProfileForm50()">保存</button><button class="btn light" onclick="SC.go('mypage')">戻る</button></div>
  </div>`;
};

SC.saveProfileForm50=function(){
  this.profile={
    firstChoice:this.profile?.firstChoice||"",
    firstFaculty:document.getElementById("pfFaculty")?.value || this.profile?.firstFaculty || "",
    firstMajor:document.getElementById("pfFirstMajor")?.value || "",
    secondChoice:document.getElementById("pfSecond")?.value.trim() || "",
    secondMajor:document.getElementById("pfSecondMajor")?.value.trim() || "",
    memo:document.getElementById("pfMemo")?.value.trim() || ""
  };
  this.saveProfile();
  this.go("mypage");
};

SC.pickProfileUniversity51=function(name){
  this.profile=this.profile||{};
  this.profile.firstChoice=name;
  this.profile.firstFaculty="";
  this.profile.firstMajor="";
  this.selectedUniForProfile51=name;
  this.selectedFacultyForProfile51="";
  this.uniSearchTerm51=name;
  this.saveProfile();
  this.renderProfileForm();
};

/* 5.1.3 データ完成度をアコーディオン化 */
SC.toggleQuality513=function(){
  const el=document.getElementById("qualityDetails513");
  const arrow=document.getElementById("qualityArrow513");
  if(!el) return;
  const hidden=el.hasAttribute("hidden");
  if(hidden){
    el.removeAttribute("hidden");
    if(arrow) arrow.textContent="▲";
  }else{
    el.setAttribute("hidden","");
    if(arrow) arrow.textContent="▼";
  }
};

SC.renderQualityMeter490=function(u){
  const q=this.dataQualityScore490(u);
  return `<div class="qualityMeter">
    <button class="qualityCompact513" onclick="SC.toggleQuality513()">
      <span class="qLeft">
        <span class="qTitle">🛡️ データ品質：${this.esc(q.label)}</span>
        <span class="qualityMiniBar"><span style="width:${q.score}%"></span></span>
        <span class="qSub">タップで内訳を表示</span>
      </span>
      <span style="display:flex;align-items:center;gap:8px">
        <span class="qPercent">${q.score}%</span>
        <span id="qualityArrow513">▼</span>
      </span>
    </button>
    <div class="qualityDetails513" id="qualityDetails513" hidden>
      <div class="qualityChecks">${q.checks.map(c=>`<span>✓ ${this.esc(c)}</span>`).join("")}</div>
    </div>
  </div>`;
};

/* 5.1.4 成績入力：合計点を下で自動計算 */
SC.calcExamTotal514=function(){
  const ids=["exEnglish","exMath","exJapanese","exScience","exSocial","exInfo"];
  const total=ids.reduce((sum,id)=>{
    const v=Number(document.getElementById(id)?.value || 0);
    return sum + (Number.isFinite(v)?v:0);
  },0);
  const el=document.getElementById("autoTotal514");
  if(el) el.textContent=total;
};

SC.renderExamForm=function(){
  const examTypes=["共通テスト模試","全統共通テスト模試","全統記述模試","駿台全国模試","進研模試","学校実力テスト","定期テスト","1学期中間","1学期期末","2学期中間","2学期期末","学年末","その他"];
  this.app().innerHTML=`<div class="card"><h2>📈 成績を追加</h2>
    <div class="linkedSelectHint">科目別点数を入力すると、合計点は下で自動計算されます。</div>
    <div class="myForm">
      <label>種類<select id="exType">${examTypes.map(x=>`<option>${x}</option>`).join("")}</select></label>
      <label>日付<input id="exDate" type="date"></label>
      <label class="wide">模試・テスト名<input id="exName" placeholder="例：第1回共通テスト模試"></label>

      <div class="subjectInputTitle514">科目別点数</div>
      <label>英語<input id="exEnglish" type="number" inputmode="numeric" oninput="SC.calcExamTotal514()"></label>
      <label>数学<input id="exMath" type="number" inputmode="numeric" oninput="SC.calcExamTotal514()"></label>
      <label>国語<input id="exJapanese" type="number" inputmode="numeric" oninput="SC.calcExamTotal514()"></label>
      <label>理科<input id="exScience" type="number" inputmode="numeric" oninput="SC.calcExamTotal514()"></label>
      <label>社会<input id="exSocial" type="number" inputmode="numeric" oninput="SC.calcExamTotal514()"></label>
      <label>情報Ⅰ<input id="exInfo" type="number" inputmode="numeric" oninput="SC.calcExamTotal514()"></label>

      <div class="wide totalAutoBox514">
        合計点
        <div><span class="totalNum" id="autoTotal514">0</span> 点</div>
        <div class="totalNote">科目別点数から自動計算されます。</div>
      </div>

      <label class="wide">メモ<textarea id="exMemo" placeholder="良かった点・次回の課題など"></textarea></label>
    </div>
    <div class="actions"><button class="btn" onclick="SC.saveExamForm50()">保存</button><button class="btn light" onclick="SC.go('mypage')">戻る</button></div>
  </div>`;
  setTimeout(()=>this.calcExamTotal514(),50);
};

SC.saveExamForm50=function(){
  const totalEl=document.getElementById("autoTotal514");
  const rec={
    id:Date.now(),
    type:document.getElementById("exType").value,
    date:document.getElementById("exDate").value,
    name:document.getElementById("exName").value.trim(),
    total: totalEl ? totalEl.textContent : "0",
    "英語":document.getElementById("exEnglish").value,
    "数学":document.getElementById("exMath").value,
    "国語":document.getElementById("exJapanese").value,
    "理科":document.getElementById("exScience").value,
    "社会":document.getElementById("exSocial").value,
    "情報Ⅰ":document.getElementById("exInfo").value,
    memo:document.getElementById("exMemo").value.trim()
  };
  this.examRecords.push(rec);
  this.saveExamRecords();
  this.go("mypage");
};

/* 5.2 志望校変更UI・検索修正版 */
SC.goalSearchOpen52=false;
SC.goalSearchTerm52="";

SC.normalizeSearch52=function(s){
  return String(s||"").toLowerCase().replace(/\s+/g,"").replace(/[・\/｜|]/g,"");
};

SC.aliases52=function(u){
  const name=u.name||"";
  const aliases=[];
  if(name==="名古屋市立大学") aliases.push("名市大","市立","名古屋市大","名古屋市立","ncu");
  if(name==="名古屋大学") aliases.push("名大","名古屋大","nagoyauniversity");
  if(name==="名古屋工業大学") aliases.push("名工大","名工","名古屋工大");
  if(name==="愛知教育大学") aliases.push("愛教","愛教大");
  if(name==="愛知県立大学") aliases.push("愛県大","県大","愛知県大");
  if(name==="南山大学") aliases.push("南山");
  if(name==="名城大学") aliases.push("名城");
  if(name==="中京大学") aliases.push("中京");
  if(name==="愛知大学") aliases.push("愛大");
  return aliases;
};

SC.profileUniCandidates52=function(){
  const raw=(this.goalSearchTerm52||"").trim();
  let list=this.universities||[];
  const priority=["名古屋市立大学","名古屋大学","名古屋工業大学","愛知県立大学","愛知教育大学","南山大学","名城大学","中京大学","愛知大学"];
  if(raw){
    const q=this.normalizeSearch52(raw);
    list=list.filter(u=>{
      const text=this.normalizeSearch52([
        u.name,u.pref,u.area,u.field,u.type,
        ...(u.faculties||[]),
        ...(u.departments||[]),
        ...this.aliases52(u)
      ].join(" "));
      return text.includes(q);
    });
  }
  list=[...list].sort((a,b)=>{
    const ai=priority.indexOf(a.name), bi=priority.indexOf(b.name);
    if(ai!==-1 || bi!==-1) return (ai===-1?999:ai)-(bi===-1?999:bi);
    return String(a.name).localeCompare(String(b.name),"ja");
  });
  return list.slice(0,50);
};

SC.openGoalSearch52=function(){
  this.goalSearchOpen52=true;
  this.goalSearchTerm52=this.profile?.firstChoice||"";
  this.renderProfileForm();
};
SC.closeGoalSearch52=function(){
  this.goalSearchOpen52=false;
  this.renderProfileForm();
};

SC.pickGoalUniversity52=function(name){
  this.profile=this.profile||{};
  this.profile.firstChoice=name;
  this.profile.firstFaculty="";
  this.profile.firstMajor="";
  this.goalSearchOpen52=false;
  this.goalSearchTerm52="";
  this.saveProfile();
  this.renderProfileForm();
};

SC.renderGoalSelected52=function(){
  const p=this.profile||{};
  if(!p.firstChoice){
    return `<div class="goalSelected52">
      <div class="goalLabel">🎯 第一志望</div>
      <div class="noGoalResult52">まだ第一志望が登録されていません。「変更する」から大学を選んでください。</div>
      <div class="actions"><button class="btn" onclick="SC.openGoalSearch52()">変更する</button></div>
    </div>`;
  }
  const u=this.byName(p.firstChoice);
  return `<div class="goalSelected52">
    <div class="goalLabel">🎯 第一志望</div>
    <div class="goalUni">🏫 ${this.esc(p.firstChoice)}</div>
    <div class="goalMeta">${u?`${this.esc(u.type)} ／ ${this.esc(u.pref)} ／ 偏差値目安 ${this.esc(u.level||"未登録")}`:""}</div>
    ${p.firstFaculty||p.firstMajor?`<div class="goalMajorBox52">${this.esc(p.firstFaculty||"学部未選択")}<small>${this.esc(p.firstMajor||"学科・専攻未選択")}</small></div>`:""}
    <div class="actions"><button class="btn light" onclick="SC.openGoalSearch52()">変更する</button></div>
  </div>`;
};

SC.renderGoalSearchPanel52=function(){
  const candidates=this.profileUniCandidates52();
  return `<div class="goalChangeArea52" ${this.goalSearchOpen52?"":"hidden"}>
    <h3>🔍 大学検索</h3>
    <input class="goalSearchInput52" id="goalSearch52" value="${this.esc(this.goalSearchTerm52||"")}" placeholder="例：名古屋、名市大、市立、名大" oninput="SC.goalSearchTerm52=this.value;SC.renderProfileForm()">
    <div class="aliasHint52">略称検索：名市大・名大・名工大・愛教・愛県大 などにも対応</div>
    <div style="margin-top:10px">
      ${candidates.length?candidates.map(u=>`<button class="goalResultCard52" onclick="SC.pickGoalUniversity52('${this.esc(u.name)}')">
        <span class="title">🏫 ${this.esc(u.name)}</span>
        <span class="meta">${this.esc(u.type)} ／ ${this.esc(u.pref)} ／ ${this.esc(u.field||"")} ／ 偏差値目安 ${this.esc(u.level||"未登録")}</span>
        <span class="fac">${this.esc((u.faculties||[]).slice(0,5).join("、"))}${(u.faculties||[]).length>5?" ほか":""}</span>
      </button>`).join(""):`<div class="noGoalResult52">該当する大学がありません。別のキーワードで検索してください。</div>`}
    </div>
    <div class="actions"><button class="btn light" onclick="SC.closeGoalSearch52()">閉じる</button></div>
  </div>`;
};

SC.renderGoalFacultySelect52=function(){
  const p=this.profile||{};
  if(!p.firstChoice) return "";
  const u=this.byName(p.firstChoice);
  const faculties=u?.faculties||[];
  const details=u?.entranceDetails||[];
  const faculty=p.firstFaculty||"";
  const departments=faculty ? details.filter(d=>d.faculty===faculty).map(d=>d.department||d.displayName).filter(Boolean) : [];
  return `<div class="goalSelectGrid52">
    <label>学部<select id="pfFaculty" onchange="SC.profile.firstFaculty=this.value;SC.profile.firstMajor='';SC.saveProfile();SC.renderProfileForm()">
      <option value="">学部を選択</option>
      ${faculties.map(f=>`<option value="${this.esc(f)}" ${faculty===f?"selected":""}>${this.esc(f)}</option>`).join("")}
    </select></label>
    <label>学科・専攻<select id="pfFirstMajor" onchange="SC.profile.firstMajor=this.value;SC.saveProfile();SC.renderProfileForm()">
      <option value="">学科・専攻を選択</option>
      ${departments.map(d=>`<option value="${this.esc(d)}" ${(p.firstMajor||"")===d?"selected":""}>${this.esc(d)}</option>`).join("")}
    </select></label>
  </div>`;
};

SC.renderProfileForm=function(){
  const p=this.profile||{};
  this.app().innerHTML=`<div class="card"><h2>🎯 志望校を編集</h2>
    <div class="linkedSelectHint">通常は第一志望カードだけ表示します。変更したい時だけ「変更する」から大学を検索できます。</div>

    <div class="goalEditPanel52">
      ${this.renderGoalSelected52()}
      ${this.renderGoalSearchPanel52()}
      ${this.renderGoalFacultySelect52()}
    </div>

    <div class="myForm">
      <label>第二志望<input id="pfSecond" value="${this.esc(p.secondChoice||"")}" placeholder="必要なら入力"></label>
      <label>学部・学科<input id="pfSecondMajor" value="${this.esc(p.secondMajor||"")}" placeholder="必要なら入力"></label>
      <label class="wide">メモ<textarea id="pfMemo">${this.esc(p.memo||"")}</textarea></label>
    </div>
    <div class="actions"><button class="btn" onclick="SC.saveProfileForm50()">保存</button><button class="btn light" onclick="SC.go('mypage')">戻る</button></div>
  </div>`;
};

SC.saveProfileForm50=function(){
  this.profile=this.profile||{};
  this.profile.secondChoice=document.getElementById("pfSecond")?.value.trim() || "";
  this.profile.secondMajor=document.getElementById("pfSecondMajor")?.value.trim() || "";
  this.profile.memo=document.getElementById("pfMemo")?.value.trim() || "";
  this.saveProfile();
  this.go("mypage");
};

/* 5.2.1 志望校検索入力バグ修正 */
SC.updateGoalSearchResults521=function(value){
  this.goalSearchTerm52=value;
  const box=document.getElementById("goalResults521");
  if(!box) return;
  box.innerHTML=this.renderGoalResultCards521();
};

SC.renderGoalResultCards521=function(){
  const candidates=this.profileUniCandidates52 ? this.profileUniCandidates52() : [];
  if(!candidates.length){
    return `<div class="noGoalResult52">該当する大学がありません。別のキーワードで検索してください。</div>`;
  }
  return candidates.map(u=>`<button class="goalResultCard52" onclick="SC.pickGoalUniversity52('${this.esc(u.name)}')">
    <span class="title">🏫 ${this.esc(u.name)}</span>
    <span class="meta">${this.esc(u.type)} ／ ${this.esc(u.pref)} ／ ${this.esc(u.field||"")} ／ 偏差値目安 ${this.esc(u.level||"未登録")}</span>
    <span class="fac">${this.esc((u.faculties||[]).slice(0,5).join("、"))}${(u.faculties||[]).length>5?" ほか":""}</span>
  </button>`).join("");
};

SC.renderGoalSearchPanel52=function(){
  return `<div class="goalChangeArea52" ${this.goalSearchOpen52?"":"hidden"}>
    <h3>🔍 大学検索</h3>
    <input class="goalSearchInput52" id="goalSearch52" value="${this.esc(this.goalSearchTerm52||"")}" placeholder="例：名古屋、名市大、市立、名大" oninput="SC.updateGoalSearchResults521(this.value)">
    <div class="aliasHint52">略称検索：名市大・名大・名工大・愛教・愛県大 などにも対応</div>
    <div class="goalResultsOnly521" id="goalResults521">${this.renderGoalResultCards521()}</div>
    <div class="actions"><button class="btn light" onclick="SC.closeGoalSearch52()">閉じる</button></div>
  </div>`;
};

/* 念のため、第二志望・メモは再描画されない通常入力のまま */

/* 5.2.2 志望校検索完全修正 */
SC.allUniversities522=function(){
  return this.universities || window.SC_UNIVERSITIES || window.UNIVERSITIES || [];
};

SC.normalizeSearch52=function(s){
  return String(s||"")
    .toLowerCase()
    .replace(/\s+/g,"")
    .replace(/[・\/｜|　]/g,"")
    .replace(/大学$/,"大学");
};

SC.aliases52=function(u){
  const name=u.name||"";
  const aliases=[];
  if(name.includes("名古屋市立")) aliases.push("名市大","市立","名古屋市大","名古屋市立","ncu","名古屋市");
  if(name==="名古屋大学") aliases.push("名大","名古屋大","nagoyauniversity");
  if(name.includes("名古屋工業")) aliases.push("名工大","名工","名古屋工大","名古屋工業");
  if(name.includes("愛知教育")) aliases.push("愛教","愛教大");
  if(name.includes("愛知県立")) aliases.push("愛県大","県大","愛知県大");
  if(name.includes("南山")) aliases.push("南山");
  if(name.includes("名城")) aliases.push("名城");
  if(name.includes("中京")) aliases.push("中京");
  if(name==="愛知大学") aliases.push("愛大");
  return aliases;
};

SC.profileUniCandidates52=function(){
  const raw=(this.goalSearchTerm52||"").trim();
  let list=this.allUniversities522();
  const priority=["名古屋市立大学","名古屋大学","名古屋工業大学","愛知県立大学","愛知教育大学","南山大学","名城大学","中京大学","愛知大学"];
  if(raw){
    const q=this.normalizeSearch52(raw);
    list=list.filter(u=>{
      const text=this.normalizeSearch52([
        u.name,u.pref,u.area,u.field,u.type,
        ...(u.faculties||[]),
        ...(u.departments||[]),
        ...this.aliases52(u)
      ].join(" "));
      return text.includes(q) || this.normalizeSearch52(u.name).includes(q);
    });
  }
  list=[...list].sort((a,b)=>{
    const ai=priority.indexOf(a.name), bi=priority.indexOf(b.name);
    if(ai!==-1 || bi!==-1) return (ai===-1?999:ai)-(bi===-1?999:bi);
    return String(a.name).localeCompare(String(b.name),"ja");
  });
  return list.slice(0,50);
};

SC.renderGoalResultCards521=function(){
  const candidates=this.profileUniCandidates52();
  if(!candidates.length){
    return `<div class="noGoalResult52">該当する大学がありません。別のキーワードで検索してください。<div class="searchDebugHint522">検索語：${this.esc(this.goalSearchTerm52||"")}</div></div>`;
  }
  return candidates.map(u=>`<button class="goalResultCard52" onclick="SC.pickGoalUniversity52('${this.esc(u.name)}')">
    <span class="title">🏫 ${this.esc(u.name)}</span>
    <span class="meta">${this.esc(u.type)} ／ ${this.esc(u.pref)} ／ ${this.esc(u.field||"")} ／ 偏差値目安 ${this.esc(u.level||"未登録")}</span>
    <span class="fac">${this.esc((u.faculties||[]).slice(0,5).join("、"))}${(u.faculties||[]).length>5?" ほか":""}</span>
  </button>`).join("");
};

SC.updateGoalSearchResults521=function(value){
  this.goalSearchTerm52=value;
  const box=document.getElementById("goalResults521");
  if(box) box.innerHTML=this.renderGoalResultCards521();
};

SC.openGoalSearch52=function(){
  this.goalSearchOpen52=true;
  this.goalSearchTerm52="";  // 既存大学名で絞り込まない。まず候補を出す
  this.renderProfileForm();
  setTimeout(()=>{
    const input=document.getElementById("goalSearch52");
    if(input) input.focus();
  },80);
};

SC.renderGoalSearchPanel52=function(){
  return `<div class="goalChangeArea52" ${this.goalSearchOpen52?"":"hidden"}>
    <h3>🔍 大学検索</h3>
    <input class="goalSearchInput52" id="goalSearch52" value="${this.esc(this.goalSearchTerm52||"")}" placeholder="例：名古屋、名市大、市立、名大" oninput="SC.updateGoalSearchResults521(this.value)">
    <div class="aliasHint52">略称検索：名市大・名大・名工大・愛教・愛県大 などにも対応</div>
    <div class="goalResultsOnly521" id="goalResults521">${this.renderGoalResultCards521()}</div>
    <div class="actions"><button class="btn light" onclick="SC.closeGoalSearch52()">閉じる</button></div>
  </div>`;
};

/* 5.3 第一〜第三志望カード統一 */
SC.goalSearchOpen53=null;
SC.goalSearchTerm53="";

SC.goalKey53=function(rank, field){
  const prefix = rank===1 ? "first" : rank===2 ? "second" : "third";
  return prefix + field;
};

SC.goalLabel53=function(rank){
  return rank===1 ? "🎯 第一志望" : rank===2 ? "🥈 第二志望" : "🥉 第三志望";
};

SC.goalClass53=function(rank){
  return rank===1 ? "rank1" : rank===2 ? "rank2" : "rank3";
};

SC.getGoal53=function(rank){
  const p=this.profile||{};
  const prefix=rank===1?"first":rank===2?"second":"third";
  return {
    choice:p[prefix+"Choice"]||"",
    faculty:p[prefix+"Faculty"]||"",
    major:p[prefix+"Major"]||""
  };
};

SC.setGoalUniversity53=function(rank, name){
  const prefix=rank===1?"first":rank===2?"second":"third";
  this.profile=this.profile||{};
  this.profile[prefix+"Choice"]=name;
  this.profile[prefix+"Faculty"]="";
  this.profile[prefix+"Major"]="";
  this.goalSearchOpen53=null;
  this.goalSearchTerm53="";
  this.saveProfile();
  this.renderProfileForm();
};

SC.openGoalSearch53=function(rank){
  this.goalSearchOpen53=rank;
  this.goalSearchTerm53="";
  this.renderProfileForm();
  setTimeout(()=>document.getElementById("goalSearch53")?.focus(),80);
};

SC.closeGoalSearch53=function(){
  this.goalSearchOpen53=null;
  this.renderProfileForm();
};

SC.profileUniCandidates53=function(){
  const raw=(this.goalSearchTerm53||"").trim();
  let list=this.allUniversities522 ? this.allUniversities522() : (this.universities||window.SC_UNIVERSITIES||[]);
  const priority=["名古屋市立大学","名古屋大学","名古屋工業大学","愛知県立大学","愛知教育大学","南山大学","名城大学","中京大学","愛知大学"];
  if(raw){
    const q=this.normalizeSearch52(raw);
    list=list.filter(u=>{
      const text=this.normalizeSearch52([
        u.name,u.pref,u.area,u.field,u.type,
        ...(u.faculties||[]),
        ...(u.departments||[]),
        ...(this.aliases52?this.aliases52(u):[])
      ].join(" "));
      return text.includes(q) || this.normalizeSearch52(u.name).includes(q);
    });
  }
  return [...list].sort((a,b)=>{
    const ai=priority.indexOf(a.name), bi=priority.indexOf(b.name);
    if(ai!==-1 || bi!==-1) return (ai===-1?999:ai)-(bi===-1?999:bi);
    return String(a.name).localeCompare(String(b.name),"ja");
  }).slice(0,50);
};

SC.updateGoalSearchResults53=function(value){
  this.goalSearchTerm53=value;
  const box=document.getElementById("goalResults53");
  if(box) box.innerHTML=this.renderGoalResultCards53(this.goalSearchOpen53||1);
};

SC.renderGoalResultCards53=function(rank){
  const candidates=this.profileUniCandidates53();
  if(!candidates.length){
    return `<div class="noGoalResult52">該当する大学がありません。別のキーワードで検索してください。</div>`;
  }
  return candidates.map(u=>`<button class="goalResultCard52" onclick="SC.setGoalUniversity53(${rank}, '${this.esc(u.name)}')">
    <span class="title">🏫 ${this.esc(u.name)}</span>
    <span class="meta">${this.esc(u.type)} ／ ${this.esc(u.pref)} ／ ${this.esc(u.field||"")} ／ 偏差値目安 ${this.esc(u.level||"未登録")}</span>
    <span class="fac">${this.esc((u.faculties||[]).slice(0,5).join("、"))}${(u.faculties||[]).length>5?" ほか":""}</span>
  </button>`).join("");
};

SC.renderGoalSearchPanel53=function(rank){
  return `<div class="goalSearchPanel53" ${this.goalSearchOpen53===rank?"":"hidden"}>
    <h3>🔍 ${this.goalLabel53(rank)}を検索</h3>
    <input class="goalSearchInput52" id="goalSearch53" value="${this.esc(this.goalSearchTerm53||"")}" placeholder="例：名古屋、名市大、市立、名大" oninput="SC.updateGoalSearchResults53(this.value)">
    <div class="aliasHint52">略称検索：名市大・名大・名工大・愛教・愛県大 などにも対応</div>
    <div class="goalResultsOnly521" id="goalResults53">${this.renderGoalResultCards53(rank)}</div>
    <div class="actions"><button class="btn light" onclick="SC.closeGoalSearch53()">閉じる</button></div>
  </div>`;
};

SC.renderGoalFacultySelect53=function(rank){
  const g=this.getGoal53(rank);
  if(!g.choice) return "";
  const u=this.byName(g.choice);
  const faculties=u?.faculties||[];
  const details=u?.entranceDetails||[];
  const departments=g.faculty ? details.filter(d=>d.faculty===g.faculty).map(d=>d.department||d.displayName).filter(Boolean) : [];
  return `<div class="goalSelectGrid53">
    <label>学部<select onchange="SC.updateGoalFaculty53(${rank}, this.value)">
      <option value="">学部を選択</option>
      ${faculties.map(f=>`<option value="${this.esc(f)}" ${g.faculty===f?"selected":""}>${this.esc(f)}</option>`).join("")}
    </select></label>
    <label>学科・専攻<select onchange="SC.updateGoalMajor53(${rank}, this.value)">
      <option value="">学科・専攻を選択</option>
      ${departments.map(d=>`<option value="${this.esc(d)}" ${g.major===d?"selected":""}>${this.esc(d)}</option>`).join("")}
    </select></label>
  </div>`;
};

SC.updateGoalFaculty53=function(rank, value){
  const prefix=rank===1?"first":rank===2?"second":"third";
  this.profile[prefix+"Faculty"]=value;
  this.profile[prefix+"Major"]="";
  this.saveProfile();
  this.renderProfileForm();
};

SC.updateGoalMajor53=function(rank, value){
  const prefix=rank===1?"first":rank===2?"second":"third";
  this.profile[prefix+"Major"]=value;
  this.saveProfile();
  this.renderProfileForm();
};

SC.renderGoalCard53=function(rank){
  const g=this.getGoal53(rank);
  const u=g.choice ? this.byName(g.choice) : null;
  if(!g.choice && rank===3 && !this.profile?.showThirdGoal){
    return `<button class="goalAdd53" onclick="SC.profile.showThirdGoal=true;SC.saveProfile();SC.renderProfileForm()">＋ 第三志望を追加</button>`;
  }
  return `<div class="goalCard53 ${this.goalClass53(rank)}">
    <div class="rankLabel">${this.goalLabel53(rank)}</div>
    ${g.choice ? `
      <div class="uni">🏫 ${this.esc(g.choice)}</div>
      <div class="meta">${u?`${this.esc(u.type)} ／ ${this.esc(u.pref)} ／ 偏差値目安 ${this.esc(u.level||"未登録")}`:""}</div>
      ${g.faculty||g.major?`<div class="major">${this.esc(g.faculty||"学部未選択")}<small>${this.esc(g.major||"学科・専攻未選択")}</small></div>`:""}
    ` : `<div class="noGoalResult52">まだ登録されていません。</div>`}
    <div class="actions">
      <button class="btn light" onclick="SC.openGoalSearch53(${rank})">変更する</button>
      ${g.choice?`<button class="btn light" onclick="SC.clearGoal53(${rank})">削除</button>`:""}
    </div>
    ${this.renderGoalSearchPanel53(rank)}
    ${this.renderGoalFacultySelect53(rank)}
  </div>`;
};

SC.clearGoal53=function(rank){
  const prefix=rank===1?"first":rank===2?"second":"third";
  this.profile[prefix+"Choice"]="";
  this.profile[prefix+"Faculty"]="";
  this.profile[prefix+"Major"]="";
  if(rank===3) this.profile.showThirdGoal=false;
  this.saveProfile();
  this.renderProfileForm();
};

SC.renderProfileForm=function(){
  const p=this.profile||{};
  this.app().innerHTML=`<div class="card"><h2>🎯 志望校を編集</h2>
    <div class="linkedSelectHint">第一志望・第二志望・第三志望を同じカード形式で管理できます。変更したい時だけ検索を開きます。</div>
    <div class="goalStack53">
      ${this.renderGoalCard53(1)}
      ${this.renderGoalCard53(2)}
      ${this.renderGoalCard53(3)}
    </div>
    <div class="myForm">
      <label class="wide">メモ<textarea id="pfMemo">${this.esc(p.memo||"")}</textarea></label>
    </div>
    <div class="actions"><button class="btn" onclick="SC.saveProfileForm50()">保存</button><button class="btn light" onclick="SC.go('mypage')">戻る</button></div>
  </div>`;
};

SC.saveProfileForm50=function(){
  this.profile=this.profile||{};
  this.profile.memo=document.getElementById("pfMemo")?.value.trim() || "";
  this.saveProfile();
  this.go("mypage");
};

/* 5.3 マイページ志望校表示も複数対応 */
SC.renderGoalSummaryMyPage53=function(){
  const items=[1,2,3].map(rank=>{
    const g=this.getGoal53(rank);
    if(!g.choice) return "";
    return `<div class="goalBox"><strong>${this.goalLabel53(rank)}</strong><br>${this.esc(g.choice)}<br><span class="small">${this.esc(g.faculty||"")} ${this.esc(g.major||"")}</span></div>`;
  }).filter(Boolean).join("");
  return items || `<div class="empty">まだ志望校が登録されていません。登録すると、大学詳細や合格ライン比較とつながります。</div>`;
};

const oldRenderMyPage53 = SC.renderMyPage;
SC.renderMyPage=function(){
  oldRenderMyPage53.call(this);
  const cards=Array.from(document.querySelectorAll(".myCard"));
  const goalCard=cards.find(c=>(c.textContent||"").includes("志望校"));
  if(goalCard){
    const h=goalCard.querySelector("h3")?.outerHTML || "<h3>🎯 志望校</h3>";
    goalCard.innerHTML=h + this.renderGoalSummaryMyPage53();
  }
};

/* 5.3.1 検索条件ボタンの開閉表示修正 */
SC.updateFilterToggleLabel531=function(){
  const app=this.app ? this.app() : document;
  const buttons=Array.from(app.querySelectorAll("button"));
  const btn=buttons.find(b=>{
    const t=(b.textContent||"").trim();
    return t==="検索条件を開く" || t==="検索条件を閉じる";
  });
  if(!btn) return;
  const panelCandidates=Array.from(app.querySelectorAll("div,section"));
  const panel=panelCandidates.find(el=>{
    const text=(el.textContent||"");
    return text.includes("地域") && text.includes("種別") && text.includes("偏差値下限") && text.includes("検索更新");
  });
  if(!panel) return;
  const rect=panel.getBoundingClientRect();
  const visible=rect.height>20 && getComputedStyle(panel).display!=="none" && getComputedStyle(panel).visibility!=="hidden";
  btn.textContent=visible ? "検索条件を閉じる" : "検索条件を開く";
};

SC.patchFilterToggle531=function(){
  const app=this.app ? this.app() : document;
  const buttons=Array.from(app.querySelectorAll("button"));
  buttons.forEach(btn=>{
    const t=(btn.textContent||"").trim();
    if(t==="検索条件を開く" || t==="検索条件を閉じる"){
      if(btn.dataset.filterPatch531) return;
      btn.dataset.filterPatch531="1";
      btn.addEventListener("click",()=>setTimeout(()=>SC.updateFilterToggleLabel531(),80));
    }
  });
  setTimeout(()=>SC.updateFilterToggleLabel531(),80);
};

const oldRenderSearch531 = SC.renderSearch;
if(oldRenderSearch531){
  SC.renderSearch=function(){
    const r=oldRenderSearch531.apply(this, arguments);
    setTimeout(()=>this.patchFilterToggle531(),80);
    return r;
  };
}

const oldGo531 = SC.go.bind(SC);
SC.go=function(route,param){
  const r=oldGo531(route,param);
  setTimeout(()=>SC.patchFilterToggle531&&SC.patchFilterToggle531(),80);
  return r;
};

setTimeout(()=>SC.patchFilterToggle531&&SC.patchFilterToggle531(),300);

/* 5.3.2 データ品質基準修正 */
SC.hasNumericPoint532=function(v){
  return /\d/.test(String(v||"")) && !String(v||"").includes("要項確認") && !String(v||"").includes("公式要項");
};

SC.dataQualityScore490=function(u){
  const details=u.entranceDetails||[];
  if(!details.length){
    return {
      score:8,
      label:"基本情報のみ",
      rank:"D",
      checks:["学部別データ未登録"],
      missing:["学部・学科ページ","共通テスト科目","個別試験","配点","募集人数","倍率","合格最低点"]
    };
  }

  const checks=[];
  const missing=[];
  let score=0;

  // 1. 学部・学科ページ
  score += 12;
  checks.push("学部・学科ページあり");

  // 2. 方式・科目
  const hasMethods=details.some(d=>(d.methods||[]).length>0);
  if(hasMethods){score+=12;checks.push("入試方式あり");} else missing.push("入試方式");

  const hasCommon=details.some(d=>(d.methods||[]).some(m=>(m.commonTest?.subjects||[]).length>0));
  if(hasCommon){score+=10;checks.push("共通テスト科目あり");} else missing.push("共通テスト科目");

  const hasSecond=details.some(d=>(d.methods||[]).some(m=>(m.secondTest?.subjects||[]).length>0));
  if(hasSecond){score+=10;checks.push("個別試験科目あり");} else missing.push("個別試験科目");

  // 3. 配点
  const hasScoreCards=details.some(d=>(d.scoreCards||[]).length>0);
  if(hasScoreCards){score+=8;checks.push("配点カードあり");} else missing.push("配点カード");

  const hasNumericCommon=details.some(d=>(d.scoreCards||[]).some(c=>this.hasNumericPoint532(c.commonTotal) || (c.commonBreakdown||[]).some(r=>this.hasNumericPoint532(r[1]))));
  if(hasNumericCommon){score+=10;checks.push("共通テスト数値配点あり");} else missing.push("共通テスト数値配点");

  const hasNumericSecond=details.some(d=>(d.scoreCards||[]).some(c=>this.hasNumericPoint532(c.secondTotal) || (c.secondBreakdown||[]).some(r=>this.hasNumericPoint532(r[1]))));
  if(hasNumericSecond){score+=8;checks.push("個別試験数値配点あり");} else missing.push("個別試験数値配点");

  // 4. 募集人数
  const hasRecruitment=details.some(d=>{
    const r=d.examSummary?.recruitment||"";
    return /\d/.test(String(r)) && !String(r).includes("公式要項で確認");
  });
  if(hasRecruitment){score+=8;checks.push("募集人数あり");} else missing.push("募集人数");

  // 5. 倍率・入試結果
  const hasCompetition=details.some(d=>(d.competition?.past||[]).some(x=>/\d/.test(String(x[1])) && !String(x[1]).includes("要確認")));
  if(hasCompetition){score+=8;checks.push("倍率・入試結果あり");} else missing.push("倍率・入試結果");

  // 6. 合格ライン
  const hasPassLine=details.some(d=>d.passLine || d.resultStats || d.borderScore || (d.missingData||[]).every(x=>!String(x).includes("最低点")));
  if(hasPassLine){score+=8;checks.push("最低点・平均点・最高点あり");} else missing.push("最低点・平均点・最高点");

  // 7. 学習計画・AI
  const hasPlan=details.some(d=>(d.monthlyPlan||[]).length>0);
  if(hasPlan){score+=5;checks.push("学習計画あり");} else missing.push("学習計画");

  const hasAi=details.some(d=>(d.methods||[]).some(m=>m.aiAdvice));
  if(hasAi){score+=5;checks.push("AIアドバイスあり");} else missing.push("AIアドバイス");

  // 8. 公式リンク・確認日
  const hasOfficial=!!(u.quality?.guideUrl||u.quality?.admissionUrl) || details.some(d=>(d.dataSources||[]).length>0);
  if(hasOfficial){score+=6;checks.push("公式リンク・情報源あり");} else missing.push("公式リンク・情報源");

  const hasChecked=!!(u.quality?.lastChecked) || details.some(d=>d.lastChecked);
  if(hasChecked){score+=3;checks.push("最終確認日あり");} else missing.push("最終確認日");

  // 実データ未整備なのに高すぎるのを防ぐ上限制御
  if(!hasRecruitment || !hasCompetition || !hasPassLine){
    score=Math.min(score,72);
  }
  if(!hasNumericCommon && !hasNumericSecond){
    score=Math.min(score,55);
  }

  let label="基本整備";
  let rank="C";
  if(score>=90){label="完成に近い";rank="S";}
  else if(score>=75){label="充実";rank="A";}
  else if(score>=55){label="整備中";rank="B";}
  else if(score>=30){label="基本整備";rank="C";}
  else {label="基本情報のみ";rank="D";}

  return {score:Math.min(score,100),label,rank,checks,missing};
};

SC.renderQualityMeter490=function(u){
  const q=this.dataQualityScore490(u);
  return `<div class="qualityMeter">
    <button class="qualityCompact513" onclick="SC.toggleQuality513()">
      <span class="qLeft">
        <span class="qTitle">🛡️ データ品質：${this.esc(q.label)} <span class="qualityRank532">ランク${this.esc(q.rank)}</span></span>
        <span class="qualityMiniBar"><span style="width:${q.score}%"></span></span>
        <span class="qSub">タップで内訳・不足データを表示</span>
      </span>
      <span style="display:flex;align-items:center;gap:8px">
        <span class="qPercent">${q.score}%</span>
        <span id="qualityArrow513">▼</span>
      </span>
    </button>
    <div class="qualityDetails513" id="qualityDetails513" hidden>
      <div class="qualityChecks">
        ${q.checks.map(c=>`<span>✓ ${this.esc(c)}</span>`).join("")}
        ${(q.missing||[]).map(c=>`<span class="missingQuality532">□ ${this.esc(c)}</span>`).join("")}
      </div>
    </div>
  </div>`;
};

/* 5.4 入試結果・合格ライン表示 */
SC.renderResultStats54=function(d){
  const r=d.resultStats;
  const p=d.passLine;
  if(!r && !p){
    return `<div class="missingBox491"><strong>📊 入試結果・合格ライン</strong><br>この学科の入試結果データは、今後公式資料を確認して追加します。</div>`;
  }
  const resultHtml = r ? `<div class="resultCard54">
    <h3>📊 入試結果 ${this.esc(r.year||"")}</h3>
    <p class="small">${this.esc(r.method||"")}</p>
    <div class="resultGrid54">
      <div class="resultMini54">募集人数<strong>${this.esc(r.capacity)}名</strong></div>
      <div class="resultMini54">志願者数<strong>${this.esc(r.applicants)}名</strong></div>
      <div class="resultMini54">受験者数<strong>${this.esc(r.examTakers)}名</strong></div>
      <div class="resultMini54">合格者数<strong>${this.esc(r.passed)}名</strong></div>
      <div class="resultMini54">実質倍率<strong>${this.esc(r.effectiveRate)}倍</strong></div>
    </div>
    <div class="resultSource54">出典：<a href="${this.esc(r.sourceUrl)}" target="_blank">${this.esc(r.sourceLabel||"公式資料")}</a></div>
  </div>` : "";
  const passHtml = p ? `<div class="resultCard54">
    <h3>📈 合格ライン ${this.esc(p.year||"")}</h3>
    <p class="small">${this.esc(p.method||"")}</p>
    <div class="passLineBox54">
      <div class="passLineRow54"><span>最高点</span><span>${this.esc(p.totalScore?.max)}点</span></div>
      <div class="passLineRow54"><span>平均点</span><span>${this.esc(p.totalScore?.avg)}点</span></div>
      <div class="passLineRow54"><span>最低点</span><span>${this.esc(p.totalScore?.min)}点</span></div>
    </div>
    <p class="small">${this.esc(p.note||"")}</p>
    <div class="resultSource54">出典：<a href="${this.esc(p.sourceUrl)}" target="_blank">${this.esc(p.sourceLabel||"公式資料")}</a></div>
  </div>` : "";
  return resultHtml + passHtml;
};

const oldRenderMajorDetail54 = SC.renderMajorDetail;
SC.renderMajorDetail=function(universityName,index){
  const u=this.byName(universityName);
  if(!u) return this.go("search");
  const d=(u.entranceDetails||[])[index];
  if(!d) return this.renderDetail(universityName);
  oldRenderMajorDetail54.call(this, universityName, index);
  setTimeout(()=>{
    const wrap=document.querySelector(".detailAccordionWrap");
    if(!wrap || document.getElementById("accResult")) return;
    const first=wrap.querySelector(".detailAcc");
    const result=document.createElement("details");
    result.className="detailAcc";
    result.id="accResult";
    result.open=true;
    result.innerHTML=`<summary><span>📈 入試結果・合格ライン</span><span class="detailAccHint">最高点・平均点・最低点</span></summary><div class="detailAccBody">${this.renderResultStats54(d)}</div>`;
    if(first && first.nextSibling) wrap.insertBefore(result, first.nextSibling);
    else wrap.prepend(result);
  },30);
};

/* 5.5 先生版・生徒管理 */
SC.renderTeacherStudents55=function(){
  this.renderCompareBar(false);
  const students=this.teacherStudents||[];
  this.app().innerHTML=`<div class="card">
    <div class="teacherHero55">
      <h2>👨‍🏫 先生版・生徒管理</h2>
      <p>生徒ごとに志望校・成績・学習状況・面談メモを管理する画面です。まずは生徒一覧とカルテ管理から始めます。</p>
    </div>
    <div class="teacherQuick55">
      <button onclick="SC.renderStudentForm55()">＋ 生徒を追加</button>
      <button onclick="SC.exportBackup50 ? SC.exportBackup50() : alert('バックアップ機能を読み込めません')">💾 バックアップ</button>
    </div>
    ${students.length?`<div class="studentList55">${students.map(s=>SC.renderStudentCard55(s)).join("")}</div>`:`<div class="studentEmpty55">まだ生徒が登録されていません。「生徒を追加」から登録してください。</div>`}
  </div>`;
};

SC.renderStudentCard55=function(s){
  const goals=[s.firstGoal,s.secondGoal,s.thirdGoal].filter(Boolean);
  return `<button class="studentCard55" onclick="SC.renderStudentKarte55(${s.id})">
    <span class="name">${this.esc(s.name||"名前未登録")}</span>
    <span class="meta">${this.esc(s.grade||"学年未登録")} ／ ${this.esc(s.school||"高校未登録")} ／ ${this.esc(s.course||"")}</span>
    <span class="goals">🎯 志望校：${goals.length?goals.map(g=>this.esc(g)).join(" ／ "):"未登録"}</span>
  </button>`;
};

SC.renderStudentForm55=function(id=null){
  const s=id ? (this.teacherStudents||[]).find(x=>x.id===id) : {};
  this.app().innerHTML=`<div class="card">
    <h2>${id?"生徒情報を編集":"＋ 生徒を追加"}</h2>
    <div class="teacherForm55">
      <label>生徒名<input id="stName55" value="${this.esc(s?.name||"")}" placeholder="例：佐藤さん"></label>
      <label>学年<select id="stGrade55">
        ${["高1","高2","高3","既卒","中3","その他"].map(g=>`<option ${s?.grade===g?"selected":""}>${g}</option>`).join("")}
      </select></label>
      <label>高校名<input id="stSchool55" value="${this.esc(s?.school||"")}" placeholder="例：大府高校"></label>
      <label>コース・クラス<input id="stCourse55" value="${this.esc(s?.course||"")}" placeholder="例：理系／文系"></label>
      <label class="wide">第一志望<input id="stFirst55" value="${this.esc(s?.firstGoal||"")}" placeholder="例：名古屋市立大学 看護学専攻"></label>
      <label class="wide">第二志望<input id="stSecond55" value="${this.esc(s?.secondGoal||"")}"></label>
      <label class="wide">第三志望<input id="stThird55" value="${this.esc(s?.thirdGoal||"")}"></label>
      <label class="wide">注意事項・基本メモ<textarea id="stNote55">${this.esc(s?.note||"")}</textarea></label>
    </div>
    <div class="actions">
      <button class="btn" onclick="SC.saveStudentForm55(${id||null})">保存</button>
      <button class="btn light" onclick="SC.go('teacherStudents')">戻る</button>
    </div>
  </div>`.replace("None","null");
};

SC.saveStudentForm55=function(id=null){
  const data={
    id:id||Date.now(),
    name:document.getElementById("stName55").value.trim(),
    grade:document.getElementById("stGrade55").value,
    school:document.getElementById("stSchool55").value.trim(),
    course:document.getElementById("stCourse55").value.trim(),
    firstGoal:document.getElementById("stFirst55").value.trim(),
    secondGoal:document.getElementById("stSecond55").value.trim(),
    thirdGoal:document.getElementById("stThird55").value.trim(),
    note:document.getElementById("stNote55").value.trim(),
    memos:(this.teacherStudents.find(x=>x.id===id)?.memos)||[],
    exams:(this.teacherStudents.find(x=>x.id===id)?.exams)||[]
  };
  if(id){
    this.teacherStudents=this.teacherStudents.map(s=>s.id===id?data:s);
  }else{
    this.teacherStudents.push(data);
  }
  this.saveTeacherStudents();
  this.renderStudentKarte55(data.id);
};

SC.renderStudentKarte55=function(id){
  const s=(this.teacherStudents||[]).find(x=>x.id===id);
  if(!s) return this.go("teacherStudents");
  this.app().innerHTML=`<div class="card">
    <div class="detailTopNav">
      <button class="backBtn475" onclick="SC.go('teacherStudents')">← 生徒一覧へ</button>
    </div>
    <div class="teacherHero55">
      <h2>👤 生徒カルテ</h2>
      <p>${this.esc(s.name||"名前未登録")} ／ ${this.esc(s.grade||"")} ／ ${this.esc(s.school||"")}</p>
    </div>
    <div class="teacherQuick55">
      <button onclick="SC.renderStudentForm55(${s.id})">基本情報を編集</button>
      <button onclick="SC.renderStudentMemoForm55(${s.id})">面談メモ追加</button>
      <button onclick="SC.renderStudentExamForm55(${s.id})">成績記録追加</button>
      <button onclick="SC.deleteStudent55(${s.id})">削除</button>
    </div>
    <div class="modeNotice55">このカルテは先生版の管理用です。マイページの個人データとは別に保存されます。</div>
    <div class="karteGrid55">
      <div class="karteCard55">
        <h3>🎯 志望校</h3>
        ${[["第一志望",s.firstGoal],["第二志望",s.secondGoal],["第三志望",s.thirdGoal]].map(x=>x[1]?`<div class="goalBox"><strong>${x[0]}</strong><br>${this.esc(x[1])}</div>`:"").join("") || `<div class="studentEmpty55">志望校未登録</div>`}
      </div>
      <div class="karteCard55">
        <h3>📌 基本メモ</h3>
        ${s.note?`<p class="small">${this.esc(s.note)}</p>`:`<div class="studentEmpty55">メモはまだありません。</div>`}
      </div>
      <div class="karteCard55">
        <h3>📈 成績記録</h3>
        ${this.renderStudentExamList55(s)}
      </div>
      <div class="karteCard55">
        <h3>📝 面談メモ</h3>
        ${this.renderStudentMemoList55(s)}
      </div>
    </div>
  </div>`;
};

SC.renderStudentMemoList55=function(s){
  const memos=(s.memos||[]).slice().sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")));
  if(!memos.length) return `<div class="studentEmpty55">面談メモはまだありません。</div>`;
  return memos.map(m=>`<div class="memoItem55"><strong>${this.esc(m.date||"日付未登録")}</strong><br>${this.esc(m.text||"")}</div>`).join("");
};

SC.renderStudentExamList55=function(s){
  const exams=(s.exams||[]).slice().sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")));
  if(!exams.length) return `<div class="studentEmpty55">成績記録はまだありません。</div>`;
  return exams.map(e=>`<div class="memoItem55"><strong>${this.esc(e.date||"")} ${this.esc(e.type||"成績")}</strong><br>${this.esc(e.name||"")} ／ 合計 ${this.esc(e.total||"0")}点<br><span class="small">${["英語","数学","国語","理科","社会","情報Ⅰ"].map(k=>e[k]?`${k}:${this.esc(e[k])}`:"").filter(Boolean).join(" ／ ")}</span></div>`).join("");
};

SC.renderStudentMemoForm55=function(id){
  this.app().innerHTML=`<div class="card">
    <h2>📝 面談メモ追加</h2>
    <div class="teacherForm55">
      <label>日付<input id="memoDate55" type="date"></label>
      <label class="wide">面談メモ<textarea id="memoText55" placeholder="今日話した内容、次回までの課題、保護者共有事項など"></textarea></label>
    </div>
    <div class="actions"><button class="btn" onclick="SC.saveStudentMemo55(${id})">保存</button><button class="btn light" onclick="SC.renderStudentKarte55(${id})">戻る</button></div>
  </div>`;
};

SC.saveStudentMemo55=function(id){
  const s=this.teacherStudents.find(x=>x.id===id);
  if(!s) return this.go("teacherStudents");
  s.memos=s.memos||[];
  s.memos.push({id:Date.now(),date:document.getElementById("memoDate55").value,text:document.getElementById("memoText55").value.trim()});
  this.saveTeacherStudents();
  this.renderStudentKarte55(id);
};

SC.renderStudentExamForm55=function(id){
  const examTypes=["共通テスト模試","全統共通テスト模試","全統記述模試","駿台全国模試","進研模試","学校実力テスト","定期テスト","その他"];
  this.app().innerHTML=`<div class="card">
    <h2>📈 成績記録追加</h2>
    <div class="teacherForm55">
      <label>種類<select id="texType55">${examTypes.map(x=>`<option>${x}</option>`).join("")}</select></label>
      <label>日付<input id="texDate55" type="date"></label>
      <label class="wide">模試・テスト名<input id="texName55"></label>
      ${["英語","数学","国語","理科","社会","情報Ⅰ"].map(k=>`<label>${k}<input id="tex${k}55" type="number" inputmode="numeric" oninput="SC.calcStudentExamTotal55()"></label>`).join("")}
      <div class="wide totalAutoBox514">合計点<div><span class="totalNum" id="texTotal55">0</span> 点</div><div class="totalNote">科目別点数から自動計算されます。</div></div>
    </div>
    <div class="actions"><button class="btn" onclick="SC.saveStudentExam55(${id})">保存</button><button class="btn light" onclick="SC.renderStudentKarte55(${id})">戻る</button></div>
  </div>`;
};

SC.calcStudentExamTotal55=function(){
  const total=["英語","数学","国語","理科","社会","情報Ⅰ"].reduce((sum,k)=>{
    const v=Number(document.getElementById(`tex${k}55`)?.value||0);
    return sum+(Number.isFinite(v)?v:0);
  },0);
  const el=document.getElementById("texTotal55");
  if(el) el.textContent=total;
};

SC.saveStudentExam55=function(id){
  const s=this.teacherStudents.find(x=>x.id===id);
  if(!s) return this.go("teacherStudents");
  const e={
    id:Date.now(),
    type:document.getElementById("texType55").value,
    date:document.getElementById("texDate55").value,
    name:document.getElementById("texName55").value.trim(),
    total:document.getElementById("texTotal55").textContent
  };
  ["英語","数学","国語","理科","社会","情報Ⅰ"].forEach(k=>e[k]=document.getElementById(`tex${k}55`).value);
  s.exams=s.exams||[];
  s.exams.push(e);
  this.saveTeacherStudents();
  this.renderStudentKarte55(id);
};

SC.deleteStudent55=function(id){
  if(!confirm("この生徒を削除しますか？")) return;
  this.teacherStudents=this.teacherStudents.filter(s=>s.id!==id);
  this.saveTeacherStudents();
  this.go("teacherStudents");
};

/* 5.5 バックアップに先生版データを追加 */
const oldExportBackup55 = SC.exportBackup50;
SC.exportBackup50=function(){
  const payload={
    app:"進学コンパス",
    version:"5.5",
    exportedAt:new Date().toISOString(),
    profile:this.profile||{},
    favorites:this.favorites||[],
    compare:this.compare||[],
    students:this.students||[],
    teacherStudents:this.teacherStudents||[],
    examRecords:this.examRecords||[],
    studyLogs:this.studyLogs||[],
    mode:this.mode||"高校生"
  };
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");
  const date=new Date().toISOString().slice(0,10);
  a.href=url;
  a.download=`shingaku-compass-backup-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

const oldImportBackup55 = SC.importBackup50;
SC.importBackup50=function(file){
  if(!file) return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const data=JSON.parse(reader.result);
      this.profile=data.profile||{};
      this.favorites=data.favorites||[];
      this.compare=data.compare||[];
      this.students=data.students||[];
      this.teacherStudents=data.teacherStudents||[];
      this.examRecords=data.examRecords||[];
      this.studyLogs=data.studyLogs||[];
      this.mode=data.mode||this.mode||"高校生";
      this.saveProfile&&this.saveProfile();
      this.save&&this.save();
      this.saveStudents&&this.saveStudents();
      this.saveTeacherStudents&&this.saveTeacherStudents();
      this.saveExamRecords&&this.saveExamRecords();
      this.saveStudyLogs&&this.saveStudyLogs();
      alert("バックアップを読み込みました。");
      this.go("mypage");
    }catch(e){
      alert("読み込みに失敗しました。JSONファイルを確認してください。");
    }
  };
  reader.readAsText(file);
};

/* 5.5 メニューから先生版へ */
const oldRenderMenu55 = SC.renderMenu;
if(oldRenderMenu55){
  SC.renderMenu=function(){
    oldRenderMenu55.call(this);
    const app=this.app();
    if(app && !app.textContent.includes("先生版・生徒管理")){
      const card=document.createElement("div");
      card.className="card";
      card.innerHTML=`<h2>👨‍🏫 先生版</h2><p class="small">生徒一覧・生徒カルテを管理します。</p><div class="actions"><button class="btn" onclick="SC.go('teacherStudents')">生徒管理を開く</button></div>`;
      app.appendChild(card);
    }
  };
}

/* 6.0.1 医学科公式確認カード */
SC.renderOfficialComplete601=function(d){
  if(!d.firstStageSelection) return "";
  const f=d.firstStageSelection;
  return `<div class="officialComplete601">
    <h3>🟢 医学科 公式確認済み</h3>
    <div class="officialGrid601">
      <div class="officialMini601">方式<strong>${this.esc(f.method||"")}</strong></div>
      <div class="officialMini601">第1段階基準<strong>${this.esc(f.threshold||"")}</strong></div>
      <div class="officialMini601">対象<strong>${this.esc(f.target||"")}</strong></div>
      <div class="officialMini601">確認日<strong>${this.esc(d.lastChecked||"")}</strong></div>
    </div>
    <p class="small">${this.esc(f.note||"")}</p>
  </div>`;
};
const oldRenderMajorDetail601 = SC.renderMajorDetail;
SC.renderMajorDetail=function(universityName,index){
  const u=this.byName(universityName);
  if(!u) return this.go("search");
  const d=(u.entranceDetails||[])[index];
  if(!d) return this.renderDetail(universityName);
  oldRenderMajorDetail601.call(this, universityName, index);
  setTimeout(()=>{
    const body=document.querySelector("#accSummary .detailAccBody");
    if(body && d.firstStageSelection && !body.querySelector(".officialComplete601")){
      body.insertAdjacentHTML("afterbegin", this.renderOfficialComplete601(d));
    }
  },50);
};

/* 6.0.2 看護学専攻公式確認カード */
SC.renderNursingComplete602=function(d){
  if(!(String(d.department||"").includes("看護学専攻") || String(d.displayName||"").includes("看護学専攻"))) return "";
  return `<div class="nursingComplete602">
    <h3>🟢 看護学専攻 公式確認済み</h3>
    <div class="nursingGrid602">
      <div class="nursingMini602">一般前期<strong>60名</strong></div>
      <div class="nursingMini602">推薦B<strong>55名</strong></div>
      <div class="nursingMini602">高大接続型<strong>5名</strong></div>
      <div class="nursingMini602">2段階選抜<strong>なし</strong></div>
    </div>
    <p class="small">前期個別試験は英語・小論文・面接。共通テストは6教科7科目に修正済み。</p>
  </div>`;
};
const oldRenderMajorDetail602 = SC.renderMajorDetail;
SC.renderMajorDetail=function(universityName,index){
  const u=this.byName(universityName);
  if(!u) return this.go("search");
  const d=(u.entranceDetails||[])[index];
  if(!d) return this.renderDetail(universityName);
  oldRenderMajorDetail602.call(this, universityName, index);
  setTimeout(()=>{
    const body=document.querySelector("#accSummary .detailAccBody");
    if(body && !body.querySelector(".nursingComplete602")){
      const html=this.renderNursingComplete602(d);
      if(html) body.insertAdjacentHTML("afterbegin", html);
    }
  },60);
};

/* 6.0.3 理学療法学コース公式確認カード */
SC.renderPtComplete603=function(d){
  const text=String(d.department||"")+String(d.displayName||"");
  if(!(text.includes("理学療法学専攻") || text.includes("理学療法学コース"))) return "";
  return `<div class="ptComplete603">
    <h3>🟢 理学療法学コース 公式確認済み</h3>
    <div class="ptGrid603">
      <div class="ptMini603">一般前期<strong>20名</strong></div>
      <div class="ptMini603">志願者<strong>94名</strong></div>
      <div class="ptMini603">実質倍率<strong>3.9倍</strong></div>
      <div class="ptMini603">推薦A評定<strong>3.8以上</strong></div>
    </div>
    <p class="small">募集人数・入試結果・合格ライン・推薦A出願条件を公式資料から反映。配点詳細は未確認として残しています。</p>
  </div>`;
};
const oldRenderMajorDetail603 = SC.renderMajorDetail;
SC.renderMajorDetail=function(universityName,index){
  const u=this.byName(universityName);
  if(!u) return this.go("search");
  const d=(u.entranceDetails||[])[index];
  if(!d) return this.renderDetail(universityName);
  oldRenderMajorDetail603.call(this, universityName, index);
  setTimeout(()=>{
    const body=document.querySelector("#accSummary .detailAccBody");
    if(body && !body.querySelector(".ptComplete603")){
      const html=this.renderPtComplete603(d);
      if(html) body.insertAdjacentHTML("afterbegin", html);
    }
  },70);
};

/* 6.0.4 作業療法学コース公式確認カード */
SC.renderOtComplete604=function(d){
  const text=String(d.department||"")+String(d.displayName||"");
  if(!(text.includes("作業療法学専攻") || text.includes("作業療法学コース"))) return "";
  return `<div class="otComplete604">
    <h3>🟢 作業療法学コース 公式確認済み</h3>
    <div class="otGrid604">
      <div class="otMini604">一般前期<strong>20名</strong></div>
      <div class="otMini604">志願者<strong>66名</strong></div>
      <div class="otMini604">実質倍率<strong>2.5倍</strong></div>
      <div class="otMini604">推薦A評定<strong>3.8以上</strong></div>
    </div>
    <p class="small">募集人数・入試結果・合格ライン・推薦A出願条件を公式資料から反映。配点詳細は未確認として残しています。</p>
  </div>`;
};
const oldRenderMajorDetail604 = SC.renderMajorDetail;
SC.renderMajorDetail=function(universityName,index){
  const u=this.byName(universityName);
  if(!u) return this.go("search");
  const d=(u.entranceDetails||[])[index];
  if(!d) return this.renderDetail(universityName);
  oldRenderMajorDetail604.call(this, universityName, index);
  setTimeout(()=>{
    const body=document.querySelector("#accSummary .detailAccBody");
    if(body && !body.querySelector(".otComplete604")){
      const html=this.renderOtComplete604(d);
      if(html) body.insertAdjacentHTML("afterbegin", html);
    }
  },80);
};

/* 6.1.0 Phase1 受験科目・配点カード */
SC.renderPhase1Admission610=function(u){
  const p=u.phase1Admission;
  if(!p) return "";
  return `<div class="phase1Box610">
    <h3>📘 Phase1：受験科目・配点</h3>
    <span class="phaseStatus">${this.esc(p.status||"")}</span>
    <p class="small">${this.esc(p.coverage||"")}</p>
    ${(p.cards||[]).map(c=>`<div class="phase1Card610">
      <h4>${this.esc(c.target||"")}</h4>
      <div class="phase1Row610"><strong>共通テスト</strong>${this.esc(c.common||"")}</div>
      <div class="phase1Row610"><strong>二次・個別試験</strong>${this.esc(c.second||"")}</div>
      <div class="phase1Row610"><strong>選択ルール</strong>${this.esc(c.options||"")}</div>
      <div class="phase1Row610"><strong>確認状況</strong>${this.esc(c.status||"")}</div>
    </div>`).join("")}
    <div class="phase1Source610">出典：<a href="${this.esc(p.sourceUrl||"#")}" target="_blank">${this.esc(p.sourceLabel||"公式情報")}</a></div>
  </div>`;
};
const oldRenderDetail610 = SC.renderDetail;
SC.renderDetail=function(name){
  oldRenderDetail610.call(this,name);
  setTimeout(()=>{
    const u=this.byName(name);
    if(!u || !u.phase1Admission) return;
    const header=document.querySelector(".detailHeader, .detailPageHeader, .univHero, .card h2")?.closest(".card") || this.app();
    if(header && !document.querySelector(".phase1Box610")){
      const html=this.renderPhase1Admission610(u);
      const target=document.querySelector(".majorList, .facultyList, .detailAccordionWrap") || header;
      target.insertAdjacentHTML("beforebegin", html);
    }
  },80);
};

/* 6.1.1 立て直し：Phase1カード廃止・テンプレート固定 */
SC.renderPhase1Admission610=function(u){ return ""; };

SC.renderRebuildNotice611=function(){
  return `<div class="rebuildNotice611">
    ✅ 表示テンプレート固定済み
    <small>今後は大学ごとの新しいカードを増やさず、学部・学科詳細ページの「共通テスト配点」「個別試験」「出願条件」「学習計画」「AIアドバイス」にデータを入れていきます。</small>
  </div>`;
};

// メニューまたは大学詳細で余計なPhase1表示が出ないようにする
setTimeout(()=>{
  document.querySelectorAll(".phase1Box610").forEach(el=>el.remove());
},300);
