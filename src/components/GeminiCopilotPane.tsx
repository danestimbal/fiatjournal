import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Sparkles,
  Send,
  Plus,
  PanelRightClose,
  ShieldCheck,
  Copy,
  Check,
  ArrowDownToLine,
  Lightbulb,
  FileSearch,
  ListPlus,
  HelpCircle,
  ChevronLeft,
} from 'lucide-react';
import { ReflectionMode, ReflectionSession, ReflectionTurn } from '../types';

interface GeminiCopilotPaneProps {
  note: ReflectionSession;
  isGenerating: boolean;
  onSendMessage: (content: string, mode: ReflectionMode) => Promise<void>;
  onAppendToNote: (markdownText: string) => void;
  onClose: () => void;
  onBackToEditor?: () => void;
}

export const GeminiCopilotPane: React.FC<GeminiCopilotPaneProps> = ({
  note,
  isGenerating,
  onSendMessage,
  onAppendToNote,
  onClose,
  onBackToEditor,
}) => {
  const [prompt, setPrompt] = useState('');
  const [activeTab, setActiveTab] = useState('Chat');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<ReflectionMode>('reflection');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new turns
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [note.turns, isGenerating]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    const msg = prompt;
    setPrompt('');
    await onSendMessage(msg, selectedMode);
  };

  const handleCopy = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    {
      label: 'Suggest next action items',
      icon: ListPlus,
      prompt: `Based on the active note "${note.title}", what are the top 3 concrete action steps I should take next?`,
    },
    {
      label: 'Generate audit table',
      icon: FileSearch,
      prompt: `Create a comprehensive 5-point audit checklist table for the plan described in "${note.title}".`,
    },
    {
      label: 'Find potential gaps',
      icon: HelpCircle,
      prompt: `Review "${note.title}" critically. What potential risks, blind spots, or missing requirements should I watch out for?`,
    },
    {
      label: 'Brainstorm creative angles',
      icon: Lightbulb,
      prompt: `Brainstorm 3 innovative ways to expand or elevate the concepts in "${note.title}".`,
    },
  ];

  return (
    <aside
      id="gemini-copilot-pane"
      className="w-full md:w-80 lg:w-96 h-full flex flex-col bg-[#FAFAFA] dark:bg-[#161615] border-l border-[#E8E8E6] dark:border-[#2e2e2a] select-none font-sans shrink-0 transition-colors"
    >
      {/* Tab Header (Reflective Companion style) */}
      <div className="h-10 px-3 flex items-center justify-between border-b border-[#E8E8E6] dark:border-[#2e2e2a] bg-white dark:bg-[#161615] transition-colors">
        <div className="flex items-center space-x-1.5 overflow-hidden">
          {onBackToEditor && (
            <button
              id="btn-mobile-copilot-back"
              onClick={onBackToEditor}
              className="md:hidden flex items-center space-x-0.5 mr-1 px-1.5 py-1 rounded text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-medium cursor-pointer"
              title="Back to editor"
            >
              <ChevronLeft className="w-4 h-4 text-stone-600 dark:text-stone-400" />
              <span>Note</span>
            </button>
          )}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-[#F0F2F5] dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold max-w-[180px] sm:max-w-[200px] truncate">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="truncate">{note.title ? `${note.title.slice(0, 18)}...` : 'Co-pilot'}</span>
          </div>
          <button
            id="btn-new-copilot-tab"
            onClick={() => {
              // Quick clear conversation on note
            }}
            title="New Chat Tab"
            className="p-1 rounded hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500 dark:text-stone-400 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center space-x-1">
          <button
            id="btn-close-copilot-pane"
            onClick={onClose}
            title="Close Co-pilot Pane"
            className="p-1 rounded text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Context Badge */}
      <div className="px-3.5 py-1.5 bg-[#F5F5F3] dark:bg-[#1a1a18] border-b border-[#EBEBE8] dark:border-[#2e2e2a] flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-300 transition-colors">
        <div className="flex items-center space-x-1.5 truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          <span className="truncate font-medium">
            Active Context: <span className="text-stone-900 dark:text-stone-100">{note.title || 'Untitled Note'}</span>
          </span>
        </div>
        <span className="text-[10px] text-stone-400 dark:text-stone-500 shrink-0 ml-2 font-mono">
          {note.content.length} chars
        </span>
      </div>

      {/* Chat Messages Stream */}
      <div
        ref={scrollRef}
        id="copilot-chat-history"
        className="flex-1 overflow-y-auto p-3.5 space-y-4 text-xs scrollbar-thin select-text"
      >
        {note.turns.length === 0 ? (
          <div className="py-6 px-2 text-center text-stone-500 dark:text-stone-400">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="font-semibold text-stone-800 dark:text-stone-200 text-sm">Gemini Vault Co-pilot</h4>
            <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed max-w-xs mx-auto">
              Ask questions about <span className="font-semibold text-stone-700 dark:text-stone-300">{note.title}</span>,
              generate audit checklists, or brainstorm next steps.
            </p>

            {/* Quick action buttons */}
            <div className="mt-4 space-y-1.5 text-left">
              {quickPrompts.map((qp, idx) => {
                const Icon = qp.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setPrompt(qp.prompt);
                      onSendMessage(qp.prompt, selectedMode);
                    }}
                    className="w-full flex items-center space-x-2 px-2.5 py-2 rounded-lg bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/40 dark:hover:bg-blue-950/30 text-stone-700 dark:text-stone-200 transition-all shadow-2xs text-[11px] cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <span className="truncate">{qp.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          note.turns.map((turn) => {
            const isUser = turn.role === 'user';
            return (
              <div
                key={turn.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
              >
                {/* Header info */}
                <div className="mb-1 flex items-center space-x-1.5 text-[10px] text-stone-400 dark:text-stone-500 px-1">
                  <span>{isUser ? 'You' : 'Gemini Co-pilot'}</span>
                  {turn.modelUsed && (
                    <span className="bg-stone-200/70 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-1 rounded font-mono text-[9px]">
                      {turn.modelUsed}
                    </span>
                  )}
                </div>

                {/* Message bubble */}
                <div
                  className={`max-w-[95%] rounded-xl p-3 shadow-2xs leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-100 rounded-bl-xs'
                  }`}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap">{turn.content}</p>
                  ) : (
                    <div className="prose prose-xs prose-stone dark:prose-invert max-w-none">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          table: ({ children }) => (
                            <div className="overflow-x-auto my-2 border border-stone-200 dark:border-stone-800 rounded">
                              <table className="w-full text-left text-[11px] border-collapse">
                                {children}
                              </table>
                            </div>
                          ),
                          thead: ({ children }) => (
                            <thead className="bg-stone-100 dark:bg-stone-800 font-semibold border-b border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200">
                              {children}
                            </thead>
                          ),
                          th: ({ children }) => <th className="p-1.5">{children}</th>,
                          td: ({ children }) => <td className="p-1.5 border-t border-stone-100 dark:border-stone-800">{children}</td>,
                        }}
                      >
                        {turn.content}
                      </ReactMarkdown>

                      {/* Co-pilot Action Bar: Insert directly into active note! */}
                      <div className="mt-3 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px]">
                        <button
                          id={`btn-append-note-${turn.id}`}
                          onClick={() => onAppendToNote(`\n\n### Co-pilot Insight\n${turn.content}`)}
                          title="Append this response to the active note document"
                          className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors cursor-pointer"
                        >
                          <ArrowDownToLine className="w-3.5 h-3.5" />
                          <span>Insert into Note</span>
                        </button>

                        <button
                          onClick={() => handleCopy(turn.id, turn.content)}
                          title="Copy response"
                          className="p-1 text-stone-400 dark:text-stone-500 hover:text-stone-700 dark:hover:text-stone-200 transition-colors cursor-pointer"
                        >
                          {copiedId === turn.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Loading generation state */}
        {isGenerating && (
          <div className="flex flex-col items-start">
            <div className="mb-1 text-[10px] text-stone-400 dark:text-stone-500 px-1">Gemini Co-pilot</div>
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3 text-stone-500 dark:text-stone-400 shadow-2xs flex items-center space-x-2">
              <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs">Analyzing note and synthesizing response...</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Input Form (Matching the Screenshot: "Ask Claude Code" / Gemini Co-pilot) */}
      <div className="p-3 bg-white dark:bg-[#161615] border-t border-[#E8E8E6] dark:border-[#2e2e2a] space-y-2 transition-colors">
        {/* Mode selector pills */}
        <div className="flex items-center space-x-1.5 text-[10px]">
          <button
            onClick={() => setSelectedMode('reflection')}
            className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
              selectedMode === 'reflection'
                ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-semibold'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            Reflect
          </button>
          <button
            onClick={() => setSelectedMode('brainstorm')}
            className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
              selectedMode === 'brainstorm'
                ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-semibold'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            Brainstorm
          </button>
          <button
            onClick={() => setSelectedMode('summary')}
            className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
              selectedMode === 'summary'
                ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 font-semibold'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            Synthesize
          </button>
        </div>

        {/* Input Box */}
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            id="copilot-prompt-input"
            rows={2}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Ask Gemini Co-pilot..."
            className="w-full p-2.5 pr-9 bg-[#F9F9F8] dark:bg-[#1f1f1d] border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 outline-hidden focus:border-blue-400 dark:focus:border-blue-500 focus:bg-white dark:focus:bg-[#252522] transition-all resize-none font-sans"
          />

          <button
            id="btn-send-copilot-prompt"
            type="submit"
            disabled={!prompt.trim() || isGenerating}
            title="Send prompt"
            className="absolute right-2 bottom-2.5 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-30 transition-colors shadow-2xs cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Footer Badges matching user image: * Claude v Vault Safe v Settings */}
        <div className="flex items-center justify-between text-[10px] text-stone-400 dark:text-stone-500 pt-0.5">
          <div className="flex items-center space-x-2">
            <span className="flex items-center gap-1 text-stone-600 dark:text-stone-400 font-medium">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Gemini 3.6 Flash
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              Vault Safe
            </span>
          </div>
          <span className="text-stone-400 dark:text-stone-500 text-[9px] font-mono">fiatjournal</span>
        </div>
      </div>
    </aside>
  );
};
