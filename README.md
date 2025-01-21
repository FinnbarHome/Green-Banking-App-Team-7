# Green Banking App 🌱

This project is a **Green Banking Application** developed as part of a university project in collaboration with **Barclays** representatives. The app assigns sustainability scores based on users' transactions with companies, encouraging eco-friendly financial decisions by providing detailed insights and rewards for environmentally conscious spending.

---

## Features

- **Sustainability Scoring**: Users' transactions with companies are analyzed to calculate an Environmental Impact Score (EIS) based on factors like carbon emissions, waste management, and sustainability practices.
- **Green Level System**: Users gain XP and level up based on eco-friendly spending habits, with rewards tied to their progress.
- **Real-Time Transaction Updates**: WebSocket integration ensures live updates of transactions and sustainability scores.
- **Company Analysis**: Users can view detailed sustainability data for companies they transact with, including their EIS breakdown.
- **Rewards System**: Provides discounts and benefits from eco-friendly companies based on the user's green level.
- **Admin Management**: Admins can manage discounts and monitor transaction activity.

---

## Tech Stack

### Backend:

- **Node.js**: Handles API logic and server-side functionality.
- **Express.js**: Framework for building RESTful APIs.
- **MongoDB**: NoSQL database for storing user, company, and transaction data.
- **Mongoose**: ODM for MongoDB.
- **WebSocket (ws)**: Enables real-time updates for transactions and account data.

### Frontend:

- **HTML/CSS (TailwindCSS)**: Responsive UI design.
- **JavaScript**: Handles client-side functionality, including dynamic rendering and API communication.

---

Thanks for sharing the project structure! Based on the actual structure, here’s an updated project structure section for the `README.md`:

---

## Project Structure

```
📂 GREEN-BANKING-APP-TEAM-7
├── 📁 backend               # Backend-related files
│   ├── 📂 config            # Configuration files (e.g., MongoDB connection)
│   ├── 📂 middleware        # Middleware for Express.js
│   ├── 📂 routes            # API routes (e.g., companies, transactions, discounts)
│   ├── 📂 tests             # Test files for backend functionality (Jest)
│   ├── server.js            # Main backend server entry point
│   ├── websocket.js         # WebSocket setup and notification logic
│   ├── package.json         # Backend dependencies
│   └── .env                 # Environment variables
├── 📁 frontend              # Frontend-related files
│   ├── 📂 public            # Public assets
│   │   ├── 📂 images        # Static images
│   │   ├── 📂 scripts       # Client-side JavaScript files
│   │   ├── 📂 test_htmls    # html/.js files for testing functions
│   │   ├── admin.html       # Admin page
│   │   ├── analysis.html    # Analysis page
│   │   ├── confirmation.html # Payment confirmation page
│   │   ├── home.html        # Main user dashboard
│   │   ├── index.html       # Landing page
│   │   ├── login.html       # Login page
│   │   ├── payment.html     # Payment processing page
│   │   ├── rewards.html     # Rewards overview page
│   │   ├── signup.html      # Signup page
│   │   ├── styles.css       # Main stylesheet
│   │   └── output.css       # Compiled TailwindCSS
│   ├── frontend-server.js   # Frontend node server
│   ├── package.json         # Frontend dependencies
│   └── tailwind.config.js   # TailwindCSS configuration
├── README.md                # Project documentation
└── .gitignore               # Files and folders ignored by Git
```

---

## Key Functionality

1. **Environmental Impact Score (EIS)**:

   - Combines factors such as Carbon Emissions, Waste Management, and Sustainability Practices.
   - Companies are rated on a scale, and user transactions with greener companies result in XP gains.

2. **Real-Time Updates**:

   - WebSocket integration allows for live updates of user account balances and streaks.

3. **Leveling System**:

   - Users gain XP and unlock new levels by maintaining eco-friendly spending habits.
   - Rewards like discounts from green companies are provided.

4. **Admin Features**:
   - Admins can add or remove discounts and view company sustainability data.

---

## Installation and Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/green-banking-app.git
   cd green-banking-app
   ```

2. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Install frontend dependencies:

   ```bash
   cd ../frontend
   npm install
   ```

4. Create a `.env` file in the `backend` folder with the following variables:

   ```
   PORT=5000
   MONGO_URI=<your_mongodb_connection_string>
   ```

5. Start the backend server:

   ```bash
   cd backend
   npm start
   ```

6. Serve the frontend:
   ```bash
   cd ../frontend
   npm run start
   ```

---

## About the Project

This project was developed as part of a university project in collaboration with **Barclays** representatives, who provided feedback and evolving requirements throughout the process.

After the initial completion, the project was revisited and updated by **Finnbar Home**, with several enhancements:

- Splitting the backend and frontend into separate components for better scalability and maintainability.
- Additional restructuring and refactoring to improve code readability and efficiency.
