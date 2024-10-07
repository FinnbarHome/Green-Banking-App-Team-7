async function fetchCompanyData() {
  try {
      const companyName = getCompanyNameFromUrl();
      const response = await fetch(`/api/companies/name/${encodeURIComponent(companyName)}`); // Adjust API endpoint as needed
      if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const companyData = await response.json();

      // Update the elements with the data
      document.getElementById('companyName').textContent = companyData['Company Name'];
      document.getElementById('transactionType').textContent = companyData['Spending Category']; // Add a transaction type if applicable
      document.getElementById('carbEmissions').textContent = companyData['Carbon Emissions'];
      document.getElementById('wasteManagement').textContent = companyData['Waste Management'];
      document.getElementById('sustainPractices').textContent = companyData['Sustainability Practices'];

      // Calculate EIS
      const eiScore = (companyData['Carbon Emissions'] + companyData['Waste Management'] + companyData['Sustainability Practices']) / 3;
      document.getElementById('eiScore').textContent = eiScore.toFixed(2);
      
      // Calculate RAG from EIS
      getRagRating(eiScore); 

      spendCat = companyData['Spending Category'];
      compName = companyData['Company Name'];
      greenAlternatives(compName, spendCat, eiScore);
      
  } catch (error) {
      console.error('Error fetching company data:', error);
  }
}

function getRagRating(eiScore) {
  let Ragrating = eiScore;
  const ragRatingElement = document.getElementById("ragRating");

  // Change coloring and text based on RAG rating
  if (Ragrating <= 3) {
    ragRatingElement.textContent = "Red";
    ragRatingElement.classList.add("text-red-400"); 
  } else if (Ragrating <= 7) {
    ragRatingElement.textContent = "Amber";
    ragRatingElement.classList.add("text-orange-500");
  } else {
    ragRatingElement.textContent = "Green";
    ragRatingElement.classList.add("text-green-400"); 
  }
}

function getCompanyNameFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('companyName');
}

// Ftech the green alternative companies
async function greenAlternatives(companyName, spendingCategory, CompanyEIS) {
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
      .filter(company => {
        // Validate spending category
        const companySpendingCategory = company["Spending Category"] || '';
        console.log('Company Spending Category:', companySpendingCategory);

        return companySpendingCategory.toLowerCase() === spendingCategory.toLowerCase() &&
               calculateEIS(company) >= 7 && company["Company Name"] != companyName && calculateEIS(company) >= CompanyEIS;
      })
      .sort((a, b) => calculateEIS(b) - calculateEIS(a))
      .slice(0, 3);

    console.log('Green Companies:', greenCompanies);

    // Display the alternatives
    displayGreenAlternatives(greenCompanies);

  } catch (error) {
    console.error('Error in greenAlternatives function:', error);
    throw error;
  }
}



function calculateEIS(company) {

  // Fetch the EIS figures from the data
  const carbonEmissions = company['Carbon Emissions'] || 0;
  const wasteManagement = company['Waste Management'] || 0;
  const sustainabilityPractices = company['Sustainability Practices'] || 0;

  // Calculate the EIS as an average
  const total = carbonEmissions + wasteManagement + sustainabilityPractices;
  const eis = total / 3;

  return eis;
}

// Display the green alternative companies
function displayGreenAlternatives(greenCompanies) {
  const alternativesContainer = document.getElementById('alternatives');

  alternativesContainer.innerHTML = '';

  // Handle case where there are no greener alternatives
  if (greenCompanies.length === 0) {
    alternativesContainer.textContent = "No green alternative companies available";
    alternativesContainer.classList.add("text-red-400");
    alternativesContainer.classList.add("font-bold");
    alternativesContainer.classList.add("text-center");
    alternativesContainer.classList.add("text-xl");
    return;
  }

  // Style the green companies
  greenCompanies.forEach(company => {
    const companyElement = document.createElement('div');
    companyElement.classList.add(
      'bg-gray-700',        
      'p-4',                 
      'rounded-lg',         
      'shadow-md',           
      'mb-4',                
    );
    companyElement.innerHTML = `
      <h3 class="text-xl font-bold text-green-400">${company['Company Name']}</h3>
      <p class="text-white">Environmental Impact Score: ${calculateEIS(company).toFixed(2)}</p>
    `;
    alternativesContainer.appendChild(companyElement);
  });
}



// Call the function upon page loading
window.onload = fetchCompanyData;
