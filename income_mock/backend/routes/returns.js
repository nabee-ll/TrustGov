const express = require("express");
const router = express.Router();

const calculateTax = require("../utils/taxCalculator");

/* File tax return */
router.post("/file", (req, res) => {

    const { income } = req.body;

    const tax = calculateTax(income);

    res.json({
        message: "Return filed successfully",
        income: income,
        calculatedTax: tax
    });

});

/* Get all returns (dummy example) */
router.get("/", (req, res) => {

    res.json([
        { year: 2024, income: 600000, tax: 30000 },
        { year: 2023, income: 550000, tax: 25000 }
    ]);

});

module.exports = router;