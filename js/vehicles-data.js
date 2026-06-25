/* ========== vehicle inventory data ==========
   Single source of truth for the inventory grid, the filter dropdowns,
   and the vehicle detail preview. Backed by assets/vehicles.json, which
   is already in the schema the rest of the site expects (make, model,
   price, year, mileage, transmission, fuelType, bodyType, engineSize,
   power, images[], financePerMonth, financeIsEstimate, description,
   id, featured/tag). inventory.js and detail.js never read that file
   directly, they only ever call getVehicles() -- swapping this for a
   real API later means changing the fetch() URL below and nothing
   else.

   financePerMonth/financeIsEstimate are still in the data but no
   longer rendered anywhere (removed from both the inventory cards and
   the detail panel) -- kept in case finance figures come back later. */
/* fetched once and cached -- inventory.js, detail.js, contact-form.js and
   finance-wizard.js each call getVehicles() independently, and without
   this the same JSON file would be requested four times on every page
   load instead of once. */
var VEHICLES_PROMISE=null;
function getVehicles(){
  if(!VEHICLES_PROMISE){
    VEHICLES_PROMISE=fetch('assets/vehicles.json').then(function(res){
      if(!res.ok)throw new Error('vehicles.json request failed: '+res.status);
      return res.json();
    }).catch(function(err){
      console.error('Could not load vehicle inventory.',err);
      VEHICLES_PROMISE=null;
      return [];
    });
  }
  return VEHICLES_PROMISE;
}
