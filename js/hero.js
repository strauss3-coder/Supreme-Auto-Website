/* ========== hero parallax + scroll indicator ========== */
(function(){
  var hero=document.querySelector('.hero');
  if(!hero)return;
  var media=hero.querySelector('.hero-media');
  var content=hero.querySelector('.hero-content');
  var scrollCue=document.getElementById('heroScroll');
  var reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cueHidden=false,ticking=false;

  function update(){
    var y=window.scrollY,vh=window.innerHeight||1,progress=Math.min(y/vh,1);

    if(!reduceMotion&&media)media.style.transform='translateY('+(y*0.22)+'px)';
    if(content){
      if(!reduceMotion)content.style.transform='translateY('+(y*0.12)+'px)';
      content.style.opacity=String(Math.max(0,1-progress*1.15));
    }
    if(scrollCue){
      if(y>40&&!cueHidden){scrollCue.classList.add('is-hidden');cueHidden=true;}
      else if(y<=40&&cueHidden){scrollCue.classList.remove('is-hidden');cueHidden=false;}
    }
    ticking=false;
  }

  window.addEventListener('scroll',function(){
    if(!ticking){requestAnimationFrame(update);ticking=true;}
  },{passive:true});

  update();
})();
