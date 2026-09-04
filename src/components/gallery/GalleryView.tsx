import {useEffect,useRef,useState} from 'react';
import {Image,Video,Headphones,Plus,X,ChevronLeft,ChevronRight,Trash2} from 'lucide-react';
import {useAuth} from '../../context/AuthContext';
import {api,upload} from '../../lib/api';
import {useContent} from '../../context/ContentContext';

type Media={id:string;kind:'photo'|'video'|'audio';url:string;name?:string;createdAt:string};
type VideoEntry={source:'gallery'|'short';item:any};
const VIDEOS_PER_PAGE=7;

export function GalleryView({kind}:{kind:'photo'|'video'|'audio'}){
 const {isAdmin}=useAuth();
 const {videos:shortVideos}=useContent();
 const [items,setItems]=useState<Media[]>([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[selected,setSelected]=useState<string|null>(null),[page,setPage]=useState(1);
 const input=useRef<HTMLInputElement>(null),dialog=useRef<HTMLDialogElement>(null),top=useRef<HTMLDivElement>(null);
 const photo=kind==='photo',audio=kind==='audio',label=photo?'fotoğraf':audio?'ses kaydı':'video',Icon=photo?Image:audio?Headphones:Video;
 const visible=items.filter(i=>i.kind===kind),index=visible.findIndex(i=>i.id===selected);
 const videoEntries:VideoEntry[]=kind==='video'?[...visible.map(item=>({source:'gallery' as const,item})),...shortVideos.map((item:any)=>({source:'short' as const,item}))]:[];
 const pageCount=Math.max(1,Math.ceil(videoEntries.length/VIDEOS_PER_PAGE));
 const pageVideos=videoEntries.slice((page-1)*VIDEOS_PER_PAGE,page*VIDEOS_PER_PAGE);

 useEffect(()=>{let current=true;api('gallery').then(d=>{if(current)setItems(d);}).catch(e=>{if(current)setMessage(e.message);}).finally(()=>{if(current)setLoading(false);});return()=>{current=false;};},[]);
 useEffect(()=>{if(selected&&!dialog.current?.open)dialog.current?.showModal();if(!selected&&dialog.current?.open)dialog.current.close();},[selected]);
 useEffect(()=>{if(page>pageCount)setPage(pageCount);},[page,pageCount]);

 async function add(files:FileList|null){
  if(!files?.length)return;setBusy(true);setMessage('');let count=0;const errors:string[]=[];
  for(const file of Array.from(files)){try{if(file.size>150_000_000)throw new Error('Dosya 150 MB sınırını aşıyor.');const item=await upload('gallery/'+kind,file);setItems(prev=>[item,...prev]);count++;}catch(e){errors.push(file.name+': '+(e as Error).message);}}
  setMessage([count?`${count} ${label} eklendi.`:'',...errors].filter(Boolean).join(' '));setBusy(false);setPage(1);if(input.current)input.current.value='';
 }
 async function remove(item:Media){if(!confirm('Bu '+label+' kaldırılsın mı?'))return;setBusy(true);try{await api('gallery/delete',{id:item.id});setItems(prev=>prev.filter(i=>i.id!==item.id));setSelected(null);setMessage('Galeriden kaldırıldı.');}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}
 const move=(delta:number)=>{if(visible.length)setSelected(visible[(index+delta+visible.length)%visible.length].id);};
 const goPage=(next:number)=>{setPage(next);requestAnimationFrame(()=>top.current?.scrollIntoView({behavior:'smooth',block:'start'}));};
 const empty=kind==='video'?videoEntries.length===0:visible.length===0;

 return <div ref={top} className="gallery-shell"><header className="gallery-header"><h1>{photo?'Fotoğraflar':audio?'Ses Kayıtları':'Videolar'}</h1>{isAdmin&&<><input ref={input} hidden type="file" multiple accept={photo?'image/jpeg,image/png,image/webp,image/gif':audio?'audio/mpeg,audio/mp4,audio/x-m4a,audio/wav,audio/x-wav,audio/ogg,audio/aac,audio/flac,audio/webm':'video/mp4,video/webm,video/quicktime'} onChange={e=>add(e.target.files)}/><button className="gallery-add" disabled={busy} onClick={()=>input.current?.click()}><Plus size={17}/>{busy?'Yükleniyor…':photo?'Fotoğraf ekle':audio?'Ses kaydı ekle':'Video ekle'}</button></>}</header>
 {message&&<p className="notice" role="status">{message}</p>}
 {loading?<p role="status">Yükleniyor…</p>:empty?<div className="gallery-empty"><Icon size={40}/><p>Henüz {label} eklenmedi.</p></div>:<>
  <div className={'gallery-grid '+(photo?'gallery-photos':audio?'gallery-audio':'gallery-videos')}>
   {kind!=='video'&&visible.map((item,i)=><figure key={item.id} className="gallery-item">{photo?<button className="gallery-photo" aria-label={`Fotoğraf ${i+1}, büyüt`} onClick={()=>setSelected(item.id)}><img src={item.url} alt={`Beykoz Sohbetleri fotoğrafı ${i+1}`} loading="lazy"/></button>:<div className="audio-recording"><Headphones size={22}/><p>{item.name||`Ses kaydı ${i+1}`}</p><audio src={item.url} controls preload="metadata" aria-label={item.name||`Ses kaydı ${i+1}`}/></div>}{isAdmin&&<button className="gallery-remove" aria-label={photo?'Fotoğrafı kaldır':'Ses kaydını kaldır'} title="Galeriden kaldır" disabled={busy} onClick={()=>remove(item)}><Trash2 size={15}/></button>}</figure>)}
   {kind==='video'&&pageVideos.map((entry,i)=>{const number=(page-1)*VIDEOS_PER_PAGE+i+1;if(entry.source==='gallery'){const item=entry.item as Media;return <figure key={item.id} className="gallery-item"><video src={item.url} controls playsInline preload="metadata" aria-label={`Galeri videosu ${number}`}/>{isAdmin&&<button className="gallery-remove" aria-label="Videoyu kaldır" title="Galeriden kaldır" disabled={busy} onClick={()=>remove(item)}><Trash2 size={15}/></button>}</figure>;}const video=entry.item;return <figure key={'short-'+video.id} className="gallery-item short-gallery-item">{video.sourceType&&video.sourceType!=='upload'?<iframe src={video.videoUrl} title={'Kısa video '+number} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen/>:<video src={video.videoUrl} controls playsInline preload="metadata" aria-label={'Kısa video '+number}/>}<figcaption>Kısa video</figcaption></figure>;})}
  </div>
  {kind==='video'&&pageCount>1&&<nav className="video-pagination" aria-label="Video sayfaları"><button onClick={()=>goPage(page-1)} disabled={page===1}><ChevronLeft size={17}/>Önceki</button><span>Sayfa <strong>{page}</strong> / {pageCount}</span><button onClick={()=>goPage(page+1)} disabled={page===pageCount}>Sonraki<ChevronRight size={17}/></button></nav>}
 </>}
 <dialog ref={dialog} className="gallery-lightbox" aria-label="Fotoğraf görüntüleyici" onCancel={()=>setSelected(null)} onClick={e=>{if(e.target===e.currentTarget)setSelected(null);}} onKeyDown={e=>{if(e.key==='ArrowLeft'){e.preventDefault();move(-1);}if(e.key==='ArrowRight'){e.preventDefault();move(1);}}}>{index>=0&&<><button className="lightbox-close" aria-label="Kapat" onClick={()=>setSelected(null)}><X/></button><img src={visible[index].url} alt={`Beykoz Sohbetleri fotoğrafı ${index+1}`}/>{visible.length>1&&<><button className="lightbox-prev" aria-label="Önceki fotoğraf" onClick={()=>move(-1)}><ChevronLeft/></button><button className="lightbox-next" aria-label="Sonraki fotoğraf" onClick={()=>move(1)}><ChevronRight/></button></>}<span className="lightbox-count">{index+1} / {visible.length}</span></>}</dialog>
 </div>;
}
