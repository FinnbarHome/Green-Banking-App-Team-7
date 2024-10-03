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

            // Find the mobile menu element
            const mobileMenu = document.getElementById('mobileMenu');

            // Check if the "Admin" link already exists in the mobile menu
            let mobileAdminLink = mobileMenu.querySelector('a[href="admin.html"]');

            if (!mobileAdminLink) {
                // Create a new "admin.html" link if it doesn't exist for the mobile menu
                mobileAdminLink = document.createElement('a');
                mobileAdminLink.href = 'admin.html';
                mobileAdminLink.classList = 'block px-3 py-2 text-gray-400 hover:bg-green-700 hover:text-white';
                mobileAdminLink.textContent = 'Admin';

                // Insert the admin link before the "Sign Out" link in the mobile menu
                mobileMenu.insertBefore(mobileAdminLink, mobileMenu.querySelector('a[href="login.html"]'));
            }

            // If the current page is "admin.html", highlight the "Admin" link in the mobile menu
            if (currentPage === 'admin.html') {
                mobileAdminLink.classList.remove('text-gray-400');
                mobileAdminLink.classList.add('bg-black', 'text-white');
            }
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
    }
}

// Call the function to check admin status
checkAdminStatus();
