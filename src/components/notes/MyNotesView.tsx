import React, { useState } from 'react';
import { 
  Bookmark, 
  Search, 
  MessageSquare, 
  ExternalLink, 
  Trash2, 
  Copy, 
  Check, 
  Download, 
  Filter,
  BookOpen
} from 'lucide-react';
import { useNotes } from '../../context/NotesContext';
import { useContent } from '../../context/ContentContext';
import { HighlightColor } from '../../types';

interface MyNotesViewProps {
  onNavigateToConversation: (conversationId: string, paragraphId?: string) => void;
}

export const MyNotesView: React.FC<MyNotesViewProps> = ({
  onNavigateToConversation,
}) => {
  const { userHighlights, removeHighlight, updateHighlightNote } = useNotes();
  const { conversations } = useContent();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [selectedConvFilter, setSelectedConvFilter] = useState<string>('all');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [exportBusy, setExportBusy] = useState(false);

  // Filter notes
  const filteredHighlights = userHighlights.filter(h => {
    const matchesSearch = h.selectedText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (h.note && h.note.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          h.conversationTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesColor = selectedColor === 'all' || h.color === selectedColor;
    const matchesConv = selectedConvFilter === 'all' || h.conversationId === selectedConvFilter;

    return matchesSearch && matchesColor && matchesConv;
  });

  const conversationOrder = new Map(conversations.map((conversation, index) => [conversation.id, index]));
  const paragraphOrder = new Map(
    conversations.flatMap(conversation =>
      conversation.paragraphs.map((paragraph, index) => [`${conversation.id}:${paragraph.id}`, index])
    )
  );
  const sortedHighlights = [...filteredHighlights].sort((a, b) => {
    const conversationDifference =
      (conversationOrder.get(a.conversationId) ?? Number.MAX_SAFE_INTEGER) -
      (conversationOrder.get(b.conversationId) ?? Number.MAX_SAFE_INTEGER);
    if (conversationDifference !== 0) return conversationDifference;

    const baseParagraphId = (id: string) => id.replace(/-(subtitle|quote)$/, '');
    const paragraphDifference =
      (paragraphOrder.get(`${a.conversationId}:${baseParagraphId(a.paragraphId)}`) ?? Number.MAX_SAFE_INTEGER) -
      (paragraphOrder.get(`${b.conversationId}:${baseParagraphId(b.paragraphId)}`) ?? Number.MAX_SAFE_INTEGER);
    if (paragraphDifference !== 0) return paragraphDifference;

    return (a.startOffset ?? 0) - (b.startOffset ?? 0);
  });

  const handleCopyQuote = (id: string, text: string, note?: string) => {
    const copyContent = note ? `"${text}"\n\nNotum: ${note}` : `"${text}"`;
    navigator.clipboard.writeText(copyContent);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleExportWord = async () => {
    if (!filteredHighlights.length) return;
    setExportBusy(true);
    try {
      const response = await fetch('/api/notes/export-docx', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({highlights:sortedHighlights})});
      if (!response.ok) { const value=await response.json(); throw new Error(value.error||'Word dosyası oluşturulamadı.'); }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `beykoz-sohbetleri-notlarim-${new Date().toISOString().slice(0, 10)}.docx`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExportBusy(false);
    }
  };

  const totalNotesCount = userHighlights.filter(h => !!h.note).length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Üst Başlık & İstatistikler */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-paper-300 dark:border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-700 dark:text-amber-300">
              <Bookmark className="w-4 h-4" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-stone-100">
              Notlarım & Vurgulamalarım
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400">
            Sohbetleri okurken aldığınız tüm vurgulamalar ve kişisel tefekkür notlarınız.
          </p>
        </div>

        {/* İstatistik ve Dışa Aktarma */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-paper-200 dark:bg-stone-800 border border-paper-300 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300">
            <span className="font-bold text-stone-900 dark:text-white">{userHighlights.length}</span> Vurgulama •{' '}
            <span className="font-bold text-stone-900 dark:text-white">{totalNotesCount}</span> Not
          </div>

          {filteredHighlights.length > 0 && (
            <button
              onClick={handleExportWord}
              disabled={exportBusy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 dark:bg-amber-600 hover:bg-stone-800 dark:hover:bg-amber-700 text-white text-xs font-semibold transition-colors shadow-sm"
              title="Notları Word Dosyası Olarak İndir"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{exportBusy?'Hazırlanıyor…':'Dışa Aktar'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Arama & Filtreleme Çubuğu */}
      <div className="bg-paper-100/90 dark:bg-stone-900/90 p-4 rounded-2xl border border-paper-300 dark:border-stone-800 mb-8 flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Arama */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Vurgulanan metin veya notlarda ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-stone-800 rounded-xl border border-paper-300 dark:border-stone-700 text-stone-800 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
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

        {/* Sohbet Filtresi & Renk Filtresi */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          {/* Sohbet Seçimi */}
          <select
            value={selectedConvFilter}
            onChange={(e) => setSelectedConvFilter(e.target.value)}
            className="text-xs bg-white dark:bg-stone-800 py-2 px-3 rounded-xl border border-paper-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 focus:outline-none"
          >
            <option value="all">Tüm Sohbetler</option>
            {conversations.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>

          {/* Renk Seçimi */}
          <div className="flex items-center gap-1 bg-white dark:bg-stone-800 p-1 rounded-xl border border-paper-300 dark:border-stone-700">
            <button
              onClick={() => setSelectedColor('all')}
              className={`px-2 py-1 text-[11px] rounded-lg transition-colors ${
                selectedColor === 'all' ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 font-semibold' : 'text-stone-500'
              }`}
            >
              Tümü
            </button>
            <button
              onClick={() => setSelectedColor('amber')}
              className={`w-5 h-5 rounded-full bg-amber-400 ${selectedColor === 'amber' ? 'ring-2 ring-stone-900 dark:ring-white scale-110' : 'opacity-70'}`}
              title="Sarı"
            />
            <button
              onClick={() => setSelectedColor('emerald')}
              className={`w-5 h-5 rounded-full bg-emerald-400 ${selectedColor === 'emerald' ? 'ring-2 ring-stone-900 dark:ring-white scale-110' : 'opacity-70'}`}
              title="Yeşil"
            />
            <button
              onClick={() => setSelectedColor('sky')}
              className={`w-5 h-5 rounded-full bg-sky-400 ${selectedColor === 'sky' ? 'ring-2 ring-stone-900 dark:ring-white scale-110' : 'opacity-70'}`}
              title="Mavi"
            />
            <button
              onClick={() => setSelectedColor('rose')}
              className={`w-5 h-5 rounded-full bg-rose-400 ${selectedColor === 'rose' ? 'ring-2 ring-stone-900 dark:ring-white scale-110' : 'opacity-70'}`}
              title="Gül"
            />
          </div>
        </div>
      </div>

      {/* Not Kartları Listesi */}
      {filteredHighlights.length === 0 ? (
        <div className="text-center py-16 px-4 bg-paper-100/50 dark:bg-stone-900/50 rounded-3xl border border-dashed border-paper-300 dark:border-stone-800">
          <Bookmark className="w-12 h-12 mx-auto mb-3 text-stone-400 opacity-40" />
          <h3 className="text-base font-serif font-semibold text-stone-800 dark:text-stone-200 mb-1">
            Henüz not veya vurgulama bulunamadı
          </h3>
          <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto mb-5">
            Sohbetleri okurken herhangi bir cümlenin üzerini fareyle seçerek renkli vurgulayabilir ve kişisel notlar ekleyebilirsiniz.
          </p>
          <button
            onClick={() => onNavigateToConversation(conversations[0]?.id || '')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>Sohbet Okumaya Başla</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sortedHighlights.map((hl) => {
            const isEditing = editingNoteId === hl.id;

            return (
              <div
                key={hl.id}
                className="bg-white dark:bg-stone-900 rounded-3xl p-5 border border-paper-300/80 dark:border-stone-800 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between group"
              >
                <div>
                  {/* Başlık & Tarih */}
                  <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-paper-200 dark:border-stone-800">
                    <span className="text-xs font-serif font-semibold text-stone-800 dark:text-stone-200 truncate">
                      {hl.conversationTitle}
                    </span>
                    <span className="text-[10px] text-stone-400 flex-shrink-0">
                      {new Date(hl.createdAt).toLocaleDateString('tr-TR')}
                    </span>
                  </div>

                  {/* Vurgulanan Alıntı */}
                  <div className="relative mb-4">
                    <blockquote className={`p-3.5 rounded-2xl bg-${hl.color}-50/60 dark:bg-stone-800/80 border-l-4 border-${hl.color}-500 text-stone-800 dark:text-stone-200 font-serif text-sm leading-relaxed`}>
                      "{hl.selectedText}"
                    </blockquote>
                  </div>

                  {/* Kişisel Not Alanı */}
                  {isEditing ? (
                    <div className="mb-3 space-y-2">
                      <textarea
                        rows={2}
                        value={editingNoteText}
                        onChange={(e) => setEditingNoteText(e.target.value)}
                        className="w-full p-2.5 text-xs bg-paper-50 dark:bg-stone-800 border border-paper-300 dark:border-stone-700 rounded-xl text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="Notunuzu yazın..."
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingNoteId(null)}
                          className="px-2.5 py-1 text-xs text-stone-500 hover:text-stone-700"
                        >
                          İptal
                        </button>
                        <button
                          onClick={() => {
                            updateHighlightNote(hl.id, editingNoteText);
                            setEditingNoteId(null);
                          }}
                          className="px-3 py-1 text-xs bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-semibold"
                        >
                          Kaydet
                        </button>
                      </div>
                    </div>
                  ) : hl.note ? (
                    <div 
                      onClick={() => {
                        setEditingNoteId(hl.id);
                        setEditingNoteText(hl.note || '');
                      }}
                      className="p-3 bg-paper-100 dark:bg-stone-800/50 rounded-xl mb-3 cursor-pointer hover:bg-paper-200/70 transition-colors"
                      title="Notu düzenlemek için tıklayın"
                    >
                      <div className="flex items-center justify-between text-[11px] font-semibold text-amber-800 dark:text-amber-400 mb-1">
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          Kişisel Düşünceniz:
                        </span>
                        <span className="text-[10px] text-stone-400 font-normal">Düzenle</span>
                      </div>
                      <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                        {hl.note}
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingNoteId(hl.id);
                        setEditingNoteText('');
                      }}
                      className="text-[11px] text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1 mb-3"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Bu alıntıya not ekle...</span>
                    </button>
                  )}
                </div>

                {/* Alt Aksiyon Butonları */}
                <div className="flex items-center justify-between pt-3 border-t border-paper-200 dark:border-stone-800 text-xs">
                  <button
                    onClick={() => onNavigateToConversation(hl.conversationId, hl.paragraphId)}
                    className="flex items-center gap-1 text-stone-600 dark:text-stone-300 hover:text-amber-700 dark:hover:text-amber-400 font-medium transition-colors"
                  >
                    <span>Sohbette Göster</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopyQuote(hl.id, hl.selectedText, hl.note)}
                      className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg hover:bg-paper-100 dark:hover:bg-stone-800 transition-colors"
                      title="Alıntıyı Kopyala"
                    >
                      {copiedId === hl.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => removeHighlight(hl.id)}
                      className="p-1.5 text-stone-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                      title="Vurgulamayı Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
