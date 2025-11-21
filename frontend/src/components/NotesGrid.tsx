import { Note, Category } from '../App';
import { NoteCard } from './NoteCard';
import { FileQuestion } from 'lucide-react';

interface NotesGridProps {
  notes: Note[];
  categories: Category[];
  onDeleteNote: (id: string) => void;
}

export function NotesGrid({ notes, categories, onDeleteNote }: NotesGridProps) {
  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8 sm:p-12">
        <div className="size-16 sm:size-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center mb-4">
          <FileQuestion className="size-8 sm:size-10 text-slate-400" />
        </div>
        <h3 className="text-slate-700 mb-2">No notes yet</h3>
        <p className="text-slate-500 max-w-md text-sm sm:text-base">
          Start typing in the smart input above, and watch the magic happen as your notes are automatically organized!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 pb-4">
      {notes.map((note) => {
        const category = categories.find(c => c.id === note.categoryId);
        if (!category) return null;
        
        return (
          <NoteCard
            key={note.id}
            note={note}
            category={category}
            onDelete={onDeleteNote}
          />
        );
      })}
    </div>
  );
}