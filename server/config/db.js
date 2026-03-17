const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/securityDB";
        await mongoose.connect(uri);
        console.log("MongoDB connected");
    } catch (error) {
        console.log("Database connection error:", error);
    }
};

module.exports = connectDB;