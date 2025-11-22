import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Body, status, Query
from fastapi.middleware.cors import CORSMiddleware
from bson.objectid import ObjectId
import datetime
from openai import OpenAI # Import OpenAI

# Internal imports
from database import Notes, Categories, serialize_doc, get_analytics_data, get_or_create_uncategorized_id
from models import NoteIn, NoteOut, NoteUpdate, CategoryIn, CategoryOut, CategoryUpdate, SmartNoteIn
from typing import List, Dict, Any

# --- Load Environment Variables ---
load_dotenv() # This loads the .env file
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Initialize OpenAI Client
client = OpenAI(api_key=OPENAI_API_KEY)

app = FastAPI(title="NoteNest API", version="2.1.0")

# --- CORS Configuration ---
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==============================================================================
# --- 🤖 REAL AI / SMART FEATURES ---
# ==============================================================================

def classify_with_openai(content: str, categories: List[str]) -> str:
    """
    Calls OpenAI GPT-4o-mini to categorize the note.
    """
    if not OPENAI_API_KEY:
        print("⚠️ No API Key found. Falling back to 'Uncategorized'.")
        return "Uncategorized"

    # Construct the prompt
    prompt = f"""
    You are a helpful assistant for a note-taking app.
    
    Task: Categorize the following note content into EXACTLY one of these categories: {', '.join(categories)}.
    
    Rules:
    1. Return ONLY the category name. No other text.
    2. If the note doesn't fit any category well, return 'Uncategorized'.
    
    Note Content: "{content}"
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a precise classification engine."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3, # Low temperature for consistent results
            max_tokens=10
        )
        
        predicted_category = response.choices[0].message.content.strip()
        
        # Safety check: Ensure the AI returned a valid category name
        clean_categories = [c.lower() for c in categories]
        if predicted_category.lower() in clean_categories:
            # Match the casing from the original list
            index = clean_categories.index(predicted_category.lower())
            return categories[index]
            
        return "Uncategorized"

    except Exception as e:
        print(f"❌ OpenAI API Error: {e}")
        return "Uncategorized"

@app.post("/smart-notes/", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
async def create_smart_note(smart_note: SmartNoteIn):
    """AI-Powered Note Creation: Uses OpenAI to categorize."""
    
    # 1. Fetch user's categories to give context to the LLM
    user_categories = list(Categories.find({"user_id": smart_note.user_id}))
    category_names = [cat['name'] for cat in user_categories]
    
    if not category_names:
        # If no categories exist, force Uncategorized (save API cost)
        predicted_name = "Uncategorized"
    else:
        # 2. REAL AI Classification
        predicted_name = classify_with_openai(smart_note.content, category_names)
    
    # 3. Resolve Category ID
    target_category = next((cat for cat in user_categories if cat['name'] == predicted_name), None)
    
    if target_category:
        target_id = target_category['_id']
    else:
        target_id = get_or_create_uncategorized_id(smart_note.user_id)

    # 4. Construct Note
    new_note = {
        "user_id": smart_note.user_id,
        "category_id": target_id,
        "content": smart_note.content,
        "tags": ["AI-Categorized"],
        "created_at": datetime.datetime.now(),
        "updated_at": datetime.datetime.now(),
        "archived": False,
        "is_reminder": ("deadline" in smart_note.content.lower() or "remind" in smart_note.content.lower()),
        "llm_ref": "gpt-4o-mini" # Updated ref
    }
    
    result = Notes.insert_one(new_note)
    created_note = Notes.find_one({"_id": result.inserted_id})
    return serialize_doc(created_note)

# ==============================================================================
# --- 📝 NOTE CRUD ---
# ==============================================================================

@app.post("/notes/", response_model=NoteOut, status_code=status.HTTP_201_CREATED)
async def create_note(note: NoteIn):
    """Manual note creation."""
    try:
        category_obj_id = ObjectId(note.category_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Category ID format.")

    # Validate Category Exists
    if not Categories.find_one({"_id": category_obj_id}):
         raise HTTPException(status_code=404, detail="Category not found.")

    new_note = note.dict()
    new_note['category_id'] = category_obj_id
    
    # Audit Fields
    new_note['created_at'] = datetime.datetime.now()
    new_note['updated_at'] = datetime.datetime.now()
    new_note['archived'] = False
    new_note['is_reminder'] = False
    
    result = Notes.insert_one(new_note)
    created_note = Notes.find_one({"_id": result.inserted_id})
    return serialize_doc(created_note)

@app.get("/notes/{user_id}", response_model=List[NoteOut])
async def get_notes_by_user(
    user_id: str, 
    archived: bool = Query(False, description="Filter active vs archived notes")
):
    """Fetch notes. Defaults to Active (archived=False)."""
    notes_cursor = Notes.find({"user_id": user_id, "archived": archived}).sort("updated_at", -1)
    return [serialize_doc(note) for note in notes_cursor]

@app.put("/notes/{note_id}", response_model=NoteOut)
async def update_note(note_id: str, update_data: NoteUpdate):
    """Update content, tags, or category."""
    try:
        note_obj_id = ObjectId(note_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Note ID.")

    # Filter out None values
    update_fields = update_data.dict(exclude_none=True)
    
    if 'category_id' in update_fields:
        try:
            update_fields['category_id'] = ObjectId(update_fields['category_id'])
        except:
             raise HTTPException(status_code=400, detail="Invalid Category ID.")

    # Audit: Update timestamp
    update_fields['updated_at'] = datetime.datetime.now()

    result = Notes.update_one({"_id": note_obj_id}, {"$set": update_fields})

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Note not found.")
        
    updated_note = Notes.find_one({"_id": note_obj_id})
    return serialize_doc(updated_note)

@app.put("/notes/{note_id}/archive", response_model=NoteOut)
async def archive_note(note_id: str, user_id: str = Query(None)):
    """Soft Delete (Archive). Accepts user_id query param to match frontend API."""
    try:
        note_obj_id = ObjectId(note_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Note ID.")
    
    query = {"_id": note_obj_id}
    if user_id:
        query["user_id"] = user_id

    result = Notes.update_one(
        query,
        {"$set": {"archived": True, "updated_at": datetime.datetime.now()}}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Note not found.")
        
    updated_note = Notes.find_one({"_id": note_obj_id})
    return serialize_doc(updated_note)

@app.delete("/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_note(note_id: str):
    """Hard Delete: Permanently remove note."""
    try:
        note_obj_id = ObjectId(note_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Note ID.")

    result = Notes.delete_one({"_id": note_obj_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Note not found.")
    return

# ==============================================================================
# --- 📂 CATEGORY CRUD ---
# ==============================================================================

@app.post("/categories/", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
async def create_category(category: CategoryIn):
    if Categories.find_one({"user_id": category.user_id, "name": category.name}):
        raise HTTPException(status_code=400, detail="Category name exists.")

    result = Categories.insert_one(category.dict())
    return serialize_doc(Categories.find_one({"_id": result.inserted_id}))

@app.get("/categories/{user_id}", response_model=List[CategoryOut])
async def get_categories(user_id: str):
    cursor = Categories.find({"user_id": user_id}).sort("name", 1)
    return [serialize_doc(cat) for cat in cursor]

@app.put("/categories/{category_id}", response_model=CategoryOut)
async def update_category(category_id: str, update_data: CategoryUpdate):
    try:
        cat_id = ObjectId(category_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID.")
    
    fields = update_data.dict(exclude_none=True)
    result = Categories.update_one({"_id": cat_id}, {"$set": fields})
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Category not found.")
        
    return serialize_doc(Categories.find_one({"_id": cat_id}))

@app.delete("/categories/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(category_id: str, user_id: str = Query(...)):
    try:
        cat_id = ObjectId(category_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid ID.")

    if Notes.count_documents({"category_id": cat_id}) > 0:
        uncat_id = get_or_create_uncategorized_id(user_id)
        Notes.update_many(
            {"category_id": cat_id},
            {"$set": {"category_id": uncat_id, "updated_at": datetime.datetime.now()}}
        )

    result = Categories.delete_one({"_id": cat_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Category not found.")
    return

# ==============================================================================
# --- 📊 ANALYTICS ---
# ==============================================================================

@app.get("/analytics/{user_id}", response_model=List[Dict[str, Any]])
async def get_analytics(user_id: str):
    return get_analytics_data(user_id)