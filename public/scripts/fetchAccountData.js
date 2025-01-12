let ws;

function initializeWebSocket(accountNumber) {
    ws = new WebSocket(`ws://${window.location.host}`);

    ws.onopen = () => {
        console.log("WebSocket connection opened");

        ws.send(JSON.stringify({ type: 'register', accountNumber }));
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);

        // Handle transaction updates
        if (message.type === 'transactionUpdate') {
            fetchAccountData();
        }
    };

    ws.onclose = () => {
        console.log("WebSocket connection closed");
    };

    ws.onerror = (error) => {
        console.error("WebSocket error:", error);
    };
}


// Fetch account data
async function fetchAccountData() {
    try {

        // Fetch account number
        const accountNumber = localStorage.getItem('accountNumber');
        if (!accountNumber) throw new Error("No account number found");

        // Fetch data via account number
        const companyData = await fetchData(`/api/companies/${accountNumber}`, "company data");
        if (!companyData) return;
        const XP = companyData['XP'];
        const levelInfo = calculateUserLevel(XP);

        // update html with data
        updateDOM({
            Username: `Username: ${companyData['Company Name']}`,
            AccountNumber: `Account Number: ${companyData['Account Number']}`,
            Balance: `Balance: £${companyData['Balance'].toFixed(2)}`,
            Level: `Level: ${levelInfo.level}`,
            XP: `XP: ${XP}`
        });

        // call the transaction history function
        await fetchTransactionHistory(accountNumber);
        initializeWebSocket(accountNumber);

    } catch (error) {
        console.error('Error fetching account data:', error);
    }
}

// Fetches the user's transaction history
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

// Fetch data and handle errors
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

// Update html elements
function updateDOM(updates) {
    Object.entries(updates).forEach(([id, text]) => {
        document.getElementById(id).textContent = text;
    });
}

// Clear and update html
function clearAndInsertHTML(elementId, html) {
    document.getElementById(elementId).innerHTML = html;
}

const transactionHeaderHTML = () => `
    <div class="grid grid-cols-3 gap-4 mb-2 font-bold text-lg bg-gray-800 text-white px-5 py-2 rounded-lg">
        <h2 class="text-center">Company</h2>
        <h2 class="text-right">Amount</h2>
        <h2 class="text-right">Date</h2>
    </div>`;

// Update html with transactions
function insertTransactionElement(isOutgoing, amount, transactionDate, companyName, bgColor) {
    const transactionHTML = `
        <a href="analysis.html?companyName=${encodeURIComponent(companyName)}">
            <div class="grid grid-cols-3 gap-4 mb-4 p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <h2 class="col-span-1 ${bgColor} text-xl font-bold text-center text-white rounded-lg py-2">${companyName}</h2>
                <h2 class="col-span-1 text-xl text-right ${isOutgoing ? 'text-red-400' : 'text-green-400'}">
                    ${isOutgoing ? '-' : '+'} £${Math.abs(amount).toFixed(2)}
                </h2>
                <h2 class="col-span-1 text-sm text-gray-400 text-right">${transactionDate}</h2>
            </div>
        </a>`;
    document.getElementById('pastPayments').insertAdjacentHTML('beforeend', transactionHTML);
}

// Prepares the transaction data
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

// Calculates the background color of each transacion
function getBgColor(companyData) {
    const combinedScore = (companyData['Carbon Emissions'] || 0) + (companyData['Waste Management'] || 0) + (companyData['Sustainability Practices'] || 0);

    // Sets blue background for user-to-user transactions
    if (combinedScore === 0) {
        return 'bg-blue-700';
    } else {

    return combinedScore <= 9 ? 'bg-red-900' :
           combinedScore <= 21 ? 'bg-orange-700' : 'bg-green-900'; 
    };
} 

// Calculates the level boundaries
function Levels() {
    const power = 2.5;
    const denominator = 0.3;
    const levelBounds = [];
  
    for (let i = 0; i < 11; i++) {
      let bounds = i / denominator;
      bounds = Math.pow(bounds, power);
      levelBounds[i] = Math.round(bounds);
    }
    return levelBounds;
  }

  // Calculates the user's current level via XP
  function calculateUserLevel(userXP) {
    const levelBounds = Levels();
    let level = 0;
    let NextLevel = 0;
    let PreviousLevel = 0;
    let progressPercentage = 0;
  
    for (let i = 0; i < levelBounds.length; i++) {
      if (userXP >= levelBounds[i]) {
        level = i + 1;
        PreviousLevel = levelBounds[i];
        if (i + 1 < levelBounds.length) {
          NextLevel = levelBounds[i + 1];
        } else {
          NextLevel = levelBounds[i];
        }
      } else {
        NextLevel = levelBounds[i];
        break;
      }
    }
  
    // Calculate the progress percentage
    if (level < levelBounds.length) {
      let xpForNextLevel = NextLevel - PreviousLevel;
      let currentLevelProgress = userXP - PreviousLevel;
      progressPercentage = (currentLevelProgress / xpForNextLevel) * 100;
    } else {
      progressPercentage = 100;
    }
  
    // Return the level and XP data
    return {
      level: level,
      progressPercentage: Math.round(progressPercentage * 100) / 100,
      currentXP: userXP,
      nextLevelXP: NextLevel
    };
  }

window.onload = fetchAccountData;
