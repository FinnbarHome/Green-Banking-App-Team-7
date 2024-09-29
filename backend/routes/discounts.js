const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const db = mongoose.connection;

// Utility function to handle errors
const handleError = (res, error, status = 500, message = "An error occurred") => {
  console.error(error);
  res.status(status).json({ error: message });
};

// Utility function to find a discount by DiscountID
const findDiscount = async (discountID, res) => {
  try {
    const discount = await db.collection("Discounts").findOne({ DiscountID: parseInt(discountID) });
    if (!discount) {
      return res.status(404).json({ error: "Discount not found" });
    }
    return discount;
  } catch (error) {
    handleError(res, error);
  }
};

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
  const discount = await findDiscount(req.params.discountID, res);
  if (discount) res.json(discount);
});

router.post("/discounts", async (req, res) => {
  try {
      const { DiscountID, Company, LevelReq, DiscountCode, Description } = req.body;

      // Convert DiscountID and LevelReq to integers if necessary
      const discountIDInt = parseInt(DiscountID);
      const levelReqInt = parseInt(LevelReq);

      // Check if the DiscountID already exists
      const existingDiscount = await db.collection("Discounts").findOne({ DiscountID: discountIDInt });
      if (existingDiscount) {
          return res.status(400).json({ error: "A discount with the same DiscountID already exists" });
      }

      // Insert the new discount into the collection
      const newDiscount = {
          DiscountID: discountIDInt,
          Company,
          LevelReq: levelReqInt,
          DiscountCode,
          Description
      };

      const result = await db.collection("Discounts").insertOne(newDiscount);

      // Return the newly created discount
      res.status(201).json({ _id: result.insertedId, ...newDiscount });
  } catch (error) {
      handleError(res, error);
  }
});


// DELETE a discount by DiscountID
router.delete("/discounts/:discountID", async (req, res) => {
  try {
    const discountID = parseInt(req.params.discountID);
    // Find and delete the discount with the specified DiscountID
    const result = await db.collection("Discounts").deleteOne({ DiscountID: discountID });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Discount not found" });
    }
    res.json({ message: `Discount with DiscountID ${discountID} deleted successfully` });
  } catch (error) {
    handleError(res, error);
  }
});

module.exports = router;
