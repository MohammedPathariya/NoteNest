import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { SmartInput } from './components/SmartInput';
import { NotesGrid } from './components/NotesGrid';
import { CategoryModal } from './components/CategoryModal';
import { EditNoteModal } from './components/EditNoteModal'; // Import Edit Modal
import { AnalyticsView } from './components/AnalyticsView';
import { BarChart3, Menu } from 'lucide-react';
import { Button } from './components/ui/button';
import { NoteNestAPI, BackendNote, BackendCategory } from './api';

// Frontend Interfaces (Mapped from Backend)
export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface Note {
  id: string;
  content: string;
  categoryId: string;
  timestamp: Date;
  icon: string;
}

export default function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Modals state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null); // Track note being edited
  
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Fetching ---
  const fetchData = async () => {
    try {
      const [apiNotes, apiCategories] = await Promise.all([
        NoteNestAPI.getNotes(false), // Fetch active notes
        NoteNestAPI.getCategories()
      ]);

      // Map Backend Categories to Frontend UI
      const uiCategories = apiCategories.map((c: BackendCategory) => ({
        id: c._id,
        name: c.name,
        description: c.description || '',
        color: c.color_code || 'bg-indigo-500' // Default color if missing
      }));

      // Map Backend Notes to Frontend UI
      const uiNotes = apiNotes.map((n: BackendNote) => ({
        id: n._id,
        content: n.content,
        categoryId: n.category_id,
        timestamp: new Date(n.updated_at),
        icon: 'file-text' // Default icon
      }));

      setCategories(uiCategories);
      setNotes(uiNotes);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Actions ---
  const handleAddSmartNote = async (content: string) => {
    try {
      await NoteNestAPI.createSmartNote(content);
      await fetchData(); // Refresh to see the new note and auto-category
    } catch (error) {
      console.error("Failed to create smart note:", error);
    }
  };

  const handleUpdateNote = async (id: string, content: string, categoryId: string) => {
    try {
      await NoteNestAPI.updateNote(id, content, categoryId);
      await fetchData(); // Refresh grid to show changes
      setEditingNote(null); // Close modal
    } catch (error) {
      console.error("Failed to update note:", error);
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      await NoteNestAPI.deleteNote(id);
      setNotes(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const handleAddCategory = async (name: string, description: string, color: string) => {
    try {
      await NoteNestAPI.createCategory(name, description, color);
      await fetchData();
    } catch (error) {
      console.error("Failed to create category:", error);
    }
  };

  const filteredNotes = selectedCategory
    ? notes.filter(note => note.categoryId === selectedCategory)
    : notes;

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading NoteNest...</div>;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-amber-50/30 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(id) => {
            setSelectedCategory(id);
            setSidebarOpen(false);
          }}
          onManageCategories={() => {
            setShowCategoryModal(true);
            setSidebarOpen(false);
          }}
          notesCount={notes.length}
          onClose={() => setSidebarOpen(false)}
        />
      </div>
      
      <main className="flex-1 flex flex-col overflow-hidden w-full">
        <div className="flex items-center justify-between p-4 sm:p-6 pb-3 sm:pb-4 gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <Button
              onClick={() => setSidebarOpen(true)}
              variant="outline"
              size="icon"
              className="lg:hidden flex-shrink-0"
            >
              <Menu className="size-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-slate-800 truncate">
                {selectedCategory 
                  ? categories.find(c => c.id === selectedCategory)?.name 
                  : 'All Notes'}
              </h1>
              <p className="text-slate-600 mt-1 text-sm sm:text-base">
                {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
              </p>
            </div>
          </div>
          <Button
            onClick={() => setShowAnalytics(!showAnalytics)}
            variant={showAnalytics ? "default" : "outline"}
            size="sm"
            className="gap-2 flex-shrink-0"
          >
            <BarChart3 className="size-4" />
            <span className="hidden sm:inline">Analytics</span>
          </Button>
        </div>

        <div className="px-4 sm:px-6 pb-3 sm:pb-4">
          <SmartInput onAddNote={handleAddSmartNote} />
        </div>

        <div className="flex-1 overflow-auto px-4 sm:px-6 pb-4 sm:pb-6">
          {showAnalytics ? (
            <AnalyticsView notes={notes} categories={categories} />
          ) : (
            <NotesGrid 
              notes={filteredNotes} 
              categories={categories}
              onDeleteNote={handleDeleteNote}
              onEditNote={setEditingNote} // Pass the setter to open modal
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <CategoryModal
        open={showCategoryModal}
        onOpenChange={setShowCategoryModal}
        onAddCategory={handleAddCategory}
        existingCategories={categories}
      />

      <EditNoteModal 
        isOpen={!!editingNote}
        onClose={() => setEditingNote(null)}
        note={editingNote}
        onUpdate={handleUpdateNote}
        categories={categories}
      />
    </div>
  );
}