import os, json, sqlite3, secrets, hashlib, hmac, time, re, io, zipfile, html, base64
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from http.cookies import SimpleCookie
from urllib.parse import urlparse, unquote
import xml.etree.ElementTree as ET
ROOT = Path(__file__).resolve().parent.parent
DATA = Path(os.environ.get('BEYKOZ_DATA', str(ROOT / 'server' / 'data')))
DATA.mkdir(parents=True, exist_ok=True)
DB = DATA / 'beykoz.sqlite'
def connect():
 c=sqlite3.connect(DB); c.row_factory=sqlite3.Row; return c
def init():
 with connect() as c:
  c.executescript('CREATE TABLE IF NOT EXISTS users(id TEXT PRIMARY KEY,data TEXT,username TEXT UNIQUE,password TEXT); CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY,user TEXT,expires REAL); CREATE TABLE IF NOT EXISTS content(id INTEGER PRIMARY KEY,data TEXT); CREATE TABLE IF NOT EXISTS notes(user TEXT PRIMARY KEY,data TEXT);')
  c.execute('CREATE TABLE IF NOT EXISTS gallery(id TEXT PRIMARY KEY,data TEXT)')
  c.execute('CREATE TABLE IF NOT EXISTS live_questions(id TEXT PRIMARY KEY,user_id TEXT,data TEXT)')
  c.execute('CREATE TABLE IF NOT EXISTS live_viewers(user_id TEXT PRIMARY KEY,last_seen REAL)')
  columns={row[1] for row in c.execute('PRAGMA table_info(users)')}
  if 'email' in columns:
   c.execute('ALTER TABLE users RENAME COLUMN email TO username')
  c.execute('INSERT OR IGNORE INTO content VALUES(1,?)', ((ROOT/'server/seed.json').read_text(),))
  admin_username=os.getenv('BEYKOZ_ADMIN_USERNAME','').strip().lower();admin_password=os.getenv('BEYKOZ_ADMIN_PASSWORD','');admin_name=os.getenv('BEYKOZ_ADMIN_NAME','Harun Akdemir').strip()
  if admin_username and admin_password:
   if not re.fullmatch(r'[a-z0-9_.-]{3,32}',admin_username) or len(admin_password)<10:raise ValueError('Geçersiz yönetici hesabı ortam ayarı.')
   row=c.execute('SELECT id,data FROM users WHERE username=?',(admin_username,)).fetchone()
   if row:
    account=json.loads(row['data']);account.update({'name':admin_name,'username':admin_username,'role':'admin','status':'approved'})
    c.execute('UPDATE users SET data=?,password=? WHERE id=?',(json.dumps(account),digest(admin_password),row['id']))
   else:
    identifier=secrets.token_hex(16);now=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime());account={'id':identifier,'name':admin_name,'username':admin_username,'email':'','phone':'','notes':'','registeredAt':now,'role':'admin','status':'approved'}
    c.execute('INSERT INTO users(id,data,username,password) VALUES(?,?,?,?)',(identifier,json.dumps(account),admin_username,digest(admin_password)))
def digest(p, salt=None):
 salt=salt or secrets.token_hex(16)
 return salt+':'+hashlib.pbkdf2_hmac('sha256',p.encode(),salt.encode(),600000).hex()
def docx(raw):
 ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}; w='{'+ns['w']+'}'
 with zipfile.ZipFile(io.BytesIO(raw)) as z:
  if sum(i.file_size for i in z.infolist())>40_000_000: raise ValueError('Word dosyası çok büyük.')
  root=ET.fromstring(z.read('word/document.xml')); styles={}; style_nodes={}
  if 'word/styles.xml' in z.namelist():
   for s in ET.fromstring(z.read('word/styles.xml')).findall('w:style',ns):
    n=s.find('w:name',ns); styles[s.get(w+'styleId')]=n.get(w+'val','') if n is not None else ''
    style_nodes[s.get(w+'styleId')]=s
  result=[]
  for p in root.findall('.//w:body//w:p',ns):
   runs=[]; plain=''
   for r in p.findall('.//w:r',ns):
    t=''.join((x.text or '') if x.tag==w+'t' else '\n' if x.tag==w+'br' else '\t' if x.tag==w+'tab' else '' for x in r)
    plain+=t; v=html.escape(t).replace('\n','<br/>'); props=r.find('w:rPr',ns)
    if props is not None:
     for tag,wrap in [('b','strong'),('i','em'),('u','u')]:
      el=props.find('w:'+tag,ns)
      if el is not None and el.get(w+'val') not in ('0','false','none'): v=f'<{wrap}>{v}</{wrap}>'
    runs.append(v)
   if not plain.strip(): continue
   s=p.find('w:pPr/w:pStyle',ns); style_id=s.get(w+'val','') if s is not None else ''
   names=[]; properties=[]; seen=set()
   while style_id and style_id not in seen:
    seen.add(style_id); names.extend([style_id,styles.get(style_id,'')]); node=style_nodes.get(style_id)
    if node is None: break
    properties.insert(0,node.find('w:pPr',ns))
    parent=node.find('w:basedOn',ns); style_id=parent.get(w+'val','') if parent is not None else ''
   properties.append(p.find('w:pPr',ns)); style=' '.join(names).lower(); indentation={}
   for props in properties:
    if props is not None:
     ind=props.find('w:ind',ns)
     if ind is not None: indentation.update({k.split('}')[-1]:v for k,v in ind.attrib.items()})
   def indent(side,alternate):
    try:return int(indentation.get(side,indentation.get(alternate,'0')))
    except ValueError:return 0
   quoted=any(plain.strip().startswith(a) and plain.strip().endswith(b) for a,b in [('“','”'),('«','»'),('"','"')])
   is_quote=bool(re.search(r'quote|quotation|alıntı|alinti',style)) or (indent('start','left')>=240 and indent('end','right')>=240) or quoted
   kind='heading' if re.search(r'heading|başlık|baslik|title',style) else 'quote' if is_quote else 'list' if p.find('w:pPr/w:numPr',ns) is not None else 'paragraph'
   result.append({'id':secrets.token_hex(10),'text':plain,'html':''.join(runs),'kind':kind})
  if not result: raise ValueError('Dosyada okunabilir metin bulunamadı.')
  return result
def notes_docx(highlights, conversations):
 if not isinstance(highlights,list) or not highlights or len(highlights)>5000:raise ValueError()
 conversation_map={item['id']:item for item in conversations};groups={}
 for item in highlights:
  if not isinstance(item,dict):raise ValueError()
  conversation_id=str(item.get('conversationId',''))[:100];selected=str(item.get('selectedText','')).strip()[:10000];note=str(item.get('note','')).strip()[:10000]
  if not selected:continue
  conversation=conversation_map.get(conversation_id,{});title=str(conversation.get('title') or item.get('conversationTitle') or 'Sohbet')[:300]
  groups.setdefault(conversation_id,{'title':title,'order':conversation.get('order',999999),'items':[]})['items'].append({'selected':selected,'note':note})
 if not groups:raise ValueError()
 def run(text,bold=False,italic=False,color='000000'):
  props='<w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia" w:cs="Georgia"/><w:sz w:val="22"/><w:szCs w:val="22"/>'+('<w:b/>' if bold else '')+('<w:i/>' if italic else '')+f'<w:color w:val="{color}"/></w:rPr>'
  return f'<w:r>{props}<w:t xml:space="preserve">{html.escape(text)}</w:t></w:r>'
 def paragraph(runs,heading=False,keep=False):
  spacing='<w:spacing w:before="'+('200' if heading else '0')+'" w:after="120" w:line="276" w:lineRule="auto"/>'
  alignment='<w:jc w:val="left"/>' if heading else '<w:jc w:val="both"/>'
  props='<w:pPr>'+spacing+alignment+('<w:keepNext/>' if keep else '')+('<w:keepLines/>' if heading else '')+'</w:pPr>'
  return f'<w:p>{props}{runs}</w:p>'
 body=paragraph(run('Beykoz Sohbetleri Notlarım',bold=True),heading=True,keep=True)
 for group in sorted(groups.values(),key=lambda value:(value['order'],value['title'].casefold())):
  body+=paragraph(run(group['title'],bold=True,color='7A1F2B'),heading=True,keep=True)
  for item in group['items']:
   body+=paragraph(run('“'+item['selected']+'”'),keep=bool(item['note']))
   if item['note']:body+=paragraph(run('Not: ',bold=True)+run(item['note']))
 document='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>'+body+'<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="567" w:gutter="0"/><w:cols w:num="2" w:space="567" w:sep="1"/></w:sectPr></w:body></w:document>'
 styles='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Georgia" w:hAnsi="Georgia" w:cs="Georgia"/><w:sz w:val="22"/><w:szCs w:val="22"/><w:color w:val="000000"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style></w:styles>'
 types='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>'
 rels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>'
 document_rels='<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'
 output=io.BytesIO()
 with zipfile.ZipFile(output,'w',zipfile.ZIP_DEFLATED) as archive:
  archive.writestr('[Content_Types].xml',types);archive.writestr('_rels/.rels',rels);archive.writestr('word/document.xml',document);archive.writestr('word/styles.xml',styles);archive.writestr('word/_rels/document.xml.rels',document_rels)
 return output.getvalue()
class Handler(SimpleHTTPRequestHandler):
 def log_message(self,*a): pass
 def reply(self,data,status=200,cookie=None):
  raw=json.dumps(data,ensure_ascii=False).encode(); self.send_response(status); self.send_header('Content-Type','application/json; charset=utf-8'); self.send_header('Cache-Control','no-store')
  if cookie:self.send_header('Set-Cookie',cookie)
  self.end_headers(); self.wfile.write(raw)
 def file_reply(self,raw,content_type,filename):
  self.send_response(200);self.send_header('Content-Type',content_type);self.send_header('Content-Disposition',f'attachment; filename="{filename}"');self.send_header('Content-Length',str(len(raw)));self.send_header('Cache-Control','no-store');self.end_headers();self.wfile.write(raw)
 def user(self):
  cookie=SimpleCookie(); cookie.load(self.headers.get('Cookie','')); token=cookie.get('beykoz_session')
  if not token:return None
  with connect() as c:
   r=c.execute('SELECT u.data FROM sessions s JOIN users u ON s.user=u.id WHERE s.token=? AND s.expires>?',(token.value,time.time())).fetchone()
  return json.loads(r[0]) if r else None
 def body(self):
  n=int(self.headers.get('Content-Length',0))
  if n>150_000_000: raise ValueError('Dosya boyutu sınırı aşıldı (150 MB).')
  return self.rfile.read(n)
 def do_HEAD(self):
  self.send_error(405)
 def do_GET(self):
  if '..' in unquote(urlparse(self.path).path).split('/'):
   return self.reply({'error':'Geçersiz yol.'},400)
  path=urlparse(self.path).path; u=self.user()
  if path=='/api/session':
   with connect() as c: setup=c.execute('SELECT count(*) FROM users').fetchone()[0]==0
   return self.reply({'user':u,'setupRequired':setup})
  if path.startswith('/api/') or path.startswith('/videos/') or path.startswith('/uploads/'):
   if not u or u['status']!='approved':return self.reply({'error':'Üye girişi gerekli.'},401)
   if path=='/api/content':
    with connect() as c:d=json.loads(c.execute('SELECT data FROM content WHERE id=1').fetchone()[0])
    d['liveStream']={k:v for k,v in d['liveStream'].items() if not k.startswith('zoom')}; return self.reply(d)
   if path=='/api/gallery':
    with connect() as c:items=[json.loads(r[0]) for r in c.execute('SELECT data FROM gallery ORDER BY rowid DESC')]
    return self.reply(items)
   if path=='/api/users':
    if u['role']!='admin':return self.reply({'error':'Yetkiniz yok.'},403)
    with connect() as c: users=[json.loads(r[0]) for r in c.execute('SELECT data FROM users')]
    return self.reply(users)
   if path=='/api/questions':
    with connect() as c: rows=[json.loads(r[0]) for r in c.execute('SELECT data FROM live_questions ORDER BY rowid DESC')]
    if u['role']=='admin':return self.reply({'questions':rows})
    published=[{k:v for k,v in q.items() if k not in ('userId','author')} for q in rows if q['status']=='approved']
    mine=[{k:v for k,v in q.items() if k not in ('userId','author')} for q in rows if q['userId']==u['id'] and q['status']!='approved']
    return self.reply({'published':published,'mine':mine})
   if path=='/api/live-viewers':
    if u['role']!='admin':return self.reply({'error':'Yetkiniz yok.'},403)
    cutoff=time.time()-45
    with connect() as c:
     c.execute('DELETE FROM live_viewers WHERE last_seen<?',(cutoff,))
     rows=c.execute('SELECT u.data,v.last_seen FROM live_viewers v JOIN users u ON u.id=v.user_id WHERE v.last_seen>=? ORDER BY v.last_seen DESC',(cutoff,)).fetchall()
    viewers=[]
    for row in rows:
     member=json.loads(row['data']);viewers.append({'id':member['id'],'name':member['name'],'lastSeen':row['last_seen']})
    return self.reply({'viewers':viewers})
   if path=='/api/notes':
    with connect() as c:r=c.execute('SELECT data FROM notes WHERE user=?',(u['id'],)).fetchone()
    return self.reply(json.loads(r[0]) if r else [])
   if path=='/api/zoom':
    client_id=os.getenv('ZOOM_CLIENT_ID');secret=os.getenv('ZOOM_CLIENT_SECRET');meeting=os.getenv('ZOOM_MEETING_NUMBER','8369840665');password=os.getenv('ZOOM_PASSCODE','')
    return self.reply({'configured':bool(client_id and secret and meeting and password)})
   if path.startswith('/uploads/'):
    self.path='/'+Path(path).name; self.directory=str(DATA/'uploads'); return super().do_GET()
   if path.startswith('/api/'):return self.reply({'error':'Bulunamadı.'},404)
  self.directory=str(ROOT/'dist')
  if path not in ('/','/index.html','/favicon.svg','/beykoz-login-background.webp') and not path.startswith(('/assets/','/videos/')):return self.reply({'error':'Bulunamadı.'},404)
  return super().do_GET()
 def do_POST(self):
  try:self.post()
  except (ValueError,KeyError,zipfile.BadZipFile,ET.ParseError):self.reply({'error':'İşlem tamamlanamadı. Bilgileri ve dosya biçimini kontrol edin.'},400)
  except Exception as e:
   print(type(e).__name__,flush=True); self.reply({'error':'Sunucu işlemi tamamlayamadı.'},500)
 def post(self):
  origin=self.headers.get('Origin'); host=self.headers.get('Host','')
  if origin and urlparse(origin).netloc!=host:return self.reply({'error':'Geçersiz istek kaynağı.'},403)
  path=urlparse(self.path).path; raw=self.body(); d=json.loads(raw) if 'application/json' in self.headers.get('Content-Type','') else {}; u=self.user()
  if path in ('/api/login','/api/register','/api/setup'):
   username=d.get('username','').strip().lower(); pw=d.get('password','')
   if path=='/api/login':
    with connect() as c:r=c.execute('SELECT * FROM users WHERE username=?',(username,)).fetchone()
    if not r or not r['password'] or not hmac.compare_digest(digest(pw,r['password'].split(':')[0]),r['password']):return self.reply({'error':'Kullanıcı adı veya şifre hatalı.'},401)
    u=json.loads(r['data'])
    if u['status'] in ('suspended','rejected'):return self.reply({'error':'Üyeliğiniz aktif değil.'},403)
   else:
    with connect() as c:
     c.execute('BEGIN IMMEDIATE')
     first=c.execute('SELECT count(*) FROM users').fetchone()[0]==0
     if path=='/api/setup' and (not first or self.client_address[0] not in ('127.0.0.1','::1')):return self.reply({'error':'Kurulum tamamlanmış.'},403)
     if path=='/api/register' and first:return self.reply({'error':'Önce yönetici kurulumu gerekli.'},409)
     now=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())
     if path=='/api/setup':
      if len(pw)<10 or len(pw)>256 or not re.fullmatch(r'[a-z0-9_.-]{3,32}',username) or not d.get('name','').strip():raise ValueError()
      u={'id':secrets.token_hex(16),'name':d['name'].strip(),'username':username,'email':'','phone':'','notes':'','registeredAt':now,'role':'admin','status':'approved'}
      stored_username=username;stored_password=digest(pw)
     else:
      name=d.get('name','').strip() or (d.get('firstName','').strip()+' '+d.get('lastName','').strip()).strip();birth_date=d.get('birthDate','').strip();phone=d.get('phone','').strip()
      if not (1<=len(name)<=160 and re.fullmatch(r'\d{4}-\d{2}-\d{2}',birth_date) and 7<=len(re.sub(r'\D','',phone))<=15):raise ValueError()
      try:time.strptime(birth_date,'%Y-%m-%d')
      except ValueError:raise ValueError()
      u={'id':secrets.token_hex(16),'name':name,'birthDate':birth_date,'username':'','email':'','phone':phone,'notes':'','registeredAt':now,'role':'member','status':'pending'}
      stored_username=None;stored_password=None
     try:c.execute('INSERT INTO users(id,data,username,password) VALUES(?,?,?,?)',(u['id'],json.dumps(u),stored_username,stored_password))
     except sqlite3.IntegrityError:return self.reply({'error':'Bu kullanıcı adı zaten kullanılıyor.'},409)
   token=secrets.token_urlsafe(32)
   with connect() as c:c.execute('INSERT INTO sessions VALUES(?,?,?)',(token,u['id'],time.time()+86400))
   return self.reply({'user':u},cookie=f'beykoz_session={token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=86400')
  if path=='/api/logout':
   cookie=SimpleCookie();cookie.load(self.headers.get('Cookie',''))
   if cookie.get('beykoz_session'):
    with connect() as c:c.execute('DELETE FROM sessions WHERE token=?',(cookie['beykoz_session'].value,))
   return self.reply({},cookie='beykoz_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0')
  if not u or u['status']!='approved':return self.reply({'error':'Üye girişi gerekli.'},401)
  if path=='/api/change-password':
   current=d.get('currentPassword','');new=d.get('newPassword','')
   if len(new)<10 or len(new)>256:return self.reply({'error':'Yeni şifre en az 10 karakter olmalı.'},400)
   if current==new:return self.reply({'error':'Yeni şifre mevcut şifreden farklı olmalı.'},400)
   with connect() as c:
    row=c.execute('SELECT password FROM users WHERE id=?',(u['id'],)).fetchone()
    if not row or not row['password'] or not hmac.compare_digest(digest(current,row['password'].split(':')[0]),row['password']):return self.reply({'error':'Mevcut şifreniz hatalı.'},401)
   c.execute('UPDATE users SET password=? WHERE id=?',(digest(new),u['id']))
   return self.reply({'success':True})
  if path=='/api/live-viewers':
   action=d.get('action')
   with connect() as c:
    if action=='heartbeat':
     content=json.loads(c.execute('SELECT data FROM content WHERE id=1').fetchone()[0])
     if not content['liveStream'].get('isLive'):return self.reply({'error':'Yayın kapalı.'},409)
     c.execute('INSERT OR REPLACE INTO live_viewers VALUES(?,?)',(u['id'],time.time()))
    elif action=='leave':c.execute('DELETE FROM live_viewers WHERE user_id=?',(u['id'],))
    else:raise ValueError()
   return self.reply({'success':True})
  if path=='/api/questions':
   if d.get('action')=='submit':
    text=d.get('text','').strip()
    if len(text)<5 or len(text)>1000:return self.reply({'error':'Sorunuz 5–1000 karakter arasında olmalı.'},400)
    with connect() as c:
     content=json.loads(c.execute('SELECT data FROM content WHERE id=1').fetchone()[0])
     if not content['liveStream'].get('isLive'):return self.reply({'error':'Sorular yalnızca canlı yayın sırasında gönderilebilir.'},409)
     identifier=secrets.token_hex(16);now=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())
     q={'id':identifier,'userId':u['id'],'author':u['name'],'originalText':text,'text':text,'status':'pending','createdAt':now,'publishedAt':None}
     c.execute('INSERT INTO live_questions VALUES(?,?,?)',(identifier,u['id'],json.dumps(q)))
    return self.reply({'question':{k:v for k,v in q.items() if k not in ('userId','author')}})
   if u['role']!='admin':return self.reply({'error':'Yönetici yetkisi gerekli.'},403)
   identifier=d.get('id','')
   with connect() as c:
    row=c.execute('SELECT data FROM live_questions WHERE id=?',(identifier,)).fetchone()
    if not row:return self.reply({'error':'Soru bulunamadı.'},404)
    q=json.loads(row[0]);action=d.get('action')
    if action=='delete':c.execute('DELETE FROM live_questions WHERE id=?',(identifier,));return self.reply({})
    if action not in ('save','approve','reject'):raise ValueError()
    text=d.get('text',q['text']).strip()
    if len(text)<5 or len(text)>1000:raise ValueError()
    q['text']=text
    if action=='approve':q['status']='approved';q['publishedAt']=time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())
    elif action=='reject':q['status']='rejected';q['publishedAt']=None
    c.execute('UPDATE live_questions SET data=? WHERE id=?',(json.dumps(q),identifier))
   return self.reply({'question':q})
  if path=='/api/notes':
   if not isinstance(d,list):raise ValueError()
   for h in d:h['userId']=u['id']
   with connect() as c:c.execute('INSERT OR REPLACE INTO notes VALUES(?,?)',(u['id'],json.dumps(d)))
   return self.reply({})
  if path=='/api/notes/export-docx':
   highlights=d.get('highlights',[])
   with connect() as c:content=json.loads(c.execute('SELECT data FROM content WHERE id=1').fetchone()[0])
   return self.file_reply(notes_docx(highlights,content['conversations']),'application/vnd.openxmlformats-officedocument.wordprocessingml.document','beykoz-sohbetleri-notlarim.docx')
  if path=='/api/zoom/join':
   client_id=os.getenv('ZOOM_CLIENT_ID');secret=os.getenv('ZOOM_CLIENT_SECRET');meeting=os.getenv('ZOOM_MEETING_NUMBER','8369840665');password=os.getenv('ZOOM_PASSCODE','')
   if not client_id or not secret or not password:return self.reply({'error':'Canlı yayın bağlantısı henüz yapılandırılmadı.'},503)
   if not re.fullmatch(r'\d{9,11}',meeting):return self.reply({'error':'Zoom toplantı numarası geçersiz.'},500)
   def enc(x):return base64.urlsafe_b64encode(json.dumps(x,separators=(',',':')).encode()).rstrip(b'=').decode()
   now=int(time.time())-30;payload={'appKey':client_id,'mn':meeting,'role':0,'iat':now,'exp':now+7200,'tokenExp':now+7200}
   msg=enc({'alg':'HS256','typ':'JWT'})+'.'+enc(payload); signature=msg+'.'+base64.urlsafe_b64encode(hmac.new(secret.encode(),msg.encode(),hashlib.sha256).digest()).rstrip(b'=').decode()
   return self.reply({'signature':signature,'meetingNumber':meeting,'password':password,'userName':u['name']})
  if u['role']!='admin':return self.reply({'error':'Yönetici yetkisi gerekli.'},403)
  if path in ('/api/gallery/photo','/api/gallery/video','/api/gallery/audio'):
   kind=path.rsplit('/',1)[-1]; mime=self.headers.get('Content-Type','').split(';')[0]
   allowed={'image/jpeg':'.jpg','image/png':'.png','image/webp':'.webp','image/gif':'.gif'} if kind=='photo' else {'video/mp4':'.mp4','video/webm':'.webm','video/quicktime':'.mov'}
   if kind=='audio':allowed={'audio/mpeg':'.mp3','audio/mp3':'.mp3','audio/mp4':'.m4a','audio/x-m4a':'.m4a','audio/wav':'.wav','audio/x-wav':'.wav','audio/wave':'.wav','audio/ogg':'.ogg','audio/aac':'.aac','audio/flac':'.flac','audio/x-flac':'.flac','audio/webm':'.webm'}
   ext=allowed.get(mime)
   if not ext or not raw:return self.reply({'error':'Desteklenmeyen dosya biçimi.'},400)
   if kind=='audio':
    valid=(ext=='.mp3' and (raw.startswith(b'ID3') or (len(raw)>1 and raw[0]==255 and raw[1]&224==224))) or (ext=='.m4a' and raw[4:8]==b'ftyp') or (ext=='.wav' and raw[:4]==b'RIFF' and raw[8:12]==b'WAVE') or (ext=='.ogg' and raw.startswith(b'OggS')) or (ext=='.aac' and len(raw)>1 and raw[0]==255 and raw[1]&246==240) or (ext=='.flac' and raw.startswith(b'fLaC')) or (ext=='.webm' and raw.startswith(bytes.fromhex('1a45dfa3')))
    if not valid:return self.reply({'error':'Geçerli bir ses dosyası seçin.'},400)
   if kind=='photo':
    valid=(ext=='.jpg' and raw.startswith(b'\xff\xd8\xff')) or (ext=='.png' and raw.startswith(b'\x89PNG\r\n\x1a\n')) or (ext=='.gif' and raw[:6] in (b'GIF87a',b'GIF89a')) or (ext=='.webp' and raw[:4]==b'RIFF' and raw[8:12]==b'WEBP')
    if not valid:return self.reply({'error':'Geçerli bir fotoğraf dosyası seçin.'},400)
   identifier=secrets.token_hex(16);folder=DATA/'uploads';folder.mkdir(exist_ok=True);target=folder/(identifier+ext)
   target.write_bytes(raw);item={'id':identifier,'kind':kind,'category':'','url':'/uploads/'+target.name,'createdAt':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())}
   if kind=='audio':item['name']=Path(unquote(self.headers.get('X-File-Name','Ses kaydı'))).stem[:200]
   try:
    with connect() as c:c.execute('INSERT INTO gallery VALUES(?,?)',(identifier,json.dumps(item)))
   except Exception:
    target.unlink(missing_ok=True);raise
   return self.reply(item)
  if path=='/api/gallery/delete':
   with connect() as c:c.execute('DELETE FROM gallery WHERE id=?',(d['id'],))
   return self.reply({})
  if path=='/api/docx':return self.reply({'paragraphs':docx(raw)})
  if path=='/api/upload':
   kind=self.headers.get('Content-Type','').split(';')[0]; ext={'video/mp4':'.mp4','video/webm':'.webm','video/quicktime':'.mov'}.get(kind)
   if not ext or not raw:raise ValueError()
   name=secrets.token_hex(16)+ext; (DATA/'uploads').mkdir(exist_ok=True); (DATA/'uploads'/name).write_bytes(raw)
   return self.reply({'url':'/uploads/'+name})
  if path=='/api/user':
   if d['id']==u['id']:return self.reply({'error':'Kendi yönetici hesabınızı değiştiremezsiniz.'},400)
   with connect() as c:
    r=c.execute('SELECT data FROM users WHERE id=?',(d['id'],)).fetchone()
    if not r:raise ValueError()
    target=json.loads(r[0])
    if d['action']=='delete':c.execute('DELETE FROM users WHERE id=?',(d['id'],))
    else:
     if d['action'] in ('make-admin','make-member'):
      if target.get('status')!='approved':return self.reply({'error':'Yalnızca onaylı üyelere yönetici yetkisi verilebilir.'},400)
      target['role']='admin' if d['action']=='make-admin' else 'member';c.execute('UPDATE users SET data=? WHERE id=?',(json.dumps(target),d['id']))
      return self.reply({})
     if d['action'] not in ('approved','rejected','suspended'):raise ValueError()
     if d['action']=='approved' and not target.get('username'):
      username=d.get('username','').strip().lower();pw=d.get('password','')
      if not re.fullmatch(r'[a-z0-9_.-]{3,32}',username) or len(pw)<10 or len(pw)>256:return self.reply({'error':'Kullanıcı adı 3–32, şifre en az 10 karakter olmalı.'},400)
      target['username']=username;target['status']='approved'
      try:c.execute('UPDATE users SET data=?,username=?,password=? WHERE id=?',(json.dumps(target),username,digest(pw),d['id']))
      except sqlite3.IntegrityError:return self.reply({'error':'Bu kullanıcı adı zaten kullanılıyor.'},409)
     else:
      target['status']=d['action'];c.execute('UPDATE users SET data=? WHERE id=?',(json.dumps(target),d['id']))
   return self.reply({})
  if path=='/api/content':
   with connect() as c:
    c.execute('BEGIN IMMEDIATE'); content=json.loads(c.execute('SELECT data FROM content WHERE id=1').fetchone()[0]); group=d['group']
    if group=='liveStream':
     content[group].update({k:v for k,v in d['data'].items() if k in ('title','description','isLive','scheduledDate','scheduledTime','streamEmbedUrl')})
     if not content[group].get('isLive'):c.execute('DELETE FROM live_viewers')
    elif group in ('conversations','videos'):
     if group=='videos' and d['action']=='reorder':
      ids=d.get('data')
      current={x['id']:x for x in content['videos']}
      if not isinstance(ids,list) or len(ids)!=len(current) or set(ids)!=set(current):raise ValueError()
      content['videos']=[dict(current[identifier],order=index+1) for index,identifier in enumerate(ids)]
     elif d['action']=='delete':content[group]=[x for x in content[group] if x['id']!=d['id']]
     else:
      item=d['data']; item['id']=d.get('id') or secrets.token_hex(12)
      if group=='videos' and (not item.get('assignedConversationIds') or any(i not in [v['id'] for v in content['conversations']] for i in item['assignedConversationIds'])):raise ValueError()
      if group=='conversations':item['order']=item.get('order',len(content[group])+1)
      else:
       previous=next((x for x in content['videos'] if x['id']==item['id']),None)
       item['order']=item.get('order') or (previous or {}).get('order') or len(content['videos'])+1
       item['createdAt']=item.get('createdAt') or (previous or {}).get('createdAt') or time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime())
      content[group]=[x for x in content[group] if x['id']!=item['id']]+[item]
     if group=='conversations' and d['action']=='delete':
      for v in content['videos']:v['assignedConversationIds']=[i for i in v['assignedConversationIds'] if i!=d['id']]
    else:raise ValueError()
    c.execute('UPDATE content SET data=? WHERE id=1',(json.dumps(content),))
   return self.reply(content)
  self.reply({'error':'Bulunamadı.'},404)
if __name__=='__main__':
 init(); host=os.getenv('HOST','0.0.0.0'); port=int(os.getenv('PORT','4173')); print(f'Beykoz Sohbetleri: http://{host}:{port}',flush=True);ThreadingHTTPServer((host,port),Handler).serve_forever()
