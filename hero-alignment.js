// Fit the cover as one composition; never reposition individual elements on resize.
(()=>{
 const hero=document.querySelector('#hero'),stage=hero?.querySelector('.hero__stage');
 if(!stage)return;
 let frame=0;
 function fit(){
  frame=0;
  const portrait=window.innerHeight>window.innerWidth;
  hero.classList.toggle('hero--portrait',portrait);
  const width=portrait?350:1180,height=portrait?585:730;
  const scale=Math.min((hero.clientWidth-40)/width,(hero.clientHeight-40)/height,1.15);
  stage.style.setProperty('--stage-scale',Math.max(.1,scale));
 }
 function schedule(){if(!frame)frame=requestAnimationFrame(fit);}
 new ResizeObserver(schedule).observe(hero);
 window.addEventListener('resize',schedule);
 window.addEventListener('load',schedule);
 document.fonts?.ready.then(schedule);schedule();
})();
