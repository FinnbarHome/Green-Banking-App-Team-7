// websocket.js
const WebSocket = require('ws');

let clients = {}; // Store connected clients

// Function to setup WebSocket server
function setupWebSocket(server) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', (ws) => {
        console.log("New client connected");

        ws.on('message', (message) => {
            const parsedMessage = JSON.parse(message);

            // Register client with their account number
            if (parsedMessage.type === 'register') {
                const accountNumber = parsedMessage.accountNumber;
                clients[accountNumber] = ws;
                ws.accountNumber = accountNumber;
                console.log(`Client registered: ${accountNumber}`);
            }
        });

        ws.on('close', () => {
            if (ws.accountNumber) {
                delete clients[ws.accountNumber];
                console.log(`Client disconnected: ${ws.accountNumber}`);
            }
        });
    });
}

// Function to notify a client about balance/transaction updates
function notifyClient(accountNumber, updateType, data) {
    if (clients[accountNumber]) {
        clients[accountNumber].send(JSON.stringify({ type: updateType, data }));
    }
}


module.exports = { setupWebSocket, notifyClient };
