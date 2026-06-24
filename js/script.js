/* ========== force fresh loads to start at the top ==========
   Browsers restore the last scroll position on reload/revisit by
   default. If someone previously scrolled down (e.g. while testing
   the Inventory section) and then reopens the bare URL with no
   #anchor, the browser can silently re-scroll them straight to that
   old position instead of the hero -- this disables that restoration
   and scrolls to top, but only when there's no real #anchor in the
   URL (so direct links like #inventory still work normally). */
if('scrollRestoration' in history)history.scrollRestoration='manual';
if(!location.hash)window.scrollTo(0,0);

/* ========== nav scroll state ========== */
var nav=document.getElementById('nav');
function onScroll(){nav.classList.toggle('scrolled',window.scrollY>30);}
window.addEventListener('scroll',onScroll,{passive:true});onScroll();

/* ========== mobile menu ========== */
var burger=document.getElementById('burger'),mm=document.getElementById('mobileMenu'),scrim=document.getElementById('scrim');
function closeMenu(){mm.classList.remove('open');scrim.classList.remove('show');}
burger.addEventListener('click',function(){mm.classList.add('open');scrim.classList.add('show');});
scrim.addEventListener('click',closeMenu);
mm.querySelectorAll('a').forEach(function(a){a.addEventListener('click',closeMenu);});
