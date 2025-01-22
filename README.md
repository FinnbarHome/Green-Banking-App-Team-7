Here's the updated **README.md** with a clearer introduction highlighting that the project was later enhanced by Finnbar Home:

---

# Green Banking App 🌱

This project is a **Green Banking Application** originally developed as part of a university project in collaboration with **Barclays** representatives. The app assigns sustainability scores based on users' transactions with companies, encouraging eco-friendly financial decisions by providing detailed insights and rewards for environmentally conscious spending.

After the initial completion, the project was **overtaken and further enhanced by Finnbar**, who introduced significant improvements to the deployment, scalability, and maintainability of the application. These enhancements included containerizing the app using Docker, deploying it on Kubernetes using Helm, and optimizing its architecture for modern cloud-native environments.

---

## Key Updates (Finnbar)

- **Transition to Docker & Kubernetes**: Containerized both the frontend and backend for seamless deployment and scalability.
- **Helm Integration**: Parameterized the deployment for flexibility and better resource management.
- **Ingress Controller Setup**: Simplified access and load balancing with an ingress setup on Kubernetes.
- **Enhanced Scalability**: Modularized the frontend and backend, enabling independent scaling and management.
- **Improved Deployment Workflow**: Introduced a more streamlined and cloud-friendly deployment process using Minikube for local development.

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

### Deployment Tools:
- **Docker**: Containerization for both frontend and backend.
- **Kubernetes**: Orchestrates containers and manages deployments.
- **Helm**: Simplifies and parameterizes Kubernetes deployments.
- **Minikube**: Local Kubernetes cluster for development.

---

## Deployment Enhancements (Helm & Kubernetes)

The updated deployment strategy includes:
- **Minikube for Local Development**: Simplifies local Kubernetes cluster setup.
- **Helm Charts**: Parameterized deployments for the frontend, backend, and ingress, enabling easy configuration and scaling.
- **Ingress Controller**: Allows accessing the app via a single domain and enables load balancing between pods.
- **Dockerized Services**: Frontend and backend are containerized for seamless deployment.

---

## Project Structure

```
📂 GREEN-BANKING-APP
├── 📁 backend               # Backend-related files
│   ├── 📂 config            # Configuration files (e.g., MongoDB connection)
│   ├── 📂 middleware        # Middleware for Express.js
│   ├── 📂 routes            # API routes (e.g., companies, transactions, discounts)
│   ├── 📂 tests             # Test files for backend functionality (Jest)
│   ├── server.js            # Main backend server entry point
│   ├── websocket.js         # WebSocket setup and notification logic
│   ├── Dockerfile           # Dockerfile for backend containerization
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
│   ├── Dockerfile           # Dockerfile for frontend containerization
│   ├── package.json         # Frontend dependencies
│   └── tailwind.config.js   # TailwindCSS configuration
├── 📁 helm-chart            # Helm chart for Kubernetes deployment
│   ├── 📂 templates         # Kubernetes manifests (Ingress, Deployments, Services)
│   ├── values.yaml          # Helm chart configuration values
│   ├── Chart.yaml           # Helm chart metadata
│   └── README.md            # Instructions for using the Helm chart
├── README.md                # Project documentation
└── .gitignore               # Files and folders ignored by Git
```

---

## Deployment Instructions

### Prerequisites
- **Minikube** installed
- **Helm** installed.
- **Docker** installed.

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/green-banking-app.git
   cd green-banking-app
   ```

2. **Build Docker Images**:
   Configure Docker to use Minikube:
   ```bash
   eval $(minikube docker-env)
   ```
   Build images for frontend and backend:
   ```bash
   docker build -t frontend:v1 -f ./frontend/Dockerfile ./frontend
   docker build -t backend:v1 -f ./backend/Dockerfile ./backend
   ```

3. **Enable Ingress in Minikube**:
   ```bash
   minikube addons enable ingress
   ```

4. **Deploy Using Helm**:
   Navigate to the Helm chart directory and install the app:
   ```bash
   cd helm-chart
   helm install green-banking .
   ```

5. **Access the Application**:
   - Find the Minikube IP:
     ```bash
     minikube ip
     ```
   - Add the following entry to your `/etc/hosts` (replace `<minikube-ip>` with the IP):
     ```
     <minikube-ip> my-app.local
     ```
   - Access the application:
     - Frontend: `http://my-app.local/frontend`
     - Backend: `http://my-app.local/backend`
