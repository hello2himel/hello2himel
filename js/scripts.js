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

// Create stars for parallax effect
function createStars() {
  const spaceContainer = document.getElementById('space-container');
  if (!spaceContainer) return;
  
  // Clear any existing stars
  spaceContainer.innerHTML = '';
  
  // Create stars with different sizes
  const starSizes = ['small', 'medium', 'large'];
  for (let i = 0; i < 70; i++) {
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
    // Add debug element to check if mouse events are firing
    const debug = document.createElement('div');
    debug.style.position = 'fixed';
    debug.style.bottom = '10px';
    debug.style.left = '10px';
    debug.style.background = 'rgba(0,0,0,0.7)';
    debug.style.color = 'white';
    debug.style.padding = '5px';
    debug.style.fontSize = '12px';
    debug.style.zIndex = '9999';
    debug.style.display = 'none'; // Set to 'block' for debugging
    document.body.appendChild(debug);
    
    // Mouse move event for parallax
    document.addEventListener('mousemove', (e) => {
      // Update debug info
      debug.textContent = `Mouse: X=${e.clientX}, Y=${e.clientY}`;
      
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
      window.addEventListener('deviceorientation', (e) => {
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
    }
  }
}

// Initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', function () {
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
      document.body.style.overflow = 'hidden';
    });
    
    sidebarCollapse.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
    
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
    
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
  
  // Create space elements
  createStars();
  
  // Initialize parallax effect with a small delay to ensure DOM is ready
  setTimeout(initParallaxEffect, 100);
});