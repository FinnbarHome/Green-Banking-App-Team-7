// Helper function to create an element with classes and text content
function createElement(tag, classes = [], textContent = '') {
    const element = document.createElement(tag);
    classes.forEach(cls => element.classList.add(cls));
    if (textContent) element.textContent = textContent;
    return element;
}

// Generic API call handler
async function apiRequest(url, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Failed to ${method} at ${url}`);
    return response.json();
}

// Function to dynamically create a discount element with consistent styling and a delete button
function createDiscountElement(discount) {
    const discountElement = createElement('div', ['flex', 'justify-between', 'items-center', 'bg-green-900', 'mb-4', 'rounded-lg', 'py-4', 'px-5']);
    const companyElement = createElement('h2', ['text-xl', 'font-bold', 'text-white'], discount.Company);
    const descriptionElement = createElement('h2', ['text-xl', 'text-white', 'text-right', 'text-red-400'], discount.Description);
    const deleteButton = createElement('button', ['ml-4', 'bg-red-500', 'hover:bg-red-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded'], 'Delete');
    deleteButton.addEventListener('click', () => deleteDiscount(discount.DiscountID));
    discountElement.append(companyElement, descriptionElement, deleteButton);
    return discountElement;
}

// Function to get the largest DiscountID from existing discounts
async function getNextDiscountID() {
    try {
        const discounts = await apiRequest('/api/discounts');
        if (discounts.length === 0) return 1; // Start at 1 if there are no discounts
        return Math.max(...discounts.map(d => d.DiscountID)) + 1;
    } catch (error) {
        console.error("Error fetching discounts for ID generation:", error);
        return 1; // Fallback in case of error
    }
}

// Fetch all discounts and display them on the page with consistent styling
async function fetchDiscounts() {
    try {
        const discounts = await apiRequest('/api/discounts');
        const rewardsContainer = document.getElementById('rewardsContainer');
        rewardsContainer.innerHTML = ''; // Clear the previous list
        if (discounts.length === 0) {
            rewardsContainer.innerHTML = '<p class="text-xl font-bold text-white text-center">No discounts available at the moment.</p>';
            return;
        }
        // Display each discount in a consistent flexbox style with a delete button
        discounts.forEach(discount => rewardsContainer.appendChild(createDiscountElement(discount)));
    } catch (error) {
        console.error("Error fetching discounts:", error);
    }
}

// Function to create a new discount
async function createDiscount() {
    const companyName = document.getElementById("company").value;
    const reqLevel = document.getElementById("levelRequirement").value;
    const discountCode = document.getElementById("discountCode").value;
    const description = document.getElementById("description").value;
    const errorTag = document.getElementById("errorTag");
    errorTag.textContent = "";
    // Validate all input fields
    if (!companyName || !reqLevel || !discountCode || !description) {
        errorTag.classList = "text-red-400 text-center font-bold";
        errorTag.textContent = "You must fill out all the fields.";
        return;
    }
    // Get the next DiscountID
    const discountID = await getNextDiscountID();
    try {
        await apiRequest('/api/discounts', 'POST', {
            DiscountID: discountID,
            Company: companyName,
            LevelReq: parseInt(reqLevel),
            DiscountCode: discountCode,
            Description: description
        });
        errorTag.classList = "text-green-200 text-center font-bold";
        errorTag.textContent = "Discount created!";
        fetchDiscounts(); // Refresh the discount list
    } catch (error) {
        console.error("Error creating discount:", error);
        errorTag.classList = "text-red-400 text-center font-bold";
        errorTag.textContent = "An error occurred when creating the discount.";
    }
}

// Function to delete a discount by DiscountID
async function deleteDiscount(discountID) {
    try {
        await apiRequest(`/api/discounts/${discountID}`, 'DELETE');
        fetchDiscounts(); // Refresh the discount list after deletion
    } catch (error) {
        console.error("Error deleting discount:", error);
    }
}

// Automatically fetch discounts when the page loads
window.onload = fetchDiscounts;

// Add event listener for the create discount button
document.getElementById('createDiscountButton').addEventListener('click', createDiscount);
