/* ============================================
   YRD Portfolio - Main Script
   ============================================ */

// --- Menu Overlay ---
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
    // Step 2: yrd spreads and full text fades in
    morphTimer = setTimeout(() => {
      if (overlayBrand) overlayBrand.classList.add('is-morphed');
    }, 550);
  }

  function closeMenu() {
    clearTimeout(morphTimer);
    menuOverlay.classList.remove('is-open');
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

// --- Data Loader ---
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


// --- Viewport Height Detection ---
function setFillHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

function initViewportHeight() {
  setFillHeight();
  window.addEventListener('resize', setFillHeight);
}


// --- Hero Slider ---
function initHeroSlider(projects) {
  const hero = document.querySelector('.hero');
  if (!hero || !projects || projects.length === 0) return;

  const slidesContainer = hero.querySelector('.hero-slides');
  const titleEl = hero.querySelector('.project-title');
  const metaEl = hero.querySelector('.project-meta');
  const counterText = hero.querySelector('.counter-text');
  const prevBtn = hero.querySelector('.prev-btn');
  const nextBtn = hero.querySelector('.next-btn');
  const progressBar = hero.querySelector('.progress-bar');

  let currentIndex = 0;
  let autoplayTimer = null;
  const autoplayInterval = 10000;

  projects.forEach((project, i) => {
    const slide = document.createElement('div');
    slide.className = 'hero-slide' + (i === 0 ? ' active' : '');
    slide.style.backgroundImage = `url(${project.image})`;
    slidesContainer.appendChild(slide);
  });

  const slides = slidesContainer.querySelectorAll('.hero-slide');

  function updateInfo(index) {
    const project = projects[index];

    titleEl.style.animation = 'none';
    metaEl.style.animation = 'none';
    titleEl.offsetHeight;
    metaEl.offsetHeight;

    titleEl.innerHTML = '';
    const line1 = document.createElement('span');
    line1.textContent = project.title || '';
    titleEl.appendChild(line1);
    if (project.title2) {
      titleEl.appendChild(document.createElement('br'));
      const line2 = document.createElement('span');
      line2.textContent = project.title2;
      titleEl.appendChild(line2);
    }
    metaEl.innerHTML = `<span>${project.location}</span><span>${project.year}</span>`;
    if (counterText) counterText.textContent = `${index + 1} / ${projects.length}`;

    titleEl.style.animation = 'fadeInUp 0.8s 0.3s forwards';
    metaEl.style.animation = 'fadeInUp 0.8s 0.5s forwards';
  }

  function goToSlide(index) {
    slides[currentIndex].classList.remove('active');
    currentIndex = (index + projects.length) % projects.length;
    slides[currentIndex].classList.add('active');
    updateInfo(currentIndex);
    resetAutoplay();
  }

  function nextSlide() { goToSlide(currentIndex + 1); }
  function prevSlide() { goToSlide(currentIndex - 1); }

  function resetAutoplay() {
    clearInterval(autoplayTimer);
    autoplayTimer = setInterval(nextSlide, autoplayInterval);
  }

  updateInfo(0);
  resetAutoplay();
}

// --- Works Page ---
function initWorksGrid(projects) {
  const grid = document.querySelector('.works-grid');
  if (!grid || !projects) return;

  projects.forEach((project) => {
    const card = document.createElement('div');
    card.className = 'work-card';
    card.dataset.category = project.category;
    card.dataset.year = project.year;
    card.innerHTML = `
      <img class="card-image" src="${project.thumbnail || project.image}" alt="${project.title}" loading="lazy">
      <div class="card-overlay">
        <h3 class="card-title">${project.title}</h3>
        <p class="card-meta">${project.location} · ${project.year}</p>
      </div>
    `;
    card.addEventListener('click', () => {
      window.location.href = `project-detail.html?id=${project.id}`;
    });
    grid.appendChild(card);
  });

  initFilterButtons(projects);
}

// --- Filter Buttons ---
function initFilterButtons(projects) {
  const catContainer  = document.getElementById('filter-category');
  const yearContainer = document.getElementById('filter-year');
  if (!catContainer || !yearContainer) return;

  const categories = ['all', ...new Set(projects.map(p => p.category).filter(Boolean))];
  const years      = ['all', ...[...new Set(projects.map(p => p.year).filter(Boolean))].sort((a, b) => b - a)];

  const makeBtn = (value, type) => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (value === 'all' ? ' active' : '');
    btn.textContent = value === 'all' ? 'All' : value;
    btn.dataset[type] = value;
    return btn;
  };

  categories.forEach(c => catContainer.appendChild(makeBtn(c, 'category')));
  years.forEach(y => yearContainer.appendChild(makeBtn(y, 'year')));

  let activeCategory = 'all';
  let activeYear     = 'all';

  function applyFilters() {
    document.querySelectorAll('.work-card').forEach(card => {
      const matchCat  = activeCategory === 'all' || card.dataset.category === activeCategory;
      const matchYear = activeYear     === 'all' || card.dataset.year     === activeYear;
      card.classList.toggle('hidden', !(matchCat && matchYear));
    });
  }

  catContainer.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    catContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.dataset.category;
    applyFilters();
  });

  yearContainer.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    yearContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeYear = btn.dataset.year;
    applyFilters();
  });
}

// --- Project Detail Page ---
function initProjectDetail(projects) {
  const detailPage = document.querySelector('.project-detail-page');
  if (!detailPage || !projects) return;

  // Get project ID from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('id');

  if (!projectId) {
    window.location.href = 'works.html';
    return;
  }

  // Find the project
  const projectIndex = projects.findIndex(p => p.id === projectId);
  if (projectIndex === -1) {
    window.location.href = 'works.html';
    return;
  }

  const project = projects[projectIndex];

  // Update page title
  document.title = `${project.title} — YRD`;

  // Populate hero image
  const heroImage = detailPage.querySelector('.detail-hero-image');
  if (heroImage) {
    heroImage.src = project.image;
    heroImage.alt = project.title;
  }

  // Populate info
  const titleEl = detailPage.querySelector('.detail-title');
  const locationEl = detailPage.querySelector('.meta-item.location');
  const yearEl = detailPage.querySelector('.meta-item.year');
  const categoryEl = detailPage.querySelector('.meta-item.category');
  const descriptionEl = detailPage.querySelector('.description-text');

  if (titleEl) titleEl.textContent = project.title;
  if (locationEl) locationEl.textContent = project.location;
  if (yearEl) yearEl.textContent = project.year;
  if (categoryEl) categoryEl.textContent = project.category;
  if (descriptionEl) descriptionEl.textContent = project.description;

  // Populate specs
  const clientEl = detailPage.querySelector('.spec-client');
  const specYearEl = detailPage.querySelector('.spec-year');
  if (clientEl) clientEl.textContent = project.specs?.client || '';
  if (specYearEl) specYearEl.textContent = project.year || '';

  if (project.specs) {
    const areaEl = detailPage.querySelector('.spec-area');
    const usageEl = detailPage.querySelector('.spec-usage');
    const structureEl = detailPage.querySelector('.spec-structure');
    const materialsEl = detailPage.querySelector('.spec-materials');

    if (areaEl) areaEl.textContent = project.specs.area || '';
    if (usageEl) usageEl.textContent = project.specs.usage || '';
    if (structureEl) structureEl.textContent = project.specs.structure || '';
    if (materialsEl) materialsEl.textContent = project.specs.materials || '';
  }

  // Populate gallery
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

  // Setup navigation
  const prevNav = detailPage.querySelector('.nav-prev');
  const nextNav = detailPage.querySelector('.nav-next');

  if (projectIndex > 0) {
    const prevProject = projects[projectIndex - 1];
    prevNav.href = `project-detail.html?id=${prevProject.id}`;
    prevNav.querySelector('.nav-title').textContent = prevProject.title;
    prevNav.style.display = 'flex';
  }

  if (projectIndex < projects.length - 1) {
    const nextProject = projects[projectIndex + 1];
    nextNav.href = `project-detail.html?id=${nextProject.id}`;
    nextNav.querySelector('.nav-title').textContent = nextProject.title;
    nextNav.style.display = 'flex';
  }
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

// --- Home Featured Works Carousel ---
function initHomeFeaturedWorks(projects) {
  const grid = document.querySelector('.home-works-grid');
  const prevBtn = document.querySelector('.carousel-prev');
  const nextBtn = document.querySelector('.carousel-next');

  if (!grid || !projects) return;

  // Show first 8 projects for carousel
  const featuredProjects = projects.slice(0, 8);

  featuredProjects.forEach((project) => {
    const card = document.createElement('div');
    card.className = 'home-work-card';
    card.innerHTML = `
      <img src="${project.thumbnail || project.image}" alt="${project.title}" loading="lazy">
      <div class="home-work-info">
        <h3>${project.title}</h3>
        <p>${project.location}<br>${project.year}</p>
      </div>
    `;

    card.addEventListener('click', () => {
      window.location.href = `project-detail.html?id=${project.id}`;
    });

    grid.appendChild(card);
  });

  // Carousel controls
  let currentPosition = 0;
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const cardsPerView = isMobile ? 2 : 4;
  const maxPosition = Math.max(0, featuredProjects.length - cardsPerView);

  function updateCarousel() {
    const cardWidth = grid.querySelector('.home-work-card').offsetWidth;
    const gap = parseInt(getComputedStyle(grid).gap);
    const translateX = -currentPosition * (cardWidth + gap);
    grid.style.transform = `translateX(${translateX}px)`;

    // Update button states
    if (prevBtn) prevBtn.disabled = currentPosition === 0;
    if (nextBtn) nextBtn.disabled = currentPosition >= maxPosition;
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPosition > 0) {
        currentPosition--;
        updateCarousel();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (currentPosition < maxPosition) {
        currentPosition++;
        updateCarousel();
      }
    });
  }

  // Touch/swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  grid.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  grid.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;

    if (Math.abs(diff) > 60) {
      if (diff > 0 && currentPosition < maxPosition) {
        currentPosition++;
        updateCarousel();
      } else if (diff < 0 && currentPosition > 0) {
        currentPosition--;
        updateCarousel();
      }
    }
  }, { passive: true });

  // Initialize
  updateCarousel();

  // Update on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const newIsMobile = window.matchMedia('(max-width: 768px)').matches;
      if (newIsMobile !== isMobile) {
        location.reload(); // Reload to recalculate
      } else {
        updateCarousel();
      }
    }, 250);
  });
}

// --- Init ---
document.addEventListener('DOMContentLoaded', async () => {
  initViewportHeight();

  const projects = await loadJSON('data/projects.json');

  if (document.querySelector('.hero')) {
    const kv = await loadJSON('data/kv.json');
    initHeroSlider(kv && kv.length ? kv : projects);
    initHomeFeaturedWorks(projects);
  }

  if (document.querySelector('.works-grid')) {
    initWorksGrid(projects);
  }

  if (document.querySelector('.project-detail-page')) {
    initProjectDetail(projects);
  }

if (document.querySelector('.home-works')) {
    const data = await loadJSON('data/home.json');
    if (data) {
      const bodyEl = document.querySelector('.section-body');
      if (bodyEl && data.projectsBody) bodyEl.textContent = data.projectsBody;
    }
  }

  if (document.querySelector('.contact-page')) {
    const data = await loadJSON('data/contact.json');
    initContact(data);
  }

  if (document.querySelector('.about-page')) {
    const data = await loadJSON('data/about.json');
    if (data) {
      const img = document.querySelector('.about-hero-image');
      const para = document.querySelector('.about-paragraph');
      if (img && data.image) img.src = data.image;
      if (para && data.body) para.textContent = data.body;
    }
  }
});
