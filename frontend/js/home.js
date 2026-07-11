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
  burger.addEventListener('click',()=>mm.classList.toggle('open'));
  mm.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mm.classList.remove('open')));
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
    contactForm.addEventListener('submit',(e)=>{
      e.preventDefault();
      if(!contactForm.checkValidity()){contactForm.reportValidity();return;}
      formMsg.textContent='Obrigado! A sua mensagem foi enviada. A nossa equipa entrará em contacto brevemente.';
      formMsg.classList.add('ok');
      contactForm.reset();
    });
  }
