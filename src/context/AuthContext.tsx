import React, {createContext,useContext,useEffect,useState} from 'react';
import {User} from '../types';
import {api} from '../lib/api';
const AuthContext=createContext<any>(null);
export function AuthProvider({children}:{children:React.ReactNode}) {
 const [currentUser,setCurrentUser]=useState<User|null>(null),[users,setUsers]=useState<User[]>([]),[loading,setLoading]=useState(true),[setupRequired,setSetup]=useState(false),[error,setError]=useState('');
 const [memberPreview,setMemberPreview]=useState(()=>sessionStorage.getItem('memberPreview')==='true');
 const setMemberView=(enabled:boolean)=>{setMemberPreview(enabled);sessionStorage.setItem('memberPreview',String(enabled));};
 const refresh=async()=>{const d=await api('session');setCurrentUser(d.user);setSetup(d.setupRequired);};
 useEffect(()=>{refresh().catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);
 const refreshUsers=async()=>setUsers(await api('users'));
 useEffect(()=>{if(currentUser?.role==='admin')refreshUsers().catch(e=>setError(e.message));else setUsers([]);},[currentUser]);
 const authenticate=async(path:string,data:unknown)=>{try{const r=await api(path,data);setCurrentUser(r.user);setSetup(false);return {success:true,message:''};}catch(e){return {success:false,message:(e as Error).message};}};
 const action=async(id:string,action:string,details:Record<string,string>={})=>{await api('user',{id,action,...details});await refreshUsers();};
 return <AuthContext.Provider value={{memberPreview,setMemberView,currentUser,users,loading,error,setupRequired,refresh,login:(username:string,password:string)=>authenticate('login',{username,password}),register:(d:unknown)=>authenticate(setupRequired?'setup':'register',d),changePassword:(currentPassword:string,newPassword:string)=>api('change-password',{currentPassword,newPassword}),logout:async()=>{await api('logout',{});setCurrentUser(null);setMemberView(false);},approveUser:(id:string,details:Record<string,string>={})=>action(id,'approved',details),rejectUser:(id:string)=>action(id,'rejected'),suspendUser:(id:string)=>action(id,'suspended'),activateUser:(id:string)=>action(id,'approved'),editUser:(id:string,details:Record<string,string>)=>action(id,'edit',details),deleteUser:(id:string)=>action(id,'delete'),makeAdmin:(id:string)=>action(id,'make-admin'),makeMember:(id:string)=>action(id,'make-member'),isAdmin:currentUser?.role==='admin'&&currentUser.status==='approved'&&!memberPreview,isApproved:currentUser?.status==='approved',isPending:currentUser?.status==='pending'}}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);
