/**
 * TRULY — СИСТЕМНЫЙ СКРИПТ
 * Физический движок Antigravity + Scroll Reveal + Интерактивный Showreel
 */

document.addEventListener('DOMContentLoaded', () => {
  initTrueAntigravityPhysics();
  initScrollReveal();
  initThemeToggle();
  initLangToggle();
  initHeaderNav();
  initMobileDrawer();
  initShowreelPreview();
  initStatusTabs();
  initFaqAccordion();
  initAuthModal();
});

/* ==========================================================================
   1. ФИЗИЧЕСКИЙ ДВИЖОК ЧАСТИЦ ANTIGRAVITY (Волновое поле, инерция и закручивание)
   ========================================================================== */
function initTrueAntigravityPhysics() {
  const oldCanvas = document.getElementById('heroParticles');
  const hero = document.getElementById('hero');
  if (!oldCanvas || !hero) return;
  const canvas = oldCanvas.cloneNode(true);
  oldCanvas.parentNode.replaceChild(canvas, oldCanvas);
  const ctx = canvas.getContext('2d');

  let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), pts = [];
  const SPACING = 24;

  const mouse = {
    x: 0, y: 0,
    targetX: 0, targetY: 0,
    vx: 0, vy: 0,
    speed: 0,
    active: false
  };

  function resize() {
    const r = hero.getBoundingClientRect();
    w = r.width || window.innerWidth;
    h = r.height || window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (!mouse.active) {
      mouse.x = mouse.targetX = w * 0.5;
      mouse.y = mouse.targetY = h * 0.48;
    }

    pts = [];
    const cols = Math.ceil(w / SPACING) + 2;
    const rows = Math.ceil(h / SPACING) + 2;
    const ox = (w - (cols - 1) * SPACING) * 0.5;
    const oy = (h - (rows - 1) * SPACING) * 0.5;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const s = 0.75 + Math.random() * 0.5;
        pts.push({
          x: ox + col * SPACING,
          y: oy + row * SPACING,
          ox: ox + col * SPACING,
          oy: oy + row * SPACING,
          vx: 0, vy: 0,
          phase: Math.random() * 6.28,
          scale: s,
          s: s
        });
      }
    }
  }

  function getColor(angle, alpha) {
    const deg = ((angle * 180) / Math.PI + 360) % 360;
    let r, g, b;
    if (deg >= 240 || deg < 70) { r = 59; g = 130; b = 246; }
    else if (deg >= 70 && deg < 125) { const t = (deg - 70) / 55; r = Math.round(59 + 170 * t); g = Math.round(130 - 75 * t); b = Math.round(246 - 130 * t); }
    else if (deg >= 125 && deg < 200) { const t = (deg - 125) / 75; r = 249; g = Math.round(55 + 95 * Math.sin(t * Math.PI)); b = Math.round(50 - 30 * Math.sin(t * Math.PI)); }
    else { const t = (deg - 200) / 40; r = Math.round(200 - 141 * t); g = Math.round(50 + 80 * t); b = Math.round(200 + 46 * t); }
    return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
  }

  window.addEventListener('mousemove', (e) => {
    const r = hero.getBoundingClientRect();
    mouse.targetX = e.clientX - r.left;
    mouse.targetY = e.clientY - r.top;
    mouse.active = true;
  }, { passive: true });

  window.addEventListener('mouseleave', () => { mouse.active = false; });
  window.addEventListener('resize', resize);
  resize();

  let time = 0;
  function loop() {
    time += 0.016;
    const dx = mouse.targetX - mouse.x;
    const dy = mouse.targetY - mouse.y;
    mouse.vx = mouse.vx * 0.75 + dx * 0.08;
    mouse.vy = mouse.vy * 0.75 + dy * 0.08;
    mouse.x += mouse.vx;
    mouse.y += mouse.vy;
    mouse.speed = Math.hypot(mouse.vx, mouse.vy);

    ctx.clearRect(0, 0, w, h);
    const dotCol = 'rgba(148,163,184,0.18)';
    const fieldRadius = Math.min(w, h) * 0.38;

    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const wave = Math.sin(time * 1.2 + p.phase) * 1.5;
      const targetX = p.ox + wave;
      const targetY = p.oy + wave;

      const mdx = p.x - mouse.x;
      const mdy = p.y - mouse.y;
      const mdist = Math.hypot(mdx, mdy);

      if (mdist < fieldRadius && mdist > 2) {
        const power = Math.pow(1 - mdist / fieldRadius, 1.8);
        const angle = Math.atan2(mdy, mdx);
        const pushForce = power * 22;
        const swirl = power * mouse.speed * 0.15;

        const idealX = targetX + Math.cos(angle + swirl) * pushForce;
        const idealY = targetY + Math.sin(angle + swirl) * pushForce;

        p.vx = (p.vx + (idealX - p.x) * 0.12) * 0.78;
        p.vy = (p.vy + (idealY - p.y) * 0.12) * 0.78;
      } else {
        p.vx = (p.vx + (targetX - p.x) * 0.08) * 0.82;
        p.vy = (p.vy + (targetY - p.y) * 0.08) * 0.82;
      }

      p.x += p.vx;
      p.y += p.vy;

      const displace = Math.hypot(p.x - p.ox, p.y - p.oy);
      if (displace > 1.5) {
        const ang = Math.atan2(p.y - p.oy, p.x - p.ox);
        const intensity = Math.min(1, displace / 16);
        const len = (2.2 + intensity * 6.5) * p.s;
        const thick = (1.6 + intensity * 2.2) * p.s;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(ang);
        ctx.beginPath();
        ctx.strokeStyle = getColor(ang, Math.min(0.95, 0.2 + intensity * 0.8));
        ctx.lineWidth = thick;
        ctx.lineCap = 'round';
        ctx.moveTo(-len * 0.5, 0);
        ctx.lineTo(len * 0.5, 0);
        ctx.stroke();
        ctx.restore();
      } else {
        ctx.fillStyle = dotCol;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.0, 0, 6.28);
        ctx.fill();
      }
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

/* ==========================================================================
   2. АНИМАЦИЯ «СТРОИТЕЛЬСТВА» САЙТА ПРИ ПРОКРУТКЕ (SCROLL REVEAL)
   ========================================================================== */
function initScrollReveal() {
  const reveals = document.querySelectorAll('.reveal-section');
  if (!reveals.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('is-visible'));
  }
}

/* ==========================================================================
   3. ШАПКА: НАВИГАЦИЯ И ОТСЛЕЖИВАНИЕ СКРОЛЛА
   ========================================================================== */
function initHeaderNav() {
  const links = document.querySelectorAll('.nav-link');
  if (links.length === 0) return;

  links.forEach(link => {
    link.addEventListener('click', () => {
      links.forEach(l => l.classList.remove('is-active'));
      link.classList.add('is-active');
    });
  });

  const sections = [
    { id: 'video', link: document.querySelector('.nav-link[href="#video"]') },
    { id: 'how-it-works', link: document.querySelector('.nav-link[href="#how-it-works"]') },
    { id: 'pricing', link: document.querySelector('.nav-link[href="#pricing"]') },
    { id: 'faq', link: document.querySelector('.nav-link[href="#faq"]') }
  ];

  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY + 160;
    sections.forEach(sec => {
      const el = document.getElementById(sec.id);
      if (el && sec.link) {
        const top = el.offsetTop;
        const height = el.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          links.forEach(l => l.classList.remove('is-active'));
          sec.link.classList.add('is-active');
        }
      }
    });
  }, { passive: true });
}

/* ==========================================================================
   4. МОБИЛЬНАЯ ШТОРКА МЕНЮ
   ========================================================================== */
function initMobileDrawer() {
  const btn = document.querySelector('.js-mobile-menu-btn');
  const drawer = document.querySelector('.js-mobile-drawer');
  if (!btn || !drawer) return;

  function toggle() {
    const isOpen = drawer.classList.contains('is-open');
    drawer.classList.toggle('is-open', !isOpen);
    drawer.setAttribute('aria-hidden', String(isOpen));
  }

  btn.addEventListener('click', toggle);

  const closeItems = drawer.querySelectorAll('.js-drawer-close');
  closeItems.forEach(item => {
    item.addEventListener('click', () => {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
    });
  });

  document.addEventListener('click', (e) => {
    if (!drawer.contains(e.target) && !btn.contains(e.target) && drawer.classList.contains('is-open')) {
      drawer.classList.remove('is-open');
      drawer.setAttribute('aria-hidden', 'true');
    }
  });
}

/* ==========================================================================
   5. ТРИ СТАТУСА: ИНТЕРАКТИВНЫЕ ВКЛАДКИ
   ========================================================================== */
function initStatusTabs() {
  const tabs = document.querySelectorAll('.js-status-tab');
  const titleEl = document.getElementById('statusDisplayTitle');
  const descEl = document.getElementById('statusDisplayDesc');
  const badgeContainer = document.getElementById('statusBadgeContainer');
  const mockBadge = document.getElementById('statusMockBadge');

  if (!tabs.length || !titleEl || !descEl || !badgeContainer || !mockBadge) return;

  const STATUS_DATA = {
    pass: {
      title: 'Всё подходит',
      desc: 'Код валиден, введён в оборот и принадлежит продавцу.',
      badgeHtml: `
        <span class="status-badge status-badge-pass">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <span>Всё подходит</span>
        </span>
      `
    },
    warn: {
      title: 'Надо проверить',
      desc: 'Нужна передача прав через УПД или ЭДО, либо категория товара находится в эксперименте.',
      badgeHtml: `
        <span class="status-badge status-badge-warn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          <span>Надо проверить</span>
        </span>
      `
    },
    fail: {
      title: 'Не допустимо',
      desc: 'Код выведен из оборота, продан, является дубликатом или фальсификатом.',
      badgeHtml: `
        <span class="status-badge status-badge-fail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
          <span>Не допустимо</span>
        </span>
      `
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const statusKey = tab.getAttribute('data-status');
      const data = STATUS_DATA[statusKey];
      if (!data) return;

      tabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      titleEl.textContent = data.title;
      descEl.textContent = data.desc;
      badgeContainer.innerHTML = data.badgeHtml;
      mockBadge.innerHTML = data.badgeHtml;
    });
  });
}

/* ==========================================================================
   6. АККОРДЕОН FAQ
   ========================================================================== */
function initFaqAccordion() {
  const triggers = document.querySelectorAll('.js-faq-trigger');
  triggers.forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.faq-item');
      if (!item) return;

      const content = item.querySelector('.faq-content');
      const isOpen = item.classList.contains('is-open');

      document.querySelectorAll('.faq-item.is-open').forEach(other => {
        if (other !== item) {
          other.classList.remove('is-open');
          const otherContent = other.querySelector('.faq-content');
          if (otherContent) otherContent.style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove('is-open');
        if (content) content.style.maxHeight = null;
      } else {
        item.classList.add('is-open');
        if (content) content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}

/* ==========================================================================
   7. МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ / РЕГИСТРАЦИИ
   ========================================================================== */
function initAuthModal() {
  const modal = document.getElementById('authModal');
  if (!modal) return;

  const openBtns = document.querySelectorAll('.js-open-auth');
  const closeBtns = document.querySelectorAll('.js-close-modal');
  const tabBtns = document.querySelectorAll('.js-modal-tab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  function openModal(tab = 'register') {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    switchTab(tab);
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function switchTab(tab) {
    tabBtns.forEach(btn => {
      const isActive = btn.getAttribute('data-tab') === tab;
      btn.classList.toggle('is-active', isActive);
    });

    if (loginForm && registerForm) {
      loginForm.style.display = tab === 'login' ? 'block' : 'none';
      registerForm.style.display = tab === 'register' ? 'block' : 'none';
    }
  }

  openBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = btn.getAttribute('data-auth-tab') || 'register';
      openModal(tab);
    });
  });

  closeBtns.forEach(btn => btn.addEventListener('click', closeModal));

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      switchTab(tab);
    });
  });
}

/* ==========================================================================
   8. ИНТЕРАКТИВНАЯ СЦЕНА-ПРЕВЬЮ TRULY (SHOWREEL DEMO RUNNER)
   ========================================================================== */
function initShowreelPreview() {
  const frame = document.getElementById('showreelFrame');
  if (!frame) return;

  const playBtns = document.querySelectorAll('.js-showreel-play');
  const srPlayBtn = document.getElementById('srPlayBtn');
  const iconPlay = srPlayBtn ? srPlayBtn.querySelector('.sr-icon-play') : null;
  const iconPause = srPlayBtn ? srPlayBtn.querySelector('.sr-icon-pause') : null;
  const timeDisplay = document.getElementById('srTimeDisplay');
  const progressFill = document.getElementById('srProgressFill');
  const stepBtns = document.querySelectorAll('.js-sr-step');
  const progressTrack = document.querySelector('.js-sr-progress');

  const card1 = document.getElementById('flowCard1');
  const card2 = document.getElementById('flowCard2');
  const card3 = document.getElementById('flowCard3');
  const bar2 = document.getElementById('flowBar2');
  const status2 = document.getElementById('flowStatus2');

  let isPlaying = false;
  let currentTime = 10;
  const totalDuration = 45;
  let timer = null;

  function setPlayState(play) {
    isPlaying = play;
    frame.classList.toggle('is-running', isPlaying);

    if (iconPlay && iconPause) {
      iconPlay.style.display = isPlaying ? 'none' : 'block';
      iconPause.style.display = isPlaying ? 'block' : 'none';
    }

    if (isPlaying) {
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        currentTime += 0.5;
        if (currentTime > totalDuration) {
          currentTime = 0;
        }
        updateUI();
      }, 500);
    } else {
      if (timer) clearInterval(timer);
      timer = null;
    }
  }

  function updateUI() {
    const pct = Math.min(100, Math.max(0, (currentTime / totalDuration) * 100));
    if (progressFill) progressFill.style.width = pct.toFixed(1) + '%';
    if (timeDisplay) {
      const curSec = Math.floor(currentTime);
      const strCur = `00:${curSec < 10 ? '0' : ''}${curSec}`;
      timeDisplay.textContent = `${strCur} / 00:${totalDuration}`;
    }

    let currentStep = 1;
    if (currentTime >= 15 && currentTime < 30) currentStep = 2;
    else if (currentTime >= 30) currentStep = 3;

    stepBtns.forEach(btn => {
      const step = parseInt(btn.getAttribute('data-step') || '1', 10);
      btn.classList.toggle('is-active', step === currentStep);
    });

    if (currentStep === 1) {
      if (card1) card1.classList.add('is-active-scan');
      if (card2) card2.classList.remove('is-active-scan');
      if (card3) card3.classList.remove('is-active-scan');
      if (bar2) bar2.style.width = '35%';
      if (status2) {
        status2.className = 'flow-card-status status-warn';
        status2.innerHTML = '<span class="flow-status-dot pulse"></span><span class="flow-status-text">Сверка с ГИС МТ...</span>';
      }
    } else if (currentStep === 2) {
      if (card1) card1.classList.remove('is-active-scan');
      if (card2) card2.classList.add('is-active-scan');
      if (card3) card3.classList.remove('is-active-scan');
      if (bar2) bar2.style.width = '85%';
      if (status2) {
        status2.className = 'flow-card-status status-pass';
        status2.innerHTML = '<span class="flow-status-dot"></span><span class="flow-status-text">Проверено ✓</span>';
      }
    } else {
      if (card1) card1.classList.remove('is-active-scan');
      if (card2) card2.classList.remove('is-active-scan');
      if (card3) card3.classList.add('is-active-scan');
      if (bar2) bar2.style.width = '100%';
      if (status2) {
        status2.className = 'flow-card-status status-pass';
        status2.innerHTML = '<span class="flow-status-dot"></span><span class="flow-status-text">В обороте • OK</span>';
      }
    }
  }

  playBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      setPlayState(!isPlaying);
    });
  });

  stepBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const step = parseInt(btn.getAttribute('data-step') || '1', 10);
      if (step === 1) currentTime = 5;
      else if (step === 2) currentTime = 18;
      else currentTime = 34;
      updateUI();
      if (!isPlaying) setPlayState(true);
    });
  });

  if (progressTrack) {
    progressTrack.addEventListener('click', (e) => {
      const rect = progressTrack.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = Math.max(0, Math.min(1, clickX / rect.width));
      currentTime = ratio * totalDuration;
      updateUI();
    });
  }

  updateUI();
}

/* ==========================================================================
   9. ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ (СВЕТЛАЯ / ТЁМНАЯ #090A0F)
   ========================================================================== */
function initThemeToggle() {
  const toggles = document.querySelectorAll('.js-theme-toggle');
  if (toggles.length === 0) return;

  function getEffectiveTheme() {
    return document.documentElement.getAttribute('data-theme') || 'dark';
  }

  function applyTheme(newTheme) {
    document.documentElement.setAttribute('data-theme', newTheme);
    try {
      localStorage.setItem('truly_theme', newTheme);
      localStorage.setItem('znakcontrol_theme', newTheme);
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('themechanged', { detail: { theme: newTheme } }));
  }

  toggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = getEffectiveTheme();
      const target = current === 'dark' ? 'light' : 'dark';
      applyTheme(target);
    });
  });
}

/* ==========================================================================
   10. ПЕРЕКЛЮЧАТЕЛЬ ЯЗЫКА (RU / EN)
   ========================================================================== */
function initLangToggle() {
  const toggles = document.querySelectorAll('.js-lang-toggle');
  if (toggles.length === 0) return;

  const I18N = {
    ru: {
      navHow: 'Как это работает',
      navPricing: 'Тарифы',
      navFaq: 'Вопросы',
      navLogin: 'Войти',
      navRegister: 'Зарегистрироваться',
      heroTitle1: 'Проверка «Честный ЗНАК»',
      heroTitle2: 'за 10 секунд',
      heroSub: 'Загрузите фото или файл и узнайте, какие коды можно отгружать на Wildberries, Ozon и Яндекс Маркет, до того как придёт штраф.',
      heroTg: 'Открыть в Telegram',
      showreelTitle: 'Посмотрите, как это работает',
      showreelSub: 'Интерактивный показ: от сканирования DataMatrix до вердикта ГИС МТ',
      ctaTitle: 'Проверяйте коды до отгрузки'
    },
    en: {
      navHow: 'How it works',
      navPricing: 'Pricing',
      navFaq: 'FAQ',
      navLogin: 'Log in',
      navRegister: 'Sign up',
      heroTitle1: 'Validation of «Chestny ZNAK»',
      heroTitle2: 'in 10 seconds',
      heroSub: 'Upload a photo or file and check which codes are safe to ship to Wildberries, Ozon, and Yandex Market before fines occur.',
      heroTg: 'Open in Telegram',
      showreelTitle: 'See how it works',
      showreelSub: 'Interactive live demo: from DataMatrix scan to GIS MT verdict',
      ctaTitle: 'Verify marking codes before shipment'
    }
  };

  function updateTexts(lang) {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem('truly_lang', lang);
      localStorage.setItem('znakcontrol_lang', lang);
    } catch (e) {}

    toggles.forEach(btn => {
      const label = btn.querySelector('.lang-text');
      if (label) label.textContent = lang === 'ru' ? 'EN' : 'RU';
      btn.setAttribute('title', lang === 'ru' ? 'Switch to English' : 'Переключить на русский');
    });

    const dict = I18N[lang];
    if (!dict) return;

    document.querySelectorAll('.nav-link[href="#how-it-works"], .mobile-nav-link[href="#how-it-works"]').forEach(el => el.textContent = dict.navHow);
    document.querySelectorAll('.nav-link[href="#pricing"], .mobile-nav-link[href="#pricing"]').forEach(el => el.textContent = dict.navPricing);
    document.querySelectorAll('.nav-link[href="#faq"], .mobile-nav-link[href="#faq"]').forEach(el => el.textContent = dict.navFaq);
    document.querySelectorAll('.header-actions .btn-ghost, .mobile-drawer .btn-secondary').forEach(el => el.textContent = dict.navLogin);
    document.querySelectorAll('.header-actions .btn-contrast, .mobile-drawer .btn-contrast').forEach(el => el.textContent = dict.navRegister);

    const titleLines = document.querySelectorAll('.hero-title-line');
    if (titleLines.length >= 2) {
      titleLines[0].textContent = dict.heroTitle1;
      titleLines[1].textContent = dict.heroTitle2;
    }

    const subtitle = document.querySelector('.hero-subtitle');
    if (subtitle) subtitle.textContent = dict.heroSub;

    const tgLink = document.querySelector('.hero-actions a.btn-secondary');
    if (tgLink) tgLink.textContent = dict.heroTg;

    const heroReg = document.querySelector('.hero-actions button.btn-primary');
    if (heroReg) heroReg.textContent = dict.navRegister;

    const srTitle = document.querySelector('.showreel-section .section-title');
    if (srTitle) srTitle.textContent = dict.showreelTitle;
    const srSub = document.querySelector('.showreel-section .section-subtitle');
    if (srSub) srSub.textContent = dict.showreelSub;

    const ctaTitle = document.querySelector('.cta-title');
    if (ctaTitle) ctaTitle.textContent = dict.ctaTitle;

    window.dispatchEvent(new CustomEvent('langchanged', { detail: { lang } }));
  }

  const savedLang = (function() {
    try {
      return localStorage.getItem('truly_lang') || localStorage.getItem('znakcontrol_lang');
    } catch (e) {
      return null;
    }
  })() || (navigator.language && navigator.language.startsWith('en') ? 'en' : 'ru');

  if (savedLang === 'en') {
    updateTexts('en');
  }

  toggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const current = document.documentElement.lang === 'en' ? 'en' : 'ru';
      const target = current === 'ru' ? 'en' : 'ru';
      updateTexts(target);
    });
  });
}
