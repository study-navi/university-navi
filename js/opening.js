
SC.skipOpening=function(){const op=document.getElementById("opening");if(op)op.classList.add("off");setTimeout(()=>{if(op)op.style.display="none"},650)};
SC.startOpening=function(){const seen=localStorage.getItem("sc_opening_seen");const op=document.getElementById("opening");if(!op)return;if(seen){setTimeout(()=>SC.skipOpening(),900)}else{setTimeout(()=>{localStorage.setItem("sc_opening_seen","1");SC.skipOpening();SC.showTutorial(false)},3300)}};
