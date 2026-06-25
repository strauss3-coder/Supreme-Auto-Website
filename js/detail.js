/* ========== vehicle detail preview: renders the selected vehicle ==========
   Exposes window.renderVehicleDetail(vehicle), called by inventory.js
   when a "View Details" card link is clicked. Shows the featured (or
   first) vehicle by default so the section is never empty. Renders a
   thumbnail per photo in vehicle.images -- clicking one swaps the main
   image, same gallery interaction the static mockup used to have, but
   now driven by each vehicle's real photo set instead of a fixed list.

   Also exposes window.getCurrentVehicle() so other features (the
   WhatsApp enquiry modal) can read whichever vehicle is currently on
   screen without re-fetching or duplicating vehicles.json data. */
(function(){
  var currentVehicle=null;
  window.getCurrentVehicle=function(){return currentVehicle;};

  var img=document.getElementById('detailImage');
  var thumbs=document.getElementById('galleryThumbs');
  var name=document.getElementById('detailName');
  var price=document.getElementById('detailPrice');
  var year=document.getElementById('detailYear');
  var mileage=document.getElementById('detailMileage');
  var transmission=document.getElementById('detailTransmission');
  var fuel=document.getElementById('detailFuel');
  var engine=document.getElementById('detailEngine');
  var power=document.getElementById('detailPower');
  var description=document.getElementById('detailDescription');
  if(!img||!name)return;

  function formatPrice(n){return n==null?'POA':'R'+n.toLocaleString('en-ZA');}
  function formatKm(n){return n==null?'—':n.toLocaleString('en-ZA')+' km';}

  function renderThumbs(images,label){
    if(!thumbs)return;
    thumbs.innerHTML=images.map(function(src,i){
      return '<div class="media'+(i===0?' active':'')+'" data-src="'+src+'">'+
        '<span class="ph">'+(i+1)+'</span><img src="'+src+'" alt="'+label+' photo '+(i+1)+'" loading="lazy" onerror="this.remove()"></div>';
    }).join('');
  }

  if(thumbs){
    thumbs.addEventListener('click',function(e){
      var tile=e.target.closest('[data-src]');
      if(!tile)return;
      img.src=tile.getAttribute('data-src');
      thumbs.querySelectorAll('.media').forEach(function(t){t.classList.remove('active');});
      tile.classList.add('active');
    });
  }

  window.renderVehicleDetail=function(v){
    currentVehicle=v;
    var label=v.make+' '+v.model;
    img.src=v.images[0];
    img.alt=label;
    renderThumbs(v.images,label);
    name.textContent=label;
    price.textContent=formatPrice(v.price);
    year.textContent=v.year;
    mileage.textContent=formatKm(v.mileage);
    transmission.textContent=v.transmission;
    fuel.textContent=v.fuelType;
    engine.textContent=v.engineSize||'—';
    power.textContent=v.power?v.power+' kW':'—';
    description.textContent=v.description||'No further details available for this vehicle yet -- contact us and we\'ll fill you in.';
  };

  getVehicles().then(function(vehicles){
    var initial=vehicles.filter(function(v){return v.featured;})[0]||vehicles[0];
    if(initial)window.renderVehicleDetail(initial);
  });
})();
