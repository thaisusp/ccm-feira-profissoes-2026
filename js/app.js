    (() => {
      const slides = [...document.querySelectorAll('.slide')];
      const deck = document.getElementById('deck');
      const progress = document.getElementById('progress');
      const slideNumber = document.getElementById('slideNumber');
      const autoBtn = document.getElementById('autoBtn');
      const areaColors={math:'var(--math)',physics:'var(--physics)',chemistry:'var(--chemistry)',biology:'var(--biology)',computing:'var(--computing)',humanities:'var(--humanities)'};
      const problemMapData = window.CM_DATA.problemMapData;
      const areaPositions={4:[{x:50,y:10},{x:86,y:38},{x:50,y:70},{x:14,y:38}],5:[{x:50,y:10},{x:86,y:30},{x:73,y:69},{x:27,y:69},{x:14,y:30}]};
      let current = Math.max(0, slides.findIndex(s => '#' + s.id === location.hash));
      let selectedProblem = 'linguagem';
      let autoTimer = null;
      let touchStartX = 0;

      function pad(n){return String(n).padStart(2,'0')}
      function showSlide(next, updateHash = true){
        next = Math.max(0, Math.min(slides.length - 1, next));
        slides.forEach((s,i)=>{s.classList.toggle('active',i===next);s.classList.toggle('was-active',i<next)});
        current = next;
        slideNumber.textContent = `${pad(current+1)} / ${pad(slides.length)}`;
        progress.style.width = `${((current+1)/slides.length)*100}%`;
        document.body.classList.toggle('dark-active',slides[current].classList.contains('dark'));
        document.title = `${slides[current].dataset.title} — Ciências Moleculares`;
        if(updateHash) history.replaceState(null,'','#'+slides[current].id);
        document.getElementById('projectPanel').classList.remove('open');
        document.getElementById('projectPanel').setAttribute('aria-hidden','true');
        if(slides[current].id==='escolha') renderProblem(selectedProblem);
        if(slides[current].id==='diversidade'){
          requestAnimationFrame(()=>setTimeout(()=>document.querySelectorAll('.region-dot').forEach(d=>{d.style.setProperty('--x',d.dataset.tx+'%');d.style.setProperty('--y',d.dataset.ty+'%')}),120));
        }else{
          document.querySelectorAll('.region-dot').forEach(d=>{d.style.setProperty('--x',d.dataset.ox+'%');d.style.setProperty('--y',d.dataset.oy+'%')});
        }
      }
      function move(delta){pauseAuto();showSlide(current+delta)}

      document.getElementById('prevBtn').addEventListener('click',()=>move(-1));
      document.getElementById('nextBtn').addEventListener('click',()=>move(1));
      document.getElementById('fullBtn').addEventListener('click',toggleFullscreen);
      function toggleFullscreen(){if(!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.()}
      function pauseAuto(){if(autoTimer){clearInterval(autoTimer);autoTimer=null;autoBtn.setAttribute('aria-pressed','false');autoBtn.setAttribute('aria-label','Ativar avanço automático')}}
      function toggleAuto(){
        if(autoTimer){pauseAuto();return}
        autoBtn.setAttribute('aria-pressed','true');autoBtn.setAttribute('aria-label','Pausar avanço automático');
        autoTimer=setInterval(()=>showSlide(current===slides.length-1?0:current+1),9000);
      }
      autoBtn.addEventListener('click',toggleAuto);
      deck.addEventListener('pointerdown',()=>{ if(autoTimer) pauseAuto(); },{passive:true});

      const helpDialog=document.getElementById('helpDialog');
      document.getElementById('helpBtn').addEventListener('click',()=>helpDialog.classList.add('open'));
      helpDialog.addEventListener('click',e=>{if(e.target===helpDialog)helpDialog.classList.remove('open')});
      document.addEventListener('keydown',e=>{
        if(helpDialog.classList.contains('open')){if(e.key==='Escape')helpDialog.classList.remove('open');return}
        if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' '){e.preventDefault();move(1)}
        else if(e.key==='ArrowLeft'||e.key==='PageUp'){e.preventDefault();move(-1)}
        else if(e.key==='Home'){pauseAuto();showSlide(0)}else if(e.key==='End'){pauseAuto();showSlide(slides.length-1)}
        else if(e.key.toLowerCase()==='f')toggleFullscreen();else if(e.key.toLowerCase()==='a')toggleAuto();else if(e.key==='?')helpDialog.classList.add('open');
        else if(e.key==='Escape'){document.getElementById('projectPanel').classList.remove('open')}
      });
      deck.addEventListener('touchstart',e=>touchStartX=e.changedTouches[0].clientX,{passive:true});
      deck.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-touchStartX;if(Math.abs(dx)>70)move(dx<0?1:-1)},{passive:true});

      const problemList=document.getElementById('problemList');
      Object.entries(problemMapData).forEach(([key,value])=>{
        const btn=document.createElement('button');btn.className='problem-pill';btn.textContent=value.question;btn.dataset.problem=key;btn.style.setProperty('--area',areaColors[value.color]);btn.addEventListener('click',()=>renderProblem(key));problemList.appendChild(btn);
      });
      document.querySelectorAll('#problema [data-problem]').forEach(btn=>btn.addEventListener('click',()=>{selectedProblem=btn.dataset.problem;renderProblem(selectedProblem);showSlide(slides.findIndex(s=>s.id==='escolha'))}));
      function renderProblem(key){
        selectedProblem=key;const data=problemMapData[key];
        document.getElementById('mapCenter').textContent=data.question;
        const areaWrap=document.getElementById('mapAreas');const lineWrap=document.getElementById('mapLines');const explanation=document.getElementById('mapExplanation');areaWrap.innerHTML='';lineWrap.innerHTML='';explanation.textContent='Passe o cursor por uma área para ver como ela contribui.';
        [...problemList.children].forEach(b=>b.classList.toggle('active-choice',b.dataset.problem===key));
        const positions=areaPositions[data.areas.length]||areaPositions[5];
        data.areas.forEach((area,i)=>{const pos=positions[i];const delay=.32+i*.58;const n=document.createElement('button');n.className='map-area';n.type='button';n.textContent=area.name;n.style.setProperty('--x',pos.x+'%');n.style.setProperty('--y',pos.y+'%');n.style.setProperty('--area',areaColors[area.macro]);n.style.setProperty('--delay',delay+'s');n.setAttribute('aria-label',area.name+': '+area.why);n.addEventListener('mouseenter',()=>explanation.textContent=area.why);n.addEventListener('mouseleave',()=>explanation.textContent='Passe o cursor por uma área para ver como ela contribui.');n.addEventListener('focus',()=>explanation.textContent=area.why);n.addEventListener('blur',()=>explanation.textContent='Passe o cursor por uma área para ver como ela contribui.');areaWrap.appendChild(n);const line=document.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('x1','500');line.setAttribute('y1','270');line.setAttribute('x2',String(pos.x*10));line.setAttribute('y2',String(pos.y*6));line.style.setProperty('--area',areaColors[area.macro]);line.style.setProperty('--delay',(delay+.22)+'s');lineWrap.appendChild(line)});
      }
      renderProblem(selectedProblem);

      const cycleAreas=window.CM_DATA.cycleAreas;
      function polar(radius,angle){const a=(angle-90)*Math.PI/180;return{x:210+radius*Math.cos(a),y:210+radius*Math.sin(a)}}
      function donutPath(start,end){const outerStart=polar(190,start),outerEnd=polar(190,end),innerEnd=polar(88,end),innerStart=polar(88,start),large=end-start>180?1:0;return `M ${outerStart.x} ${outerStart.y} A 190 190 0 ${large} 1 ${outerEnd.x} ${outerEnd.y} L ${innerEnd.x} ${innerEnd.y} A 88 88 0 ${large} 0 ${innerStart.x} ${innerStart.y} Z`}
      const cycleSvg=document.getElementById('cycleSvg');const cycleArea=document.getElementById('cycleArea');const cycleTool=document.getElementById('cycleTool');const cycleDetail=document.getElementById('cycleDetail');
      function showCycleArea(area){cycleArea.textContent=area.name;cycleTool.textContent=area.tool;cycleDetail.style.setProperty('--detail-color',area.color)}
      cycleAreas.forEach(area=>{const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',donutPath(area.start,area.end));path.setAttribute('fill',area.color);path.setAttribute('class','basic-segment');path.setAttribute('tabindex','0');path.setAttribute('role','button');path.setAttribute('aria-label',area.name+': '+area.tool);path.addEventListener('mouseenter',()=>showCycleArea(area));path.addEventListener('focus',()=>showCycleArea(area));path.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();showCycleArea(area)}});cycleSvg.appendChild(path)});

      const areas=window.CM_DATA.areas;
      const comboMap=window.CM_DATA.comboMap;
      const chips=document.getElementById('areaChips');let selectedAreas=[];
      const areaPalette={'Matemática':'math','Física':'physics','Biologia':'biology','Computação':'computing','Linguística':'humanities','Psicologia':'humanities','Química':'chemistry','Ciências Sociais':'humanities'};
      areas.forEach(area=>{const b=document.createElement('button');b.className='area-chip';b.textContent=area;b.style.setProperty('--area',areaColors[areaPalette[area]]);b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>toggleArea(area,b));chips.appendChild(b)});
      function toggleArea(area,button){
        if(selectedAreas.includes(area))selectedAreas=selectedAreas.filter(a=>a!==area);else if(selectedAreas.length<3)selectedAreas.push(area);
        [...chips.children].forEach(b=>{const on=selectedAreas.includes(b.textContent);b.classList.toggle('selected',on);b.setAttribute('aria-pressed',String(on));b.disabled=selectedAreas.length===3&&!on});
        const key=[...selectedAreas].sort((a,b)=>a.localeCompare(b,'pt-BR')).join('|');const result=document.getElementById('researchResult');
        if(selectedAreas.length<2){result.innerHTML='<span class="result-kicker">Escolha 2 ou 3 áreas</span><div class="result-title">Sua pergunta pode estar entre elas.</div><p class="result-copy">Não existe uma combinação única: estas são apenas algumas possibilidades de pesquisa.</p>';return}
        let found=comboMap[key];
        if(!found&&selectedAreas.length===3){const pairs=[];for(let i=0;i<3;i++)for(let j=i+1;j<3;j++)pairs.push([selectedAreas[i],selectedAreas[j]].sort((a,b)=>a.localeCompare(b,'pt-BR')).join('|'));found=pairs.map(p=>comboMap[p]).find(Boolean)}
        if(!found)found=['Pesquisa interdisciplinar','Modelagem do problema','Novos métodos e perguntas'];
        result.innerHTML=`<span class="result-kicker">${selectedAreas.join(' + ')}</span><div class="result-title">${found.join(' · ')}</div><p class="result-copy">Uma combinação possível — o percurso real depende da pergunta, do projeto e da orientação.</p>`;
      }

      const projects=window.CM_DATA.projects;
      const projectSpace=document.getElementById('projectSpace');const panel=document.getElementById('projectPanel');
      projects.forEach((p,i)=>{const b=document.createElement('button');b.className='project-node';b.style.setProperty('--x',p.x+'%');b.style.setProperty('--y',p.y+'%');b.style.setProperty('--node-color',p.c);b.style.setProperty('--glow-color',p.glow);b.style.setProperty('--size',(i%3===0?'1.15rem':'.88rem'));b.setAttribute('aria-label',p.title);b.innerHTML=`<span class="dot"></span><span class="node-label">${p.short}</span>`;b.addEventListener('click',()=>openProject(p));projectSpace.appendChild(b)});
      function openProject(p){document.getElementById('panelTitle').textContent=p.title;document.getElementById('panelInst').textContent=p.inst;document.getElementById('panelAreas').textContent=p.areas;panel.classList.add('open');panel.setAttribute('aria-hidden','false')}
      document.getElementById('panelClose').addEventListener('click',()=>{panel.classList.remove('open');panel.setAttribute('aria-hidden','true')});

      const regionPositions=[
        {x:35,y:43}, {x:51,y:66}, {x:40,y:36}, {x:68,y:53}, {x:50,y:45}, {x:48,y:35}, {x:47,y:62}, {x:16,y:36}, {x:65,y:66}, {x:56,y:56}, {x:80,y:68}
      ];
      const regions=document.getElementById('regions');projects.forEach((p,i)=>{const d=document.createElement('span');d.className='region-dot';d.dataset.short=p.short;d.dataset.ox=p.x;d.dataset.oy=p.y;d.dataset.tx=regionPositions[i].x;d.dataset.ty=regionPositions[i].y;d.style.setProperty('--x',p.x+'%');d.style.setProperty('--y',p.y+'%');d.style.setProperty('--node-color',p.glow);d.style.transitionDelay=(i*.06)+'s';regions.appendChild(d)});

      showSlide(current,false);
      window.addEventListener('hashchange',()=>{const i=slides.findIndex(s=>'#'+s.id===location.hash);if(i>=0)showSlide(i,false)});
    })();

