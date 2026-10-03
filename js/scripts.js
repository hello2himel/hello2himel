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
        <a href="${esc(href)}" class="contact-button contact-icon" aria-label="${label}" title="${label}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>
          <i class="ri-lg ${esc(contact.icon || 'ri-link')}" aria-hidden="true"></i>
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
    ? `<span class="card-badge card-badge-result">${esc(t(item, 'result'))}</span>`
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
            <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
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
            <svg class="arrow-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"
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
  sections.forEach((s) => {
    s.classList.add('reveal');
    observer.observe(s);
  });
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

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function () {
  document.documentElement.classList.add('js');
  applyTheme(getPreferredTheme());

  // Load portfolio data (no-op on pages without portfolio sections)
  loadPortfolioData();

  // Static stars (skipped under reduced motion)
  createStars();

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

  // Sidebar functionality
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarCollapse = document.getElementById('sidebar-collapse');
  const overlay = document.getElementById('overlay');

  if (menuToggle && sidebar && sidebarCollapse && overlay) {
    const closeSidebar = (refocus) => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      sidebarCollapse.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      if (refocus) menuToggle.focus({ preventScroll: true });
    };

    menuToggle.addEventListener('click', () => {
      sidebar.classList.add('active');
      overlay.classList.add('active');
      sidebarCollapse.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      sidebarCollapse.focus({ preventScroll: true });
    });

    sidebarCollapse.addEventListener('click', () => closeSidebar(true));
    overlay.addEventListener('click', () => closeSidebar(false));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('active')) {
        closeSidebar(true);
      }
    });

    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.addEventListener('click', () => {
        if ((link.getAttribute('href') || '').startsWith('#')) {
          closeSidebar(false);
        }
      });
    });
  }
});
