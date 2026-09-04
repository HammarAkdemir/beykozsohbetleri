import {ChevronDown} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ContentProvider, useContent } from './context/ContentContext';
import { NotesProvider } from './context/NotesContext';
import { GalleryView } from './components/gallery/GalleryView';
import { Navbar } from './components/layout/Navbar';
import { SidebarLeft } from './components/layout/SidebarLeft';
import { SidebarRight } from './components/layout/SidebarRight';
import { ConversationReader } from './components/reader/ConversationReader';
import { ReaderSettingsModal } from './components/reader/ReaderSettingsModal';
import { MyNotesView } from './components/notes/MyNotesView';
import { LiveBroadcastView } from './components/live/LiveBroadcastView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AuthModal } from './components/auth/AuthModal';

const MainLayout: React.FC = () => {
  const { isApproved, isAdmin } = useAuth();
  const { activeConversation, selectConversation } = useContent();

  const [adminSection, setAdminSection] = useState('conversations');
  const [activeTab, setActiveTab] = useState<'reader' | 'live' | 'notes' | 'admin' | 'photos' | 'videos' | 'audio'>('live');
  useEffect(() => { if (isApproved) setActiveTab('live'); }, [isApproved]);
  const [isSidebarLeftOpen, setIsSidebarLeftOpen] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleSelectConversationFromLeft = (id: string) => {
    selectConversation(id);
    if (window.innerWidth < 1024) setIsSidebarLeftOpen(false);
    setActiveTab('reader');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToNotes = () => {
    setActiveTab('notes');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateFromNotesToConversation = (conversationId: string, paragraphId?: string) => {
    selectConversation(conversationId);
    setActiveTab('reader');
    
    // Smooth scroll to target paragraph after render
    setTimeout(() => {
      if (paragraphId) {
        const el = document.getElementById(`paragraph-${paragraphId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-2', 'ring-amber-500/50', 'bg-amber-100/40', 'dark:bg-stone-800');
          setTimeout(() => {
            el.classList.remove('ring-2', 'ring-amber-500/50', 'bg-amber-100/40', 'dark:bg-stone-800');
          }, 2500);
        }
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  if (!isApproved) return <AuthModal />;

  return (
    <div className="site-shell min-h-screen bg-paper-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Üst Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenConversations={() => setIsSidebarLeftOpen(true)}
      />

      {/* Ana Gövde Düzeni */}
      <div className="flex-1 flex w-full max-w-full mx-auto">
        
        {/* Sol Menü: Sohbetler (İçindekiler) */}
        {activeTab === 'reader' && (
          <SidebarLeft
            isOpen={isSidebarLeftOpen}
            onClose={() => setIsSidebarLeftOpen(false)}
            onSelectConversation={handleSelectConversationFromLeft}
            onOpenAdminConversations={() => {setAdminSection('conversations');setActiveTab('admin');}}
          />
        )}


        {/* Orta Alan: Dinamik İçerik Görünümü */}
        <main className="flex-1 min-w-0 transition-all">
          {activeTab === 'reader' && !isSidebarLeftOpen && (
            <div className="sticky top-16 z-20 flex justify-start p-3 pointer-events-none">
              <button onClick={() => setIsSidebarLeftOpen(true)} aria-expanded={false} className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-xl border border-paper-300 bg-white text-sage-800 shadow-sm dark:bg-stone-900 dark:text-sage-200 dark:border-stone-700" aria-label="Sohbet listesini aç">Sohbetler <ChevronDown size={14}/></button>
            </div>
          )}
          {activeTab === 'reader' && activeConversation && (
            <ConversationReader
              conversation={activeConversation}
              onNavigateToNotes={handleNavigateToNotes}
            />
          )}

          {activeTab === 'live' && (
            <LiveBroadcastView />
          )}

          {activeTab === 'notes' && (
            <MyNotesView
              onNavigateToConversation={handleNavigateFromNotesToConversation}
            />
          )}

          {(activeTab === 'photos' || activeTab === 'videos' || activeTab === 'audio') && <GalleryView key={activeTab} kind={activeTab === 'photos' ? 'photo' : activeTab === 'audio' ? 'audio' : 'video'} />}

          {activeTab === 'admin' && isAdmin && (
            <AdminDashboard initialTab={adminSection} />
          )}
        </main>

        {/* Sağ Menü: İlgili Kısa Videolar (Reels / Shorts) */}
        {activeTab === 'reader' && (
          <SidebarRight
            isOpen={true}
            onClose={() => {}}
            onOpenAdminVideos={() => {setAdminSection('videos');setActiveTab('admin');}}
          />
        )}
      </div>

      {/* Okuma Ayarları Modalı */}
      <ReaderSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      {/* Üyelik ve Onay Güvenlik Modalı (Onaysız / Giriş yapmamış kullanıcılar için) */}
      <AuthModal />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <ContentProvider>
        <NotesProvider>
          <MainLayout />
        </NotesProvider>
      </ContentProvider>
    </AuthProvider>
  );
}

export default App;
