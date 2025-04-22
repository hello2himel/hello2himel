// Age calculation function
function calculateAge(birthDate) {
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
  
  // Check system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  
  // Update all theme icons
  const themeIcons = document.querySelectorAll('.theme-toggle i, #theme-toggle i, #theme-toggle-sidebar i');
  themeIcons.forEach(icon => {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  });
};

const toggleTheme = () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  
  localStorage.setItem('theme', newTheme);
  applyTheme(newTheme);
};

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
  // Initial theme setup
  applyTheme(getPreferredTheme());
  
  // Set age if element exists
  const ageElement = document.getElementById('age');
  if (ageElement) {
      ageElement.textContent = calculateAge('2009-01-20');
  }
  
  // Theme toggle event listeners
  const themeToggleButtons = document.querySelectorAll('.theme-toggle, #theme-toggle, #theme-toggle-sidebar');
  themeToggleButtons.forEach(button => {
      if (button) {
          button.addEventListener('click', toggleTheme);
      }
  });
  
  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
      // Only apply if user hasn't manually set a preference
      if (!localStorage.getItem('theme')) {
          applyTheme(e.matches ? 'dark' : 'light');
      }
  });
  
  // Sidebar functionality for index page
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarCollapse = document.getElementById('sidebar-collapse');
  const overlay = document.getElementById('overlay');
  
  if (menuToggle && sidebar && sidebarCollapse && overlay) {
      // Toggle sidebar on menu button click
      menuToggle.addEventListener('click', () => {
          sidebar.classList.add('active');
          overlay.classList.add('active');
          document.body.style.overflow = 'hidden';
      });
      
      // Collapse sidebar button functionality
      sidebarCollapse.addEventListener('click', () => {
          sidebar.classList.remove('active');
          overlay.classList.remove('active');
          document.body.style.overflow = '';
      });
      
      // Close mobile sidebar when clicking overlay
      overlay.addEventListener('click', () => {
          sidebar.classList.remove('active');
          overlay.classList.remove('active');
          document.body.style.overflow = '';
      });
      
      // Close mobile sidebar when clicking menu links
      document.querySelectorAll('.sidebar-link').forEach(link => {
          link.addEventListener('click', () => {
              if (link.getAttribute('href').startsWith('#')) {
                  sidebar.classList.remove('active');
                  overlay.classList.remove('active');
                  document.body.style.overflow = '';
              }
          });
      });
  }
  
  // Create space elements for 404 page
  const spaceContainer = document.getElementById('space-container');
  if (spaceContainer) {
      // Create stars
      for (let i = 0; i < 50; i++) {
          const star = document.createElement('div');
          star.classList.add('space-element', 'star');
          star.style.left = `${Math.random() * 100}%`;
          star.style.top = `${Math.random() * 100}%`;
          star.style.animationDelay = `${Math.random() * 2}s`;
          spaceContainer.appendChild(star);
      }
      
      // Create a small planet in the background
      const planet = document.createElement('div');
      planet.classList.add('space-element', 'planet');
      planet.style.left = '75%';
      planet.style.top = '20%';
      spaceContainer.appendChild(planet);
  }
});