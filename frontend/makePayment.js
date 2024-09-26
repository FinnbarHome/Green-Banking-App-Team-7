async function makePayment()
{
    var paymentAmount = document.getElementById("payment-amount").value;
    var payeeName = document.getElementById("payee-name").value;
    const response = await fetch(`/api/companies/name/` + payeeName);

    // Check if the response is ok
    if (!response.ok) {
        const errorData = await response.json();
        console.error("Error fetching data:", errorData.error);
        return; // Exit if response is not ok
    }
    else
    {
        console.log(response["Account Number"]);
        return;
    }


    /*
    try 
    {
        const accountNumber = localStorage.getItem('accountNumber');
        const response = await fetch("/companies/update-balance/${accountNumber}", { 
            method: 'PUT', 
            headers: { 
              'Content-type': 'application/json'
            }, 
            body: JSON.stringify({amount: -paymentAmount}) 
          }); 

        // If payment could be made.
        if (response.ok) 
        {
            try 
            {
                // const payeeAccNumber = ;
                const response = await fetch("/companies/update-balance/:", { 
                    method: 'PUT', 
                    headers: { 
                      'Content-type': 'application/json'
                    }, 
                    body: JSON.stringify({amount: paymentAmount}) 
                  }); 
        
                // If payment could be made.
                if (response.ok) 
                {
                    
                }
            }
            catch(error)
            {

            }
        }
    }
    catch(error)
    {

    }*/
}