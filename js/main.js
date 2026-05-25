/* ============================================
   YRD Portfolio - Main Script
   ============================================ */

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

// --- Page Transition ---
function initPageTransition() {
  const overlay = document.querySelector('.page-transition');
  if (!overlay) return;

  // Fade in on load
  requestAnimationFrame(() => {
    document.body.classList.add('loaded');
    overlay.classList.add('hidden');
  });

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.body.classList.remove('loaded');
      overlay.classList.remove('hidden');
      setTimeout(() => {
        window.location.href = href;
      }, 700);
    });
  });
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

    titleEl.textContent = project.title;
    metaEl.innerHTML = `<span>${project.location}</span><span>${project.year}</span>`;
    counterText.textContent = `${index + 1} / ${projects.length}`;

    titleEl.style.animation = 'fadeInUp 0.8s 0.3s forwards';
    metaEl.style.animation = 'fadeInUp 0.8s 0.5s forwards';
  }

  function goToSlide(index) {
    slides[currentIndex].classList.remove('active');
    slides[currentIndex].style.animation = 'none';

    currentIndex = (index + projects.length) % projects.length;

    slides[currentIndex].classList.remove('active');
    slides[currentIndex].style.animation = 'none';
    slides[currentIndex].offsetHeight;
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

  if (prevBtn) prevBtn.addEventListener('click', prevSlide);
  if (nextBtn) nextBtn.addEventListener('click', nextSlide);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  });

  let touchStartX = 0;
  hero.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
  }, { passive: true });

  hero.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 60) {
      diff > 0 ? nextSlide() : prevSlide();
    }
  }, { passive: true });

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
    card.innerHTML = `
      <img class="card-image" src="${project.thumbnail || project.image}" alt="${project.title}" loading="lazy">
      <div class="card-overlay">
        <h3 class="card-title">${project.title}</h3>
        <p class="card-meta">${project.location} · ${project.year}</p>
      </div>
    `;

    // Add click handler to navigate to detail page
    card.addEventListener('click', () => {
      window.location.href = `project-detail.html?id=${project.id}`;
    });

    grid.appendChild(card);
  });

  // Initialize filter buttons
  initFilterButtons();
}

// --- Filter Buttons ---
function initFilterButtons() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  const workCards = document.querySelectorAll('.work-card');

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.category;

      // Update active button
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // Filter cards
      workCards.forEach(card => {
        const cardCategory = card.dataset.category;

        if (category === 'all' || cardCategory === category) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
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
  if (project.specs) {
    const areaEl = detailPage.querySelector('.spec-area');
    const usageEl = detailPage.querySelector('.spec-usage');
    const structureEl = detailPage.querySelector('.spec-structure');
    const materialsEl = detailPage.querySelector('.spec-materials');

    if (areaEl) areaEl.textContent = project.specs.area;
    if (usageEl) usageEl.textContent = project.specs.usage;
    if (structureEl) structureEl.textContent = project.specs.structure;
    if (materialsEl) materialsEl.textContent = project.specs.materials;
  }

  // Populate gallery
  const galleryContainer = detailPage.querySelector('.gallery-container');
  if (galleryContainer && project.gallery) {
    galleryContainer.innerHTML = '';
    project.gallery.forEach((imgSrc) => {
      const img = document.createElement('img');
      img.className = 'gallery-image';
      img.src = imgSrc;
      img.alt = project.title;
      img.loading = 'lazy';
      galleryContainer.appendChild(img);
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
  initPageTransition();

  const projects = await loadJSON('data/projects.json');

  if (document.querySelector('.hero')) {
    initHeroSlider(projects);
    initHomeFeaturedWorks(projects);
  }

  if (document.querySelector('.works-grid')) {
    initWorksGrid(projects);
  }

  if (document.querySelector('.project-detail-page')) {
    initProjectDetail(projects);
  }

if (document.querySelector('.contact-page')) {
    const data = await loadJSON('data/contact.json');
    initContact(data);
  }
});
