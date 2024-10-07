// Helper function to create a new element with specified classes and text content
function createElement(tag, classes = [], textContent = '') {
    const element = document.createElement(tag);
    classes.forEach(cls => element.classList.add(cls));
    if (textContent) element.textContent = textContent;
    return element;
}

// Function to handle API requests in a streamlined way
async function apiRequest(url, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`Oops! Failed to ${method} at ${url}`);
    return response.json();
}

// This function creates a styled discount element with a delete button
function createDiscountElement(discount) {
    const discountElement = createElement('div', ['flex', 'justify-between', 'items-center', 'bg-green-900', 'mb-4', 'rounded-lg', 'py-4', 'px-5']);
    const companyElement = createElement('h2', ['text-xl', 'font-bold', 'text-white'], discount.Company);
    const descriptionElement = createElement('h2', ['text-xl', 'text-white', 'text-right', 'text-red-400'], discount.Description);
    const deleteButton = createElement('button', ['ml-4', 'bg-red-500', 'hover:bg-red-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded'], 'Delete');
    deleteButton.addEventListener('click', () => deleteDiscount(discount.DiscountID));
    discountElement.append(companyElement, descriptionElement, deleteButton);
    return discountElement;
}

// Function to find the next available DiscountID based on existing discounts
async function getNextDiscountID() {
    try {
        const discounts = await apiRequest('/api/discounts');
        if (discounts.length === 0) return 1; // Start with 1 if no discounts exist
        return Math.max(...discounts.map(d => d.DiscountID)) + 1; // Increment from the highest existing ID
    } catch (error) {
        console.error("Whoops! Error fetching discounts for ID generation:", error);
        return 1; // If there's an error, fallback to 1
    }
}

// Fetch all discounts and display them on the page
async function fetchDiscounts() {
    try {
        const discounts = await apiRequest('/api/discounts');
        const rewardsContainer = document.getElementById('rewardsContainer');
        rewardsContainer.innerHTML = ''; // Clear previous discounts
        if (discounts.length === 0) {
            rewardsContainer.innerHTML = '<p class="text-xl font-bold text-white text-center">No discounts available at the moment.</p>';
            return; // Exit if no discounts to show
        }
        // Show each discount using our styled element
        discounts.forEach(discount => rewardsContainer.appendChild(createDiscountElement(discount)));
    } catch (error) {
        console.error("Oh no! Error fetching discounts:", error);
    }
}

// Function to create a new discount with user input
async function createDiscount() {
    const companyName = document.getElementById("company").value;
    const reqLevel = document.getElementById("levelRequirement").value;
    const discountCode = document.getElementById("discountCode").value;
    const description = document.getElementById("description").value;
    const errorTag = document.getElementById("errorTag");
    errorTag.textContent = "";
    
    // Check if all fields are filled out
    if (!companyName || !reqLevel || !discountCode || !description) {
        errorTag.classList = "text-red-400 text-center font-bold";
        errorTag.textContent = "Please make sure all fields are filled out.";
        return;
    }
    
    // Get the next available DiscountID
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
        errorTag.textContent = "Success! Discount created!";
        fetchDiscounts(); // Refresh the discount list to show the new one
    } catch (error) {
        console.error("Yikes! Error creating discount:", error);
        errorTag.classList = "text-red-400 text-center font-bold";
        errorTag.textContent = "Something went wrong while creating the discount.";
    }
}

// Function to delete a discount by its ID
async function deleteDiscount(discountID) {
    try {
        await apiRequest(`/api/discounts/${discountID}`, 'DELETE');
        fetchDiscounts(); // Refresh the discount list after deleting
    } catch (error) {
        console.error("Uh-oh! Error deleting discount:", error);
    }
}

// Fetch discounts automatically when the page loads
window.onload = fetchDiscounts;

// Add event listener to the button for creating a new discount
document.getElementById('createDiscountButton').addEventListener('click', createDiscount);
