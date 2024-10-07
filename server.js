require('dotenv').config();
const express = require('express');
const cors = require('cors');
//const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const apiRoutes = require('./routes/api');
const discountsRoutes = require("./routes/discounts");
const transactionsRoutes = require("./routes/transactions");
const path = require('path');
const { setupWebSocket } = require('./websocket'); 

const app = express();

// Validate required environment variables
const requiredEnvVars = ['PORT', 'MONGO_URI'];
requiredEnvVars.forEach((key) => {
    if (!process.env[key]) {
        console.error(`ERROR: ${key} not specified in .env`);
        process.exit(1);
    }
});

// Middleware
// app.use(helmet()); // Adds secure HTTP headers - Doesn't work on AWS, had to remove
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse incoming JSON requests
app.use(compression()); // Compress responses
app.use(morgan('combined')); // HTTP request logger

// Rate limiting
const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 60 minutes in ms
    max: 250, // Limit each ip to 250 req
    message: "Too many requests, please try again later.",
});
app.use(limiter);

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// Establish Db Connection and start server
connectDB()
    .then(() => {
        const PORT = process.env.PORT || 3000;
        const server = app.listen(PORT, () => {
            console.log(`API server listening on port ${PORT}!`);
        });

        // Init WebSocket server
        setupWebSocket(server); 
    })
    .catch((error) => {
        console.error("ERROR: Database connection failed", error);
        process.exit(1);
    });

// API routes
app.use('/api', apiRoutes);
app.use("/api", discountsRoutes);
app.use("/api", transactionsRoutes);

// Root endpoint for basic health check
app.get('/', (req, res) => {
    res.send("Hello World!");
});

// Fallback for SPA routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// 404 Error Handler for non-existent routes
app.use((req, res, next) => {
    res.status(404).json({ error: "Resource not found" });
});

// Error Handler for all uncaught errors
app.use((error, req, res, next) => {
    console.error("ERROR:", error.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

// Graceful shutdown func
const gracefulShutdown = (signal, server) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    server.close(() => {
        console.log('Closed out remaining connections');
        process.exit(0);
    });
};

module.exports = app; // Import for use in supertests etc etc
