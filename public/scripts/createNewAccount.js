document.getElementById("signupButton").addEventListener("click", CreateNewAccount);

async function CreateNewAccount() {
    const companyName = document.getElementById("username").value;
    const balance = parseFloat(document.getElementById("balance").value);

    // Validate the account input
    if (!isValidInput(companyName, balance)) return;

    try {
        const response = await sendPostRequest('/api/companies', {
            "Company Name": companyName,
            Balance: balance
        });

        if (response.ok) {
            const accountNumber = response.data["Account Number"];
            alert(`Account created successfully! Your new account number is: ${accountNumber}`);
            window.location.href = 'login.html';
        } else {
            alert(response.data.error || response.data.warning);
        }
    } catch (error) {
        console.error("Error creating account:", error);
        alert("An error occurred while creating the account, please try again.");
    }
}

// Helper function to validate input
function isValidInput(companyName, balance) {
    if (!companyName || isNaN(balance) || balance < 0) {
        alert("Please enter a valid company name and a non-negative balance.");
        return false;
    }
    return true;
}

// Helper function to send POST requests
async function sendPostRequest(url, body) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        const data = await response.json();
        return { ok: response.ok, data };
    } catch (error) {
        console.error("Error in fetch request:", error);
        throw error;
    }
}
