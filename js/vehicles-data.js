/* ========== vehicle inventory data ==========
   Single source of truth for the inventory grid, the filter dropdowns,
   and the vehicle detail preview. Backed by assets/vehicles.json --
   inventory.js and detail.js never read that file directly, they only
   ever call getVehicles(), so swapping this for a real API later means
   changing the fetch() URL below and nothing else.

   normalizeVehicle() maps the raw export's field names (title,
   fuel_type, body_type, engine_size, image_url, stock_number) onto the
   schema the rest of the site expects, and fills in gaps the source
   data is missing:
   - price/mileage/engine_size are null on ~15 of the 25 real listings
     -- these render as "POA" / "—" rather than a misleading 0.
   - financePerMonth has no real figure in the source data, so it's a
     rough estimate (price over a 60-month term, rounded to the
     nearest R100). Flag this to the client before launch -- it should
     be replaced with real finance-partner numbers.
   - image_url is null on every record (no photos in this export yet),
     so every vehicle falls back to the dealership lot photo until
     real photography is supplied. */
function normalizeVehicle(raw,index){
  var price=(raw.price==null||raw.price===0)?null:raw.price;
  return {
    id:index+1,
    stockNumber:raw.stock_number||null,
    make:raw.make,
    model:raw.model,
    price:price,
    year:raw.year,
    mileage:(raw.mileage==null)?null:raw.mileage,
    transmission:raw.transmission,
    fuelType:raw.fuel_type,
    bodyType:raw.body_type,
    engineSize:raw.engine_size?raw.engine_size+'L':null,
    power:null,
    image:raw.image_url||'assets/images/Supreme_Auto_Lot.png',
    financePerMonth:price?Math.round(price/60/100)*100:null,
    description:raw.description||'',
    featured:false
  };
}

function getVehicles(){
  return fetch('assets/vehicles.json')
    .then(function(res){return res.json();})
    .then(function(raw){return raw.map(normalizeVehicle);});
}
