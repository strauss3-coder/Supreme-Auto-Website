/* ========== Finance Application Wizard ==========
   5-step modal: Personal Details -> Employment -> Vehicle & Finance
   -> Review -> Send. Draft persists to sessionStorage (cleared only
   on successful send or explicit "Start Over") so an accidental close
   doesn't lose the visitor's progress. Vehicle dropdown is populated
   from getVehicles() in vehicles-data.js. */
(function(){
  var openBtn=document.getElementById('applyFinanceBtn');
  var overlay=document.getElementById('fwOverlay');
  var modal=document.getElementById('fwModal');
  if(!openBtn||!overlay||!modal)return;

  var closeBtn=document.getElementById('fwClose');
  var cancelBtn=document.getElementById('fwCancel');
  var backBtn=document.getElementById('fwBack');
  var nextBtn=document.getElementById('fwNext');
  var sendBtn=document.getElementById('fwSend');
  var startOverBtn=document.getElementById('fwStartOver');
  var stepsTrack=document.getElementById('fwSteps');
  var stepLabel=document.getElementById('fwStepLabel');
  var reviewEl=document.getElementById('fwReview');
  var emailPreviewEl=document.getElementById('fwEmailPreview');
  var tradeInDetailsField=document.getElementById('fwTradeInDetailsField');
  var tradeInError=document.getElementById('fwTradeInError');
  var vehicleSelect=document.getElementById('fwVehicle');

  var STORAGE_KEY='supremeauto_finance_draft';
  var DEALER_EMAIL='shelwell@mweb.co.za';
  var TOTAL_STEPS=5;
  var STEP_NAMES=['Personal Details','Employment','Vehicle & Finance','Review','Submit'];

  var currentStep=1;
  var lastScrollY=0;
  var lastFocusedEl=null;

  var fieldIds=[
    'fwFirstName','fwLastName','fwPhone','fwEmail','fwIdNumber','fwAddress','fwCity','fwProvince','fwPostalCode',
    'fwEmploymentStatus','fwEmployerName','fwOccupation','fwGrossIncome','fwNetIncome','fwEmploymentDuration','fwOtherIncome',
    'fwVehicle','fwDeposit','fwLoanTerm','fwTradeInDetails','fwNotes'
  ];

  /* ---------- draft persistence ---------- */
  function getAllFields(){
    var data={};
    fieldIds.forEach(function(id){
      var el=document.getElementById(id);
      if(el)data[id]=el.value;
    });
    var tradeIn=document.querySelector('input[name="fwTradeIn"]:checked');
    data.fwTradeIn=tradeIn?tradeIn.value:'';
    return data;
  }

  function applyFields(data){
    if(!data)return;
    fieldIds.forEach(function(id){
      var el=document.getElementById(id);
      if(el&&data[id]!==undefined)el.value=data[id];
    });
    if(data.fwTradeIn){
      var radio=document.querySelector('input[name="fwTradeIn"][value="'+data.fwTradeIn+'"]');
      if(radio)radio.checked=true;
    }
    toggleTradeInDetails();
  }

  function saveDraft(){
    try{
      sessionStorage.setItem(STORAGE_KEY,JSON.stringify({step:currentStep,data:getAllFields()}));
    }catch(e){}
  }

  function loadDraft(){
    try{
      var raw=sessionStorage.getItem(STORAGE_KEY);
      return raw?JSON.parse(raw):null;
    }catch(e){return null;}
  }

  function clearDraft(){
    try{sessionStorage.removeItem(STORAGE_KEY);}catch(e){}
  }

  modal.addEventListener('input',saveDraft);
  modal.addEventListener('change',saveDraft);

  /* ---------- vehicle dropdown (dynamic from vehicles.json) ---------- */
  if(typeof getVehicles==='function'){
    getVehicles().then(function(vehicles){
      vehicles.forEach(function(v){
        var opt=document.createElement('option');
        opt.value=v.make+' '+v.model;
        opt.textContent=v.make+' '+v.model;
        vehicleSelect.appendChild(opt);
      });
      var draft=loadDraft();
      if(draft&&draft.data&&draft.data.fwVehicle)vehicleSelect.value=draft.data.fwVehicle;
    });
  }

  /* ---------- trade-in conditional field ---------- */
  function toggleTradeInDetails(){
    var checked=document.querySelector('input[name="fwTradeIn"]:checked');
    tradeInDetailsField.hidden=!checked||checked.value!=='Yes';
  }
  document.querySelectorAll('input[name="fwTradeIn"]').forEach(function(r){
    r.addEventListener('change',toggleTradeInDetails);
  });

  /* ---------- validation ---------- */
  function setError(input,message){
    var field=input.closest('.field');
    var errorEl=field?field.querySelector('.field-error'):null;
    if(errorEl)errorEl.textContent=message||'';
    if(field)field.classList.toggle('field--invalid',!!message);
  }

  function clearErrorsIn(step){
    step.querySelectorAll('.field-error').forEach(function(el){el.textContent='';});
    step.querySelectorAll('.field--invalid').forEach(function(el){el.classList.remove('field--invalid');});
    tradeInError.textContent='';
  }

  fieldIds.forEach(function(id){
    var el=document.getElementById(id);
    if(el)el.addEventListener('input',function(){setError(el,'');});
  });

  function required(id,message){
    var el=document.getElementById(id);
    if(!el.value.trim()){setError(el,message);return false;}
    return true;
  }

  function validEmail(v){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());}

  function validateStep1(){
    var ok=true;
    if(!required('fwFirstName','Please enter your first name.'))ok=false;
    if(!required('fwLastName','Please enter your last name.'))ok=false;
    var phone=document.getElementById('fwPhone');
    if(phone.value.replace(/\D/g,'').length<7){setError(phone,'Please enter a valid phone number.');ok=false;}
    var email=document.getElementById('fwEmail');
    if(!validEmail(email.value)){setError(email,'Please enter a valid email address.');ok=false;}
    var idNum=document.getElementById('fwIdNumber');
    if(idNum.value.replace(/\D/g,'').length!==13){setError(idNum,'ID number must be 13 digits.');ok=false;}
    if(!required('fwAddress','Please enter your address.'))ok=false;
    if(!required('fwCity','Please enter your city.'))ok=false;
    if(!required('fwProvince','Please select a province.'))ok=false;
    var postal=document.getElementById('fwPostalCode');
    if(postal.value.replace(/\D/g,'').length!==4){setError(postal,'Postal code must be 4 digits.');ok=false;}
    return ok;
  }

  function validateStep2(){
    var ok=true;
    if(!required('fwEmploymentStatus','Please select your employment status.'))ok=false;
    if(!required('fwEmployerName','Please enter your employer name.'))ok=false;
    if(!required('fwOccupation','Please enter your occupation.'))ok=false;
    if(!required('fwGrossIncome','Please enter your gross income.'))ok=false;
    if(!required('fwNetIncome','Please enter your net income.'))ok=false;
    if(!required('fwEmploymentDuration','Please enter your employment duration.'))ok=false;
    return ok;
  }

  function validateStep3(){
    var ok=true;
    if(!required('fwVehicle','Please select a vehicle.'))ok=false;
    if(!required('fwDeposit','Please enter your desired deposit.'))ok=false;
    if(!required('fwLoanTerm','Please select a loan term.'))ok=false;
    var tradeIn=document.querySelector('input[name="fwTradeIn"]:checked');
    if(!tradeIn){tradeInError.textContent='Please select an option.';ok=false;}
    else if(tradeIn.value==='Yes'&&!required('fwTradeInDetails','Please provide trade-in details.'))ok=false;
    return ok;
  }

  function validateStep(n){
    if(n===1)return validateStep1();
    if(n===2)return validateStep2();
    if(n===3)return validateStep3();
    return true;
  }

  /* ---------- review (step 4) ---------- */
  function val(id){return (document.getElementById(id)||{}).value||'';}

  function reviewSection(title,step,rows){
    var rowsHtml=rows.filter(function(r){return r[1];}).map(function(r){
      return '<div class="fw-review-row"><small>'+r[0]+'</small><b>'+escapeHtml(r[1])+'</b></div>';
    }).join('');
    return '<div class="fw-review-section">'+
      '<h4>'+title+'<button type="button" class="fw-review-edit" data-goto="'+step+'">Edit</button></h4>'+
      '<div class="fw-review-grid">'+rowsHtml+'</div></div>';
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function renderReview(){
    var tradeIn=document.querySelector('input[name="fwTradeIn"]:checked');
    reviewEl.innerHTML=
      reviewSection('Personal Details',1,[
        ['Name',val('fwFirstName')+' '+val('fwLastName')],
        ['Phone',val('fwPhone')],['Email',val('fwEmail')],['ID Number',val('fwIdNumber')],
        ['Address',val('fwAddress')],['City',val('fwCity')],['Province',val('fwProvince')],
        ['Postal Code',val('fwPostalCode')]
      ])+
      reviewSection('Employment & Income',2,[
        ['Status',val('fwEmploymentStatus')],['Employer',val('fwEmployerName')],['Occupation',val('fwOccupation')],
        ['Gross Income',val('fwGrossIncome')],['Net Income',val('fwNetIncome')],
        ['Employment Duration',val('fwEmploymentDuration')],['Other Income',val('fwOtherIncome')]
      ])+
      reviewSection('Vehicle & Finance',3,[
        ['Vehicle',val('fwVehicle')],['Deposit',val('fwDeposit')],['Loan Term',val('fwLoanTerm')],
        ['Trade-In',tradeIn?tradeIn.value:''],
        ['Trade-In Details',tradeIn&&tradeIn.value==='Yes'?val('fwTradeInDetails'):''],
        ['Additional Notes',val('fwNotes')]
      ]);
  }

  /* ---------- email (step 5) ---------- */
  function buildEmailSubject(){
    return 'Finance Application - '+val('fwFirstName')+' '+val('fwLastName');
  }

  function buildEmailBody(){
    var tradeIn=document.querySelector('input[name="fwTradeIn"]:checked');
    var lines=[
      'A new finance application has been submitted via the Supreme Auto website.','',
      'PERSONAL DETAILS','Name: '+val('fwFirstName')+' '+val('fwLastName'),'Phone: '+val('fwPhone'),
      'Email: '+val('fwEmail'),'ID Number: '+val('fwIdNumber'),'Address: '+val('fwAddress'),
      'City: '+val('fwCity'),'Province: '+val('fwProvince'),'Postal Code: '+val('fwPostalCode'),'',
      'EMPLOYMENT INFORMATION','Employment Status: '+val('fwEmploymentStatus'),
      'Employer: '+val('fwEmployerName'),'Occupation: '+val('fwOccupation'),
      'Monthly Gross Income: '+val('fwGrossIncome'),'Monthly Net Income: '+val('fwNetIncome'),
      'Employment Duration: '+val('fwEmploymentDuration')
    ];
    if(val('fwOtherIncome'))lines.push('Other Income: '+val('fwOtherIncome'));
    lines.push('','VEHICLE INFORMATION','Vehicle of Interest: '+val('fwVehicle'),
      'Desired Deposit: '+val('fwDeposit'),'Preferred Loan Term: '+val('fwLoanTerm'),
      'Trade-In: '+(tradeIn?tradeIn.value:''));
    if(tradeIn&&tradeIn.value==='Yes')lines.push('Trade-In Details: '+val('fwTradeInDetails'));
    if(val('fwNotes'))lines.push('','ADDITIONAL NOTES',val('fwNotes'));
    lines.push('','Thank you.');
    return lines.join('\n');
  }

  function renderEmailPreview(){
    emailPreviewEl.textContent='Subject: '+buildEmailSubject()+'\n\n'+buildEmailBody();
  }

  function sendApplication(){
    var subject=encodeURIComponent(buildEmailSubject());
    var body=encodeURIComponent(buildEmailBody().replace(/\n/g,'\r\n'));
    var mailto='mailto:'+DEALER_EMAIL+'?subject='+subject+'&body='+body;
    var a=document.createElement('a');
    a.href=mailto;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    clearDraft();
    setTimeout(closeModal,500);
  }

  /* ---------- step navigation ---------- */
  function updateProgress(){
    document.querySelectorAll('.fw-progress-step').forEach(function(el){
      var step=Number(el.getAttribute('data-step'));
      el.classList.toggle('is-active',step===currentStep);
      el.classList.toggle('is-done',step<currentStep);
    });
    document.querySelectorAll('.fw-progress-line').forEach(function(el,i){
      el.classList.toggle('is-done',i+1<currentStep);
    });
  }

  function updateFooter(){
    backBtn.hidden=currentStep===1;
    backBtn.textContent=currentStep===5?'Back to Edit':'Back';
    nextBtn.hidden=currentStep===5;
    sendBtn.hidden=currentStep!==5;
  }

  function goToStep(n){
    currentStep=Math.max(1,Math.min(TOTAL_STEPS,n));
    stepsTrack.style.transform='translateX(-'+((currentStep-1)*20)+'%)';
    stepLabel.textContent='Step '+currentStep+' of '+TOTAL_STEPS+' · '+STEP_NAMES[currentStep-1];
    updateProgress();
    updateFooter();
    if(currentStep===4)renderReview();
    if(currentStep===5)renderEmailPreview();
    saveDraft();
    var firstField=modal.querySelector('.fw-step[data-step="'+currentStep+'"] input, .fw-step[data-step="'+currentStep+'"] select');
    if(firstField)firstField.focus();
  }

  nextBtn.addEventListener('click',function(){
    var step=modal.querySelector('.fw-step[data-step="'+currentStep+'"]');
    clearErrorsIn(step);
    if(!validateStep(currentStep))return;
    goToStep(currentStep+1);
  });
  backBtn.addEventListener('click',function(){goToStep(currentStep-1);});
  sendBtn.addEventListener('click',sendApplication);

  reviewEl.addEventListener('click',function(e){
    var btn=e.target.closest('.fw-review-edit');
    if(btn)goToStep(Number(btn.getAttribute('data-goto')));
  });

  startOverBtn.addEventListener('click',function(){
    if(!window.confirm('Start over? This will clear everything you\'ve entered.'))return;
    modal.querySelectorAll('input[type="text"],input[type="tel"],input[type="email"],textarea').forEach(function(el){el.value='';});
    modal.querySelectorAll('select').forEach(function(el){el.selectedIndex=0;});
    modal.querySelectorAll('input[type="radio"]').forEach(function(el){el.checked=false;});
    toggleTradeInDetails();
    clearDraft();
    goToStep(1);
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

  function openModal(){
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

    var draft=loadDraft();
    if(draft&&draft.data){
      applyFields(draft.data);
      goToStep(draft.step||1);
    }else{
      goToStep(1);
    }

    document.addEventListener('keydown',onKeydown);
    var firstField=document.getElementById('fwFirstName');
    if(firstField)firstField.focus();
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
