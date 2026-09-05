import {useEffect,useRef,useState} from 'react';
import {LockKeyhole,Maximize2,Radio} from 'lucide-react';
import {useContent} from '../../context/ContentContext';
import {useAuth} from '../../context/AuthContext';
import {api} from '../../lib/api';
import {LiveQuestions} from './LiveQuestions';
export function LiveBroadcastView(){
 const {liveStream}=useContent();const {isAdmin}=useAuth();const mount=useRef<HTMLDivElement>(null),player=useRef<HTMLDivElement>(null),client=useRef<any>(null);const [configured,setConfigured]=useState(false),[status,setStatus]=useState(''),[busy,setBusy]=useState(false),[joined,setJoined]=useState(false);
 useEffect(()=>{api('zoom').then(d=>setConfigured(d.configured)).catch(e=>setStatus(e.message));return()=>{client.current?.leaveMeeting();};},[]);
 async function watch(){setBusy(true);setStatus('Yayına bağlanılıyor…');try{const join=await api('zoom/join');const Zoom=(await import('@zoom/meetingsdk/embedded')).default;client.current=Zoom.createClient();await client.current.init({zoomAppRoot:mount.current!,language:'tr-TR',patchJsMedia:true,leaveOnPageUnload:true});await client.current.join(join);setJoined(true);setStatus('');}catch{setStatus('Yayına bağlanılamadı. Yayın açıldığında yeniden deneyin.');}finally{setBusy(false);}}
 async function fullscreen(){if(!document.fullscreenElement)await player.current?.requestFullscreen();else await document.exitFullscreen();}
  const zoomUrl=liveStream.zoomDirectUrl||'https://us06web.zoom.us/j/8369840665?pwd=YTVYZ0R4cjBJUW5WL1IvcEtlRzJLUT09';
  return <div className="admin-shell live-page"><h1 className="text-4xl mb-4">Canlı Yayın</h1><section className="live-stage"><Radio size={36}/><h2>{liveStream.isLive?'Canlı yayın':'Yayın kapalı'}</h2><p>{liveStream.isLive?'Canlı yayına Zoom üzerinden katılabilirsiniz.':'Yayın başladığında buradan katılabilirsiniz.'}</p>{liveStream.isLive&&<div className="flex gap-3 justify-center mt-3"><a href={zoomUrl} target="_blank" rel="noopener noreferrer" className="live-join-button inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors shadow">Yayına Katıl (Zoom)</a>{configured&&<button disabled={busy} onClick={watch}>{busy?'Bağlanılıyor…':'Sayfada izle'}</button>}</div>}{status&&<p role="status">{status}</p>}</section><aside className="broadcast-rights-notice"><LockKeyhole size={19}/><p>Herhangi bir video kaydının veya sohbet metininin başka bir yerde yayınlanmasına izin yoktur.</p></aside><div ref={player} className={'live-player '+(joined?'is-visible':'')}><button className="live-fullscreen" onClick={fullscreen}><Maximize2 size={17}/> Tam ekran</button><div ref={mount} className="zoom-mount"/></div><LiveQuestions/></div>;
 }
