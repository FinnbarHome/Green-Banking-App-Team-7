from flask import Blueprint, request, jsonify
from flask_pymongo import PyMongo
from bson.json_util import dumps

api = Blueprint('api', __name__)
mongo = PyMongo()

def handle_error(error):
    print(error)
    return jsonify({"error": str(error)}), 500

@api.route("/companies", methods=["GET"])
def get_companies():
    try:
        companies = mongo.db.Companies.find()
        return dumps(companies), 200
    except Exception as error:
        return handle_error(error)

@api.route("/companies/<int:account_number>", methods=["GET"])
def get_company(account_number):
    try:
        company = mongo.db.Companies.find_one({"Account Number": account_number})
        if not company:
            return jsonify({"error": "Company not found"}), 404
        return dumps(company), 200
    except Exception as error:
        return handle_error(error)

@api.route("/companies", methods=["POST"])
def add_company():
    try:
        data = request.json
        account_number = data.get("Account Number")
        company_name = data.get("Company Name")

        existing_account = mongo.db.Companies.find_one({"Account Number": account_number})
        if existing_account:
            return jsonify({"error": "A company with the same Account Number already exists"}), 400

        existing_company = mongo.db.Companies.find_one({"Company Name": company_name})
        if existing_company:
            return jsonify({"warning": "A company with the same name already exists"}), 400

        new_company = mongo.db.Companies.insert_one(data)
        return jsonify({"inserted_id": str(new_company.inserted_id)}), 201
    except Exception as error:
        return handle_error(error)

@api.route("/companies/add-balance", methods=["PUT"])
def add_balance_to_companies():
    try:
        balance = request.json.get("Balance")
        if balance is None:
            return jsonify({"error": "Balance field is required"}), 400

        result = mongo.db.Companies.update_many({}, {"$set": {"Balance": balance}})
        return jsonify({"msg": f"Balance field added to {result.matched_count} companies"}), 200
    except Exception as error:
        return handle_error(error)

@api.route("/companies/add-xp", methods=["PUT"])
def add_xp_to_companies():
    try:
        xp = request.json.get("XP")
        if xp is None or not isinstance(xp, int):
            return jsonify({"error": "A valid XP field is required"}), 400

        result = mongo.db.Companies.update_many({}, {"$set": {"XP": xp}})
        return jsonify({"msg": f"XP field added to {result.matched_count} companies"}), 200
    except Exception as error:
        return handle_error(error)

@api.route("/companies/update-balance/<int:account_number>", methods=["PUT"])
def update_company_balance(account_number):
    try:
        amount = request.json.get("amount")
        if amount is None or not isinstance(amount, (int, float)):
            return jsonify({"error": "A valid amount is required to update the balance"}), 400

        result = mongo.db.Companies.update_one(
            {"Account Number": account_number},
            {"$inc": {"Balance": amount}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Company not found"}), 404

        updated_company = mongo.db.Companies.find_one({"Account Number": account_number})
        return dumps(updated_company), 200
    except Exception as error:
        return handle_error(error)

@api.route("/companies/update-xp/<int:account_number>", methods=["PUT"])
def update_company_xp(account_number):
    try:
        xp_amount = request.json.get("xpAmount")
        if xp_amount is None or not isinstance(xp_amount, int):
            return jsonify({"error": "A valid xpAmount is required to update the XP"}), 400

        result = mongo.db.Companies.update_one(
            {"Account Number": account_number},
            {"$inc": {"XP": xp_amount}}
        )

        if result.matched_count == 0:
            return jsonify({"error": "Company not found"}), 404

        updated_company = mongo.db.Companies.find_one({"Account Number": account_number})
        return dumps(updated_company), 200
    except Exception as error:
        return handle_error(error)