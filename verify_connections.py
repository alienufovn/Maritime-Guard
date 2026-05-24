import sys
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure

# URI 1: SQL Data Lake / Mflix Cluster
URI_1 = "mongodb://atlas-sql-6a11518a0bf800d38b7169e9-fxlxvy.g.query.mongodb.net/sample_mflix?ssl=true&authSource=admin"

# URI 2: Federated Database Instance
URI_2 = "mongodb://alienufovn:FX5Cav8KLsnieY0X@federateddatabaseinstance0-fxlxvy.g.query.mongodb.net/?ssl=true&authSource=admin&appName=FederatedDatabaseInstance0"

def test_uri_1():
    print("=" * 60)
    print("Testing Connection to URI 1 (SQL Data Lake / Mflix)...")
    try:
        # We specify a timeout so it doesn't hang indefinitely if connection fails
        client = MongoClient(URI_1, serverSelectionTimeoutMS=5000)
        
        # Test connection by listing database names or getting collections
        db = client.get_database() # default db is sample_mflix
        print(f"Successfully connected to URI 1!")
        print(f"Current Database: {db.name}")
        
        # List collections
        collections = db.list_collection_names()
        print(f"Available Collections in '{db.name}':")
        for col in collections[:10]: # Show up to 10 collections
            print(f" - {col}")
        if not collections:
            print(" - (No collections found or access restricted)")
            
    except ConnectionFailure as ce:
        print(f"Connection Failure to URI 1: {ce}", file=sys.stderr)
    except OperationFailure as oe:
        print(f"Operation/Authentication Failure on URI 1: {oe}", file=sys.stderr)
    except Exception as e:
        print(f"Unexpected Error on URI 1: {e}", file=sys.stderr)

def test_uri_2():
    print("=" * 60)
    print("Testing Connection to URI 2 (Federated Database Instance)...")
    try:
        client = MongoClient(URI_2, serverSelectionTimeoutMS=5000)
        
        # Perform server ping
        client.admin.command('ping')
        print("Successfully pinged URI 2!")
        
        # List databases to verify access rights
        dbs = client.list_database_names()
        print("Available Databases:")
        for db_name in dbs:
            print(f" - {db_name}")
            
    except ConnectionFailure as ce:
        print(f"Connection Failure to URI 2: {ce}", file=sys.stderr)
    except OperationFailure as oe:
        print(f"Operation/Authentication Failure on URI 2: {oe}", file=sys.stderr)
    except Exception as e:
        print(f"Unexpected Error on URI 2: {e}", file=sys.stderr)

if __name__ == "__main__":
    print("Starting MongoDB Atlas Connection Integrity Checks...")
    test_uri_1()
    test_uri_2()
    print("=" * 60)
