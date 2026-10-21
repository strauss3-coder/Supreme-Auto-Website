/* ========== vehicle.html: one car, one URL ==========
   Reads ?id= from the address, fetches that single vehicle and builds the
   page around it. Three jobs, in this order of importance:

     1. tell a buyer everything about the car without them having to ask
     2. give search engines a real page per vehicle, with its own title,
        description, canonical URL and schema.org Vehicle record
     3. give WhatsApp and Facebook a proper link preview, so a salesperson
        sharing a car sends a photograph and a price rather than a bare link

   Why a query string rather than a file per car: this site is served as
   static files from GitHub Pages with no build step, so there is nothing
   to generate a page when stock changes. One page that reads an id keeps
   the inventory and the URLs in step automatically. The trade off is that
   the title and description are written by this script rather than present
   in the served HTML, which Google handles but some smaller crawlers do
   not.

   A vehicle that has sold or been withdrawn is not in website_vehicles at
   all, so it arrives here as null and gets the "no longer available"
   state. That is deliberate: an old link should never show a sold car as
   though it were for sale. */
(function(){
  'use strict';

  var SITE='https://supremeautonorth.co.za/';
  var FALLBACK_IMG=SITE+'assets/images/hero-background.jpg';

  var el=function(id){return document.getElementById(id);};
  var loading=el('vpLoading'), gone=el('vpGone'), bodyEl=el('vpBody');

  function show(node){
    [loading,gone,bodyEl].forEach(function(n){ if(n) n.hidden=(n!==node); });
  }

  function money(n){
    return (n==null||!n)?'POA':'R'+Number(n).toLocaleString('en-ZA');
  }
  function km(n){
    return (n==null)?'—':Number(n).toLocaleString('en-ZA')+' km';
  }
  function text(id,value){
    var n=el(id); if(!n)return;
    n.textContent=value;
  }
  /* Show a node only when there is something to put in it, so an empty
     field leaves no orphaned heading behind. */
  function fill(id,value,holderId){
    var n=el(id), holder=holderId?el(holderId):n;
    if(!n)return false;
    var has=value!=null&&String(value).trim()!=='';
    if(has)n.textContent=value;
    if(holder)holder.hidden=!has;
    return has;
  }

  /* ---------- the document head ---------------------------------------
     Written from the record rather than hardcoded, because this one file
     stands in for every vehicle the dealership has. */
  function meta(sel,attr,value){
    var n=document.querySelector(sel);
    if(n)n.setAttribute(attr,value);
  }
  function applyHead(v,title,desc,url,image){
    document.title=title;
    meta('meta[name="description"]','content',desc);
    meta('link[rel="canonical"]','href',url);
    meta('meta[property="og:title"]','content',title);
    meta('meta[property="og:description"]','content',desc);
    meta('meta[property="og:url"]','content',url);
    meta('meta[property="og:image"]','content',image);
    meta('meta[name="twitter:title"]','content',title);
    meta('meta[name="twitter:description"]','content',desc);
    meta('meta[name="twitter:image"]','content',image);
  }

  /* schema.org. Only facts that are actually on the record go in: an
     invented mileage or a made up engine size in structured data is the
     kind of thing that gets a listing penalised, and it would be a lie
     about a real car for sale. */
  function applySchema(v,url,images){
    var node=el('vehicleSchema');
    if(!node)return;
    var vehicle={
      '@type':'Vehicle',
      name:v.title,
      url:url,
      brand:v.make?{'@type':'Brand',name:v.make}:undefined,
      model:v.model||undefined,
      vehicleConfiguration:v.variant||undefined,
      vehicleModelDate:v.year?String(v.year):undefined,
      bodyType:v.bodyType||undefined,
      vehicleTransmission:v.transmission||undefined,
      fuelType:v.fuelType||undefined,
      color:v.colour||undefined,
      numberOfDoors:v.doors||undefined,
      vehicleSeatingCapacity:v.seats||undefined,
      driveWheelConfiguration:v.drivetrain||undefined,
      itemCondition:'https://schema.org/UsedCondition',
      description:v.description||undefined,
      image:images.length?images:undefined,
      sku:v.stockNumber||undefined
    };
    if(v.mileage!=null){
      vehicle.mileageFromOdometer={'@type':'QuantitativeValue',value:v.mileage,unitCode:'KMT'};
    }
    if(v.engineSize){
      vehicle.vehicleEngine={'@type':'EngineSpecification',name:v.engineSize};
    }
    if(v.price){
      vehicle.offers={
        '@type':'Offer',
        price:v.price,
        priceCurrency:'ZAR',
        availability:v.reserved?'https://schema.org/LimitedAvailability':'https://schema.org/InStock',
        url:url,
        seller:{'@type':'AutomotiveBusiness','@id':SITE+'#business',name:'Supreme Auto'}
      };
    }

    var graph={
      '@context':'https://schema.org',
      '@graph':[vehicle,{
        '@type':'BreadcrumbList',
        itemListElement:[
          {'@type':'ListItem',position:1,name:'Home',item:SITE},
          {'@type':'ListItem',position:2,name:'Inventory',item:SITE+'#inventory'},
          {'@type':'ListItem',position:3,name:v.title}
        ]
      }]
    };
    /* JSON.stringify drops undefined values, which is why every optional
       field above is left undefined rather than set to an empty string. */
    node.textContent=JSON.stringify(graph);
  }

  /* ---------- the gallery ---------------------------------------------- */
  function gallery(images,label){
    var main=el('vpImage'), thumbs=el('vpThumbs'), count=el('vpCount'),
        ph=el('vpPh'), prev=el('vpPrev'), next=el('vpNext');
    var i=0;

    if(!images.length){
      if(main)main.remove();
      if(prev)prev.hidden=true;
      if(next)next.hidden=true;
      if(count)count.hidden=true;
      if(ph)ph.textContent='Photographs coming soon';
      return;
    }
    if(ph)ph.hidden=true;

    function render(){
      main.src=images[i];
      main.alt=label+', photograph '+(i+1)+' of '+images.length;
      if(count)count.textContent=(i+1)+' / '+images.length;
      Array.prototype.forEach.call(thumbs.children,function(t,n){
        t.classList.toggle('active',n===i);
        if(n===i)t.setAttribute('aria-current','true');
        else t.removeAttribute('aria-current');
      });
    }
    function step(by){
      i=(i+by+images.length)%images.length;
      render();
    }

    thumbs.innerHTML=images.map(function(src,n){
      return '<button type="button" role="listitem" class="vp-thumb" data-i="'+n+'" '+
             'aria-label="Show photograph '+(n+1)+'">'+
             '<img src="'+src+'" alt="" width="120" height="80" loading="lazy" onerror="this.closest(\'.vp-thumb\').remove()">'+
             '</button>';
    }).join('');

    thumbs.addEventListener('click',function(e){
      var t=e.target.closest('[data-i]');
      if(!t)return;
      i=Number(t.dataset.i);
      render();
    });
    if(prev)prev.addEventListener('click',function(){step(-1);});
    if(next)next.addEventListener('click',function(){step(1);});
    if(images.length<2){
      if(prev)prev.hidden=true;
      if(next)next.hidden=true;
    }

    /* Arrow keys, because a gallery you can only click is awkward on a
       desktop and unusable from a keyboard. */
    document.addEventListener('keydown',function(e){
      if(e.key==='ArrowLeft')step(-1);
      if(e.key==='ArrowRight')step(1);
    });

    /* Swipe on a phone, where most of this traffic comes from. */
    var x0=null;
    main.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;},{passive:true});
    main.addEventListener('touchend',function(e){
      if(x0===null)return;
      var dx=e.changedTouches[0].clientX-x0;
      if(Math.abs(dx)>42)step(dx<0?1:-1);
      x0=null;
    },{passive:true});

    render();
  }

  /* ---------- the page -------------------------------------------------- */
  function render(v){
    var title=[v.make,v.model,v.variant].filter(Boolean).join(' ').trim()||'Vehicle';
    v.title=title;
    var images=(v.images||[]).filter(Boolean);
    var url=SITE+'vehicle.html?id='+encodeURIComponent(v.id);

    text('vpCrumb',title);
    text('vpName',title);
    fill('vpHeadline',v.headline);
    fill('vpStock',v.stockNumber?('Stock '+v.stockNumber):'');

    /* price */
    text('vpNow',money(v.price));
    if(v.wasPrice){
      var w=el('vpWas'); w.textContent=money(v.wasPrice); w.hidden=false;
    }
    if(v.financePerMonth){
      var pm=el('vpPm');
      pm.textContent='Estimated from '+money(v.financePerMonth)+' per month';
      pm.hidden=false;
    }

    var badge=el('vpBadge');
    if(v.reserved&&badge){ badge.textContent='Reserved'; badge.hidden=false; }
    else if(v.featured&&badge){ badge.textContent='Featured'; badge.hidden=false; }

    /* the four figures a buyer checks first */
    var quick=[
      ['Year',v.year],
      ['Mileage',v.mileage!=null?km(v.mileage):''],
      ['Transmission',v.transmission],
      ['Fuel',v.fuelType]
    ].filter(function(r){return r[1]!=null&&String(r[1]).trim()!=='';});
    el('vpQuick').innerHTML=quick.map(function(r){
      return '<li><b>'+r[1]+'</b><span>'+r[0]+'</span></li>';
    }).join('');

    /* the full table */
    var specs=[
      ['Make',v.make],['Model',v.model],['Variant',v.variant],['Year',v.year],
      ['Mileage',v.mileage!=null?km(v.mileage):''],['Condition',v.condition],
      ['Body type',v.bodyType],['Transmission',v.transmission],['Fuel type',v.fuelType],
      ['Engine',v.engineSize],['Power',v.power?v.power+' kW':''],
      ['Drivetrain',v.drivetrain],['Doors',v.doors],['Seats',v.seats],
      ['Colour',v.colour],['Stock number',v.stockNumber]
    ].filter(function(r){return r[1]!=null&&String(r[1]).trim()!=='';});
    el('vpSpecs').innerHTML=specs.map(function(r){
      return '<div><dt>'+r[0]+'</dt><dd>'+r[1]+'</dd></div>';
    }).join('');

    fill('vpDesc',v.description,'vpDescBlock');

    var feats=(v.features||[]).filter(Boolean);
    if(feats.length){
      el('vpFeatures').innerHTML=feats.map(function(f){
        return '<li>'+f.replace(/[<>&]/g,'')+'</li>';
      }).join('');
      el('vpFeatBlock').hidden=false;
    }

    var extras=[
      ['Service history',v.serviceHistory],
      ['Warranty',v.warranty],
      ['Finance',v.financeNote],
      ['Additional notes',v.notes]
    ].filter(function(r){return r[1]&&String(r[1]).trim();});
    if(extras.length){
      el('vpExtra').innerHTML=extras.map(function(r){
        return '<div><h3>'+r[0]+'</h3><p></p></div>';
      }).join('');
      /* text, not innerHTML, so a description typed in the portal cannot
         inject markup into the public page */
      Array.prototype.forEach.call(el('vpExtra').querySelectorAll('p'),function(p,n){
        p.textContent=extras[n][1];
      });
      el('vpExtraBlock').hidden=false;
    }

    /* contact. The WhatsApp number comes from the portal settings via
       site-content.js, which sets window.SA_WHATSAPP; the number below is
       only the fallback for a first paint or a failed settings read. */
    var wa=window.SA_WHATSAPP||'27768615477';
    var msg='Hi Supreme Auto, I am interested in the '+title+
            (v.stockNumber?(' (stock '+v.stockNumber+')'):'')+
            ' listed at '+money(v.price)+'. Is it still available?';
    var waLink=el('vpWhatsApp');
    if(waLink)waLink.href='https://wa.me/'+wa+'?text='+encodeURIComponent(msg);

    gallery(images,title);

    /* head and structured data */
    var desc=[
      v.year,title,
      v.mileage!=null?('with '+km(v.mileage)):'',
      v.transmission,v.fuelType
    ].filter(Boolean).join(' ')+'. '+money(v.price)+' at Supreme Auto, Pretoria North.';
    applyHead(v,title+' · '+money(v.price)+' · Supreme Auto',
              desc.slice(0,300),url,images[0]||FALLBACK_IMG);
    applySchema(v,url,images);

    show(bodyEl);
  }

  /* ---------- start ------------------------------------------------------ */
  var id=new URLSearchParams(location.search).get('id');

  if(!id||!window.SupremeData){
    show(gone);
    return;
  }

  window.SupremeData.vehicle(id).then(function(v){
    if(!v){ show(gone); return; }
    render(v);
  }).catch(function(err){
    console.error('[vehicle-page] '+err.message);
    show(gone);
  });
})();
