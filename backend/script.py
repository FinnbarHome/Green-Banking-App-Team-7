import requests

BASE_URL = "http://localhost:3000/api"

def update_xp():
    account_number = input("Enter Account Number for XP update: ")
    xp_amount = input("Enter XP Amount: ")

    if not account_number or not xp_amount:
        print("Please enter both Account Number and XP Amount")
        return

    try:
        response = requests.put(
            f"{BASE_URL}/companies/update-xp/{account_number}",
            json={"xpAmount": int(xp_amount)}
        )
        response.raise_for_status()
        data = response.json()
        print(f"Updated XP: {data['XP']}")
    except requests.exceptions.RequestException as error:
        print(f"Error updating XP: {error}")

def update_balance():
    account_number = input("Enter Account Number for balance update: ")
    balance_amount = input("Enter Balance Amount: ")

    if not account_number or not balance_amount:
        print("Please enter both Account Number and Balance Amount")
        return

    try:
        response = requests.put(
            f"{BASE_URL}/companies/update-balance/{account_number}",
            json={"amount": int(balance_amount)}
        )
        response.raise_for_status()
        data = response.json()
        print(f"Updated Balance: {data['Balance']}")
    except requests.exceptions.RequestException as error:
        print(f"Error updating Balance: {error}")

if __name__ == "__main__":
    while True:
        print("\n1. Update XP")
        print("2. Update Balance")
        print("3. Exit")
        choice = input("Enter your choice (1-3): ")

        if choice == "1":
            update_xp()
        elif choice == "2":
            update_balance()
        elif choice == "3":
            break
        else:
            print("Invalid choice. Please try again.")