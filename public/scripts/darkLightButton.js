document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('themeToggle');
    const body = document.body;

    // Check if the user already has a theme preference
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
      body.classList.add(currentTheme);
    } else {
      // Set default mode to dark if not set
      localStorage.setItem('theme', 'dark');
    }

    // Update button text based on current theme
    updateButtonText();

    // Toggle the theme when the button is clicked
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

    // Function to update button text and toggle between light/dark mode
    function updateButtonText() {
      // Select all text elements but exclude those inside the navbar
      const textElements = document.querySelectorAll('body *:not(nav):not(nav *) .text-white, body *:not(nav):not(nav *) .text-black');

      if (localStorage.getItem('theme') === 'light') {
        themeToggleBtn.textContent = 'Toggle Dark Mode';

        // Change background and text colors for light mode
        body.classList.remove('bg-gray-900');
        body.classList.add('bg-white', 'text-gray-900');
        
        // Update all elements with text-white to text-black, excluding navbar
        textElements.forEach((el) => {
          el.classList.remove('text-white');
          el.classList.add('text-black');
        });
      } else {
        themeToggleBtn.textContent = 'Toggle Light Mode';

        // Change background and text colors for dark mode
        body.classList.remove('bg-white');
        body.classList.add('bg-gray-900', 'text-white');

        // Update all elements with text-black to text-white, excluding navbar
        textElements.forEach((el) => {
          el.classList.remove('text-black');
          el.classList.add('text-white');
        });
      }
    }
});