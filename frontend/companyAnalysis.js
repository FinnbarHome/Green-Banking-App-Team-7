async function fetchCompanyData() {
    try {
      // Replace '3' with dynamic data if needed
      const response = await fetch('/api/companies/3'); // Updated this line
      const companyData = await response.json();
      
      // Update the DOM elements with the fetched data
      document.getElementById('companyName').textContent = companyData['Company Name'];
      document.getElementById('transactionType').textContent = companyData['Spending Category']; // Add a transaction type if applicable
      document.getElementById('carbEmissions').textContent = companyData['Carbon Emissions'];
      document.getElementById('wasteManagement').textContent = companyData['Waste Management'];
      document.getElementById('sustainPractices').textContent = companyData['Sustainability Practices'];
      
      // Calculate Environmental Impact Score (for example)
      const eiScore = (companyData['Carbon Emissions'] + companyData['Waste Management'] + companyData['Sustainability Practices']) / 3;
      document.getElementById('eiScore').textContent = eiScore.toFixed(2);
      
    } catch (error) {
      console.error('Error fetching company data:', error);
    }
  }

  // Call the function to fetch data when the page loads
  window.onload = fetchCompanyData;