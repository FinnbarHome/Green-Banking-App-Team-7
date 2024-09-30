let ws;

// Initialize WebSocket connection
function initializeWebSocket(accountNumber) {
    ws = new WebSocket(`ws://${window.location.host}`); // Adjust this based on your WebSocket server URL

    ws.onopen = () => {
        console.log("WebSocket connection opened");

        // Register the account number with the WebSocket connection
        ws.send(JSON.stringify({ type: 'register', accountNumber }));
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);

        // Handle transaction updates
        if (message.type === 'transactionUpdate') {
            console.log("Received transaction update:", message.data);
            fetchAccountData(); // Refresh account data
        }
    };

    ws.onclose = () => {
        console.log("WebSocket connection closed");
    };

    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
    };
}


// Fetch account data and initialize WebSocket connection
async function fetchAccountData() {
    try {
        const accountNumber = localStorage.getItem('accountNumber');
        if (!accountNumber) throw new Error("No account number found in localStorage.");

        const companyData = await fetchData(`/api/companies/${accountNumber}`, "company data");
        if (!companyData) return;

        updateDOM({
            Username: `Username: ${companyData['Company Name']}`,
            Balance: `Balance: £${companyData['Balance'].toFixed(2)}`,
            Level: `XP: ${companyData['XP']}`
        });

        await fetchTransactionHistory(accountNumber);

        // Initialize WebSocket connection
        initializeWebSocket(accountNumber);

    } catch (error) {
        console.error('Error fetching account data:', error);
    }
}

async function fetchTransactionHistory(accountNumber) {
    try {
        const transactions = await fetchData(`/api/transactions/${accountNumber}`, "transactions");
        if (!transactions) return;
        clearAndInsertHTML('pastPayments', transactionHeaderHTML());
        const companyCache = {};
        for (const transaction of transactions) {
            const { isOutgoing, amount, transactionDate, companyName, bgColor } = await prepareTransactionData(transaction, accountNumber, companyCache);
            insertTransactionElement(isOutgoing, amount, transactionDate, companyName, bgColor);
        }
    } catch (error) {
        console.error('Error fetching transaction history:', error);
    }
}

// General function to fetch data and handle errors
async function fetchData(url, dataType) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            const { error } = await response.json();
            throw new Error(`Error fetching ${dataType}: ${error}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

// Update multiple DOM elements at once
function updateDOM(updates) {
    Object.entries(updates).forEach(([id, text]) => {
        document.getElementById(id).textContent = text;
    });
}

// Clear content and insert new HTML in one go
function clearAndInsertHTML(elementId, html) {
    document.getElementById(elementId).innerHTML = html;
}

// Helper to generate transaction header HTML
const transactionHeaderHTML = () => `
    <div class="grid grid-cols-3 gap-4 mb-2 font-bold text-lg bg-gray-800 text-white px-5 py-2 rounded-lg">
        <h2 class="text-center">Company</h2>
        <h2 class="text-right">Amount</h2>
        <h2 class="text-right">Date</h2>
    </div>`;

// Insert transaction element into the DOM
function insertTransactionElement(isOutgoing, amount, transactionDate, companyName, bgColor) {
    const transactionHTML = `
        <div class="grid grid-cols-3 gap-4 mb-4 p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
            <h2 class="col-span-1 ${bgColor} text-xl font-bold text-center text-white rounded-lg py-2">${companyName}</h2>
            <h2 class="col-span-1 text-xl text-right ${isOutgoing ? 'text-red-400' : 'text-green-400'}">
                ${isOutgoing ? '-' : '+'} £${Math.abs(amount).toFixed(2)}
            </h2>
            <h2 class="col-span-1 text-sm text-gray-400 text-right">${transactionDate}</h2>
        </div>`;
    document.getElementById('pastPayments').insertAdjacentHTML('beforeend', transactionHTML);
}

async function prepareTransactionData(transaction, accountNumber, companyCache) {
    const isOutgoing = transaction.Sender === parseInt(accountNumber);
    const amount = isOutgoing ? -transaction.Amount : transaction.Amount;
    const transactionDate = new Date(transaction.date).toLocaleDateString();
    const transactedWithCompanyId = isOutgoing ? transaction.Recipient : transaction.Sender;

    if (!companyCache[transactedWithCompanyId]) {
        companyCache[transactedWithCompanyId] = await fetchData(`/api/companies/${transactedWithCompanyId}`, "company data");
    }
    const transactedWithCompany = companyCache[transactedWithCompanyId] || {};
    const companyName = transactedWithCompany['Company Name'] || transactedWithCompanyId;
    const bgColor = getBgColor(transactedWithCompany);

    return { isOutgoing, amount, transactionDate, companyName, bgColor };
}

function getBgColor(companyData) {
    const combinedScore = (companyData['Carbon Emissions'] || 0) +
        (companyData['Waste Management'] || 0) +
        (companyData['Sustainability Practices'] || 0);

    return combinedScore < 9 ? 'bg-red-900' :
           combinedScore <= 21 ? 'bg-orange-900' : 'bg-green-900';
}

window.onload = fetchAccountData;
