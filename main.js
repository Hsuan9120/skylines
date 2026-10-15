'use strict';
document.documentElement.classList.add('js');
const $=(s,root=document)=>root.querySelector(s);
const $$=(s,root=document)=>[...root.querySelectorAll(s)];
const header=$('.site-header');
const nav=$('#main-nav');
const menu=$('.menu-toggle');
menu.hidden=false;
function headerSize(){document.documentElement.style.setProperty('--header-height',`${header.getBoundingClientRect().height}px`);}
if('ResizeObserver' in window)new ResizeObserver(headerSize).observe(header);else window.addEventListener('resize',headerSize);
headerSize();
function closeMenu(){nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false');headerSize();}
menu.addEventListener('click',()=>{const open=nav.classList.toggle('is-open');menu.setAttribute('aria-expanded',String(open));headerSize();});
document.addEventListener('click',e=>{if(!header.contains(e.target))closeMenu();});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('is-open')){closeMenu();menu.focus();}});
$$('a[href^="#"]').forEach(link=>{if(link.hasAttribute('data-drawer'))return;link.addEventListener('click',e=>{const target=$(link.hash);if(!target)return;e.preventDefault();closeMenu();history.pushState(null,'',link.hash);target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});});
window.addEventListener('hashchange',()=>{const target=$(location.hash||'#top');if(target&&target.tagName!=='DIALOG'){closeMenu();target.scrollIntoView();}});
// One continuous full-page line; dialog scrolling never changes reading position.
let locked=false,savedScroll=0,opener=null,frame=0;
function updateProgress(){frame=0;if(locked)return;const total=document.documentElement.scrollHeight-innerHeight;$('#reading-line').style.transform=`scaleX(${total>0?Math.min(1,Math.max(0,scrollY/total)):0})`;}
window.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(updateProgress);},{passive:true});
window.addEventListener('resize',updateProgress);window.addEventListener('load',updateProgress);
if('ResizeObserver' in window)new ResizeObserver(updateProgress).observe(document.body);
function openModal(dialog,trigger){closeMenu();savedScroll=scrollY;opener=trigger;locked=true;document.body.style.position='fixed';document.body.style.top=`-${savedScroll}px`;document.body.style.width='100%';document.body.style.overflow='hidden';dialog.showModal();dialog.scrollTop=0;$('[data-close]',dialog).focus({preventScroll:true});}
$$('dialog').forEach(dialog=>{
 $('[data-close]',dialog).addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
 dialog.addEventListener('close',()=>{document.body.style.position='';document.body.style.top='';document.body.style.width='';document.body.style.overflow='';window.scrollTo({top:savedScroll,behavior:'instant'});locked=false;opener?.focus({preventScroll:true});updateProgress();});
});
$$('[data-drawer]').forEach(link=>link.addEventListener('click',e=>{e.preventDefault();openModal($('#participation'),link);}));
$$('.official').forEach(figure=>{
 const button=$('.art-button',figure),img=$('img',figure);
 function available(){button.disabled=false;}
 function missing(){button.disabled=true;img.hidden=true;let fallback=$('.art-error',figure);if(!fallback){fallback=document.createElement('div');fallback.className='art-error';fallback.textContent='圖片暫時無法載入，請稍後重試。';button.append(fallback);}}
 img.addEventListener('load',available);img.addEventListener('error',missing);
 if(img.complete){if(img.naturalWidth)available();else missing();}
 button.addEventListener('click',()=>{const full=$('#lightbox-image');full.src=img.dataset.original||img.src;full.alt=img.alt;$('#lightbox-caption').textContent=`正式美術 · ${img.alt}｜${$('figcaption>span:last-child',figure).textContent}`;openModal($('#lightbox'),button);});
});
// Start image downloads before their exhibit reaches the viewport.
if('IntersectionObserver' in window){const nearby=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.loading='eager';nearby.unobserve(e.target);}}),{rootMargin:'1600px 0px'});$$('img[loading=lazy]').forEach(img=>nearby.observe(img));}
const concept=$('.concept img');
concept.addEventListener('error',()=>{concept.hidden=true;const placeholder=document.createElement('div');placeholder.className='art-error';placeholder.style.border='1px solid #B68B3B';placeholder.style.background='#ECE3CD';placeholder.textContent='概念插畫待置入｜非官方概念示意';concept.before(placeholder);});
if('IntersectionObserver' in window){
 const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){$$('#main-nav a').forEach(a=>{if(a.hash===`#${entry.target.id}`)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}}),{rootMargin:'-25% 0px -55% 0px'});$$('.chapter').forEach(el=>observer.observe(el));
 if(!matchMedia('(prefers-reduced-motion: reduce)').matches){const reveal=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-revealed');reveal.unobserve(e.target);}}),{threshold:.12});$$('.chapter-title,.chronicle,.br-block,.personnel').forEach(el=>{el.classList.add('soft-reveal');reveal.observe(el);});}
}
// Start the authorized track from zero on each page load; respect browser autoplay policy.
const audio=new Audio();audio.preload='auto';audio.volume=.25;audio.loop=true;
const play=$('#music-play'),volumeToggle=$('#volume-toggle'),status=$('#music-status'),slider=$('#volume'),mute=$('#mute');
function syncAudio(){play.textContent=audio.paused?'播放':'暫停';play.setAttribute('aria-label',`${audio.paused?'播放':'暫停'}背景音樂`);mute.textContent=audio.muted?'取消靜音':'靜音';mute.setAttribute('aria-pressed',String(audio.muted));}
function unavailable(){play.disabled=true;volumeToggle.disabled=true;status.textContent='音檔待提供／尚未能播放';$('#volume-panel').hidden=true;volumeToggle.setAttribute('aria-expanded','false');}
audio.addEventListener('loadedmetadata',()=>{play.disabled=false;volumeToggle.disabled=false;status.textContent='正在啟動 BGM';syncAudio();});
let autoplayBlocked=false;
audio.addEventListener('canplay',async()=>{audio.currentTime=0;try{await audio.play();}catch(error){autoplayBlocked=error.name==='NotAllowedError';if(audio.paused)status.textContent=autoplayBlocked?'瀏覽器限制，互動後播放':'無法自動播放，請重試';syncAudio();}},{once:true});
// A normal page interaction unlocks audio where browser policy requires a gesture.
async function unlockAudio(e){if(!autoplayBlocked||e.target.closest('.music')||(e.type==='keydown'&&!['Enter',' '].includes(e.key)))return;autoplayBlocked=false;try{await audio.play();}catch{autoplayBlocked=true;}}
document.addEventListener('click',unlockAudio);document.addEventListener('keydown',unlockAudio);
audio.addEventListener('error',unavailable);
audio.addEventListener('play',()=>{status.textContent='播放中';syncAudio();});
audio.addEventListener('pause',()=>{status.textContent='已暫停';syncAudio();});

play.addEventListener('click',async()=>{autoplayBlocked=false;if(audio.paused){try{await audio.play();}catch{status.textContent='無法播放，請重試';syncAudio();}}else{audio.pause();syncAudio();}});
volumeToggle.addEventListener('click',()=>{const open=volumeToggle.getAttribute('aria-expanded')!=='true';volumeToggle.setAttribute('aria-expanded',String(open));$('#volume-panel').hidden=!open;});
slider.addEventListener('input',()=>{audio.volume=Number(slider.value)/100;$('#volume-value').value=`${slider.value}%`;});
mute.addEventListener('click',()=>{audio.muted=!audio.muted;syncAudio();});
document.addEventListener('click',e=>{if(!e.target.closest('.music')){$('#volume-panel').hidden=true;volumeToggle.setAttribute('aria-expanded','false');}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#volume-panel').hidden){$('#volume-panel').hidden=true;volumeToggle.setAttribute('aria-expanded','false');volumeToggle.focus();}});
audio.src='Skyline_.mp3';
window.addEventListener('load',()=>{if(location.hash==='#participation')openModal($('#participation'),$('[data-drawer]'));else if(location.hash){const target=$(location.hash);target?.scrollIntoView({behavior:'instant'});}});
