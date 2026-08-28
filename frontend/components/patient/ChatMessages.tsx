'use client';

import React from 'react';
import { cn } from '@/lib/cn';
import { Bot, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

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

function MessageContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      {content.split('\n').map((line, index) => (
        <p key={index} className="whitespace-pre-wrap">
          {line || '\u00A0'}
        </p>
      ))}
    </div>
  );
}

export function ChatMessages({
  messages,
  showWelcome,
  isSubmitting,
  messagesEndRef,
  onCopyMessage,
}: ChatMessagesProps) {
  const shouldShowWelcome = showWelcome && messages.length === 0;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Welcome */}
      {shouldShowWelcome && (
        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center mx-auto mb-4">
            <Bot className="h-8 w-8 text-white" />
          </div>

          <h3 className="text-lg font-semibold text-ink-900 dark:text-cream-100 mb-2">
            Welcome to Medi AI
          </h3>

          <p className="text-sm text-ink-500 dark:text-cream-300/70 max-w-xs mx-auto mb-4">
            I&apos;m your personal health assistant. Ask me about your
            predictions, medicines, diet, or other health questions.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge variant="info" className="text-xs">
              Symptoms &amp; Conditions
            </Badge>

            <Badge variant="info" className="text-xs">
              Medicines &amp; Dosage
            </Badge>

            <Badge variant="info" className="text-xs">
              Diet &amp; Nutrition
            </Badge>

            <Badge variant="info" className="text-xs">
              Appointments
            </Badge>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {messages.map((message) => {
          const isUser = message.role === 'user';

          return (
            <div
              key={message.id}
              className={cn(
                'flex w-full',
                isUser
                  ? 'justify-end'
                  : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'flex flex-col gap-1 max-w-[80%]',
                  isUser
                    ? 'items-end'
                    : 'items-start'
                )}
              >
                {/* Message bubble */}
                <div
                  className={cn(
                    'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
                    isUser
                      ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-100 rounded-br-md'
                      : 'bg-cream-100 dark:bg-ink-950 text-ink-900 dark:text-cream-100 rounded-bl-md'
                  )}
                >
                  <MessageContent content={message.content} />
                </div>

                {/* Metadata and actions */}
                <div className="flex items-center gap-2 mt-1 px-1">
                  <span className="text-[10px] text-ink-400 dark:text-cream-300/50">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>

                  {message.metadata?.guard_decision && (
                    <Badge
                      variant={
                        message.metadata.guard_decision === 'block'
                          ? 'danger'
                          : 'info'
                      }
                      className="text-[10px] px-1.5 py-0.5"
                    >
                      {message.metadata.guard_category ||
                        message.metadata.guard_decision}
                    </Badge>
                  )}

                  {message.role === 'assistant' && (
                    <button
                      type="button"
                      onClick={() => onCopyMessage(message.content)}
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
          );
        })}

        {/* AI loading indicator */}
        {isSubmitting && (
          <div className="flex justify-start">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-400 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>

              <div className="flex items-center gap-2 px-4 py-2.5 bg-cream-100 dark:bg-ink-950 rounded-2xl rounded-bl-md">
                <span className="text-sm text-ink-500 dark:text-cream-300/70">
                  Medi AI is thinking...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}