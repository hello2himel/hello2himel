function toggleTheme() {
  const currentTheme = document.getElementById("autoTheme").getAttribute("data-bs-theme");
  const newTheme = currentTheme === "light" ? "dark" : "light";
  document.getElementById("autoTheme").setAttribute("data-bs-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  updateTextEmphasis(newTheme);
}

function toggleThemeAuto() {
  const savedTheme = localStorage.getItem("theme");
  const systemTheme = window.matchMedia('(prefers-color-scheme: light)').matches ? 'dark' : 'light';
  const newTheme = savedTheme || systemTheme;
  document.getElementById('autoTheme').setAttribute('data-bs-theme', newTheme);
  updateTextEmphasis(newTheme);
}

function updateTextEmphasis(theme) {
  const h1Name = document.getElementById("h1Name");
  if(theme === "light") {
    h1Name.classList.add("text-dark");
    h1Name.classList.remove("text-light-emphasis");
  } else {
    h1Name.classList.add("text-light-emphasis");
    h1Name.classList.remove("text-dark");
  }
}

// Set initial theme and text emphasis on page load
toggleThemeAuto();
