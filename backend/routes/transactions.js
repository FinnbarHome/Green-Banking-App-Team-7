const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const db = mongoose.connection;

// Error handling function
function handleError(res, error) {
  console.error(error);
  res.status(500).json({ error: error.message });
}

// POST Create a new transaction with Reference
router.post("/transactions", async (req, res) => {
    try {
      const { Recipient, Sender, Amount, Reference } = req.body;
      // Basic validation to ensure all required fields are present
      if (!Recipient || !Sender || !Amount || !Reference) {
        return res.status(400).json({ error: "Recipient, Sender, Amount, and Reference are required" });
      }
      // Check that both Recipient and Sender are valid account numbers in the companies collection
      const recipientExists = await db.collection("Companies").findOne({ "Account Number": Recipient });
      const senderExists = await db.collection("Companies").findOne({ "Account Number": Sender });
      if (!recipientExists) {
        return res.status(400).json({ error: "Recipient account number not found" });
      }
  
      if (!senderExists) {
        return res.status(400).json({ error: "Sender account number not found" });
      }
      // Insert the new transaction
      const newTransaction = { Recipient, Sender, Amount, Reference };
      const result = await db.collection("Transactions").insertOne(newTransaction);
      // Return the newly created transaction data
      res.status(201).json({
        _id: result.insertedId,
        Recipient,
        Sender,
        Amount,
        Reference
      });
    } catch (error) {
      handleError(res, error);
    }
  });
  

// GET View all transactions
router.get("/transactions", async (req, res) => {
  try {
    const transactions = await db.collection("Transactions").find({}).toArray();
    res.json(transactions);
  } catch (error) {
    handleError(res, error);
  }
});

// GET View transactions by recipient or sender (either matches)
router.get("/transactions/:accountNumber", async (req, res) => {
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
