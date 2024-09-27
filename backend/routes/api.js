const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const db = mongoose.connection;

// Error handling function
function handleError(res, error) {
  console.error(error);
  res.status(500).json({ error: error.message });
}

// GET all Companies
router.get("/companies", async (req, res) => {
  try {
    const companies = await db.collection("Companies").find({}).toArray();
    console.log(companies);
    res.json(companies);
  } catch (error) {
    handleError(res, error);
  }
});

// GET a specific company by Account Number
router.get("/companies/:accountNumber", async (req, res) => {
  try {
    const company = await db
      .collection("Companies")
      .findOne({ "Account Number": parseInt(req.params.accountNumber) });
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.json(company);
  } catch (error) {
    handleError(res, error);
  }
});

// GET a specific company by Account Name
router.get("/companies/name/:companyName", async (req, res) => {
  try {
    const company = await db
      .collection("Companies")
      .findOne({ "Company Name": req.params.companyName });
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    res.json(company);
  } catch (error) {
    handleError(res, error);
  }
});

// PUT update the Streak
router.put("/companies/update-streak/:accountNumber", async (req, res) => {
  const { streakChange } = req.body;
  if (streakChange === undefined || isNaN(streakChange)) {
    return res.status(400).json({ error: "A valid streakChange value is required" });
  }
  await updateField(req.params.accountNumber, "Streak", streakChange, res);
});

// POST login route
router.post("/login", async (req, res) => {
  try {
    const { username, accountNumber } = req.body;

    // Find a company by username and account number
    const company = await db.collection("Companies").findOne({
      "Company Name": username,
      "Account Number": parseInt(accountNumber)
    });

    if (!company) {
      return res.status(404).json({ error: "Company not found or account number does not match" });
    }

    // Return the account number of the company as part of the login process
    res.json({ accountNumber: company["Account Number"] });
  } catch (error) {
    handleError(res, error);
  }
});

// POST a new company
router.post("/companies", async (req, res) => {
  try {
    const { "Company Name": companyName, Balance } = req.body;

    if (!companyName || typeof Balance !== 'number') {
      return res.status(400).json({ error: "Company Name and Balance are required." });
    }

    const existingCompany = await db.collection("Companies").find().sort({ "Account Number": -1 }).limit(1).toArray();
    const accountNumber = existingCompany.length > 0 ? existingCompany[0]["Account Number"] + 1 : 1;

    const newCompany = {
      "Company Name": companyName,
      "Spending Category": "User",
      "Carbon Emissions": 0,
      "Waste Management": 0,
      "Sustainability Practises": 0,
      "Account Number": accountNumber,
      "Balance": Balance,
      "XP": 0,
      "Summary": "",
    };

    // Insert the new company if validations pass
    const result = await db.collection("Companies").insertOne(newCompany);
    console.log(result);
    res.status(201).json(result.ops[0]);
  } catch (error) {
    handleError(res, error);
  }
});

// PUT Add Balance field to all existing companies
router.put("/companies/add-balance", async (req, res) => {
  try {
    const { Balance } = req.body;
    // Check if the Balance field is provided
    if (Balance === undefined) {
      return res.status(400).json({ error: "Balance field is required" });
    }
    // Update all companies and add the 'Balance' field with the provided value
    const result = await db.collection("Companies").updateMany({}, { $set: { Balance: Balance } });
    console.log(result);
    res.json({ msg: `Balance field added to ${result.matchedCount} companies` });
  } catch (error) {
    handleError(res, error);
  }
});

// PUT Add XP field to all existing companies
router.put("/companies/add-xp", async (req, res) => {
  try {
    const { XP } = req.body;
    // Check if the XP field is provided and is a valid number
    if (XP === undefined || isNaN(XP)) {
      return res.status(400).json({ error: "A valid XP field is required" });
    }
    // Update all companies and add the 'XP' field with the provided value
    const result = await db.collection("Companies").updateMany({}, { $set: { XP: parseInt(XP) } });
    console.log(result);
    res.json({ msg: `XP field added to ${result.matchedCount} companies` });
  } catch (error) {
    handleError(res, error);
  }
});


// PUT Update the Balance for a specific company by Account Number (add/remove funds)
router.put("/companies/update-balance/:accountNumber", async (req, res) => {
  try {
    const accountNumber = parseInt(req.params.accountNumber);
    const { amount } = req.body;
    // Validate the amount
    if (amount === undefined || isNaN(amount)) {
      return res.status(400).json({ error: "A valid amount is required to update the balance" });
    }
    // Update the Balance by incrementing/decrementing it
    const updateResult = await db.collection("Companies").updateOne(
      { "Account Number": accountNumber }, // Find the company by Account Number
      { $inc: { Balance: amount } } // Increment/decrement the Balance field
    );
    // If no company was found and updated, return a 404 error
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: "Company not found" });
    }
    // Retrieve the updated document to send back as a response
    const updatedCompany = await db.collection("Companies").findOne({ "Account Number": accountNumber });
    // Return the updated company with the new Balance
    res.json(updatedCompany); // Send the updated document in the response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating the balance" });
  }
});


// PUT Update the XP for a specific company by Account Number (add/remove XP)
router.put("/companies/update-xp/:accountNumber", async (req, res) => {
  try {
    const accountNumber = parseInt(req.params.accountNumber);
    const { xpAmount } = req.body;
    // Validate the xpAmount
    if (xpAmount === undefined || isNaN(xpAmount)) {
      return res.status(400).json({ error: "A valid xpAmount is required to update the XP" });
    }
    // Update the XP for the company by Account Number
    const updateResult = await db.collection("Companies").updateOne(
      { "Account Number": accountNumber }, // Find the company by Account Number
      { $inc: { XP: xpAmount } } // Increment/decrement the XP field
    );
    // If no company was found and updated, return a 404 error
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: "Company not found" });
    }
    // Retrieve the updated document to send back as a response
    const updatedCompany = await db.collection("Companies").findOne({ "Account Number": accountNumber });
    // Return the updated company with the new XP
    res.json(updatedCompany); // Send the updated document in the response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating XP" });
  }
});


module.exports = router;