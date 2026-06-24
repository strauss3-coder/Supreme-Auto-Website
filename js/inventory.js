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
    fuel:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 3 5 14h5l-1 7 9-11h-5z"/></svg>'
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

  function vehicleCardHTML(v){
    var tag=v.tag?'<span class="tag">'+v.tag+'</span>':'';
    var fuelEngine=v.engineSize?(v.fuelType+' · '+v.engineSize):v.fuelType;
    var finance=v.financePerMonth?'<span class="fin">from<b>'+formatPrice(v.financePerMonth)+'</b>p/m</span>':'';
    return (
      '<article class="car">'+
        '<div class="car-media media"><span class="ph">'+v.make+' '+v.model+'</span>'+tag+
          '<img src="'+v.images[0]+'" alt="'+v.make+' '+v.model+'" loading="lazy" onerror="this.remove()"></div>'+
        '<div class="car-body">'+
          '<h3>'+v.make+' '+v.model+'</h3>'+
          '<div class="car-spec">'+
            '<div>'+ICONS.calendar+v.year+'</div>'+
            '<div>'+ICONS.gauge+formatKm(v.mileage)+'</div>'+
            '<div>'+ICONS.gearbox+v.transmission+'</div>'+
            '<div>'+ICONS.fuel+fuelEngine+'</div>'+
          '</div>'+
          '<div class="car-price"><span class="p">'+formatPrice(v.price)+'</span>'+finance+'</div>'+
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
      grid.innerHTML=vehicles.map(vehicleCardHTML).join('');
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
    if(vehicle&&window.renderVehicleDetail)window.renderVehicleDetail(vehicle);
  });

  getVehicles().then(function(vehicles){
    ALL_VEHICLES=vehicles;
    populateBaseFilters(ALL_VEHICLES);
    renderVehicles(ALL_VEHICLES);
  });
})();
