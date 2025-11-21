import { useState } from 'react';
import { Category } from '../App';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Sparkles, Send } from 'lucide-react';

interface SmartInputProps {
  categories: Category[];
  onAddNote: (content: string, categoryId: string, icon: string) => void;
}

// Simple LLM simulation for categorization
const categorizeNote = (content: string, categories: Category[]): { categoryId: string; icon: string } => {
  const lowerContent = content.toLowerCase();
  
  // Icon mapping based on keywords
  let icon = 'file-text';
  
  if (lowerContent.includes('buy') || lowerContent.includes('get') || lowerContent.includes('purchase')) {
    icon = 'shopping-cart';
  } else if (lowerContent.includes('call') || lowerContent.includes('email') || lowerContent.includes('message')) {
    icon = 'phone';
  } else if (lowerContent.includes('idea') || lowerContent.includes('what if') || lowerContent.includes('imagine')) {
    icon = 'lightbulb';
  } else if (lowerContent.includes('learn') || lowerContent.includes('study') || lowerContent.includes('read')) {
    icon = 'book-open';
  } else if (lowerContent.includes('remember') || lowerContent.includes('don\'t forget')) {
    icon = 'bell';
  } else if (lowerContent.includes('meeting') || lowerContent.includes('schedule') || lowerContent.includes('appointment')) {
    icon = 'calendar';
  } else if (lowerContent.includes('finish') || lowerContent.includes('complete') || lowerContent.includes('review')) {
    icon = 'check-circle';
  }
  
  // Category detection
  if (lowerContent.includes('work') || lowerContent.includes('project') || lowerContent.includes('client') || 
      lowerContent.includes('meeting') || lowerContent.includes('report') || lowerContent.includes('team')) {
    const workCategory = categories.find(c => c.name === 'Work');
    if (workCategory) return { categoryId: workCategory.id, icon: 'briefcase' };
  }
  
  if (lowerContent.includes('idea') || lowerContent.includes('what if') || lowerContent.includes('app') || 
      lowerContent.includes('design') || lowerContent.includes('imagine')) {
    const ideasCategory = categories.find(c => c.name === 'Ideas');
    if (ideasCategory) return { categoryId: ideasCategory.id, icon: 'lightbulb' };
  }
  
  if (lowerContent.includes('buy') || lowerContent.includes('todo') || lowerContent.includes('need to') || 
      lowerContent.includes('review') || lowerContent.includes('finish')) {
    const todoCategory = categories.find(c => c.name === 'To-Do');
    if (todoCategory) return { categoryId: todoCategory.id, icon: 'check-circle' };
  }
  
  if (lowerContent.includes('learn') || lowerContent.includes('study') || lowerContent.includes('course') || 
      lowerContent.includes('read') || lowerContent.includes('tutorial')) {
    const learningCategory = categories.find(c => c.name === 'Learning');
    if (learningCategory) return { categoryId: learningCategory.id, icon: 'book-open' };
  }
  
  if (lowerContent.includes('mom') || lowerContent.includes('dad') || lowerContent.includes('family') || 
      lowerContent.includes('friend') || lowerContent.includes('personal')) {
    const personalCategory = categories.find(c => c.name === 'Personal');
    if (personalCategory) return { categoryId: personalCategory.id, icon: 'heart' };
  }
  
  // Default to first category
  return { categoryId: categories[0]?.id || '1', icon };
};

export function SmartInput({ categories, onAddNote }: SmartInputProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    
    // Simulate AI processing delay
    setTimeout(() => {
      const { categoryId, icon } = categorizeNote(input, categories);
      onAddNote(input, categoryId, icon);
      setInput('');
      setIsProcessing(false);
    }, 800);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="relative bg-white rounded-2xl shadow-lg border-2 border-transparent hover:border-coral-400/30 transition-all duration-300">
      <div className="p-3 sm:p-4">
        <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
          <div className="flex items-center gap-2 text-coral-500">
            <Sparkles className="size-4 sm:size-5" />
            <span className="text-slate-700 text-sm sm:text-base">Smart Input</span>
          </div>
          {isProcessing && (
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500">
              <div className="flex gap-1">
                <div className="size-1.5 bg-coral-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="size-1.5 bg-coral-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="size-1.5 bg-coral-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span>Categorizing...</span>
            </div>
          )}
        </div>
        
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type anything... I'll organize it for you! 🪄"
          className="min-h-[60px] sm:min-h-[80px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400 text-sm sm:text-base"
          disabled={isProcessing}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 px-3 sm:px-4 pb-3 sm:pb-4 pt-0">
        <p className="text-xs text-slate-500 order-2 sm:order-1">
          <span className="hidden sm:inline">Press Enter to submit, Shift+Enter for new line</span>
          <span className="sm:hidden">Tap to add note</span>
        </p>
        <Button
          onClick={handleSubmit}
          disabled={!input.trim() || isProcessing}
          className="bg-gradient-to-r from-coral-500 to-amber-500 hover:from-coral-600 hover:to-amber-600 text-white shadow-md gap-2 w-full sm:w-auto order-1 sm:order-2"
          size="sm"
        >
          <Send className="size-4" />
          Add Note
        </Button>
      </div>
    </div>
  );
}