const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Assuming you have already connected to the CompanyDB database
const db = mongoose.connection;

// Error handling function
function handleError(res, error) {
  console.error(error);
  res.status(500).json({ error: error.message });
}

// GET all Discounts
router.get("/discounts", async (req, res) => {
  try {
    const discounts = await db.collection("Discounts").find({}).toArray();
    res.json(discounts);
  } catch (error) {
    handleError(res, error);
  }
});

// GET a specific discount by DiscountID
router.get("/discounts/:discountID", async (req, res) => {
  try {
    const discountID = parseInt(req.params.discountID);
    const discount = await db.collection("Discounts").findOne({ "DiscountID": discountID });
    if (!discount) {
      return res.status(404).json({ error: "Discount not found" });
    }
    res.json(discount);
  } catch (error) {
    handleError(res, error);
  }
});

// POST a new discount
router.post("/discounts", async (req, res) => {
  try {
    const { DiscountID, Company, LevelReq, DiscountCode, Description } = req.body;
    // Check if the DiscountID already exists
    const existingDiscount = await db.collection("Discounts").findOne({ DiscountID });
    if (existingDiscount) {
      return res.status(400).json({ error: "A discount with the same DiscountID already exists" });
    }
    // Insert the new discount into the collection
    const newDiscount = { DiscountID, Company, LevelReq, DiscountCode, Description };
    const result = await db.collection("Discounts").insertOne(newDiscount);
    res.status(201).json(result.ops[0]); // Return the newly created discount
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;