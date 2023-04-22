function toggleTheme() {
  const currentTheme = document.getElementById("autoTheme").getAttribute("data-bs-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.getElementById("autoTheme").setAttribute("data-bs-theme", newTheme);
  localStorage.setItem("theme", newTheme);
}

function toggleThemeAuto() {
  const savedTheme = localStorage.getItem("theme");
  const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'dark': 'light';
  const newTheme = savedTheme || systemTheme;
  document.getElementById('autoTheme').setAttribute('data-bs-theme', newTheme);
}

// Set initial theme on page load
toggleThemeAuto();
