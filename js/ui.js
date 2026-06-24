/* ========== gallery thumb swap ========== */
var main=document.getElementById('galleryMain');
document.querySelectorAll('.gallery-thumbs .media').forEach(function(t){
  t.addEventListener('click',function(){
    var src=t.getAttribute('data-src');if(!src||!main)return;
    main.src=src;main.style.display='';
    document.querySelectorAll('.gallery-thumbs .media').forEach(function(x){x.classList.remove('active');});
    t.classList.add('active');
  });
});
