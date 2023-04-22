function toggleTheme () {
  const currentTheme = document.getElementById("autoTheme").getAttribute("data-bs-theme");
  const newTheme = currentTheme === "light" ? "dark": "light";
  document.getElementById("autoTheme").setAttribute("data-bs-theme", newTheme);
}

function toggleThemeAuto() {
  const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'dark': 'light';
  document.getElementById('autoTheme').setAttribute('data-bs-theme', systemTheme);
}

// Set initial theme on page load
toggleThemeAuto();