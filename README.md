# NoteNest - Smart Notes Management System 📝✨

<img width="1440" height="814" alt="Screenshot 2025-11-29 at 2 32 43 PM" src="https://github.com/user-attachments/assets/99f6ac39-d812-4a41-a3fa-0c9f71b339d0" />


**NoteNest** is a modern, intelligent note-taking application designed to transform chaotic thoughts into organized actions. It features a chat-like "Smart Input" that uses AI (GPT-4o-mini) to automatically categorize your notes, saving you the hassle of manual organization.

Built with a robust **FastAPI** backend, a scalable **MongoDB** database, and a responsive **React** frontend, NoteNest offers a seamless full-stack experience with real-time analytics and auditing.

## 🚀 Key Features

  * **🧠 AI-Powered Organization:** Simply type "Buy milk" or "Meeting at 3 PM," and the system automatically files it into categories like "Personal" or "Work" using OpenAI.
  * **📊 Real-Time Analytics:** Visualize your productivity with dynamic charts showing note distribution and weekly activity.
  * **🗂️ Smart Category Management:** Create, edit, and color-code custom categories. Deleting a category safely reassigns notes to "Uncategorized" to prevent data loss.
  * **⚡ Full CRUD Operations:** Create, Read, Update, and Delete notes and categories with instant UI updates.
  * **🗑️ Soft Delete & Archiving:** Never lose important data accidentally. Archive notes to hide them from your main feed without permanent deletion.
  * **🐳 Fully Dockerized:** Run the entire stack (Frontend + Backend) with a single command.

## 🛠️ Tech Stack

### **Frontend**

  * **Framework:** React 18 (Vite)
  * **Language:** TypeScript
  * **Styling:** Tailwind CSS
  * **UI Components:** Shadcn/UI + Lucide Icons
  * **Charts:** Recharts
  * **State Management:** React Hooks

### **Backend**

  * **Framework:** FastAPI (Python 3.11)
  * **Database:** MongoDB Atlas (NoSQL)
  * **Driver:** PyMongo (Async/Sync)
  * **AI Integration:** OpenAI API (`gpt-4o-mini`)
  * **Validation:** Pydantic Models

## 🔧 Installation & Setup

### Prerequisites

  * **Docker Desktop** (Recommended) OR Python 3.11+ & Node.js 18+
  * **MongoDB Atlas Account** (Free Tier)
  * **OpenAI API Key**

### Option 1: Run with Docker (Recommended 🐳)

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/MohammedPathariya/NoteNest.git
    cd NoteNest
    ```

2.  **Configure Environment Variables:**
    Create a `.env` file in the `backend/` directory:

    ```env
    # backend/.env
    OPENAI_API_KEY=sk-proj-your-actual-openai-key-here
    ```

    *(Note: The MongoDB connection string is currently pre-configured in `database.py` for ease of review, but for production, add `CONNECTION_STRING` here too.)*

3.  **Run the Application:**

    ```bash
    docker-compose up --build
    ```

4.  **Access the App:**

      * **Frontend:** [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)
      * **Backend Docs:** [http://localhost:8000/docs](https://www.google.com/search?q=http://localhost:8000/docs)

### Option 2: Manual Setup (Local Development)

If you prefer running services individually:

#### 1\. Backend Setup

```bash
cd backend
# Create and activate virtual environment (Optional but recommended)
conda create -n notenest python=3.11
conda activate notenest

# Install dependencies
pip install -r requirements.txt

# Run Server
uvicorn main:app --reload
```

#### 2\. Frontend Setup

```bash
cd frontend
# Install dependencies
npm install

# Run Dev Server
npm run dev
```

## 🧪 Database Seeding (Optional)

To instantly populate your empty database with realistic categories (Finance, Health, Work) and 20+ sample notes for testing analytics:

1.  Ensure your backend environment is active (`conda activate notenest`).
2.  Run the seed scripts from the root folder:

<!-- end list -->

```bash
# 1. Create standard categories (Wipes old categories!)
python seed_categories.py

# 2. Create sample notes linked to those categories
python seed_notes.py
```

Refresh your browser to see the populated dashboard\!

## 📂 Project Structure

```text
NoteNest/
├── backend/             # FastAPI Server
│   ├── main.py          # API Routes & Logic
│   ├── database.py      # MongoDB Connection & Aggregations
│   ├── models.py        # Pydantic Data Schemas
│   └── requirements.txt # Python Dependencies
├── frontend/            # React Application
│   ├── src/
│   │   ├── components/  # UI Components (Sidebar, NoteCard, etc.)
│   │   ├── api.ts       # Axios Service Layer
│   │   └── App.tsx      # Main Logic & State
├── seed_categories.py   # Database Population Script
├── seed_notes.py        # Database Population Script
├── docker-compose.yml   # Docker Orchestration
└── README.md            # Project Documentation
```

## 👥 Team - ThinkStack

  * **Aditya Pise:** Backend Architecture, LLM Integration, Dockerization
  * **Mohammed Pathariya:** Database Schema Design, Analytics Pipeline, API Logic
  * **Nileet Savale:** React Frontend, UI/UX Design, State Management

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
