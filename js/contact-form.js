/* ========== enquiry form: searchable vehicle combobox + WhatsApp send ==========
   Vehicle of Interest is populated from getVehicles() (vehicles-data.js) --
   whenever a vehicle is added to/removed from assets/vehicles.json, this
   list updates automatically with no changes needed here.

   WHATSAPP_NUMBER: same number already used for the social WhatsApp
   button in this section -- one inbox for both channels. */
(function(){
  var WHATSAPP_NUMBER='27768615477';

  var form=document.getElementById('enquiryForm');
  var ok=document.getElementById('formOk');
  if(!form||!ok)return;

  var nameInput=document.getElementById('n');
  var phoneInput=document.getElementById('ph');
  var emailInput=document.getElementById('em');
  var msgInput=document.getElementById('msg');
  var vehSearch=document.getElementById('vehSearch');
  var vehHidden=document.getElementById('veh');
  var vehList=document.getElementById('vehList');
  var vehCombo=document.getElementById('vehCombo');

  /* ---------- searchable vehicle combobox ---------- */
  var vehicleNames=['Other / not sure yet'];
  var activeIndex=-1;

  function renderList(filter){
    var term=(filter||'').trim().toLowerCase();
    var matches=vehicleNames.filter(function(name){
      return name.toLowerCase().indexOf(term)!==-1;
    });
    vehList.innerHTML=matches.map(function(name,i){
      return '<div class="combo-option" role="option" id="vehOpt'+i+'" data-value="'+name.replace(/"/g,'&quot;')+'">'+name+'</div>';
    }).join('');
    activeIndex=-1;
    var hasMatches=matches.length>0;
    vehList.hidden=!hasMatches;
    vehSearch.setAttribute('aria-expanded',hasMatches?'true':'false');
    return matches;
  }

  function selectVehicle(name){
    vehSearch.value=name;
    vehHidden.value=name;
    closeList();
  }

  function closeList(){
    vehList.hidden=true;
    vehSearch.setAttribute('aria-expanded','false');
    activeIndex=-1;
  }

  function highlight(index){
    var options=vehList.querySelectorAll('.combo-option');
    options.forEach(function(o){o.classList.remove('is-active');});
    if(options[index]){
      options[index].classList.add('is-active');
      vehSearch.setAttribute('aria-activedescendant',options[index].id);
    }
  }

  vehSearch.addEventListener('focus',function(){renderList(vehSearch.value);});
  vehSearch.addEventListener('input',function(){
    vehHidden.value=vehSearch.value;
    renderList(vehSearch.value);
  });
  vehSearch.addEventListener('blur',function(){
    setTimeout(function(){closeList();},120);
  });

  vehSearch.addEventListener('keydown',function(e){
    var options=vehList.querySelectorAll('.combo-option');
    if(vehList.hidden&&(e.key==='ArrowDown'||e.key==='ArrowUp')){
      renderList(vehSearch.value);
      return;
    }
    if(e.key==='ArrowDown'){
      e.preventDefault();
      activeIndex=Math.min(activeIndex+1,options.length-1);
      highlight(activeIndex);
    }else if(e.key==='ArrowUp'){
      e.preventDefault();
      activeIndex=Math.max(activeIndex-1,0);
      highlight(activeIndex);
    }else if(e.key==='Enter'){
      if(activeIndex>=0&&options[activeIndex]){
        e.preventDefault();
        selectVehicle(options[activeIndex].getAttribute('data-value'));
      }
    }else if(e.key==='Escape'){
      closeList();
    }
  });

  vehList.addEventListener('click',function(e){
    var opt=e.target.closest('.combo-option');
    if(!opt)return;
    selectVehicle(opt.getAttribute('data-value'));
  });

  if(typeof getVehicles==='function'){
    getVehicles().then(function(vehicles){
      vehicleNames=vehicles.map(function(v){return v.make+' '+v.model;}).concat(['Other / not sure yet']);
    });
  }

  /* ---------- inline validation ---------- */
  function setError(input,id,message){
    var el=document.getElementById(id);
    if(el)el.textContent=message||'';
    input.closest('.field').classList.toggle('field--invalid',!!message);
  }

  function clearErrorOnInput(input,id){
    input.addEventListener('input',function(){setError(input,id,'');});
  }
  clearErrorOnInput(nameInput,'nError');
  clearErrorOnInput(phoneInput,'phError');
  clearErrorOnInput(emailInput,'emError');

  function validate(){
    var valid=true;

    if(!nameInput.value.trim()){
      setError(nameInput,'nError','Please enter your name.');
      valid=false;
    }

    var phoneDigits=phoneInput.value.replace(/\D/g,'');
    if(phoneDigits.length<7){
      setError(phoneInput,'phError','Please enter a valid phone number.');
      valid=false;
    }

    var emailOk=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
    if(!emailOk){
      setError(emailInput,'emError','Please enter a valid email address.');
      valid=false;
    }

    return valid;
  }

  /* ---------- WhatsApp message ---------- */
  function buildMessage(){
    var vehicle=vehHidden.value.trim()||'Not specified';
    var message=msgInput.value.trim()||'Not specified';
    return 'Hello Supreme Auto,\n\n'+
      'I would like to enquire about one of your vehicles.\n\n'+
      'Name:\n'+nameInput.value.trim()+'\n\n'+
      'Phone:\n'+phoneInput.value.trim()+'\n\n'+
      'Email:\n'+emailInput.value.trim()+'\n\n'+
      'Vehicle of Interest:\n'+vehicle+'\n\n'+
      'Message:\n'+message+'\n\n'+
      'Thank you.';
  }

  form.addEventListener('submit',function(e){
    e.preventDefault();
    if(!validate())return;

    var url='https://wa.me/'+WHATSAPP_NUMBER+'?text='+encodeURIComponent(buildMessage());
    openInNewTab(url);

    ok.classList.add('show');
    form.reset();
    vehHidden.value='';
    setTimeout(function(){ok.classList.remove('show');},4000);
  });
})();
