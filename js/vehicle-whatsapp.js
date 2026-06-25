/* ========== vehicle WhatsApp enquiry modal ==========
   Reads the currently-displayed vehicle from window.getCurrentVehicle()
   (exposed by detail.js) -- never fetches or duplicates vehicle data
   itself, and never lets the vehicle fields be edited, per the brief.
   Triggered by the "WhatsApp Enquiry" button in Vehicle Preview. */
(function(){
  var openBtn=document.getElementById('vehicleWaBtn');
  var overlay=document.getElementById('vwOverlay');
  var modal=document.getElementById('vwModal');
  if(!openBtn||!overlay||!modal)return;

  var WHATSAPP_NUMBER='27768615477';

  var closeBtn=document.getElementById('vwClose');
  var cancelBtn=document.getElementById('vwCancel');
  var continueBtn=document.getElementById('vwContinue');
  var nameInput=document.getElementById('vwName');
  var phoneInput=document.getElementById('vwPhone');
  var messageInput=document.getElementById('vwMessage');
  var vehicleImg=document.getElementById('vwVehicleImg');
  var vehicleName=document.getElementById('vwVehicleName');
  var vehiclePrice=document.getElementById('vwVehiclePrice');
  var specGrid=document.getElementById('vwSpecGrid');

  var currentVehicle=null;
  var lastScrollY=0;
  var lastFocusedEl=null;

  function formatPrice(n){return n==null?'POA':'R'+n.toLocaleString('en-ZA');}
  function formatKm(n){return n==null?'—':n.toLocaleString('en-ZA')+' km';}

  /* ---------- vehicle summary card (read-only) ---------- */
  function specRow(label,value){
    if(!value)return '';
    return '<div><b>'+label+':</b> '+value+'</div>';
  }

  function renderVehicleSummary(v){
    var label=v.make+' '+v.model;
    vehicleImg.src=v.images[0];
    vehicleImg.alt=label;
    vehicleName.textContent=v.year+' '+label;
    vehiclePrice.textContent=formatPrice(v.price);
    specGrid.innerHTML=
      specRow('Mileage',formatKm(v.mileage))+
      specRow('Transmission',v.transmission)+
      specRow('Fuel',v.fuelType)+
      specRow('Engine',v.engineSize)+
      specRow('Body Type',v.bodyType)+
      (v.stockNumber?specRow('Stock #',v.stockNumber):'');
  }

  /* ---------- validation ---------- */
  function setError(input,message){
    var field=input.closest('.field');
    var errorEl=field?field.querySelector('.field-error'):null;
    if(errorEl)errorEl.textContent=message||'';
    if(field)field.classList.toggle('field--invalid',!!message);
  }

  [nameInput,phoneInput].forEach(function(input){
    input.addEventListener('input',function(){setError(input,'');});
  });

  function validate(){
    var valid=true;
    if(!nameInput.value.trim()){
      setError(nameInput,'Please enter your first name.');
      valid=false;
    }
    if(phoneInput.value.replace(/\D/g,'').length<7){
      setError(phoneInput,'Please enter a valid phone number.');
      valid=false;
    }
    return valid;
  }

  /* ---------- WhatsApp message ---------- */
  function buildMessage(v){
    var lines=[
      'Hello Supreme Auto,','',
      'I am interested in the following vehicle.','',
      'Vehicle',v.year+' '+v.make+' '+v.model,'',
      'Price:',formatPrice(v.price),'',
      'Mileage:',formatKm(v.mileage),'',
      'Transmission:',v.transmission,'',
      'Fuel:',v.fuelType,'',
      'Engine:',v.engineSize||'—','',
      'Body Type:',v.bodyType
    ];
    if(v.stockNumber)lines.push('','Stock Number:',v.stockNumber);
    lines.push('','Customer Details','','Name:',nameInput.value.trim(),'','Phone:',phoneInput.value.trim());
    if(messageInput.value.trim())lines.push('','Additional Message:','',messageInput.value.trim());
    lines.push('','Thank you.');
    return lines.join('\n');
  }

  function openWhatsApp(){
    var url='https://wa.me/'+WHATSAPP_NUMBER+'?text='+encodeURIComponent(buildMessage(currentVehicle));
    window.openInNewTab(url);
  }

  continueBtn.addEventListener('click',function(){
    if(!currentVehicle)return;
    if(!validate())return;
    openWhatsApp();
    closeModal();
  });

  /* ---------- open/close, scroll lock, focus trap ---------- */
  function getFocusable(){
    return Array.prototype.slice.call(
      modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    ).filter(function(el){return !el.disabled&&el.offsetParent!==null;});
  }

  function onKeydown(e){
    if(overlay.hidden)return;
    if(e.key==='Escape'){closeModal();return;}
    if(e.key!=='Tab')return;
    var focusable=getFocusable();
    if(!focusable.length)return;
    var first=focusable[0],last=focusable[focusable.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }

  function resetForm(){
    nameInput.value='';
    phoneInput.value='';
    messageInput.value='';
    setError(nameInput,'');
    setError(phoneInput,'');
  }

  function openModal(){
    currentVehicle=typeof getCurrentVehicle==='function'?getCurrentVehicle():null;
    if(!currentVehicle)return;
    renderVehicleSummary(currentVehicle);
    resetForm();

    lastScrollY=window.scrollY;
    lastFocusedEl=document.activeElement;
    document.body.style.position='fixed';
    document.body.style.top='-'+lastScrollY+'px';
    document.body.style.left='0';
    document.body.style.right='0';
    overlay.hidden=false;
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){overlay.classList.add('is-open');});
    });

    document.addEventListener('keydown',onKeydown);
    nameInput.focus();
  }

  function closeModal(){
    overlay.classList.remove('is-open');
    document.removeEventListener('keydown',onKeydown);
    setTimeout(function(){
      overlay.hidden=true;
      document.body.style.position='';
      document.body.style.top='';
      document.body.style.left='';
      document.body.style.right='';
      window.scrollTo(0,lastScrollY);
      if(lastFocusedEl)lastFocusedEl.focus();
    },350);
  }

  openBtn.addEventListener('click',openModal);
  closeBtn.addEventListener('click',closeModal);
  cancelBtn.addEventListener('click',closeModal);
  overlay.addEventListener('click',function(e){
    if(e.target===overlay)closeModal();
  });
})();
