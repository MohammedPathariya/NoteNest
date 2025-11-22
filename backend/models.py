# models.py

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson.objectid import ObjectId

# --- Category Models ---
class CategoryIn(BaseModel):
    user_id: str
    name: str = Field(..., max_length=50)
    description: Optional[str] = None
    color_code: Optional[str] = Field("#3B82F6", description="Hex color code")

class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    color_code: Optional[str] = None

class CategoryOut(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    name: str
    description: Optional[str]
    color_code: Optional[str]
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

# --- Note Models ---
class NoteIn(BaseModel):
    user_id: str
    category_id: str 
    content: str = Field(..., max_length=1000)
    tags: List[str] = []

class NoteUpdate(BaseModel):
    content: Optional[str] = Field(None, max_length=1000)
    category_id: Optional[str] = None
    tags: Optional[List[str]] = None
    archived: Optional[bool] = None 
    is_reminder: Optional[bool] = None
    llm_ref: Optional[str] = None

class NoteOut(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    category_id: str
    content: str
    tags: List[str]
    created_at: datetime
    updated_at: datetime 
    
    # Feature Flags
    archived: bool = False 
    is_reminder: bool = False 
    llm_ref: Optional[str] = None
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

# --- LLM Interaction Model ---
class SmartNoteIn(BaseModel):
    user_id: str
    content: str = Field(..., max_length=1000)
    llm_ref: str = "Gemini-2.5-flash-preview-09-2025"