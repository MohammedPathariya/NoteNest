# main.py

from fastapi import FastAPI, HTTPException, Body, status
from fastapi.middleware.cors import CORSMiddleware
from bson.objectid import ObjectId
from database import Notes, Categories, serialize_doc, get_analytics_data # Import helpers
from models import NoteIn, NoteOut, NoteUpdate
from typing import List, Dict, Any
import datetime

app = FastAPI()

# --- CORS Configuration (Necessary for React Frontend) ---
origins = [
    "http://localhost:3000",  # Default React development port
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- END CORS ---

# ==============================================================================
# 1. CREATE Operation (POST)
# ==============================================================================

@app.post("/notes/", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
async def create_note(note: NoteIn):
    # Convert the string category_id from the frontend into an ObjectId
    try:
        category_obj_id = ObjectId(note.category_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Category ID format.")

    # Check if the category exists (enforcing your required constraint)
    if Categories.find_one({"_id": category_obj_id}) is None:
         raise HTTPException(status_code=404, detail="Category not found.")

    new_note = note.dict()
    new_note['category_id'] = category_obj_id
    new_note['created_at'] = datetime.datetime.now()
    
    result = Notes.insert_one(new_note)
    created_note = Notes.find_one({"_id": result.inserted_id})
    
    return serialize_doc(created_note)


# ==============================================================================
# 2. READ Operation (GET) - Fetch all notes
# ==============================================================================

@app.get("/notes/{user_id}", response_model=List[NoteOut])
async def get_notes_by_user(user_id: str):
    # Read notes for the user, sorted by newest first
    notes_cursor = Notes.find({"user_id": user_id}).sort("created_at", -1)
    
    notes_list = [serialize_doc(note) for note in notes_cursor]
    
    if not notes_list:
        # We return 200 with an empty list instead of 404 if no notes are found
        return [] 
        
    return notes_list

# ==============================================================================
# 3. UPDATE Operation (PUT) - Edit note content/tags
# ==============================================================================

@app.put("/notes/{note_id}", response_model=NoteOut)
async def update_note(note_id: str, update_data: NoteUpdate):
    try:
        note_obj_id = ObjectId(note_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Note ID format.")

    # Prepare fields to update (only set non-None fields)
    update_fields = {k: v for k, v in update_data.dict(exclude_none=True).items()}
    
    if 'category_id' in update_fields:
        # Convert category_id string to ObjectId if it's being updated
        update_fields['category_id'] = ObjectId(update_fields['category_id'])

    # Update the document
    result = Notes.update_one(
        {"_id": note_obj_id},
        {"$set": update_fields}
    )

    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Note not found or no changes made.")
        
    updated_note = Notes.find_one({"_id": note_obj_id})
    return serialize_doc(updated_note)


# ==============================================================================
# 4. DELETE Operation (DELETE) - Delete a note
# ==============================================================================

@app.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(note_id: str):
    try:
        note_obj_id = ObjectId(note_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Note ID format.")

    result = Notes.delete_one({"_id": note_obj_id})

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found.")
        
    # Return 204 No Content for successful deletion
    return {"message": "Note deleted successfully"}

# ==============================================================================
# 5. ANALYTICS Operation (GET) - Visualization Data
# ==============================================================================

@app.get("/analytics/{user_id}", response_model=List[Dict[str, Any]])
async def get_analytics(user_id: str):
    # Use the helper function from database.py to run the aggregation pipeline
    analytics_data = get_analytics_data(user_id)
    
    if not analytics_data:
        # Return an empty list if no data is found for charts
        return []
        
    return analytics_data

# NOTE: You should also add simple CRUD endpoints for the 'categories' collection!