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

/* ========== enquiry form (preview only) ========== */
var form=document.getElementById('enquiryForm'),ok=document.getElementById('formOk');
form.addEventListener('submit',function(e){
  e.preventDefault();ok.classList.add('show');form.reset();
  setTimeout(function(){ok.classList.remove('show');},4000);
});
