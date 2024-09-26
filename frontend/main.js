console.log(window.location.pathname);
if(window.location.pathname.includes("home.html"))
{
    loadAccountDetails();
}

if(window.location.pathname.includes("analysis.html"))
{
    loadAnalysisPage();
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
        window.location.href="home.html#accNumber";
    }
}


function makePayment()
{
    const paymentAmount = document.getElementById("payment-amount").value;
    const paymentRef = document.getElementById("payment-reference").value;
    if(paymentAmount <= 0 || paymentRef == "")
    {
        document.getElementById("errorTag").innerHTML = "Please enter a valid balance and reference.";
    }
    else
    {

    }
}


function loadAnalysisPage()
{
    var type = document.getElementById("transactionType");
    var emissions = document.getElementById("carbEmissions");
    var wasteManagement = document.getElementById("wasteManagement");
    var sustPractices = document.getElementById("sustainPractices");
    var eis = document.getElementById("eiScore");
    var finalRAG = document.getElementById("rag");


    type.textContent = "Fuel";
    emissions.textContent = "0.1";
    wasteManagement.textContent = "0.2";
    sustPractices.textContent = "0.3";
    eis.textContent = "0.4";
}

function loadAccountDetails()
{
    var accountName = document.getElementById("username");
    var balance = document.getElementById("accountBalance");
    var greenLevel = document.getElementById("greenLevel");

    accountName.textContent = "{Username}";
    balance.textContent = "{Balance}";
    greenLevel.textContent = "{Level}";

    // this will append the list for each payment made.
    document.getElementById("pastPayments").innerHTML = "";
    document.getElementById("pastPayments").innerHTML += `
    <a href="analysis.html#">
        <div class="grid grid-flow-col gap-1 mb-4">
            <h2 class="bg-red-900 text-xl font-bold text-white px-5 rounded-l-lg py-4">Company Name Here</h2>
            <h2 class="row-start-1 text-xl text-white text-right px-5 py-4 rounded-r-lg bg-gray-600 text-red-400">-£100.00</h2>
        </div>
    </a>
    <a href="analysis.html#">
        <div class="grid grid-flow-col gap-1 mb-4">
            <h2 class="bg-orange-900 text-xl font-bold text-white px-5 rounded-l-lg py-4">Company Name Here</h2>
            <h2 class="row-start-1 text-xl text-white text-right px-5 py-4 rounded-r-lg bg-gray-600 text-red-400">-£100.00</h2>
        </div>
    </a>
    <a href="analysis.html#">
        <div class="grid grid-flow-col gap-1 mb-4">
            <h2 class="bg-green-900 text-xl font-bold text-white px-5 rounded-l-lg py-4">Company Name Here</h2>
            <h2 class="row-start-1 text-xl text-white text-right px-5 py-4 rounded-r-lg bg-gray-600 text-red-400">-£100.00</h2>
        </div>
    </a> `;
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
        window.location.href="home.html#accNumber";
    }
}