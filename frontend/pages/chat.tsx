'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/cn';
import { useMounted } from '@/hooks/useMounted';

import {
  MessageSquare,
  Send,
  Loader2,
  Sparkles,
  Shield,
  AlertCircle,
  Info,
  X,
  Copy,
  Check,
  HeartPulse,
  Stethoscope,
  Bot,
  Settings,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Label, Field } from '@/components/ui/Form';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';
import { Separator } from '@/components/ui/Separator';
import { CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { ChatMessages } from '@/components/patient/ChatMessages';

const WELCOME_MESSAGES = [
  "Hello! I'm **Medi AI**, your personal health assistant within MediAssist.",
  "I can help explain your predictions, medicines, diet suggestions, and more.",
  "I can also answer general health questions and explain MediAssist features.",
  "**Important:** I'm an AI assistant, not a doctor. Always consult a licensed healthcare professional for personal medical advice.",
];

const SUGGESTED_QUESTIONS = [
  "What does my prediction mean?",
  "Explain my recommended medicines",
  "What diet should I follow?",
  "What precautions should I take?",
  "When should I see a doctor?",
  "How do I book an appointment?",
  "What does this symptom mean?",
  "Find nearby specialists",
];

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    guard_decision?: string;
    guard_category?: string;
  };
}

export default function ChatPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const mounted = useMounted();

  const [messages, setMessages] = useState<Message[]>([]);
  const messageTextRef = useRef('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);
  const [isOllamaHealthy, setIsOllamaHealthy] = useState(true);
  const [ollamaChecking, setOllamaChecking] = useState(true);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check Ollama health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const res = await api.get('/api/chat/health');
        setIsOllamaHealthy(res.data.ollama_connected);
        if (!res.data.ollama_connected) {
          toast.error('Medi AI is currently unavailable. Please ensure Ollama is running.');
        }
      } catch {
        setIsOllamaHealthy(false);
        toast.error('Medi AI service unavailable');
      } finally {
        setOllamaChecking(false);
      }
    };
    checkHealth();
  }, []);

  // Auto-scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    if (mounted && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mounted]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Clear chat on logout
  useEffect(() => {
    if (!isAuthenticated && messages.length > 0) {
      setMessages([]);
      setShowWelcome(true);
      setShowSuggestions(true);
    }
  }, [isAuthenticated, messages.length]);

  // Initial welcome messages
  useEffect(() => {
    if (!mounted) return;
    if (messages.length === 0 && !isSubmitting && isAuthenticated) {
      WELCOME_MESSAGES.forEach((msg, i) => {
        setTimeout(() => {
          addMessage('assistant', msg);
        }, i * 300);
      });
    }
  }, [mounted, isAuthenticated, messages.length, isSubmitting]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (inputRef.current) {
          inputRef.current.blur();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Append a message to state
  const addMessage = useCallback((role: Message['role'], content: string, metadata?: Message['metadata']) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        role,
        content,
        timestamp: new Date(),
        metadata,
      },
    ]);
    setShowWelcome(false);
    setShowSuggestions(false);
  }, []);

  // Send message to backend
  const sendUserMessage = useCallback(async () => {
    const trimmed = messageTextRef.current.trim();
    if (!trimmed || isSubmitting) return;

    messageTextRef.current = '';
    setIsSubmitting(true);
    setError(null);

    addMessage('user', trimmed);

    try {
      const res = await api.post('/api/chat', { message: trimmed }, { withCredentials: true });
      const assistantResponse = res.data.response || '';
      const guardDecision = res.data.guard_decision;
      const guardCategory = res.data.guard_category;

      addMessage('assistant', assistantResponse, {
        guard_decision: guardDecision,
        guard_category: guardCategory,
      });

      if (guardDecision === 'block') {
        toast('This topic is outside my medical scope. Please ask about health-related topics.', {
          icon: '🏥',
          style: { background: '#fef3c7', color: '#92400e' },
        });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to get response. Please try again.';
      addMessage('assistant', `**Error:** ${msg}`);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
      // Focus back into input
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isSubmitting]);

  // Handle suggestion click
  const handleSuggestionClick = (question: string) => {
    setMessageText(question);
    sendUserMessage();
  };

  // Copy message to clipboard
  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Copied to clipboard!');
    } catch {
      toast.error('Failed to copy');
    }
  };

  // Format timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Check Ollama health
  const checkOllamaStatus = async () => {
    setOllamaChecking(true);
    try {
      const res = await api.get('/api/chat/health');
      setIsOllamaHealthy(res.data.ollama_connected);
    } catch {
      setIsOllamaHealthy(false);
    } finally {
      setOllamaChecking(false);
    }
  };

  // Welcome content - extracted to avoid TSX conditional complexity
  const welcomeContent = showWelcome && messages.length === 0 ? (
    <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center mx-auto mb-4">
        <Bot className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-ink-900 dark:text-cream-100 mb-2">
        Welcome to Medi AI
      </h3>
      <p className="text-sm text-ink-500 dark:text-cream-300/70 max-w-xs mx-auto mb-4">
        I'm your personal health assistant. Ask me about your predictions, medicines, diet, or any health questions.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge variant="info" className="text-xs">Symptoms & Conditions</Badge>
        <Badge variant="info" className="text-xs">Medicines & Dosage</Badge>
        <Badge variant="info" className="text-xs">Diet & Nutrition</Badge>
        <Badge variant="info" className="text-xs">Appointments</Badge>
      </div>
    </div>
  ) : null;

  return (
    <TooltipProvider>
      <Card className="min-h-screen flex flex-col h-full max-w-3xl mx-auto">
        {/* Header */}
        <CardHeader className="pb-4 border-b border-cream-200 dark:border-ink-800">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-ink-900 dark:text-cream-100">Medi AI</h1>
                <p className="text-xs text-ink-500 dark:text-cream-300/70">
                  Your MediAssist Health Assistant
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Ollama Status Indicator */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={checkOllamaStatus}
                disabled={ollamaChecking}
                title={ollamaChecking ? 'Checking...' : isOllamaHealthy ? 'Medi AI Ready' : 'Ollama Unavailable'}
              >
                {ollamaChecking ? (
                  <Loader2 className="h-4 w-4 animate-spin text-ink-400" />
                ) : isOllamaHealthy ? (
                  <span className="flex items-center gap-1.5 text-secondary-600 dark:text-secondary-400">
                    <span className="w-2 h-2 rounded-full bg-secondary-500" />
                    <Shield className="h-3.5 w-3.5" />
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-red-500">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <AlertCircle className="h-3.5 w-3.5" />
                  </span>
                )}
              </Button>

              {/* Clear Chat */}
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => {
                    setMessages([]);
                    setShowWelcome(true);
                    setShowSuggestions(true);
                  }}
                  title="Clear conversation"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}

              {/* Logout */}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={logout} title="Logout">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 p-0">
          <div className="h-[calc(100vh-280px)] min-h-[400px] max-h-[600px] p-4 overflow-y-auto">
            <div className="space-y-4" ref={scrollAreaRef}>
              {welcomeContent}

              {/* Messages */}
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex',
                      msg.role === 'user'
                        ? 'justify-end items-start'
                        : 'justify-start items-end'
                      )}
                  >
                    <div
                      className={cn(
                        'flex flex-col max-w-[80%] gap-1',
                        msg.role === 'user'
                          ? 'items-end'
                          : 'items-start'
                        )}
                    >
                      {/* Message bubble */}
                      <div
                        className={cn(
                          'max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                          msg.role === 'user'
                            ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100 rounded-br-md'
                            : 'bg-cream-100 dark:bg-ink-950 text-ink-900 dark:text-cream-100 rounded-bl-md'
                        )}
                      >
                        <div className="prose prose-sm dark:prose-invert max-w-none">
                          {msg.content.split('\n').map((line, i) => (
                            <p key={i} className="whitespace-pre-wrap">{line}</p>
                          ))}
                        </div>
                      </div>

                      {/* Metadata & Actions */}
                      <div className="flex items-center gap-2 mt-1 px-1">
                        <span className="text-[10px] text-ink-400 dark:text-cream-300/50">
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        {msg.metadata?.guard_decision && (
                          <Badge
                            variant={msg.metadata.guard_decision === 'block' ? 'danger' : 'info'}
                            className="text-[10px] px-1.5 py-0.5"
                          >
                            {msg.metadata.guard_category || msg.metadata.guard_decision}
                          </Badge>
                        )}

                        {msg.role === 'assistant' && (
                          <button
                            onClick={() => copyToClipboard(msg.content)}
                            className="p-1 rounded hover:bg-cream-200 dark:hover:bg-ink-800 transition-colors"
                            aria-label="Copy message"
                            title="Copy message"
                          >
                            <Copy className="h-3.5 w-3.5 text-ink-400 dark:text-cream-300/50" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submitting indicator */}
              {isSubmitting && (
                <div className="flex justify-start items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-cream-100 dark:bg-ink-950 rounded-2xl rounded-bl-md">
                    <span className="text-sm text-ink-500 dark:text-cream-300/70">Medi AI is thinking...</span>
                  </div>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>

          {/* Input Area */}
          <CardFooter className="p-4 border-t border-cream-200 dark:border-ink-800">
            {/* Suggested Questions */}
            {(showSuggestions && messages.length === 0 && !isSubmitting) && (
              <div className="mb-3">
                <p className="text-xs text-ink-500 dark:text-cream-300/60 mb-2 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" /> Try asking:
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
                    <Button
                      key={q}
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 px-3"
                      onClick={() => handleSuggestionClick(q)}
                      disabled={isSubmitting}
                    >
                      {q}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={(e) => { e.preventDefault(); sendUserMessage(); }} className="flex gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 shrink-0"
                    onClick={checkOllamaStatus}
                    disabled={ollamaChecking}
                  >
                    {ollamaChecking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isOllamaHealthy ? (
                      <HeartPulse className="h-5 w-5 text-secondary-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  {ollamaChecking ? 'Checking...' : isOllamaHealthy ? 'Ollama connected' : 'Ollama unavailable'}
                </TooltipContent>
              </Tooltip>

              <Input
                ref={inputRef}
                placeholder={isOllamaHealthy ? "Ask Medi AI about your health..." : "Ollama unavailable - please start Ollama first"}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                disabled={isSubmitting || !isOllamaHealthy}
                className="flex-1 rounded-xl border border-cream-300 dark:border-ink-700 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-primary-100"
                aria-label="Message input"
                rows={1}
                maxRows={4}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendUserMessage();
                  }
                }}
              />

              <Button
                type="submit"
                disabled={isSubmitting || !messageText.trim() || !isOllamaHealthy}
                className="h-10 w-10 rounded-xl shrink-0"
                aria-label="Send message"
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>

            {/* Disclaimer */}
            <p className="mt-3 text-center text-[11px] text-ink-400 dark:text-cream-300/50">
              Medi AI is an AI assistant, not a doctor. For medical emergencies, call emergency services immediately.
            </p>
          </CardFooter>
        </Card>
      </TooltipProvider>
    );
  }