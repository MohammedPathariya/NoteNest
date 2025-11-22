import { useState } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Sparkles, Send } from 'lucide-react';

interface SmartInputProps {
  // Updated to accept a Promise for async API calls
  onAddNote: (content: string) => Promise<void>;
}

export function SmartInput({ onAddNote }: SmartInputProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsProcessing(true);
    
    try {
      // Pass the content up to App.tsx, which calls the API
      await onAddNote(input); 
      setInput(''); // Clear on success
    } catch (error) {
      console.error("Error submitting note", error);
    } finally {
      setIsProcessing(false);
    }
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
              <span>AI is organizing your note...</span>
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