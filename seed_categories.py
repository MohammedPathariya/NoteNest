from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path='./backend/.env')

# Configuration
CONNECTION_STRING = os.getenv("CONNECTION_STRING") or "mongodb+srv://notenest-admin:notenest-admin@notenest-cluster.qfguqkn.mongodb.net/?retryWrites=true&w=majority"
USER_ID = "test_user"

# The Categories to Add
categories_to_add = [
    {
        "name": "Finance", 
        "description": "Budgeting, bills, investments, and expenses.", 
        "color_code": "#10B981" # Emerald Green
    },
    {
        "name": "Health", 
        "description": "Workouts, diet plans, medical records, and sleep tracking.", 
        "color_code": "#EF4444" # Red
    },
    {
        "name": "Travel", 
        "description": "Itineraries, packing lists, and dream destinations.", 
        "color_code": "#0EA5E9" # Sky Blue
    },
    {
        "name": "Learning", 
        "description": "Course notes, book summaries, and skills to master.", 
        "color_code": "#8B5CF6" # Violet
    },
    {
        "name": "To-Do", 
        "description": "Quick tasks, errands, and daily checklists.", 
        "color_code": "#F59E0B" # Amber
    },
    {
        "name": "Project X", 
        "description": "Secret project planning and brainstorming.", 
        "color_code": "#EC4899" # Pink
    },
    {
        "name": "Meetings", 
        "description": "Meeting minutes, agendas, and follow-ups.", 
        "color_code": "#6366F1" # Indigo
    }
]

def seed_database():
    try:
        client = MongoClient(CONNECTION_STRING)
        db = client['NoteNestDB']
        collection = db['categories']
        
        print(f"🔌 Connected to {db.name}...")

        # --- DANGER ZONE: WIPE OLD DATA ---
        # Delete all categories for this user before adding new ones
        delete_result = collection.delete_many({"user_id": USER_ID})
        print(f"🧹 Wiped {delete_result.deleted_count} existing categories for user '{USER_ID}'.")
        # ----------------------------------

        added_count = 0
        for cat in categories_to_add:
            cat_doc = {
                "user_id": USER_ID,
                "name": cat["name"],
                "description": cat["description"],
                "color_code": cat["color_code"]
            }
            collection.insert_one(cat_doc)
            print(f"✅ Added: {cat['name']}")
            added_count += 1

        print(f"\n🎉 Finished! Database reset with {added_count} new categories.")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    seed_database()