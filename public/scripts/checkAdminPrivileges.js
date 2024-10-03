// General function to fetch data and handle errors
async function fetchData(url, dataType) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const { error } = await response.json();
            throw new Error(`Error fetching ${dataType}: ${error}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

// Function to dynamically add "admin.html" link if the user is an admin
async function checkAdminStatus() {
    // Get the account number from localStorage
    const accountNumber = localStorage.getItem('accountNumber');

    // If no account number is found, stop the script
    if (!accountNumber) return;

    try {
        // Fetch company details using the account number
        const companyData = await fetchData(`/api/companies/${accountNumber}`, "company data");
        if (!companyData) return;

        // Check if the Spending Category is not "User"
        if (companyData['Spending Category'] !== 'User') {
            // Get the current page URL
            const currentPage = window.location.pathname.split('/').pop();

            // Find the navbar div that contains links
            const navbarDiv = document.querySelector('nav .flex-nowrap');

            // Check if the "Admin" link already exists in the navbar
            let adminLink = navbarDiv.querySelector('a[href="admin.html"]');
            
            if (!adminLink) {
                // Create a new "admin.html" link if it doesn't exist
                adminLink = document.createElement('a');
                adminLink.href = 'admin.html';
                adminLink.classList = 'rounded px-3 py-2 text-gray-400 hover:bg-green-700 hover:text-white';
                adminLink.textContent = 'Admin';

                // Insert the admin link in the correct position (after "Rewards" but before "Sign Out")
                navbarDiv.insertBefore(adminLink, navbarDiv.querySelector('a[href="login.html"]'));
            }

            // If the current page is "admin.html", highlight the "Admin" link
            if (currentPage === 'admin.html') {
                adminLink.classList.remove('text-gray-400');
                adminLink.classList.add('bg-black', 'text-white');
            }
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
    }
}

// Call the function to check admin status
checkAdminStatus();
