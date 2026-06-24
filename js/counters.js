/* ========== stat counters: animate numbers upward on scroll ========== */
(function(){
  var counters=document.querySelectorAll('[data-count-to]');
  if(!counters.length)return;
  var reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCount(el){
    var target=Number(el.getAttribute('data-count-to'))||0;
    var decimals=Number(el.getAttribute('data-decimals'))||0;
    function format(n){return decimals?n.toFixed(decimals):Math.round(n).toLocaleString('en-ZA');}
    if(reduceMotion){el.textContent=format(target);return;}
    var start=null,duration=1400;
    function step(ts){
      if(!start)start=ts;
      var progress=Math.min((ts-start)/duration,1);
      var eased=1-Math.pow(1-progress,3);
      el.textContent=format(target*eased);
      if(progress<1)requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){animateCount(e.target);io.unobserve(e.target);}
    });
  },{threshold:.4});

  counters.forEach(function(el){io.observe(el);});
})();
