import { Note, Category } from '../App';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Briefcase, Heart, Lightbulb, CheckCircle, BookOpen, 
  FileText, ShoppingCart, Phone, Bell, Calendar, Trash2,
  Clock
} from 'lucide-react';

interface NoteCardProps {
  note: Note;
  category: Category;
  onDelete: (id: string) => void;
}

const iconMap: Record<string, any> = {
  'briefcase': Briefcase,
  'heart': Heart,
  'lightbulb': Lightbulb,
  'check-circle': CheckCircle,
  'book-open': BookOpen,
  'file-text': FileText,
  'shopping-cart': ShoppingCart,
  'phone': Phone,
  'bell': Bell,
  'calendar': Calendar,
};

// --- IMPROVED DATE FORMATTER ---
const formatDate = (date: Date) => {
  const now = new Date();
  // Get difference in seconds
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Handle future dates (prevent -1 days ago) or immediate creation
  if (diffInSeconds < 60) {
    return 'Just now';
  }

  // Handle minutes
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins}m ago`;
  }

  // Handle hours
  if (diffInSeconds < 86400) { // Less than 24 hours
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  }

  // Handle days
  const days = Math.floor(diffInSeconds / 86400);
  
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  
  // Fallback to full date for older notes
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export function NoteCard({ note, category, onDelete }: NoteCardProps) {
  const IconComponent = iconMap[note.icon] || FileText;

  return (
    <Card className="group relative bg-white p-4 sm:p-5 shadow-md hover:shadow-xl transition-all duration-300 border-0 hover:-translate-y-1">
      <div className="flex items-start gap-2 sm:gap-3 mb-3">
        {/* Category Icon */}
        <div className={`size-9 sm:size-10 ${category.color} rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-md`}>
          <IconComponent className="size-4 sm:size-5" />
        </div>
        
        {/* Category Badge */}
        <div className="flex-1 min-w-0">
          <Badge 
            className={`${category.color} text-white border-0 shadow-sm text-xs`}
          >
            {category.name}
          </Badge>
        </div>

        {/* Delete Button (Visible on Hover) */}
        <Button 
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click if you add one later
            onDelete(note.id);
          }}
          variant="ghost" 
          size="sm" 
          className="opacity-0 group-hover:opacity-100 transition-opacity size-7 sm:size-8 p-0 text-slate-400 hover:text-rose-500 hover:bg-rose-50 -mt-1 -mr-1"
        >
          <Trash2 className="size-3 sm:size-4" />
        </Button>
      </div>
      
      {/* Note Content */}
      <p className="text-slate-700 mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base break-words">
        {note.content}
      </p>

      {/* Timestamp */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Clock className="size-3" />
        <span>{formatDate(note.timestamp)}</span>
      </div>
    </Card>
  );
}