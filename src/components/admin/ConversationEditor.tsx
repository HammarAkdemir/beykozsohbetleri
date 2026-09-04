import {useEffect,useRef} from 'react';
import {Paragraph} from '../../types';
function clean(value:string){
 const doc=new DOMParser().parseFromString(value,'text/html');
 const escape=(text:string)=>text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
 const walk=(node:Node):string=>{if(node.nodeType===3)return escape(node.textContent||'');if(!(node instanceof Element))return '';const tag=node.tagName.toLowerCase();if(['script','style','iframe','img'].includes(tag))return '';if(tag==='br')return '\n';const children=Array.from(node.childNodes).map(walk).join('');if(['strong','b','em','i','u','s','sup','sub'].includes(tag))return `<${tag==='b'?'strong':tag==='i'?'em':tag}>${children}</${tag==='b'?'strong':tag==='i'?'em':tag}>`;return children+(['div','p'].includes(tag)?'\n':'');};
 const html=Array.from(doc.body.childNodes).map(walk).join('').replace(/\n$/,'');
 const parsed=new DOMParser().parseFromString(html,'text/html');return {html,text:parsed.body.textContent||''};
}
function TextBlock({paragraph,onChange,disabled}:{paragraph:Paragraph,onChange:(p:Paragraph)=>void,disabled:boolean}){
 const ref=useRef<HTMLDivElement>(null);
 useEffect(()=>{if(ref.current)ref.current.innerHTML=paragraph.html?clean(paragraph.html).html:paragraph.text.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');},[paragraph.id]);
 const sync=()=>{if(ref.current)onChange({...paragraph,...clean(ref.current.innerHTML)});};
 return <><div className="edit-format">{[['bold','Kalın'],['italic','İtalik'],['underline','Altı çizili']].map(([command,label])=><button key={command} type="button" className="secondary" onMouseDown={e=>e.preventDefault()} onClick={()=>{ref.current?.focus();document.execCommand(command);sync();}}>{label}</button>)}</div><div ref={ref} className="editable-text" contentEditable={!disabled} role="textbox" aria-label="Paragraf metni" aria-multiline="true" suppressContentEditableWarning onInput={sync} onPaste={e=>{e.preventDefault();document.execCommand('insertText',false,e.clipboardData.getData('text/plain'));sync();}}/></>;
}
export function ConversationEditor({paragraphs,onChange,disabled}:{paragraphs:Paragraph[],onChange:(p:Paragraph[])=>void,disabled:boolean}){
 const update=(index:number,p:Paragraph)=>onChange(paragraphs.map((old,i)=>i===index?p:old));
 return <fieldset className="conversation-editor" disabled={disabled}><legend>Metni düzenle</legend>{paragraphs.map((p,index)=><section key={p.id} className={'editor-block '+(p.kind==='quote'?'editor-quote':'')}><div className="editor-block-tools"><label>Bölüm türü<select value={p.kind||'paragraph'} onChange={e=>update(index,{...p,kind:e.target.value})}><option value="paragraph">Paragraf</option><option value="heading">Başlık</option><option value="quote">Alıntı</option><option value="list">Liste öğesi</option></select></label><button type="button" className="danger" onClick={()=>{if(confirm('Bu bölüm metinden çıkarılsın mı?'))onChange(paragraphs.filter((_,i)=>i!==index));}}>Bölümü kaldır</button></div>{p.subtitle!==undefined&&<label>Alt başlık<input value={p.subtitle} onChange={e=>update(index,{...p,subtitle:e.target.value})}/></label>}<TextBlock paragraph={p} disabled={disabled} onChange={value=>update(index,value)}/>{p.quote&&<div className="legacy-quote"><label>Alıntı<textarea value={p.quote.text} onChange={e=>update(index,{...p,quote:{...p.quote!,text:e.target.value}})}/></label><label>Kaynak<input value={p.quote.source||''} onChange={e=>update(index,{...p,quote:{...p.quote!,source:e.target.value}})}/></label></div>}</section>)}<button type="button" className="secondary" onClick={()=>onChange([...paragraphs,{id:crypto.randomUUID(),text:'',kind:'paragraph'}])}>Paragraf ekle</button></fieldset>;
}
