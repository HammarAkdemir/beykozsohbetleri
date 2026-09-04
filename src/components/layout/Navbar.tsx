import React, { useState, useEffect, useRef } from 'react';
import { 
  Headphones,
  Image,
  Video,
  BookOpen, 
  Radio, 
  Bookmark, 
  Shield, 
  Sliders, 
  ChevronDown, 
  Check, 
  Menu, 
  X,
  Sparkles,
  LogOut,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useContent } from '../../context/ContentContext';

interface NavbarProps {
  activeTab: 'reader' | 'live' | 'notes' | 'admin' | 'photos' | 'videos' | 'audio';
  setActiveTab: (tab: 'reader' | 'live' | 'notes' | 'admin' | 'photos' | 'videos' | 'audio') => void;
  onOpenSettings: () => void;
  onOpenConversations: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenConversations,
}) => {
  const { currentUser, logout, changePassword, isAdmin, memberPreview, setMemberView } = useAuth();
  const { liveStream } = useContent();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isPasswordFormOpen,setIsPasswordFormOpen]=useState(false);
  const [currentPassword,setCurrentPassword]=useState(''),[newPassword,setNewPassword]=useState(''),[passwordAgain,setPasswordAgain]=useState(''),[passwordBusy,setPasswordBusy]=useState(false),[passwordMessage,setPasswordMessage]=useState('');
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Sayfa geçişlerinde kullanıcı sekmesini kapat
  const handleTabChange = (tab: 'reader' | 'live' | 'notes' | 'admin' | 'photos' | 'videos' | 'audio') => {
    setActiveTab(tab);
    if (tab === 'reader') onOpenConversations();
    setIsUserMenuOpen(false);
    setIsMobileNavOpen(false);
  };

  // Dışarı tıklandığında kullanıcı menüsünü kapat (Kullanıcı İsteği)
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('touchstart', handleOutsideClick);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [isUserMenuOpen]);

  const submitPassword=async(e:React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();setPasswordMessage('');
    if(newPassword!==passwordAgain){setPasswordMessage('Yeni şifreler aynı değil.');return;}
    if(newPassword.length<10){setPasswordMessage('Yeni şifre en az 10 karakter olmalı.');return;}
    setPasswordBusy(true);
    try{await changePassword(currentPassword,newPassword);setCurrentPassword('');setNewPassword('');setPasswordAgain('');setPasswordMessage('Şifreniz değiştirildi.');}
    catch(error){setPasswordMessage((error as Error).message);}
    finally{setPasswordBusy(false);}
  };

  return (
    <header className="site-header sticky top-0 z-40 bg-paper-50/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-paper-300/80 dark:border-stone-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Sol: Logo ve Sol Menü Butonu */}
          <div className="flex items-center gap-3">


            <button
              onClick={() => handleTabChange('live')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-9 h-9 rounded-xl bg-stone-800 dark:bg-sage-600 flex items-center justify-center text-paper-50 shadow-sm group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5 text-sage-200 dark:text-stone-900" />
              </div>
              <div>
                <span className="text-lg font-serif font-semibold tracking-tight text-stone-900 dark:text-stone-100 block leading-tight">
                  Beykoz Sohbetleri
                </span>
              </div>
            </button>
          </div>

          {/* Orta: Ana Sekmeler (Masaüstü) */}
          <nav className="site-navigation hidden xl:flex items-center gap-1 bg-paper-200/70 dark:bg-stone-800/80 p-1.5 rounded-2xl border border-paper-300/60 dark:border-stone-700/60">
            <button
              onClick={() => handleTabChange('live')}
              className={`flex items-center gap-2 px-2 py-2 rounded-xl text-xs font-medium transition-all relative ${
                activeTab === 'live'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-paper-100/60 dark:hover:bg-stone-700/40'
              }`}
            >
              <Radio className={`w-4 h-4 ${liveStream.isLive ? 'text-red-500 animate-pulse' : 'text-stone-500'}`} />
              <span>Canlı Yayın</span>
              {liveStream.isLive && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
              )}
            </button>

            <button onClick={() => handleTabChange('reader')} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${activeTab === 'reader' ? 'bg-white dark:bg-stone-800 shadow-sm' : 'text-stone-600 dark:text-stone-300 hover:bg-paper-100 dark:hover:bg-stone-800'}`}><BookOpen size={16}/><span>Sohbetler</span></button>

            <button
              onClick={() => handleTabChange('notes')}
              className={`flex items-center gap-2 px-2 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'notes'
                  ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 shadow-sm'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-paper-100/60 dark:hover:bg-stone-700/40'
              }`}
            >
              <Bookmark className="w-4 h-4 text-sage-600 dark:text-sage-400" />
              <span>Notlarım</span>
            </button>

            {(['photos','videos','audio'] as const).map(tab => <button key={tab} onClick={()=>handleTabChange(tab)} className={`flex items-center gap-2 px-2 py-2 rounded-xl text-xs font-medium whitespace-nowrap ${activeTab===tab?'bg-white dark:bg-stone-900 shadow-sm':'text-stone-600 dark:text-stone-400 hover:bg-paper-100 dark:hover:bg-stone-700'}`}>{tab==='photos'?<Image className="w-4 h-4"/>:tab==='audio'?<Headphones className="w-4 h-4"/>:<Video className="w-4 h-4"/>}<span>{tab==='photos'?'Fotoğraflar':tab==='audio'?'Ses Kayıtları':'Videolar'}</span></button>)}

            {isAdmin && (
              <button
                onClick={() => handleTabChange('admin')}
                className={`flex items-center gap-2 px-2 py-2 rounded-xl text-xs font-medium transition-all ${
                  activeTab === 'admin'
                    ? 'bg-stone-900 text-white dark:bg-sage-600 dark:text-stone-950 shadow-sm'
                    : 'text-sage-700 dark:text-sage-400 hover:text-stone-900 dark:hover:text-white hover:bg-sage-50 dark:hover:bg-stone-700/40'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>Admin Paneli</span>
              </button>
            )}
          </nav>


          {/* Sağ Aksiyonlar: Okuma Ayarları, Shorts Paneli, Kullanıcı Menüsü */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Okuma Görünüm Ayarları */}
            <button
              onClick={onOpenSettings}
              className="p-2 text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white rounded-xl hover:bg-paper-200 dark:hover:bg-stone-800 transition-colors"
              title="Okuma & Yazı Tipi Ayarları"
              aria-label="Okuma Ayarları"
            >
              <Sliders className="w-5 h-5" />
            </button>

            {/* Kullanıcı Menüsü & Hızlı Rol Değiştirici */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-paper-200/80 dark:bg-stone-800 hover:bg-paper-300/80 dark:hover:bg-stone-700 transition-all border border-paper-300 dark:border-stone-700 text-left"
              >

                <div className="w-7 h-7 rounded-full bg-stone-800 dark:bg-sage-600 text-paper-50 flex items-center justify-center font-medium text-xs">
                  {currentUser?.name.charAt(0) || 'U'}
                </div>
                <div className="hidden 2xl:block">
                  <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 leading-tight">
                    {currentUser?.name || 'Giriş Yapılmadı'}
                  </p>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400 capitalize">
                    {memberPreview ? 'Üye görünümü' : currentUser?.role === 'admin' ? 'Yönetici' : 'Üye'}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
              </button>

              {/* Kullanıcı Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 max-h-[calc(100vh-5rem)] overflow-y-auto bg-white dark:bg-stone-900 rounded-2xl shadow-xl border border-paper-300 dark:border-stone-800 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-paper-200 dark:border-stone-800 mb-1">
                    <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                      {currentUser?.name}
                    </p>
                    <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                      {currentUser?.username || currentUser?.email}
                    </p>
                    <span className={`inline-block mt-1 text-[11px] px-2 py-0.5 rounded-md font-medium ${
                      currentUser?.role === 'admin' 
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' 
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                    }`}>
                      {currentUser?.role === 'admin' ? 'Yönetici (Admin)' : 'Onaylı Üye'}
                    </span>
                  </div>

                  {currentUser?.role === 'admin' && (
                    <button
                      onClick={() => { setMemberView(!memberPreview); handleTabChange('reader'); }}
                      className="w-full px-3 py-2 text-left text-sm rounded-lg hover:bg-paper-200 dark:hover:bg-stone-800"
                    >
                      {memberPreview ? 'Yönetici görünümüne dön' : 'Üye olarak görüntüle'}
                    </button>
                  )}
                  <button
                    onClick={() => {setIsPasswordFormOpen(!isPasswordFormOpen);setPasswordMessage('');}}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm rounded-lg hover:bg-paper-200 dark:hover:bg-stone-800"
                    aria-expanded={isPasswordFormOpen}
                  >
                    <KeyRound className="w-4 h-4"/>
                    <span>Şifre Değiştir</span>
                  </button>
                  {isPasswordFormOpen&&<form className="password-change-form" onSubmit={submitPassword}>
                    <label>Mevcut şifre<input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} required autoComplete="current-password"/></label>
                    <label>Yeni şifre<input type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required minLength={10} maxLength={256} autoComplete="new-password"/></label>
                    <label>Yeni şifre tekrar<input type="password" value={passwordAgain} onChange={e=>setPasswordAgain(e.target.value)} required minLength={10} maxLength={256} autoComplete="new-password"/></label>
                    {passwordMessage&&<p className={passwordMessage==='Şifreniz değiştirildi.'?'password-success':'password-error'} role="status">{passwordMessage}</p>}
                    <button disabled={passwordBusy}>{passwordBusy?'Değiştiriliyor…':'Şifreyi Kaydet'}</button>
                  </form>}
                  <div className="pt-1 mt-1 border-t border-paper-200 dark:border-stone-800">
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobil Menü Butonu */}
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="p-2 xl:hidden text-stone-600 dark:text-stone-300 hover:text-stone-900 rounded-lg hover:bg-paper-200 dark:hover:bg-stone-800"
              aria-label="Mobil Menü"
            >
              {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobil Sekmeler */}
      {isMobileNavOpen && (
        <div className="xl:hidden border-t border-paper-200 dark:border-stone-800 bg-paper-50 dark:bg-stone-900 px-4 pt-2 pb-4 space-y-1">
          <button
            onClick={() => { setActiveTab('live'); setIsMobileNavOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium ${
              activeTab === 'live' ? 'bg-paper-200 dark:bg-stone-800 text-stone-900 dark:text-white' : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <Radio className="w-4 h-4 text-red-500" />
              <span>Canlı Yayın</span>
            </div>
            {liveStream.isLive && (
              <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-semibold">
                Canlı
              </span>
            )}
          </button>
          <button onClick={() => handleTabChange('reader')} className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${activeTab === 'reader' ? 'bg-white dark:bg-stone-800 shadow-sm' : 'text-stone-600 dark:text-stone-300 hover:bg-paper-100 dark:hover:bg-stone-800'}`}><BookOpen size={16}/><span>Sohbetler</span></button>
          <button
            onClick={() => { setActiveTab('notes'); setIsMobileNavOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium ${
              activeTab === 'notes' ? 'bg-paper-200 dark:bg-stone-800 text-stone-900 dark:text-white' : 'text-stone-600 dark:text-stone-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <Bookmark className="w-4 h-4 text-sage-600" />
              <span>Notlarım</span>
            </div>
          </button>
            {(['photos','videos','audio'] as const).map(tab => <button key={tab} onClick={()=>handleTabChange(tab)} className={`flex items-center gap-2 px-2 py-2 rounded-xl text-xs font-medium whitespace-nowrap ${activeTab===tab?'bg-white dark:bg-stone-900 shadow-sm':'text-stone-600 dark:text-stone-400 hover:bg-paper-100 dark:hover:bg-stone-700'}`}>{tab==='photos'?<Image className="w-4 h-4"/>:tab==='audio'?<Headphones className="w-4 h-4"/>:<Video className="w-4 h-4"/>}<span>{tab==='photos'?'Fotoğraflar':tab==='audio'?'Ses Kayıtları':'Videolar'}</span></button>)}

          {isAdmin && (
            <button
              onClick={() => { setActiveTab('admin'); setIsMobileNavOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium ${
                activeTab === 'admin' ? 'bg-stone-900 text-white dark:bg-sage-600' : 'text-sage-700 dark:text-sage-400'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Paneli</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
