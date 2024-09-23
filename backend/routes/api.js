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


// POST a new company
router.post("/companies", async (req, res) => {
  try {
    const { "Account Number": accountNumber, "Company Name": companyName } = req.body;
    // Check if the account number already exists
    const existingAccount = await db.collection("Companies").findOne({ "Account Number": accountNumber });
    if (existingAccount) {
      return res.status(400).json({ error: "A company with the same Account Number already exists" });
    }
    // Check if the company name already exists
    const existingCompany = await db.collection("Companies").findOne({ "Company Name": companyName });
    if (existingCompany) {
      return res.status(400).json({ warning: "A company with the same name already exists" });
    }
    // Insert the new company if validations pass
    const newCompany = await db.collection("Companies").insertOne(req.body);
    console.log(newCompany);
    res.status(201).json(newCompany);
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
    // Find the company by Account Number
    const company = await db.collection("Companies").findOne({ "Account Number": accountNumber });
    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }
    // Update the Balance by incrementing/decrementing it
    const updatedCompany = await db.collection("Companies").findOneAndUpdate(
      { "Account Number": accountNumber }, // Find the company by Account Number
      { $inc: { Balance: amount } }, // Increment/decrement the Balance field
      { returnOriginal: false } // Return the updated document
    );
    // Return the updated company with the new Balance
    res.json(updatedCompany.value); // Send the updated document in the response
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;