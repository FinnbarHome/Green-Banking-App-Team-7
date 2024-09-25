import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

def connect_db():
    try:
        # Get the MongoDB URI from environment variables
        uri = os.getenv('MONGO_URI')
        
        # Create a new client and connect to the server
        client = MongoClient(uri)
        
        # Send a ping to confirm a successful connection
        client.admin.command('ping')
        print("Connected to the database")
        
        # Return the database object
        return client.get_database()
    except Exception as e:
        print("Connection error:", str(e))
        exit(1)

# Usage
if __name__ == "__main__":
    db = connect_db()
    # Now you can use 'db' to interact with your database