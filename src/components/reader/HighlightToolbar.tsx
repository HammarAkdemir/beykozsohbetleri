import React, { useState, useEffect, useRef } from 'react';
import { Check, X, MessageSquare } from 'lucide-react';
import { HighlightColor } from '../../types';

interface HighlightToolbarProps {
  position: { top: number; left: number };
  selectedText: string;
  onSave: (color: HighlightColor, note?: string) => void;
  onClose: () => void;
}

const COLOR_OPTIONS: { id: HighlightColor; label: string; bgClass: string; borderClass: string }[] = [
  { id: 'amber', label: 'Sarı', bgClass: 'bg-amber-300 dark:bg-amber-500', borderClass: 'border-amber-400' },
  { id: 'emerald', label: 'Yeşil', bgClass: 'bg-emerald-300 dark:bg-emerald-500', borderClass: 'border-emerald-400' },
  { id: 'sky', label: 'Mavi', bgClass: 'bg-sky-300 dark:bg-sky-500', borderClass: 'border-sky-400' },
  { id: 'rose', label: 'Gül', bgClass: 'bg-rose-300 dark:bg-rose-500', borderClass: 'border-rose-400' },
];

export const HighlightToolbar: React.FC<HighlightToolbarProps> = ({
  position,
  selectedText,
  onSave,
  onClose,
}) => {
  const [selectedColor, setSelectedColor] = useState<HighlightColor>('amber');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [note, setNote] = useState('');
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside or pressing Escape (User request #1)
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Use a tiny timeout to avoid capturing the mouseUp that triggered the toolbar
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
    }, 50);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  const handleSave = () => {
    onSave(selectedColor, note.trim() ? note.trim() : undefined);
    onClose();
  };

  return (
    <div
      ref={toolbarRef}
      style={{
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
      className="fixed z-50 bg-stone-900 text-stone-100 rounded-2xl shadow-2xl p-2.5 border border-stone-700/80 animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-2 min-w-[240px] max-w-xs"
      onClick={(e) => e.stopPropagation()}
    >

      <div className="flex items-center justify-between gap-3">
        {/* Renk Seçimi */}
        <div className="flex items-center gap-1.5">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.id}
              onClick={() => { onSave(c.id, note.trim() || undefined); onClose(); }}
              className={`w-6 h-6 rounded-full ${c.bgClass} flex items-center justify-center transition-transform ${
                selectedColor === c.id ? 'scale-125 ring-2 ring-white shadow-md' : 'hover:scale-110 opacity-80 hover:opacity-100'
              }`}
              title={`${c.label} ile vurgula`}
              type="button"
            >
              {selectedColor === c.id && <Check className="w-3.5 h-3.5 text-stone-900 stroke-[3]" />}
            </button>
          ))}
        </div>

        {/* Not Ekle Toggle & Butonlar */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowNoteInput(!showNoteInput)}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-colors ${
              showNoteInput || note ? 'bg-amber-600 text-white' : 'text-stone-300 hover:bg-stone-800'
            }`}
            title="Kişisel Not Ekle"
            type="button"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleSave}
            className="px-2.5 py-1 rounded-lg bg-white text-stone-950 hover:bg-stone-200 text-xs font-semibold transition-colors flex items-center gap-1"
            type="button"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Vurgula</span>
          </button>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
            title="İptal"
            type="button"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* İsteğe Bağlı Not Girişi */}
      {showNoteInput && (
        <div className="pt-1.5 border-t border-stone-800">
          <textarea
            rows={2}
            placeholder="Bu kısma özel bir düşünce/not ekleyin..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full text-xs bg-stone-950 text-stone-100 placeholder-stone-500 rounded-xl p-2 border border-stone-700 focus:outline-none focus:ring-1 focus:ring-amber-500"
            autoFocus
          />
        </div>
      )}

      {/* Seçilen Metin Özeti */}
      <div className="text-[10px] text-stone-400 line-clamp-1 italic px-1">
        "{selectedText}"
      </div>
    </div>
  );
};
