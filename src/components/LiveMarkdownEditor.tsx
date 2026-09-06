import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Check,
  X,
  Edit2,
  Trash2,
  ImageIcon,
  Maximize2,
  Plus,
  Type,
  ListTodo,
  Heading,
} from 'lucide-react';

export interface LiveMarkdownEditorProps {
  content: string;
  onChange: (newContent: string) => void;
  onOpenImageModal?: () => void;
}

interface BlockItem {
  id: string;
  rawText: string;
  type: 'image' | 'heading' | 'task' | 'table' | 'code' | 'blockquote' | 'paragraph';
  headingLevel?: number;
  imageUrl?: string;
  imageAlt?: string;
}

// Parse markdown into distinct logical blocks
export function parseMarkdownBlocks(text: string): BlockItem[] {
  if (!text.trim()) {
    return [
      {
        id: 'block-0',
        rawText: '',
        type: 'paragraph',
      },
    ];
  }

  const lines = text.split('\n');
  const blocks: BlockItem[] = [];
  let currentAccumulator: string[] = [];
  let inCodeBlock = false;
  let inTable = false;

  const flushAccumulator = () => {
    if (currentAccumulator.length === 0) return;
    const blockRaw = currentAccumulator.join('\n');
    const trimmed = blockRaw.trim();

    if (!trimmed) {
      currentAccumulator = [];
      return;
    }

    // Check block type
    const firstLine = currentAccumulator[0].trim();
    if (firstLine.startsWith('#')) {
      const match = firstLine.match(/^(#{1,6})\s+(.*)$/);
      blocks.push({
        id: `block-${blocks.length}-${Math.random().toString(36).slice(2, 7)}`,
        rawText: blockRaw,
        type: 'heading',
        headingLevel: match ? match[1].length : 1,
      });
    } else if (firstLine.startsWith('```')) {
      blocks.push({
        id: `block-${blocks.length}-${Math.random().toString(36).slice(2, 7)}`,
        rawText: blockRaw,
        type: 'code',
      });
    } else if (firstLine.startsWith('>')) {
      blocks.push({
        id: `block-${blocks.length}-${Math.random().toString(36).slice(2, 7)}`,
        rawText: blockRaw,
        type: 'blockquote',
      });
    } else if (firstLine.startsWith('|')) {
      blocks.push({
        id: `block-${blocks.length}-${Math.random().toString(36).slice(2, 7)}`,
        rawText: blockRaw,
        type: 'table',
      });
    } else if (firstLine.startsWith('- [ ]') || firstLine.startsWith('- [x]')) {
      blocks.push({
        id: `block-${blocks.length}-${Math.random().toString(36).slice(2, 7)}`,
        rawText: blockRaw,
        type: 'task',
      });
    } else {
      blocks.push({
        id: `block-${blocks.length}-${Math.random().toString(36).slice(2, 7)}`,
        rawText: blockRaw,
        type: 'paragraph',
      });
    }
    currentAccumulator = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Handle code fence
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        currentAccumulator.push(line);
        flushAccumulator();
        inCodeBlock = false;
        continue;
      } else {
        flushAccumulator();
        inCodeBlock = true;
        currentAccumulator.push(line);
        continue;
      }
    }

    if (inCodeBlock) {
      currentAccumulator.push(line);
      continue;
    }

    // Standalone image markdown line: ![alt](url)
    const imageMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
    if (imageMatch) {
      flushAccumulator();
      blocks.push({
        id: `block-${blocks.length}-${Math.random().toString(36).slice(2, 7)}`,
        rawText: trimmed,
        type: 'image',
        imageAlt: imageMatch[1] || 'Image',
        imageUrl: imageMatch[2],
      });
      continue;
    }

    // Markdown Table line
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      if (!inTable) {
        flushAccumulator();
        inTable = true;
      }
      currentAccumulator.push(line);
      continue;
    } else if (inTable) {
      flushAccumulator();
      inTable = false;
    }

    // Standalone Heading
    if (trimmed.startsWith('#') && !inCodeBlock) {
      flushAccumulator();
      currentAccumulator.push(line);
      flushAccumulator();
      continue;
    }

    // Task list items
    if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]')) {
      flushAccumulator();
      currentAccumulator.push(line);
      flushAccumulator();
      continue;
    }

    // Blank line indicates paragraph boundary
    if (trimmed === '') {
      flushAccumulator();
    } else {
      currentAccumulator.push(line);
    }
  }

  flushAccumulator();

  if (blocks.length === 0) {
    blocks.push({
      id: 'block-empty',
      rawText: '',
      type: 'paragraph',
    });
  }

  return blocks;
}

export const LiveMarkdownEditor: React.FC<LiveMarkdownEditorProps> = ({
  content,
  onChange,
  onOpenImageModal,
}) => {
  const [editingBlockIndex, setEditingBlockIndex] = useState<number | null>(null);
  const [draftText, setDraftText] = useState('');
  const [viewingFullImage, setViewingFullImage] = useState<{ url: string; alt: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Parse blocks
  const blocks = useMemo(() => parseMarkdownBlocks(content), [content]);

  // Focus and auto-size the draft textarea when entering edit
  useEffect(() => {
    if (editingBlockIndex !== null && textareaRef.current) {
      textareaRef.current.focus();
      // Auto-grow height
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(textareaRef.current.scrollHeight, 28)}px`;
    }
  }, [editingBlockIndex]);

  const handleStartEdit = (index: number) => {
    if (index < 0 || index >= blocks.length) return;
    setEditingBlockIndex(index);
    setDraftText(blocks[index]?.rawText || '');
  };

  const handleCancelEdit = () => {
    setEditingBlockIndex(null);
    setDraftText('');
  };

  const handleSaveEdit = (index: number, textOverride?: string) => {
    if (index < 0 || index >= blocks.length) return;
    const textToSave = textOverride !== undefined ? textOverride : draftText;
    const newBlocks = [...blocks];
    newBlocks[index] = {
      ...newBlocks[index],
      rawText: textToSave,
    };

    // Reconstruct full markdown text
    const updatedContent = newBlocks
      .map((b) => b.rawText)
      .join('\n\n')
      .trim();

    onChange(updatedContent);
    setEditingBlockIndex(null);
    setDraftText('');
  };

  const handleDeleteBlock = (index: number) => {
    if (index < 0 || index >= blocks.length) return;
    const newBlocks = blocks.filter((_, i) => i !== index);
    const updatedContent = newBlocks.map((b) => b.rawText).join('\n\n').trim();
    onChange(updatedContent);
    setEditingBlockIndex(null);
  };

  const handleInsertBlockBelow = (index: number, template: string = '') => {
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, {
      id: `block-${Date.now()}`,
      rawText: template,
      type: 'paragraph',
    });
    const updatedContent = newBlocks.map((b) => b.rawText).join('\n\n').trim();
    onChange(updatedContent);
    // Immediately edit newly created block
    setEditingBlockIndex(index + 1);
    setDraftText(template);
  };

  // Toggle task checklist in live mode
  const handleToggleTaskBlock = (blockIndex: number, lineText: string) => {
    const block = blocks[blockIndex];
    if (!block) return;

    let updatedRaw = block.rawText;
    if (updatedRaw.includes('- [ ]')) {
      updatedRaw = updatedRaw.replace('- [ ]', '- [x]');
    } else if (updatedRaw.includes('- [x]')) {
      updatedRaw = updatedRaw.replace('- [x]', '- [ ]');
    }

    const newBlocks = [...blocks];
    newBlocks[blockIndex] = {
      ...block,
      rawText: updatedRaw,
    };
    onChange(newBlocks.map((b) => b.rawText).join('\n\n').trim());
  };

  return (
    <div id="interactive-live-markdown-editor" className="space-y-1 sm:space-y-1.5 font-sans pb-12">
      {/* Render Blocks */}
      {blocks.map((block, index) => {
        const isEditing = editingBlockIndex === index;

        if (isEditing) {
          const isH1 = draftText.startsWith('# ');
          const isH2 = draftText.startsWith('## ');
          const isH3 = draftText.startsWith('### ');
          const isCode = draftText.startsWith('```');

          const typographyClass = isH1
            ? 'text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-50 tracking-tight'
            : isH2
            ? 'text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight'
            : isH3
            ? 'text-base font-semibold text-stone-900 dark:text-stone-200'
            : isCode
            ? 'font-mono text-xs text-stone-100 bg-stone-900 dark:bg-stone-950 p-2.5 rounded-lg border border-stone-800'
            : 'text-[15px] text-stone-800 dark:text-stone-200 leading-relaxed font-sans';

          return (
            <div
              key={block.id}
              className="relative my-0.5 group/inline-edit"
            >
              <textarea
                ref={textareaRef}
                value={draftText}
                onChange={(e) => {
                  setDraftText(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${e.target.scrollHeight}px`;
                }}
                onBlur={(e) => handleSaveEdit(index, e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveEdit(index, e.currentTarget.value);
                  } else if (e.key === 'Enter' && (isH1 || isH2 || isH3)) {
                    e.preventDefault();
                    handleSaveEdit(index, e.currentTarget.value);
                  } else if (e.key === 'Escape') {
                    e.preventDefault();
                    handleCancelEdit();
                  }
                }}
                className={`w-full bg-transparent border-0 border-l-2 border-blue-500/80 dark:border-blue-400/80 pl-2 pr-8 py-0.5 m-0 resize-none outline-none focus:outline-none focus:ring-0 ${typographyClass}`}
                placeholder="Type text or markdown..."
              />
              {/* Minimal floating save button on the right */}
              <div className="absolute right-0 top-0.5 flex items-center space-x-1 z-10">
                <button
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSaveEdit(index, draftText);
                  }}
                  title="Done editing (or tap outside to save)"
                  className="p-1 rounded-md bg-blue-600 hover:bg-blue-700 text-white shadow-2xs transition-colors cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        }

        // Dedicated Visual Image Card
        if (block.type === 'image' && block.imageUrl) {
          return (
            <div
              key={block.id}
              className="group relative my-4 rounded-2xl border border-stone-200/80 dark:border-stone-800/80 bg-stone-50/50 dark:bg-stone-900/40 p-2.5 overflow-hidden transition-all hover:border-blue-400/80 dark:hover:border-blue-500/80 hover:shadow-xs"
            >
              <div className="relative flex justify-center bg-stone-100/60 dark:bg-stone-950/60 rounded-xl overflow-hidden max-h-[420px]">
                <img
                  src={block.imageUrl}
                  alt={block.imageAlt || 'Note image'}
                  className="w-auto max-h-[400px] rounded-lg object-contain cursor-pointer transition-transform duration-200 hover:scale-[1.01]"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onClick={() =>
                    setViewingFullImage({
                      url: block.imageUrl!,
                      alt: block.imageAlt || 'Image preview',
                    })
                  }
                />
              </div>

              {/* Image Alt Caption */}
              {block.imageAlt && block.imageAlt !== 'Image' && (
                <p className="text-center text-xs text-stone-500 dark:text-stone-400 mt-2 italic">
                  {block.imageAlt}
                </p>
              )}

              {/* Hover Actions for Image */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 flex items-center space-x-1.5 bg-stone-900/80 dark:bg-stone-800/90 backdrop-blur-xs px-2 py-1 rounded-lg text-white shadow-md transition-opacity">
                <button
                  onClick={() =>
                    setViewingFullImage({
                      url: block.imageUrl!,
                      alt: block.imageAlt || 'Image preview',
                    })
                  }
                  title="View full image"
                  className="p-1 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleStartEdit(index)}
                  title="Edit image URL or caption"
                  className="p-1 hover:text-blue-300 transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDeleteBlock(index)}
                  title="Delete image"
                  className="p-1 hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        }

        // Standard Markdown Rendered Block with Direct In-Place Edit
        return (
          <div
            key={block.id}
            onClick={(e) => {
              const target = e.target as HTMLElement;
              // Don't enter inline edit mode if user clicked on interactive elements
              if (
                target.tagName === 'INPUT' ||
                target.tagName === 'A' ||
                target.tagName === 'IMG' ||
                target.closest('button')
              ) {
                return;
              }
              handleStartEdit(index);
            }}
            onDoubleClick={() => handleStartEdit(index)}
            className="group relative rounded-md py-0.5 px-1 -mx-1 transition-all hover:bg-stone-50/50 dark:hover:bg-stone-900/30 cursor-text"
          >
            {/* Action Bar on Hover */}
            <div className="absolute -top-3 right-1 opacity-0 group-hover:opacity-100 flex items-center space-x-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-md px-1.5 py-0.5 shadow-2xs text-stone-500 dark:text-stone-400 text-xs transition-opacity z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartEdit(index);
                }}
                title="Edit this block"
                className="flex items-center space-x-0.5 hover:text-blue-600 dark:hover:text-blue-400 p-0.5 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span className="text-[10px]">Edit</span>
              </button>
              <span className="text-stone-300 dark:text-stone-700">|</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleInsertBlockBelow(index, '');
                }}
                title="Insert paragraph below"
                className="hover:text-stone-800 dark:hover:text-stone-200 p-0.5 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteBlock(index);
                }}
                title="Delete block"
                className="hover:text-rose-500 p-0.5 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {/* Render with ReactMarkdown */}
            <div className="prose prose-stone dark:prose-invert max-w-none text-stone-800 dark:text-stone-200 leading-relaxed text-[15px]">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-2xl sm:text-3xl font-black text-stone-900 dark:text-stone-50 tracking-tight mt-4 mb-2">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 tracking-tight mt-3 mb-2 border-b border-stone-100 dark:border-stone-800 pb-1">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-base font-semibold text-stone-900 dark:text-stone-200 mt-2 mb-1">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-2 leading-relaxed text-[15px]">{children}</p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-5 mb-2 space-y-1 text-[14px]">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-5 mb-2 space-y-1 text-[14px]">{children}</ol>
                  ),
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  input: ({ checked, ...props }) => (
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => handleToggleTaskBlock(index, block.rawText)}
                      className="mr-2 rounded border-stone-300 dark:border-stone-600 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4 align-middle"
                      {...props}
                    />
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-stone-300 dark:border-stone-700 pl-4 italic text-stone-600 dark:text-stone-400 my-2">
                      {children}
                    </blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-3 border border-stone-200 dark:border-stone-800 rounded-lg shadow-2xs">
                      <table className="w-full text-left text-xs border-collapse">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-[#F8F8F7] dark:bg-[#20201e] border-b border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 font-semibold uppercase tracking-wider text-[11px]">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                      {children}
                    </tbody>
                  ),
                  th: ({ children }) => <th className="p-2.5 font-semibold">{children}</th>,
                  td: ({ children }) => (
                    <td className="p-2.5 text-stone-700 dark:text-stone-300">{children}</td>
                  ),
                  code: ({ children }) => (
                    <code className="bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-1.5 py-0.5 rounded text-xs font-mono">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-stone-900 dark:bg-stone-950 text-stone-100 p-3.5 rounded-lg overflow-x-auto text-xs font-mono my-2 border border-stone-800">
                      {children}
                    </pre>
                  ),
                  img: ({ src, alt, ...props }) => (
                    <span className="block my-3">
                      <img
                        src={src}
                        alt={alt || 'Note image'}
                        className="max-w-full h-auto rounded-xl border border-stone-200 dark:border-stone-800 shadow-2xs object-contain cursor-pointer hover:opacity-95"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onClick={() =>
                          src &&
                          setViewingFullImage({
                            url: src,
                            alt: alt || 'Note image',
                          })
                        }
                        {...props}
                      />
                      {alt && (
                        <span className="block text-center text-xs text-stone-400 dark:text-stone-500 mt-1 italic">
                          {alt}
                        </span>
                      )}
                    </span>
                  ),
                }}
              >
                {block.rawText.replace(/==([^=\n]+)==/g, '**$1**')}
              </ReactMarkdown>
            </div>
          </div>
        );
      })}

      {/* Quick Add Block Footer */}
      <div className="pt-2 flex items-center justify-center space-x-1.5 sm:space-x-2 border-t border-dashed border-stone-200/80 dark:border-stone-800/80 text-xs text-stone-400">
        <button
          onClick={() => handleInsertBlockBelow(blocks.length - 1, '')}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-md border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer text-xs"
        >
          <Plus className="w-3 h-3" />
          <span>Paragraph</span>
        </button>
        <button
          onClick={() => handleInsertBlockBelow(blocks.length - 1, '## New Section')}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-md border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer text-xs"
        >
          <Heading className="w-3 h-3" />
          <span>Heading</span>
        </button>
        <button
          onClick={() => handleInsertBlockBelow(blocks.length - 1, '- [ ] New task')}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-md border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-900 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer text-xs"
        >
          <ListTodo className="w-3 h-3" />
          <span>Task</span>
        </button>
      </div>

      {/* Full-Screen Image Lightbox Modal */}
      {viewingFullImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setViewingFullImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setViewingFullImage(null)}
              className="absolute -top-10 right-0 p-1.5 rounded-full bg-stone-800/80 text-white hover:bg-stone-700 transition-colors cursor-pointer"
              title="Close image view"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={viewingFullImage.url}
              alt={viewingFullImage.alt}
              className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            {viewingFullImage.alt && viewingFullImage.alt !== 'Image' && (
              <p className="text-stone-300 text-sm mt-3 font-medium text-center">
                {viewingFullImage.alt}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
