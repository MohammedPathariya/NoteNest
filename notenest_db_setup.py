# ==============================================================================
# Final Project Milestone 2: Database Creation & Queries
# Project: NoteNest
# Team: Aditya Pise, Mohammed Pathariya, Nileet Savale
# File: milestone2_script.py
#
# This script is fully reproducible and contains all DDL (setup) and
# DML (CRUD + Analytics) operations required for the submission.
# ==============================================================================

# --- (A) Setup & Connection ---
# (Credit: Team)
from pymongo import MongoClient
from bson.objectid import ObjectId  # For working with _id
import datetime

# (Credit: Team)
# !!! --- PASTE YOUR MONGODB ATLAS CONNECTION STRING HERE --- !!!
# Remember to replace <password> with your actual password
CONNECTION_STRING = "mongodb+srv://notenest-admin:notenest-admin@notenest-cluster.qfguqkn.mongodb.net/?retryWrites=true&w=majority"

# (Credit: Team)
# Connect to MongoDB
try:
    client = MongoClient(CONNECTION_STRING)
    db = client['NoteNestDB'] # Our database
    # Ping to test connection
    client.admin.command('ping')
    print("✅ Connection to MongoDB successful.")
except Exception as e:
    print(f"❌ Connection failed: {e}")
    exit()

# (Credit: Team)
# Get (or create) our collections
notes_collection = db['notes']
categories_collection = db['categories']

# --- (B) DDL: Database, Collection & Index Creation (20 pts) ---
# In MongoDB, the DB and Collections are created on first insert.
# The most important setup step is creating INDEXES for fast queries.

print("\n--- (B) DDL: Creating Indexes ---")
try:
    # (Credit: Mohammed Pathariya)
    # Index for finding notes by user
    notes_collection.create_index([("user_id", 1)])
    # (Credit: Nileet Savale)
    # Index for finding notes by category
    notes_collection.create_index([("category_id", 1)])
    # (Credit: Aditya Pise)
    # Index for finding categories by user
    categories_collection.create_index([("user_id", 1)])
    print("✅ Indexes created (or already exist).")
except Exception as e:
    print(f"❌ Index creation failed: {e}")


# --- (C) DML: Initial Data Insertion (Part of 20 pts) ---
print("\n--- (C) DML: Inserting Initial Data ---")
# First, let's clear old data for a clean run
# (Credit: Team)
notes_collection.delete_many({})
categories_collection.delete_many({})
print("🧹 Cleaned old data.")

# (Credit: Team)
# We will simulate 3 users for our data
user_1_id = "user_aditya@iu.edu" # Simulating string IDs for simplicity
user_2_id = "user_mohammed@iu.edu"
user_3_id = "user_nileet@iu.edu"

try:
    # (Credit: Nileet Savale)
    # Create categories
    category_list = [
        {"user_id": user_1_id, "name": "Work", "description": "Notes for my job"},
        {"user_id": user_1_id, "name": "Projects", "description": "LLM project tasks"},
        {"user_id": user_2_id, "name": "Grocery List", "description": ""},
        {"user_id": user_2_id, "name": "Class Notes", "description": "DB class notes"}
    ]
    categories_collection.insert_many(category_list)
    print("✅ Inserted initial categories.")

    # Get the _id of the new categories to link our notes
    cat_work_id = categories_collection.find_one({"name": "Work"})['_id']
    cat_class_id = categories_collection.find_one({"name": "Class Notes"})['_id']
    cat_grocery_id = categories_collection.find_one({"name": "Grocery List"})['_id']

    # (Credit: Aditya Pise)
    # Create notes
    note_list = [
        {
            "user_id": user_1_id,
            "category_id": cat_work_id,
            "content": "Meeting at 3 PM with the team.",
            "tags": ["meeting", "team"],
            "created_at": datetime.datetime(2025, 11, 1, 14, 0, 0) # Past date
        },
        {
            "user_id": user_2_id,
            "category_id": cat_class_id,
            "content": "Remember to submit Milestone 2 by Nov 9.",
            "tags": ["database", "homework", "deadline"],
            "created_at": datetime.datetime(2025, 11, 8, 10, 0, 0)
        },
        {
            "user_id": user_2_id,
            "category_id": cat_grocery_id,
            "content": "Milk, Eggs, Bread",
            "tags": ["shopping"],
            "created_at": datetime.datetime.now()
        }
    ]
    notes_collection.insert_many(note_list)
    print("✅ Inserted initial notes.")
except Exception as e:
    print(f"❌ Data insertion failed: {e}")


# --- (D) DML: CRUD Operations (20 pts) ---
print("\n--- (D) DML: CRUD Operations ---")

# 1. CREATE (Covered by section C, but here's a single insert)
# (Credit: Aditya Pise)
print("\n1. CREATE (Single Insert)")
new_note = {
    "user_id": user_3_id,
    "category_id": cat_work_id, # Re-using a category
    "content": "Final demo is on Week 6.",
    "tags": ["demo", "presentation"],
    "created_at": datetime.datetime.now()
}
inserted_id = notes_collection.insert_one(new_note).inserted_id
print(f"✅ Created new note with ID: {inserted_id}")

# 2. READ (Find all notes for a specific user)
# (Credit: Mohammed Pathariya)
print("\n2. READ (Find all notes for user_mohammed@iu.edu)")
user_2_notes = notes_collection.find({"user_id": "user_mohammed@iu.edu"})
for note in user_2_notes:
    print(f"  - [Note] {note['content']}")

# 3. UPDATE (Change the content of a note)
# (Credit: Mohammed Pathariya)
print("\n3. UPDATE (Fixing grocery list)")
note_to_update = notes_collection.find_one({"content": "Milk, Eggs, Bread"})
if note_to_update:
    update_id = note_to_update['_id']
    notes_collection.update_one(
        {"_id": update_id},
        {"$set": {"content": "Milk, Eggs, Bread, and Butter"}, "$push": {"tags": "dairy"}}
    )
    print("✅ Updated note.")
    updated_note = notes_collection.find_one({"_id": update_id})
    print(f"  - [New Content] {updated_note['content']}")
    print(f"  - [New Tags] {updated_note['tags']}")
else:
    print("❌ Note for update not found.")

# 4. DELETE (Delete a note)
# (Credit: Nileet Savale)
print("\n4. DELETE (Deleting the 'demo' note)")
note_to_delete = notes_collection.find_one({"content": "Final demo is on Week 6."})
if note_to_delete:
    delete_id = note_to_delete['_id']
    notes_collection.delete_one({"_id": delete_id})
    print(f"✅ Deleted note with ID: {delete_id}")
    # Verify deletion
    deleted_check = notes_collection.find_one({"_id": delete_id})
    print(f"  - [Verification (should be None)] {deleted_check}")
else:
    print("❌ Note for deletion not found.")


# --- (E) DML: Analytical Query (10 pts) ---
# This query is for our dashboard visualization.
print("\n--- (E) ANALYTICAL QUERY ---")
print("Goal: Count the number of notes per category for a specific user.")

# (Credit: Mohammed Pathariya)
# This is your key contribution from your team role
pipeline = [
    {
        # Match only notes from a specific user
        '$match': { 'user_id': 'user_mohammed@iu.edu' }
    },
    {
        # Group by category_id and count the notes
        '$group': {
            '_id': '$category_id',
            'note_count': { '$sum': 1 }
        }
    },
    {
        # Join with the 'categories' collection to get the category name
        '$lookup': {
            'from': 'categories',
            'localField': '_id',
            'foreignField': '_id',
            'as': 'category_details'
        }
    },
    {
        # 'Unwind' the category_details array (it will only have 1 item)
        '$unwind': '$category_details'
    },
    {
        # Project the final shape for our chart
        '$project': {
            'category_name': '$category_details.name',
            'note_count': 1,
            '_id': 0
        }
    }
]

# (Credit: Mohammed Pathariya)
# Execute the aggregation
analytics_results = list(notes_collection.aggregate(pipeline))
print("✅ Analytics query complete. Results:")
print(analytics_results)

# --- End of Script ---
print("\n--- Script execution finished. ---")