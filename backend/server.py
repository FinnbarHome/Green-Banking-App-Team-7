import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_pymongo import PyMongo
from dotenv import load_dotenv
from api import api

load_dotenv()

app = Flask(__name__)
CORS(app)

# Validate required environment variables
required_env_vars = ['PORT', 'MONGO_URI']
for key in required_env_vars:
    if not os.getenv(key):
        print(f"ERROR: {key} not specified in .env")
        exit(1)

# Configure MongoDB
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
mongo = PyMongo(app)

# Register API routes
app.register_blueprint(api, url_prefix='/api')

# Root endpoint for basic health check
@app.route('/')
def hello_world():
    return "Hello World!"

# 404 Error Handler for non-existent routes
@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Resource not found"}), 404

# Generic Error Handler for all uncaught errors
@app.errorhandler(Exception)
def handle_exception(error):
    print("ERROR:", str(error))
    return jsonify({"error": "Internal Server Error"}), 500

if __name__ == "__main__":
    port = int(os.getenv("PORT", 3000))
    app.run(host="0.0.0.0", port=port, debug=True)