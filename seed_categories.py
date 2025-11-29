from pymongo import MongoClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv(dotenv_path='./backend/.env')

# Configuration
CONNECTION_STRING = os.getenv("CONNECTION_STRING") or "mongodb+srv://notenest-admin:notenest-admin@notenest-cluster.qfguqkn.mongodb.net/?retryWrites=true&w=majority"
USER_ID = "test_user"

# The Categories to Add (Updated with Tailwind Classes)
categories_to_add = [
    {
        "name": "Finance", 
        "description": "Budgeting, bills, investments, and expenses.", 
        "color_code": "bg-emerald-500"  # Was #10B981
    },
    {
        "name": "Health", 
        "description": "Workouts, diet plans, medical records, and sleep tracking.", 
        "color_code": "bg-rose-500"     # Was #EF4444
    },
    {
        "name": "Travel", 
        "description": "Itineraries, packing lists, and dream destinations.", 
        "color_code": "bg-blue-500"     # Was #0EA5E9
    },
    {
        "name": "Learning", 
        "description": "Course notes, book summaries, and skills to master.", 
        "color_code": "bg-purple-500"   # Was #8B5CF6
    },
    {
        "name": "To-Do", 
        "description": "Quick tasks, errands, and daily checklists.", 
        "color_code": "bg-amber-500"    # Was #F59E0B
    },
    {
        "name": "Project X", 
        "description": "Secret project planning and brainstorming.", 
        "color_code": "bg-pink-500"     # Was #EC4899
    },
    {
        "name": "Meetings", 
        "description": "Meeting minutes, agendas, and follow-ups.", 
        "color_code": "bg-teal-500"     # Was #6366F1
    }
]

def seed_database():
    try:
        client = MongoClient(CONNECTION_STRING)
        db = client['NoteNestDB']
        collection = db['categories']
        
        print(f"🔌 Connected to {db.name}...")

        # --- DANGER ZONE: WIPE OLD DATA ---
        # Delete all categories for this user so we can replace them with correct colors
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