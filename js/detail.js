/* ========== vehicle detail preview: renders the selected vehicle ==========
   Exposes window.renderVehicleDetail(vehicle), called by inventory.js
   when a "View Details" card link is clicked. Shows the featured (or
   first) vehicle by default so the section is never empty. */
(function(){
  var img=document.getElementById('detailImage');
  var name=document.getElementById('detailName');
  var price=document.getElementById('detailPrice');
  var financeRow=document.getElementById('detailFinanceRow');
  var finance=document.getElementById('detailFinance');
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

  window.renderVehicleDetail=function(v){
    img.src=v.image;
    img.alt=v.make+' '+v.model;
    name.textContent=v.make+' '+v.model;
    price.textContent=formatPrice(v.price);
    if(v.financePerMonth){
      finance.textContent=formatPrice(v.financePerMonth);
      financeRow.hidden=false;
    }else{
      financeRow.hidden=true;
    }
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
