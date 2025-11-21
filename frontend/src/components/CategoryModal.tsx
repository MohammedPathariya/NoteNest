import { useState } from 'react';
import { Category } from '../App';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Plus, Palette } from 'lucide-react';

interface CategoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCategory: (name: string, description: string, color: string) => void;
  existingCategories: Category[];
}

const categoryColors = [
  { name: 'Coral', value: 'bg-coral-500' },
  { name: 'Teal', value: 'bg-teal-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Rose', value: 'bg-rose-500' },
  { name: 'Amber', value: 'bg-amber-500' },
  { name: 'Orange', value: 'bg-orange-500' },
  { name: 'Emerald', value: 'bg-emerald-500' },
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Pink', value: 'bg-pink-500' },
  { name: 'Lime', value: 'bg-lime-500' },
];

export function CategoryModal({ open, onOpenChange, onAddCategory, existingCategories }: CategoryModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(categoryColors[0].value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddCategory(name, description, selectedColor);
    setName('');
    setDescription('');
    setSelectedColor(categoryColors[0].value);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>
            Create custom categories to organize your notes your way.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 py-4">
          <div className="space-y-3 sm:space-y-4">
            <h4 className="text-slate-700">Existing Categories</h4>
            <div className="flex flex-wrap gap-2">
              {existingCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className={`size-2.5 sm:size-3 rounded-full ${category.color}`} />
                  <span className="text-xs sm:text-sm text-slate-700">{category.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="h-px bg-slate-200" />

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <h4 className="text-slate-700">Add New Category</h4>
            
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Health & Fitness"
                className="border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category-description">Description (optional)</Label>
              <Textarea
                id="category-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What kind of notes belong here?"
                className="resize-none border-slate-200"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="size-4" />
                Color
              </Label>
              <div className="grid grid-cols-5 gap-2">
                {categoryColors.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={`size-10 sm:size-12 rounded-xl ${color.value} transition-all hover:scale-110 ${
                      selectedColor === color.value
                        ? 'ring-4 ring-slate-300 ring-offset-2'
                        : 'ring-1 ring-slate-200'
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-coral-500 to-amber-500 hover:from-coral-600 hover:to-amber-600 text-white gap-2"
            >
              <Plus className="size-4" />
              Add Category
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}