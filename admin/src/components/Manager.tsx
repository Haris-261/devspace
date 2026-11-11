'use client';import {FormEvent,useEffect as reactUseEffect,useState} from 'react';import {api,API} from '@/lib/api';import {Check,Edit3,Eye,EyeOff,Plus,Star,Trash2,X} from 'lucide-react';
const useEffect=(effect:()=>unknown,deps:unknown[])=>reactUseEffect(()=>{effect()},deps);
type Field={key:string;label:string;type?:string;required?:boolean};type Config={title:string;path:string;fields:Field[]};
const configs:Record<string,Config>={projects:{title:'Projects Management',path:'/admin/projects',fields:[{key:'title',label:'Project title',required:true},{key:'description',label:'Description',type:'textarea',required:true},{key:'imageUrl',label:'Thumbnail URL'},{key:'technologies',label:'Technologies (comma separated)'},{key:'liveUrl',label:'Live URL',type:'url',required:true},{key:'featured',label:'Featured',type:'checkbox'},{key:'published',label:'Published',type:'checkbox'},{key:'displayOrder',label:'Display order',type:'number'}]},experience:{title:'Work Experience',path:'/experience',fields:[{key:'company',label:'Company / organization',required:true},{key:'role',label:'Role title',required:true},{key:'startDate',label:'Start date',type:'date',required:true},{key:'endDate',label:'End date',type:'date'},{key:'current',label:'Current position',type:'checkbox'},{key:'description',label:'Description',type:'textarea',required:true},{key:'highlights',label:'Highlights (comma separated)'},{key:'technologies',label:'Technologies (comma separated)'},{key:'displayOrder',label:'Display order',type:'number'}]},skills:{title:'Skills Management',path:'/skills',fields:[{key:'name',label:'Skill name',required:true},{key:'category',label:'Category',required:true},{key:'icon',label:'Icon key'},{key:'displayOrder',label:'Display order',type:'number'}]},'social-links':{title:'Social Links',path:'/admin/social-links',fields:[{key:'label',label:'Label',required:true},{key:'url',label:'URL or mailto',required:true},{key:'icon',label:'Icon (github, linkedin, mail)',required:true},{key:'enabled',label:'Enabled',type:'checkbox'},{key:'displayOrder',label:'Display order',type:'number'}]}};
const blank=(c:Config)=>Object.fromEntries(c.fields.map(f=>[f.key,f.type==='checkbox'?false:f.type==='number'?0:'']));
export default function Manager({section}:{section:string}){if(section==='dashboard')return <Dashboard/>;if(section==='profile')return <Profile/>;if(section==='messages')return <Messages/>;if(section==='settings')return <Settings/>;if(section==='testimonials')return <Testimonials/>;return <Crud config={configs[section]}/>}
function Crud({config}:{config:Config}){const [items,setItems]=useState<any[]>([]),[editing,setEditing]=useState<any|null>(null),[notice,setNotice]=useState(''),[loading,setLoading]=useState(true);async function load(){setLoading(true);try{setItems(await api(config.path))}catch(e:any){setNotice(e.message)}finally{setLoading(false)}}useEffect(()=>{load()},[config.path]);async function save(e:FormEvent){e.preventDefault();const payload={...editing};config.fields.filter(f=>['technologies','highlights'].includes(f.key)).forEach(f=>payload[f.key]=typeof payload[f.key]==='string'?payload[f.key].split(',').map((x:string)=>x.trim()).filter(Boolean):payload[f.key]);['startDate','endDate'].forEach(k=>{if(payload[k]&&!String(payload[k]).includes('T'))payload[k]=new Date(`${payload[k]}T00:00:00`).toISOString()});const id=payload._id;delete payload._id;try{await api(id?`${config.path}/${id}`:config.path,{method:id?'PATCH':'POST',body:JSON.stringify(payload)});setEditing(null);setNotice('Saved successfully');load()}catch(e:any){setNotice(e.message)}}async function remove(x:any){if(!confirm(`Delete “${x.title||x.name||x.company||x.label}”? This cannot be undone.`))return;await api(`${config.path}/${x._id}`,{method:'DELETE'});setNotice('Deleted');load()}return <main className="content"><Title title={config.title} action={<button onClick={()=>setEditing(blank(config))}><Plus size={17}/>Add new</button>}/>{notice&&<Notice text={notice}/>}<div className="panel table-wrap">{loading?<p>Loading…</p>:items.length?<table><thead><tr><th>Name</th><th>Category / status</th><th>Order</th><th/></tr></thead><tbody>{items.map(x=><tr key={x._id}><td><strong>{x.title||x.name||x.company||x.label}</strong><small>{x.role||x.description||x.url}</small></td><td>{x.published===false||x.enabled===false?<span className="badge muted"><EyeOff/>Hidden</span>:<span className="badge"><Eye/>Active</span>} {x.category}</td><td>{x.displayOrder??0}</td><td className="row-actions"><button onClick={()=>setEditing({...x,technologies:x.technologies?.join(', '),highlights:x.highlights?.join(', '),startDate:x.startDate?.slice(0,10),endDate:x.endDate?.slice(0,10)})}><Edit3/></button><button className="danger" onClick={()=>remove(x)}><Trash2/></button></td></tr>)}</tbody></table>:<div className="empty"><h3>No entries yet</h3><p>Create the first record to make it appear on the portfolio.</p></div>}</div>{editing&&<div className="modal"><form className="editor" onSubmit={save}><div className="editor-head"><h2>{editing._id?'Edit':'Create'} entry</h2><button type="button" onClick={()=>setEditing(null)}><X/></button></div><div className="field-grid">{config.fields.map(f=><FieldInput key={f.key} field={f} value={editing[f.key]} onChange={v=>setEditing({...editing,[f.key]:v})}/>)}</div><button className="save" type="submit"><Check/>Save changes</button></form></div>}</main>}
function FieldInput({field,value,onChange}:{field:Field;value:any;onChange:(v:any)=>void}){const [uploading,setUploading]=useState(false);if(field.type==='checkbox')return <label className="check"><input type="checkbox" checked={!!value} onChange={e=>onChange(e.target.checked)}/><span>{field.label}</span></label>;if(field.type==='textarea')return <label className="wide">{field.label}<textarea required={field.required} rows={5} value={value||''} onChange={e=>onChange(e.target.value)}/></label>;if(field.key==='imageUrl')return <label>{field.label}<input value={value||''} placeholder="https://…" onChange={e=>onChange(e.target.value)}/><input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={uploading} onChange={async e=>{const file=e.target.files?.[0];if(!file)return;setUploading(true);const form=new FormData();form.append('image',file);const r=await fetch(`${API}/upload/image`,{method:'POST',credentials:'include',body:form});const d=await r.json();setUploading(false);if(!r.ok)return alert(d.message||'Upload failed');onChange(d.url)}}/>{uploading&&<small>Uploading…</small>}</label>;return <label>{field.label}<input required={field.required} type={field.type||'text'} value={value??''} onChange={e=>onChange(field.type==='number'?Number(e.target.value):e.target.value)}/></label>}
function Dashboard(){const [data,setData]=useState<any>({projects:[],experience:[],skills:[],messages:[]});useEffect(()=>{Promise.all([api('/admin/projects'),api('/experience'),api('/skills'),api('/contact')]).then(([projects,experience,skills,messages])=>setData({projects,experience,skills,messages}))},[]);const cards=[['Total projects',data.projects.length],['Published',data.projects.filter((x:any)=>x.published).length],['Experience entries',data.experience.length],['Total skills',data.skills.length],['Contact messages',data.messages.length]];return <main className="content"><Title title="Dashboard Overview"/><div className="overview">{cards.map(([l,v],i)=><article key={String(l)}><span>0{i+1}</span><strong>{v}</strong><p>{l}</p></article>)}</div><div className="panel intro"><p>PORTFOLIO STATUS</p><h2>Your content system is connected.</h2><p>Manage public content from the sidebar. Saved changes are persisted in MongoDB and read by the public portfolio API.</p></div></main>}
function Toast({message,type,onClose}:{message:string;type?:'success'|'error';onClose:()=>void}){reactUseEffect(()=>{const t=setTimeout(onClose,3500);return()=>clearTimeout(t);},[onClose]);const isError=type==='error';return <div style={{position:'fixed',bottom:24,right:24,display:'flex',alignItems:'center',gap:10,background:isError?'#2c0b0e':'#140c1d',color:isError?'#fca5a5':'#c084fc',border:`1px solid ${isError?'#ef4444':'#a855f7'}`,borderRadius:10,padding:'12px 18px',fontSize:13,fontWeight:600,boxShadow:'0 10px 30px rgba(0,0,0,0.6)',zIndex:99999}}><Check size={16} style={{color:isError?'#ef4444':'#22c55e'}}/><span>{message}</span><button type="button" onClick={onClose} style={{background:'transparent',border:'none',color:'inherit',cursor:'pointer',padding:2,marginLeft:8,opacity:0.7}}><X size={14}/></button></div>}
const DEFAULT_LW=['Plan','Design','Develop','Innovate'];function Profile(){const [p,setP]=useState<any>(null),[toast,setToast]=useState<{message:string;type?:'success'|'error'}|null>(null),[saving,setSaving]=useState(false);useEffect(()=>{api('/profile').then(x=>setP({...x,heroHeadlines:Array.isArray(x.heroHeadlines)?x.heroHeadlines.join(', '):(x.heroHeadlines||''),stats:JSON.stringify(x.stats||[],null,2),loaderWords:x.loaderWords?.length?x.loaderWords:[...DEFAULT_LW],loaderSubtitle:x.loaderSubtitle||'PERSONAL PORTFOLIO'})).catch(()=>setP({fullName:'Muhammad Haris',heroIntro:'WELCOME TO MY DEVELOPER PORTFOLIO',heroHeadlines:'SOFTWARE ENGINEER, FULL STACK DEVELOPER, AI DEVELOPER',contactEmail:'haris200408@gmail.com',about:'',stats:'[]',loaderWords:[...DEFAULT_LW],loaderSubtitle:'PERSONAL PORTFOLIO'}))},[]);async function save(e:FormEvent){e.preventDefault();setSaving(true);try{let statsData=[];try{statsData=typeof p.stats==='string'?JSON.parse(p.stats):(p.stats||[])}catch{setToast({message:'Invalid JSON format in Statistics field',type:'error'});setSaving(false);return;}const headlines=typeof p.heroHeadlines==='string'?p.heroHeadlines.split(',').map((x:string)=>x.trim()).filter(Boolean):(Array.isArray(p.heroHeadlines)?p.heroHeadlines:[]);const cleanedWords=(p.loaderWords||DEFAULT_LW).map((w:string)=>(typeof w==='string'?w.trim():'')).filter(Boolean);const body={fullName:p.fullName||'',heroIntro:p.heroIntro||'',heroHeadlines:headlines,contactEmail:p.contactEmail||'',about:p.about||'',stats:statsData,loaderWords:cleanedWords.length?cleanedWords:DEFAULT_LW,loaderSubtitle:(p.loaderSubtitle||'PERSONAL PORTFOLIO').trim().toUpperCase()};const updated=await api('/profile',{method:'PATCH',body:JSON.stringify(body)});if(updated){setP({...updated,heroHeadlines:Array.isArray(updated.heroHeadlines)?updated.heroHeadlines.join(', '):'',stats:JSON.stringify(updated.stats||[],null,2),loaderWords:updated.loaderWords?.length?updated.loaderWords:[...DEFAULT_LW],loaderSubtitle:updated.loaderSubtitle||'PERSONAL PORTFOLIO'})}setToast({message:'Profile updated',type:'success'});}catch(err:any){setToast({message:err.message||'Failed to update profile',type:'error'})}finally{setSaving(false)}}const lw:string[]=p?.loaderWords||DEFAULT_LW;function setWord(i:number,v:string){const a=[...lw];a[i]=v;setP({...p,loaderWords:a})}function removeWord(i:number){setP({...p,loaderWords:lw.filter((_:string,j:number)=>j!==i)})}function moveWord(i:number,dir:-1|1){if(i+dir<0||i+dir>=lw.length)return;const a=[...lw];[a[i],a[i+dir]]=[a[i+dir],a[i]];setP({...p,loaderWords:a})}return <main className="content"><Title title="About Me / Profile"/>{toast&&<Toast message={toast.message} type={toast.type} onClose={()=>setToast(null)}/>}{p&&<form className="panel profile-form" onSubmit={save}><FieldInput field={{key:'fullName',label:'Full name'}} value={p.fullName} onChange={v=>setP({...p,fullName:v})}/><FieldInput field={{key:'heroIntro',label:'Hero intro'}} value={p.heroIntro} onChange={v=>setP({...p,heroIntro:v})}/><FieldInput field={{key:'heroHeadlines',label:'Rotating headlines (comma separated)'}} value={p.heroHeadlines} onChange={v=>setP({...p,heroHeadlines:v})}/><FieldInput field={{key:'loaderSubtitle',label:'Loader subtitle (shown below name in boot screen, e.g. PERSONAL PORTFOLIO)'}} value={p.loaderSubtitle} onChange={v=>setP({...p,loaderSubtitle:v})}/><FieldInput field={{key:'contactEmail',label:'Contact email',type:'email'}} value={p.contactEmail} onChange={v=>setP({...p,contactEmail:v})}/><FieldInput field={{key:'about',label:'About content',type:'textarea'}} value={p.about} onChange={v=>setP({...p,about:v})}/><FieldInput field={{key:'stats',label:'Statistics (JSON)',type:'textarea'}} value={p.stats} onChange={v=>setP({...p,stats:v})}/><div className="wide" style={{display:'flex',flexDirection:'column',gap:8}}><label style={{fontWeight:600,fontSize:10,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:2}}>Loader words<small style={{fontWeight:400,textTransform:'none',letterSpacing:'normal',marginLeft:8,opacity:0.6}}>Shown one-by-one while the site loads. Max 6, 20 chars each. Dot added automatically.</small></label>{lw.map((w:string,i:number)=><div key={i} style={{display:'flex',gap:6,alignItems:'center'}}><input style={{flex:1}} maxLength={20} value={w} onChange={e=>setWord(i,e.target.value)} placeholder={`Word ${i+1}`}/><button type="button" onClick={()=>moveWord(i,-1)} disabled={i===0} style={{padding:'4px 8px'}}>↑</button><button type="button" onClick={()=>moveWord(i,1)} disabled={i===lw.length-1} style={{padding:'4px 8px'}}>↓</button><button type="button" className="danger" onClick={()=>removeWord(i)} style={{padding:'4px 8px'}}><X size={14}/></button></div>)}{lw.length<6&&<button type="button" onClick={()=>setP({...p,loaderWords:[...lw,'']})}>+ Add word</button>}<button type="button" onClick={()=>setP({...p,loaderWords:[...DEFAULT_LW]})}>Reset to default</button><div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:4}}>{lw.map((w:string,i:number)=><span key={i} style={{fontSize:11,letterSpacing:'0.15em',color:'#a855f7',textTransform:'uppercase'}}>{w||'…'}.</span>)}</div></div><button className="save" disabled={saving}>{saving?'Saving…':'Save profile'}</button></form>}</main>}
function Messages(){const [items,setItems]=useState<any[]>([]);const load=()=>api('/contact').then(setItems);useEffect(load,[]);return <main className="content"><Title title="Contact Messages"/><div className="cards">{items.map(x=><article className="panel message" key={x._id}><div><strong>{x.subject}</strong><span>{x.name} · {x.email}</span></div><p>{x.message}</p><div><button onClick={async()=>{await api(`/contact/${x._id}`,{method:'PATCH',body:JSON.stringify({read:!x.read})});load()}}>{x.read?'Mark unread':'Mark read'}</button><button className="danger" onClick={async()=>{if(confirm('Delete this message?')){await api(`/contact/${x._id}`,{method:'DELETE'});load()}}}>Delete</button></div></article>)}</div></main>}
function Settings(){const [form,setForm]=useState({currentPassword:'',newPassword:'',confirm:''}),[notice,setNotice]=useState('');async function save(e:FormEvent){e.preventDefault();if(form.newPassword!==form.confirm)return setNotice('New passwords do not match');try{await api('/auth/change-password',{method:'PATCH',body:JSON.stringify({currentPassword:form.currentPassword,newPassword:form.newPassword})});setNotice('Password changed successfully');setForm({currentPassword:'',newPassword:'',confirm:''})}catch(e:any){setNotice(e.message)}}return <main className="content"><Title title="Account Settings"/>{notice&&<Notice text={notice}/>}<form className="panel settings" onSubmit={save}><h2>Change password</h2><p>Use at least 10 characters with uppercase, lowercase, and a number.</p><label>Current password<input type="password" required value={form.currentPassword} onChange={e=>setForm({...form,currentPassword:e.target.value})}/></label><label>New password<input type="password" minLength={10} required value={form.newPassword} onChange={e=>setForm({...form,newPassword:e.target.value})}/></label><label>Confirm new password<input type="password" minLength={10} required value={form.confirm} onChange={e=>setForm({...form,confirm:e.target.value})}/></label><button className="save">Update password</button></form></main>}
function Title({title,action}:{title:string;action?:React.ReactNode}){return <div className="title"><div><p>MANAGE CONTENT</p><h1>{title}</h1></div>{action}</div>}function Notice({text}:{text:string}){return <p className="notice">{text}</p>}


const blankTestimonial={name:'',role:'',company:'',message:'',rating:5,avatarUrl:'',avatarPublicId:'',isPublished:true,order:0};
function getInitials(name:string){if(!name)return '?';const words=name.trim().split(/\s+/).filter(Boolean);if(words.length===0)return '?';const cleanWord=(w:string)=>w.replace(/[^\p{L}\p{N}]/gu,'');const firstClean=cleanWord(words[0]);const lastClean=cleanWord(words[words.length-1]);if(!firstClean&&!lastClean)return '?';if(words.length===1||!lastClean){return (firstClean[0]||'?').toUpperCase();}return (firstClean[0]+lastClean[0]).toUpperCase();}
function Testimonials(){
  const [items,setItems]=useState<any[]>([]),
        [editing,setEditing]=useState<any|null>(null),
        [notice,setNotice]=useState(''),
        [loading,setLoading]=useState(true),
        [saving,setSaving]=useState(false),
        [uploading,setUploading]=useState(false),
        [errors,setErrors]=useState<{name?:string;message?:string}>({});

  async function load(){
    setLoading(true);
    try{setItems(await api('/admin/testimonials'))}
    catch(e:any){setNotice(e.message||'Failed to load testimonials')}
    finally{setLoading(false)}
  }
  useEffect(()=>{load()},[]);

  async function save(e:FormEvent){
    e.preventDefault();
    const newErrors:{name?:string;message?:string}={};
    if(!editing.name||!editing.name.trim()){
      newErrors.name='Full name is required (max 80 chars)';
    }else if(editing.name.trim().length>80){
      newErrors.name='Full name cannot exceed 80 characters';
    }
    if(!editing.message||!editing.message.trim()){
      newErrors.message='Testimonial message is required (max 500 chars)';
    }else if(editing.message.trim().length>500){
      newErrors.message='Testimonial message cannot exceed 500 characters';
    }
    if(Object.keys(newErrors).length>0){setErrors(newErrors);return;}
    setErrors({});
    setSaving(true);
    const payload={
      name:editing.name.trim(),
      role:editing.role?editing.role.trim():'',
      company:editing.company?editing.company.trim():'',
      message:editing.message.trim(),
      rating:Math.max(1,Math.min(5,Number(editing.rating)||5)),
      avatarUrl:editing.avatarUrl?editing.avatarUrl.trim():'',
      avatarPublicId:editing.avatarPublicId?editing.avatarPublicId.trim():'',
      isPublished:editing.isPublished!==false,
      order:Number(editing.order)||0
    };
    const id=editing._id;
    try{
      await api(id?`/admin/testimonials/${id}`:'/admin/testimonials',{method:id?'PATCH':'POST',body:JSON.stringify(payload)});
      setEditing(null);
      setNotice(id?'Testimonial updated successfully':'Testimonial created successfully');
      load();
    }catch(err:any){
      setNotice(err.message||'Failed to save testimonial');
    }finally{
      setSaving(false);
    }
  }

  async function togglePublish(x:any){
    try{
      await api(`/admin/testimonials/${x._id}/toggle-publish`,{method:'PATCH'});
      setNotice(`Testimonial by “${x.name}” is now ${x.isPublished?'hidden':'published'}`);
      load();
    }catch(err:any){
      setNotice(err.message||'Failed to toggle published state');
    }
  }

  async function remove(x:any){
    if(!confirm(`Delete testimonial from “${x.name}”? This cannot be undone.`))return;
    try{
      await api(`/admin/testimonials/${x._id}`,{method:'DELETE'});
      setNotice('Deleted successfully');
      load();
    }catch(err:any){
      setNotice(err.message||'Failed to delete');
    }
  }

  async function handleAvatarUpload(file:File){
    if(!/^image\/(jpeg|png|webp)$/.test(file.type)){
      setNotice('Only JPG, PNG, or WebP images are allowed');
      return;
    }
    if(file.size>2*1024*1024){
      setNotice('Avatar image must be under 2 MB');
      return;
    }
    setUploading(true);
    try{
      const form=new FormData();
      form.append('image',file);
      const r=await fetch(`${API}/upload/avatar`,{method:'POST',credentials:'include',body:form});
      const d=await r.json();
      if(!r.ok)throw new Error(d.message||'Upload failed');
      setEditing({...editing,avatarUrl:d.url,avatarPublicId:d.publicId||''});
      setNotice('Avatar uploaded successfully');
    }catch(err:any){
      setNotice(err.message||'Upload failed');
    }finally{
      setUploading(false);
    }
  }

  return (
    <main className="content">
      <Title title="Testimonials & Client Reviews" action={<button type="button" onClick={()=>{setErrors({});setEditing({...blankTestimonial});}}><Plus size={17}/>Add testimonial</button>}/>
      {notice&&<Notice text={notice}/>}
      <div className="panel table-wrap">
        {loading?<p>Loading…</p>:items.length?<table><thead><tr><th>Client</th><th>Rating</th><th>Status</th><th>Order</th><th/></tr></thead>
        <tbody>
          {items.map(x=>(
            <tr key={x._id}>
              <td>
                <div style={{display:'flex',alignItems:'center',gap:12}}>
                  {x.avatarUrl?(
                    <img src={x.avatarUrl} alt={x.name} style={{width:38,height:38,borderRadius:'50%',objectFit:'cover',flexShrink:0,border:'1px solid #3d3045'}}/>
                  ):(
                    <div style={{width:38,height:38,borderRadius:'50%',background:'#231535',border:'1px solid #7c3aed',color:'#c084fc',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,flexShrink:0}}>
                      {getInitials(x.name)}
                    </div>
                  )}
                  <div>
                    <strong>{x.name}</strong>
                    <small>{[x.role,x.company].filter(Boolean).join(' at ')||'Client'}</small>
                  </div>
                </div>
              </td>
              <td>
                <div style={{display:'flex',gap:2}} aria-label={`${x.rating??5} stars`}>
                  {[1,2,3,4,5].map(s=>(
                    <Star key={s} size={14} fill={s<=(x.rating??5)?'#eab308':'none'} color={s<=(x.rating??5)?'#eab308':'#52525b'}/>
                  ))}
                </div>
              </td>
              <td>
                <button type="button" onClick={()=>togglePublish(x)} className={`badge ${x.isPublished===false?'muted':''}`} style={{cursor:'pointer',background:'none',border:'none',font:'inherit',padding:0}} title="Click to toggle published status">
                  {x.isPublished===false?<><EyeOff size={13}/>Hidden</>:<><Eye size={13}/>Published</>}
                </button>
              </td>
              <td>{x.order??0}</td>
              <td className="row-actions">
                <button type="button" onClick={()=>{setErrors({});setEditing({...x});}} title="Edit"><Edit3/></button>
                <button type="button" className="danger" onClick={()=>remove(x)} title="Delete"><Trash2/></button>
              </td>
            </tr>
          ))}
        </tbody></table>:(
          <div className="empty">
            <h3>No testimonials yet</h3>
            <p>Add client feedback to showcase recommendations on your portfolio.</p>
            <button type="button" onClick={()=>{setErrors({});setEditing({...blankTestimonial});}} style={{marginTop:12,minHeight:44,display:'inline-flex',alignItems:'center',gap:6}}>
              <Plus size={16}/>Add testimonial
            </button>
          </div>
        )}
      </div>

      {editing&&(
        <div className="modal">
          <form className="editor" onSubmit={save}>
            <div className="editor-head">
              <h2>{editing._id?'Edit':'Create'} testimonial</h2>
              <button type="button" onClick={()=>setEditing(null)}><X/></button>
            </div>
            <div className="field-grid">
              <label>
                Full name *
                <input required maxLength={80} value={editing.name||''} onChange={e=>{setEditing({...editing,name:e.target.value});if(errors.name)setErrors({...errors,name:undefined});}} placeholder="e.g. Sarah Jenkins"/>
                {errors.name&&<small style={{color:'#ef4444',textTransform:'none'}}>{errors.name}</small>}
              </label>

              <label>
                Role title
                <input maxLength={80} value={editing.role||''} onChange={e=>setEditing({...editing,role:e.target.value})} placeholder="e.g. Senior VP of Engineering"/>
              </label>

              <label>
                Company / Organization
                <input maxLength={80} value={editing.company||''} onChange={e=>setEditing({...editing,company:e.target.value})} placeholder="e.g. TechCorp"/>
              </label>

              <div>
                <label style={{display:'block',marginBottom:6}}>Rating (1-5 stars)</label>
                <div role="radiogroup" aria-label="Rating" style={{display:'flex',alignItems:'center',gap:4,minHeight:44}}>
                  {[1,2,3,4,5].map(star=>{
                    const active=(editing.rating||5)>=star;
                    const isSelected=(editing.rating||5)===star;
                    return (
                      <button key={star} type="button" role="radio" aria-checked={isSelected} aria-label={`${star} star${star>1?'s':''}`} tabIndex={0} onClick={()=>setEditing({...editing,rating:star})} onKeyDown={e=>{if(e.key==='ArrowRight'||e.key==='ArrowUp'){e.preventDefault();setEditing({...editing,rating:Math.min(5,(editing.rating||5)+1)});}else if(e.key==='ArrowLeft'||e.key==='ArrowDown'){e.preventDefault();setEditing({...editing,rating:Math.max(1,(editing.rating||5)-1)});}}} style={{background:'none',border:'none',padding:6,cursor:'pointer',minWidth:44,minHeight:44,display:'inline-flex',alignItems:'center',justifyContent:'center'}}>
                        <Star size={24} fill={active?'#eab308':'none'} color={active?'#eab308':'#71717a'}/>
                      </button>
                    );
                  })}
                  <span style={{fontSize:12,color:'#aaa',marginLeft:8}}>{editing.rating||5} of 5</span>
                </div>
              </div>

              <label className="wide">
                Avatar image (optional, JPG/PNG/WebP under 2 MB)
                <div style={{display:'flex',gap:16,alignItems:'center',flexWrap:'wrap',marginTop:8}}>
                  {editing.avatarUrl?(
                    <div style={{display:'flex',alignItems:'center',gap:12}}>
                      <img src={editing.avatarUrl} alt="Preview" style={{width:64,height:64,borderRadius:'50%',objectFit:'cover',border:'1px solid rgba(168,85,247,0.45)'}}/>
                      <button type="button" className="danger" onClick={()=>setEditing({...editing,avatarUrl:'',avatarPublicId:''})} style={{minHeight:44,padding:'0 14px'}}>
                        Remove avatar
                      </button>
                    </div>
                  ):(
                    <div style={{display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
                      <div
                        style={{
                          width:64,
                          height:64,
                          borderRadius:'50%',
                          background:'rgba(168,85,247,0.2)',
                          border:'1px solid rgba(192,132,252,0.5)',
                          color:'#f3e8ff',
                          fontSize:20,
                          fontWeight:600,
                          letterSpacing:'0.02em',
                          display:'flex',
                          alignItems:'center',
                          justifyContent:'center',
                          userSelect:'none',
                          flexShrink:0
                        }}
                        title="Initials live preview"
                      >
                        {getInitials(editing.name||'')}
                      </div>
                      <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} onChange={e=>{const file=e.target.files?.[0];if(file)handleAvatarUpload(file);}} style={{minHeight:44}}/>
                    </div>
                  )}
                  {uploading&&<small style={{color:'#a855f7',textTransform:'none'}}>Uploading avatar…</small>}
                </div>
              </label>

              <label className="wide">
                Testimonial message *
                <textarea required rows={4} maxLength={500} value={editing.message||''} onChange={e=>{setEditing({...editing,message:e.target.value});if(errors.message)setErrors({...errors,message:undefined});}} placeholder="What did the client say about your work?" style={{minHeight:110}}/>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:4}}>
                  {errors.message?<small style={{color:'#ef4444',textTransform:'none'}}>{errors.message}</small>:<span/>}
                  <small style={{color:(editing.message?.length||0)>480?'#ef4444':'#888',textTransform:'none',letterSpacing:'normal'}}>{editing.message?.length||0} / 500</small>
                </div>
              </label>

              <label className="check" style={{minHeight:44}}>
                <input type="checkbox" checked={editing.isPublished!==false} onChange={e=>setEditing({...editing,isPublished:e.target.checked})}/>
                <span>Published on portfolio</span>
              </label>

              <label>
                Display order
                <input type="number" value={editing.order??0} onChange={e=>setEditing({...editing,order:Number(e.target.value)})}/>
                <small style={{color:'#777',textTransform:'none',letterSpacing:'normal'}}>Lower numbers appear first</small>
              </label>
            </div>
            <button className="save" type="submit" disabled={saving||uploading} style={{minHeight:44}}>
              <Check/>{saving?'Saving…':'Save testimonial'}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
