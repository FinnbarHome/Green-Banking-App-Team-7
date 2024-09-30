// Function to dynamically create a discount element with consistent styling and a delete button
function createDiscountElement(discount) {
    const discountElement = document.createElement('div');
    discountElement.classList.add('flex', 'justify-between', 'items-center', 'bg-green-900', 'mb-4', 'rounded-lg', 'py-4', 'px-5');

    const companyElement = document.createElement('h2');
    companyElement.classList.add('text-xl', 'font-bold', 'text-white');
    companyElement.textContent = discount.Company;

    const descriptionElement = document.createElement('h2');
    descriptionElement.classList.add('text-xl', 'text-white', 'text-right', 'text-red-400');
    descriptionElement.textContent = discount.Description;

    const deleteButton = document.createElement('button');
    deleteButton.classList.add('ml-4', 'bg-red-500', 'hover:bg-red-700', 'text-white', 'font-bold', 'py-2', 'px-4', 'rounded');
    deleteButton.textContent = 'Delete';
    deleteButton.addEventListener('click', () => deleteDiscount(discount.DiscountID));

    // Append company name, description, and delete button to the discount element
    discountElement.appendChild(companyElement);
    discountElement.appendChild(descriptionElement);
    discountElement.appendChild(deleteButton);

    return discountElement;
}

// Fetch all discounts and display them on the page with consistent styling
async function fetchDiscounts() {
    try {
        const response = await fetch('/api/discounts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const discounts = await response.json();

        const rewardsContainer = document.getElementById('rewardsContainer');
        rewardsContainer.innerHTML = ''; // Clear the previous list

        if (discounts.length === 0) {
            rewardsContainer.innerHTML = '<p class="text-xl font-bold text-white text-center">No discounts available at the moment.</p>';
            return;
        }

        // Display each discount in a consistent flexbox style with a delete button
        discounts.forEach(discount => {
            const discountElement = createDiscountElement(discount);
            rewardsContainer.appendChild(discountElement);
        });
    } catch (error) {
        console.error("Error fetching discounts:", error);
    }
}

// Function to create a new discount
async function createDiscount() {
    const companyName = document.getElementById("company").value;
    const discountID = document.getElementById("discountID").value;
    const reqLevel = document.getElementById("levelRequirement").value;
    const discountCode = document.getElementById("discountCode").value;
    const description = document.getElementById("description").value;

    const errorTag = document.getElementById("errorTag");
    errorTag.textContent = "";

    // Validate all input fields
    if (companyName === "" || discountID === "" || reqLevel === "" || discountCode === "" || description === "") {
        errorTag.classList = "text-red-400 text-center font-bold";
        errorTag.textContent = "You must fill out all the fields.";
        return;
    }

    try {
        const response = await fetch('/api/discounts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                DiscountID: parseInt(discountID),
                Company: companyName,
                LevelReq: parseInt(reqLevel),
                DiscountCode: discountCode,
                Description: description
            })
        });

        const result = await response.json();
        if (response.ok) {
            errorTag.classList = "text-green-200 text-center font-bold";
            errorTag.textContent = "Discount created!";
            // Refresh the discount list
            fetchDiscounts();
        } else {
            errorTag.classList = "text-red-400 text-center font-bold";
            errorTag.textContent = result.error || "An error occurred when creating the discount.";
        }
    } catch (error) {
        console.error("Error creating discount:", error);
        errorTag.classList = "text-red-400 text-center font-bold";
        errorTag.textContent = "An error occurred when creating the discount.";
    }
}

// Function to delete a discount by DiscountID
async function deleteDiscount(discountID) {
    try {
        const response = await fetch(`/api/discounts/${discountID}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            // Discount deleted successfully, refresh the discount list
            fetchDiscounts();
        } else {
            console.error("Error deleting discount");
        }
    } catch (error) {
        console.error("Error deleting discount:", error);
    }
}

// Automatically fetch discounts when the page loads
window.onload = fetchDiscounts;

// Add event listener for the create discount button
document.getElementById('createDiscountButton').addEventListener('click', createDiscount);
