/* ========== testimonials, rendered from the database ==========
   The review cards used to be hardcoded in index.html. They now come from
   the portal, so adding or removing a review is a portal job.

   The markup produced here is byte for byte the structure the existing
   CSS and carousel expect (.testi > .testi-who > .testi-av + b, then the
   verified badge, .stars, .testi-text), so nothing in css/ changed.

   Two honesty rules are enforced here, not left to the person typing:

   1. The "Verified Google Review" badge is only rendered when the review
      actually came from Google (source = 'Google' in the database). A
      review the dealership collected directly gets no badge, because
      calling it a verified Google review when it is not would be false.

   2. A rating with no written review renders the same neutral line the
      site already used, rather than inventing words for the customer.

   If the database is unreachable the cards already in the page are left
   exactly as they are, so the section never collapses to empty. */
(function(){
  'use strict';

  var track=document.getElementById('testiTrack');
  if(!track||!window.SupremeData)return;

  var STAR='<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 3 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.9 21l1.2-6.8-5-4.9 6.9-1z"/></svg>';
  var TICK='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>';
  var LONG_REVIEW=170;   /* matches the length the CSS clamp starts to bite */

  function esc(s){
    return String(s==null?'':s).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function initials(name){
    var parts=String(name||'').trim().split(/\s+/).slice(0,2);
    return parts.map(function(w){return w.charAt(0);}).join('').toUpperCase()||'?';
  }

  function stars(n){
    var out='';
    for(var i=0;i<Math.max(0,Math.min(5,n));i++)out+=STAR;
    return '<div class="stars">'+out+'</div>';
  }

  function card(t){
    var avatar=t.photo
      ? '<div class="testi-av"><img src="'+esc(t.photo)+'" alt="" loading="lazy" decoding="async"></div>'
      : '<div class="testi-av">'+esc(initials(t.name))+'</div>';

    var badge=t.isGoogle
      ? '<span class="testi-verified"><span class="testi-verified-ic">'+TICK+'</span>Verified Google Review</span>'
      : '';

    var body;
    if(!t.review){
      body='<p class="testi-text testi-text--meta">'+t.rating+' star rating, no written review provided.</p>';
    }else{
      var long=t.review.length>LONG_REVIEW;
      body='<p class="testi-text">"'+esc(t.review)+'"</p>'+
           (long?'<button class="testi-readmore" type="button" aria-expanded="false">Read more</button>':'');
    }

    return '<article class="testi">'+
             '<div class="testi-who">'+avatar+'<b>'+esc(t.name)+'</b></div>'+
             badge+
             stars(t.rating)+
             body+
           '</article>';
  }

  function hideSection(){
    /* nothing to show and nothing already in the page: hide the whole
       section rather than leaving a heading above an empty strip */
    var section=document.getElementById('testimonials');
    if(section&&!track.querySelector('.testi'))section.hidden=true;
  }

  window.SupremeData.testimonials().then(function(list){
    if(!list||!list.length){hideSection();return;}
    track.innerHTML=list.map(card).join('');
    if(window.initTestimonialCarousel)window.initTestimonialCarousel();
  }).catch(function(err){
    console.error('[testimonials] '+err.message);
    hideSection();
  });
})();
