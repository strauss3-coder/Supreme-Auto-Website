/* ========== site content from the database ==========
   Contact details, opening hours, social links, the WhatsApp number and
   the hero copy all come from the portal's site_settings table. Change
   the phone number in the portal and it changes in the header, the
   contact card, every WhatsApp button and the enquiry handoff at once.

   How the elements are found: each one carries a data-sa attribute in
   index.html rather than being located by a CSS class or position. That
   way a design change to the markup cannot silently break the binding,
   and an element without the attribute is simply left alone.

   Nothing here invents content. If a value is missing from the database
   the markup already in the page stays exactly as it is, so a failed
   request or an empty field can never blank out the contact section. */
(function(){
  'use strict';
  if(!window.SupremeData)return;

  function set(sel,fn){
    Array.prototype.forEach.call(document.querySelectorAll(sel),fn);
  }
  function digits(s){return String(s||'').replace(/[^0-9]/g,'');}

  /* South African numbers: 0768615477 -> 27768615477 for wa.me links */
  function waNumber(raw){
    var d=digits(raw);
    if(!d)return '';
    if(d.indexOf('27')===0)return d;
    if(d.charAt(0)==='0')return '27'+d.slice(1);
    return d;
  }
  function telHref(raw){
    var d=digits(raw);
    if(!d)return '';
    return d.indexOf('27')===0 ? '+'+d : (d.charAt(0)==='0' ? '+27'+d.slice(1) : '+'+d);
  }

  window.SupremeData.settings().then(function(s){
    var contact=s.contact||{};
    var home=s.homepage||{};

    /* ---------- phone ---------- */
    if(contact.phone){
      set('[data-sa="phone"]',function(el){
        el.textContent=contact.phone;
        if(el.tagName==='A')el.setAttribute('href','tel:'+telHref(contact.phone));
      });
    }

    /* ---------- email ---------- */
    if(contact.email){
      set('[data-sa="email"]',function(el){
        el.textContent=contact.email;
        if(el.tagName==='A')el.setAttribute('href','mailto:'+contact.email);
      });
    }

    /* ---------- address ---------- */
    if(contact.address){
      set('[data-sa="address"]',function(el){el.textContent=contact.address;});
    }
    if(contact.mapsUrl){
      set('[data-sa="maps"]',function(el){el.setAttribute('href',contact.mapsUrl);});
    }

    /* ---------- WhatsApp, every link and the form handoff ---------- */
    var wa=waNumber(contact.whatsapp);
    if(wa){
      window.SA_WHATSAPP=wa;
      set('a[href*="wa.me"]',function(a){
        var href=a.getAttribute('href')||'';
        a.setAttribute('href',href.replace(/wa\.me\/\d+/,'wa.me/'+wa));
      });
    }

    /* ---------- opening hours ---------- */
    if(Array.isArray(contact.hours)&&contact.hours.length){
      set('[data-sa="hours"]',function(box){
        box.innerHTML=contact.hours.map(function(h){
          var when=h.closed?'Closed':(h.open+' to '+h.close);
          return '<div><span>'+h.day+'</span><span>'+when+'</span></div>';
        }).join('');
      });
    }

    /* ---------- social links, hidden when the field is empty ---------- */
    var social=contact.social||{};
    ['facebook','instagram','tiktok','youtube','x'].forEach(function(k){
      set('[data-sa="social-'+k+'"]',function(a){
        if(social[k]){
          a.setAttribute('href',social[k]);
          a.hidden=false;
        }else{
          a.hidden=true;      /* no link, no dead icon */
        }
      });
    });

    /* ---------- hero copy ----------
       The heading is three styled lines, the last one accented. The
       portal stores one string, so it is split back into at most three
       lines on sentence boundaries. If it does not split into two or
       three parts the existing markup is left alone rather than
       flattening a designed heading into a single line. */
    if(home.heroTitle){
      set('[data-sa="hero-title"]',function(h1){
        var parts=String(home.heroTitle).split(/(?<=\.)\s+/).filter(Boolean);
        if(parts.length<2||parts.length>3)return;
        h1.innerHTML=parts.map(function(line,i){
          var cls=(i===parts.length-1)?'line line-accent':'line';
          return '<span class="'+cls+'">'+line.trim()+'</span>';
        }).join('');
      });
    }
    if(home.heroSubtitle){
      set('[data-sa="hero-sub"]',function(el){el.textContent=home.heroSubtitle;});
    }
    if(home.btn1Text){
      set('[data-sa="hero-btn1"]',function(a){
        var svg=a.querySelector('svg');
        a.textContent=home.btn1Text;
        if(svg)a.appendChild(svg);
        if(home.btn1Link)a.setAttribute('href',home.btn1Link);
      });
    }
    if(home.btn2Text){
      set('[data-sa="hero-btn2"]',function(a){
        a.textContent=home.btn2Text;
        if(home.btn2Link)a.setAttribute('href',home.btn2Link);
      });
    }

    /* ---------- headline statistics ----------
       The portal stores these as text such as "5000+" or "4.9". The
       counter animation needs a number, and the suffix has to survive,
       so the two are separated here. Counters are only updated when the
       portal actually holds a value for that label, so an empty portal
       field can never turn a published figure into zero. */
    if(Array.isArray(home.stats)){
      set('[data-sa-stat]',function(el){
        var label=el.getAttribute('data-sa-stat');
        var match=home.stats.filter(function(st){
          return String(st.label||'').toLowerCase()===label.toLowerCase();
        })[0];
        if(!match||!match.value)return;
        var num=String(match.value).match(/[\d.]+/);
        if(!num)return;
        var counter=el.querySelector('[data-count-to]');
        if(!counter)return;
        counter.setAttribute('data-count-to',num[0]);
        if(num[0].indexOf('.')>-1)counter.setAttribute('data-decimals','1');
        var suffix=String(match.value).replace(/[\d.]/g,'').trim();
        var holder=el.querySelector('[data-sa-stat-suffix]');
        if(holder)holder.textContent=suffix;
      });
    }
  }).catch(function(err){
    console.error('[site-content] '+err.message);
  });
})();
