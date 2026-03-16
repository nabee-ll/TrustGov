const express = require("express");
const router = express.Router();
const connectDB = require("../db");

router.get("/summary", async (req, res) => {

    const db = await connectDB();

    const totalReturns = await db.collection("returns").countDocuments();

    const totalIncome = await db.collection("returns").aggregate([
        { $group: { _id: null, total: { $sum: "$income" } } }
    ]).toArray();

    const totalTax = await db.collection("returns").aggregate([
        { $group: { _id: null, total: { $sum: "$taxCalculated" } } }
    ]).toArray();

    res.json({
        totalReturns,
        totalIncome: totalIncome[0]?.total || 0,
        totalTax: totalTax[0]?.total || 0
    });

});

module.exports = router;