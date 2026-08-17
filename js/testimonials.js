/* ========== testimonial carousel ==========
   Moves the track by exactly one card's rendered width per click/swipe,
   measured live from the DOM rather than hardcoding items-per-view --
   that way it automatically matches whatever the current CSS breakpoint
   (3-up desktop / 2-up tablet / 1-up mobile) actually renders, with no
   risk of the JS and CSS breakpoints drifting out of sync. */
/* The cards are rendered from the database by js/testimonials-render.js,
   which calls window.initTestimonialCarousel() once they are in the DOM.
   Everything below is unchanged apart from being wrapped in a function so
   it can run again after a re-render, instead of only once at load. */
window.initTestimonialCarousel=function(){
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

  /* replacing the handler rather than adding one keeps a second init from
     moving the track two cards per click */
  prevBtn.onclick=function(){index--;update();};
  nextBtn.onclick=function(){index++;update();};

  var startX=null;
  track.ontouchstart=function(e){startX=e.touches[0].clientX;};
  track.ontouchend=function(e){
    if(startX==null)return;
    var dx=e.changedTouches[0].clientX-startX;
    if(dx<-40){index++;update();}
    else if(dx>40){index--;update();}
    startX=null;
  };

  if(!window._testiResizeBound){
    window._testiResizeBound=true;
    var resizeTimer=null;
    window.addEventListener('resize',function(){
      clearTimeout(resizeTimer);
      resizeTimer=setTimeout(function(){
        if(window._testiUpdate)window._testiUpdate();
      },150);
    });
  }
  window._testiUpdate=update;

  update();

  /* "Read more" only exists in markup on reviews long enough to clamp,
     so no need to detect overflow -- just toggle the clamp and label */
  track.querySelectorAll('.testi-readmore').forEach(function(btn){
    var text=btn.previousElementSibling;
    if(!text)return;
    btn.addEventListener('click',function(){
      var expanded=text.classList.toggle('is-expanded');
      btn.textContent=expanded?'Read less':'Read more';
      btn.setAttribute('aria-expanded',String(expanded));
    });
  });
};

/* if cards are already in the DOM (or the database render has not arrived
   yet) wire up whatever is there, so the arrows are never dead */
document.addEventListener('DOMContentLoaded',function(){
  window.initTestimonialCarousel();
});
