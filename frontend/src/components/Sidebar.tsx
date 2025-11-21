import { Category } from '../App';
import { Button } from './ui/button';
import { Sparkles, Home, Settings, Plus, X } from 'lucide-react';
import { Separator } from './ui/separator';

interface SidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (id: string | null) => void;
  onManageCategories: () => void;
  notesCount: number;
  onClose: () => void;
}

export function Sidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  onManageCategories,
  notesCount,
  onClose,
}: SidebarProps) {
  return (
    <aside className="w-72 h-full bg-gradient-to-b from-indigo-900 to-indigo-950 text-white p-4 sm:p-6 flex flex-col shadow-2xl">
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-gradient-to-br from-coral-400 to-amber-400 rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="size-6 text-white" />
          </div>
          <div>
            <h2 className="text-white tracking-tight">NoteNest</h2>
            <p className="text-indigo-300 text-xs sm:text-sm">Smart Notes System</p>
          </div>
        </div>
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="lg:hidden text-indigo-200 hover:text-white hover:bg-white/10"
        >
          <X className="size-5" />
        </Button>
      </div>

      <Button
        onClick={() => onSelectCategory(null)}
        variant="ghost"
        className={`justify-start gap-3 mb-2 ${
          selectedCategory === null
            ? 'bg-white/20 text-white hover:bg-white/25'
            : 'text-indigo-200 hover:bg-white/10 hover:text-white'
        }`}
      >
        <Home className="size-4" />
        <span>All Notes</span>
        <span className="ml-auto bg-white/20 px-2 py-0.5 rounded-full text-xs">
          {notesCount}
        </span>
      </Button>

      <Separator className="my-4 bg-white/10" />

      <div className="flex-1 overflow-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs uppercase tracking-wide text-indigo-300">
            Categories
          </p>
          <Button
            onClick={onManageCategories}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-indigo-300 hover:text-white hover:bg-white/10"
          >
            <Plus className="size-3" />
          </Button>
        </div>

        <div className="space-y-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                selectedCategory === category.id
                  ? 'bg-white/20 text-white'
                  : 'text-indigo-200 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className={`size-3 rounded-full ${category.color} shadow-md`} />
              <span className="flex-1 text-left">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator className="my-4 bg-white/10" />

      <Button
        onClick={onManageCategories}
        variant="ghost"
        className="justify-start gap-3 text-indigo-200 hover:bg-white/10 hover:text-white"
      >
        <Settings className="size-4" />
        Manage Categories
      </Button>
    </aside>
  );
}