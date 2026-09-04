export async function api(path: string, data?: unknown) {
 const response = await fetch('/api/'+path, data === undefined ? {} : {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
 const value = await response.json();
 if (!response.ok) throw new Error(value.error || 'İşlem tamamlanamadı.');
 return value;
}
export async function upload(path: string, file: File) {
 const r=await fetch('/api/'+path,{method:'POST',headers:{'Content-Type':file.type || 'application/octet-stream','X-File-Name':encodeURIComponent(file.name)},body:file});
 const d=await r.json();if(!r.ok)throw new Error(d.error);return d;
}
