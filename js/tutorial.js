
SC.tutorialIndex=0;
SC.tutorialPages=[["💭","夢・好きから探せます","興味や将来のイメージから大学を探せます。"],["📈","可能性診断","偏差値からチャレンジ校・実力相応校・安全校を確認できます。"],["🤖","AI進路診断","学力・興味・地域を総合しておすすめ大学を提案します。"],["🛡️","公式確認データ","確認した大学だけを情報確認済みとして扱います。"]];
SC.showTutorial=function(force=false){if(!force&&localStorage.getItem("sc_tutorial_done"))return;this.tutorialIndex=0;document.getElementById("tutorial").classList.add("on");this.renderTutorial()};
SC.renderTutorial=function(){const p=this.tutorialPages[this.tutorialIndex];document.getElementById("tutorialBody").innerHTML=`<div style="text-align:center"><div style="font-size:54px">${p[0]}</div><h2>${p[1]}</h2><p class="small">${p[2]}</p><p class="small">${this.tutorialIndex+1} / ${this.tutorialPages.length}</p></div>`};
SC.tutorialNext=function(){if(this.tutorialIndex>=this.tutorialPages.length-1){localStorage.setItem("sc_tutorial_done","1");document.getElementById("tutorial").classList.remove("on");return}this.tutorialIndex++;this.renderTutorial()};
SC.tutorialPrev=function(){this.tutorialIndex=Math.max(0,this.tutorialIndex-1);this.renderTutorial()};
