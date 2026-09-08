import React,{createContext,useContext,useEffect,useState} from 'react';
import {useAuth} from './AuthContext';
import {api} from '../lib/api';
import {Conversation,ShortVideo,LiveStream} from '../types';
const Context=createContext<any>(null);
export function ContentProvider({children}:{children:React.ReactNode}){
 const {isApproved,currentUser}=useAuth();
 const [data,setData]=useState<{conversations:Conversation[],videos:ShortVideo[],liveStream:LiveStream}>({conversations:[],videos:[],liveStream:{isLive:false,title:'Beykoz Sohbetleri',description:'',scheduledDate:'',scheduledTime:'',activeViewerCount:0}});
 const [selected,setSelected]=useState(''),[error,setError]=useState('');
 useEffect(()=>{if(isApproved)api('content').then(setData).catch(e=>setError(e.message));else setData(d=>({...d,conversations:[],videos:[]}));},[isApproved,currentUser?.id]);
 async function mutate(group:string,action:string,item?:unknown,id?:string){const d=await api('content',{group,action,data:item,id});setData(d);return d[group]?.at(-1);}
 async function reorderVideos(ids:string[]){const d=await api('content',{group:'videos',action:'reorder',data:ids});setData(d);}
 const activeConversation=data.conversations.find(c=>c.id===selected)||data.conversations[0];
 const orderedVideos=[...data.videos].sort((a,b)=>(a.order??Number.MAX_SAFE_INTEGER)-(b.order??Number.MAX_SAFE_INTEGER));
 return <Context.Provider value={{...data,refreshContent:async()=>setData(await api('content')),videos:orderedVideos,error,activeConversation,selectedConversationId:activeConversation?.id||'',selectConversation:setSelected,activeConversationVideos:orderedVideos.filter(v=>v.assignedConversationIds.includes(activeConversation?.id||'')),addConversation:async(d:unknown)=>{const c=await mutate('conversations','save',d);setSelected(c.id);return c;},updateConversation:(id:string,d:unknown)=>mutate('conversations','save',d,id),deleteConversation:(id:string)=>mutate('conversations','delete',undefined,id),addVideo:(d:unknown)=>mutate('videos','save',d),updateVideo:(id:string,d:unknown)=>mutate('videos','save',d,id),deleteVideo:(id:string)=>mutate('videos','delete',undefined,id),reorderVideos,updateLiveStream:(d:unknown)=>mutate('liveStream','save',d)}}>{children}</Context.Provider>;
}
type ContentValue = {conversations:Conversation[]; videos:ShortVideo[]; liveStream:LiveStream; activeConversation:Conversation|undefined; activeConversationVideos:ShortVideo[]; selectedConversationId:string; selectConversation:(id:string)=>void; [key:string]:any};
export const useContent=():ContentValue=>{const value=useContext(Context);return {...value,conversations:[...value.conversations].sort((a:Conversation,b:Conversation)=>a.order-b.order)};};
