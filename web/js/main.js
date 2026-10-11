/* ============================================
   YRD Portfolio - Main Script
   ============================================ */

// --- Menu Overlay (mobile) ---
(function () {
  const menuBtn = document.getElementById('menuBtn');
  const menuClose = document.getElementById('menuClose');
  const menuOverlay = document.getElementById('menuOverlay');
  if (!menuBtn || !menuOverlay) return;

  const overlayBrand = menuOverlay.querySelector('.overlay-brand');
  let morphTimer = null;
  let resetTimer = null;

  function openMenu() {
    clearTimeout(resetTimer);
    menuOverlay.classList.add('is-open');
    document.body.classList.add('no-scroll');
    // Step 2: yrd spreads and full text fades in
    morphTimer = setTimeout(() => {
      if (overlayBrand) overlayBrand.classList.add('is-morphed');
    }, 550);
  }

  function closeMenu() {
    clearTimeout(morphTimer);
    menuOverlay.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
    // Reset after overlay fades out so the reverse animation isn't visible
    resetTimer = setTimeout(() => {
      if (overlayBrand) overlayBrand.classList.remove('is-morphed');
    }, 420);
  }

  menuBtn.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menuOverlay.classList.contains('is-open')) {
      closeMenu();
    }
  });
})();

// --- Header: active nav + scrolled border ---
(function () {
  const header = document.querySelector('.site-header');
  if (!header) return;

  const page = location.pathname.split('/').pop() || 'index.html';
  const key = page.startsWith('project-detail') ? 'works' : page.replace('.html', '');
  const active = header.querySelector(`[data-nav="${key}"]`);
  if (active) active.classList.add('active');

  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 4);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
})();

// --- Helpers ---
async function loadJSON(path) {
  try {
    const res = await fetch(path);
    const data = await res.json();
    // Decap CMS wraps list in { items: [...] }, plain array도 지원
    return Array.isArray(data) ? data : (data.items || data);
  } catch (e) {
    console.warn(`Failed to load ${path}:`, e);
    return null;
  }
}

function esc(str) {
  return String(str ?? '').replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

const detailUrl = project => `project-detail.html?id=${encodeURIComponent(project.id)}`;

// --- Cards ---
function postCard(project) {
  const meta = [project.location, project.year].filter(Boolean).map(esc).join(' · ');
  return `
    <a class="post-card" href="${detailUrl(project)}">
      <div class="post-thumb">
        <img src="${esc(project.thumbnail || project.image)}" alt="" loading="lazy">
      </div>
      <h3 class="post-title">${esc(project.title)}</h3>
      <p class="post-meta">${meta}</p>
    </a>`;
}

// --- Home Hero (single key visual) ---
function initHero(items) {
  const hero = document.querySelector('.hero-banner');
  if (!hero) return;

  const item = (items || []).find(i => i.image);
  if (!item) { hero.hidden = true; return; }

  hero.querySelector('.hero-image').src = item.image;
}

// --- Home ---
function initHome(home, about) {
  const lead = document.querySelector('[data-home-lead]');
  if (lead && home && home.projectsBody) {
    // Split into words so each one can fill in as the visitor scrolls
    // Line breaks in the copy become real line breaks
    lead.innerHTML = home.projectsBody.trim().split(/\n+/)
      .map(line => line.trim().split(/\s+/).map(w => `<span class="word">${esc(w)}</span>`).join(' '))
      .join('<br>');
  }

  // "How we work" story — reuses the principles from the About page
  const steps = ((about && about.principles) || []).filter(p => p.title || p.body);
  const story = document.getElementById('story');
  if (story && steps.length) {
    story.querySelector('.story-steps').innerHTML = steps.map((p, i) => `
      <li class="story-step" data-index="${i}">
        ${p.image ? `<div class="story-step-img"><img src="${esc(p.image)}" alt="" loading="lazy"></div>` : ''}
        <h3 class="story-title">${esc(p.title)}</h3>
        <p class="story-text">${esc(p.body)}</p>
      </li>`).join('');
    story.querySelector('.story-visual').innerHTML = steps.map((p, i) =>
      p.image ? `<img class="story-frame" data-index="${i}" src="${esc(p.image)}" alt="" loading="lazy">` : '').join('');
    story.hidden = false;
  }

  initHomeScroll();
}

// --- Home: scroll-driven interactions ---
function initHomeScroll() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = window.matchMedia('(min-width: 769px)');
  const reveals = document.querySelectorAll('[data-reveal]');

  // Fade-up reveal
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-visible'));
  } else {
    document.body.classList.add('has-reveal');
    const io = new IntersectionObserver(entries => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); }
    }), { rootMargin: '0px 0px -10% 0px' });
    reveals.forEach(el => io.observe(el));
  }

  const words = [...document.querySelectorAll('.home-statement .word')];
  if (reduceMotion) {
    words.forEach(w => w.classList.add('is-on'));
    return;
  }

  const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 56;
  const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

  const stage = document.querySelector('.hero-stage');
  const banner = document.querySelector('.hero-banner');
  const statement = document.querySelector('.home-statement');
  const steps = [...document.querySelectorAll('.story-step')];
  const frames = [...document.querySelectorAll('.story-frame')];
  const story = document.getElementById('story');
  const storySticky = story?.querySelector('.story-sticky');
  let storyPinned = false;
  let stepDistance = 0;
  let activeStep = -1;

  document.body.classList.add('has-scroll-fx');

  function update() {
    const vh = window.innerHeight;

    // 1. Hero shrinks from full-screen into a shorter, inset rounded card.
    //    It sits behind the header, so the card's top clears the compact header.
    if (stage && banner) {
      const distance = stage.offsetHeight - banner.offsetHeight;
      const p = clamp(-stage.getBoundingClientRect().top / Math.max(distance, 1));
      const W = window.innerWidth;
      const H = banner.offsetHeight;
      const containerEdge = Math.max(24, (W - 1100) / 2);
      const x = (desktop.matches ? containerEdge : 20) * p;
      const topEnd = header + (desktop.matches ? 24 : 16);
      // Final card height: ~60% of the screen on desktop, a 4:5 card on mobile
      const cardEnd = desktop.matches
        ? Math.max(360, Math.min(vh * 0.6, 640))
        : Math.min((W - 40) * 1.25, H - topEnd - 16);
      const bottomEnd = Math.max(0, H - topEnd - cardEnd);
      const top = topEnd * p;
      const bottom = bottomEnd * p;
      banner.style.clipPath = `inset(${top}px ${x}px ${bottom}px round ${28 * p}px)`;
      banner.style.setProperty('--hero-p', p.toFixed(3));
      banner.style.setProperty('--clip-top', `${top}px`);
      banner.style.setProperty('--clip-bottom', `${bottom}px`);
      // Pull the next section up so there's no empty gap under the finished card
      stage.style.marginBottom = `${-bottomEnd}px`;
    }

    // 2. Statement fills in word by word
    if (statement && words.length) {
      const r = statement.getBoundingClientRect();
      const p = clamp((vh * 0.85 - r.top) / (vh * 0.5 + r.height * 0.5));
      const lit = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('is-on', i < lit));
    }

    // 3. Story: the whole block is pinned; scroll progress picks the step
    if (steps.length) {
      let next = 0;
      if (storyPinned) {
        const r = story.getBoundingClientRect();
        const p = clamp((header - r.top) / Math.max(stepDistance * (steps.length - 1), 1));
        // Equal share of the scroll for every step
        next = Math.min(steps.length - 1, Math.floor(p * steps.length));
      } else {
        let best = Infinity;
        steps.forEach((el, i) => {
          const r = el.getBoundingClientRect();
          const d = Math.abs(r.top + r.height / 2 - vh / 2);
          if (d < best) { best = d; next = i; }
        });
      }
      if (next !== activeStep) {
        activeStep = next;
        steps.forEach((s, i) => s.classList.toggle('is-active', i === next));
        frames.forEach(f => f.classList.toggle('is-active', +f.dataset.index === next));
      }
    }
  }

  // Pinned story: give each step ~60% of a screen of scroll
  function layout() {
    storyPinned = !!(story && desktop.matches && steps.length > 1);
    if (storyPinned) {
      stepDistance = window.innerHeight * 0.6;
      story.style.height = `${storySticky.offsetHeight + stepDistance * (steps.length - 1)}px`;
    } else if (story) {
      story.style.height = '';
    }
    activeStep = -1;
    update();
  }

  // Clicking a step jumps to its scroll position
  steps.forEach((step, i) => step.addEventListener('click', () => {
    if (!storyPinned) return;
    const top = story.getBoundingClientRect().top + window.scrollY - header;
    const range = stepDistance * (steps.length - 1);
    window.scrollTo({ top: top + range * (i + 0.5) / steps.length, behavior: 'smooth' });
  }));

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', layout);
  desktop.addEventListener('change', layout);
  layout();
}

// --- Works Page ---
const PAGE_SIZE = 9;

function initWorks(projects) {
  const grid = document.querySelector('.works-grid');
  if (!grid || !projects) return;

  const pagination = document.querySelector('.pagination');
  const emptyState = document.querySelector('.empty-state');
  const pages = Math.max(1, Math.ceil(projects.length / PAGE_SIZE));
  let page = 1;

  function render() {
    const start = (page - 1) * PAGE_SIZE;
    grid.innerHTML = projects.slice(start, start + PAGE_SIZE).map(postCard).join('');
    emptyState.hidden = projects.length > 0;

    if (pages <= 1) { pagination.innerHTML = ''; return; }
    const nums = Array.from({ length: pages }, (_, i) => i + 1);
    pagination.innerHTML = `
      <button class="page-arrow" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''} aria-label="이전 페이지">←</button>
      ${nums.map(n => `<button class="page-num${n === page ? ' active' : ''}" data-page="${n}">${n}</button>`).join('')}
      <button class="page-arrow" data-page="${page + 1}" ${page === pages ? 'disabled' : ''} aria-label="다음 페이지">→</button>`;
  }

  pagination.addEventListener('click', e => {
    const btn = e.target.closest('button[data-page]');
    if (!btn || btn.disabled) return;
    page = Number(btn.dataset.page);
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  render();
}

// --- Project Detail Page ---
function initProjectDetail(projects) {
  const detailPage = document.querySelector('.project-detail-page');
  if (!detailPage || !projects) return;

  const projectId = new URLSearchParams(window.location.search).get('id');
  const projectIndex = projects.findIndex(p => p.id === projectId);
  if (!projectId || projectIndex === -1) {
    window.location.href = 'works.html';
    return;
  }

  const project = projects[projectIndex];
  document.title = `${project.title} — YRD`;

  const heroImage = detailPage.querySelector('.detail-hero-image');
  if (heroImage) {
    heroImage.src = project.image;
    heroImage.alt = project.title;
  }

  const setText = (sel, val) => {
    const el = detailPage.querySelector(sel);
    if (!el) return;
    el.textContent = val || '';
    el.hidden = !val;
  };

  setText('.detail-title', project.title);
  setText('.meta-item.category', project.category);
  setText('.meta-item.location', project.location);
  setText('.meta-item.year', project.year);
  setText('.description-text', project.description);

  // Specs — hide rows without a value
  const specs = {
    '.spec-client': project.specs?.client,
    '.spec-year': project.year,
    '.spec-area': project.specs?.area,
    '.spec-usage': project.specs?.usage,
    '.spec-structure': project.specs?.structure,
    '.spec-materials': project.specs?.materials,
  };
  Object.entries(specs).forEach(([sel, val]) => {
    const dd = detailPage.querySelector(sel);
    if (!dd) return;
    dd.textContent = val || '';
    dd.closest('.spec-item').hidden = !val;
  });

  // Gallery
  const galleryContainer = detailPage.querySelector('.gallery-container');
  if (galleryContainer && project.gallery) {
    galleryContainer.innerHTML = '';
    project.gallery.forEach((item) => {
      if (typeof item === 'string' || item.type === 'image') {
        const img = document.createElement('img');
        img.className = 'gallery-image';
        img.src = typeof item === 'string' ? item : item.url;
        img.alt = project.title;
        img.loading = 'lazy';
        galleryContainer.appendChild(img);
      } else if (item.type === 'text') {
        const block = document.createElement('div');
        block.className = 'gallery-text-block';
        if (item.heading) {
          const h = document.createElement('p');
          h.className = 'gallery-text-block__heading';
          h.textContent = item.heading;
          block.appendChild(h);
        }
        if (item.body) {
          const p = document.createElement('p');
          p.className = 'gallery-text-block__body';
          p.textContent = item.body;
          block.appendChild(p);
        }
        galleryContainer.appendChild(block);
      }
    });
  }

  // Prev / next
  const linkNav = (el, target) => {
    if (!el || !target) return;
    el.href = detailUrl(target);
    el.querySelector('.nav-title').textContent = target.title;
    el.hidden = false;
  };
  linkNav(detailPage.querySelector('.nav-prev'), projects[projectIndex - 1]);
  linkNav(detailPage.querySelector('.nav-next'), projects[projectIndex + 1]);
}

// --- Contact Page ---
function initContact(data) {
  const page = document.querySelector('.contact-page');
  if (!page || !data) return;

  const set = (sel, val) => {
    const el = page.querySelector(sel);
    if (el && val) el.innerHTML = val;
  };

  set('[data-field="phone"]', `<a href="tel:${data.phone.replace(/-/g, '')}">${data.phone}</a>`);
  set('[data-field="email"]', `<a href="mailto:${data.email}">${data.email}</a>`);
  set('[data-field="instagram"]', `<a href="https://instagram.com/${data.instagram.replace('@', '')}" target="_blank" rel="noopener">${data.instagram}</a>`);
  set('[data-field="address"]', data.address.replace(/\n/g, '<br>'));
  set('[data-field="hours"]', data.hours.replace(/\n/g, '<br>'));
}

// --- Footer ---
function initFooter(contact) {
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });
  const info = document.querySelector('[data-footer-info]');
  if (!info || !contact) return;
  info.innerHTML = [contact.address, contact.phone, contact.email]
    .filter(Boolean)
    .map(v => `<span>${esc(v).replace(/\n/g, ' ')}</span>`)
    .join('');
}

// --- About Page ---
function initAbout(data, projects) {
  if (!data) return;
  projects = projects || [];

  const set = (key, val) => {
    const el = document.querySelector(`[data-about="${key}"]`);
    if (el && val) el.textContent = val;
  };
  set('headline', data.headline);
  set('tagline', data.tagline);
  set('visionTitle', data.visionTitle);
  set('historyTitle', data.historyTitle);
  set('intro', data.intro || data.body);
  document.querySelectorAll('[data-about="tagline"], [data-about="visionTitle"]').forEach(el => {
    el.hidden = !el.textContent.trim();
  });

  // Studio photo — fall back to the first project image until one is uploaded
  const heroSrc = data.image || projects[0]?.image;
  const hero = document.querySelector('.about-hero');
  if (hero && heroSrc) {
    hero.querySelector('img').src = heroSrc;
    hero.hidden = false;
  }

  const principles = (data.principles || []).filter(p => p.title || p.body);
  if (principles.length) {
    document.getElementById('principleGrid').innerHTML = principles.map(p => `
      <div class="principle">
        ${p.image ? `<div class="principle-img"><img src="${esc(p.image)}" alt="" loading="lazy"></div>` : ''}
        <h3 class="principle-title">${esc(p.title)}</h3>
        <p class="principle-body">${esc(p.body)}</p>
      </div>`).join('');
    document.querySelector('[data-about-section="principles"]').hidden = false;
  }

  initHistory(data, projects);
}

// --- About: History timeline ---
function initHistory(data, projects) {
  const section = document.querySelector('[data-about-section="history"]');
  if (!section) return;

  const yearOf = v => String(v || '').slice(0, 4);
  // Custom milestones from the CMS + completed projects
  const entries = [
    ...(data.history || []).filter(h => h.year && h.title).map(h => ({
      year: yearOf(h.year), title: h.title, body: h.body || '', image: h.image || '',
    })),
    ...projects.filter(p => p.year).map(p => ({
      year: yearOf(p.year),
      title: p.title,
      body: [p.location, p.category].filter(Boolean).join(' · '),
      image: p.thumbnail || p.image,
      href: detailUrl(p),
    })),
  ];
  if (!entries.length) return;

  const years = [...new Set(entries.map(e => e.year))].sort((a, b) => b - a);

  section.querySelector('.timeline').innerHTML = years.map(year => {
    const rows = entries.filter(e => e.year === year).map(e => {
      const tag = e.href ? 'a' : 'div';
      const href = e.href ? ` href="${e.href}"` : '';
      return `
        <li>
          <${tag} class="tl-row"${href}>
            <span class="tl-thumb">${e.image ? `<img src="${esc(e.image)}" alt="" loading="lazy">` : ''}</span>
            <span class="tl-title">${esc(e.title)}</span>
            <span class="tl-meta">${esc(e.body)}</span>
            ${e.href ? '<span class="tl-arrow" aria-hidden="true">→</span>' : '<span></span>'}
          </${tag}>
        </li>`;
    }).join('');
    return `
      <div class="tl-group">
        <p class="tl-year">${year}</p>
        <ul class="tl-rows">${rows}</ul>
      </div>`;
  }).join('');

  section.hidden = false;
}

// --- Init ---
document.addEventListener('DOMContentLoaded', async () => {
  const [projects, contact] = await Promise.all([
    loadJSON('data/projects.json'),
    loadJSON('data/contact.json'),
  ]);

  initFooter(contact);

  if (document.querySelector('.home-page')) {
    const [home, kv, about] = await Promise.all([
      loadJSON('data/home.json'), loadJSON('data/kv.json'), loadJSON('data/about.json'),
    ]);
    initHero(kv && kv.length ? kv : projects);
    initHome(home, about);
  }

  if (document.querySelector('.works-page')) {
    initWorks(projects);
  }

  if (document.querySelector('.project-detail-page')) {
    initProjectDetail(projects);
  }

  if (document.querySelector('.contact-page')) {
    initContact(contact);
  }

  if (document.querySelector('.about-page')) {
    initAbout(await loadJSON('data/about.json'), projects);
  }
});
