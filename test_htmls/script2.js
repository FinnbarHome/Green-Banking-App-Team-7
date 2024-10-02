document.addEventListener('DOMContentLoaded', () => {
    // Fetch all companies when the page loads
    fetch('http://localhost:3000/api/companies')
      .then(response => response.json())
      .then(companies => {
        const companiesContainer = document.getElementById('companiesContainer');
  
        // Loop through each company and display its data
        companies.forEach(company => {
          // Create a section for each company
          const companySection = document.createElement('div');
          companySection.classList.add('company-section');
  
          // Display the Company Name as a header
          const companyName = document.createElement('h3');
          companyName.innerText = company["Company Name"] || 'Unknown Company'; // Adjusted to match your data
          companySection.appendChild(companyName);
  
          // Display the Account Number
          const accountNumber = document.createElement('p');
          accountNumber.innerText = `Account Number: ${company["Account Number"] || 'N/A'}`;
          companySection.appendChild(accountNumber);
  
          // Display the Balance
          const balance = document.createElement('p');
          balance.innerText = `Balance: ${company.Balance || 'N/A'}`;
          companySection.appendChild(balance);
  
          // Display the Carbon Emissions
          const carbonEmissions = document.createElement('p');
          carbonEmissions.innerText = `Carbon Emissions: ${company["Carbon Emissions"] || 'N/A'}`;
          companySection.appendChild(carbonEmissions);
  
          // Display the Spending Category
          const spendingCategory = document.createElement('p');
          spendingCategory.innerText = `Spending Category: ${company["Spending Category"] || 'N/A'}`;
          companySection.appendChild(spendingCategory);
  
          // Display the Summary
          const summary = document.createElement('p');
          summary.innerText = `Summary: ${company.Summary || 'N/A'}`;
          companySection.appendChild(summary);
  
          // Display the Sustainability Practices
          const sustainabilityPractices = document.createElement('p');
          sustainabilityPractices.innerText = `Sustainability Practices: ${company["Sustainability Practices"] || 'N/A'}`;
          companySection.appendChild(sustainabilityPractices);
  
          // Display the Waste Management
          const wasteManagement = document.createElement('p');
          wasteManagement.innerText = `Waste Management: ${company["Waste Management"] || 'N/A'}`;
          companySection.appendChild(wasteManagement);
  
          // Display the XP
          const xp = document.createElement('p');
          xp.innerText = `XP: ${company.XP || 'N/A'}`;
          companySection.appendChild(xp);
  
          // Append the company section to the container
          companiesContainer.appendChild(companySection);
        });
      })
      .catch(error => {
        console.error('Error fetching company data:', error);
        const companiesContainer = document.getElementById('companiesContainer');
        companiesContainer.innerText = 'Failed to load company data';
      });
  });
  