const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const db = mongoose.connection;

// Utility function to handle errors
const handleError = (res, error, status = 500, message = "An error occurred") => {
  console.error(error);
  res.status(status).json({ error: message });
};

// Utility function to find a company by a field
const findCompany = async (filter, res, errorMsg = "Company not found") => {
  try {
    const company = await db.collection("Companies").findOne(filter);
    if (!company) return res.status(404).json({ error: errorMsg });
    return company;
  } catch (error) {
    handleError(res, error);
    return null;
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
  const company = await findCompany({ "Account Number": parseInt(req.params.accountNumber) }, res);
  if (company) res.json(company);
});

// GET a company by Account Name
router.get("/companies/name/:companyName", async (req, res) => {
  const company = await findCompany({ "Company Name": req.params.companyName }, res);
  if (company) res.json(company);
});

// POST login route
router.post("/login", async (req, res) => {
  const { username, accountNumber } = req.body;
  const company = await findCompany({
    "Company Name": username,
    "Account Number": parseInt(accountNumber),
  }, res, "Company not found or account number does not match");
  if (company) res.json({ accountNumber: company["Account Number"] });
});

// POST a new company
router.post("/companies", async (req, res) => {
  try {
    const { "Company Name": companyName, Balance } = req.body;
    if (!companyName || typeof Balance !== 'number') {
      return res.status(400).json({ error: "Company Name and Balance are required." });
    }

    const lastCompany = await db.collection("Companies").find().sort({ "Account Number": -1 }).limit(1).toArray();
    const accountNumber = lastCompany.length > 0 ? lastCompany[0]["Account Number"] + 1 : 1;

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

    const result = await db.collection("Companies").insertOne(newCompany);
    res.status(201).json({ _id: result.insertedId, ...newCompany });
  } catch (error) {
    handleError(res, error);
  }
});

// PUT utility function for updating fields
const updateField = async (accountNumber, update, res) => {
  try {
    const result = await db.collection("Companies").updateOne(
      { "Account Number": parseInt(accountNumber) },
      update
    );
    if (result.matchedCount === 0) return res.status(404).json({ error: "Company not found" });

    const updatedCompany = await findCompany({ "Account Number": parseInt(accountNumber) }, res);
    if (updatedCompany) return res.json(updatedCompany);
  } catch (error) {
    handleError(res, error);
  }
};

// PUT Update the Balance for a specific company
router.put("/companies/update-balance/:accountNumber", async (req, res) => {
  const { amount } = req.body;
  if (amount === undefined || isNaN(amount)) {
    return res.status(400).json({ error: "A valid amount is required" });
  }
  await updateField(req.params.accountNumber, { $inc: { Balance: amount } }, res);
});

// PUT Update the XP for a specific company
router.put("/companies/update-xp/:accountNumber", async (req, res) => {
  const { xpAmount } = req.body;
  if (xpAmount === undefined || isNaN(xpAmount)) {
    return res.status(400).json({ error: "A valid xpAmount is required" });
  }
  await updateField(req.params.accountNumber, { $inc: { XP: xpAmount } }, res);
});

// GET Streak for a specific company
router.get("/companies/:accountNumber/streak", async (req, res) => {
  const company = await findCompany({ "Account Number": parseInt(req.params.accountNumber) }, res);
  if (company && company.Streak !== undefined) {
    res.json({ Streak: company.Streak });
  } else {
    res.status(404).json({ error: "Streak not found" });
  }
});

// PUT set the Streak value
router.put("/companies/update-streak/:accountNumber", async (req, res) => {
  const { streakValue } = req.body;
  if (streakValue === undefined || isNaN(streakValue)) {
    return res.status(400).json({ error: "A valid streakValue is required" });
  }
  await updateField(req.params.accountNumber, { $set: { Streak: streakValue } }, res);
});

module.exports = router;
