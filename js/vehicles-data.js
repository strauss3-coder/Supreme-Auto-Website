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

   financePerMonth is a real dealer figure only where financeIsEstimate
   is false; everywhere else it's a rough price/60-month estimate and
   must be replaced with real finance-partner numbers before launch. */
function getVehicles(){
  return fetch('assets/vehicles.json').then(function(res){return res.json();});
}
