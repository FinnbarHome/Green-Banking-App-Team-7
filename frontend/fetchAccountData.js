async function fetchAccountData() {
    try {
        const accountNumber = localStorage.getItem('accountNumber');
        if (!accountNumber) {
            console.error("No account number found in localStorage.");
            return;
        }

        // Fetch the company data using the account number
        const companyResponse = await fetch(`/api/companies/${accountNumber}`);
        if (!companyResponse.ok) {
            const errorData = await companyResponse.json();
            console.error("Error fetching company data:", errorData.error);
            return;
        }

        const companyData = await companyResponse.json();

        // Set the company data to the appropriate HTML elements
        document.getElementById('Username').textContent = "Username: " + companyData['Company Name'];
        document.getElementById('Balance').textContent = "Balance: £" + companyData['Balance'].toFixed(2);
        document.getElementById('Level').textContent = "XP: " + companyData['XP'];

        // Fetch the transaction history for the account number
        await fetchTransactionHistory(accountNumber);
    } catch (error) {
        console.error('Error fetching company data:', error);
    }
}

async function fetchTransactionHistory(accountNumber) {
    try {
        const response = await fetch(`/api/transactions/${accountNumber}`);
        if (!response.ok) {
            const errorData = await response.json();
            console.error("Error fetching transactions:", errorData.error);
            return;
        }

        const transactions = await response.json();
        const pastPaymentsElement = document.getElementById('pastPayments');
        pastPaymentsElement.innerHTML = ''; // Clear any existing content

        // Header Row
        const headingRow = `
            <div class="grid grid-cols-3 gap-4 mb-2 font-bold text-lg bg-gray-800 text-white px-5 py-2 rounded-lg">
                <h2 class="text-center">Company</h2>
                <h2 class="text-right">Amount</h2>
                <h2 class="text-right">Date</h2>
            </div>
        `;
        pastPaymentsElement.insertAdjacentHTML('beforeend', headingRow);

        for (const transaction of transactions) {
            const isOutgoing = transaction.Sender === parseInt(accountNumber);
            const amount = isOutgoing ? -transaction.Amount : transaction.Amount;
            const transactionDate = new Date(transaction.date).toLocaleDateString(); // Format date

            // Fetch company data for the company being transacted with
            const transactedWithCompanyId = isOutgoing ? transaction.Recipient : transaction.Sender;
            const transactedWithCompanyResponse = await fetch(`/api/companies/${transactedWithCompanyId}`);
            const transactedWithCompany = await transactedWithCompanyResponse.json();

            // Determine the company name
            const companyName = transactedWithCompany['Company Name'] || transactedWithCompanyId;

            // Determine the color based on the combined environmental score
            let bgColor;
            const combinedScore = (transactedWithCompany['Carbon Emissions'] || 0) + 
                                  (transactedWithCompany['Waste Management'] || 0) + 
                                  (transactedWithCompany['Sustainability Practices'] || 0);

            if (combinedScore < 9) {
                bgColor = 'bg-red-900'; // Red for score less than 9
            } else if (combinedScore <= 21) {
                bgColor = 'bg-orange-900'; // Amber for score between 9 and 21
            } else {
                bgColor = 'bg-green-900'; // Green for score between 22 and 30
            }

            // Transaction Element
            const transactionElement = `
                <div class="grid grid-cols-3 gap-4 mb-4 p-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                    <h2 class="col-span-1 ${bgColor} text-xl font-bold text-center text-white rounded-lg py-2">
                        ${companyName}
                    </h2>
                    <h2 class="col-span-1 text-xl text-white text-right ${isOutgoing ? 'text-red-400' : 'text-green-400'}">
                        ${isOutgoing ? '-' : '+'} £${Math.abs(amount).toFixed(2)}
                    </h2>
                    <h2 class="col-span-1 text-sm text-gray-400 text-right">
                        ${transactionDate}
                    </h2>
                </div>
            `;

            pastPaymentsElement.insertAdjacentHTML('beforeend', transactionElement);
        }
    } catch (error) {
        console.error('Error fetching transaction history:', error);
    }
}

window.onload = fetchAccountData;
