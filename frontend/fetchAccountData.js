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
  
        transactions.forEach(transaction => {
            const isOutgoing = transaction.Sender === parseInt(accountNumber);
            const amount = isOutgoing ? -transaction.Amount : transaction.Amount;
            const transactionDate = new Date(transaction.date).toLocaleDateString(); // Format date
  
            // Randomly assign colors based on environmental score
            const colors = ['bg-red-900', 'bg-orange-900', 'bg-green-900'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
  
            const transactionElement = `
                <a href="analysis.html#">
                    <div class="grid grid-flow-col gap-1 mb-4">
                        <h2 class="${randomColor} text-xl font-bold text-white px-5 rounded-l-lg py-4">
                            ${transaction.Recipient === parseInt(accountNumber) ? transaction.Sender : transaction.Recipient}
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
        });
    } catch (error) {
        console.error('Error fetching transaction history:', error);
    }
}
  
  
  
  
  
window.onload = fetchAccountData;
  