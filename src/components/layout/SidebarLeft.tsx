import React, { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  ChevronRight, 
  X,
  Layers,
  Plus
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useAuth } from '../../context/AuthContext';

interface SidebarLeftProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectConversation: (id: string) => void;
  onOpenAdminConversations?: () => void;
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  isOpen,
  onClose,
  onSelectConversation,
  onOpenAdminConversations,
}) => {
  const { conversations, selectedConversationId } = useContent();
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const orderedConversations = [...conversations].sort((a, b) => a.order - b.order);
  const filteredConversations = orderedConversations.filter(c =>
    c.title.toLocaleLowerCase('tr-TR').includes(searchTerm.toLocaleLowerCase('tr-TR'))
  );

  React.useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Mobil Karartma Overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-stone-950/40 backdrop-blur-sm z-30 lg:hidden transition-opacity"
        aria-hidden="true"
      />

      <aside className="conversation-sidebar fixed lg:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-80 sm:w-88 flex-shrink-0 bg-paper-100/90 dark:bg-stone-900/95 border-r border-paper-300 dark:border-stone-800 flex flex-col transition-all duration-300 overflow-hidden shadow-lg lg:shadow-none">
        
        {/* Başlık & Kapatma Butonu */}
        <div className="p-4 pb-3 border-b border-paper-300/80 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sage-700 dark:text-sage-400" />
            <h2 className="text-base font-serif font-semibold text-stone-900 dark:text-stone-100">
              Sohbetler
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-paper-300/60 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-medium">
              {filteredConversations.length}
            </span>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-lg hover:bg-paper-200 dark:hover:bg-stone-800 transition-colors"
            title="Paneli Kapat"
            aria-label="Kapat"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Arama Kutusu & Admin Hızlı Ekle Butonu */}
        <div className="p-3 border-b border-paper-200 dark:border-stone-800 space-y-2">
          {isAdmin && onOpenAdminConversations && (
            <button
              onClick={onOpenAdminConversations}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Yeni Sohbet Ekle</span>
            </button>
          )}

          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Sohbet ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-stone-800/80 rounded-xl border border-paper-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-sage-500/50 transition-all"
            />

            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-600"
              >
                ✕
              </button>
            )}
          </div>

        </div>

        {/* Sohbet İsimlerine Göre Liste */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-10 text-stone-400 text-xs">
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
              Aramanıza uygun sohbet bulunamadı.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === selectedConversationId;

              return (
                <button
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv.id);
                  }}
                  className={`w-full text-left p-3 rounded-xl transition-all flex flex-col gap-1.5 border relative ${
                    isSelected
                      ? 'bg-white dark:bg-stone-800 border-sage-500/50 dark:border-sage-500/60 shadow-sm'
                      : 'bg-paper-50/70 dark:bg-stone-900/60 border-paper-200 dark:border-stone-800/80 hover:bg-white dark:hover:bg-stone-800/70 hover:border-paper-300'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-sage-600 rounded-r-full" />
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm font-serif font-medium leading-snug ${
                      isSelected
                        ? 'text-stone-950 dark:text-stone-50 font-semibold'
                        : 'text-stone-800 dark:text-stone-200'
                    }`}>
                      {conv.title}
                    </h3>
                    <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-0.5 transition-transform ${
                      isSelected ? 'text-sage-600 translate-x-0.5' : 'text-stone-400 opacity-40'
                    }`} />
                  </div>

                </button>
              );
            })
          )}
        </div>

        {/* Alt Bilgi */}
        <div className="p-3 bg-paper-200/50 dark:bg-stone-950/40 border-t border-paper-300/60 dark:border-stone-800 text-center text-[11px] text-stone-500">
          Tıklayarak okumaya başlayabilirsiniz
        </div>
      </aside>
    </>
  );
};
