/* ========== force fresh loads to start at the top ==========
   Root cause: css/style.css sets html{scroll-behavior:smooth}, which
   causes window.scrollTo(0,0) to animate instead of snap -- the smooth
   animation loses a race with the browser's own scroll restoration and
   gets cancelled, leaving the page mid-scroll. Fix: always pass
   behavior:'instant' (overrides the CSS smooth for programmatic calls)
   and repeat on the load event to cover the late-restore race. The hash
   guard is kept so direct anchor links (#inventory etc.) still work. */
if('scrollRestoration' in history)history.scrollRestoration='manual';
if(!location.hash)window.scrollTo({top:0,left:0,behavior:'instant'});
window.addEventListener('load',function(){
  if(!location.hash)window.scrollTo({top:0,left:0,behavior:'instant'});
});

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

/* ========== shared: open a URL in a new tab safely ==========
   window.open(url,'_blank','noopener,noreferrer') leaves a blank
   about:blank tab behind on several browsers -- passing noopener/
   noreferrer as window-feature tokens (rather than as a real anchor's
   rel attribute) is non-standard and not reliably handled. Clicking a
   real <a target="_blank" rel="noopener noreferrer"> doesn't have that
   quirk. Shared by contact-form.js and vehicle-whatsapp.js so the
   technique only lives in one place. Loaded first (script.js is the
   first script tag) so it's available to every file after it. */
window.openInNewTab=function(url){
  var a=document.createElement('a');
  a.href=url;
  a.target='_blank';
  a.rel='noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};
