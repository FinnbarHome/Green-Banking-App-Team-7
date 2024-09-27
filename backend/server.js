require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api'); // Import API routes
const discountsRoutes = require("./routes/discounts");
const transactionsRoutes = require("./routes/transactions");
const path = require('path');

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

// Serve static files from the frontend folder
app.use(express.static(path.join(__dirname, '../frontend')));

// Establish Database Connection and start server
connectDB()
    .then(() => {
        const PORT = process.env.PORT || 3000;
        const server = app.listen(PORT, () => {
            console.log(`API server listening on port ${PORT}!`);
        });

        // Handle graceful shutdown on termination signals
        ['SIGTERM', 'SIGINT'].forEach((signal) => {
            process.on(signal, () => gracefulShutdown(signal, server));
        });
    })
    .catch((error) => {
        console.error("ERROR: Database connection failed", error);
        process.exit(1); // Terminate process if DB connection fails
    });

// API routes (all under /api)
app.use('/api', apiRoutes);
app.use("/api", discountsRoutes);
app.use("/api", transactionsRoutes);

// Root endpoint for basic health check
app.get('/', (req, res) => {
    res.send("Hello World!");
});

// Fallback for Single Page Application (SPA) routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
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

// Graceful shutdown function
const gracefulShutdown = (signal, server) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
        console.log('Closed out remaining connections');
        process.exit(0);
    });
};
