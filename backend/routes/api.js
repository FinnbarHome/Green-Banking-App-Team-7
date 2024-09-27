const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const db = mongoose.connection;

// Utility function to handle errors
const handleError = (res, error, status = 500, message = "An error occurred") => {
  console.error(error);
  res.status(status).json({ error: message });
};

// Utility function to find a company by account number
const findCompany = async (accountNumber, res) => {
  try {
    const company = await db.collection("Companies").findOne({ "Account Number": parseInt(accountNumber) });
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    return company;
  } catch (error) {
    handleError(res, error);
  }
};

// GET all Companies
router.get("/companies", async (req, res) => {
  try {
    const companies = await db.collection("Companies").find({}).toArray();
    res.json(companies);
  } catch (error) {
    handleError(res, error);
  }
});

// GET a company by Account Number
router.get("/companies/:accountNumber", async (req, res) => {
  const company = await findCompany(req.params.accountNumber, res);
  if (company) res.json(company);
});

// GET a company by Account Name
router.get("/companies/name/:companyName", async (req, res) => {
  try {
    const company = await db.collection("Companies").findOne({ "Company Name": req.params.companyName });
    if (!company) return res.status(404).json({ error: "Company not found" });
    res.json(company);
  } catch (error) {
    handleError(res, error);
  }
});

// POST login route
router.post("/login", async (req, res) => {
  try {
    const { username, accountNumber } = req.body;
    const company = await db.collection("Companies").findOne({
      "Company Name": username,
      "Account Number": parseInt(accountNumber),
    });
    if (!company) return res.status(404).json({ error: "Company not found or account number does not match" });
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
    // Find the last company to assign the next account number
    const existingCompany = await db.collection("Companies").find().sort({ "Account Number": -1 }).limit(1).toArray();
    const accountNumber = existingCompany.length > 0 ? existingCompany[0]["Account Number"] + 1 : 1;
    // Prepare the new company document
    const newCompany = {
      "Company Name": companyName,
      "Spending Category": "User",
      "Carbon Emissions": 0,
      "Waste Management": 0,
      "Sustainability Practises": 0,
      "Account Number": accountNumber,
      "Summary": "",
      "Balance": Balance,
      "XP": 0,
      "Streak": 0,
    };
    // Insert the new company
    const result = await db.collection("Companies").insertOne(newCompany);
    // Respond with the inserted document's details
    res.status(201).json({ _id: result.insertedId, ...newCompany });
  } catch (error) {
    handleError(res, error);
  }
});

// PUT utility function for updating fields
const updateField = async (accountNumber, field, value, res) => {
  try {
    const updateResult = await db.collection("Companies").updateOne(
      { "Account Number": parseInt(accountNumber) }, // Ensure account number is parsed
      { $inc: { [field]: value } }
    );
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: "Company not found" });
    }
    // Fetch the updated company after updating
    const updatedCompany = await db.collection("Companies").findOne({ "Account Number": parseInt(accountNumber) });
    if (!updatedCompany) {
      return res.status(404).json({ error: "Unable to retrieve updated company data" });
    }
    // Return the updated company object
    return res.json(updatedCompany);
  } catch (error) {
    handleError(res, error);
  }
};


// PUT update the Balance
router.put("/companies/update-balance/:accountNumber", async (req, res) => {
  const { amount } = req.body;
  if (amount === undefined || isNaN(amount)) {
    return res.status(400).json({ error: "A valid amount is required to update the balance" });
  }
  await updateField(req.params.accountNumber, "Balance", amount, res);
});

// PUT update the XP
router.put("/companies/update-xp/:accountNumber", async (req, res) => {
  const { xpAmount } = req.body;
  if (xpAmount === undefined || isNaN(xpAmount)) {
    return res.status(400).json({ error: "A valid xpAmount is required to update the XP" });
  }
  await updateField(req.params.accountNumber, "XP", xpAmount, res);
});

// GET Streak for a specific company
router.get("/companies/:accountNumber/streak", async (req, res) => {
  const company = await findCompany(req.params.accountNumber, res);
  if (company && company.Streak !== undefined) res.json({ Streak: company.Streak });
  else res.status(404).json({ error: "Streak not found for this company" });
});

// PUT update the Streak
router.put("/companies/update-streak/:accountNumber", async (req, res) => {
  const { streakChange } = req.body;
  if (streakChange === undefined || isNaN(streakChange)) {
    return res.status(400).json({ error: "A valid streakChange value is required" });
  }
  await updateField(req.params.accountNumber, "Streak", streakChange, res);
});

module.exports = router;
