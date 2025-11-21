# models.py

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson.objectid import ObjectId # CRITICAL FIX: Ensure ObjectId is defined

# --- Pydantic Models ---

# Base model for creating a note (Input)
class NoteIn(BaseModel):
    user_id: str
    category_id: str  # Frontend will send this as a string
    content: str = Field(..., max_length=1000)
    tags: List[str] = []

# Model for returning a note (Output/Response)
class NoteOut(BaseModel):
    id: str = Field(alias="_id") # Map database _id to frontend 'id'
    user_id: str
    category_id: str
    content: str
    tags: List[str]
    created_at: datetime
    
    # Configuration to handle MongoDB's ObjectId when serializing responses
    class Config:
        json_encoders = {ObjectId: str}
        # Required to allow responses to contain field names not defined in the model (like _id)
        allow_population_by_field_name = True

# Model for updating a note (Optional fields)
class NoteUpdate(BaseModel):
    content: Optional[str] = Field(None, max_length=1000)
    category_id: Optional[str] = None
    tags: Optional[List[str]] = None