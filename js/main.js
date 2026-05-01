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

// --- Page Transition ---
function initPageTransition() {
  const overlay = document.querySelector('.page-transition');
  if (!overlay) return;

  requestAnimationFrame(() => {
    overlay.classList.add('hidden');
  });

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) return;

    link.addEventListener('click', (e) => {
      e.preventDefault();
      overlay.classList.remove('hidden');
      setTimeout(() => {
        window.location.href = href;
      }, 600);
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
  const autoplayInterval = 6000;

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

    if (progressBar) {
      progressBar.style.transition = 'none';
      progressBar.style.width = '0%';
      requestAnimationFrame(() => {
        progressBar.style.transition = `width ${autoplayInterval}ms linear`;
        progressBar.style.width = '100%';
      });
    }
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
    card.innerHTML = `
      <img class="card-image" src="${project.thumbnail || project.image}" alt="${project.title}" loading="lazy">
      <div class="card-overlay">
        <h3 class="card-title">${project.title}</h3>
        <p class="card-meta">${project.location} · ${project.year}</p>
      </div>
    `;
    grid.appendChild(card);
  });
}

// --- Philosophy Page ---
function initPhilosophy(data) {
  const page = document.querySelector('.philosophy-page');
  if (!page || !data) return;

  if (data.background_image) {
    page.style.backgroundImage = `url('${data.background_image}')`;
  }

  const container = page.querySelector('.philosophy-paragraphs');
  if (!container || !data.paragraphs) return;

  container.innerHTML = '';
  data.paragraphs.forEach(text => {
    const p = document.createElement('p');
    p.textContent = text;
    container.appendChild(p);
  });
}

// --- Contact Page ---
function initContact(data) {
  const page = document.querySelector('.contact-page');
  if (!page || !data) return;

  const set = (sel, val) => {
    const el = page.querySelector(sel);
    if (el && val) el.innerHTML = val;
  };

  set('[data-field="email"]', `<a href="mailto:${data.email}">${data.email}</a>`);
  set('[data-field="phone"]', `<a href="tel:${data.phone.replace(/-/g, '')}">${data.phone}</a>`);
  set('[data-field="address"]', data.address.replace(/\n/g, '<br>'));
  set('[data-field="hours"]', data.hours.replace(/\n/g, '<br>'));
}

// --- Init ---
document.addEventListener('DOMContentLoaded', async () => {
  initPageTransition();

  const projects = await loadJSON('data/projects.json');

  if (document.querySelector('.hero')) {
    initHeroSlider(projects);
  }

  if (document.querySelector('.works-grid')) {
    initWorksGrid(projects);
  }

  if (document.querySelector('.philosophy-page')) {
    const data = await loadJSON('data/philosophy.json');
    initPhilosophy(data);
  }

  if (document.querySelector('.contact-page')) {
    const data = await loadJSON('data/contact.json');
    initContact(data);
  }
});
