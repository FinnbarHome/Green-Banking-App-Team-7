const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const db = mongoose.connection;
const { notifyClient } = require('../websocket'); // Import WebSocket notification utility from websocket.js

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
  try {
    const { Recipient, Sender, Amount, Reference } = req.body;

    if (!Recipient || !Sender || !Amount || !Reference) {
      return res.status(400).json({ error: "Recipient, Sender, Amount, and Reference are required" });
    }

    // Validate if both accounts exist
    await validateAccounts(Recipient, Sender, res);

    const newTransaction = {
      Recipient,
      Sender,
      Amount,
      Reference,
      date: new Date() // Set the current date
    };

    // Insert the new transaction into the database
    const result = await db.collection("Transactions").insertOne(newTransaction);

    // Update the balance of the sender and recipient
    await db.collection("Companies").updateOne({ "Account Number": Sender }, { $inc: { Balance: -Amount } });
    await db.collection("Companies").updateOne({ "Account Number": Recipient }, { $inc: { Balance: Amount } });

    // Fetch payee data for EIS calculation
    const payeeData = await db.collection("Companies").findOne({ "Account Number": Recipient });
    const CE = payeeData["Carbon Emissions"] || 0;
    const WM = payeeData["Waste Management"] || 0;
    const SP = payeeData["Sustainability Practices"] || 0;

    // Calculate EIS
    let EIS = (CE + WM + SP) / 30;

    // Fetch payer's current streak and XP
    const payerData = await db.collection("Companies").findOne({ "Account Number": Sender });
    let streak = payerData["Streak"] || 0;
    let userXP = payerData["XP"] || 0;

    // Define thresholds and multipliers
    const greenThreshold = 0.7;
    const redThreshold = 0.3;
    const streakMultiplier = 0.1;
    let greenStreakMultiplier = 0;
    let redStreakMultiplier = 0;

    // Determine if the transaction is green or red
    let isGreenTransaction = EIS >= greenThreshold;
    let isRedTransaction = EIS <= redThreshold;

    // Update streak based on the transaction type
    if (isGreenTransaction) {
      streak = streak < 0 ? 1 : streak + 1;
    } else if (isRedTransaction) {
      streak = streak > 0 ? -1 : streak - 1;
    } else {
      streak = 0;
    }

    let greenStreak = Math.max(0, streak);
    let redStreak = Math.abs(Math.min(0, streak));

    // Apply streak multipliers
    if (greenStreak % 5 === 0 && greenStreak > 0 || greenStreak > 5) {
      greenStreakMultiplier = Math.floor(greenStreak / 5);
      EIS += greenStreakMultiplier * streakMultiplier;
    }

    if (redStreak % 5 === 0 && redStreak > 0 || redStreak > 5) {
      let levelInfo = calculateUserLevel(userXP);
      let decreaseRed = levelInfo.level / 2;
      redStreakMultiplier = Math.floor(redStreak / 5);
      EIS -= redStreakMultiplier * streakMultiplier * decreaseRed;
    }

    // Calculate XP gain based on EIS and payment amount
    let XPGain = Math.round(EIS * Amount);

    // Update XP and streak for the payer
    await db.collection("Companies").updateOne({ "Account Number": Sender }, { $inc: { XP: XPGain, Streak: streak } });

    // Get the updated balances and XP
    const updatedSender = await db.collection("Companies").findOne({ "Account Number": Sender });
    const updatedRecipient = await db.collection("Companies").findOne({ "Account Number": Recipient });

    // Notify the sender and recipient with updated data
    notifyClient(Sender, 'transactionUpdate', {
      transaction: newTransaction,
      updatedBalance: updatedSender.Balance,
      updatedXP: updatedSender.XP,
      updatedStreak: updatedSender.Streak
    });
    notifyClient(Recipient, 'transactionUpdate', {
      transaction: newTransaction,
      updatedBalance: updatedRecipient.Balance,
      updatedXP: updatedRecipient.XP,
      updatedStreak: updatedRecipient.Streak
    });

    // Respond with the created transaction
    res.status(201).json({ _id: result.insertedId, ...newTransaction });
  } catch (error) {
    handleError(res, error);
  }
});

// Helper function to calculate user level based on XP
function calculateUserLevel(userXP) {
  const levelBounds = Levels();
  let level = 0;
  let NextLevel = 0;
  let PreviousLevel = 0;
  let progressPercentage = 0;

  for (let i = 0; i < levelBounds.length; i++) {
    if (userXP >= levelBounds[i]) {
      level = i + 1;
      PreviousLevel = levelBounds[i];
      if (i + 1 < levelBounds.length) {
        NextLevel = levelBounds[i + 1];
      } else {
        NextLevel = levelBounds[i];
      }
    } else {
      NextLevel = levelBounds[i];
      break;
    }
  }

  if (level < levelBounds.length) {
    let xpForNextLevel = NextLevel - PreviousLevel;
    let currentLevelProgress = userXP - PreviousLevel;
    progressPercentage = (currentLevelProgress / xpForNextLevel) * 100;
  } else {
    progressPercentage = 100;
  }

  return {
    level: level,
    progressPercentage: Math.round(progressPercentage * 100) / 100,
    currentXP: userXP,
    nextLevelXP: NextLevel
  };
}

function Levels() {
  const power = 2.5;
  const denominator = 0.3;
  const levelBounds = [];

  for (let i = 0; i < 11; i++) {
    let bounds = i / denominator;
    bounds = Math.pow(bounds, power);
    levelBounds[i] = Math.round(bounds);
  }
  return levelBounds;
}

// GET View all transactions
router.get("/transactions", async (req, res) => {
  try {
    const transactions = await db.collection("Transactions").find({}).toArray();
    res.json(transactions);
  } catch (error) {
    handleError(res, error);
  }
});

// GET View transactions by recipient or sender, sorted by date (newest first)
router.get("/transactions/:accountNumber", async (req, res) => {
  try {
    const accountNumber = parseInt(req.params.accountNumber);
    // Fetch transactions where the account number is either the recipient or sender, sorted by date
    const transactions = await db.collection("Transactions").find({
      $or: [{ Recipient: accountNumber }, { Sender: accountNumber }]
    }).sort({ date: -1 }).toArray();  // Sort by date (descending)
    if (transactions.length === 0) {
      return res.status(404).json({ error: "No transactions found for this account number" });
    }
    res.json(transactions);
  } catch (error) {
    handleError(res, error);
  }
});


module.exports = router;
