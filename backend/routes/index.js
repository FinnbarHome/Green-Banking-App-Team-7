const apiRoutes = require("./api");
const discountsRoutes = require("./discounts");
const transactionsRoutes = require("./transactions");
const path = require("path");

const setupRoutes = (app) => {
  // API routes
  app.use("/api", apiRoutes);
  app.use("/api", discountsRoutes);
  app.use("/api", transactionsRoutes);

  // Root health check
  app.get("/", (req, res) => {
    res.send("Hello World!");
  });

  // SPA fallback
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../public", "login.html"));
  });

  // 404 Error handling
  app.use((req, res) => {
    res.status(404).json({ error: "Resource not found" });
  });

  // Global error handler
  app.use((error, req, res, next) => {
    console.error("ERROR:", error.stack);
    res.status(500).json({ error: "Internal Server Error" });
  });
};

module.exports = setupRoutes;
