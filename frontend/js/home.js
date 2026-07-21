// Header: transparent over hero (homepage only), always solid on inner pages
  const hdr=document.getElementById('hdr');
  const heroEl=document.getElementById('top');
  if(hdr){
    if(!heroEl){
      // Inner page: force solid immediately
      hdr.classList.add('solid');
    } else {
      function syncHeader(){
        const trigger=(heroEl.offsetHeight||600)-90;
        hdr.classList.toggle('solid', window.scrollY>trigger);
      }
      window.addEventListener('scroll',syncHeader,{passive:true});
      window.addEventListener('resize',syncHeader);
      syncHeader();
    }
  }
  // Mobile menu
  const burger=document.getElementById('burger'),mm=document.getElementById('mm');
  if(burger&&mm){
    let overlay=document.querySelector('.mm-overlay');
    if(!overlay){
      overlay=document.createElement('div');
      overlay.className='mm-overlay';
      overlay.setAttribute('aria-hidden','true');
      document.body.appendChild(overlay);
    }

    function setMenuOpen(open){
      mm.classList.toggle('open',open);
      overlay.classList.toggle('open',open);
      document.body.classList.toggle('mm-open',open);
      burger.setAttribute('aria-expanded',String(open));
      burger.setAttribute('aria-controls','mm');
      overlay.setAttribute('aria-hidden',String(!open));
    }

    burger.setAttribute('aria-expanded','false');
    burger.setAttribute('aria-controls','mm');
    burger.addEventListener('click',()=>setMenuOpen(!mm.classList.contains('open')));
    overlay.addEventListener('click',()=>setMenuOpen(false));
    mm.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenuOpen(false)));
    document.addEventListener('keydown',(e)=>{
      if(e.key==='Escape'&&mm.classList.contains('open')) setMenuOpen(false);
    });
  }
  // Nav dropdown (O que fazemos)
  document.querySelectorAll('.has-dropdown > a').forEach(trigger=>{
    trigger.addEventListener('click',(e)=>{
      e.preventDefault();
      const dd=trigger.closest('.has-dropdown');
      const willOpen=!dd.classList.contains('open');
      dd.classList.toggle('open',willOpen);
      trigger.setAttribute('aria-expanded',String(willOpen));
    });
  });
  document.addEventListener('click',(e)=>{
    document.querySelectorAll('.has-dropdown.open').forEach(dd=>{
      if(!dd.contains(e.target)){
        dd.classList.remove('open');
        dd.querySelector('a').setAttribute('aria-expanded','false');
      }
    });
  });
  // Reveal on scroll
  const io=new IntersectionObserver((es)=>{
    es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
  },{threshold:.15});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

  // Contact form (páginas de contacto)
  const contactForm=document.getElementById('contactForm');
  if(contactForm){
    const formMsg=document.getElementById('formMsg');
    const submitBtn=contactForm.querySelector('[type="submit"]');
    const msgField=document.getElementById('cf-mensagem');
    const msgUsed=document.getElementById('cf-mensagem-used');
    const msgCount=document.getElementById('cf-mensagem-count');
    const telField=document.getElementById('cf-telefone');
    const MSG_MAX=500;

    function updateMsgCount(){
      if(!msgField||!msgUsed) return;
      const len=msgField.value.length;
      msgUsed.textContent=String(len);
      if(msgCount){
        msgCount.classList.toggle('near-limit', len>=MSG_MAX*0.9 && len<MSG_MAX);
        msgCount.classList.toggle('at-limit', len>=MSG_MAX);
      }
    }

    if(msgField){
      msgField.addEventListener('input', updateMsgCount);
      updateMsgCount();
    }

    // Normaliza telefone (remove espaços) antes da validação HTML5 pattern
    if(telField){
      telField.addEventListener('blur', ()=>{
        telField.value=telField.value.replace(/[\s\-]/g,'');
      });
    }

    contactForm.addEventListener('submit', async (e)=>{
      e.preventDefault();
      if(telField) telField.value=telField.value.replace(/[\s\-]/g,'');
      if(!contactForm.checkValidity()){contactForm.reportValidity();return;}
      const fd=new FormData(contactForm);
      const payload={};
      for(const [key,value] of fd.entries()) payload[key]=value;
      formMsg.classList.remove('ok','err');
      formMsg.hidden=true;
      if(submitBtn) submitBtn.disabled=true;
      try{
        await window.SiteAPI.submitContact(payload);
        formMsg.textContent='Obrigado! A sua mensagem foi enviada. A nossa equipa entrará em contacto brevemente.';
        formMsg.classList.add('ok');
        formMsg.hidden=false;
        contactForm.reset();
        updateMsgCount();
      }catch(err){
        formMsg.textContent='Não foi possível enviar a mensagem. Tente novamente ou contacte-nos por email.';
        formMsg.classList.add('err');
        formMsg.hidden=false;
      }finally{
        if(submitBtn) submitBtn.disabled=false;
      }
    });
  }
