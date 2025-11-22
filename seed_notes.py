from pymongo import MongoClient
from bson.objectid import ObjectId
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import random

# Load environment variables
load_dotenv(dotenv_path='./backend/.env')

# Configuration
CONNECTION_STRING = os.getenv("CONNECTION_STRING") or "mongodb+srv://notenest-admin:notenest-admin@notenest-cluster.qfguqkn.mongodb.net/?retryWrites=true&w=majority"
USER_ID = "test_user"

# Sample Notes Data mapped to Category Names
sample_data = {
    "Finance": [
        "Pay the electricity bill by Friday ($120)",
        "Cancel the unused streaming subscription",
        "Review monthly budget and savings goals for December"
    ],
    "Health": [
        "Morning yoga routine: 15 mins stretching",
        "Buy vitamins and protein powder",
        "Schedule annual dental check-up"
    ],
    "Travel": [
        "Pack passport, charger, and travel adapter",
        "Look up top-rated restaurants in Tokyo",
        "Book train tickets from Kyoto to Osaka"
    ],
    "Learning": [
        "Finish Chapter 4 of 'Designing Data-Intensive Applications'",
        "Watch tutorial on React Server Components",
        "Practice Spanish vocabulary on Duolingo"
    ],
    "To-Do": [
        "Pick up dry cleaning",
        "Water the plants in the living room",
        "Reply to emails from the project manager"
    ],
    "Project X": [
        "Brainstorm UI layout for the new landing page",
        "Research competitors in the AI space",
        "Draft the initial pitch deck"
    ],
    "Meetings": [
        "Weekly sync with the engineering team at 10 AM",
        "Client feedback session notes: Focus on mobile responsiveness",
        "Prepare agenda for the quarterly review"
    ]
}

def seed_notes():
    try:
        client = MongoClient(CONNECTION_STRING)
        db = client['NoteNestDB']
        notes_col = db['notes']
        cats_col = db['categories']
        
        print(f"🔌 Connected to {db.name}...")

        # --- CLEAN SLATE: WIPE OLD NOTES ---
        # Delete all notes for this user before adding new ones
        delete_result = notes_col.delete_many({"user_id": USER_ID})
        print(f"🧹 Wiped {delete_result.deleted_count} existing notes for user '{USER_ID}'.")
        # -----------------------------------

        added_count = 0
        
        for cat_name, note_texts in sample_data.items():
            # 1. Find the Category ID
            category = cats_col.find_one({"user_id": USER_ID, "name": cat_name})
            
            if not category:
                print(f"⚠️ Skipping '{cat_name}': Category not found in DB.")
                continue
                
            cat_id = category['_id']

            # 2. Create Notes for this Category
            for content in note_texts:
                # Create slight time variations for sorting
                time_offset = random.randint(0, 10000) 
                note_time = datetime.now() - timedelta(minutes=time_offset)

                note_doc = {
                    "user_id": USER_ID,
                    "category_id": cat_id,
                    "content": content,
                    "tags": ["Seeded"], # Tag to identify generated notes
                    "created_at": note_time,
                    "updated_at": note_time,
                    "archived": False,
                    "is_reminder": False,
                    "llm_ref": "manual-seed"
                }
                
                notes_col.insert_one(note_doc)
                added_count += 1
            
            print(f"✅ Added {len(note_texts)} notes to '{cat_name}'")

        print(f"\n🎉 Success! Added {added_count} total notes.")

    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    seed_notes()