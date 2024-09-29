const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const db = mongoose.connection;

// Utility function to handle errors
const handleError = (res, error, status = 500, message = "An error occurred") => {
  console.error(error);
  res.status(status).json({ error: message });
};

// Utility function to validate if both recipient and sender exist
const validateAccounts = async (Recipient, Sender, res) => {
  try {
    const recipientExists = await db.collection("Companies").findOne({ "Account Number": Recipient });
    const senderExists = await db.collection("Companies").findOne({ "Account Number": Sender });
    if (!recipientExists) {
      return res.status(400).json({ error: "Recipient account number not found" });
    }
    if (!senderExists) {
      return res.status(400).json({ error: "Sender account number not found" });
    }
  } catch (error) {
    handleError(res, error);
  }
};

// POST Create a new transaction (with date field)
router.post("/transactions", async (req, res) => {
  console.log("POST /transactions hit"); // Add this debug line
  try {
    const { Recipient, Sender, Amount, Reference } = req.body;
    // Basic validation
    if (!Recipient || !Sender || !Amount || !Reference) {
      return res.status(400).json({ error: "Recipient, Sender, Amount, and Reference are required" });
    }
    // Validate if both accounts exist
    await validateAccounts(Recipient, Sender, res);
    // Insert the new transaction with the current date
    const newTransaction = {
      Recipient,
      Sender,
      Amount,
      Reference,
      date: new Date() // Set the current date
    };
    const result = await db.collection("Transactions").insertOne(newTransaction);
    // Return the newly created transaction
    res.status(201).json({ _id: result.insertedId, ...newTransaction });
  } catch (error) {
    handleError(res, error);
  }
});

// GET View all transactions
router.get("/transactions", async (req, res) => {
  console.log("GET /transactions hit"); // Add this debug line

  try {
    const transactions = await db.collection("Transactions").find({}).toArray();
    res.json(transactions);
  } catch (error) {
    handleError(res, error);
  }
});

// GET View transactions by recipient or sender
router.get("/transactions/:accountNumber", async (req, res) => {
  console.log("GET /transactions/acc hit"); // Add this debug line

  try {
    const accountNumber = parseInt(req.params.accountNumber);

    // Fetch transactions where the account number is either the recipient or sender
    const transactions = await db.collection("Transactions").find({
      $or: [{ Recipient: accountNumber }, { Sender: accountNumber }]
    }).toArray();

    if (transactions.length === 0) {
      return res.status(404).json({ error: "No transactions found for this account number" });
    }

    res.json(transactions);
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
