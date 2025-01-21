const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.FRONTEND_PORT || 4000;

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, "public")));

// Fallback to index.html for SPA routing
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start frontend server
app.listen(PORT, () => {
  console.log(`Frontend server running at http://localhost:${PORT}`);
});
