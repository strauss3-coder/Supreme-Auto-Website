/* ========== inventory: render, filter, dynamic dropdowns ==========
   Data comes from getVehicles() in vehicles-data.js -- this file never
   touches the VEHICLES array directly, so swapping that source for a
   fetch() call later requires no changes here. */
(function(){
  var grid=document.getElementById('inventoryGrid');
  var emptyState=document.getElementById('inventoryEmpty');
  var form=document.getElementById('filterForm');
  if(!grid||!form)return;

  var makeSelect=document.getElementById('filterMake');
  var modelSelect=document.getElementById('filterModel');
  var priceSelect=document.getElementById('filterPrice');
  var yearSelect=document.getElementById('filterYear');
  var bodySelect=document.getElementById('filterBody');
  var transSelect=document.getElementById('filterTransmission');
  var fuelSelect=document.getElementById('filterFuel');
  var clearBtns=document.querySelectorAll('[data-clear-filters]');

  var PRICE_BUCKETS={
    'Under R200k':[0,200000],
    'R200k–R350k':[200000,350000],
    'R350k–R500k':[350000,500000]
  };

  var ICONS={
    calendar:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v4M16 2v4"/></svg>',
    gauge:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 12 8 8"/></svg>',
    gearbox:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3v18M18 3v18M6 12h12"/></svg>',
    fuel:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 3 5 14h5l-1 7 9-11h-5z"/></svg>',
    camera:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="14" r="3.5"/></svg>',
    chevronLeft:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 5l-7 7 7 7"/></svg>',
    chevronRight:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M9 5l7 7-7 7"/></svg>'
  };

  var ALL_VEHICLES=[];

  function fillSelect(select,values){
    var current=select.value;
    var defaultOption=select.options[0];
    select.innerHTML='';
    select.appendChild(defaultOption);
    values.forEach(function(v){
      var opt=document.createElement('option');
      opt.textContent=v;
      select.appendChild(opt);
    });
    if(values.indexOf(current)!==-1)select.value=current;
  }

  function uniqueSorted(arr){
    return arr.filter(function(v,i){return arr.indexOf(v)===i;}).sort();
  }

  function populateBaseFilters(vehicles){
    fillSelect(makeSelect,uniqueSorted(vehicles.map(function(v){return v.make;})));
    fillSelect(yearSelect,uniqueSorted(vehicles.map(function(v){return v.year;})).sort(function(a,b){return b-a;}));
    fillSelect(bodySelect,uniqueSorted(vehicles.map(function(v){return v.bodyType;})));
    fillSelect(transSelect,uniqueSorted(vehicles.map(function(v){return v.transmission;})));
    fillSelect(fuelSelect,uniqueSorted(vehicles.map(function(v){return v.fuelType;})));
    updateModelOptions();
  }

  function updateModelOptions(){
    var make=makeSelect.value;
    var isAny=make.indexOf('Any')===0;
    var pool=isAny?ALL_VEHICLES:ALL_VEHICLES.filter(function(v){return v.make===make;});
    fillSelect(modelSelect,uniqueSorted(pool.map(function(v){return v.model;})));
  }

  function formatPrice(n){return n==null?'POA':'R'+n.toLocaleString('en-ZA');}
  function formatKm(n){return n==null?'—':n.toLocaleString('en-ZA')+' km';}

  /* ---------- card image carousel ----------
     Reuses v.images straight from vehicles.json -- no separate data
     structure. Slide 0 gets a real src (matches the previous
     single-image behaviour exactly); slides 1+ only carry data-src
     until ensureLoaded() actually needs them, so browsing the grid
     without ever touching a carousel costs the same one request per
     card it always did. */
  function carouselHTML(v){
    var images=v.images||[];
    var label=v.make+' '+v.model;
    if(images.length<=1){
      return '<img src="'+(images[0]||'')+'" alt="'+label+'" width="320" height="220" loading="lazy" onerror="this.remove()">';
    }
    var slides=images.map(function(src,i){
      var attr=i===0?'src="'+src+'"':'data-src="'+src+'"';
      return '<div class="car-slide" data-i="'+i+'"><img '+attr+' alt="'+label+' photo '+(i+1)+'" width="320" height="220" loading="lazy" onerror="this.remove()"></div>';
    }).join('');
    var dots=images.map(function(_,i){
      return '<button type="button" class="car-dot'+(i===0?' is-active':'')+'" data-i="'+i+'" aria-label="Photo '+(i+1)+' of '+images.length+'"'+(i===0?' aria-current="true"':'')+'></button>';
    }).join('');
    return (
      '<div class="car-track" style="--idx:0">'+slides+'</div>'+
      '<button type="button" class="car-nav car-nav--prev" aria-label="Previous photo">'+ICONS.chevronLeft+'</button>'+
      '<button type="button" class="car-nav car-nav--next" aria-label="Next photo">'+ICONS.chevronRight+'</button>'+
      '<div class="car-dots">'+dots+'</div>'+
      '<span class="car-photo-badge">'+ICONS.camera+images.length+' Photos</span>'
    );
  }

  function slideCount(media){return media.querySelectorAll('.car-slide').length;}

  function ensureLoaded(media,idx){
    var total=slideCount(media);
    [idx-1,idx,idx+1].forEach(function(i){
      var slide=media.querySelector('.car-slide[data-i="'+(((i%total)+total)%total)+'"]');
      var img=slide&&slide.querySelector('img[data-src]');
      if(img){img.src=img.getAttribute('data-src');img.removeAttribute('data-src');}
    });
  }

  function goToSlide(media,idx){
    var total=slideCount(media);
    if(!total)return;
    idx=((idx%total)+total)%total;
    media.setAttribute('data-idx',idx);
    media.querySelector('.car-track').style.setProperty('--idx',idx);
    media.querySelectorAll('.car-dot').forEach(function(dot,i){
      var active=i===idx;
      dot.classList.toggle('is-active',active);
      if(active)dot.setAttribute('aria-current','true');
      else dot.removeAttribute('aria-current');
    });
    ensureLoaded(media,idx);
  }

  function vehicleCardHTML(v,index){
    var tag=v.tag?'<span class="tag">'+v.tag+'</span>':'';
    var fuelEngine=v.engineSize?(v.fuelType+' · '+v.engineSize):v.fuelType;
    var delay=index%4;
    var delayAttr=delay?' data-delay="'+delay+'"':'';
    return (
      '<article class="car reveal"'+delayAttr+'>'+
        '<div class="car-media media" data-idx="0"><span class="ph">'+v.make+' '+v.model+'</span>'+tag+
          carouselHTML(v)+'</div>'+
        '<div class="car-body">'+
          '<h3>'+v.make+' '+v.model+'</h3>'+
          '<div class="car-spec">'+
            '<div>'+ICONS.calendar+v.year+'</div>'+
            '<div>'+ICONS.gauge+formatKm(v.mileage)+'</div>'+
            '<div>'+ICONS.gearbox+v.transmission+'</div>'+
            '<div>'+ICONS.fuel+fuelEngine+'</div>'+
          '</div>'+
          '<div class="car-price"><span class="p">'+formatPrice(v.price)+'</span></div>'+
          '<a href="#detail" class="btn btn-ghost" data-vehicle-id="'+v.id+'">View Details</a>'+
        '</div>'+
      '</article>'
    );
  }

  function renderVehicles(vehicles){
    if(vehicles.length===0){
      grid.innerHTML='';
      grid.hidden=true;
      emptyState.hidden=false;
    }else{
      emptyState.hidden=true;
      grid.hidden=false;
      grid.innerHTML=vehicles.map(function(v,i){return vehicleCardHTML(v,i);}).join('');
      if(window.refreshReveals)window.refreshReveals();
      /* pre-load just the next slide on every card so the first arrow
         click/swipe is instant, without downloading all 5 images per
         card up front (ensureLoaded(media,0) would also wrap around
         and pre-load the *last* slide, which isn't wanted here) */
      grid.querySelectorAll('.car-media').forEach(function(media){
        var second=media.querySelector('.car-slide[data-i="1"] img[data-src]');
        if(second){second.src=second.getAttribute('data-src');second.removeAttribute('data-src');}
      });
    }
  }

  function renderWithFade(vehicles){
    grid.classList.add('is-fading');
    emptyState.classList.add('is-fading');
    setTimeout(function(){
      renderVehicles(vehicles);
      /* double rAF: forces a paint of the opacity:0 state before removing
         it, otherwise the browser can batch both changes into one frame
         and skip the fade-in entirely */
      requestAnimationFrame(function(){
        requestAnimationFrame(function(){
          grid.classList.remove('is-fading');
          emptyState.classList.remove('is-fading');
        });
      });
    },180);
  }

  function matchesPrice(price,bucketLabel){
    if(bucketLabel.indexOf('Any')===0)return true;
    /* a POA (null) price must only match "Any price" -- relational
       operators coerce null to 0, so without this check a POA vehicle
       would wrongly satisfy "Under R200k" */
    if(price==null)return false;
    var range=PRICE_BUCKETS[bucketLabel];
    if(!range)return true;
    return price>=range[0]&&price<=range[1];
  }

  function getFilteredVehicles(){
    var make=makeSelect.value,model=modelSelect.value,price=priceSelect.value,
      year=yearSelect.value,body=bodySelect.value,trans=transSelect.value,fuel=fuelSelect.value;

    return ALL_VEHICLES.filter(function(v){
      if(make.indexOf('Any')!==0&&v.make!==make)return false;
      if(model.indexOf('Any')!==0&&v.model!==model)return false;
      if(!matchesPrice(v.price,price))return false;
      if(year.indexOf('Any')!==0&&v.year<Number(year))return false;
      if(body.indexOf('Any')!==0&&v.bodyType!==body)return false;
      if(trans.indexOf('Any')!==0&&v.transmission!==trans)return false;
      if(fuel.indexOf('Any')!==0&&v.fuelType!==fuel)return false;
      return true;
    });
  }

  function clearFilters(){
    [makeSelect,priceSelect,yearSelect,bodySelect,transSelect,fuelSelect].forEach(function(s){
      s.selectedIndex=0;
    });
    updateModelOptions();
    renderWithFade(ALL_VEHICLES);
  }

  makeSelect.addEventListener('change',updateModelOptions);

  form.addEventListener('submit',function(e){
    e.preventDefault();
    renderWithFade(getFilteredVehicles());
  });

  clearBtns.forEach(function(btn){
    btn.addEventListener('click',clearFilters);
  });

  /* event delegation on the grid container -- survives re-renders from
     filtering, since the listener lives on the static parent, not on
     the dynamically-replaced cards themselves */
  grid.addEventListener('click',function(e){
    var link=e.target.closest('[data-vehicle-id]');
    if(!link)return;
    var vehicle=ALL_VEHICLES.filter(function(v){
      return v.id===Number(link.getAttribute('data-vehicle-id'));
    })[0];
    if(!vehicle||!window.renderVehicleDetail)return;
    var media=link.closest('.car').querySelector('.car-media');
    var startIndex=media?Number(media.getAttribute('data-idx'))||0:0;
    window.renderVehicleDetail(vehicle,startIndex);
  });

  /* ---------- card carousel: nav arrows + dots + swipe ----------
     One delegated listener set, same pattern as the View Details
     handler above -- works for every card already in the grid and
     every card a future re-render adds, with nothing to re-bind. */
  grid.addEventListener('click',function(e){
    var next=e.target.closest('.car-nav--next');
    var prev=e.target.closest('.car-nav--prev');
    var dot=e.target.closest('.car-dot');
    if(!next&&!prev&&!dot)return;
    var media=e.target.closest('.car-media');
    if(!media)return;
    var idx=Number(media.getAttribute('data-idx'))||0;
    if(next)idx+=1;
    else if(prev)idx-=1;
    else idx=Number(dot.getAttribute('data-i'));
    goToSlide(media,idx);
  });

  var swipeStartX=null,swipeMedia=null;
  grid.addEventListener('touchstart',function(e){
    swipeMedia=e.target.closest('.car-media');
    swipeStartX=swipeMedia?e.touches[0].clientX:null;
  },{passive:true});
  grid.addEventListener('touchend',function(e){
    if(swipeStartX==null||!swipeMedia)return;
    var dx=e.changedTouches[0].clientX-swipeStartX;
    var idx=Number(swipeMedia.getAttribute('data-idx'))||0;
    if(dx<-40)goToSlide(swipeMedia,idx+1);
    else if(dx>40)goToSlide(swipeMedia,idx-1);
    swipeStartX=null;swipeMedia=null;
  });

  getVehicles().then(function(vehicles){
    ALL_VEHICLES=vehicles;
    populateBaseFilters(ALL_VEHICLES);
    renderVehicles(ALL_VEHICLES);
  });
})();
