async function fetchAccountData() {
  try {
      const accountNumber = localStorage.getItem('accountNumber'); // Correct casing
      if (!accountNumber) {
          console.error("No account number found in localStorage.");
          return; // Exit if no account number
      }

      // Fetch the company data using the account number
      const response = await fetch(`/api/companies/${accountNumber}`); // Use backticks for template literals

      // Check if the response is ok
      if (!response.ok) {
          const errorData = await response.json();
          console.error("Error fetching data:", errorData.error);
          return; // Exit if response is not ok
      }

      const companyData = await response.json();
      console.log(companyData); // Log the returned data to check its structure

      // Set the company data to the appropriate HTML elements
      document.getElementById('Username').textContent = "Username: " + companyData['Company Name'];
      document.getElementById('Balance').textContent = "Balance: " + companyData['Balance'];
      document.getElementById('Level').textContent = "XP: " + companyData['XP'];
  } catch (error) {
      console.error('Error fetching company data:', error);
  }
}

window.onload = fetchAccountData;
