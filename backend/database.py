# database.py

from pymongo import MongoClient
from bson.objectid import ObjectId
from typing import List, Dict, Any

# --- CONFIGURATION ---
CONNECTION_STRING = "mongodb+srv://notenest-admin:notenest-admin@notenest-cluster.qfguqkn.mongodb.net/?retryWrites=true&w=majority"

# --- Database Setup ---
try:
    client = MongoClient(CONNECTION_STRING)
    db = client['NoteNestDB']
    
    # Test connection
    db.client.admin.command('ping')
    
    Notes = db['notes']
    Categories = db['categories']
    print("✅ Database connection successful.")
except Exception as e:
    print(f"❌ ERROR: Could not connect to MongoDB: {e}")
    raise

# --- Helper Functions ---

def serialize_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    """Converts MongoDB ObjectId to string for JSON serialization."""
    if doc:
        doc['_id'] = str(doc['_id'])
        if 'category_id' in doc and isinstance(doc['category_id'], ObjectId):
             doc['category_id'] = str(doc['category_id'])
        return doc
    return None

def get_or_create_uncategorized_id(user_id: str) -> ObjectId:
    """Finds or creates the default 'Uncategorized' category for a user."""
    uncategorized_name = "Uncategorized"
    
    uncategorized_category = Categories.find_one({
        "user_id": user_id, 
        "name": uncategorized_name
    })

    if not uncategorized_category:
        category_data = {
            "user_id": user_id, 
            "name": uncategorized_name, 
            "description": "Notes that lost their original category or need review.",
            "color_code": "#808080" 
        }
        result = Categories.insert_one(category_data)
        return result.inserted_id
    
    return uncategorized_category['_id']

def get_analytics_data(user_id: str) -> List[Dict[str, Any]]:
    """Calculates note counts per category for the dashboard."""
    pipeline = [
        # Only count active (non-archived) notes
        {'$match': { 'user_id': user_id, 'archived': False }}, 
        {'$group': {'_id': '$category_id', 'note_count': { '$sum': 1 }}},
        {
            '$lookup': { 
                'from': 'categories',
                'localField': '_id',
                'foreignField': '_id',
                'as': 'category_details'
            }
        },
        {'$unwind': '$category_details'},
        {
            '$project': {
                'category_name': '$category_details.name',
                'color_code': '$category_details.color_code',
                'note_count': 1,
                '_id': 0
            }
        }
    ]
    return list(Notes.aggregate(pipeline))