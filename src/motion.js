// Spring and optical response adapted from Elyx's signupTicket controller,
// retrieved through wildematt/flashcard. See THIRD_PARTY.md.
export function createCardMotion(target, card, getConfig) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const tilt = {p:[0,0],v:[0,0],t:[0,0]};
  const light = {p:[.5,.5],v:[0,0],t:[.5,.5]};
  let active=0, desiredActive=0, frame=0, previous=0;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function paint() {
    const config=getConfig(), x=tilt.p[0], y=tilt.p[1];
    const rx=y*config.tilt, ry=-x*config.tilt;
    card.style.transform=`rotateX(${rx}deg) rotateY(${ry}deg)`;
    const vars={ '--rainbow-angle':`${config.angle-155+(ry-rx)*.8}deg`, '--rainbow-shift':`${(ry+rx)*1.4}%`, '--foil-active':active, '--logo-light':1+active*(light.p[0]-.5)*.35, '--logo-shadow-x':`${-ry*.09}px`, '--logo-shadow-y':`${1+rx*.09}px`, '--foil-x':`${light.p[0]*100}%`, '--foil-y':`${light.p[1]*100}%`, '--foil-band-x':`${75-light.p[0]*50}%`, '--foil-band-y':`${75-light.p[1]*50}%` };
    for(const [key,value] of Object.entries(vars))card.style.setProperty(key,value);
  }
  function tick(time) {
    frame=0;
    const dt=previous?Math.min((time-previous)/1000,.064):1/60;previous=time;
    const decay=7.5, stiffness=237.6, w=Math.sqrt(stiffness-decay*decay);
    const exp=Math.exp(-decay*dt), cs=Math.cos(w*dt), sn=Math.sin(w*dt);
    for(let i=0;i<2;i++) {
      const delta=tilt.p[i]-tilt.t[i], velocity=tilt.v[i];
      tilt.p[i]=tilt.t[i]+exp*(delta*cs+(velocity+decay*delta)/w*sn);
      tilt.v[i]=exp*(velocity*cs-(decay*velocity+stiffness*delta)/w*sn);
      const omega=2*Math.PI/(desiredActive?.4:.8), e=Math.exp(-omega*dt);
      const d=light.p[i]-light.t[i], v=light.v[i]+omega*d;
      light.p[i]=light.t[i]+(d+v*dt)*e;
      light.v[i]=(light.v[i]-omega*v*dt)*e;
    }
    active+=(desiredActive-active)*(1-Math.exp(-dt/(desiredActive?.18:.26)));
    paint();
    const pending=[tilt,light].some(s=>s.p.some((p,i)=>Math.abs(p-s.t[i])>.0001||Math.abs(s.v[i])>.001))||Math.abs(active-desiredActive)>.001;
    if(pending)frame=requestAnimationFrame(tick);else{previous=0;card.style.willChange='';}
  }
  function animate(){if(reduced.matches)return;card.style.willChange='transform';frame ||= requestAnimationFrame(tick);}
  function reset(){tilt.t=[0,0];light.t=[.5,.5];desiredActive=0;animate();}
  function updatePointer(e){
    if(reduced.matches)return;
    const r=target.getBoundingClientRect();
    if(e.target.closest('.inspector')||e.clientX<r.left-120||e.clientX>r.right+120||e.clientY<r.top-120||e.clientY>r.bottom+120){reset();return;}
    const px=(e.clientX-r.left)/r.width,py=(e.clientY-r.top)/r.height;
    tilt.t=[clamp(px*2-1,-1.8,1.8),clamp(py*2-1,-1.8,1.8)];
    light.t=[clamp(px,0,1),clamp(py,0,1)];desiredActive=1;animate();
  }
  document.addEventListener('pointermove',e=>{if(e.pointerType!=='touch')updatePointer(e);},{passive:true});
  target.addEventListener('pointerdown',e=>{if(e.pointerType==='touch'){target.setPointerCapture(e.pointerId);updatePointer(e);}});
  target.addEventListener('pointermove',e=>{if(e.pointerType==='touch')updatePointer(e);},{passive:true});
  target.addEventListener('pointerup',e=>{if(e.pointerType==='touch')reset();});
  document.addEventListener('pointerleave',reset);target.addEventListener('pointercancel',reset);window.addEventListener('blur',reset);
  card.addEventListener('keydown',e=>{
    if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Escape','Home'].includes(e.key))return;
    e.preventDefault();if(e.key==='Escape'||e.key==='Home'){reset();return;}
    const axis=e.key==='ArrowLeft'||e.key==='ArrowRight'?0:1;
    tilt.t[axis]=clamp(tilt.t[axis]+(['ArrowLeft','ArrowUp'].includes(e.key)?-.2:.2),-1,1);
    light.t=tilt.t.map(v=>(v+1)/2);desiredActive=1;animate();
  });
  reduced.addEventListener('change',()=>{cancelAnimationFrame(frame);frame=0;previous=0;tilt.p=tilt.t=[0,0];tilt.v=[0,0];light.p=light.t=[.5,.5];light.v=[0,0];active=desiredActive=0;paint();});
  return {refresh:paint,reset};
}
