(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const deck = document.getElementById('deck');
  const progress = document.getElementById('progress');
  const slideNumber = document.getElementById('slideNumber');
  const autoBtn = document.getElementById('autoBtn');
  const helpDialog = document.getElementById('helpDialog');
  const panel = document.getElementById('projectPanel');
  const projectSpace = document.getElementById('projectSpace');
  const projectLines = document.getElementById('projectLines');
  const projectLegend = document.getElementById('projectLegend');
  const areaColors = { math: 'var(--math)', physics: 'var(--physics)', chemistry: 'var(--chemistry)', biology: 'var(--biology)', computing: 'var(--computing)', humanities: 'var(--humanities)', earth: 'var(--earth)', health: 'var(--health)', linguistics: 'var(--linguistics)' };
  const problemDisplayPalette = ['#FF7A1A', '#F43F5E', '#2563EB', '#06A9C7', '#166534', '#19B789', '#A78BFA', '#F2B90C', '#EC4899'];
  const problemMapData = window.CM_DATA.problemMapData;
  const problemKeys = Object.keys(problemMapData);
  const areaPositions = {
    4: [{ x: 50, y: 10 }, { x: 86, y: 38 }, { x: 50, y: 70 }, { x: 14, y: 38 }],
    5: [{ x: 50, y: 10 }, { x: 86, y: 30 }, { x: 73, y: 69 }, { x: 27, y: 69 }, { x: 14, y: 30 }]
  };

  let current = Math.max(0, slides.findIndex(s => '#' + s.id === location.hash));
  let autoTimer = null;
  let problemTimer = null;
  let projectTimer = null;
  let questionTimer = null;
  let cycleTimer = null;
  let selectedProblemIndex = 0;
  let selectedProjectIndex = 0;
  let selectedQuestionIndex = 0;
  let selectedCycleIndex = 0;
  let touchStartX = 0;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function pad(n) { return String(n).padStart(2, '0'); }

  function showSlide(next, updateHash = true) {
    next = Math.max(0, Math.min(slides.length - 1, next));
    slides.forEach((s, i) => {
      s.classList.toggle('active', i === next);
      s.classList.toggle('was-active', i < next);
    });
    current = next;
    slideNumber.textContent = `${pad(current + 1)} / ${pad(slides.length)}`;
    progress.style.width = `${((current + 1) / slides.length) * 100}%`;
    document.body.classList.toggle('dark-active', slides[current].classList.contains('dark'));
    document.body.dataset.slide = slides[current].id;
    document.title = `${slides[current].dataset.title} - Ciências Moleculares`;
    if (updateHash) history.replaceState(null, '', '#' + slides[current].id);

    stopProblemCycle();
    stopProjectCycle();
    stopQuestionCycle();
    stopCycleRotation();
    closeProjectPanel();

    if (slides[current].id === 'problema') startQuestionCycle();
    if (slides[current].id === 'problemas-areas') startProblemCycle();
    if (slides[current].id === 'ciclo-basico') startCycleRotation();
    if (slides[current].id === 'projetos') startProjectCycle();
  }

  function move(delta) {
    pauseAuto();
    showSlide(current + delta);
  }

  function startAuto() {
    if (autoTimer) return;
    autoBtn.setAttribute('aria-pressed', 'true');
    autoBtn.setAttribute('aria-label', 'Pausar avanço automático');
    autoTimer = setInterval(() => showSlide(current === slides.length - 1 ? 0 : current + 1), 8500);
  }

  function pauseAuto() {
    if (!autoTimer) return;
    clearInterval(autoTimer);
    autoTimer = null;
    autoBtn.setAttribute('aria-pressed', 'false');
    autoBtn.setAttribute('aria-label', 'Retomar avanço automático');
  }

  function toggleAuto() {
    if (autoTimer) pauseAuto();
    else startAuto();
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }

  function closeProjectPanel() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
  }

  document.getElementById('prevBtn').addEventListener('click', () => move(-1));
  document.getElementById('nextBtn').addEventListener('click', () => move(1));
  document.getElementById('fullBtn').addEventListener('click', toggleFullscreen);
  autoBtn.addEventListener('click', toggleAuto);
  deck.addEventListener('pointerdown', () => { if (autoTimer) pauseAuto(); }, { passive: true });

  document.getElementById('helpBtn').addEventListener('click', () => helpDialog.classList.add('open'));
  helpDialog.addEventListener('click', e => { if (e.target === helpDialog) helpDialog.classList.remove('open'); });
  document.addEventListener('keydown', e => {
    if (helpDialog.classList.contains('open')) {
      if (e.key === 'Escape') helpDialog.classList.remove('open');
      return;
    }
    if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Home') { pauseAuto(); showSlide(0); }
    else if (e.key === 'End') { pauseAuto(); showSlide(slides.length - 1); }
    else if (e.key.toLowerCase() === 'f') toggleFullscreen();
    else if (e.key.toLowerCase() === 'a') toggleAuto();
    else if (e.key === '?') helpDialog.classList.add('open');
    else if (e.key === 'Escape') {
      stopProjectCycle();
      closeProjectPanel();
    }
  });
  deck.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].clientX, { passive: true });
  deck.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 70) move(dx < 0 ? 1 : -1);
  }, { passive: true });

  const questionPills = [...document.querySelectorAll('.auto-question')];
  function highlightQuestion(index) {
    selectedQuestionIndex = index;
    questionPills.forEach((pill, i) => pill.classList.toggle('active-question', i === index));
  }

  function startQuestionCycle() {
    highlightQuestion(selectedQuestionIndex);
    questionTimer = setInterval(() => {
      highlightQuestion((selectedQuestionIndex + 1) % questionPills.length);
    }, 1900);
  }

  function stopQuestionCycle() {
    if (!questionTimer) return;
    clearInterval(questionTimer);
    questionTimer = null;
    questionPills.forEach(pill => pill.classList.remove('active-question'));
  }

  function renderProblem(key) {
    const data = problemMapData[key];
    const areaWrap = document.getElementById('mapAreas');
    const lineWrap = document.getElementById('mapLines');
    const explanation = document.getElementById('mapExplanation');
    document.getElementById('mapCenter').textContent = data.question;
    areaWrap.innerHTML = '';
    lineWrap.innerHTML = '';
    explanation.textContent = data.areas.map(area => area.name).join(' + ');
    const positions = areaPositions[data.areas.length] || areaPositions[5];
    data.areas.forEach((area, i) => {
      const pos = positions[i];
      const delay = .18 + i * .18;
      const displayColor = problemDisplayPalette[(selectedProblemIndex + i) % problemDisplayPalette.length] || areaColors[area.macro];
      const n = document.createElement('span');
      n.className = 'map-area';
      n.textContent = area.name;
      n.style.setProperty('--x', pos.x + '%');
      n.style.setProperty('--y', pos.y + '%');
      n.style.setProperty('--area', displayColor);
      n.style.setProperty('--delay', delay + 's');
      areaWrap.appendChild(n);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '500');
      line.setAttribute('y1', '270');
      line.setAttribute('x2', String(pos.x * 10));
      line.setAttribute('y2', String(pos.y * 6));
      line.style.setProperty('--area', displayColor);
      line.style.setProperty('--delay', (delay + .1) + 's');
      lineWrap.appendChild(line);
    });
  }

  function startProblemCycle() {
    renderProblem(problemKeys[selectedProblemIndex]);
    problemTimer = setInterval(() => {
      selectedProblemIndex = (selectedProblemIndex + 1) % problemKeys.length;
      renderProblem(problemKeys[selectedProblemIndex]);
    }, 5200);
  }

  function stopProblemCycle() {
    if (!problemTimer) return;
    clearInterval(problemTimer);
    problemTimer = null;
  }

  const cycleAreas = window.CM_DATA.cycleAreas;
  const cycleSubareas = {
    'Matemática': ['Cálculo', 'Álgebra linear', 'Geometria analítica', 'Equações diferenciais', 'Probabilidade', 'Análise matemática'],
    'Física': ['Mecânica', 'Ondas', 'Termodinâmica', 'Eletromagnetismo', 'Relatividade', 'Mecânica quântica'],
    'Química': ['Química geral', 'Estrutura atômica e molecular', 'Físico-química', 'Química inorgânica', 'Espectroscopia', 'Química orgânica'],
    'Biologia': ['Bioquímica', 'Biologia molecular', 'Biologia celular', 'Genética', 'Evolução', 'Fisiologia e sistemas biológicos'],
    'Computação': ['Programação', 'Algoritmos', 'Estruturas de dados', 'Grafos', 'Métodos numéricos', 'Modelagem computacional']
  };
  const cycleSvg = document.getElementById('cycleSvg');
  const cycleArea = document.getElementById('cycleArea');
  const cycleTool = document.getElementById('cycleTool');
  const cycleDetail = document.getElementById('cycleDetail');

  function polar(radius, angle) {
    const a = (angle - 90) * Math.PI / 180;
    return { x: 210 + radius * Math.cos(a), y: 210 + radius * Math.sin(a) };
  }

  function donutPath(start, end) {
    const outerStart = polar(190, start);
    const outerEnd = polar(190, end);
    const innerEnd = polar(88, end);
    const innerStart = polar(88, start);
    const large = end - start > 180 ? 1 : 0;
    return `M ${outerStart.x} ${outerStart.y} A 190 190 0 ${large} 1 ${outerEnd.x} ${outerEnd.y} L ${innerEnd.x} ${innerEnd.y} A 88 88 0 ${large} 0 ${innerStart.x} ${innerStart.y} Z`;
  }

  function showCycleArea(area) {
    cycleArea.textContent = area.name;
    cycleTool.textContent = cycleSubareas[area.name].join(' · ');
    cycleDetail.style.setProperty('--detail-color', area.color);
    [...cycleSvg.querySelectorAll('.basic-segment')].forEach(path => {
      path.classList.toggle('active-segment', path.dataset.area === area.name);
    });
  }

  cycleAreas.forEach((area, index) => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', donutPath(area.start, area.end));
    path.setAttribute('fill', area.color);
    path.setAttribute('class', 'basic-segment');
    path.dataset.area = area.name;
    path.setAttribute('tabindex', '0');
    path.setAttribute('role', 'button');
    path.setAttribute('aria-label', area.name + ': ' + area.tool);
    path.addEventListener('mouseenter', () => showCycleArea(area));
    path.addEventListener('focus', () => showCycleArea(area));
    path.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        showCycleArea(area);
      }
    });
    cycleSvg.appendChild(path);
  });

  function startCycleRotation() {
    showCycleArea(cycleAreas[selectedCycleIndex]);
    cycleTimer = setInterval(() => {
      selectedCycleIndex = (selectedCycleIndex + 1) % cycleAreas.length;
      showCycleArea(cycleAreas[selectedCycleIndex]);
    }, 1700);
  }

  function stopCycleRotation() {
    if (!cycleTimer) return;
    clearInterval(cycleTimer);
    cycleTimer = null;
    [...cycleSvg.querySelectorAll('.basic-segment')].forEach(path => path.classList.remove('active-segment'));
  }

  const projects = window.CM_DATA.projects;
  const denseProjectGraph = projects.length > 30;
  const projectLinks = window.CM_DATA.projectLinks || [];
  const projectById = new Map(projects.map(project => [project.id, project]));
  const linkElements = [];
  const projectButtons = [];
  (window.CM_DATA.projectAreaLegend || []).forEach(area => {
    const item = document.createElement('span');
    item.className = 'legend-item';
    item.innerHTML = `<span class="legend-dot" style="--legend-color:${area.color}"></span><span>${area.name}</span>`;
    projectLegend.appendChild(item);
  });
  projectLinks.forEach(link => {
    const source = projectById.get(link.source);
    const target = projectById.get(link.target);
    if (!source || !target) return;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.classList.add('project-link');
    line.dataset.source = link.source;
    line.dataset.target = link.target;
    line.setAttribute('x1', source.x);
    line.setAttribute('y1', source.y);
    line.setAttribute('x2', target.x);
    line.setAttribute('y2', target.y);
    projectLines.appendChild(line);
    linkElements.push(line);
  });
  projects.forEach((p, i) => {
    const b = document.createElement('button');
    b.className = 'project-node';
    b.style.setProperty('--x', p.x + '%');
    b.style.setProperty('--y', p.y + '%');
    b.style.setProperty('--ring-bg', p.ring);
    b.style.setProperty('--primary-color', p.primaryColor);
    b.style.setProperty('--size', denseProjectGraph ? (p.areas.length > 1 ? '1.08rem' : '.92rem') : (p.areas.length > 1 ? '1.42rem' : '1.2rem'));
    b.setAttribute('aria-label', p.title);
    b.innerHTML = `<span class="dot"></span><span class="node-label">${p.short}</span>`;
    b.addEventListener('click', () => {
      pauseAuto();
      stopProjectCycle();
      openProject(p, i);
    });
    projectButtons.push(b);
    projectSpace.appendChild(b);
  });

  function openProject(p, index) {
    selectedProjectIndex = index;
    projectButtons.forEach((button, i) => button.classList.toggle('active-project', i === index));
    linkElements.forEach(line => {
      line.classList.toggle('active-link', line.dataset.source === p.id || line.dataset.target === p.id);
    });
    document.getElementById('panelTitle').textContent = p.title;
    const panelInst = document.getElementById('panelInst');
    panelInst.replaceChildren();
    p.areas.forEach(area => {
      const marker = document.createElement('span');
      marker.className = 'panel-area';
      marker.style.setProperty('--area-color', window.CM_DATA.projectAreaColors[area] || '#64748b');
      marker.textContent = area;
      panelInst.appendChild(marker);
    });
    document.getElementById('panelAreas').textContent = p.subareas.join(' · ');
    panel.classList.toggle('panel-left', p.x > 65);
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
  }

  function startProjectCycle() {
    if (projectTimer || !projects.length) return;
    projectTimer = setTimeout(() => {
      openProject(projects[selectedProjectIndex], selectedProjectIndex);
      if (reduceMotion) {
        projectTimer = null;
        return;
      }
      projectTimer = setInterval(() => {
        selectedProjectIndex = (selectedProjectIndex + 1) % projects.length;
        openProject(projects[selectedProjectIndex], selectedProjectIndex);
      }, 3200);
    }, 900);
  }

  function stopProjectCycle(clearFocus = true) {
    if (projectTimer) {
      clearInterval(projectTimer);
      clearTimeout(projectTimer);
      projectTimer = null;
    }
    if (!clearFocus) return;
    projectButtons.forEach(button => button.classList.remove('active-project'));
    linkElements.forEach(line => line.classList.remove('active-link'));
  }

  document.getElementById('panelClose').addEventListener('click', () => {
    pauseAuto();
    stopProjectCycle();
    closeProjectPanel();
  });

  projectSpace.addEventListener('pointerenter', () => {
    if (slides[current].id === 'projetos') stopProjectCycle(false);
  });

  document.addEventListener('click', event => {
    if (slides[current].id !== 'projetos' || !panel.classList.contains('open')) return;
    if (panel.contains(event.target) || event.target.closest('.project-node')) return;
    stopProjectCycle();
    closeProjectPanel();
  });

  showSlide(current, false);
  startAuto();
  window.addEventListener('hashchange', () => {
    const i = slides.findIndex(s => '#' + s.id === location.hash);
    if (i >= 0) showSlide(i, false);
  });
})();
