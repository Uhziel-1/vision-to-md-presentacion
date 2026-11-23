(() => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const progressFill = document.getElementById('progressFill');
  const counterEl = document.getElementById('slideCounter');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnFs = document.getElementById('btnFs');
  const dotsRoot = document.getElementById('navDots');
  const btnDrawer = document.getElementById('btnDrawer');
  const drawer = document.getElementById('drawer');
  const backdrop = document.getElementById('drawerBackdrop');
  const btnCloseDrawer = document.getElementById('btnCloseDrawer');
  const drawerList = document.getElementById('drawerList');
  const lightbox = document.getElementById('lightbox');
  const lbImg = document.getElementById('lbImg');
  const lbCap = document.getElementById('lbCap');

  let current = 0;

  // Inicializar paneles mixtos (Código <-> Gráfica) a la izquierda
  slides.forEach((slide) => {
    const panel = slide.querySelector('.media-panel');
    if (!panel) return;
    const views = Array.from(panel.querySelectorAll('.media-view'));
    const capEl = panel.querySelector('.media-caption');
    const cntEl = panel.querySelector('.img-counter');
    const prevBtn = panel.querySelector('.img-prev');
    const nextBtn = panel.querySelector('.img-next');
    let vIdx = 0;

    const renderView = () => {
      views.forEach((v, i) => {
        v.style.display = i === vIdx ? 'flex' : 'none';
      });
      capEl.textContent = views[vIdx].dataset.caption || '';
      cntEl.textContent = `${vIdx + 1} / ${views.length}`;
    };

    if (views.length <= 1) {
      prevBtn.style.display = 'none';
      nextBtn.style.display = 'none';
    } else {
      prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        vIdx = (vIdx - 1 + views.length) % views.length;
        renderView();
      });
      nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        vIdx = (vIdx + 1) % views.length;
        renderView();
      });
    }

    views.forEach((v) => {
      if (v.classList.contains('img-box')) {
        v.addEventListener('click', () => {
          const img = v.querySelector('img');
          lbImg.src = img.src;
          lbCap.textContent = v.dataset.caption || '';
          lightbox.classList.add('open');
        });
      }
    });

    slide._stepView = (dir) => {
      if (views.length <= 1) return;
      vIdx = (vIdx + dir + views.length) % views.length;
      renderView();
    };

    renderView();
  });

  // Círculos agrupados por color de Fase + Drawer derecho
  const groups = new Map();
  slides.forEach((s, idx) => {
    const g = s.dataset.group || '0';
    const color = s.dataset.color || '#0f172a';
    const title = s.dataset.title || `Hoja ${idx + 1}`;
    const isSep = s.dataset.kind === 'title';

    if (!groups.has(g)) {
      const grpEl = document.createElement('div');
      grpEl.className = 'dot-group';
      dotsRoot.appendChild(grpEl);
      groups.set(g, grpEl);
    }

    const dot = document.createElement('button');
    dot.className = 'nav-dot' + (isSep ? ' is-section' : '');
    dot.style.setProperty('--dot-c', color);
    dot.title = `${idx + 1}. ${title}`;
    dot.addEventListener('click', () => goTo(idx));
    groups.get(g).appendChild(dot);

    const item = document.createElement('button');
    item.className = 'drawer-item' + (isSep ? ' is-sep' : '');
    item.innerHTML = `
      <span class="drawer-swatch" style="background:${color}"></span>
      <span class="drawer-num">${String(idx + 1).padStart(2, '0')}</span>
      <span class="drawer-title">${title}</span>
    `;
    item.addEventListener('click', () => {
      goTo(idx);
      toggleDrawer(false);
    });
    drawerList.appendChild(item);
  });

  const allDots = Array.from(document.querySelectorAll('.nav-dot'));
  const allDrawerItems = Array.from(document.querySelectorAll('.drawer-item'));

  function goTo(index) {
    if (index < 0 || index >= slides.length) return;
    slides[current].classList.remove('active');
    allDots[current].classList.remove('active');
    allDrawerItems[current].classList.remove('active');

    current = index;
    const activeSlide = slides[current];
    activeSlide.classList.add('active');
    allDots[current].classList.add('active');
    allDrawerItems[current].classList.add('active');

    const color = activeSlide.dataset.color || '#0f172a';
    document.documentElement.style.setProperty('--accent', color);

    progressFill.style.width = `${((current + 1) / slides.length) * 100}%`;
    counterEl.textContent = `${String(current + 1).padStart(2, '0')} / ${slides.length}`;
    btnPrev.disabled = current === 0;
    btnNext.disabled = current === slides.length - 1;
  }

  function toggleDrawer(force) {
    const open = typeof force === 'boolean' ? force : !drawer.classList.contains('open');
    drawer.classList.toggle('open', open);
    backdrop.classList.toggle('open', open);
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }

  btnPrev.addEventListener('click', () => goTo(current - 1));
  btnNext.addEventListener('click', () => goTo(current + 1));
  btnFs.addEventListener('click', toggleFullscreen);
  btnDrawer.addEventListener('click', () => toggleDrawer());
  btnCloseDrawer.addEventListener('click', () => toggleDrawer(false));
  backdrop.addEventListener('click', () => toggleDrawer(false));
  lightbox.addEventListener('click', () => lightbox.classList.remove('open'));

  document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('open')) {
      if (e.key === 'Escape') lightbox.classList.remove('open');
      return;
    }
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      goTo(current + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      goTo(current - 1);
    } else if (e.key === 'f' || e.key === 'F') {
      toggleFullscreen();
    } else if (e.key === 'm' || e.key === 'M' || e.key === 'i' || e.key === 'I') {
      toggleDrawer();
    } else if (e.key === ']') {
      slides[current]._stepView?.(1);
    } else if (e.key === '[') {
      slides[current]._stepView?.(-1);
    } else if (e.key === 'Escape') {
      toggleDrawer(false);
    }
  });

  goTo(0);
})();
