'use client';

import { useRef } from 'react';
import { cn } from '@/lib/cn';
import { Bot, AlertCircle, Copy, Loader2, HeartPulse, Stethoscope } from 'lucide-react';
import { CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Label, Field } from '@/components/ui/Form';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api';
import toast from 'react-hot-toast';
import { useMounted } from '@/hooks/useMounted';

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

interface ChatMessagesProps {
  messages: Message[];
  showWelcome: boolean;
  isSubmitting: boolean;
  isOllamaHealthy: boolean;
  ollamaChecking: boolean;
  onSendMessage: (text: string) => void;
  onCheckOllamaStatus: () => void;
  onClearMessages: () => void;
  onSuggestionClick: (question: string) => void;
  onCopyMessage: (content: string) => void;
  messageTextRef: React.RefObject<HTMLTextAreaElement>;
  inputRef: React.RefObject<HTMLTextAreaElement>;
  scrollAreaRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  setMessageText: (value: string) => void;
  setIsSubmitting: (value: boolean) => void;
  setError: (value: string | null) => void;
  setShowSuggestions: (value: boolean) => void;
  setShowWelcome: (value: boolean) => void;
  setIsOllamaHealthy: (value: boolean) => void;
  setOllamaChecking: (value: boolean) => void;
  error: string | null;
  showSuggestions: boolean;
}

export function ChatMessages({
  messages,
  showWelcome,
  isSubmitting,
  isOllamaHealthy,
  ollamaChecking,
  onSendMessage,
  onCheckOllamaStatus,
  onClearMessages,
  onSuggestionClick,
  onCopyMessage,
  messageTextRef,
  inputRef,
  scrollAreaRef,
  messagesEndRef,
  setMessageText,
  setIsSubmitting,
  setError,
  setShowSuggestions,
  setShowWelcome,
  setIsOllamaHealthy,
  setOllamaChecking,
  error,
  showSuggestions,
}: ChatMessagesProps) {
  // Welcome content
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
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Badge variant="info" className="text-xs">Symptoms & Conditions</Badge>
        <Badge variant="info" className="text-xs">Medicines & Dosage</Badge>
        <Badge variant="info" className="text-xs">Diet & Nutrition</Badge>
        <Badge variant="info" className="text-xs">Appointments</Badge>
      </div>
    </div>
  ) : null;

  return (
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
                        onClick={() => onCopyMessage(msg.content)}
                        className="p-1 rounded hover:bg-cream-200 dark:hover:bg-ink-800 transition-colors"
                        aria-label="Copy message"
                        title="Copy message"
                      >
                        <Copy className="h-3.5 w-3.5 text-ink-400 dark:text-cream-300/50" />
                      </button>
                    )}
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
  );
}