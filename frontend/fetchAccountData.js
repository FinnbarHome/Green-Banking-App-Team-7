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

        for (const transaction of transactions) {
            const isOutgoing = transaction.Sender === parseInt(accountNumber);
            const amount = isOutgoing ? -transaction.Amount : transaction.Amount;
            const transactionDate = new Date(transaction.date).toLocaleDateString(); // Format date

            // Fetch company data for the company being transacted with
            const transactedWithCompanyId = isOutgoing ? transaction.Recipient : transaction.Sender;
            const transactedWithCompanyResponse = await fetch(`/api/companies/${transactedWithCompanyId}`);
            const transactedWithCompany = await transactedWithCompanyResponse.json();

            // Log the transacted company data to verify structure and scores
            console.log('Transacted Company Data:', transactedWithCompany);

            // Check if the environmental scores exist
            const carbonEmissions = transactedWithCompany['Carbon Emissions'] || 0;
            const wasteManagement = transactedWithCompany['Waste Management'] || 0;
            const sustainabilityManagement = transactedWithCompany['Sustainability Practices'] || 0;

            // Log the scores to see if they are being accessed correctly
            console.log(`Scores for ${transactedWithCompany['Company Name']}: Carbon Emissions: ${carbonEmissions}, Waste Management: ${wasteManagement}, Sustainability Management: ${sustainabilityManagement}`);

            // Calculate the combined score
            const combinedScore = carbonEmissions + wasteManagement + sustainabilityManagement;

            // Log the combined score
            console.log(`Combined Score for ${transactedWithCompany['Company Name']}: ${combinedScore}`);

            // Use the company names instead of account numbers
            const companyName = transactedWithCompany['Company Name'] || transactedWithCompanyId;

            // Determine the color based on the combined environmental score
            let bgColor;
            if (combinedScore < 9) {
                bgColor = 'bg-red-900'; // Red for score less than 9
            } else if (combinedScore <= 21) {
                bgColor = 'bg-orange-900'; // Amber for score between 9 and 21
            } else {
                bgColor = 'bg-green-900'; // Green for score between 22 and 30
            }

            const transactionElement = `
                <a href="analysis.html#">
                    <div class="grid grid-flow-col gap-1 mb-4">
                        <h2 class="${bgColor} text-xl font-bold text-center text-white px-5 rounded-l-lg py-4">
                            ${companyName}
                        </h2>
                        <h2 class="row-start-1 text-xl text-white text-right px-5 py-4 rounded-r-lg bg-gray-600 ${isOutgoing ? 'text-red-400' : 'text-green-400'}">
                            ${isOutgoing ? '-' : '+'}£${Math.abs(amount).toFixed(2)}
                        </h2>
                        <h2 class="text-sm text-gray-400 px-5 py-2 text-right">
                            ${transactionDate}
                        </h2>
                    </div>
                </a>
            `;

            pastPaymentsElement.insertAdjacentHTML('beforeend', transactionElement);
        }
    } catch (error) {
        console.error('Error fetching transaction history:', error);
    }
}


window.onload = fetchAccountData;
