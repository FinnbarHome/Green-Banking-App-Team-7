async function fetchDiscounts()
{

}

async function createDiscount()
{
    const companyName = document.getElementById("company").value;
    const discountID = document.getElementById("discountID").value;
    const reqLevel = document.getElementById("levelRequirement").value;
    const discountCode = document.getElementById("discountCode").value;
    const description = document.getElementById("description").value;

    errorTag = document.getElementById("errorTag");
    errorTag.textContent = "";

    if(companyName == "" || discountID == "" || reqLevel == "" || discountCode == "" || description == "")
    {
        errorTag.classList = "text-red-400 text-center font-bold";
        errorTag.textContent = "You must fill out all the fields.";
        return;
    }
    try {
        const response = await fetch('/api/discounts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            DiscountID: discountID,
            Company: companyName,
            LevelReq: reqLevel,
            DiscountCode: discountCode,
            Description: description
          })
        });
  
        const result = await response.json();
        if (result.ok) {
          errorTag.classList = "text-green-200 text-center font-bold";
          errorTag.textContent = "Discount created!";
        } else {
        }
      } catch (error) {
            console.error("Error creating discount:", error);
            errorTag.classList = "text-red-400 text-center font-bold";
            errorTag.textContent = "An error occurred when creating discount.";
      }

}

