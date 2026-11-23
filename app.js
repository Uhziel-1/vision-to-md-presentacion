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

  // Inicializar galerías de imágenes en diapositivas con .media-panel
  slides.forEach((slide) => {
    const panel = slide.querySelector('.media-panel');
    if (!panel) return;
    const raw = panel.dataset.images;
    if (!raw) return;
    const items = JSON.parse(raw);
    let imgIdx = 0;

    const stage = panel.querySelector('.media-stage');
    const imgEl = panel.querySelector('.media-stage img');
    const capEl = panel.querySelector('.media-caption');
    const cntEl = panel.querySelector('.img-counter');
    const prevImg = panel.querySelector('.img-prev');
    const nextImg = panel.querySelector('.img-next');

    const renderImg = () => {
      const item = items[imgIdx];
      imgEl.style.opacity = '0.35';
      imgEl.src = item.src;
      imgEl.alt = item.caption;
      imgEl.onload = () => { imgEl.style.opacity = '1'; };
      capEl.textContent = item.caption;
      cntEl.textContent = `${imgIdx + 1} / ${items.length}`;
    };

    if (items.length <= 1) {
      prevImg.style.display = 'none';
      nextImg.style.display = 'none';
    } else {
      prevImg.addEventListener('click', (e) => {
        e.stopPropagation();
        imgIdx = (imgIdx - 1 + items.length) % items.length;
        renderImg();
      });
      nextImg.addEventListener('click', (e) => {
        e.stopPropagation();
        imgIdx = (imgIdx + 1) % items.length;
        renderImg();
      });
    }

    stage.addEventListener('click', () => {
      lbImg.src = items[imgIdx].src;
      lbCap.textContent = items[imgIdx].caption;
      lightbox.classList.add('open');
    });

    slide._stepImage = (dir) => {
      if (items.length <= 1) return;
      imgIdx = (imgIdx + dir + items.length) % items.length;
      renderImg();
    };

    renderImg();
  });

  // Construir círculos agrupados por color de sección mayor + drawer derecho
  const groups = new Map();
  slides.forEach((s, idx) => {
    const g = s.dataset.group || '0';
    const color = s.dataset.color || '#1e293b';
    const title = s.dataset.title || `Diapositiva ${idx + 1}`;
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
    dot.setAttribute('aria-label', dot.title);
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

    const color = activeSlide.dataset.color || '#1e293b';
    document.documentElement.style.setProperty('--accent', color);

    const pct = ((current + 1) / slides.length) * 100;
    progressFill.style.width = `${pct}%`;
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
      slides[current]._stepImage?.(1);
    } else if (e.key === '[') {
      slides[current]._stepImage?.(-1);
    } else if (e.key === 'Escape') {
      toggleDrawer(false);
    }
  });

  goTo(0);
})();
