// Sélection des éléments DOM nécessaires
const body = document.querySelector('body');
const sidebar = document.querySelector('.sidebar');
const toggle = document.querySelector('.toggle');
const searchBtn = document.querySelector('.search-box');
const modeSwitch = document.querySelector('.toggle-switch');
const modeText = document.querySelector('.mode-text');
const mainContent = document.querySelector('.main-content');
const toggleSwitch = document.querySelector('.toggle-switch input[type="checkbox"]');
const carOptionsContainer = document.querySelector('.car-options-container');

// Gestion de la fermeture/ouverture de la sidebar
toggle.addEventListener("click", () => {
  sidebar.classList.toggle("close");
});

// Gestion de l'ouverture de la sidebar lors du clic sur la recherche
searchBtn.addEventListener("click", () => {
  sidebar.classList.remove("close");
});

// Gestion du mode sombre
modeSwitch.addEventListener('click', () => {
  body.classList.toggle('dark');
  mainContent.classList.toggle('dark-mode');
  if (body.classList.contains('dark')) {
    modeText.innerText = 'Light mode';
  } else {
    modeText.innerText = 'Dark mode';
  }
});

// Gestion de la redirection lors du clic sur une option de voiture
carOptionsContainer.addEventListener('click', (event) => {
  const clickedOption = event.target.closest('.car-option');
  if (clickedOption) {
    const targetPage = clickedOption.dataset.target;
    window.location.href = `/${targetPage}`;
  }
});
