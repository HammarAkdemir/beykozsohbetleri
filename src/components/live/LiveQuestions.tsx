import {FormEvent,useCallback,useEffect,useState} from 'react';
import {CheckCircle2,Clock3,HelpCircle,Send} from 'lucide-react';
import {api} from '../../lib/api';
import {useContent} from '../../context/ContentContext';
type Question={id:string;text:string;status:'pending'|'approved'|'rejected';createdAt:string};
export function LiveQuestions(){
 const {liveStream}=useContent();const [published,setPublished]=useState<Question[]>([]),[mine,setMine]=useState<Question[]>([]),[text,setText]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const load=useCallback(()=>api('questions').then(d=>{setPublished(d.published||[]);setMine(d.mine||[]);}).catch(()=>{}),[]);
 useEffect(()=>{load();if(!liveStream.isLive)return;const timer=window.setInterval(load,10000);return()=>clearInterval(timer);},[load,liveStream.isLive]);
 async function submit(e:FormEvent){e.preventDefault();if(!text.trim())return;setBusy(true);setMessage('');try{await api('questions',{action:'submit',text});setText('');setMessage('Sorunuz yönetici onayına gönderildi.');await load();}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}
 return <section className="live-questions"><header><HelpCircle/><div><h2>Sorular</h2><p>Yayın sırasında sorunuzu gönderin. Düzenlenip onaylanan sorular burada yayınlanır.</p></div></header>
 {liveStream.isLive?<form onSubmit={submit}><label htmlFor="live-question">Soru sor</label><textarea id="live-question" maxLength={1000} value={text} onChange={e=>setText(e.target.value)} placeholder="Sorunuzu buraya yazın…" required/><div className="question-form-footer"><small>{text.length}/1000</small><button disabled={busy||text.trim().length<5}><Send size={16}/>{busy?'Gönderiliyor…':'Soruyu gönder'}</button></div></form>:<p className="questions-closed">Soru gönderme alanı yayın başladığında açılır.</p>}
 {message&&<p className="question-message" role="status">{message}</p>}
 {mine.length>0&&<div className="my-question-status"><h3>Gönderdiğiniz sorular</h3>{mine.map(q=><p key={q.id}><Clock3 size={14}/>{q.text}<span>{q.status==='pending'?'Onay bekliyor':'Yayınlanmadı'}</span></p>)}</div>}
 <div className="published-questions"><h3>Onaylanan Sorular</h3>{published.length===0?<p>Henüz yayınlanan bir soru yok.</p>:published.map(q=><article key={q.id}><CheckCircle2 size={18}/><p>{q.text}</p></article>)}</div>
 </section>;
}
