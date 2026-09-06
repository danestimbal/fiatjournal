import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  ReflectionMode,
  ReflectionSession,
  ReflectionTurn,
  UserProfile,
} from '../types';
import {
  Send,
  Sparkles,
  Brain,
  FileText,
  Copy,
  Check,
  RotateCw,
  Lightbulb,
  Tag,
  Clock,
  User as UserIcon,
  Shield,
  HelpCircle,
  AlertCircle,
  Save,
} from 'lucide-react';

interface ReflectionWorkspaceProps {
  session: ReflectionSession;
  user: UserProfile;
  onSendMessage: (content: string, mode: ReflectionMode) => Promise<void>;
  onSummarizeSession: () => Promise<void>;
  onUpdateTitle: (newTitle: string) => void;
  onChangeMode: (newMode: ReflectionMode) => void;
  isGenerating: boolean;
  isSummarizing: boolean;
  isSaving: boolean;
}

const PROMPT_SUGGESTIONS: Record<ReflectionMode, string[]> = {
  reflection: [
    'What was the most meaningful part of my day, and why?',
    'I am feeling conflicted about a recent decision...',
    'What is a belief I held recently that might need re-examination?',
    'How did I handle stress or uncertainty today?',
  ],
  brainstorm: [
    'Brainstorm 5 innovative ways to tackle my current challenge...',
    'What are alternative perspectives or contrarian angles on this?',
    'What would this look like if it were frictionless and simple?',
    'Brainstorm next experiments to test this hypothesis...',
  ],
  summary: [
    'Synthesize the key lessons and actionable insights from today...',
    'Extract the top 3 commitments I should focus on tomorrow...',
    'Summarize my emotional and mental state from this week...',
  ],
};

export const ReflectionWorkspace: React.FC<ReflectionWorkspaceProps> = ({
  session,
  user,
  onSendMessage,
  onSummarizeSession,
  onUpdateTitle,
  onChangeMode,
  isGenerating,
  isSummarizing,
  isSaving,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedTurnId, setCopiedTurnId] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(session.title);

  const turnsEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTitleInput(session.title);
  }, [session.title]);

  useEffect(() => {
    turnsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session.turns.length, isGenerating]);

  const handleTitleSubmit = () => {
    const trimmed = titleInput.trim();
    if (trimmed && trimmed !== session.title) {
      onUpdateTitle(trimmed);
    }
    setIsEditingTitle(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    const content = inputText.trim();
    if (!content || isGenerating) return;
    setInputText('');
    await onSendMessage(content, session.mode);
  };

  const copyToClipboard = (text: string, turnId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTurnId(turnId);
    setTimeout(() => setCopiedTurnId(null), 2000);
  };

  return (
    <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-stone-100/60 overflow-hidden">
      {/* Session Top Bar */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-6 py-3 shrink-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Title and Editing */}
          <div className="flex items-center space-x-2 min-w-0">
            {isEditingTitle ? (
              <input
                id="edit-session-title-input"
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onBlur={handleTitleSubmit}
                onKeyDown={(e) => e.key === 'Enter' && handleTitleSubmit()}
                autoFocus
                className="text-base font-semibold text-stone-900 border border-stone-300 rounded-md px-2 py-0.5 focus:outline-hidden focus:ring-2 focus:ring-stone-400 max-w-md"
              />
            ) : (
              <div
                id="session-title-display"
                onClick={() => setIsEditingTitle(true)}
                className="group flex items-center space-x-2 cursor-pointer max-w-md truncate"
                title="Click to rename"
              >
                <h1 className="text-base font-semibold text-stone-900 truncate">
                  {session.title || 'Untitled Session'}
                </h1>
                <span className="text-xs text-stone-400 group-hover:text-stone-600 underline decoration-dotted">
                  Rename
                </span>
              </div>
            )}

            <div className="flex items-center space-x-1.5 pl-2 text-xs text-stone-400">
              {isSaving ? (
                <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                  <RotateCw className="w-3 h-3 animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
                  <Save className="w-3 h-3" />
                  Firestore Saved
                </span>
              )}
            </div>
          </div>

          {/* Mode Selector & Summarize Action */}
          <div className="flex items-center flex-wrap gap-2">
            <div className="inline-flex rounded-lg border border-stone-200 bg-stone-50 p-0.5">
              {(
                [
                  { id: 'reflection', label: 'Reflect', icon: Sparkles },
                  { id: 'brainstorm', label: 'Brainstorm', icon: Brain },
                  { id: 'summary', label: 'Summarize', icon: FileText },
                ] as const
              ).map((m) => {
                const Icon = m.icon;
                const isActive = session.mode === m.id;
                return (
                  <button
                    key={m.id}
                    id={`mode-select-${m.id}`}
                    onClick={() => onChangeMode(m.id)}
                    className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            <button
              id="summarize-session-btn"
              onClick={onSummarizeSession}
              disabled={session.turns.length === 0 || isSummarizing}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-medium transition-colors shadow-2xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Generate a high-level summary and key insights with Gemini"
            >
              <Sparkles
                className={`w-3.5 h-3.5 text-amber-300 ${
                  isSummarizing ? 'animate-spin' : ''
                }`}
              />
              <span>{isSummarizing ? 'Synthesizing...' : 'Summarize Session'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Session Summary Card (if generated) */}
        {session.summary && (
          <div
            id="session-summary-card"
            className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 shadow-xs"
          >
            <div className="flex items-center space-x-2 text-amber-900 font-semibold text-xs tracking-wide uppercase mb-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Gemini Session Synthesis</span>
            </div>
            <p className="text-sm text-stone-800 leading-relaxed font-serif italic mb-3">
              "{session.summary}"
            </p>
            {session.keyInsights && session.keyInsights.length > 0 && (
              <div className="mt-3 pt-3 border-t border-amber-200/50">
                <div className="text-[11px] font-semibold text-amber-950 uppercase tracking-wider mb-1.5">
                  Key Insights & Takeaways:
                </div>
                <ul className="space-y-1">
                  {session.keyInsights.map((insight, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-stone-700 flex items-start space-x-2"
                    >
                      <span className="text-amber-600 font-bold">&bull;</span>
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Empty State when zero turns */}
        {session.turns.length === 0 ? (
          <div className="max-w-xl mx-auto text-center py-12 px-4">
            <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200 flex items-center justify-center mx-auto text-stone-400 mb-4 shadow-xs">
              <Sparkles className="w-6 h-6 text-amber-500" />
            </div>
            <h2 className="text-lg font-semibold text-stone-900 mb-2">
              Start Your Reflection
            </h2>
            <p className="text-sm text-stone-600 leading-relaxed mb-6">
              Write whatever is on your mind. You can share feelings, review daily
              decisions, brainstorm projects, or ask Gemini for thoughtful perspectives.
            </p>

            <div className="text-left bg-white p-4 rounded-xl border border-stone-200 shadow-xs">
              <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                <span>Suggested Reflection Prompts</span>
              </div>
              <div className="space-y-1.5">
                {PROMPT_SUGGESTIONS[session.mode].map((prompt, idx) => (
                  <button
                    key={idx}
                    id={`prompt-suggestion-${idx}`}
                    onClick={() => {
                      setInputText(prompt);
                      textareaRef.current?.focus();
                    }}
                    className="w-full text-left p-2 rounded-lg text-xs text-stone-700 hover:bg-stone-50 hover:text-stone-900 border border-stone-100 transition-colors block"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          session.turns.map((turn) => {
            const isModel = turn.role === 'model';

            return (
              <div
                key={turn.id}
                id={`turn-${turn.id}`}
                className={`flex gap-3 sm:gap-4 max-w-4xl mx-auto ${
                  isModel ? 'items-start' : 'items-start justify-end'
                }`}
              >
                {/* Model Avatar */}
                {isModel && (
                  <div className="w-8 h-8 rounded-xl bg-stone-900 text-stone-50 flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                )}

                {/* Message Content Container */}
                <div
                  className={`relative group rounded-2xl p-4 sm:p-5 shadow-xs max-w-2xl text-sm leading-relaxed ${
                    isModel
                      ? 'bg-white border border-stone-200 text-stone-800'
                      : 'bg-stone-900 text-stone-50 ml-auto'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-stone-100/20">
                    <span className="text-[11px] font-semibold tracking-wide">
                      {isModel ? 'Gemini 3.6 Flash' : 'You'}
                    </span>
                    <div className="flex items-center space-x-2 text-[10px] opacity-70">
                      <span>
                        {new Date(turn.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isModel && turn.modelUsed && (
                        <span className="bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded font-mono text-[9px]">
                          {turn.modelUsed}
                        </span>
                      )}
                      <button
                        id={`copy-turn-${turn.id}`}
                        onClick={() => copyToClipboard(turn.content, turn.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-stone-200/40 text-stone-500"
                        title="Copy content"
                      >
                        {copiedTurnId === turn.id ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>

                  {isModel ? (
                    <div className="markdown-body prose prose-stone max-w-none text-stone-800 text-sm">
                      <Markdown>{turn.content}</Markdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-stone-100">{turn.content}</p>
                  )}
                </div>

                {/* User Avatar */}
                {!isModel && (
                  <div className="w-8 h-8 rounded-xl bg-stone-200 text-stone-700 flex items-center justify-center shrink-0 shadow-xs mt-1 overflow-hidden">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="User"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <UserIcon className="w-4 h-4 text-stone-600" />
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading Indicator while Gemini is thinking */}
        {isGenerating && (
          <div className="flex gap-3 sm:gap-4 max-w-4xl mx-auto items-start">
            <div className="w-8 h-8 rounded-xl bg-stone-900 text-stone-50 flex items-center justify-center shrink-0 shadow-xs mt-1">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl p-4 text-xs text-stone-500 flex items-center space-x-2.5 shadow-xs">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce" />
                <div
                  className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.2s' }}
                />
                <div
                  className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0.4s' }}
                />
              </div>
              <span>Gemini 3.6 Flash is reflecting...</span>
            </div>
          </div>
        )}

        <div ref={turnsEndRef} />
      </div>

      {/* Input Composer */}
      <div className="bg-white border-t border-stone-200 p-4 sm:px-6 shrink-0">
        <div className="max-w-4xl mx-auto space-y-2">
          {/* Quick Prompts bar (shows if turns exist) */}
          {session.turns.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] text-stone-500">
              <span className="font-semibold text-stone-400 shrink-0">Prompts:</span>
              {PROMPT_SUGGESTIONS[session.mode].slice(0, 2).map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputText(prompt);
                    textareaRef.current?.focus();
                  }}
                  className="truncate max-w-[280px] bg-stone-100 hover:bg-stone-200/80 px-2.5 py-1 rounded-md text-stone-600 transition-colors shrink-0"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          )}

          <div className="relative rounded-xl border border-stone-300 bg-white focus-within:ring-2 focus-within:ring-stone-400 focus-within:border-stone-400 shadow-2xs">
            <textarea
              id="reflection-input-textarea"
              ref={textareaRef}
              rows={3}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                session.mode === 'brainstorm'
                  ? 'Enter an idea, problem, or topic to brainstorm with Gemini...'
                  : session.mode === 'summary'
                  ? 'Add your final reflections or request a synthesized summary...'
                  : 'Write your journal entry or reflection (Shift+Enter for newline, Enter to send)...'
              }
              className="w-full resize-none p-3.5 text-sm text-stone-900 placeholder-stone-400 bg-transparent focus:outline-hidden"
              disabled={isGenerating}
            />

            <div className="flex items-center justify-between px-3.5 py-2 bg-stone-50/80 rounded-b-xl border-t border-stone-100">
              <div className="flex items-center space-x-2 text-[11px] text-stone-400">
                <span>{inputText.length} chars</span>
                <span>&bull;</span>
                <span className="hidden sm:inline">Press Enter to send</span>
              </div>

              <button
                id="send-reflection-btn"
                onClick={handleSubmit}
                disabled={!inputText.trim() || isGenerating}
                className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-50 text-xs font-semibold tracking-wide transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Reflect</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
