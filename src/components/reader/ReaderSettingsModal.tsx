import React from 'react';
import { X, Type, Sun, Moon, Coffee, AlignJustify } from 'lucide-react';
import { useNotes } from '../../context/NotesContext';

interface ReaderSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ReaderSettingsModal: React.FC<ReaderSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { readingSettings, updateReadingSettings } = useNotes();

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-md w-full bg-white dark:bg-stone-900 rounded-3xl shadow-2xl border border-paper-300 dark:border-stone-800 p-6 flex flex-col gap-6"
      >
        <div className="flex items-center justify-between border-b border-paper-200 dark:border-stone-800 pb-3">
          <div className="flex items-center gap-2">
            <Type className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-serif font-semibold text-stone-900 dark:text-stone-100">
              Okuma & Görünüm Ayarları
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-paper-100 dark:hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tema Seçimi */}
        <div>
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
            Okuma Teması
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              aria-pressed={readingSettings.theme === 'paper'}
              onClick={() => updateReadingSettings({ theme: 'paper' })}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl border text-xs font-medium transition-all ${
                readingSettings.theme === 'paper'
                  ? 'border-amber-600 bg-[#f6ead3] text-stone-900 ring-2 ring-amber-500/20 shadow-sm'
                  : 'border-[#ddc8a6] bg-[#fbf2e2] text-stone-700 hover:bg-[#f6ead3]'
              }`}
            >
              <Coffee className="w-4 h-4 text-amber-700" />
              <span>Sıcak Kağıt</span>
            </button>

            <button
              aria-pressed={readingSettings.theme === 'light'}
              onClick={() => updateReadingSettings({ theme: 'light' })}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl border text-xs font-medium transition-all ${
                readingSettings.theme === 'light'
                  ? 'border-amber-600 bg-white text-stone-900 ring-2 ring-amber-500/20 shadow-sm'
                  : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Aydınlık</span>
            </button>

            <button
              aria-pressed={readingSettings.theme === 'dark'}
              onClick={() => updateReadingSettings({ theme: 'dark' })}
              className={`flex items-center justify-center gap-2 py-3 px-3 rounded-2xl border text-xs font-medium transition-all ${
                readingSettings.theme === 'dark'
                  ? 'border-amber-500 bg-stone-950 text-stone-100 ring-2 ring-amber-500/20 shadow-sm'
                  : 'border-stone-700 bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              <Moon className="w-4 h-4 text-sky-400" />
              <span>Koyu Gece</span>
            </button>
          </div>
        </div>

        <div className="text-sm text-stone-500">Yazı karakteri: Georgia</div>

        {/* Yazı Boyutu */}
        <div>
          <label className="text-xs font-semibold text-stone-500 uppercase tracking-wider block mb-2">
            Metin Boyutu
          </label>
          <div className="grid grid-cols-4 gap-2 text-xs">
            {[
              { id: 'sm', label: 'Küçük', symbol: 'A' },
              { id: 'base', label: 'Normal', symbol: 'A' },
              { id: 'lg', label: 'Büyük', symbol: 'A+' },
              { id: 'xl', label: 'Geniş', symbol: 'A++' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => updateReadingSettings({ fontSize: s.id as any })}
                className={`py-2.5 rounded-xl border text-center transition-all ${
                  readingSettings.fontSize === s.id
                    ? 'border-amber-600 bg-amber-50 dark:bg-stone-800 text-amber-900 dark:text-amber-300 font-bold'
                    : 'border-paper-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-paper-100'
                }`}
              >
                <span className="block font-serif text-sm">{s.symbol}</span>
                <span className="text-[10px] text-stone-400">{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Kapat / Tamamla */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white text-xs font-semibold transition-colors shadow-sm"
        >
          Uygula & Okumaya Dön
        </button>
      </div>
    </div>
  );
};
