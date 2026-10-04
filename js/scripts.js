// Theme handling functions
const getPreferredTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', theme === 'dark' ? '#0a0a0a' : '#f5f5f5');
  // Update all theme icons
  const themeIcons = document.querySelectorAll('.theme-toggle i, #theme-toggle i');
  themeIcons.forEach(icon => {
    icon.className = theme === 'dark' ? 'ri-lg ri-sun-fill' : 'ri-lg ri-moon-clear-fill';
  });
  // Name the theme star after the mode it shows
  const dot = document.getElementById('theme-toggle');
  if (dot && dot.tagName.toLowerCase() === 'button') {
    const name = theme === 'dark' ? 'Dark mode' : 'Light mode';
    dot.setAttribute('data-label', name);
    dot.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  }
};

const toggleTheme = () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', newTheme);
  applyTheme(newTheme);
};

// Content helper - always returns English field
const t = (obj, field) => {
  if (!obj) return '';
  return obj[field] || '';
};

const tArr = (obj, field) => {
  if (!obj) return [];
  return obj[field] || [];
};

function renderAllContent(data) {
  renderProfile(data.profile);
  renderSectionHeadings(data.sectionHeadings);
  renderProjects(data.projects);
  renderCompetitions(data.competitions);
  renderLeadership(data.leadership);
  renderVision(data.vision);
}

// Function to load and render portfolio data (index only)
async function loadPortfolioData() {
  if (!document.querySelector('#projects .projects-grid')) return;
  setLoadingState(true);
  try {
    const response = await fetch('/res/data.json');
    if (!response.ok) {
      throw new Error(`Failed to load data (${response.status})`);
    }
    const data = await response.json();
    const missing = ['profile', 'projects', 'competitions', 'leadership', 'vision']
      .filter(k => data?.[k] == null || (Array.isArray(data[k]) && data[k].length === 0 && k !== 'projects' && k !== 'competitions' && k !== 'leadership'));
    if (!data?.profile || !Array.isArray(data.projects) || !Array.isArray(data.competitions)) {
      throw new Error('Portfolio data is incomplete.');
    }
    if (missing.length) {
      console.warn('Portfolio sections missing:', missing.join(', '));
    }
    
    renderAllContent(data);
    setLoadingState(false);
    initReveals();
    
  } catch (error) {
    console.error('Error loading portfolio data:', error);
    showPortfolioError('Sorry, portfolio data is currently unavailable. Please try again later.');
    setLoadingState(false);
    initReveals();
  }
}

const CONTENT_SECTIONS = ['projects', 'competitions', 'leadership', 'vision'];

function sectionContainer(section) {
  return section.querySelector('.projects-grid, .competitions-grid, .leadership-list') || section;
}

function setLoadingState(isLoading) {
  CONTENT_SECTIONS.forEach((id) => {
    const section = document.getElementById(id);
    if (!section) return;
    section.setAttribute('aria-busy', isLoading ? 'true' : 'false');
    const container = sectionContainer(section);
    if (isLoading) {
      if (!container.querySelector('.loading-text')) {
        const loading = document.createElement('p');
        loading.className = 'loading-text';
        loading.textContent = 'Loading content...';
        container.appendChild(loading);
      }
    } else {
      container.querySelectorAll('.loading-text').forEach((el) => el.remove());
    }
  });
}

function showPortfolioError(message) {
  CONTENT_SECTIONS.forEach((id) => {
    const section = document.getElementById(id);
    if (!section) return;
    const container = sectionContainer(section);
    // Preserve headings: only clear previous dynamic content, never the h2.
    container.querySelectorAll('article, .loading-text, p:not(.error-text)').forEach((el) => el.remove());
    if (!container.querySelector('.error-text')) {
      const error = document.createElement('p');
      error.className = 'error-text';
      error.textContent = message;
      container.appendChild(error);
    }
  });
}

// Render profile section
function renderProfile(profile) {
  // Update tags
  const tagsContainer = document.querySelector('.profile-name-title .tags');
  if (tagsContainer && profile.tags) {
    const tags = tArr(profile, 'tags');
    tagsContainer.innerHTML = tags
      .map(tag => `<span class="tag">${esc(tag)}</span>`)
      .join('');
  }
  
  // Update bio (plain text; bio contains no placeholders)
  const bioElement = document.querySelector('.bio-highlight');
  if (bioElement && profile.bio) {
    bioElement.textContent = t(profile, 'bio');
  }
  
  // Update contact buttons
  const contactButtonsContainer = document.querySelector('.contact-buttons');
  if (contactButtonsContainer && Array.isArray(profile.contacts)) {
    const safeHref = (url) => {
      const u = String(url || '');
      if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
      if (u.startsWith('/') || u.startsWith('#')) return u;
      return '#';
    };
    contactButtonsContainer.innerHTML = profile.contacts
      .filter(contact => contact && (contact.url || contact.label))
      .map(contact => {
        const href = safeHref(contact.url);
        const external = /^https?:/i.test(href);
        const label = esc(t(contact, 'label')) || 'Link';
        return `
        <a href="${esc(href)}" class="contact-button" aria-label="${label}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
          <i class="ri-lg ${esc(contact.icon || 'ri-link')}" aria-hidden="true"></i> ${label} <span class="contact-arrow" aria-hidden="true"><i class="ri-lg ri-arrow-right-s-line" aria-hidden="true"></i></span>
        </a>
        `;
      })
      .join('');
  }
}

// Escape untrusted text before interpolating into markup
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (ch) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}[ch]));

// Render section headings from data
function renderSectionHeadings(headings) {
  if (!headings) return;
  const map = {
    projects: '#projects h2',
    competitions: '#competitions h2',
    leadership: '#leadership h2',
    vision: '#vision h2'
  };
  Object.entries(map).forEach(([key, selector]) => {
    const heading = document.querySelector(selector);
    const text = t(headings, key);
    if (heading && text) heading.textContent = text;
  });
}

// Optional card badges: result first, then status. Team/period stay in data only.
function cardBadges(item) {
  const neutral = ['status']
    .filter(field => item[field])
    .map(field => `<span class="card-badge">${esc(t(item, field))}</span>`)
    .join('');
  const result = item.result
    ? `<span class="card-badge">${esc(t(item, 'result'))}</span>`
    : '';
  return result + neutral;
}

const emptyNote = (isBn) => isBn ? 'শীঘ্রই আসছে।' : 'Nothing here yet.';

// Render projects
function renderProjects(projects) {
  const projectsGrid = document.querySelector('#projects .projects-grid');
  if (!projectsGrid || !projects) return;
  
  if (!projects.length) {
    projectsGrid.innerHTML = `<p class="muted-text">${emptyNote()}</p>`;
    return;
  }
  projectsGrid.innerHTML = projects
    .map(project => `
      <article class="project-card bottom-align">
        <h3 class="project-title">${esc(t(project, 'title'))}</h3>
        ${project.organization ? `<div class="card-meta">${esc(t(project, 'organization'))}</div>` : ''}
        <p>${esc(t(project, 'description'))}</p>
        <div>${cardBadges(project)}</div>
        ${project.link ? `
          <a class="learn-more-btn" href="${esc(project.link)}" target="_blank" rel="noopener noreferrer" aria-label="Learn more about ${esc(project.title)} (opens in a new tab)">
            ${esc(t(project, 'linkText'))}
            <svg class="arrow-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        ` : ''}
      </article>
    `)
    .join('');
}

// Render competitions & awards
function renderCompetitions(competitions) {
  const competitionsGrid = document.querySelector('#competitions .competitions-grid');
  if (!competitionsGrid || !competitions) return;
  
  if (!competitions.length) {
    competitionsGrid.innerHTML = `<p class="muted-text">${emptyNote()}</p>`;
    return;
  }
  competitionsGrid.innerHTML = competitions
    .map(competition => `
      <article class="competition-card">
        <h3 class="competition-title">${esc(t(competition, 'title'))}</h3>
        ${competition.organization ? `<div class="card-meta">${esc(t(competition, 'organization'))}</div>` : ''}
        <p>${esc(t(competition, 'description'))}</p>
        <div>${cardBadges(competition)}</div>
        ${competition.link ? `
          <a class="learn-more-btn" href="${esc(competition.link)}" target="_blank" rel="noopener noreferrer" aria-label="Learn more about ${esc(competition.title)} (opens in a new tab)">
            ${esc(t(competition, 'linkText')) || 'Learn More'}
            <svg class="arrow-icon" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        ` : ''}
      </article>
    `)
    .join('');
}

// Render leadership
function renderLeadership(leadership) {
  const leadershipList = document.querySelector('#leadership .leadership-list');
  if (!leadershipList || !leadership) return;
  
  if (!leadership.length) {
    leadershipList.innerHTML = `<p class="muted-text">${emptyNote()}</p>`;
    return;
  }
  leadershipList.innerHTML = leadership
    .map(item => `
      <article class="leadership-item">
        <h3 class="leadership-title">${esc(t(item, 'title'))}</h3>
        <div class="leadership-org">${esc(t(item, 'organization'))}</div>
        <p>${esc(t(item, 'description'))}</p>
        <div>${cardBadges(item)}</div>
      </article>
    `)
    .join('');
}

// Render vision (preserve source order)
function renderVision(vision) {
  const visionSection = document.querySelector('#vision');
  if (!visionSection || !vision || !vision.paragraphs) return;
  
  // Find existing paragraphs and replace them
  const existingParagraphs = visionSection.querySelectorAll('p');
  existingParagraphs.forEach(p => p.remove());
  
  // Add new paragraphs in order
  const h2 = visionSection.querySelector('h2');
  const paragraphs = tArr(vision, 'paragraphs');
  let anchor = h2;
  paragraphs.forEach(text => {
    const p = document.createElement('p');
    p.textContent = text;
    anchor.insertAdjacentElement('afterend', p);
    anchor = p;
  });
}

// Scroll reveal: one subtle rise per section. Hidden state is JS-gated
// (CSS scopes it under .js), so no-JS and crawlers see everything.
function initReveals() {
  const sections = document.querySelectorAll('main .section');
  if (!sections.length) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    sections.forEach((s) => s.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  const revealIfVisible = () => {
    sections.forEach((s) => {
      if (s.classList.contains('is-visible')) return;
      const r = s.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.92 && r.bottom > 0) {
        s.classList.add('is-visible');
        observer.unobserve(s);
      }
    });
  };
  sections.forEach((s) => {
    s.classList.add('reveal');
    observer.observe(s);
  });
  revealIfVisible();
  window.addEventListener('scroll', revealIfVisible, { passive: true });
  window.addEventListener('resize', revealIfVisible);
  // Keyboard users tabbing into a not-yet-visible section reveal it.
  document.addEventListener('focusin', (e) => {
    const section = e.target.closest && e.target.closest('main .section.reveal');
    if (section && !section.classList.contains('is-visible')) {
      section.classList.add('is-visible');
      observer.unobserve(section);
    }
  });
}

// Static starfield: faint fixed dots, no twinkle, no parallax.
function createStars() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const container = document.getElementById('space-container');
  if (!container || container.childElementCount) return;
  const sizes = ['tiny', 'tiny', 'small', 'small', 'medium', 'bright'];
  const count = Math.min(110, Math.floor((window.innerWidth * window.innerHeight) / 14000));
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star ' + sizes[Math.floor(Math.random() * sizes.length)];
    star.style.left = (Math.random() * 100).toFixed(2) + '%';
    star.style.top = (Math.random() * 100).toFixed(2) + '%';
    container.appendChild(star);
  }
}

// Moon-phase favicon: draws tonight's actual moon on a canvas and
// installs it as the tab icon. Static /res/favicon.svg remains the fallback.
function setMoonFavicon() {
  try {
    const SYNODIC = 29.530588853;
    const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14) / 86400000;
    const days = Date.now() / 86400000 - KNOWN_NEW_MOON;
    let phase = (days % SYNODIC) / SYNODIC;
    if (phase < 0) phase += 1;

    const S = 64, R = 26, cx = S / 2, cy = S / 2;
    const canvas = document.createElement('canvas');
    canvas.width = S;
    canvas.height = S;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const LIT = '#ededed';
    const DARK = '#4a4a4a';

    // Dark-side base disk (always visible, so new moon still reads).
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = DARK;
    ctx.fill();

    // Lit region: lit-side semicircle, then the terminator ellipse
    // painted lit (gibbous) or dark (crescent) over it.
    const litLeft = phase > 0.5; // waxing: right lit; waning: left lit
    const gibbous = phase > 0.25 && phase < 0.75;
    const rx = Math.abs(R * Math.cos(2 * Math.PI * phase));
    ctx.fillStyle = LIT;
    ctx.beginPath();
    ctx.arc(cx, cy, R, litLeft ? Math.PI / 2 : -Math.PI / 2, litLeft ? Math.PI * 1.5 : Math.PI / 2);
    ctx.closePath();
    ctx.fill();
    if (rx > 0.5) {
      ctx.fillStyle = gibbous ? LIT : DARK;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, R, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    let link = document.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.type = 'image/png';
    link.href = canvas.toDataURL('image/png');
  } catch (e) { /* keep static fallback icon */ }
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function () {
  document.documentElement.classList.add('js');
  applyTheme(getPreferredTheme());

  // Load portfolio data (no-op on pages without portfolio sections)
  loadPortfolioData();

  // Static stars (skipped under reduced motion)
  createStars();

  // Tonight's moon as the tab icon
  setMoonFavicon();

  // Theme toggle event listeners
  const themeToggleButtons = document.querySelectorAll('.theme-toggle, #theme-toggle');
  themeToggleButtons.forEach(button => {
    if (button) {
      button.addEventListener('click', toggleTheme);
    }
  });

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  // Back-to-top: appears after scrolling past the hero
  const toTop = document.getElementById('to-top');
  if (toTop) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const syncTop = () => {
      const show = window.scrollY > window.innerHeight * 0.6;
      toTop.classList.toggle('show', show);
      if (show) toTop.removeAttribute('hidden');
      else toTop.setAttribute('hidden', '');
    };
    window.addEventListener('scroll', syncTop, { passive: true });
    syncTop();
    toTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  // Dot constellation: highlight the section in view
  const dots = Array.from(document.querySelectorAll('.dotnav a'));
  if (dots.length) {
    const byId = new Map(dots.map(d => [d.getAttribute('href').slice(1), d]));
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        dots.forEach((d) => {
          d.classList.remove('active');
          d.removeAttribute('aria-current');
        });
        const dot = byId.get(entry.target.id);
        if (dot) {
          dot.classList.add('active');
          dot.setAttribute('aria-current', 'true');
        }
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    document.querySelectorAll('main .section[id], #top').forEach((s) => sectionObserver.observe(s));
  }
});
