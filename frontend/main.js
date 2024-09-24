if(window.location.pathname == "/home.html")
{
    loadAccountDetails();
}

function attemptSignup()
{
    const username = document.getElementById("username").value;
    const balance = document.getElementById("balance").value;
    if(username == "" || balance <= 0)
    {
        document.getElementById("errorTag").innerHTML = "Please enter a valid username and balance.";
    }
    else
    {
        // Need to query the API to see if the company name already exists
        // Need to query to then create the account.
        window.location.href="home.html";
    }
}


function makePayment()
{
    const paymentAmount = document.getElementById("payment-amount").value;
    const paymentRef = document.getElementById("payment-reference").value;
    if(paymentAmount <= 0 || paymentRef == "")
    {
        document.getElementById("errorTag").innerHTML = "Please enter a valid balance.";
    }
    else
    {

    }
}

function loadAccountDetails()
{
    var accountName = document.getElementById("username");
    var balance = document.getElementById("accountBalance");
    var greenLevel = document.getElementById("greenLevel");

    accountName.textContent = "{Username}";
    balance.textContent = "{Balance}";
    greenLevel.textContent = "{Level}";
}

function attemptLogin()
{
    const username = document.getElementById("username").value;
    if(username == "")
    {
        document.getElementById("errorTag").innerHTML = "Invalid username.";
    }
    else
    {
        // Need to query the API to see if the company name exists.
        window.location.href="home.html";
    }
}