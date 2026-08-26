// Age calculation function
function calculateAge(birthDate) {
  if (Number.isNaN(new Date(birthDate).getTime())) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

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
  // Update all theme icons
  const themeIcons = document.querySelectorAll('.theme-toggle i, #theme-toggle i, #theme-toggle-sidebar i');
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
  renderTechnicalSkills(data.technicalSkills);
  renderVision(data.vision);
}

// Function to load and render portfolio data
async function loadPortfolioData() {
  setLoadingState(true);
  try {
    const response = await fetch('/res/data.json');
    if (!response.ok) {
      throw new Error(`Failed to load data (${response.status})`);
    }
    const data = await response.json();
    if (!data?.profile || !Array.isArray(data.projects) || !Array.isArray(data.competitions)) {
      throw new Error('Portfolio data is incomplete.');
    }
    
    renderAllContent(data);
    setLoadingState(false);
    
  } catch (error) {
    console.error('Error loading portfolio data:', error);
    showPortfolioError('Sorry, portfolio data is currently unavailable. Please try again later.');
    setLoadingState(false);
  }
}

const CONTENT_SECTIONS = ['projects', 'competitions', 'leadership', 'skills', 'vision'];

function sectionContainer(section) {
  return section.querySelector('.projects-grid, .competitions-grid, .leadership-list, .skills-content') || section;
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
    container.textContent = '';
    const error = document.createElement('p');
    error.className = 'error-text';
    error.textContent = message;
    container.appendChild(error);
  });
}

// Render profile section
function renderProfile(profile) {
  // Update tags
  const tagsContainer = document.querySelector('.profile-name-title .tags');
  if (tagsContainer && profile.tags) {
    const tags = tArr(profile, 'tags');
    tagsContainer.innerHTML = tags
      .map(tag => `<span class="tag">${tag}</span>`)
      .join('');
  }
  
  // Update bio with calculated age
  const bioElement = document.querySelector('.bio-highlight');
  if (bioElement && profile.bio) {
    const age = calculateAge(profile.birthDate);
    const bio = t(profile, 'bio');
    bioElement.innerHTML = bio.replace('{age}', `<span id="age">${age ?? 'N/A'}</span>`);
  }
  
  // Update contact buttons
  const contactButtonsContainer = document.querySelector('.contact-buttons');
  if (contactButtonsContainer && profile.contacts) {
    contactButtonsContainer.innerHTML = profile.contacts
      .map(contact => `
        <a href="${contact.url}" class="contact-button" ${contact.url.startsWith('http') ? 'target="_blank" rel="noopener noreferrer"' : ''}>
          <i class="ri-lg ${contact.icon}"></i> ${t(contact, 'label')} <i class="ri-lg ri-arrow-right-s-line"></i>
        </a>
      `)
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
    technicalSkills: '#skills h2',
    vision: '#vision h2'
  };
  Object.entries(map).forEach(([key, selector]) => {
    const heading = document.querySelector(selector);
    const text = t(headings, key);
    if (heading && text) heading.textContent = text;
  });
}

// Optional card badges: status, result, organization, team, period
function cardBadges(item) {
  return ['status', 'result', 'team', 'period']
    .filter(field => item[field])
    .map(field => `<span class="card-badge">${esc(t(item, field))}</span>`)
    .join('');
}

// Render projects
function renderProjects(projects) {
  const projectsGrid = document.querySelector('#projects .projects-grid');
  if (!projectsGrid || !projects) return;
  
  projectsGrid.innerHTML = projects
    .map(project => `
      <article class="project-card bottom-align">
        <div class="project-title">${esc(t(project, 'title'))}</div>
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
  
  competitionsGrid.innerHTML = competitions
    .map(competition => `
      <article class="competition-card">
        <div class="competition-title">${esc(t(competition, 'title'))}</div>
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
  
  leadershipList.innerHTML = leadership
    .map(item => `
      <article class="leadership-item">
        <div class="leadership-title">${esc(t(item, 'title'))}</div>
        <div class="leadership-org">${esc(t(item, 'organization'))}</div>
        <p>${esc(t(item, 'description'))}</p>
        <div>${cardBadges(item)}</div>
      </article>
    `)
    .join('');
}

// Render technical skills
function renderTechnicalSkills(skills) {
  const container = document.querySelector('#skills .skills-content');
  if (!container || !skills) return;
  
  const group = (label, items) => (Array.isArray(items) && items.length)
    ? `
      <div class="skills-group">
        <h3 class="skills-group-title">${esc(label)}</h3>
        <div class="tags">${items.map(item => `<span class="tag">${esc(item)}</span>`).join('')}</div>
      </div>
    `
    : '';
  
  // Preferred shape: { groups: [{ label, items: [...] }, ...] }
  // Falls back to the older { languages, interests } shape.
  const groups = Array.isArray(skills.groups)
    ? skills.groups.map(g => group(t(g, 'label'), tArr(g, 'items')))
    : [group('Languages', skills.languages), group('Interests', skills.interests)];
  
  container.innerHTML = groups.join('');
}

// Render vision
function renderVision(vision) {
  const visionSection = document.querySelector('#vision');
  if (!visionSection || !vision || !vision.paragraphs) return;
  
  // Find existing paragraphs and replace them
  const existingParagraphs = visionSection.querySelectorAll('p');
  existingParagraphs.forEach(p => p.remove());
  
  // Add new paragraphs
  const h2 = visionSection.querySelector('h2');
  const paragraphs = tArr(vision, 'paragraphs');
  paragraphs.forEach(text => {
    const p = document.createElement('p');
    p.textContent = text;
    h2.insertAdjacentElement('afterend', p);
  });
}

// Create stars for parallax effect
function createStars() {
  const spaceContainer = document.getElementById('space-container');
  if (!spaceContainer) return;
  
  // Clear any existing stars
  spaceContainer.innerHTML = '';
  
  // Create stars with different sizes
  const starSizes = ['small', 'medium', 'large'];
  const starCount = window.innerWidth <= 768 ? 35 : 70;
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.classList.add('space-element', 'star');
    
    // Add random size class
    const sizeClass = starSizes[Math.floor(Math.random() * starSizes.length)];
    star.classList.add(sizeClass);
    
    // Position randomly
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 3}s`;
    
    // Store original position for parallax calculation
    star.dataset.origLeft = star.style.left;
    star.dataset.origTop = star.style.top;
    
    spaceContainer.appendChild(star);
  }
  
  // Create planet - only shown on mobile
  const planet = document.createElement('div');
  planet.classList.add('space-element', 'planet');
  planet.style.left = '75%';
  planet.style.top = '20%';
  planet.style.display = window.innerWidth <= 768 ? 'block' : 'none';
  spaceContainer.appendChild(planet);
}

// Parallax effect function for stars
function initParallaxEffect() {
  const stars = document.querySelectorAll('.star');
  const planet = document.querySelector('.planet');
  
  // Exit if no stars found
  if (!stars.length) return;
  
  // Update planet visibility based on screen size
  function updatePlanetVisibility() {
    if (planet) {
      planet.style.display = window.innerWidth <= 768 ? 'block' : 'none';
    }
  }
  
  // Initial check
  updatePlanetVisibility();
  
  // Check on resize
  window.addEventListener('resize', updatePlanetVisibility);
  
  // For larger screens - mouse parallax
  if (window.innerWidth > 768) {
    // Mouse move event for parallax
    document.addEventListener('mousemove', (e) => {
      // Calculate center-relative position (-1 to 1 range)
      const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      const mouseY = (e.clientY / window.innerHeight) * 2 - 1;
      
      // Apply to each star with different depths
      stars.forEach((star, index) => {
        // Different depths based on star size
        let depth = 0.5;
        if (star.classList.contains('small')) depth = 0.3;
        if (star.classList.contains('medium')) depth = 0.5;
        if (star.classList.contains('large')) depth = 0.7;
        
        // Apply movement based on mouse position and depth
        const moveX = -mouseX * depth * 50; // Increase for more movement
        const moveY = -mouseY * depth * 50;
        
        // Apply transform
        star.style.transform = `translate(${moveX}px, ${moveY}px)`;
      });
    });
  } 
  // For smaller screens - gyroscope parallax
  else {
    if (window.DeviceOrientationEvent) {
      const enableDeviceMotion = () => window.addEventListener('deviceorientation', (e) => {
        const tiltX = e.beta ? (e.beta - 45) * 0.5 : 0;  // Adjust for typical holding angle
        const tiltY = e.gamma ? e.gamma * 0.5 : 0;
        
        stars.forEach((star) => {
          let depth = 0.5;
          if (star.classList.contains('small')) depth = 0.2;
          if (star.classList.contains('medium')) depth = 0.4;
          if (star.classList.contains('large')) depth = 0.6;
          
          const moveX = tiltY * depth * 3;
          const moveY = tiltX * depth * 3;
          
          star.style.transform = `translate(${moveX}px, ${moveY}px)`;
        });
        
        // Move planet in opposite direction for added depth
        if (planet && window.innerWidth <= 768) {
          const planetMoveX = -tiltY * 0.8 * 2;
          const planetMoveY = -tiltX * 0.8 * 2;
          planet.style.transform = `translate(${planetMoveX}px, ${planetMoveY}px)`;
        }
      });

      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const request = () => DeviceOrientationEvent.requestPermission()
          .then((permissionState) => {
            if (permissionState === 'granted') enableDeviceMotion();
          })
          .catch(() => {});
        window.addEventListener('click', request, { once: true });
      } else {
        enableDeviceMotion();
      }
    }
  }
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function () {
  // Initial theme setup
  applyTheme(getPreferredTheme());
  
  // Load portfolio data
  loadPortfolioData();
  
  // Theme toggle event listeners
  const themeToggleButtons = document.querySelectorAll('.theme-toggle, #theme-toggle, #theme-toggle-sidebar');
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
    menuToggle.addEventListener('click', () => {
      sidebar.classList.add('active');
      overlay.classList.add('active');
      sidebarCollapse.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    });
    
    sidebarCollapse.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      sidebarCollapse.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
    
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      sidebarCollapse.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
    
    document.querySelectorAll('.sidebar-link').forEach(link => {
      link.addEventListener('click', () => {
        if (link.getAttribute('href').startsWith('#')) {
          sidebar.classList.remove('active');
          overlay.classList.remove('active');
          sidebarCollapse.setAttribute('aria-expanded', 'false');
          document.body.style.overflow = '';
        }
      });
    });
  }
  
  // Create space elements
  try {
    createStars();
  } catch (error) {
    console.error('Error creating stars:', error);
  }
  
  // Initialize parallax effect with a small delay to ensure DOM is ready
  setTimeout(initParallaxEffect, 100);
});
