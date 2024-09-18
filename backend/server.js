const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config(); // Load environment variables from .env

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// Database Connection and Server Start
connectDB()
    .then(() => {
        // Start server after successful DB connection
        const PORT = process.env.PORT || 3000;
        app.listen(PORT, () => console.log(`API server listening on port ${PORT}!`));
    })
    .catch(error => {
        console.error("Database connection failed", error);
        process.exit(1); // Exit the process with failure
    });

// Basic API route
app.use('/api', require('./routes/api'));
