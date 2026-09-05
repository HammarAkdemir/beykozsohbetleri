import React,{useState} from 'react';
import {ArrowRight,Lock} from 'lucide-react';
import {useAuth} from '../../context/AuthContext';
export function AuthModal(){
 const {currentUser,isApproved,loading,error,setupRequired,login,register,logout,refresh}=useAuth();
 const [mode,setMode]=useState('login'),[message,setMessage]=useState(''),[busy,setBusy]=useState(false);
 const registration=mode==='register';
 const initialSetup=registration&&setupRequired;
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setMessage('');const d=Object.fromEntries(new FormData(e.currentTarget));try{const r=registration?await register(d):await login(d.username,d.password);if(!r.success)setMessage(r.message);}catch(e){setMessage((e as Error).message);}finally{setBusy(false);}}
 if(isApproved)return null;
 return <div className="auth-page auth-minimal"><section className="auth-card"><h1 className="auth-title">Beykoz Sohbetleri</h1>
 {loading?<p>Yükleniyor…</p>:error?<p role="alert">{error}</p>:currentUser?<><Lock/><h2>Üyelik onayı bekleniyor</h2><p>{currentUser.name}, başvurunuz alındı. Yönetici onayından sonra sohbetlere erişebilirsiniz.</p><button onClick={()=>refresh()}>Başvuru durumunu kontrol et</button><button className="secondary" onClick={logout}>Çıkış yap</button></>:<>
 {registration&&<p>{setupRequired?'İlk hesap yönetici hesabınız olacak.':'Üyelik başvurunuz incelendikten sonra kullanıcı adı ve şifreniz yönetici tarafından oluşturulacaktır.'}</p>}
 <form onSubmit={submit}>{initialSetup?<><label>Ad soyad<input name="name" required autoComplete="name"/></label><label>Kullanıcı adı<input name="username" type="text" required autoComplete="username" autoCapitalize="none" spellCheck={false} minLength={3} maxLength={32} pattern="[a-zA-Z0-9_.-]{3,32}"/></label><label>Şifre<input name="password" type="password" required minLength={10} maxLength={256} autoComplete="new-password"/></label><small>Kullanıcı adı 3–32 karakter, şifre en az 10 karakter olmalıdır.</small></>:registration?<><label>Ad Soyad<input name="name" required autoComplete="name" maxLength={160}/></label><label>Doğum Tarihi<input name="birthDate" type="date" required autoComplete="bday" max={new Date().toISOString().slice(0,10)}/></label><label>Telefon Numarası<input name="phone" type="tel" required autoComplete="tel" inputMode="tel" maxLength={30} placeholder="05__ ___ __ __"/></label></>:<><label>Kullanıcı adı<input name="username" type="text" required autoComplete="username" autoCapitalize="none" spellCheck={false} maxLength={32}/></label><label>Şifre<input name="password" type="password" required maxLength={256} autoComplete="current-password"/></label></>}{message&&<p role="alert" className="form-error">{message}</p>}<button disabled={busy} type="submit">{busy?'Lütfen bekleyin…':registration?'Başvuru gönder':'Giriş yap'} <ArrowRight size={16}/></button></form><div className="mt-6 text-center text-sm"><button type="button" className="auth-switch" onClick={()=>{setMode(registration?'login':'register');setMessage('');}}>{registration?'Giriş yap':'Hesap oluştur'}</button></div></>}
 </section></div>;
}
