
SC.toggleFavorite=function(name){this.favorites=this.favorites.includes(name)?this.favorites.filter(x=>x!==name):[...this.favorites,name];this.save();if(this.route==="favorites")this.renderFavorites();else this.renderDetail(name)};
SC.renderFavorites=function(){this.renderCompareBar(false);const list=this.favorites.map(n=>this.byName(n)).filter(Boolean);this.app().innerHTML=`<div class="card"><h2>♥ お気に入り</h2>${list.length?list.map(u=>this.uniCard(u)).join(""):`<div class="uniCard">まだ保存されていません。</div>`}</div>`};

/* 4.7.4 お気に入り並び替え対応 */
SC.renderFavorites=function(){
  this.renderCompareBar(false);
  const raw=this.favorites.map(n=>this.byName(n)).filter(Boolean);
  const list=this.sortUniversities ? this.sortUniversities(raw,55) : raw;
  this.app().innerHTML=`<div class="card"><h2>♥ お気に入り</h2>${this.sortControls ? this.sortControls() : ""}${list.length?list.map(u=>this.uniCard(u)).join(""):`<div class="uniCard">まだ保存されていません。</div>`}</div>`;
};
