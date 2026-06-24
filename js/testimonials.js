/* ========== testimonial carousel ==========
   Moves the track by exactly one card's rendered width per click/swipe,
   measured live from the DOM rather than hardcoding items-per-view --
   that way it automatically matches whatever the current CSS breakpoint
   (3-up desktop / 2-up tablet / 1-up mobile) actually renders, with no
   risk of the JS and CSS breakpoints drifting out of sync. */
(function(){
  var track=document.getElementById('testiTrack');
  var prevBtn=document.getElementById('testiPrev');
  var nextBtn=document.getElementById('testiNext');
  if(!track||!prevBtn||!nextBtn)return;

  var viewport=track.parentElement;
  var cards=Array.prototype.slice.call(track.children);
  var index=0;

  function cardStep(){
    if(!cards.length)return 0;
    var rect=cards[0].getBoundingClientRect();
    var gap=parseFloat(getComputedStyle(track).gap)||0;
    return rect.width+gap;
  }

  function maxIndex(){
    var step=cardStep();
    if(!step)return 0;
    var visible=Math.max(1,Math.round(viewport.clientWidth/step));
    return Math.max(0,cards.length-visible);
  }

  function update(){
    var max=maxIndex();
    if(index>max)index=max;
    if(index<0)index=0;
    track.style.transform='translateX(-'+(index*cardStep())+'px)';
    prevBtn.disabled=index<=0;
    nextBtn.disabled=index>=max;
  }

  prevBtn.addEventListener('click',function(){index--;update();});
  nextBtn.addEventListener('click',function(){index++;update();});

  var startX=null;
  track.addEventListener('touchstart',function(e){startX=e.touches[0].clientX;},{passive:true});
  track.addEventListener('touchend',function(e){
    if(startX==null)return;
    var dx=e.changedTouches[0].clientX-startX;
    if(dx<-40){index++;update();}
    else if(dx>40){index--;update();}
    startX=null;
  });

  var resizeTimer=null;
  window.addEventListener('resize',function(){
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(update,150);
  });

  update();
})();
