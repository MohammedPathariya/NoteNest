import { useState, useEffect } from 'react';
import { Note, Category } from '../App';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter, // Added Footer
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Save } from 'lucide-react';

interface EditNoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, content: string, categoryId: string) => Promise<void>;
  categories: Category[];
}

export function EditNoteModal({ note, isOpen, onClose, onUpdate, categories }: EditNoteModalProps) {
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Pre-fill data when the modal opens or note changes
  useEffect(() => {
    if (note) {
      setContent(note.content);
      setCategoryId(note.categoryId);
    }
  }, [note]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note || !content.trim()) return;

    setIsSaving(true);
    try {
      await onUpdate(note.id, content, categoryId);
      onClose();
    } catch (error) {
      console.error("Failed to update note", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
          <DialogDescription>Make changes to your note below.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div className={`size-2 rounded-full ${cat.color}`} />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              className="min-h-[150px] resize-none"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            {/* Removed specific 'bg-indigo-600' class to use default theme 'primary' color */}
            <Button type="submit" disabled={isSaving}>
              <Save className="size-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}