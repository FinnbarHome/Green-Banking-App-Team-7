const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const db = mongoose.connection;
const { notifyClient } = require('../websocket');

// Utility function to handle errors
const handleError = (res, error, status = 500, message = "An error occurred") => {
  console.error(error);
  res.status(status).json({ error: message });
};

// Utility function to validate accounts
const validateAccounts = async (Recipient, Sender, res) => {
  try {
    const [recipientExists, senderExists] = await Promise.all([
      db.collection("Companies").findOne({ "Account Number": Recipient }),
      db.collection("Companies").findOne({ "Account Number": Sender })
    ]);
    if (!recipientExists) return res.status(400).json({ error: "Recipient account number not found" });
    if (!senderExists) return res.status(400).json({ error: "Sender account number not found" });
  } catch (error) {
    handleError(res, error);
  }
};

// Helper function to update balances
const updateBalances = async (Sender, Recipient, Amount) => {
  await Promise.all([
    db.collection("Companies").updateOne({ "Account Number": Sender }, { $inc: { Balance: -Amount } }),
    db.collection("Companies").updateOne({ "Account Number": Recipient }, { $inc: { Balance: Amount } })
  ]);
};

// Helper function to calculate EIS
const calculateEIS = (companyData) => {
  const CE = companyData["Carbon Emissions"] || 0;
  const WM = companyData["Waste Management"] || 0;
  const SP = companyData["Sustainability Practices"] || 0;
  return (CE + WM + SP) / 30;
};

// Helper function to handle streaks and XP
const handleStreaksAndXP = (EIS, streak, userXP, Amount) => {
  const greenThreshold = 0.7, redThreshold = 0.3, streakMultiplier = 0.1;
  let greenStreak = 0, redStreak = 0, greenStreakMultiplier = 0, redStreakMultiplier = 0;

  // Adjust streak
  streak = EIS >= greenThreshold ? Math.max(1, streak + 1) : EIS <= redThreshold ? Math.min(-1, streak - 1) : 0;

  greenStreak = Math.max(0, streak);
  redStreak = Math.abs(Math.min(0, streak));

  // Apply streak multipliers
  if (greenStreak % 5 === 0 && greenStreak > 0) {
    greenStreakMultiplier = Math.floor(greenStreak / 5);
    EIS += greenStreakMultiplier * streakMultiplier;
  }

  if (redStreak % 5 === 0 && redStreak > 0 || redStreak > 5) {
    const levelInfo = calculateUserLevel(userXP);
    redStreakMultiplier = Math.floor(redStreak / 5);
    EIS -= redStreakMultiplier * streakMultiplier * (levelInfo.level / 2);
  }

  const XPGain = Math.round(EIS * Amount);
  return { streak, XPGain };
};

// POST Create a new transaction
router.post("/transactions", async (req, res) => {
  try {
    const { Recipient, Sender, Amount, Reference } = req.body;
    if (!Recipient || !Sender || !Amount || !Reference) {
      return res.status(400).json({ error: "Recipient, Sender, Amount, and Reference are required" });
    }

    // Validate accounts
    await validateAccounts(Recipient, Sender, res);

    const newTransaction = { Recipient, Sender, Amount, Reference, date: new Date() };
    const result = await db.collection("Transactions").insertOne(newTransaction);

    // Update balances
    await updateBalances(Sender, Recipient, Amount);

    // Fetch payee and payer data
    const [payeeData, payerData] = await Promise.all([
      db.collection("Companies").findOne({ "Account Number": Recipient }),
      db.collection("Companies").findOne({ "Account Number": Sender })
    ]);

    const EIS = calculateEIS(payeeData);
    const { streak, XPGain } = handleStreaksAndXP(EIS, payerData["Streak"] || 0, payerData["XP"] || 0, Amount);

    // Update XP and streak for payer
    await db.collection("Companies").updateOne({ "Account Number": Sender }, { $inc: { XP: XPGain, Streak: streak } });

    const [updatedSender, updatedRecipient] = await Promise.all([
      db.collection("Companies").findOne({ "Account Number": Sender }),
      db.collection("Companies").findOne({ "Account Number": Recipient })
    ]);

    // Notify clients
    notifyClient(Sender, 'transactionUpdate', {
      transaction: newTransaction, updatedBalance: updatedSender.Balance, updatedXP: updatedSender.XP, updatedStreak: updatedSender.Streak
    });
    notifyClient(Recipient, 'transactionUpdate', {
      transaction: newTransaction, updatedBalance: updatedRecipient.Balance, updatedXP: updatedRecipient.XP, updatedStreak: updatedRecipient.Streak
    });

    // Respond with the created transaction
    res.status(201).json({ _id: result.insertedId, ...newTransaction });
  } catch (error) {
    handleError(res, error);
  }
});

// Helper function to calculate user level
function calculateUserLevel(userXP) {
  const levelBounds = Levels();
  let level = 0, PreviousLevel = 0, NextLevel = 0, progressPercentage = 0;

  levelBounds.forEach((bound, i) => {
    if (userXP >= bound) {
      level = i + 1;
      PreviousLevel = bound;
      NextLevel = levelBounds[i + 1] || bound;
    }
  });

  if (level < levelBounds.length) {
    const xpForNextLevel = NextLevel - PreviousLevel;
    progressPercentage = ((userXP - PreviousLevel) / xpForNextLevel) * 100;
  } else {
    progressPercentage = 100;
  }

  return { level, progressPercentage: Math.round(progressPercentage * 100) / 100, currentXP: userXP, nextLevelXP: NextLevel };
}

function Levels() {
  return Array.from({ length: 11 }, (_, i) => Math.round(Math.pow(i / 0.3, 2.5)));
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

// GET View transactions by recipient or sender, sorted by date
router.get("/transactions/:accountNumber", async (req, res) => {
  try {
    const accountNumber = parseInt(req.params.accountNumber);
    const transactions = await db.collection("Transactions").find({
      $or: [{ Recipient: accountNumber }, { Sender: accountNumber }]
    }).sort({ date: -1 }).toArray();

    if (!transactions.length) {
      return res.status(404).json({ error: "No transactions found for this account number" });
    }
    res.json(transactions);
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
