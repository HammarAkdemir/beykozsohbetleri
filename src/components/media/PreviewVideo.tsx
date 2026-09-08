import {useEffect,useRef,useState} from 'react';

export function PreviewVideo({src,label}:{src:string;label:string}){
 const ref=useRef<HTMLVideoElement>(null),capturing=useRef(false),started=useRef(false);
 const [poster,setPoster]=useState<string>();
 useEffect(()=>{setPoster(undefined);capturing.current=false;started.current=false;},[src]);
 return <video ref={ref} src={src} poster={poster} controls playsInline preload="metadata" aria-label={label}
  onPlay={()=>{started.current=true;capturing.current=false;}}
  onLoadedMetadata={e=>{const video=e.currentTarget;if(!started.current&&Number.isFinite(video.duration)&&video.duration>0){capturing.current=true;video.currentTime=Math.min(0.5,video.duration/2);}}}
  onSeeked={e=>{if(!capturing.current||started.current)return;capturing.current=false;const video=e.currentTarget;try{const canvas=document.createElement('canvas');canvas.width=Math.min(640,video.videoWidth);canvas.height=Math.round(canvas.width*video.videoHeight/video.videoWidth);canvas.getContext('2d')?.drawImage(video,0,0,canvas.width,canvas.height);setPoster(canvas.toDataURL('image/jpeg',0.8));}catch{/* Cross-origin videos retain the browser preview. */}video.currentTime=0;}}/>;
}
