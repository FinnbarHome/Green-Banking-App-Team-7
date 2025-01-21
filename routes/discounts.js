const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const db = mongoose.connection;

// Handle errors centrally
const handleError = (
  res,
  error,
  status = 500,
  message = "An error occurred"
) => {
  console.error(error);
  res.status(status).json({ error: message });
};

// Find discount by DiscountID
const findDiscount = async (discountID, res) => {
  try {
    const discount = await db
      .collection("Discounts")
      .findOne({ DiscountID: parseInt(discountID) });
    if (!discount) {
      res.status(404).json({ error: "Discount not found" });
      return null;
    }
    return discount;
  } catch (error) {
    handleError(res, error);
  }
};

// Parse and validate DiscountID
const parseDiscountID = (id) => {
  const parsedID = parseInt(id);
  if (isNaN(parsedID)) throw new Error("Invalid DiscountID");
  return parsedID;
};

// Validate discount input fields
const validateDiscountInput = ({
  DiscountID,
  Company,
  LevelReq,
  DiscountCode,
  Description,
}) => {
  if (!DiscountID || !Company || !LevelReq || !DiscountCode || !Description) {
    throw new Error("Missing required fields");
  }
};

// GET all discounts
router.get("/discounts", async (req, res) => {
  try {
    const discounts = await db.collection("Discounts").find({}).toArray();
    res.json(discounts);
  } catch (error) {
    handleError(res, error);
  }
});

// GET discount by DiscountID
router.get("/discounts/:discountID", async (req, res) => {
  try {
    const discountID = parseDiscountID(req.params.discountID);
    const discount = await findDiscount(discountID, res);
    if (discount) res.json(discount);
  } catch (error) {
    handleError(res, error, 400, "Invalid DiscountID");
  }
});

// POST new discount
router.post("/discounts", async (req, res) => {
  try {
    const { DiscountID, Company, LevelReq, DiscountCode, Description } =
      req.body;
    validateDiscountInput({
      DiscountID,
      Company,
      LevelReq,
      DiscountCode,
      Description,
    });

    const discountID = parseDiscountID(DiscountID);
    const levelReq = parseInt(LevelReq);

    // Check if discount exists
    const existingDiscount = await db
      .collection("Discounts")
      .findOne({ DiscountID: discountID });
    if (existingDiscount) {
      return res
        .status(400)
        .json({ error: "Discount with the same DiscountID already exists" });
    }

    // Insert new discount
    const newDiscount = {
      DiscountID: discountID,
      Company,
      LevelReq: levelReq,
      DiscountCode,
      Description,
    };
    const result = await db.collection("Discounts").insertOne(newDiscount);

    res.status(201).json({ _id: result.insertedId, ...newDiscount });
  } catch (error) {
    handleError(res, error, 400, error.message);
  }
});

// DELETE discount by DiscountID
router.delete("/discounts/:discountID", async (req, res) => {
  try {
    const discountID = parseDiscountID(req.params.discountID);

    // Find and delete discount
    const result = await db
      .collection("Discounts")
      .deleteOne({ DiscountID: discountID });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Discount not found" });
    }
    res.json({
      message: `Discount with DiscountID ${discountID} deleted successfully`,
    });
  } catch (error) {
    handleError(res, error, 400, "Invalid DiscountID");
  }
});

module.exports = router;
