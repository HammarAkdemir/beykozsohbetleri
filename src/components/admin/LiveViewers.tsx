import {useCallback,useEffect,useState} from 'react';
import {Eye,RefreshCw} from 'lucide-react';
import {api} from '../../lib/api';
type Viewer={id:string;name:string;lastSeen:number};
export function LiveViewers(){
 const [viewers,setViewers]=useState<Viewer[]>([]),[error,setError]=useState('');
 const load=useCallback(()=>api('live-viewers').then(d=>{setViewers(d.viewers||[]);setError('');}).catch(e=>setError(e.message)),[]);
 useEffect(()=>{load();const timer=window.setInterval(load,10000);return()=>clearInterval(timer);},[load]);
 return <div className="live-viewers"><div className="live-viewers-heading"><div><h2><Eye size={19}/>Yayını izleyenler <span>{viewers.length}</span></h2><p>Yayına bağlı site üyeleri burada görünür.</p></div><button type="button" className="secondary" onClick={load}><RefreshCw size={15}/>Yenile</button></div>{error&&<p className="notice">{error}</p>}{viewers.length===0?<p className="empty-moderation">Şu anda yayını izleyen üye yok.</p>:<ul>{viewers.map(viewer=><li key={viewer.id}><span className="viewer-dot"/><strong>{viewer.name}</strong><small>Yayında</small></li>)}</ul>}</div>;
}
