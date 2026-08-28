'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/cn';
import { useMounted } from '@/hooks/useMounted';

import {
  Send,
  Loader2,
  Sparkles,
  Shield,
  AlertCircle,
  Copy,
  Check,
  HeartPulse,
  Bot,
  Settings,
  Plus,
  Search,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
  Trash2,
  Clock,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';

const SUGGESTED_QUESTIONS = [
  'Explain my prediction',
  'What does my medicine do?',
  'What should I eat?',
  'How can I stay hydrated?',
  'What symptoms should I watch for?',
  'Help me prepare for my doctor appointment',
  'When should I see a doctor?',
  'How do I book an appointment?',
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

interface Conversation {
  id: string;
  title: string;
  preview: string;
  createdAt: Date;
  messages: Message[];
}

function InlineMarkdown({ content }: { content: string }) {
  // lightweight markdown: headings, bold, bullet/numbered lists, paragraphs
  const lines = content.split('\n');
  const els: React.ReactNode[] = [];
  let listBuffer: { type: 'ul' | 'ol'; items: string[] } | null = null;

  const flushList = () => {
    if (!listBuffer) return;
    if (listBuffer.type === 'ul') {
      els.push(
        <ul key={`ul-${els.length}`} className="list-disc pl-5 space-y-1 my-2">
          {listBuffer.items.map((it, i) => (
            <li key={i} className="leading-relaxed">
              <BoldText text={it} />
            </li>
          ))}
        </ul>
      );
    } else {
      els.push(
        <ol key={`ol-${els.length}`} className="list-decimal pl-5 space-y-1 my-2">
          {listBuffer.items.map((it, i) => (
            <li key={i} className="leading-relaxed">
              <BoldText text={it} />
            </li>
          ))}
        </ol>
      );
    }
    listBuffer = null;
  };

  const parseBoldParts = (text: string) => {
    // used by BoldText
    return text;
  };

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushList();
      return;
    }
    // heading
    const h = line.match(/^(#{1,3})\s+(.*)$/);
    if (h) {
      flushList();
      const level = h[1].length;
      const text = h[2];
      if (level === 1) els.push(<h3 key={idx} className="text-base font-semibold mt-3 mb-1"><BoldText text={text} /></h3>);
      else if (level === 2) els.push(<h4 key={idx} className="text-sm font-semibold mt-3 mb-1"><BoldText text={text} /></h4>);
      else els.push(<h5 key={idx} className="text-sm font-semibold mt-2 mb-1"><BoldText text={text} /></h5>);
      return;
    }
    // bullet
    const ul = line.match(/^\s*[-*•]\s+(.*)$/);
    if (ul) {
      if (!listBuffer || listBuffer.type !== 'ul') { flushList(); listBuffer = { type: 'ul', items: [] }; }
      listBuffer.items.push(ul[1]);
      return;
    }
    const ol = line.match(/^\s*\d+[.)]\s+(.*)$/);
    if (ol) {
      if (!listBuffer || listBuffer.type !== 'ol') { flushList(); listBuffer = { type: 'ol', items: [] }; }
      listBuffer.items.push(ol[1]);
      return;
    }
    flushList();
    els.push(<p key={idx} className="leading-relaxed my-1.5 whitespace-pre-wrap break-words"><BoldText text={line.trim()} /></p>);
  });
  flushList();
  return <div className="space-y-0.5">{els}</div>;
}

function BoldText({ text }: { text: string }) {
  // render **bold** segments
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith('**') && p.endsWith('**') && p.length >= 4) {
          return <strong key={i} className="font-semibold text-ink-900 dark:text-cream-100">{p.slice(2, -2)}</strong>;
        }
        return <span key={i}>{p}</span>;
      })}
    </>
  );
}

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1.5 py-1">
      <span className="h-2 w-2 rounded-full bg-ink-400 dark:bg-cream-300/60 animate-bounce [animation-delay:0ms]" />
      <span className="h-2 w-2 rounded-full bg-ink-400 dark:bg-cream-300/60 animate-bounce [animation-delay:150ms]" />
      <span className="h-2 w-2 rounded-full bg-ink-400 dark:bg-cream-300/60 animate-bounce [animation-delay:300ms]" />
    </span>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, logout } = useAuth();
  const mounted = useMounted();

  const diseaseParam = searchParams?.get('disease') || null;
  const specialistParam = searchParams?.get('specialist') || null;

  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageTextState] = useState('');
  const messageTextRef = useRef('');
  const setMessageText = useCallback((v: string) => {
    messageTextRef.current = v;
    setMessageTextState(v);
  }, []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOllamaHealthy, setIsOllamaHealthy] = useState(true);
  const [ollamaChecking, setOllamaChecking] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Ollama health
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

  const scrollToBottom = useCallback(() => {
    if (mounted && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [mounted]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSubmitting, scrollToBottom]);

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const max = 160;
    el.style.height = Math.min(el.scrollHeight, max) + 'px';
  }, []);

  useEffect(() => {
    autoResize();
  }, [messageText, autoResize]);

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
  }, []);

  const handleNewChat = useCallback(() => {
    if (messages.length > 0) {
      const title = messages.find((m) => m.role === 'user')?.content.slice(0, 42) || 'New conversation';
      const preview = messages[messages.length - 1]?.content.slice(0, 64) || '';
      const conv: Conversation = {
        id: activeConversationId || `${Date.now()}`,
        title: title.length > 42 ? title.slice(0, 42) + '…' : title,
        preview,
        createdAt: new Date(),
        messages,
      };
      setConversations((prev) => [conv, ...prev]);
    }
    setMessages([]);
    setMessageText('');
    setActiveConversationId(null);
    setMobileOpen(false);
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [messages, activeConversationId, setMessageText]);

  const handleSelectConversation = (conv: Conversation) => {
    // save current before switching if it has content
    if (messages.length > 0 && activeConversationId !== conv.id) {
      const title = messages.find((m) => m.role === 'user')?.content.slice(0, 42) || 'New conversation';
      const preview = messages[messages.length - 1]?.content.slice(0, 64) || '';
      setConversations((prev) => [
        { id: activeConversationId || `${Date.now()}`, title, preview, createdAt: new Date(), messages },
        ...prev.filter((c) => c.id !== conv.id),
      ]);
    }
    setMessages(conv.messages);
    setActiveConversationId(conv.id);
    setMobileOpen(false);
  };

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

  const sendUserMessage = useCallback(async () => {
    const trimmed = messageTextRef.current.trim();
    if (!trimmed || isSubmitting) return;
    messageTextRef.current = '';
    setMessageTextState('');
    requestAnimationFrame(autoResize);
    setIsSubmitting(true);

    addMessage('user', trimmed);

    try {
      const payload: Record<string, unknown> = { message: trimmed };
      if (diseaseParam) {
        payload.context = { disease: diseaseParam, specialist: specialistParam, source: 'prediction' };
      }
      const res = await api.post('/api/chat', payload, { withCredentials: true });
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
      const msg = err?.response?.data?.detail || err?.message || 'Failed to get response. Please try again.';
      addMessage('assistant', `**Error:** ${msg}`);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isSubmitting, addMessage, autoResize, diseaseParam, specialistParam]);

  const handleSuggestionClick = (question: string) => {
    setMessageText(question);
    // send after state sync via ref
    setTimeout(() => {
      const el = inputRef.current;
      if (el) el.focus();
      // trigger send using ref already set
      // call directly
      const trimmed = question.trim();
      if (!trimmed) return;
      // inline send to avoid race
      // reuse sendUserMessage but ensure ref is set
      messageTextRef.current = question;
      setMessageTextState(question);
      // small delay to let ref propagate then send
      setTimeout(() => sendUserMessage(), 0);
    }, 0);
  };

  const copyToClipboard = async (content: string, id: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedId(null), 1500);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const filteredConversations = conversations.filter((c) => {
    if (!historySearch.trim()) return true;
    const q = historySearch.toLowerCase();
    return c.title.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q);
  });

  const todayConversations = filteredConversations.filter((c) => {
    const d = new Date(c.createdAt);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });
  const previousConversations = filteredConversations.filter((c) => {
    const d = new Date(c.createdAt);
    const now = new Date();
    return d.toDateString() !== now.toDateString();
  });

  const hasMessages = messages.length > 0;

  return (
    <TooltipProvider>
      <div className="flex h-[100dvh] overflow-hidden bg-cream-50 dark:bg-ink-950">
        {/* Desktop sidebar */}
        <aside
          className={cn(
            'hidden lg:flex shrink-0 flex-col border-r border-cream-200 dark:border-ink-800 bg-white dark:bg-ink-900 transition-all duration-300 ease-in-out overflow-hidden',
            sidebarCollapsed ? 'w-0 border-r-0' : 'w-[280px]'
          )}
        >
          <div className="flex flex-col h-full">
            <div className="p-3">
              <button
                onClick={handleNewChat}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-4 text-sm shadow-sm transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </button>
            </div>

            <div className="px-3 pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 dark:text-cream-300/50" />
                <input
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="Search conversations"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-cream-100 dark:bg-ink-800 border border-cream-200 dark:border-ink-700 text-sm text-ink-900 dark:text-cream-100 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-5">
              {filteredConversations.length === 0 ? (
                <div className="text-center py-8 px-3">
                  <MessageSquare className="h-8 w-8 mx-auto text-ink-300 dark:text-cream-300/30 mb-2" />
                  <p className="text-sm text-ink-500 dark:text-cream-300/60">No conversations yet</p>
                  <p className="text-xs text-ink-400 dark:text-cream-300/40 mt-1">Your chats in this session will appear here. They are not permanently stored.</p>
                </div>
              ) : (
                <>
                  {todayConversations.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold tracking-widest uppercase text-ink-400 dark:text-cream-300/50 px-2 mb-2">Today</p>
                      <div className="space-y-1">
                        {todayConversations.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => handleSelectConversation(c)}
                            className={cn(
                              'w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-colors',
                              activeConversationId === c.id
                                ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800 text-ink-900 dark:text-cream-100'
                                : 'bg-cream-50 dark:bg-ink-800 border-transparent hover:bg-cream-100 dark:hover:bg-ink-800 text-ink-700 dark:text-cream-200'
                            )}
                          >
                            <p className="font-medium truncate text-sm">{c.title}</p>
                            <p className="text-xs text-ink-500 dark:text-cream-300/60 truncate mt-0.5">{c.preview}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {previousConversations.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold tracking-widest uppercase text-ink-400 dark:text-cream-300/50 px-2 mb-2">Previous</p>
                      <div className="space-y-1">
                        {previousConversations.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => handleSelectConversation(c)}
                            className={cn(
                              'w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-colors',
                              activeConversationId === c.id
                                ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800 text-ink-900 dark:text-cream-100'
                                : 'bg-cream-50 dark:bg-ink-800 border-transparent hover:bg-cream-100 dark:hover:bg-ink-800 text-ink-700 dark:text-cream-200'
                            )}
                          >
                            <p className="font-medium truncate text-sm">{c.title}</p>
                            <p className="text-xs text-ink-500 dark:text-cream-300/60 truncate mt-0.5 flex items-center gap-1">
                              <Clock className="h-3 w-3 shrink-0" />
                              {new Date(c.createdAt).toLocaleDateString()}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-3 border-t border-cream-200 dark:border-ink-800">
              <div className="flex items-center gap-3 px-2 py-2">
                <div className="h-8 w-8 rounded-full bg-ink-900 dark:bg-cream-100 flex items-center justify-center text-white dark:text-ink-900 text-xs font-bold">
                  {(user?.full_name || 'U').slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-ink-900 dark:text-cream-100">{user?.full_name || 'Patient'}</p>
                  <p className="text-xs truncate text-ink-500 dark:text-cream-300/60">{user?.email || ''}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-ink-950/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="relative w-[300px] max-w-[85vw] bg-white dark:bg-ink-900 border-r border-cream-200 dark:border-ink-800 flex flex-col h-full shadow-lift">
              <div className="flex items-center justify-between px-4 h-14 border-b border-cream-200 dark:border-ink-800">
                <span className="font-semibold text-ink-900 dark:text-cream-100 flex items-center gap-2"><Bot className="h-5 w-5 text-primary-600" /> Medi AI</span>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl hover:bg-cream-100 dark:hover:bg-ink-800">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="p-3">
                <button
                  onClick={handleNewChat}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 px-4 text-sm"
                >
                  <Plus className="h-4 w-4" /> New Chat
                </button>
              </div>
              <div className="px-3 pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                  <input
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search conversations"
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-cream-100 dark:bg-ink-800 border border-cream-200 dark:border-ink-700 text-sm"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-4">
                {filteredConversations.length === 0 ? (
                  <p className="text-sm text-ink-500 dark:text-cream-300/60 text-center py-8">No conversations yet</p>
                ) : (
                  filteredConversations.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => handleSelectConversation(c)}
                      className="w-full text-left px-3 py-2.5 rounded-xl bg-cream-50 dark:bg-ink-800 border border-cream-200 dark:border-ink-700"
                    >
                      <p className="font-medium truncate text-sm text-ink-900 dark:text-cream-100">{c.title}</p>
                      <p className="text-xs text-ink-500 truncate">{c.preview}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main chat */}
        <div className="flex flex-1 flex-col min-w-0 min-h-0">
          {/* Header */}
          <header className="h-14 shrink-0 border-b border-cream-200 dark:border-ink-800 bg-white/80 dark:bg-ink-900/80 backdrop-blur-xl flex items-center justify-between gap-3 px-4 lg:px-6">
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => (window.innerWidth < 1024 ? setMobileOpen(true) : setSidebarCollapsed((v) => !v))}
                className="p-2 rounded-xl hover:bg-cream-100 dark:hover:bg-ink-800 text-ink-600 dark:text-cream-300"
                aria-label="Toggle sidebar"
              >
                <span className="hidden lg:block">
                  {sidebarCollapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                </span>
                <span className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </span>
              </button>

              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center shrink-0">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-sm font-semibold leading-none text-ink-900 dark:text-cream-100 flex items-center gap-2">
                    Medi AI
                    <span className={cn('h-2 w-2 rounded-full', isOllamaHealthy ? 'bg-secondary-500' : 'bg-red-500 animate-pulse')} />
                    <span className={cn('text-xs font-medium', isOllamaHealthy ? 'text-secondary-600 dark:text-secondary-400' : 'text-red-600 dark:text-red-400')}>
                      {ollamaChecking ? 'Checking…' : isOllamaHealthy ? 'Online' : 'Offline'}
                    </span>
                  </h1>
                  <p className="text-xs text-ink-500 dark:text-cream-300/60 truncate">MediAssist Health Assistant</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9"
                    onClick={checkOllamaStatus}
                    disabled={ollamaChecking}
                    aria-label="Check connection"
                  >
                    {ollamaChecking ? <Loader2 className="h-4 w-4 animate-spin" /> : isOllamaHealthy ? <HeartPulse className="h-4 w-4 text-secondary-600" /> : <AlertCircle className="h-4 w-4 text-red-500" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{ollamaChecking ? 'Checking…' : isOllamaHealthy ? 'Ollama connected' : 'Ollama unavailable'}</TooltipContent>
              </Tooltip>

              {hasMessages && (
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={handleNewChat} title="New chat">
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}

              <Button variant="ghost" size="icon" className="h-9 w-9 hidden sm:flex" onClick={logout} title="Logout">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Prediction context */}
          {diseaseParam && (
            <div className="shrink-0 bg-primary-50 dark:bg-primary-900/20 border-b border-primary-100 dark:border-primary-900/40 px-4 lg:px-6 py-2 flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white dark:bg-ink-900 border border-primary-200 dark:border-primary-800 text-primary-700 dark:text-primary-300 text-xs font-medium">
                <Sparkles className="h-3 w-3" /> Discussing: {diseaseParam}
                {specialistParam ? ` • ${specialistParam}` : ''}
              </span>
              <button onClick={() => router.push('/chat')} className="ml-auto text-xs text-ink-500 hover:text-ink-700 dark:text-cream-300/60">
                Clear context
              </button>
            </div>
          )}

          {/* Messages */}
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto bg-cream-50 dark:bg-ink-950">
            <div className="max-w-3xl mx-auto w-full px-4 lg:px-6 py-6 lg:py-8">
              {!hasMessages && !isSubmitting ? (
                <div className="flex flex-col items-center justify-center min-h-[52vh] text-center py-8">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center mb-4 shadow-soft">
                    <Bot className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold text-ink-900 dark:text-cream-100">Medi AI</h2>
                  <p className="text-sm font-medium text-primary-600 dark:text-primary-300 mt-1">Your personal MediAssist health assistant</p>
                  <p className="text-sm text-ink-600 dark:text-cream-300/70 max-w-md mt-3 leading-relaxed">
                    Ask about your MediAssist prediction, medicines, diet, symptoms, appointments, or general health information.
                  </p>
                  {diseaseParam && (
                    <div className="mt-4 px-3 py-2 rounded-xl bg-white dark:bg-ink-900 border border-cream-200 dark:border-ink-700 text-sm text-ink-700 dark:text-cream-200">
                      Continue the conversation about <strong>{diseaseParam}</strong> — ask anything you want to know.
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl mt-8">
                    {SUGGESTED_QUESTIONS.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSuggestionClick(q)}
                        className="text-left px-4 py-3 rounded-2xl bg-white dark:bg-ink-900 border border-cream-200 dark:border-ink-800 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-colors text-sm text-ink-700 dark:text-cream-200 flex items-center gap-2.5 group"
                      >
                        <span className="h-7 w-7 rounded-lg bg-cream-100 dark:bg-ink-800 flex items-center justify-center shrink-0 group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 transition-colors">
                          <Sparkles className="h-3.5 w-3.5 text-ink-500 dark:text-cream-300/70" />
                        </span>
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {messages.map((msg) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div key={msg.id} className={cn('flex w-full', isUser ? 'justify-end' : 'justify-start')}>
                        <div className={cn('flex gap-3 max-w-[88%] sm:max-w-[78%]', isUser ? 'flex-row-reverse' : 'flex-row')}>
                          {!isUser && (
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center shrink-0 mt-1">
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                          )}
                          <div className={cn('flex flex-col gap-1.5 min-w-0', isUser ? 'items-end' : 'items-start')}>
                            <div
                              className={cn(
                                'rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm border break-words',
                                isUser
                                  ? 'bg-primary-600 text-white border-primary-600 rounded-br-md'
                                  : 'bg-white dark:bg-ink-900 text-ink-900 dark:text-cream-100 border-cream-200 dark:border-ink-800 rounded-bl-md'
                              )}
                            >
                              {isUser ? (
                                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                              ) : (
                                <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-strong:text-ink-900 dark:prose-strong:text-cream-100">
                                  <InlineMarkdown content={msg.content} />
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-2 px-1">
                              <span className="text-[11px] text-ink-400 dark:text-cream-300/50">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {msg.metadata?.guard_decision && (
                                <Badge variant={msg.metadata.guard_decision === 'block' ? 'danger' : 'info'} className="text-[10px] px-1.5 py-0">
                                  {msg.metadata.guard_category || msg.metadata.guard_decision}
                                </Badge>
                              )}
                              {!isUser && (
                                <button
                                  onClick={() => copyToClipboard(msg.content, msg.id)}
                                  className="p-1 rounded-md hover:bg-cream-200 dark:hover:bg-ink-800 transition-colors"
                                  aria-label="Copy"
                                  title="Copy"
                                >
                                  {copiedId === msg.id ? <Check className="h-3.5 w-3.5 text-secondary-600" /> : <Copy className="h-3.5 w-3.5 text-ink-400 dark:text-cream-300/50" />}
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {isSubmitting && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 max-w-[78%]">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center shrink-0">
                          <Bot className="h-4 w-4 text-white" />
                        </div>
                        <div className="bg-white dark:bg-ink-900 border border-cream-200 dark:border-ink-800 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                          <TypingDots />
                        </div>
                      </div>
                    </div>
                  )}

                  {!isOllamaHealthy && !ollamaChecking && hasMessages && (
                    <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 px-4 py-3 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-red-800 dark:text-red-300">Medi AI is currently unavailable.</p>
                        <p className="text-xs text-red-700/80 dark:text-red-300/70 mt-1">Please make sure Ollama is running and try again.</p>
                      </div>
                      <Button size="sm" variant="outline" onClick={checkOllamaStatus} className="shrink-0">
                        Retry
                      </Button>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Composer */}
          <div className="shrink-0 bg-white dark:bg-ink-900 border-t border-cream-200 dark:border-ink-800">
            <div className="max-w-3xl mx-auto w-full px-4 lg:px-6 py-3 lg:py-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendUserMessage();
                }}
                className="relative flex items-end gap-2 bg-cream-50 dark:bg-ink-800 border border-cream-200 dark:border-ink-700 rounded-[20px] px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-300 dark:focus-within:border-primary-700 transition-all"
              >
                <textarea
                  ref={inputRef}
                  value={messageText}
                  onChange={(e) => {
                    setMessageText(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendUserMessage();
                    }
                  }}
                  placeholder={isOllamaHealthy ? 'Ask Medi AI about your health…' : 'Ollama unavailable — please start Ollama first'}
                  disabled={isSubmitting || !isOllamaHealthy}
                  rows={1}
                  className="flex-1 max-h-[160px] min-h-[24px] bg-transparent border-0 resize-none outline-none py-1.5 px-1 text-sm leading-6 placeholder-ink-400 dark:placeholder-cream-300/40 text-ink-900 dark:text-cream-100 disabled:opacity-50"
                  aria-label="Message input"
                  style={{ height: 'auto' }}
                />
                <Button
                  type="submit"
                  disabled={isSubmitting || !messageText.trim() || !isOllamaHealthy}
                  className="h-9 w-9 rounded-full shrink-0 p-0"
                  aria-label="Send message"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
              <p className="text-center text-[11px] leading-none text-ink-400 dark:text-cream-300/50 mt-2.5 px-2">
                Medi AI provides health information, not a diagnosis or substitute for professional medical advice. For emergencies, call emergency services immediately.
              </p>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
