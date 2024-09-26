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

// GET a specific company by account name
router.get("/companies/:companyName", async (req, res) => {
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

// GET Streak value for a specific company by Account Number
router.get("/companies/:accountNumber/streak", async (req, res) => {
  try {
    const accountNumber = parseInt(req.params.accountNumber);
    const company = await db.collection("Companies").findOne({ "Account Number": accountNumber });
    if (!company || company.Streak === undefined) {
      return res.status(404).json({ error: "Streak not found for this company" });
    }
    res.json({ Streak: company.Streak });
  } catch (error) {
    handleError(res, error);
  }
});

// PUT Increment/Decrement the Streak for a specific company by Account Number
router.put("/companies/update-streak/:accountNumber", async (req, res) => {
  try {
    const accountNumber = parseInt(req.params.accountNumber);
    const { streakChange } = req.body; // Value by which to increment/decrement Streak
    // Validate the streakChange input
    if (streakChange === undefined || isNaN(streakChange)) {
      return res.status(400).json({ error: "A valid streakChange value is required" });
    }
    // Find the company and update the Streak by incrementing/decrementing it
    const updateResult = await db.collection("Companies").updateOne(
      { "Account Number": accountNumber }, // Find the company by Account Number
      { $inc: { Streak: streakChange } }   // Increment/decrement the Streak field
    );
    // If no company was found and updated, return a 404 error
    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ error: "Company not found" });
    }
    // Retrieve the updated document to send back as a response
    const updatedCompany = await db.collection("Companies").findOne({ "Account Number": accountNumber });
    res.json(updatedCompany); // Send the updated document in the response
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "An error occurred while updating the Streak" });
  }
});

module.exports = router;