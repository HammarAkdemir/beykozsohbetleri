import React, { useState, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  X, 
  PlusCircle, 
  Video as VideoIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { useAuth } from '../../context/AuthContext';
import { ShortVideo } from '../../types';

interface SidebarRightProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdminVideos?: () => void;
}

export const SidebarRight: React.FC<SidebarRightProps> = ({
  isOpen,
  onClose,
  onOpenAdminVideos,
}) => {
  const { activeConversation, activeConversationVideos } = useContent();
  const { isAdmin } = useAuth();
  
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [mutedVideos, setMutedVideos] = useState<Record<string, boolean>>({});
  const [modalVideo, setModalVideo] = useState<ShortVideo | null>(null);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const modalVideoRef = useRef<HTMLVideoElement | null>(null);
  const modalStartTime = useRef(0);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setPlayingVideoId(null);
    setModalVideo(null);
    if (videoContainerRef.current) videoContainerRef.current.scrollTop = 0;
  }, [activeConversation?.id]);

  if (!isOpen) return null;


  const handlePlayToggle = (videoId: string) => {
    const videoEl = videoRefs.current[videoId];
    if (!videoEl) return;

    if (playingVideoId === videoId && !videoEl.paused) {
      videoEl.pause();
      setPlayingVideoId(null);
    } else {
      // Pause all other videos
      Object.keys(videoRefs.current).forEach(id => {
        if (id !== videoId && videoRefs.current[id]) {
          videoRefs.current[id]?.pause();
        }
      });
      videoEl.play().then(() => {
        setPlayingVideoId(videoId);
        const card = videoEl.closest('[data-video-card]') as HTMLElement | null;
        const list = videoContainerRef.current;
        if (card && list) list.scrollTop += card.getBoundingClientRect().top - list.getBoundingClientRect().top - 12;
      }).catch(() => setPlayingVideoId(null));
    }
  };

  const handleMuteToggle = (e: React.MouseEvent, videoId: string) => {
    e.stopPropagation();
    const muted = !(mutedVideos[videoId] ?? false);
    const el = videoRefs.current[videoId];
    if (el) el.muted = muted;
    setMutedVideos(prev => ({ ...prev, [videoId]: muted }));
  };

  const closeModalVideo = () => {
    const enlarged = modalVideoRef.current;
    if (enlarged) {
      enlarged.pause();
      if (modalVideo) {
        const inline = videoRefs.current[modalVideo.id];
        if (inline && Number.isFinite(enlarged.currentTime)) inline.currentTime = enlarged.currentTime;
      }
      enlarged.removeAttribute('src');
      enlarged.load();
    }
    setPlayingVideoId(null);
    setModalVideo(null);
  };

  return (
    <>
      <aside className="short-video-sidebar lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-80 xl:w-88 flex-shrink-0 bg-paper-100/90 dark:bg-stone-900/95 border-l border-paper-300 dark:border-stone-800 flex flex-col transition-all duration-300 overflow-hidden shadow-lg lg:shadow-none">
        
        {/* Bilgilendirme Notu & Admin Hızlı Video Ekle Butonu */}
        <div className="px-4 py-2.5 bg-paper-200/50 dark:bg-stone-800/40 border-b border-paper-300/50 dark:border-stone-800 text-[11px] space-y-2">
          {isAdmin && onOpenAdminVideos && (
            <button
              onClick={onOpenAdminVideos}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Bu Sohbete Video Ekle / Yükle</span>
            </button>
          )}
          <div className="text-stone-600 dark:text-stone-400">
            <span className="font-semibold text-stone-800 dark:text-stone-200 truncate block">
              "{activeConversation?.title}"
            </span>
            <span>sohbetine özel seçilmiş kısa kesitler:</span>
          </div>
        </div>


        {/* Video Listesi (Okuma ilerledikçe otomatik aşağı kayar) */}
        <div 
          ref={videoContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-5 scroll-smooth select-none"
        >
          {activeConversationVideos.length === 0 ? (
            <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-paper-300 dark:border-stone-800 text-stone-400 text-xs flex flex-col items-center">
              <VideoIcon className="w-10 h-10 mb-2 opacity-30 text-stone-500" />
              <p className="font-medium text-stone-600 dark:text-stone-300 mb-1">
                Henüz video atanmadı
              </p>
              <p className="text-[11px] text-stone-400 max-w-[200px] mb-4">
                Bu sohbete özel eklenmiş kısa video bulunmuyor.
              </p>
              {isAdmin && onOpenAdminVideos && (
                <button
                  onClick={onOpenAdminVideos}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sage-600 hover:bg-sage-700 text-white text-xs font-medium transition-colors shadow-sm"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Bu Sohbete Video Ekle</span>
                </button>
              )}
            </div>
          ) : (
            activeConversationVideos.map((video) => {
              if(video.sourceType && video.sourceType !== 'upload') return <div key={video.id} className="short-embed-card"><iframe src={video.videoUrl} title="Kısa video" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen/></div>;
              const isPlaying = playingVideoId === video.id;
              const isMuted = mutedVideos[video.id] ?? false;

              return (
                <div
                  key={video.id}
                  data-video-card
                  className="group relative bg-black rounded-3xl overflow-hidden shadow-lg border border-stone-800 flex flex-col"
                >
                  {/* Dikey 9:16 Reels Konumu (Yatay ve Dikey Videoları Kusursuz Uyarlar - İstek #7) */}
                  <div 
                    onClick={() => handlePlayToggle(video.id)}
                    className="relative aspect-[9/15] w-full bg-stone-950 cursor-pointer overflow-hidden flex items-center justify-center select-none"
                  >
                    {/* Arka Plan Ortam Bulanıklığı (Yatay videolar için Reels ambiyansı) */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <video
                        src={video.videoUrl}
                        className="w-full h-full object-cover scale-150 blur-2xl opacity-40"
                        muted
                        playsInline
                        controlsList="nodownload"
                        disablePictureInPicture
                        onContextMenu={(e) => e.preventDefault()}
                      />
                      <div className="absolute inset-0 bg-stone-950/40" />
                    </div>

                    {/* Ana Video (Reels Konumunda Ortalanmış & İndirme Engelli) */}
                    <video
                      ref={(el) => { videoRefs.current[video.id] = el; }}
                      src={video.videoUrl}
                      className="relative z-10 w-full h-full object-contain"
                      muted={isMuted}
                      playsInline
                      onEnded={() => setPlayingVideoId(null)}
                      controlsList="nodownload"
                      disablePictureInPicture
                      onContextMenu={(e) => e.preventDefault()}
                    />


                    {/* Oynat/Durdur Katmanı */}
                    <div className={`absolute inset-0 z-20 bg-stone-900/25 flex items-center justify-center transition-opacity duration-200 ${
                      isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'
                    }`}>
                      <div className="w-13 h-13 rounded-full bg-white/90 dark:bg-stone-900/90 text-stone-900 dark:text-white flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
                        {isPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </div>
                    </div>

                    {/* Süre Etiketi */}
                    <span className="absolute bottom-2.5 right-2.5 z-20 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-sm text-white text-[10px] font-mono font-medium">
                      {video.duration}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleMuteToggle(e, video.id)}
                      className="absolute bottom-2.5 left-2.5 z-30 p-2.5 rounded-xl bg-black/70 text-white hover:bg-black/90 transition-colors"
                      title={isMuted ? 'Sesi aç' : 'Sesi kapat'}
                      aria-label={isMuted ? 'Sesi aç' : 'Sesi kapat'}
                      aria-pressed={!isMuted}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    {/* Tam Ekran / Büyütme Butonu */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        modalStartTime.current=videoRefs.current[video.id]?.currentTime||0;
                        Object.values(videoRefs.current).forEach(el => el?.pause());
                        setPlayingVideoId(null);
                        setModalVideo(video);
                      }}
                      className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-xl bg-black/60 backdrop-blur-sm text-white hover:bg-black/90 transition-colors"
                      title="Geniş Ekranda İzle"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>


                  {/* Video Başlığı & Açıklaması */}
                  <div className="p-3 bg-white dark:bg-stone-900 border-t border-paper-200 dark:border-stone-800">
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 line-clamp-2 mt-0.5">
                      {video.description}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Alt Video Sayacı */}
        {activeConversationVideos.length > 0 && (
          <div className="p-2.5 bg-paper-200/50 dark:bg-stone-950/40 border-t border-paper-300/60 dark:border-stone-800 text-center text-[10px] text-stone-500">
            {activeConversationVideos.length} adet kısa kesit mevcut • Site içi yerel veri
          </div>
        )}
      </aside>

      {/* Tam Ekran / Büyük Oynatıcı Modalı */}
      {modalVideo && (
        <div 
          onClick={closeModalVideo}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-sm w-full bg-stone-900 rounded-3xl overflow-hidden shadow-2xl border border-stone-800 flex flex-col"
          >
            <div className="p-3 border-b border-stone-800 flex items-center justify-end text-white">
              <button
                onClick={closeModalVideo}
                aria-label="Büyük video görünümünü kapat"
                className="p-1 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-[9/16] bg-black">
              <video
                ref={modalVideoRef}
                src={modalVideo.videoUrl}
                muted={mutedVideos[modalVideo.id] ?? false}
                onVolumeChange={e => { const muted = e.currentTarget.muted; setMutedVideos(prev => prev[modalVideo.id] === muted ? prev : { ...prev, [modalVideo.id]: muted }); }}
                className="w-full h-full object-contain"
                controls
                controlsList="nodownload"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
                onLoadedMetadata={e=>{if(modalStartTime.current<e.currentTarget.duration)e.currentTarget.currentTime=modalStartTime.current;}}
                autoPlay
                playsInline
              />
            </div>


            <div className="p-4 bg-stone-900 text-stone-300 text-xs">
              
              <p className="text-stone-400 text-[11px] leading-relaxed">{modalVideo.description}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
