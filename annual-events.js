'use strict';
(()=>{
 const section=document.getElementById('annual-events');if(!section)return;
 const events=[...section.querySelectorAll('.annual-event')];let activeEventId=null;
 events.forEach(event=>{
  const trigger=event.querySelector('summary');
  trigger.addEventListener('click',e=>{
   e.preventDefault();const top=trigger.getBoundingClientRect().top;
   activeEventId=activeEventId===event.id?null:event.id;
   events.forEach(item=>{item.open=item.id===activeEventId;item.querySelector('summary').setAttribute('aria-expanded',String(item.open));});
   // Keep the clicked card in place when an earlier long article closes.
   const delta=trigger.getBoundingClientRect().top-top;
   if(delta)window.scrollBy({top:delta,behavior:'instant'});
   trigger.focus({preventScroll:true});
  });
 });
})();
