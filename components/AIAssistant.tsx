'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, AlertCircle } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai' | 'error';
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'ai',
      content: '👋 Hi! I\'m your Xandeum AI assistant powered by Google Gemini.\n\n💡 I can help you with:\n• Xandeum Protocol & PNodes\n• Network analytics & performance\n• Technical architecture\n• API usage & integration\n\n⚡ Quick Setup (if AI is not configured):\n1. Get API key: https://aistudio.google.com/app/apikey\n2. Create `.env.local` file\n3. Add: `GEMINI_API_KEY=your_key`\n4. Restart server\n\n📝 Note: Uses Gemini free tier with daily limits. If quota is exhausted, upgrade to paid plan for unlimited access. I handle rate limits automatically! 🚀\n\nAsk me anything about Xandeum!',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimitUntil, setRateLimitUntil] = useState<Date | null>(null);
  const [quotaExhausted, setQuotaExhausted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Update rate limit countdown every second
  useEffect(() => {
    if (rateLimitUntil) {
      const interval = setInterval(() => {
        if (new Date() >= rateLimitUntil) {
          setRateLimitUntil(null);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [rateLimitUntil]);

  const handleSendMessage = async (retryCount = 0) => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    // Check if we're still in rate limit cooldown
    if (rateLimitUntil && new Date() < rateLimitUntil) {
      const remainingSeconds = Math.ceil((rateLimitUntil.getTime() - new Date().getTime()) / 1000);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'error',
        content: `⏳ Rate limit active. Please wait ${remainingSeconds} seconds before trying again.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Don't retry more than 2 times
    if (retryCount > 2) {
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        type: 'error',
        content: '⏳ Still hitting rate limits after multiple attempts. Please wait a few minutes before trying again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    // Only add user message on first attempt
    if (retryCount === 0) {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: trimmedInput,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setInputValue('');
    }

    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: trimmedInput }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error('Invalid response from server');
      }

      if (!response.ok) {
        // Handle quota exhaustion (permanent until quota reset)
        if (data.quotaExhausted) {
          setQuotaExhausted(true);
          throw new Error(data.error || `Server error: ${response.status}`);
        }

        // Handle rate limit specifically (temporary)
        if (response.status === 503 && data.error && data.error.includes('Rate limit')) {
          const waitTime = data.retryAfter ? Math.min(data.retryAfter, 300) : Math.min(30 * Math.pow(2, retryCount), 300);
          setRateLimitUntil(new Date(Date.now() + waitTime * 1000));

          // Auto-retry after the wait time if this is not the last attempt
          if (retryCount < 2) {
            setTimeout(() => {
              handleSendMessage(retryCount + 1);
            }, waitTime * 1000);
            return;
          }
        }
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      // Clear rate limit state on successful response
      setRateLimitUntil(null);

      if (!data.response) {
        throw new Error('No response received from AI');
      }

      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        type: 'ai',
        content: data.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI request failed:', error);

      let errorContent = 'Sorry, I\'m having trouble right now. Please try again.';
      let isRateLimitError = false;

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorContent = '⏱️ Request timeout. The AI service took too long to respond. Please try again.';
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          errorContent = '🌐 Network error. Please check your internet connection and try again.';
        } else if (error.message.includes('not configured')) {
          errorContent = error.message;
        } else if (error.message.includes('quota exhausted') || error.message.includes('Free tier quota')) {
          setQuotaExhausted(true);
          errorContent = error.message; // Use the full message with upgrade instructions
        } else if (error.message.includes('Rate limit') || error.message.includes('rate limit')) {
          isRateLimitError = true;
          const waitTime = Math.min(30 * Math.pow(2, retryCount), 300);
          setRateLimitUntil(new Date(Date.now() + waitTime * 1000));
          errorContent = `⏳ Rate limit exceeded. I'll automatically retry in ${waitTime} seconds, or you can wait and try again manually.`;
        } else {
          errorContent = `❌ ${error.message}`;
        }
      }

      // Only show error message if it's not a rate limit that will auto-retry
      if (!isRateLimitError || retryCount >= 2) {
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          type: 'error',
          content: errorContent,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'ai',
        content: '👋 Chat cleared! How can I help you with Xandeum?',
        timestamp: new Date()
      }
    ]);
    // Reset states when clearing chat
    setQuotaExhausted(false);
    setRateLimitUntil(null);
  };

  return (
    <>
      {/* Floating AI Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-[#00ffd5] hover:bg-[#00e6c0] text-[#121212] p-4 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-50 group"
        aria-label="Open AI Assistant"
      >
        <Bot className="h-6 w-6" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          AI
        </span>
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-4 pointer-events-none">
          <div className="bg-[#1e1e1e] border border-[#2e2e2e] rounded-lg shadow-2xl w-full max-w-md h-[600px] flex flex-col pointer-events-auto animate-slideIn">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[#2e2e2e]">
              <div className="flex items-center space-x-3">
                <div className="bg-[#00ffd5] p-2 rounded-full">
                  <Bot className="h-4 w-4 text-[#121212]" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Xandeum AI</h3>
                  <p className="text-xs text-neutral-400">Powered by Gemini</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={clearChat}
                  className="text-neutral-400 hover:text-white transition-colors text-xs px-2 py-1 rounded hover:bg-[#2e2e2e]"
                  aria-label="Clear chat"
                  title="Clear chat"
                >
                  Clear
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-neutral-400 hover:text-white transition-colors"
                  aria-label="Close AI Assistant"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-[#2e2e2e] scrollbar-track-transparent">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.type === 'user'
                        ? 'bg-[#00ffd5] text-[#121212]'
                        : message.type === 'error'
                        ? 'bg-red-900/30 text-red-200 border border-red-700/50'
                        : 'bg-[#2e2e2e] text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {message.type === 'ai' ? (
                        <Bot className="h-3 w-3 text-[#00ffd5] shrink-0" />
                      ) : message.type === 'error' ? (
                        <AlertCircle className="h-3 w-3 text-red-400 shrink-0" />
                      ) : (
                        <User className="h-3 w-3 shrink-0" />
                      )}
                      <span className="text-xs opacity-70">
                        {message.type === 'ai' ? 'AI' : message.type === 'error' ? 'Error' : 'You'}
                      </span>
                    </div>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#2e2e2e] rounded-lg p-3 max-w-[85%]">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-[#00ffd5] rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-[#00ffd5] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-[#00ffd5] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-xs text-neutral-400">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[#2e2e2e]">
              {quotaExhausted ? (
                <div className="text-center py-4">
                  <div className="text-sm text-red-400 mb-2">
                    🚫 AI Assistant Unavailable
                  </div>
                  <div className="text-xs text-neutral-400 mb-3">
                    Free tier quota exhausted. Upgrade to continue using AI features.
                  </div>
                  <div className="flex flex-col space-y-2">
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#00ffd5] hover:bg-[#00e6c0] text-[#121212] px-4 py-2 rounded-lg text-sm font-sans transition-colors text-center"
                    >
                      Upgrade Gemini API Plan
                    </a>
                    <button
                      onClick={() => {
                        setQuotaExhausted(false);
                        setMessages(prev => [...prev, {
                          id: `info-${Date.now()}`,
                          type: 'ai',
                          content: '💡 Quota reset times vary by region and usage. You can try again later, or upgrade for unlimited access.',
                          timestamp: new Date()
                        }]);
                      }}
                      className="text-neutral-400 hover:text-white text-xs underline transition-colors"
                    >
                      Try Again Later
                    </button>
                  </div>
                </div>
              ) : rateLimitUntil && new Date() < rateLimitUntil ? (
                <div className="text-center py-2">
                  <div className="text-sm text-yellow-400 mb-1">
                    ⏳ Rate limited - wait {Math.ceil((rateLimitUntil.getTime() - new Date().getTime()) / 1000)}s
                  </div>
                  <div className="w-full bg-[#2e2e2e] rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.max(0, ((rateLimitUntil.getTime() - new Date().getTime()) / (rateLimitUntil.getTime() - (Date.now() - 30000))) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask about Xandeum..."
                    className="flex-1 bg-[#2e2e2e] border border-[#3e3e3e] rounded-lg px-3 py-2 text-white placeholder-neutral-400 focus:outline-none focus:border-[#00ffd5] text-sm transition-colors"
                    disabled={isLoading}
                    maxLength={500}
                  />
                  <button
                    onClick={() => handleSendMessage(0)}
                    disabled={!inputValue.trim() || isLoading}
                    className="bg-[#00ffd5] hover:bg-[#00e6c0] disabled:bg-neutral-600 disabled:cursor-not-allowed text-[#121212] p-2 rounded-lg transition-colors shrink-0"
                    aria-label="Send message"
                    title="Send message (Enter)"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              )}
              {!quotaExhausted && (
                <p className="text-xs text-neutral-500 mt-2 text-center">
                  {inputValue.length}/500 characters
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}