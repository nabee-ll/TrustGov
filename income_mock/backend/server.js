const express = require("express");
const cors = require("cors");

const app = express();

/* Middleware */
app.use(cors());
app.use(express.json());

/* Routes */
const dashboardRoutes = require("./routes/dashboard");
const returnRoutes = require("./routes/returns");

app.use("/api/dashboard", dashboardRoutes);
app.use("/api/returns", returnRoutes);

/* Test route */
app.get("/", (req, res) => {
    res.send("Income Tax Backend Running");
});

/* Start server */
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});