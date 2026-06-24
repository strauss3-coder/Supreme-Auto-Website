/* ========== vehicle inventory data ==========
   Single source of truth for the inventory grid and all filter dropdowns.
   To move this to a real backend later: delete the VEHICLES array below
   and change getVehicles() to `return fetch('vehicles.json').then(r=>r.json());`
   -- inventory.js only ever calls getVehicles(), so nothing else changes. */
const VEHICLES = [
  {id:1,make:'BMW',model:'320d',price:489000,year:2020,mileage:45000,transmission:'Automatic',fuelType:'Diesel',bodyType:'Sedan',engineSize:'2.0L',image:'assets/images/Bmw_320d.png',financePerMonth:8400,featured:true,tag:'Featured'},
  {id:2,make:'Audi',model:'A3 S-Line',price:459000,year:2021,mileage:32000,transmission:'Automatic',fuelType:'Petrol',bodyType:'Hatchback',engineSize:'1.4L',image:'assets/images/Audi_A3_Sline_Pretorai_North.png',financePerMonth:7900},
  {id:3,make:'Mini',model:'Cooper S',price:399000,year:2020,mileage:38200,transmission:'Automatic',fuelType:'Petrol',bodyType:'Hatchback',engineSize:'2.0L',image:'assets/images/Mini_Cooper_S_Pretoria_North.png',financePerMonth:6900},
  {id:4,make:'Hyundai',model:'Creta',price:349000,year:2021,mileage:29800,transmission:'Automatic',fuelType:'Petrol',bodyType:'SUV',engineSize:'1.5L',image:'assets/images/Hyundai_Creta.png',financePerMonth:6000},
  {id:5,make:'Nissan',model:'Qashqai',price:359000,year:2020,mileage:47500,transmission:'Automatic',fuelType:'Petrol',bodyType:'SUV',engineSize:'1.2L',image:'assets/images/Nissan_Qashai_Pretoria_North.png',financePerMonth:6200},
  {id:6,make:'Renault',model:'Kwid',price:159000,year:2022,mileage:15200,transmission:'Manual',fuelType:'Petrol',bodyType:'Hatchback',engineSize:'1.0L',image:'assets/images/Renault_Kwid_Pretoria_North.png',financePerMonth:2800,tag:'Low km'},
  {id:7,make:'Volkswagen',model:'Polo',price:249000,year:2021,mileage:33400,transmission:'Manual',fuelType:'Petrol',bodyType:'Hatchback',engineSize:'1.0L',image:'assets/images/Volskwagen_Polo.png',financePerMonth:4300},
  {id:8,make:'Nissan',model:'Micra',price:219000,year:2021,mileage:24000,transmission:'Manual',fuelType:'Petrol',bodyType:'Hatchback',engineSize:'1.0L',image:'assets/images/Nissan_Micra.png',financePerMonth:3800},
  {id:9,make:'Hyundai',model:'Accent',price:189000,year:2019,mileage:61000,transmission:'Manual',fuelType:'Petrol',bodyType:'Sedan',engineSize:'1.6L',image:'assets/images/Hyudai_Accent.png',financePerMonth:3300},
  {id:10,make:'Chery',model:'Tiggo',price:319000,year:2022,mileage:18500,transmission:'Automatic',fuelType:'Petrol',bodyType:'SUV',engineSize:'1.5L',image:'assets/images/Chery_Tiggo.png',financePerMonth:5500},
  {id:11,make:'Volkswagen',model:'Combi',price:329000,year:2019,mileage:68000,transmission:'Manual',fuelType:'Diesel',bodyType:'MPV',engineSize:'2.0L',image:'assets/images/Volswagen_Combie.png',financePerMonth:5700}
];

function getVehicles(){
  return Promise.resolve(VEHICLES);
}
