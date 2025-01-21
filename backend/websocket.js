const WebSocket = require("ws");

// Store connected clients
const clients = new Map();

// Setup WebSocket server
function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    ws.on("message", (message) => handleClientMessage(ws, message));
    ws.on("close", () => handleClientDisconnection(ws));
  });

  wss.on("error", (error) => console.error("WebSocket error:", error));
}

// Handle client messages
function handleClientMessage(ws, message) {
  try {
    const parsedMessage = JSON.parse(message);

    if (parsedMessage.type === "register") {
      const accountNumber = parsedMessage.accountNumber;
      if (accountNumber) {
        clients.set(accountNumber, ws); // Register client
        ws.accountNumber = accountNumber; // Save account number in WebSocket instance
      }
    }
  } catch (error) {
    console.error("Error handling message:", error);
  }
}

// Handle client disconnection
function handleClientDisconnection(ws) {
  if (ws.accountNumber) {
    clients.delete(ws.accountNumber); // Remove client on disconnection
  }
}

// Notify a specific client of an update
function notifyClient(accountNumber, updateType, data) {
  const client = clients.get(accountNumber);

  if (client) {
    try {
      client.send(JSON.stringify({ type: updateType, data })); // Send update to client
    } catch (error) {
      console.error(`Failed to send message to ${accountNumber}:`, error);
    }
  }
}

module.exports = { setupWebSocket, notifyClient };
