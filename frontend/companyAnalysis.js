async function fetchCompanyData() {
  try {
      const companyName = getCompanyNameFromUrl();
      const response = await fetch(`/api/companies/name/${encodeURIComponent(companyName)}`); // Adjust API endpoint as needed
      if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
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
      
      // Call getRagRating and pass the calculated EIS
      getRagRating(eiScore);  // Pass the environmental impact score

      spendCat = companyData['Spening Category'];
      greenAlternatives(spendCat);
      
  } catch (error) {
      console.error('Error fetching company data:', error);
  }
}

function getRagRating(eiScore) {
  let Ragrating = eiScore; // Use the passed eiScore to determine RAG rating
  const ragRatingElement = document.getElementById("ragRating");

  if (Ragrating <= 3) {
    ragRatingElement.textContent = "Red";
    ragRatingElement.classList.add("text-red-400"); // Set text color to red
  } else if (Ragrating <= 7) {
    ragRatingElement.textContent = "Amber";
    ragRatingElement.classList.add("text-orange-500"); // Set text color to orange for amber
  } else {
    ragRatingElement.textContent = "Green";
    ragRatingElement.classList.add("text-green-400");  // Set text color to green
  }
}




function getCompanyNameFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('companyName');
}

async function greenAlternatives(spendingCategory) {
  try {
    const response = await fetch('/api/companies', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch companies data');
    }

    const companies = await response.json();

    const greenCompanies = companies
      .filter(company => 
        company.SpendingCategory === spendingCategory && 
        calculateEIS(company) >= 0.7
      )
      .sort((a, b) => calculateEIS(b) - calculateEIS(a))
      .slice(0, 3);

      console.log(greenCompanies);
    
    // Now you need to display the green alternatives on the page
    displayGreenAlternatives(greenCompanies);

  } catch (error) {
    console.error('Error in greenAlternatives function:', error);
    throw error;
  }
}

function calculateEIS(company) {
  // Assuming the company data contains these fields:
  const carbonEmissions = company['Carbon Emissions'] || 0;
  const wasteManagement = company['Waste Management'] || 0;
  const sustainabilityPractices = company['Sustainability Practices'] || 0;

  // Calculate the Environmental Impact Score as the average of the three factors
  const total = carbonEmissions + wasteManagement + sustainabilityPractices;
  const eis = total / 3;

  return eis;
}

function displayGreenAlternatives(greenCompanies) {
  const alternativesContainer = document.getElementById('alternatives'); // Ensure you have an element with this ID in HTML

  alternativesContainer.innerHTML = ''; // Clear any previous content

  if (greenCompanies.length === 0) {
    alternativesContainer.textContent = "No green alternatives available.";
    return;
  }

  greenCompanies.forEach(company => {
    const companyElement = document.createElement('div');
    companyElement.classList.add('green-company');
    companyElement.innerHTML = `
      <h3 class="text-xl font-bold text-green-500">${company['Company Name']}</h3>
      <p>Environmental Impact Score: ${calculateEIS(company).toFixed(2)}</p>
    `;
    alternativesContainer.appendChild(companyElement);
  });
}


// Call the function to fetch data when the page loads
window.onload = fetchCompanyData;
