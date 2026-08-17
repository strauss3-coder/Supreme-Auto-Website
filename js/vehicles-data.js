/* ========== vehicle inventory data ==========
   Single source of truth for the inventory grid, the filter dropdowns,
   and the vehicle detail preview.

   This used to fetch assets/vehicles.json. It now reads the live database
   behind the Supreme Auto portal, so adding, editing, selling or deleting
   a vehicle in the portal changes this website on the next page load.
   There is no file to edit, no deploy step, and no second copy of the
   data to keep in step.

   The old note here promised that swapping in a real API would mean
   changing this one function and nothing else. That held: inventory.js,
   detail.js, contact-form.js and finance-wizard.js all still call
   getVehicles() and receive exactly the shape they always did. The
   mapping between the portal's columns (brand, fuel, body, engine) and
   this site's schema (make, fuelType, bodyType, engineSize) lives in
   js/supabase-data.js.

   financePerMonth/financeIsEstimate are still carried through but are no
   longer rendered anywhere, kept in case finance figures come back. */
/* fetched once and cached -- inventory.js, detail.js, contact-form.js and
   finance-wizard.js each call getVehicles() independently, and without
   this the same request would be made four times on every page load
   instead of once. */
var VEHICLES_PROMISE=null;
function getVehicles(){
  if(!VEHICLES_PROMISE){
    if(!window.SupremeData){
      console.error('supabase-data.js must load before vehicles-data.js');
      return Promise.resolve([]);
    }
    VEHICLES_PROMISE=window.SupremeData.vehicles().catch(function(err){
      console.error('Could not load vehicle inventory.',err);
      VEHICLES_PROMISE=null;
      return [];
    });
  }
  return VEHICLES_PROMISE;
}
