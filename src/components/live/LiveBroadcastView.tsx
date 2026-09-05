import {useEffect,useRef,useState} from 'react';
import {LockKeyhole,Maximize2,Radio} from 'lucide-react';
import {useContent} from '../../context/ContentContext';
import {api} from '../../lib/api';
import {LiveQuestions} from './LiveQuestions';
export function LiveBroadcastView(){
 const {liveStream}=useContent();const mount=useRef<HTMLDivElement>(null),player=useRef<HTMLDivElement>(null),client=useRef<any>(null);const [configured,setConfigured]=useState(false),[status,setStatus]=useState(''),[busy,setBusy]=useState(false),[joined,setJoined]=useState(false);
 useEffect(()=>{api('zoom').then(d=>setConfigured(d.configured)).catch(e=>setStatus(e.message));return()=>{client.current?.leaveMeeting();};},[]);
 const embedUrl=liveStream.streamEmbedUrl;
 const isWatching=liveStream.isLive&&(Boolean(embedUrl)||joined);
 useEffect(()=>{if(!isWatching)return;const heartbeat=()=>api('live-viewers',{action:'heartbeat'}).catch(()=>{});heartbeat();const timer=window.setInterval(heartbeat,15000);return()=>{clearInterval(timer);fetch('/api/live-viewers',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'leave'}),keepalive:true}).catch(()=>{});};},[isWatching]);
 async function watch(){setBusy(true);setStatus('Yayına bağlanılıyor…');try{const join=await api('zoom/join');const Zoom=(await import('@zoom/meetingsdk/embedded')).default;client.current=Zoom.createClient();await client.current.init({zoomAppRoot:mount.current!,language:'tr-TR',patchJsMedia:true,leaveOnPageUnload:true});client.current.on('connection-change',(event:any)=>{if(event?.state==='Closed')setJoined(false);});await client.current.join(join);setJoined(true);setStatus('');}catch{setStatus('Yayına bağlanılamadı. Yayın açıldığında yeniden deneyin.');}finally{setBusy(false);}}
 async function fullscreen(){if(!document.fullscreenElement)await player.current?.requestFullscreen();else await document.exitFullscreen();}
 return <div className="admin-shell live-page"><h1 className="text-4xl mb-4">Canlı Yayın</h1>
 <section className="live-stage">
  <Radio size={36}/>
  <h2>{liveStream.isLive?'Canlı yayın':'Yayın kapalı'}</h2>
  <p>{liveStream.isLive?'Canlı yayını aşağıdaki alandan doğrudan izleyebilirsiniz.':'Yayın başladığında bu sayfada canlı olarak yayınlanacaktır.'}</p>
  {liveStream.isLive&&(
   embedUrl?<div className="w-full max-w-4xl mx-auto my-4 aspect-video rounded-xl overflow-hidden shadow-2xl border border-neutral-700 bg-black"><iframe src={embedUrl} title="Canlı Yayın" className="w-full h-full border-0" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen/></div>:
   <div className="flex flex-col items-center gap-3 mt-3">
    <div className="w-full max-w-3xl aspect-video bg-neutral-900 rounded-xl flex flex-col items-center justify-center p-6 border border-neutral-700 text-center shadow-lg"><Radio size={48} className="text-emerald-500 animate-pulse mb-3"/><p className="text-lg font-medium text-white mb-2">Canlı yayın başladı</p><p className="text-sm text-neutral-400 max-w-md mb-4">Yayını bu sayfa üzerinden izleyebilirsiniz.</p>{configured?<button disabled={busy||joined} onClick={watch}>{busy?'Bağlanılıyor…':joined?'Yayına bağlanıldı':'Yayını izle'}</button>:<p className="text-sm text-neutral-400">Canlı yayın bağlantısı hazırlanıyor.</p>}</div>
   </div>
  )}
  {status&&<p role="status">{status}</p>}
 </section>
 <aside className="broadcast-rights-notice"><LockKeyhole size={19}/><p>Herhangi bir video kaydının veya sohbet metninin başka bir yerde yayınlanmasına izin yoktur.</p></aside>
 <div ref={player} className={'live-player '+(joined?'is-visible':'')}><button className="live-fullscreen" onClick={fullscreen}><Maximize2 size={17}/> Tam ekran</button><div ref={mount} className="zoom-mount"/></div>
 <LiveQuestions/>
 </div>;
}
