(function(){
  const c=document.getElementById('warmParticles');
  const cols=['#ff5e6c','#feb300','#ffaaab','#fff5d7'];
  for(let i=0;i<25;i++){
    const p=document.createElement('div');
    p.className='wp';
    const sz=Math.random()*3+1.5;
    p.style.cssText=`
      left:${Math.random()*100}%;
      width:${sz}px; height:${sz}px;
      animation-duration:${10+Math.random()*15}s;
      animation-delay:${Math.random()*16}s;
      background:${cols[Math.floor(Math.random()*cols.length)]};
    `;
    c.appendChild(p);
  }
})();

/* ── SCROLL REVEAL ───────────────────────────── */
const ro=new IntersectionObserver(entries=>{
  entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')});
},{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>ro.observe(el));

/* ── RIPPLE ──────────────────────────────────── */
function addRipple(btn){
  btn.addEventListener('click',function(e){
    if(this.disabled)return;
    const r=document.createElement('span');
    r.className='ripple';
    const rect=this.getBoundingClientRect();
    const size=Math.max(rect.width,rect.height);
    r.style.cssText=`width:${size}px;height:${size}px;left:${e.clientX-rect.left-size/2}px;top:${e.clientY-rect.top-size/2}px`;
    this.appendChild(r);
    setTimeout(()=>r.remove(),600);
  });
}

/* ── FAKE PROGRESS ───────────────────────────── */
function fakeProgress(fillEl,pctEl,wrapEl){
  wrapEl.classList.add('show');
  let v=0;
  const iv=setInterval(()=>{
    v+=Math.random()*15+5;
    if(v>=88){v=88;clearInterval(iv);}
    fillEl.style.width=v+'%';
    pctEl.textContent=Math.floor(v)+'%';
  },130);
  return {
    finish(){
      clearInterval(iv);
      fillEl.style.width='100%'; pctEl.textContent='100%';
      setTimeout(()=>{wrapEl.classList.remove('show');fillEl.style.width='0%';},900);
    }
  };
}

/* ── TABS ────────────────────────────────────── */
const bankTab=document.getElementById('bankTab');
const panTab=document.getElementById('panTab');
const bankSection=document.getElementById('bankSection');
const panSection=document.getElementById('panSection');

bankTab.addEventListener('click',()=>{
  bankTab.classList.add('tab-active'); bankTab.classList.remove('tab-pan-active');
  panTab.classList.remove('tab-active','tab-pan-active');
  bankSection.classList.add('active'); panSection.classList.remove('active');
});
panTab.addEventListener('click',()=>{
  panTab.classList.add('tab-active','tab-pan-active');
  bankTab.classList.remove('tab-active');
  panSection.classList.add('active'); bankSection.classList.remove('active');
});

/* ── BANK ────────────────────────────────────── */
let bankFile=null,bankJSON=null;
const bankZone=document.getElementById('bankZone');
const bankInput=document.getElementById('bankFileInput');
const bankFC=document.getElementById('bankFC');
const bankFName=document.getElementById('bankFName');
const bankFSize=document.getElementById('bankFSize');
const bankClear=document.getElementById('bankClear');
const bankSubmit=document.getElementById('bankSubmit');
const bankToast=document.getElementById('bankToast');
const bankDL=document.getElementById('bankDL');
const bankProg=document.getElementById('bankProg');
const bankFill=document.getElementById('bankFill');
const bankPct=document.getElementById('bankPct');
addRipple(bankSubmit);

bankZone.addEventListener('click',()=>bankInput.click());
bankZone.addEventListener('dragover',e=>{e.preventDefault();bankZone.classList.add('dragover')});
bankZone.addEventListener('dragleave',()=>bankZone.classList.remove('dragover'));
bankZone.addEventListener('drop',e=>{
  e.preventDefault();bankZone.classList.remove('dragover');
  const f=e.dataTransfer.files[0]; if(f)handleBank(f);
});
bankInput.addEventListener('change',e=>{if(e.target.files[0])handleBank(e.target.files[0])});
function handleBank(f){
  if(f.type!=='application/pdf'){alert('Please upload a PDF file');return;}
  if(f.size>10*1024*1024){alert('File exceeds 10 MB');return;}
  bankFile=f;
  bankFName.textContent=f.name;
  bankFSize.textContent=(f.size/1024/1024).toFixed(2)+' MB · Ready';
  bankFC.classList.add('show');
  bankSubmit.disabled=false;
  bankToast.classList.remove('show');
  bankDL.style.display='none';
}
bankClear.addEventListener('click',()=>{
  bankFile=null; bankInput.value='';
  bankFC.classList.remove('show');
  bankSubmit.disabled=true; bankToast.classList.remove('show');
});
bankSubmit.addEventListener('click',()=>{
  if(!bankFile)return;
  bankSubmit.disabled=true;
  bankSubmit.innerHTML='<span>⏳</span><span>Extracting…</span>';
  const prog=fakeProgress(bankFill,bankPct,bankProg);
  const fd=new FormData(); fd.append('bankStatement',bankFile);
  fetch('/upload-bank',{method:'POST',body:fd})
    .then(r=>r.json())
    .then(data=>{
      prog.finish(); bankJSON=data;
      bankToast.classList.add('show'); bankDL.style.display='flex';
      bankSubmit.innerHTML='<span>✓</span><span>Extracted Successfully</span>';
      setTimeout(()=>{
        bankFile=null; bankInput.value='';
        bankFC.classList.remove('show'); bankToast.classList.remove('show');
        bankSubmit.disabled=true;
        bankSubmit.innerHTML='<span>🚀</span><span>Extract Bank Data</span>';
      },3500);
    })
    .catch(()=>{
      prog.finish();
      alert('Upload failed — please try again.');
      bankSubmit.disabled=false;
      bankSubmit.innerHTML='<span>🚀</span><span>Extract Bank Data</span>';
    });
});
bankDL.addEventListener('click',()=>dlJSON(bankJSON,'bank_statement.json'));

/* ── PAN ─────────────────────────────────────── */
let panFile=null,panJSON=null;
const panZone=document.getElementById('panZone');
const panInput=document.getElementById('panFileInput');
const panFC=document.getElementById('panFC');
const panFName=document.getElementById('panFName');
const panFSize=document.getElementById('panFSize');
const panClear=document.getElementById('panClear');
const panSubmit=document.getElementById('panSubmit');
const panToast=document.getElementById('panToast');
const panDL=document.getElementById('panDL');
const panProg=document.getElementById('panProg');
const panFill=document.getElementById('panFill');
const panPct=document.getElementById('panPct');
addRipple(panSubmit);

panZone.addEventListener('click',()=>panInput.click());
panZone.addEventListener('dragover',e=>{e.preventDefault();panZone.classList.add('dragover')});
panZone.addEventListener('dragleave',()=>panZone.classList.remove('dragover'));
panZone.addEventListener('drop',e=>{
  e.preventDefault();panZone.classList.remove('dragover');
  const f=e.dataTransfer.files[0]; if(f)handlePan(f);
});
panInput.addEventListener('change',e=>{if(e.target.files[0])handlePan(e.target.files[0])});
function handlePan(f){
  if(f.type!=='application/pdf'&&!f.type.startsWith('image/')){alert('Please upload a PDF or image');return;}
  if(f.size>10*1024*1024){alert('File exceeds 10 MB');return;}
  panFile=f;
  panFName.textContent=f.name;
  panFSize.textContent=(f.size/1024/1024).toFixed(2)+' MB · Ready';
  panFC.classList.add('show');
  panSubmit.disabled=false;
  panToast.classList.remove('show');
  panDL.style.display='none';
}
panClear.addEventListener('click',()=>{
  panFile=null; panInput.value='';
  panFC.classList.remove('show');
  panSubmit.disabled=true; panToast.classList.remove('show');
});
panSubmit.addEventListener('click',()=>{
  if(!panFile)return;
  panSubmit.disabled=true;
  panSubmit.innerHTML='<span>⏳</span><span>Extracting…</span>';
  const prog=fakeProgress(panFill,panPct,panProg);
  const fd=new FormData(); fd.append('panCard',panFile);
  fetch('/upload-pan',{method:'POST',body:fd})
    .then(r=>r.json())
    .then(data=>{
      prog.finish(); panJSON=data;
      panToast.classList.add('show'); panDL.style.display='flex';
      panSubmit.innerHTML='<span>✓</span><span>Extracted Successfully</span>';
      setTimeout(()=>{
        panFile=null; panInput.value='';
        panFC.classList.remove('show'); panToast.classList.remove('show');
        panSubmit.disabled=true;
        panSubmit.innerHTML='<span>🚀</span><span>Extract PAN Data</span>';
      },3500);
    })
    .catch(()=>{
      prog.finish();
      alert('Upload failed — please try again.');
      panSubmit.disabled=false;
      panSubmit.innerHTML='<span>🚀</span><span>Extract PAN Data</span>';
    });
});
panDL.addEventListener('click',()=>dlJSON(panJSON,'pan_card.json'));

/* ── DOWNLOAD UTIL ───────────────────────────── */
function dlJSON(data,name){
  const b=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  const u=URL.createObjectURL(b);
  const a=document.createElement('a'); a.href=u; a.download=name; a.click();
  URL.revokeObjectURL(u);
}
