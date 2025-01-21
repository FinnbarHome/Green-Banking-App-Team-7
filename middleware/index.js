const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
// const helmet = require('helmet'); // Disabled for AWS

const setupMiddleware = (app) => {
  // Security headers
  // app.use(helmet()); // Uncomment if supported in future deployment

  // Enable CORS
  app.use(cors());

  // Request parsing
  app.use(express.json()); // Parse incoming JSON

  // Response compression
  app.use(compression());

  // Request logging
  app.use(morgan("combined"));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 60 minutes
    max: 250, // Max 250 requests per IP
    message: "Too many requests, please try again later.",
  });
  app.use(limiter);

  // Static file serving
  app.use(express.static("public"));
};

module.exports = setupMiddleware;
