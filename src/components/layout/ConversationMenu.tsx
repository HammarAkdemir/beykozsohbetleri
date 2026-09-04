import {useEffect,useRef} from 'react';
import {BookOpen,ChevronDown} from 'lucide-react';
import {useContent} from '../../context/ContentContext';

export function ConversationMenu({active,onNavigate}:{active:boolean;onNavigate:()=>void}) {
 const {conversations,selectConversation,selectedConversationId}=useContent();
 const root=useRef<HTMLDetailsElement>(null);
 useEffect(()=>{
  const outside=(e:PointerEvent)=>{if(root.current&&!root.current.contains(e.target as Node))root.current.open=false;};
  const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'&&root.current?.open){root.current.open=false;root.current.querySelector('summary')?.focus();}};
  document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
  return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
 },[]);
 return <details ref={root} className="conversation-menu">
  <summary className={'conversation-trigger '+(active?'is-active':'')}><BookOpen size={16}/><span>Sohbetler</span><ChevronDown size={13} className="conversation-chevron"/></summary>
  <div className="conversation-dropdown">
   {conversations.length ? conversations.map(c=><button key={c.id} aria-current={active&&selectedConversationId===c.id?'page':undefined} onClick={()=>{selectConversation(c.id);if(root.current)root.current.open=false;onNavigate();window.scrollTo({top:0});}}>{c.title}</button>):<p>Henüz sohbet eklenmedi.</p>}
  </div>
 </details>;
}
