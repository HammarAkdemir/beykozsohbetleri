import {ShortVideo} from '../../types';
export function MobileInlineVideo({video,index}:{video:ShortVideo;index:number}){
 const external=video.sourceType&&video.sourceType!=='upload';
 return <aside className="mobile-inline-video" aria-label={'İlgili kısa video '+(index+1)}>
  <span>İlgili kısa video</span>
  <div className="mobile-inline-frame">
   {external?<iframe src={video.videoUrl} title={'İlgili kısa video '+(index+1)} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen/>:<><video className="inline-video-backdrop" src={video.videoUrl} muted playsInline aria-hidden="true"/><video className="inline-video-main" src={video.videoUrl} controls playsInline preload="metadata"/></>}
  </div>
 </aside>;
}
