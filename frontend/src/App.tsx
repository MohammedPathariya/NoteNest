import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { SmartInput } from './components/SmartInput';
import { NotesGrid } from './components/NotesGrid';
import { CategoryModal } from './components/CategoryModal';
import { AnalyticsView } from './components/AnalyticsView';
import { BarChart3, Menu, X } from 'lucide-react';
import { Button } from './components/ui/button';

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

const defaultCategories: Category[] = [
  { id: '1', name: 'Work', description: 'Professional tasks and projects', color: 'bg-orange-500' },
  { id: '2', name: 'Personal', description: 'Personal life and self-care', color: 'bg-teal-500' },
  { id: '3', name: 'Ideas', description: 'Creative thoughts and brainstorms', color: 'bg-purple-500' },
  { id: '4', name: 'To-Do', description: 'Action items and tasks', color: 'bg-rose-500' },
  { id: '5', name: 'Learning', description: 'Study notes and knowledge', color: 'bg-amber-500' },
];

const sampleNotes: Note[] = [
  { id: '1', content: 'Finish the quarterly report by Friday', categoryId: '1', timestamp: new Date('2025-11-20'), icon: 'briefcase' },
  { id: '2', content: 'Remember to call mom this weekend', categoryId: '2', timestamp: new Date('2025-11-20'), icon: 'heart' },
  { id: '3', content: 'App idea: A plant watering reminder with AI plant health diagnosis', categoryId: '3', timestamp: new Date('2025-11-19'), icon: 'lightbulb' },
  { id: '4', content: 'Buy groceries: milk, eggs, bread, coffee', categoryId: '4', timestamp: new Date('2025-11-21'), icon: 'check-circle' },
  { id: '5', content: 'Learn about React Server Components and streaming', categoryId: '5', timestamp: new Date('2025-11-18'), icon: 'book-open' },
  { id: '6', content: 'Schedule team meeting for project kickoff next Tuesday', categoryId: '1', timestamp: new Date('2025-11-21'), icon: 'briefcase' },
  { id: '7', content: 'What if we redesigned city parks to be more interactive?', categoryId: '3', timestamp: new Date('2025-11-17'), icon: 'lightbulb' },
  { id: '8', content: 'Review and respond to client emails', categoryId: '4', timestamp: new Date('2025-11-21'), icon: 'check-circle' },
];

export default function App() {
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [notes, setNotes] = useState<Note[]>(sampleNotes);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const addNote = (content: string, categoryId: string, icon: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      content,
      categoryId,
      timestamp: new Date(),
      icon,
    };
    setNotes([newNote, ...notes]);
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const addCategory = (name: string, description: string, color: string) => {
    const newCategory: Category = {
      id: Date.now().toString(),
      name,
      description,
      color,
    };
    setCategories([...categories, newCategory]);
  };

  const filteredNotes = selectedCategory
    ? notes.filter(note => note.categoryId === selectedCategory)
    : notes;

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-amber-50/30 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile, slides in when open */}
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
          <SmartInput categories={categories} onAddNote={addNote} />
        </div>

        <div className="flex-1 overflow-auto px-4 sm:px-6 pb-4 sm:pb-6">
          {showAnalytics ? (
            <AnalyticsView notes={notes} categories={categories} />
          ) : (
            <NotesGrid 
              notes={filteredNotes} 
              categories={categories}
              onDeleteNote={deleteNote}
            />
          )}
        </div>
      </main>

      <CategoryModal
        open={showCategoryModal}
        onOpenChange={setShowCategoryModal}
        onAddCategory={addCategory}
        existingCategories={categories}
      />
    </div>
  );
}