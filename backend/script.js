// Update XP functionality
document.getElementById('updateXPButton').addEventListener('click', function() {
  const accountNumber = document.getElementById('xpAccountNumber').value;
  const xpAmount = document.getElementById('xpAmount').value;

  // Validate the input
  if (!accountNumber || !xpAmount) {
    document.getElementById('xpResult').innerText = 'Please enter both Account Number and XP Amount';
    return;
  }

  // Make the PUT request to the backend to update XP
  fetch(`http://localhost:3000/api/companies/update-xp/${accountNumber}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ xpAmount: parseInt(xpAmount) })
  })
  .then(response => {
    if (!response.ok) {
      // Handle non-OK responses (e.g., 404, 500 errors)
      return response.json().then(err => { throw new Error(err.error); });
    }
    return response.json(); // Parse the valid JSON response
  })
  .then(data => {
    document.getElementById('xpResult').innerText = `Updated XP: ${data.XP}`;
  })
  .catch(error => {
    document.getElementById('xpResult').innerText = `Error: ${error.message}`;
  });
});

// Update Balance functionality
document.getElementById('updateBalanceButton').addEventListener('click', function() {
  const accountNumber = document.getElementById('balanceAccountNumber').value;
  const balanceAmount = document.getElementById('balanceAmount').value;

  // Validate the input
  if (!accountNumber || !balanceAmount) {
    document.getElementById('balanceResult').innerText = 'Please enter both Account Number and Balance Amount';
    return;
  }

  // Make the PUT request to the backend to update balance
  fetch(`http://localhost:3000/api/companies/update-balance/${accountNumber}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ amount: parseInt(balanceAmount) })
  })
  .then(response => {
    if (!response.ok) {
      // Handle non-OK responses (e.g., 404, 500 errors)
      return response.json().then(err => { throw new Error(err.error); });
    }
    return response.json(); // Parse the valid JSON response
  })
  .then(data => {
    document.getElementById('balanceResult').innerText = `Updated Balance: ${data.Balance}`;
  })
  .catch(error => {
    document.getElementById('balanceResult').innerText = `Error: ${error.message}`;
  });
});
