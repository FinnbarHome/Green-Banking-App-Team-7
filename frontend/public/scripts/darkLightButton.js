document.addEventListener('DOMContentLoaded', () => {
  const themeToggleBtn = document.getElementById('themeToggle');
  const body = document.body;

  // Check for a theme preference
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme) {
    body.classList.add(currentTheme);
  } else {
    // Default to dark
    localStorage.setItem('theme', 'dark');
  }

  updateButtonText();

  // When button is clicked, toggle the coloring
  themeToggleBtn.addEventListener('click', () => {
    if (body.classList.contains('dark')) {
      body.classList.remove('dark');
      body.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      body.classList.remove('light');
      body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    updateButtonText();
  });


  function updateButtonText() {
    // Change all text, except nav bar
    const textElements = document.querySelectorAll('body *:not(nav):not(nav *) .text-white, body *:not(nav):not(nav *) .text-black');

    if (localStorage.getItem('theme') === 'light') {
      themeToggleBtn.textContent = 'Toggle Dark Mode';

      // Change coloring to light
      body.classList.remove('bg-gray-900');
      body.classList.add('bg-white', 'text-gray-900');
      
      // Change text coloring
      textElements.forEach((el) => {
        el.classList.remove('text-white');
        el.classList.add('text-black');
      });
    } else {
      themeToggleBtn.textContent = 'Toggle Light Mode';

      // Change colring to dark
      body.classList.remove('bg-white');
      body.classList.add('bg-gray-900', 'text-white');

      // Change text coloring
      textElements.forEach((el) => {
        el.classList.remove('text-black');
        el.classList.add('text-white');
      });
    }
  }
});
