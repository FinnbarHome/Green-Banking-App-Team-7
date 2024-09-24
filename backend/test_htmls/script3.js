document.addEventListener('DOMContentLoaded', () => {
    // Fetch all discounts when the page loads
    fetch('http://localhost:3000/api/discounts')
      .then(response => response.json())
      .then(discounts => {
        const discountsContainer = document.getElementById('discountsContainer');
  
        discounts.forEach(discount => {
          // Create a section for each discount
          const discountSection = document.createElement('div');
          discountSection.classList.add('discount-section');
  
          // Display the Company Name as a header
          const company = document.createElement('h3');
          company.innerText = discount.Company || 'Unknown Company';
          discountSection.appendChild(company);
  
          // Display the DiscountID
          const discountID = document.createElement('p');
          discountID.innerText = `DiscountID: ${discount.DiscountID || 'N/A'}`;
          discountSection.appendChild(discountID);
  
          // Display the Level Requirement
          const levelReq = document.createElement('p');
          levelReq.innerText = `Level Requirement: ${discount.LevelReq || 'N/A'}`;
          discountSection.appendChild(levelReq);
  
          // Display the Discount Code
          const discountCode = document.createElement('p');
          discountCode.innerText = `Discount Code: ${discount.DiscountCode || 'N/A'}`;
          discountSection.appendChild(discountCode);
  
          // Display the Description
          const description = document.createElement('p');
          description.innerText = `Description: ${discount.Description || 'N/A'}`;
          discountSection.appendChild(description);
  
          // Append the discount section to the container
          discountsContainer.appendChild(discountSection);
        });
      })
      .catch(error => {
        console.error('Error fetching discount data:', error);
        const discountsContainer = document.getElementById('discountsContainer');
        discountsContainer.innerText = 'Failed to load discount data';
      });
  });
  