/* ========== ambient background parallax ==========
   Drifts the three .bg-orb glows at a slower-than-scroll rate so the
   shared background layer has its own sense of depth as you scroll,
   rather than feeling pinned flat behind the content. Decorative only --
   skipped entirely for prefers-reduced-motion. */
(function(){
  var orbs=Array.prototype.slice.call(document.querySelectorAll('.bg-orb'));
  if(!orbs.length)return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;

  var rates=[.06,.1,.14];
  var ticking=false;

  function update(){
    var y=window.scrollY;
    orbs.forEach(function(orb,i){
      orb.style.transform='translateY('+(y*rates[i%rates.length])+'px)';
    });
    ticking=false;
  }

  window.addEventListener('scroll',function(){
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(update);
  },{passive:true});

  update();
})();
