# database.py

from pymongo import MongoClient
from bson.objectid import ObjectId
from typing import List, Dict, Any

# NOTE: REPLACE THE CONNECTION STRING with your actual password
CONNECTION_STRING = "mongodb+srv://notenest-admin:notenest-admin@notenest-cluster.qfguqkn.mongodb.net/?retryWrites=true&w=majority"

# --- Database Setup ---
try:
    client = MongoClient(CONNECTION_STRING)
    db = client['NoteNestDB']
    db.client.admin.command('ping')
    
    Notes = db['notes']
    Categories = db['categories']
    print("Database connection successful.")
except Exception as e:
    print(f"ERROR: Could not connect to MongoDB: {e}")
    # In a real app, you would log and exit. For development, we continue.
    raise

# --- Helper Functions ---

# Helper to convert MongoDB ObjectId to a string for JSON serialization
def serialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    if doc:
        # FastAPI's response model handles this implicitly, but explicitly
        # converting the '_id' makes it safer.
        doc['_id'] = str(doc['_id'])
        if 'category_id' in doc:
             doc['category_id'] = str(doc['category_id'])
        return doc
    return None

# Helper to execute the analytical pipeline
def get_analytics_data(user_id: str) -> List[Dict[str, Any]]:
    # This is the exact aggregation pipeline from your Milestone 2 report
    pipeline = [
        {
            '$match': { 'user_id': user_id }
        },
        {
            '$group': {
                '_id': '$category_id',
                'note_count': { '$sum': 1 }
            }
        },
        {
            '$lookup': {
                'from': 'categories',
                'localField': '_id',
                'foreignField': '_id',
                'as': 'category_details'
            }
        },
        {
            '$unwind': '$category_details'
        },
        {
            '$project': {
                'category_name': '$category_details.name',
                'note_count': 1,
                '_id': 0
            }
        }
    ]
    
    return list(Notes.aggregate(pipeline))