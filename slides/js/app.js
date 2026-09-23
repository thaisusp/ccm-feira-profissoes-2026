(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const deck = document.getElementById('deck');
  const progress = document.getElementById('progress');
  const slideNumber = document.getElementById('slideNumber');
  const autoBtn = document.getElementById('autoBtn');
  const helpDialog = document.getElementById('helpDialog');
  const panel = document.getElementById('projectPanel');
  const projectSpace = document.getElementById('projectSpace');
  const regions = document.getElementById('regions');
  const areaColors = { math: 'var(--math)', physics: 'var(--physics)', chemistry: 'var(--chemistry)', biology: 'var(--biology)', computing: 'var(--computing)', humanities: 'var(--humanities)' };
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
  let selectedProblemIndex = 0;
  let selectedProjectIndex = 0;
  let touchStartX = 0;

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
    document.title = `${slides[current].dataset.title} - Ciências Moleculares`;
    if (updateHash) history.replaceState(null, '', '#' + slides[current].id);

    stopProblemCycle();
    stopProjectCycle();
    closeProjectPanel();

    if (slides[current].id === 'problemas-areas') startProblemCycle();
    if (slides[current].id === 'projetos') startProjectCycle();
    if (slides[current].id === 'diversidade') {
      requestAnimationFrame(() => setTimeout(() => document.querySelectorAll('.region-dot').forEach(d => {
        d.style.setProperty('--x', d.dataset.tx + '%');
        d.style.setProperty('--y', d.dataset.ty + '%');
      }), 120));
    } else {
      document.querySelectorAll('.region-dot').forEach(d => {
        d.style.setProperty('--x', d.dataset.ox + '%');
        d.style.setProperty('--y', d.dataset.oy + '%');
      });
    }
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
    else if (e.key === 'Escape') closeProjectPanel();
  });
  deck.addEventListener('touchstart', e => touchStartX = e.changedTouches[0].clientX, { passive: true });
  deck.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 70) move(dx < 0 ? 1 : -1);
  }, { passive: true });

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
      const n = document.createElement('span');
      n.className = 'map-area';
      n.textContent = area.name;
      n.style.setProperty('--x', pos.x + '%');
      n.style.setProperty('--y', pos.y + '%');
      n.style.setProperty('--area', areaColors[area.macro]);
      n.style.setProperty('--delay', delay + 's');
      areaWrap.appendChild(n);

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '500');
      line.setAttribute('y1', '270');
      line.setAttribute('x2', String(pos.x * 10));
      line.setAttribute('y2', String(pos.y * 6));
      line.style.setProperty('--area', areaColors[area.macro]);
      line.style.setProperty('--delay', (delay + .1) + 's');
      lineWrap.appendChild(line);
    });
  }

  function startProblemCycle() {
    renderProblem(problemKeys[selectedProblemIndex]);
    problemTimer = setInterval(() => {
      selectedProblemIndex = (selectedProblemIndex + 1) % problemKeys.length;
      renderProblem(problemKeys[selectedProblemIndex]);
    }, 2700);
  }

  function stopProblemCycle() {
    if (!problemTimer) return;
    clearInterval(problemTimer);
    problemTimer = null;
  }

  const cycleAreas = window.CM_DATA.cycleAreas;
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
    cycleTool.textContent = area.tool;
    cycleDetail.style.setProperty('--detail-color', area.color);
  }

  cycleAreas.forEach(area => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', donutPath(area.start, area.end));
    path.setAttribute('fill', area.color);
    path.setAttribute('class', 'basic-segment');
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

  const projects = window.CM_DATA.projects;
  const projectButtons = [];
  projects.forEach((p, i) => {
    const b = document.createElement('button');
    b.className = 'project-node';
    b.style.setProperty('--x', p.x + '%');
    b.style.setProperty('--y', p.y + '%');
    b.style.setProperty('--node-color', p.c);
    b.style.setProperty('--glow-color', p.glow);
    b.style.setProperty('--size', (i % 3 === 0 ? '1.15rem' : '.88rem'));
    b.setAttribute('aria-label', p.title);
    b.innerHTML = `<span class="dot"></span><span class="node-label">${p.short}</span>`;
    b.addEventListener('click', () => {
      pauseAuto();
      openProject(p, i);
    });
    projectButtons.push(b);
    projectSpace.appendChild(b);
  });

  function openProject(p, index) {
    selectedProjectIndex = index;
    projectButtons.forEach((button, i) => button.classList.toggle('active-project', i === index));
    document.getElementById('panelTitle').textContent = p.title;
    document.getElementById('panelInst').textContent = p.inst;
    document.getElementById('panelAreas').textContent = p.areas;
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
  }

  function startProjectCycle() {
    openProject(projects[selectedProjectIndex], selectedProjectIndex);
    projectTimer = setInterval(() => {
      selectedProjectIndex = (selectedProjectIndex + 1) % projects.length;
      openProject(projects[selectedProjectIndex], selectedProjectIndex);
    }, 2300);
  }

  function stopProjectCycle() {
    if (!projectTimer) return;
    clearInterval(projectTimer);
    projectTimer = null;
    projectButtons.forEach(button => button.classList.remove('active-project'));
  }

  document.getElementById('panelClose').addEventListener('click', () => {
    pauseAuto();
    stopProjectCycle();
    closeProjectPanel();
  });

  const regionPositions = [
    { x: 35, y: 43 }, { x: 51, y: 66 }, { x: 40, y: 36 }, { x: 68, y: 53 }, { x: 50, y: 45 }, { x: 48, y: 35 }, { x: 47, y: 62 }, { x: 16, y: 36 }, { x: 65, y: 66 }, { x: 56, y: 56 }, { x: 80, y: 68 }
  ];
  projects.forEach((p, i) => {
    const d = document.createElement('span');
    d.className = 'region-dot';
    d.dataset.short = p.short;
    d.dataset.ox = p.x;
    d.dataset.oy = p.y;
    d.dataset.tx = regionPositions[i].x;
    d.dataset.ty = regionPositions[i].y;
    d.style.setProperty('--x', p.x + '%');
    d.style.setProperty('--y', p.y + '%');
    d.style.setProperty('--node-color', p.glow);
    d.style.transitionDelay = (i * .06) + 's';
    regions.appendChild(d);
  });

  showSlide(current, false);
  startAuto();
  window.addEventListener('hashchange', () => {
    const i = slides.findIndex(s => '#' + s.id === location.hash);
    if (i >= 0) showSlide(i, false);
  });
})();
