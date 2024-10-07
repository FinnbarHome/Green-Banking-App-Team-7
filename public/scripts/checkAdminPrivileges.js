// General function to fetch data and handle any errors
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

// Add "admin.html" link if the user is an admin
async function checkAdminStatus() {
    // Get the account number from localStorage
    const accountNumber = localStorage.getItem('accountNumber');
    if (!accountNumber) return;

    try {
        // Fetch company details via account number
        const companyData = await fetchData(`/api/companies/${accountNumber}`, "company data");
        if (!companyData) return;

        // Check if the Spending Category is not "User"
        if (companyData['Spending Category'] !== 'User') {
            const currentPage = window.location.pathname.split('/').pop();
            const mobileMenu = document.getElementById('mobileMenu');

            // Check if the "Admin" link is already there
            let mobileAdminLink = mobileMenu.querySelector('a[href="admin.html"]');

            if (!mobileAdminLink) {
                // Create a new "admin.html" link if it's not there already
                mobileAdminLink = document.createElement('a');
                mobileAdminLink.href = 'admin.html';
                mobileAdminLink.classList = 'block px-3 py-2 text-gray-400 hover:bg-green-700 hover:text-white';
                mobileAdminLink.textContent = 'Admin';

                // Insert the admin button before the "Sign Out" button
                mobileMenu.insertBefore(mobileAdminLink, mobileMenu.querySelector('a[href="login.html"]'));
            }

            // Highlight the "Admin" link in the mobile menu
            if (currentPage === 'admin.html') {
                mobileAdminLink.classList.remove('text-gray-400');
                mobileAdminLink.classList.add('bg-black', 'text-white');
            }
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
    }
}

checkAdminStatus();
