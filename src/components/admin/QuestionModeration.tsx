import {useCallback,useEffect,useState} from 'react';
import {Check,RefreshCw,Save,X} from 'lucide-react';
import {api} from '../../lib/api';
type Question={id:string;author:string;originalText:string;text:string;status:'pending'|'approved'|'rejected';createdAt:string};
export function QuestionModeration(){
 const [items,setItems]=useState<Question[]>([]),[busy,setBusy]=useState(''),[message,setMessage]=useState('');
 const load=useCallback(()=>api('questions').then(d=>setItems(d.questions||[])).catch(e=>setMessage(e.message)),[]);
 useEffect(()=>{load();const timer=setInterval(load,10000);return()=>clearInterval(timer);},[load]);
 const update=(id:string,text:string)=>setItems(v=>v.map(q=>q.id===id?{...q,text}:q));
 async function act(q:Question,action:'save'|'approve'|'reject'){setBusy(q.id);setMessage('');try{await api('questions',{id:q.id,action,text:q.text});setMessage(action==='approve'?'Soru yayınlandı.':action==='reject'?'Soru yayınlanmadı.':'Düzenleme kaydedildi.');await load();}catch(e){setMessage((e as Error).message);}finally{setBusy('');}}
 const pending=items.filter(q=>q.status==='pending'),published=items.filter(q=>q.status==='approved');
 return <div className="question-moderation"><div className="moderation-heading"><div><h2>Soru onayı</h2><p>Üyenin yazdığı metni düzenleyin ve hazır olduğunda yayınlayın.</p></div><button className="secondary" onClick={load}><RefreshCw size={15}/>Yenile</button></div>{message&&<p className="notice" role="status">{message}</p>}
 <h3>Onay bekleyenler ({pending.length})</h3>{pending.length===0?<p className="empty-moderation">Bekleyen soru yok.</p>:pending.map(q=><article key={q.id} className="moderation-card"><div><strong>{q.author}</strong><small>{new Date(q.createdAt).toLocaleString('tr-TR')}</small></div><details><summary>Üyenin gönderdiği metin</summary><blockquote>{q.originalText}</blockquote></details><label>Yayınlanacak soru<textarea value={q.text} maxLength={1000} onChange={e=>update(q.id,e.target.value)}/></label><div className="moderation-actions"><button disabled={busy===q.id} className="secondary" onClick={()=>act(q,'save')}><Save size={15}/>Taslağı kaydet</button><button disabled={busy===q.id} onClick={()=>act(q,'approve')}><Check size={15}/>Düzenle ve yayınla</button><button disabled={busy===q.id} className="danger" onClick={()=>act(q,'reject')}><X size={15}/>Yayınlama</button></div></article>)}
 <h3 className="published-heading">Yayınlananlar ({published.length})</h3>{published.map(q=><article key={q.id} className="moderation-card published"><label>Yayınlanan soru<textarea value={q.text} maxLength={1000} onChange={e=>update(q.id,e.target.value)}/></label><div className="moderation-actions"><button disabled={busy===q.id} className="secondary" onClick={()=>act(q,'save')}><Save size={15}/>Düzenlemeyi kaydet</button><button disabled={busy===q.id} className="danger" onClick={()=>act(q,'reject')}><X size={15}/>Yayından kaldır</button></div></article>)}</div>;
}
