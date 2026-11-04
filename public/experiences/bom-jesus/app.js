const $=id=>document.getElementById(id);let mode='ambientes',index=-1,busy=false,token=0,lastKey=null;
const v=$('film');let timer;
function controls(){parent.postMessage({type:'ameno:view-state',overview:index<0&&!busy&&$('home').getAttribute('aria-pressed')==='true'},location.origin);const route=routes[mode];$('stage').classList.toggle('moving',busy);$('travel').hidden=index<0||busy;$('back').disabled=index<=0;$('next').disabled=index>=route.length-1;$('counter').textContent=index<0?'':`${String(index+1).padStart(2,'0')} / ${route.length}`;$('enter').hidden=index>=0||busy||$('home').getAttribute('aria-pressed')==='true';$('replay').hidden=index<0||busy;$('lightPicker').hidden=mode!=='iluminacao';$('effect').value=String(Math.max(0,index));}
function stop(){token++;clearTimeout(timer);v.pause();v.removeAttribute('src');v.load();v.style.visibility='hidden';busy=false;$('status').textContent='';$('retry').hidden=true;$('progress').style.width='0%';}
function home(){stop();index=-1;$('still').src='General_4k.jpg';$('title').textContent='Visão geral';$('still').alt='Vista geral da cabine Bom Jesus';$('hint').textContent='Escolha uma categoria para explorar.';$('category').textContent='CABINE PPF';$('home').setAttribute('aria-pressed','true');$('env').setAttribute('aria-pressed','false');$('mat').setAttribute('aria-pressed','false');$('light').setAttribute('aria-pressed','false');controls();}
function selectMode(m){mode=m;home();$('home').setAttribute('aria-pressed','false');$('env').setAttribute('aria-pressed',m==='ambientes');$('mat').setAttribute('aria-pressed',m==='materiais');$('light').setAttribute('aria-pressed',m==='iluminacao');$('enter').innerHTML='<span class="dot"></span><span class="hotspot-label">'+(m==='materiais'?'Espelho bronze':'Explorar os boxes')+'</span>';$('enter').style.left=m==='materiais'?'24%':'34%';$('enter').style.top=m==='materiais'?'43%':'53%';controls();$('hint').textContent=m==='materiais'?'Toque no espelho para começar. Depois, siga pelas setas.':'Toque no ponto para entrar. Depois, siga pelos boxes.';}
const loadedPosters=new Map();
function preparePoster(src){
  if(!loadedPosters.has(src)){
    const image=new Image();image.src=src;
    const ready=image.decode().then(()=>image).catch(error=>{loadedPosters.delete(src);throw error});
    loadedPosters.set(src,ready);
    if(loadedPosters.size>3)loadedPosters.delete(loadedPosters.keys().next().value);
  }
  return loadedPosters.get(src);
}
async function settle(key){
  const id=token;v.pause();clearTimeout(timer);busy=true;controls();
  try{
    await preparePoster(clips[key].poster);
    if(id!==token)return;
    $('still').src=clips[key].poster;
    await $('still').decode();
    if(id!==token)return;
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    if(id!==token)return;
    v.style.visibility='hidden';$('status').textContent='';
  }catch(error){
    if(id!==token)return;
    $('status').textContent='Imagem em alta indisponível. O último quadro do vídeo foi mantido.';
  }
  busy=false;$('progress').style.width='0%';$('title').textContent=clips[key].label;$('hint').textContent=mode==='iluminacao'?'Escolha um efeito ou siga pelas setas.':'Use as setas para explorar os detalhes.';
  $('still').alt=clips[key].label+' — cabine Bom Jesus';
  $('category').textContent=mode==='iluminacao'?'ILUMINAÇÃO':mode==='materiais'?'MATERIAIS':'AMBIENTES';controls();
}
function fail(){busy=false;v.style.visibility='hidden';$('status').textContent='Não foi possível carregar o vídeo.';$('retry').hidden=false;controls();}
async function playAt(n){stop();index=n;lastKey=routes[mode][index];let key=lastKey;const id=token;busy=true;preparePoster(clips[key].poster).catch(()=>{});if(clips[key].start)$('still').src=clips[key].start;$('title').textContent=clips[key].label;controls();$('status').textContent='Carregando percurso…';v.src=clips[key].src;v.onplaying=()=>{if(id!==token)return;clearTimeout(timer);$('status').textContent='';v.style.visibility='visible';};v.onended=()=>{if(id===token)settle(key)};v.onerror=()=>{if(id===token)fail()};timer=setTimeout(()=>{if(id===token)fail()},30000);try{await v.play()}catch(e){if(id===token)fail()}}
v.ontimeupdate=()=>{$('progress').style.width=(v.duration?v.currentTime/v.duration*100:0)+'%'};
$('enter').onclick=()=>playAt(0);$('next').onclick=()=>{if(!busy&&index<routes[mode].length-1)playAt(index+1)};
$('back').onclick=()=>{if(busy||index<=0)return;if(mode==='iluminacao'){playAt(index-1);return;}stop();index--;settle(routes[mode][index]);$('hint').textContent='Vista anterior. Use a seta da direita para continuar.'};
$('home').onclick=()=>{mode='ambientes';home();};$('env').onclick=()=>selectMode('ambientes');$('mat').onclick=()=>selectMode('materiais');$('light').onclick=()=>{selectMode('iluminacao');$('hint').textContent='Escolha um efeito ou use as setas. Tudo acontece na vista geral.';playAt(0)};$('replay').onclick=()=>playAt(index);$('retry').onclick=()=>playAt(index);
$('full').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else $('hint').textContent='Para ampliar, gire o celular na horizontal.';}catch(e){$('hint').textContent='Gire o celular para ampliar a cabine.'}};
routes.iluminacao.forEach((key,i)=>{const o=document.createElement('option');o.value=i;o.textContent=clips[key].label;$('effect').appendChild(o)});$('effect').onchange=()=>playAt(Number($('effect').value));home();

$('info').onclick=()=>{const open=$('help').hidden;$('help').hidden=!open;$('info').setAttribute('aria-expanded',String(open));};$('closeHelp').onclick=()=>{$('help').hidden=true;$('info').setAttribute('aria-expanded','false');$('info').focus();};document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('help').hidden=true;$('info').setAttribute('aria-expanded','false');}});

// Stop the decoder when this experience leaves the viewport or its page is hidden.
function suspendPlayback(){if(busy&&!v.paused){v.pause();clearTimeout(timer);$('status').textContent='Toque para continuar.';$('retry').hidden=false;}}
window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===parent&&event.data?.type==='ameno:experience-hidden')suspendPlayback();});
document.addEventListener('visibilitychange',()=>{if(document.hidden)suspendPlayback();});
