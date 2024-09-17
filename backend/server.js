const express = require('express');
const app = express();

// Import the routes from a separate file
const apiRoutes = require('./routes');

const port = 5000;

// Middleware
app.use(express.json()); // For handling JSON data

// Use API routes
app.use('/api', apiRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
