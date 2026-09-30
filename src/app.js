import {DEFAULTS,PRESETS,LIMITS,RATIOS,validateConfig,exportConfig} from './config.js';
import {createCardMotion} from './motion.js';
import {t as createAurora} from './aurora.js';

const $=s=>document.querySelector(s), STORAGE='luminary-card:v1';
let config={...DEFAULTS}, storageError=false;
try{const saved=localStorage.getItem(STORAGE);if(saved)config=validateConfig(JSON.parse(saved));}catch{storageError=true;}
const form=$('#controls'), card=$('.card'), scene=$('.scene');
const uploadIcon='<svg viewBox="0 0 24 24"><path d="M12 15V3m-5 5 5-5 5 5M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/></svg>';
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const select=(key,label,options)=>`<div class="field-row"><label for="${key}">${label}</label><select id="${key}" name="${key}">${Object.entries(options).map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></div>`;
const range=(key,label,unit)=>`<div class="range-field"><div class="range-label"><label for="${key}">${label}</label><output for="${key}" data-unit="${unit}"></output></div><input id="${key}" name="${key}" type="range" min="${LIMITS[key][0]}" max="${LIMITS[key][1]}" step="1"></div>`;
const toggle=(key,label,hint='')=>`<label class="toggle-row" for="${key}"><span class="toggle-copy">${label}${hint?`<small>${hint}</small>`:''}</span><input class="switch" id="${key}" name="${key}" type="checkbox" role="switch"></label>`;
const color=(key,label)=>`<div class="field-row"><label for="${key}-hex">${label}</label><div class="color-pair"><input type="color" name="${key}" aria-label="${label} color picker"><input type="text" id="${key}-hex" data-color="${key}" aria-label="${label} hex color" maxlength="7" spellcheck="false"></div></div>`;
const textField=(key,label,max=40)=>`<div class="text-field"><label for="${key}">${label}</label><input type="text" id="${key}" name="${key}" maxlength="${max}" spellcheck="false"></div>`;
const section=(name,content)=>`<details class="control-section" open><summary>${name}</summary><div class="section-body">${content}</div></details>`;
form.innerHTML=
  section('Card',select('ratio','Ratio',{original:'Original · 292:423',credit:'Credit card · 85.6:53.98',portrait:'Portrait · 2:3',square:'Square · 1:1',landscape:'Landscape · 4:3'})+range('width','Width','px')+range('radius','Corner radius','px')+toggle('ticket','Ticket style','Side punches and tear line'))+
  section('Colors',`<div class="preset-list" role="group" aria-label="Color presets">${Object.entries(PRESETS).map(([id,p])=>`<button type="button" class="preset-button" data-preset="${id}" aria-pressed="false"><span class="preset-swatch" style="--swatch:linear-gradient(135deg,${p.primary},${p.secondary} 55%,${p.accent})"></span><span>${p.name}</span></button>`).join('')}</div>`+color('primary','Primary')+color('secondary','Secondary')+color('accent','Accent')+range('angle','Gradient angle','°'))+
  section('Texture',select('pattern','Pattern',{rosette:'Rosette',guilloche:'Guilloché',rings:'Concentric rings',waves:'Waves',grid:'Grid',none:'None',custom:'Custom image'})+`<button type="button" class="upload" id="upload">${uploadIcon}<span>Upload image…</span></button><p class="help">Seamless tiles work best. Max 3 MB.</p>`+range('textureScale','Scale','%')+range('textureOpacity','Opacity','%')+select('blend','Blend',{normal:'Normal',overlay:'Overlay','soft-light':'Soft light',screen:'Screen',multiply:'Multiply'})+toggle('emboss','Emboss stroke'))+
  section('Lighting',range('foil','Foil','%')+range('glare','Glare','%')+range('grain','Grain','%')+range('tilt','Max tilt','°'))+
  section('Content',textField('title','Title',48)+textField('subtitle','Subtitle',64)+textField('holder','Cardholder')+`<div class="two-fields">${textField('number','Number')}${textField('valid','Valid thru')}</div>`+color('textColor','Text color')+`<div class="field-row"><label>Logo</label><div class="segments" role="group" aria-label="Logo">${['star','rings','none'].map(key=>`<button type="button" data-logo="${key}" aria-pressed="false">${key[0].toUpperCase()+key.slice(1)}</button>`).join('')}</div></div>`)+
  section('Scene',toggle('aurora','Aurora background','Animated WebGL light behind the card'));
form.addEventListener('submit',e=>e.preventDefault());

let disposeAurora, auroraEnabled, toastTimer, saveTimer;
function toast(message){$('.toast').textContent=message;$('.toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('.toast').classList.remove('visible'),3200);}
function save(){clearTimeout(saveTimer);saveTimer=setTimeout(()=>{try{localStorage.setItem(STORAGE,JSON.stringify(config));$('#save-status').textContent='Live preview · auto-saved locally';}catch{$('#save-status').textContent='Storage full · export to save your card';toast('Browser storage is full. Export your configuration to keep it.');}},120);}
function syncControls(){
  for(const el of form.querySelectorAll('[name]')){
    if(el.type==='checkbox')el.checked=config[el.name];else el.value=config[el.name];
    if(el.type==='range'){
      const out=form.querySelector(`output[for="${el.name}"]`);
      out.value=config[el.name]+out.dataset.unit;
      el.style.setProperty('--fill',`${(config[el.name]-Number(el.min))/(Number(el.max)-Number(el.min))*100}%`);
    }
  }
  for(const el of form.querySelectorAll('[data-color]'))if(el!==document.activeElement)el.value=config[el.dataset.color];
  form.querySelectorAll('[data-preset]').forEach(el=>el.setAttribute('aria-pressed',String(config.preset===el.dataset.preset)));
  form.querySelectorAll('[data-logo]').forEach(el=>el.setAttribute('aria-pressed',String(config.logo===el.dataset.logo)));
  $('#upload span').textContent=config.customTexture?'Replace image…':'Upload image…';
}
const hexToRgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
function mix(a,b,t){const x=hexToRgb(a),y=hexToRgb(b);return '#'+x.map((v,i)=>Math.round(v*(1-t)+y[i]*t).toString(16).padStart(2,'0')).join('');}
function gradient(){
  const p=config.primary,s=config.secondary,a=config.accent;
  // The original Elyx spectrum remains underneath the editable pearl palette.
  const spectrum=config.preset==='pearl'||config.preset==='custom';
  const stops=spectrum?[mix(a,'#6c1d9f',.45),mix(p,'#ff3030',.55),mix(s,'#ffbd2e',.5),mix(s,'#ffffff',.8),'#ffffff','#eafff5','#b9ffed',mix(a,'#edb6e9',.35),mix(a,'#4028b0',.55),'#0027ff99']:[mix(a,'#000000',.25),p,s,mix(s,'#ffffff',.3),mix(s,'#ffffff',.7),s,mix(s,a,.25),a,mix(a,'#000000',.15),mix(a,'#000000',.4)];
  const positions=[0,16,25,32,43,51,57,69,83,100];
  return `radial-gradient(ellipse 65% 38% at 0% 0%,${spectrum?mix(s,'#ffdb89',.7):s},transparent),radial-gradient(ellipse 70% 60% at 100% 100%,${spectrum?'#00b7ff99':a+'99'},transparent),radial-gradient(ellipse 70% 60% at 100% 85%,${spectrum?'#00ff9355':s+'55'},transparent),linear-gradient(var(--rainbow-angle),${stops.map((c,i)=>`${c} calc(${positions[i]}% + var(--rainbow-shift))`).join(',')})`;
}
const svgURL=body=>`url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><g fill="none" stroke="white" stroke-width=".8">${body}</g></svg>`)}")`;
const patterns={
  rosette:`url("${new URL('../assets/rosette.png',import.meta.url).href}")`,guilloche:`url("${new URL('../assets/foil.webp',import.meta.url).href}")`,
  rings:svgURL(Array.from({length:18},(_,i)=>`<circle cx="50" cy="50" r="${(i+1)*4}"/>`).join('')),
  waves:svgURL(Array.from({length:24},(_,i)=>`<path d="M-25 ${i*6-35}Q0 ${i*6-10}25 ${i*6-35}T75 ${i*6-35}T125 ${i*6-35}"/>`).join('')),
  grid:svgURL(Array.from({length:20},(_,i)=>`<path d="M${i*5} 0v100M0 ${i*5}h100"/>`).join('')),
  none:'none'
};
function fitCard(){
  const rect=scene.getBoundingClientRect(),ratio=RATIOS[config.ratio];
  const w=Math.min(config.width,rect.width-56,(rect.height-56)*ratio);
  $('.card-target').style.setProperty('--card-width',`${Math.max(80,w)}px`);
  const scale=w/292;
  card.style.setProperty('--card-radius',`${config.radius*scale}px`);
}
function render(){
  const styles={ '--primary':config.primary,'--card-colors':gradient(),'--card-ratio':RATIOS[config.ratio], '--texture-size':`${55.46*config.textureScale/38}px`, '--texture-opacity':config.textureOpacity/100,'--texture-blend':config.blend,'--emboss':config.emboss&&config.pattern==='rosette'?1:0,'--foil-strength':config.foil/100,'--glare-strength':config.glare/100,'--grain-strength':config.grain/100,'--text-color':config.textColor,
    '--texture':config.pattern==='custom'?`url("${config.customTexture}")`:patterns[config.pattern],
    '--card-mask':config.ticket?'radial-gradient(circle 12px at 0% 66%,transparent 98%,#000) 0 0 / 51% 100% no-repeat,radial-gradient(circle 12px at 100% 66%,transparent 98%,#000) 100% 0 / 51% 100% no-repeat':'none'
  };
  for(const [k,v]of Object.entries(styles))card.style.setProperty(k,v);
  card.dataset.wide=String(RATIOS[config.ratio]>=1);
  $('.tear-line').hidden=!config.ticket;
  const title=$('#card-title');title.textContent=config.title;
  // Keep long user titles within the original title area without changing default metrics.
  title.style.fontSize=config.title.length>22?`${Math.max(5.3,11.65*22/config.title.length)}cqw`:'';
  $('#card-subtitle').textContent=config.subtitle;
  $('#card-holder').textContent=config.holder;$('#card-number').textContent=config.number;$('#card-valid').textContent=config.valid;
  card.setAttribute('aria-label',`${config.title} membership card. Move the pointer or use arrow keys to tilt.`);
  $('.card-logo').style.display=config.logo==='none'?'none':'';
  $('.card-logo .star').style.display=config.logo==='star'?'block':'none';
  $('.card-logo .rings').style.display=config.logo==='rings'?'block':'none';
  $('.card-logo').style.color=mix(config.textColor,'#48c9a3',.6);
  scene.dataset.aurora=String(config.aurora);
  if(auroraEnabled!==config.aurora){disposeAurora?.();disposeAurora=null;auroraEnabled=config.aurora;if(config.aurora)disposeAurora=createAurora($('#aurora-canvas'),{placement:'bottom'});}
  syncControls();fitCard();motion.refresh();
}
const motion=createCardMotion($('.card-target'),card,()=>config);
function setValue(key,value){config={...config,[key]:value};if(['primary','secondary','accent'].includes(key))config.preset='custom';render();save();}
form.addEventListener('input',e=>{
  const el=e.target;
  if(el.dataset.color){
    if(/^#[\da-f]{6}$/i.test(el.value)){el.setCustomValidity('');setValue(el.dataset.color,el.value.toUpperCase());}
    else el.setCustomValidity('Use a six-digit hex color, such as #FFC9D8.');
    return;
  }
  if(!el.name)return;
  if(el.name==='pattern'&&el.value==='custom'&&!config.customTexture){el.value=config.pattern;$('#texture-file').click();return;}
  setValue(el.name,el.type==='checkbox'?el.checked:el.type==='range'?Number(el.value):el.value);
});
form.addEventListener('focusout',e=>{if(e.target.dataset.color){e.target.value=config[e.target.dataset.color];e.target.setCustomValidity('');}});
function sweep(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;$('.card-sweep').animate([{transform:'translateX(-70%)',opacity:0},{opacity:.65,offset:.35},{opacity:.45,offset:.65},{transform:'translateX(70%)',opacity:0}],{duration:600,easing:'linear'});}
form.addEventListener('click',e=>{
  const preset=e.target.closest('[data-preset]'),logo=e.target.closest('[data-logo]');
  if(preset){const {name,...colors}=PRESETS[preset.dataset.preset];config={...config,...colors,preset:preset.dataset.preset};render();save();sweep();}
  if(logo)setValue('logo',logo.dataset.logo);
});
$('#upload').addEventListener('click',()=>$('#texture-file').click());
$('#texture-file').addEventListener('change',async e=>{
  const file=e.target.files[0];e.target.value='';if(!file)return;
  if(file.size>3*1024*1024){toast('The texture must be 3 MB or smaller.');return;}
  if(!['image/png','image/jpeg','image/webp','image/svg+xml'].includes(file.type)){toast('Choose a PNG, JPEG, WebP or SVG image.');return;}
  const url=URL.createObjectURL(file);
  try{
    const image=new Image();image.src=url;await image.decode();
    const canvas=document.createElement('canvas');const scale=Math.min(1,1024/Math.max(image.width,image.height));
    canvas.width=Math.max(1,Math.round(image.width*scale));canvas.height=Math.max(1,Math.round(image.height*scale));
    canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
    config={...config,pattern:'custom',customTexture:canvas.toDataURL('image/png')};render();save();toast('Texture updated.');
  }catch{toast('This image could not be decoded. Try a PNG or JPEG.');}finally{URL.revokeObjectURL(url);}
});
$('#reset').addEventListener('click',()=>{config={...DEFAULTS};motion.reset();render();save();sweep();toast('Restored the original card.');});
$('#export').addEventListener('click',()=>{
  const blob=new Blob([exportConfig(config)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='luminary-card.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);toast('Configuration exported.');
});
$('#import').addEventListener('click',()=>$('#import-file').click());
$('#import-file').addEventListener('change',async e=>{
  const file=e.target.files[0];e.target.value='';if(!file)return;
  if(file.size>5*1024*1024){toast('Configuration files must be smaller than 5 MB.');return;}
  try{const next=validateConfig(JSON.parse(await file.text()));config=next;render();save();sweep();toast('Configuration imported.');}catch(err){toast(err instanceof SyntaxError?'This file is not valid JSON.':err.message);}
});
new ResizeObserver(fitCard).observe(scene);
render();if(storageError)toast('Saved settings could not be loaded. The original card is ready.');
