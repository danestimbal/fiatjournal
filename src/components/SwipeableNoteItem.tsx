import React, { useState, useRef, useEffect } from 'react';
import { FileText, Star, Trash2, Pin, Share2 } from 'lucide-react';
import { ReflectionSession } from '../types';

interface SwipeableNoteItemProps {
  note: ReflectionSession;
  isSelected: boolean;
  onSelect: () => void;
  onRequestDelete: (note: ReflectionSession) => void;
  onToggleFavorite?: (noteId: string) => void;
  onTogglePin?: (noteId: string) => void;
  formatDate: (timestamp: number) => string;
  getExcerpt: (content: string) => string;
}

const SWIPE_THRESHOLD = 75; // px needed to trigger action on release
const MAX_SWIPE = 140; // max visual slide distance in px

export const SwipeableNoteItem: React.FC<SwipeableNoteItemProps> = ({
  note,
  isSelected,
  onSelect,
  onRequestDelete,
  onToggleFavorite,
  onTogglePin,
  formatDate,
  getExcerpt,
}) => {
  const [offsetX, setOffsetX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const startXRef = useRef<number>(0);
  const startYRef = useRef<number>(0);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  const hasMovedRef = useRef<boolean>(false);
  const itemRef = useRef<HTMLDivElement>(null);

  // Clean up any drag state on unmount
  useEffect(() => {
    return () => {
      setIsDragging(false);
      setOffsetX(0);
    };
  }, [note.id]);

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    startXRef.current = e.touches[0].clientX;
    startYRef.current = e.touches[0].clientY;
    isHorizontalSwipeRef.current = null;
    hasMovedRef.current = false;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startXRef.current;
    const diffY = currentY - startYRef.current;

    // Detect direction lock once
    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
          isHorizontalSwipeRef.current = true;
        } else {
          isHorizontalSwipeRef.current = false;
          setIsDragging(false);
          setOffsetX(0);
          return;
        }
      } else {
        return;
      }
    }

    if (!isHorizontalSwipeRef.current) return;

    hasMovedRef.current = Math.abs(diffX) > 8;

    // Calculate clamped offset with slight resistance past threshold
    let targetOffset = diffX;
    if (Math.abs(targetOffset) > MAX_SWIPE) {
      const excess = Math.abs(targetOffset) - MAX_SWIPE;
      const sign = targetOffset > 0 ? 1 : -1;
      targetOffset = sign * (MAX_SWIPE + Math.sqrt(excess) * 4);
    }

    setOffsetX(targetOffset);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (Math.abs(offsetX) >= SWIPE_THRESHOLD) {
      // Swiped far enough! Trigger delete confirmation
      onRequestDelete(note);
    }

    // Always spring card back to resting position
    setOffsetX(0);
    isHorizontalSwipeRef.current = null;
  };

  // Mouse / Pointer drag support for desktop simulation
  const handlePointerDown = (e: React.PointerEvent) => {
    // Only primary mouse button or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    isHorizontalSwipeRef.current = null;
    hasMovedRef.current = false;
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const currentY = e.clientY;
    const diffX = currentX - startXRef.current;
    const diffY = currentY - startYRef.current;

    if (isHorizontalSwipeRef.current === null) {
      if (Math.abs(diffX) > 6 || Math.abs(diffY) > 6) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
          isHorizontalSwipeRef.current = true;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        } else {
          isHorizontalSwipeRef.current = false;
          setIsDragging(false);
          setOffsetX(0);
          return;
        }
      } else {
        return;
      }
    }

    if (!isHorizontalSwipeRef.current) return;

    hasMovedRef.current = Math.abs(diffX) > 8;

    let targetOffset = diffX;
    if (Math.abs(targetOffset) > MAX_SWIPE) {
      const excess = Math.abs(targetOffset) - MAX_SWIPE;
      const sign = targetOffset > 0 ? 1 : -1;
      targetOffset = sign * (MAX_SWIPE + Math.sqrt(excess) * 4);
    }

    setOffsetX(targetOffset);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
      // ignore
    }
    setIsDragging(false);

    if (Math.abs(offsetX) >= SWIPE_THRESHOLD) {
      onRequestDelete(note);
    }

    setOffsetX(0);
    isHorizontalSwipeRef.current = null;
  };

  const handleClick = (e: React.MouseEvent) => {
    // If this was a swipe or drag, do not trigger note selection
    if (hasMovedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      hasMovedRef.current = false;
      return;
    }
    onSelect();
  };

  // Visual cues for swipe progress
  const absOffset = Math.abs(offsetX);
  const isPastThreshold = absOffset >= SWIPE_THRESHOLD;
  const isSwipingLeft = offsetX < 0;
  const isSwipingRight = offsetX > 0;

  return (
    <div
      ref={itemRef}
      id={`swipeable-note-${note.id}`}
      className="relative overflow-hidden select-none touch-pan-y bg-rose-600"
    >
      {/* Background Delete Action - Revealed when swiping left (actions on right) */}
      <div
        className={`absolute inset-y-0 right-0 w-32 flex items-center justify-end px-5 text-white transition-opacity ${
          isSwipingLeft ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundColor: isPastThreshold ? '#DC2626' : '#E11D48',
        }}
      >
        <div className="flex flex-col items-center gap-1">
          <Trash2
            className={`w-5 h-5 transition-transform duration-150 ${
              isPastThreshold ? 'scale-125 stroke-[2.5]' : 'scale-100'
            }`}
          />
          <span className="text-[10px] font-semibold tracking-wider uppercase">
            {isPastThreshold ? 'Release' : 'Delete'}
          </span>
        </div>
      </div>

      {/* Background Delete Action - Revealed when swiping right (actions on left) */}
      <div
        className={`absolute inset-y-0 left-0 w-32 flex items-center justify-start px-5 text-white transition-opacity ${
          isSwipingRight ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundColor: isPastThreshold ? '#DC2626' : '#E11D48',
        }}
      >
        <div className="flex flex-col items-center gap-1">
          <Trash2
            className={`w-5 h-5 transition-transform duration-150 ${
              isPastThreshold ? 'scale-125 stroke-[2.5]' : 'scale-100'
            }`}
          />
          <span className="text-[10px] font-semibold tracking-wider uppercase">
            {isPastThreshold ? 'Release' : 'Delete'}
          </span>
        </div>
      </div>

      {/* Foreground Note Card */}
      <div
        id={`note-card-${note.id}`}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          transform: `translateX(${offsetX}px)`,
          transition: isDragging ? 'none' : 'transform 0.26s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={`group relative p-3.5 cursor-pointer will-change-transform bg-white dark:bg-[#181816] transition-colors ${
          isSelected
            ? 'bg-[#F4F6FB] dark:bg-blue-950/40 border-l-2 border-[#2563EB] dark:border-blue-500'
            : 'hover:bg-[#FAFAFA] dark:hover:bg-[#1f1f1d]'
        }`}
      >
        {/* Note Title & Doc Icon */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-1.5 min-w-0 flex-1">
            {note.isPinned && (
              <Pin className="w-3 h-3 text-blue-600 dark:text-blue-400 fill-blue-500 dark:fill-blue-400 shrink-0 -rotate-45" />
            )}
            <h3
              className={`text-[13px] font-semibold tracking-tight leading-snug line-clamp-1 ${
                isSelected ? 'text-[#1E3A8A] dark:text-blue-300' : 'text-stone-800 dark:text-stone-100'
              }`}
            >
              {note.title || 'Untitled Note'}
            </h3>
          </div>
          <div className="flex items-center space-x-1 shrink-0">
            {note.isFavorite && (
              <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
            )}
            {(note.isShared || (note.sharedWith && note.sharedWith.length > 0) || note.isPublic) && (
              <Share2 className="w-3 h-3 text-blue-500 dark:text-blue-400" />
            )}
            <FileText className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 group-hover:text-stone-600 dark:group-hover:text-stone-300 transition-colors" />
          </div>
        </div>

        {/* Excerpt */}
        <p className="mt-1 text-[12px] text-stone-500 dark:text-stone-400 leading-relaxed line-clamp-2">
          {getExcerpt(note.content)}
        </p>

        {/* Dates footer */}
        <div className="mt-2.5 flex items-center justify-between text-[10px] text-stone-400 dark:text-stone-500 font-mono">
          <span>{formatDate(note.updatedAt)}</span>
          <span className="text-stone-400/80 dark:text-stone-500/80">
            Created {formatDate(note.createdAt)}
          </span>
        </div>

        {/* Desktop Hover Quick Actions */}
        <div className="absolute top-2 right-2 hidden group-hover:flex items-center space-x-1 bg-white/95 dark:bg-stone-800/95 backdrop-blur-xs px-1 py-0.5 rounded shadow-xs border border-stone-200 dark:border-stone-700">
          {onTogglePin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePin(note.id);
              }}
              title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
              className={`p-1 transition-colors cursor-pointer ${
                note.isPinned
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-stone-400 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              <Pin className={`w-3 h-3 ${note.isPinned ? 'fill-blue-500 -rotate-45' : ''}`} />
            </button>
          )}
          {onToggleFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(note.id);
              }}
              title="Favorite note"
              className="p-1 hover:text-amber-500 text-stone-400 dark:text-stone-400 transition-colors cursor-pointer"
            >
              <Star
                className={`w-3 h-3 ${
                  note.isFavorite ? 'text-amber-500 fill-amber-400' : ''
                }`}
              />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRequestDelete(note);
            }}
            title="Delete note"
            className="p-1 hover:text-rose-600 text-stone-400 dark:text-stone-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
