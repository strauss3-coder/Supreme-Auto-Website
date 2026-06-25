/* ========== reveal on scroll ==========
   observe() is a no-op on an already-observed element, so calling
   window.refreshReveals() after re-rendering dynamic content (e.g.
   inventory.js re-filtering) is safe to do liberally -- it just picks
   up any newly-inserted .reveal nodes without double-handling old ones. */
var io=new IntersectionObserver(function(entries){
  entries.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});
},{threshold:.12,rootMargin:'0px 0px -40px 0px'});
window.refreshReveals=function(){
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});
};
window.refreshReveals();
