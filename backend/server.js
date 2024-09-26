require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api'); // Import API routes
const discountsRoutes = require("./routes/discounts"); 
const transactionsRoutes = require("./routes/transactions"); 


const app = express();

// Validate required environment variables
const requiredEnvVars = ['PORT', 'MONGO_URI'];

requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
        console.error(`ERROR: ${key} not specified in .env`);
        process.exit(1);
    }
});

// Middleware for JSON and CORS
app.use(express.json());
app.use(cors());

// Establish Database Connection
connectDB()
    .then(() => {
        const PORT = process.env.PORT || 3000;
        // Start the server after successful DB connection
        app.listen(PORT, () => {
            console.log(`API server listening on port ${PORT}!`);
        });
    })
    .catch((error) => {
        console.error("ERROR: Database connection failed", error);
        process.exit(1); // Terminate process if DB connection fails
    });

// API routes
app.use('/api', apiRoutes);
app.use("/api", discountsRoutes);
app.use("/api", transactionsRoutes);


// Root endpoint for basic health check
app.get('/', (req, res) => {
    res.send("Hello World!");
});

// 404 Error Handler for non-existent routes
app.use((req, res, next) => {
    res.status(404).json({ error: "Resource not found" });
});

// Generic Error Handler for all uncaught errors
app.use((error, req, res, next) => {
    console.error("ERROR:", error.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

