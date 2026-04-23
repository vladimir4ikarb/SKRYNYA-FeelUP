import React, { useState, useEffect, useRef } from 'react';
import { HelpCircle, ArrowUpRight, X, Maximize2, Minimize2, MessageSquare } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AiAssistantProps {
  chatHistory: Message[];
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  mode?: 'card' | 'floating';
}

export const AiAssistant = React.memo(({ chatHistory, isLoading, onSendMessage, mode = 'card' }: AiAssistantProps) => {
  const [input, setInput] = useState('');
  const [isFloatingOpen, setIsFloatingOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isFloatingOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
    }
  };

  const renderContent = () => (
    <div className={`flex flex-col h-full bg-card ${mode === 'floating' ? 'rounded-2xl shadow-2xl border border-border' : ''}`}>
      <div className="p-3 lg:p-4 border-b border-border flex items-center justify-between bg-background/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-primary" />
          </div>
          <h3 className="text-sm font-bold text-text-main">FEEL UP Асистент</h3>
        </div>
        <div className="flex items-center gap-1 lg:gap-2">
          {isLoading && <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>}
          {mode === 'floating' && (
            <>
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 hover:bg-background rounded-lg transition-colors text-text-muted"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button 
                onClick={() => setIsFloatingOpen(false)}
                className="p-1.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-text-muted"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar scroll-smooth bg-background/20">
        {chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
            <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center border border-border">
              <MessageSquare className="w-6 h-6 text-text-muted" />
            </div>
            <div>
              <p className="font-bold text-sm text-text-main">Чим можу допомогти?</p>
              <p className="text-[10px] text-text-muted mt-1 px-4">Запитайте про витрати гелію, останні продажі або залишки на складі.</p>
            </div>
          </div>
        )}
        {chatHistory.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[85%] p-3 rounded-2xl ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-tr-none shadow-md shadow-primary/10' 
                : 'bg-card text-text-main rounded-tl-none border border-border shadow-sm'
            }`}>
              <div className={`markdown-body text-xs leading-relaxed ${msg.role === 'user' ? 'prose-invert' : ''}`}>
                <Markdown>{msg.text}</Markdown>
              </div>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-3 lg:p-4 bg-card border-t border-border flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Напишіть щось..."
          className="flex-1 bg-background border border-border rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-primary/20 text-xs text-text-main placeholder:text-text-muted transition-all"
        />
        <button 
          type="submit" 
          disabled={isLoading || !input.trim()}
          className="p-2.5 bg-primary text-white rounded-xl disabled:opacity-30 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
        >
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </form>
    </div>
  );

  if (mode === 'floating') {
    return (
      <>
        {/* Floating Toggle Button */}
        <div className="fixed bottom-6 right-6 z-[60]">
          <motion.button
            onClick={() => setIsFloatingOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{ 
              y: [0, -4, 0],
            }}
            transition={{ 
              y: { duration: 2, repeat: Infinity, ease: "easeInOut" } 
            }}
            className="w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center relative overflow-hidden group border-2 border-white/20"
          >
            <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full" />
            <span className="text-xl font-black tracking-tighter">AI</span>
            {!isFloatingOpen && chatHistory.length === 0 && (
              <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </motion.button>
        </div>

        {/* Global Chat Window */}
        <AnimatePresence>
          {isFloatingOpen && (
            <>
              {/* Backdrop for mobile fullscreen */}
              {isFullscreen && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[65]"
                  onClick={() => setIsFloatingOpen(false)}
                />
              )}
              <motion.div
                initial={{ 
                  opacity: 0, 
                  y: 100, 
                  scale: 0.9,
                  width: isFullscreen ? '100%' : (window.innerWidth < 640 ? 'calc(100% - 32px)' : '400px'),
                  height: isFullscreen ? '100%' : (window.innerWidth < 640 ? '500px' : '600px'),
                  bottom: isFullscreen ? 0 : (window.innerWidth < 640 ? '80px' : '90px'),
                  right: isFullscreen ? 0 : (window.innerWidth < 640 ? '16px' : '24px'),
                  borderRadius: isFullscreen ? '0' : '1.5rem',
                  left: isFullscreen || window.innerWidth >= 640 ? 'auto' : '16px',
                }}
                animate={{ 
                  opacity: 1, 
                  y: 0, 
                  scale: 1,
                  width: isFullscreen ? '100%' : (window.innerWidth < 640 ? 'calc(100% - 32px)' : '400px'),
                  height: isFullscreen ? '100%' : (window.innerWidth < 640 ? '500px' : '600px'),
                  bottom: isFullscreen ? 0 : (window.innerWidth < 640 ? '80px' : '90px'),
                  right: isFullscreen ? 0 : (window.innerWidth < 640 ? '16px' : '24px'),
                  borderRadius: isFullscreen ? '0' : '1.5rem',
                  left: isFullscreen || window.innerWidth >= 640 ? 'auto' : '16px',
                }}
                exit={{ 
                  opacity: 0, 
                  y: 100, 
                  scale: 0.9,
                  transition: { duration: 0.2 }
                }}
                transition={{ 
                  type: "spring", 
                  damping: 25, 
                  stiffness: 200,
                  opacity: { duration: 0.2 }
                }}
                className="fixed z-[70] shadow-2xl flex flex-col overflow-hidden bg-card"
                style={{ 
                  maxHeight: isFullscreen ? '100vh' : 'calc(100vh - 120px)',
                  margin: isFullscreen ? '0' : '0 auto'
                }}
              >
                {renderContent()}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="saas-card overflow-hidden flex flex-col h-[420px]">
      {renderContent()}
    </div>
  );
});

// Import Zap at the top
import { Zap } from 'lucide-react';
