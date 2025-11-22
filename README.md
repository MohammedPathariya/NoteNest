# 🚀 NoteNest: Technical Development Roadmap

This roadmap outlines the three critical phases required to move from the current backend setup to a fully functional, intelligent web application.

## 📌 Phase 1: Backend Finalization & Data Bridge

**Goal:** Complete all necessary API endpoints, particularly for Category Management, ensuring the frontend has everything it needs to function.

| Task | HTTP Method | Route | Description |
| :--- | :--- | :--- | :--- |
| **1. Category READ** | `GET` | `/categories/{user_id}` | Retrieve the full list of custom categories for the current user. |
| **2. Category CREATE** | `POST` | `/categories/` | Add a new custom category (requires `user_id`, `name`, `description`). |
| **3. Category UPDATE** | `PUT` | `/categories/{category_id}` | Modify the name or description of an existing category. |
| **4. Category DELETE** | `DELETE` | `/categories/{category_id}` | Permanently remove a category. This endpoint must include logic to either reject the deletion if notes are linked, or reassign existing notes to an "Uncategorized" state. |
| **5. Test & Verify** | `http://127.0.0.1:8000/docs` | Thoroughly test all new Category CRUD endpoints to confirm correct database operation and data validation. |

-----

## 💻 Phase 2: Frontend Core Integration (The Functional MVP)

**Goal:** Connect the React frontend to the API and establish the core user flow, achieving a complete, submittable application that fulfills all class requirements (CRUD).

| Component | Backend Route | Action & Logic |
| :--- | :--- | :--- |
| **1. App State & Data Fetch** | `GET /notes/{user_id}`<br>`GET /categories/{user_id}` | **`App.tsx` / `Context`:** Fetch both notes and categories on initial load. Store all data centrally to manage global application state (readiness, loading status). |
| **2. Sidebar & Navigation** | N/A | **`Sidebar.tsx`:** Map over the fetched category list to render navigation links. Clicking a link should filter the notes displayed in the main grid based on the selected `category_id`. |
| **3. Category Management UI**| `POST/PUT/DELETE /categories...` | **`CategoryModal.tsx`:** Implement forms and handlers to make CRUD calls directly to the category endpoints, ensuring the local state (and sidebar) updates upon successful response. |
| **4. Note Creation (Manual)** | `POST /notes/` | **`SmartInput.tsx`:** Implement a temporary "manual" creation flow: The user enters `content`, but the component uses a hardcoded or default `category_id` and calls the basic `POST /notes/` endpoint. (This ensures the core feature works without the LLM dependency). |
| **5. Note Display & CRUD** | `DELETE /notes/{note_id}` | **`NotesGrid.tsx` / `NoteCard.tsx`:** Render notes by mapping over the state.<br>**`NoteCard.tsx`:** Wire up the trash can icon to execute the `DELETE` request, then remove the note from the local state immediately after confirmation. |

-----

## ✨ Phase 3: Intelligence, Analytics, & Polish (The Standout Features)

**Goal:** Integrate the LLM (Artificial Intelligence) for smart categorization and implement the final visualization elements for the dashboard.

| Task | Backend Route / File | Action & Logic |
| :--- | :--- | :--- |
| **1. LLM Backend** | New `POST /smart-note/` | **`main.py`:** Build the new "smart" route. This function will take the note content, call the LLM API (e.g., OpenAI/Claude) to get the best category based on the user's existing categories, and then save the note to MongoDB. |
| **2. Frontend Smart Swap** | `POST /smart-note/` | **`SmartInput.tsx`:** Update the submit handler to call the new **`/smart-note/`** route instead of the "dumb" `/notes/` route. The user now just types naturally, and the AI handles the organization. |
| **3. Implement Analytics** | `GET /analytics/{user_id}` | **`AnalyticsView.tsx`:** Call this final route to retrieve the aggregated data (category names and counts). Pass this data to the chart components to render the "Notes by Category" pie chart and the "Activity" bar chart. |
| **4. Final Deployment** | N/A | Deploy the FastAPI backend (e.g., Heroku, Vercel) and the React frontend (e.g., Netlify). Final review of documentation and responsiveness. |
