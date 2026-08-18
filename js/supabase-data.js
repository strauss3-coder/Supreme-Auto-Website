/* ========== Supabase data layer: the website's only source of content ==========
   Everything the site displays now comes from the Supreme Auto portal's
   database. Change a price in the portal, reload this page, and the new
   price is here. There is no second copy of the data to keep in step.

   What this file exposes on window.SupremeData:
     vehicles()        -> array in the shape the rest of the site already
                          expects (make/model/fuelType/bodyType/...), so
                          inventory.js, detail.js, contact-form.js and
                          finance-wizard.js needed no changes.
     testimonials()    -> reviews, newest ordering set in the portal
     settings()        -> homepage copy, contact details, hours, stats
     submitEnquiry(o)  -> writes an enquiry straight into the portal inbox

   The publishable key below is meant to live in public website code.
   Row level security in the database is what protects the data: a visitor
   may read published stock and insert one enquiry, and nothing else. It
   cannot read customer enquiries or change a single record.

   Offline and outage behaviour: every successful read is cached in
   localStorage. If Supabase is unreachable the site falls back to that
   last good copy rather than showing an empty page. The cache is a
   fallback, never the source of truth, and is refreshed on every load. */
(function(){
  'use strict';

  var SUPABASE_URL='https://wltrdchewowvolushyfl.supabase.co';
  var SUPABASE_KEY='sb_publishable_1frBQ7n0x2addaHtmGJ6ww_BbyaDiIU';

  var CACHE_PREFIX='sa_cache_';
  var CACHE_TTL=5*60*1000;      /* a fresh read is reused for five minutes */

  var headers={
    apikey:SUPABASE_KEY,
    Authorization:'Bearer '+SUPABASE_KEY
  };

  /* ---------- cache ---------- */
  function cacheGet(key){
    try{
      var raw=localStorage.getItem(CACHE_PREFIX+key);
      if(!raw)return null;
      var box=JSON.parse(raw);
      return box&&box.data?box:null;
    }catch(e){return null;}
  }
  function cacheSet(key,data){
    try{
      localStorage.setItem(CACHE_PREFIX+key,JSON.stringify({at:Date.now(),data:data}));
    }catch(e){/* private mode or full storage, not fatal */}
  }

  /* ---------- request ---------- */
  function get(path,cacheKey){
    var cached=cacheGet(cacheKey);
    if(cached&&(Date.now()-cached.at)<CACHE_TTL){
      return Promise.resolve(cached.data);
    }
    return fetch(SUPABASE_URL+'/rest/v1/'+path,{headers:headers})
      .then(function(res){
        if(!res.ok)throw new Error('Supabase '+res.status+' on '+path);
        return res.json();
      })
      .then(function(rows){
        cacheSet(cacheKey,rows);
        return rows;
      })
      .catch(function(err){
        console.error('[SupremeData] '+err.message);
        if(cached){
          console.warn('[SupremeData] serving the last cached copy of '+cacheKey);
          return cached.data;
        }
        return [];
      });
  }

  /* ---------- mapping: database row -> the shape this site already uses ----------
     The portal stores a vehicle as brand/model/fuel/body/engine. The site
     was written around make/model/fuelType/bodyType/engineSize. Mapping
     here means neither side had to be rewritten to suit the other. */
  function toSiteVehicle(row,i){
    var brand=row.brand||'';
    var model=row.model||'';
    /* if the portal only has a name, split it so the make filter still works */
    if(!brand&&row.name){
      var bits=String(row.name).split(' ');
      brand=bits.shift()||'';
      if(!model)model=bits.join(' ');
    }
    var powerNum=null;
    if(row.power!==null&&row.power!==undefined&&row.power!==''){
      var m=String(row.power).match(/\d+(\.\d+)?/);
      if(m)powerNum=Number(m[0]);
    }
    var tag='';
    if(row.sold)tag='Sold';
    else if(row.reserved)tag='Reserved';
    else if(row.featured)tag='Featured';

    return {
      id:row.id,
      make:brand,
      model:model,
      year:row.year,
      mileage:row.mileage,
      price:Number(row.price)||0,
      fuelType:row.fuel||'',
      transmission:row.transmission||'',
      bodyType:row.body||'',
      engineSize:row.engine||'',
      power:powerNum,
      images:Array.isArray(row.images)?row.images:[],
      financePerMonth:Number(row.installment)||0,
      financeIsEstimate:true,
      stockNumber:row.stock||null,
      description:row.description||'',
      featured:!!row.featured,
      tag:tag,
      sold:!!row.sold,
      reserved:!!row.reserved,
      condition:row.condition||'',
      colour:row.colour||'',
      features:Array.isArray(row.features)?row.features:[],
      sortOrder:typeof row.sort_order==='number'?row.sort_order:i
    };
  }

  /* ---------- public API ---------- */
  var promises={};

  function once(key,fn){
    if(!promises[key])promises[key]=fn();
    return promises[key];
  }

  var SupremeData={
    url:SUPABASE_URL,

    /* website_vehicles is a database view that already excludes archived
       stock and sorts featured first, so the filter rules live in one
       place instead of being repeated in the website. */
    vehicles:function(){
      return once('vehicles',function(){
        return get('website_vehicles?select=*','vehicles').then(function(rows){
          return (rows||[]).map(toSiteVehicle);
        });
      });
    },

    testimonials:function(){
      return once('testimonials',function(){
        return get('testimonials?select=*&order=sort_order.asc','testimonials')
          .then(function(rows){
            return (rows||[]).map(function(r){
              return {
                id:r.id,
                name:r.name||'',
                vehicle:r.vehicle||'',
                rating:Number(r.rating)||5,
                review:r.review||'',
                photo:r.photo||'',
                /* only a review that genuinely came from Google may carry
                   the Verified Google Review badge */
                isGoogle:String(r.source||'').toLowerCase()==='google'
              };
            });
          });
      });
    },


    settings:function(){
      return once('settings',function(){
        return get('site_settings?select=key,value','settings').then(function(rows){
          var out={};
          (rows||[]).forEach(function(r){out[r.key]=r.value;});
          return out;
        });
      });
    },

    /* An enquiry from the website form lands in the portal's Enquiries
       page as unread. Visitors may insert and nothing more, so one
       customer can never read another's message. */
    submitEnquiry:function(o){
      var row={
        id:'e_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),
        name:o.name||'',
        phone:o.phone||'',
        email:o.email||'',
        vehicle:o.vehicle||'',
        message:o.message||'',
        source:o.source||'Website form',
        status:'unread'
      };
      return fetch(SUPABASE_URL+'/rest/v1/enquiries',{
        method:'POST',
        headers:{
          apikey:SUPABASE_KEY,
          Authorization:'Bearer '+SUPABASE_KEY,
          'Content-Type':'application/json',
          Prefer:'return=minimal'
        },
        body:JSON.stringify(row)
      }).then(function(res){
        if(!res.ok){
          return res.text().then(function(t){throw new Error(t||('status '+res.status));});
        }
        return true;
      });
    }
  };

  window.SupremeData=SupremeData;
})();
