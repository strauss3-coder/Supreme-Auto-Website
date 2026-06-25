/* ========== cursor-aware card spotlight ==========
   A soft radial highlight that tracks the pointer inside any card in
   GLOW_SELECTOR (see card::before in components.css). One delegated
   listener on document, not one per card, so it automatically covers
   inventory cards re-rendered by inventory.js with no extra wiring.
   Skipped on touch-only devices (no meaningful "hover position" there)
   and under prefers-reduced-motion. */
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  if(window.matchMedia('(hover: none)').matches)return;

  var GLOW_SELECTOR='.svc,.partner-card,.ci,.location-item,.fstep,'+
    '.trust-bar-item,.stat,.testi,.trust-card,.car,.vw-vehicle-card';

  document.addEventListener('pointermove',function(e){
    var card=e.target.closest(GLOW_SELECTOR);
    if(!card)return;
    var rect=card.getBoundingClientRect();
    card.style.setProperty('--mx',((e.clientX-rect.left)/rect.width*100)+'%');
    card.style.setProperty('--my',((e.clientY-rect.top)/rect.height*100)+'%');
  },{passive:true});
})();
