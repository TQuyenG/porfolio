import React, { useEffect, useState } from 'react';
import '../styles/pages.css';
import { FiLock, FiImage, FiEdit, FiLogOut, FiSave } from 'react-icons/fi';
import { getPrivateContent, upsertPrivateContent, getPageContent, upsertPageContent, uploadFileToStorage, insertAssetRecord, insertDocumentRecord, supabase } from '../utils/supabaseClient';
import { getAssets, deleteAsset, getDocuments, deleteDocument } from '../utils/supabaseClient';
import ConfirmModal from '../components/ConfirmModal';

function Private() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || '';
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [gallery, setGallery] = useState([]);
  

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session;
      if (session && session.user) {
        setUser(session.user);
        setIsAuthenticated(ADMIN_EMAIL ? (session.user.email === ADMIN_EMAIL) : true);
      }
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setIsAuthenticated(ADMIN_EMAIL ? (session.user.email === ADMIN_EMAIL) : true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      setLoading(true);
      const data = await getPrivateContent(1);
      if (data) {
        setNotes(data.notes || '');
        try {
          setGallery(Array.isArray(data.gallery) ? data.gallery : (data.gallery ? JSON.parse(data.gallery) : []));
        } catch (e) {
          setGallery([]);
        }
      }
      setLoading(false);
    };
    load();
  }, [isAuthenticated]);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const resp = await supabase.auth.signInWithPassword({ email, password });
      if (resp.error) {
        alert('Đăng nhập thất bại: ' + resp.error.message);
        return;
      }
      const u = resp.data?.user;
      setUser(u || null);
      setIsAuthenticated(ADMIN_EMAIL ? (u?.email === ADMIN_EMAIL) : true);
    } catch (err) {
      alert('Đăng nhập lỗi');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    const content = { notes, gallery: JSON.stringify(gallery) };
    const { error } = await upsertPrivateContent(content, 1);
    setLoading(false);
    if (error) alert('Lưu thất bại'); else alert('Lưu thành công');
  };

  const addGalleryItem = () => setGallery((g) => [...g, { title: '', src: '' }]);
  const updateGalleryItem = (i, key, value) => setGallery((g) => g.map((it, idx) => idx === i ? { ...it, [key]: value } : it));
  const removeGalleryItem = (i) => setGallery((g) => g.filter((_, idx) => idx !== i));

  if (!isAuthenticated) {
    return (
      <section className="page private-page">
        <div className="login-container">
          <h1><FiLock /> Admin Login</h1>
          <p>Đăng nhập bằng Supabase Auth để truy cập khu vực quản trị.</p>
          <form onSubmit={handleLogin} className="login-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="password-input"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="password-input"
            />
            <button type="submit" className="btn btn-primary">Sign in</button>
          </form>
          <div style={{marginTop:8, display:'flex', gap:8}}>
            <button className="btn btn-secondary" onClick={async ()=>{
              // OAuth sign in (Google)
              try {
                await supabase.auth.signInWithOAuth({ provider: 'google' });
              } catch(e){ alert('OAuth error: ' + e.message); }
            }}>Sign in with Google</button>
          </div>
          {ADMIN_EMAIL ? <p className="hint">Yêu cầu email admin: {ADMIN_EMAIL}</p> : <p className="hint">Không có email admin cấu hình — mọi user đăng nhập đều được phép.</p>}
        </div>
      </section>
    );
  }

  return (
    <section className="page private-page">
      <div className="page-header">
        <h1><FiEdit /> Admin Dashboard</h1>
        <p className="subtitle">Trang quản trị — chỉnh sửa nội dung portfolio</p>
      </div>

      <div className="private-content grid">
        <section className="private-section">
          <h2><FiEdit /> Ghi Chú Cá Nhân</h2>
          <p className="note">Ghi chú giới thiệu, tóm tắt hồ sơ, câu chuyện nghề nghiệp.</p>
          <textarea
            className="notes-area"
            placeholder="Ghi chú của bạn ở đây..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={8}
          />
        </section>

          <section className="private-section">
            <h2><FiEdit /> Chỉnh Sửa Nội Dung Các Trang</h2>
            <p className="note">Chỉnh sửa các trang công khai của portfolio từ đây. Mỗi trang có giao diện chỉnh sửa riêng (form hoặc JSON).</p>
            <PageEditor />
            <AdminAssets />
          </section>

        <section className="private-section">
          <h2><FiImage /> Ảnh & Bộ Sưu Tập</h2>
          <p className="note">Thêm link ảnh hoặc mô tả ngắn cho từng mục.</p>
          <div className="gallery">
            {gallery.map((item, i) => (
              <div key={i} className="gallery-item editable">
                <input
                  type="text"
                  placeholder="Tiêu đề"
                  value={item.title}
                  onChange={(e) => updateGalleryItem(i, 'title', e.target.value)}
                  className="input"
                />
                <input
                  type="text"
                  placeholder="URL ảnh hoặc mô tả"
                  value={item.src}
                  onChange={(e) => updateGalleryItem(i, 'src', e.target.value)}
                  className="input"
                />
                <button className="btn btn-danger" onClick={() => removeGalleryItem(i)}>Xóa</button>
              </div>
            ))}
            <div>
              <button className="btn btn-secondary" onClick={addGalleryItem}>Thêm mục</button>
            </div>
          </div>
        </section>

        <section className="private-section">
          <h2><FiLock /> Bảo Mật & Hành Động</h2>
          <div className="security-info">
            <p>Trang được bảo vệ bằng mật khẩu. Dữ liệu lưu trữ qua Supabase.</p>
            <div style={{display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap'}}>
              <button className="btn btn-primary" onClick={handleSave} disabled={loading}>
                <FiSave style={{verticalAlign:'middle', marginRight:6}}/> {loading ? 'Đang lưu...' : 'Lưu'}
              </button>
              <button className="btn btn-secondary" onClick={async () => { await supabase.auth.signOut(); setIsAuthenticated(false); setUser(null); }}>
                <FiLogOut style={{verticalAlign:'middle', marginRight:6}}/> Đăng Xuất
              </button>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}

export default Private;

function PageEditor() {
  const [pageKey, setPageKey] = useState('home');
  const [jsonText, setJsonText] = useState('');
  const [loadingPage, setLoadingPage] = useState(false);
  const [status, setStatus] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [lastUploaded, setLastUploaded] = useState(null);
  const [docFile, setDocFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [lastUploadedDoc, setLastUploadedDoc] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoadingPage(true);
      const content = await getPageContent(pageKey);
      setJsonText(content ? JSON.stringify(content, null, 2) : '');
      setLoadingPage(false);
    };
    load();
  }, [pageKey]);

  const handleSave = async () => {
    setStatus('Đang lưu...');
    try {
      if (pageKey === 'home') {
        // home form handled separately
        const parsed = jsonText ? JSON.parse(jsonText) : {};
        await upsertPageContent(pageKey, parsed);
      } else {
        const parsed = jsonText ? JSON.parse(jsonText) : {};
        await upsertPageContent(pageKey, parsed);
      }
      setStatus('Lưu thành công');
    } catch (e) {
      setStatus('Lỗi JSON: ' + e.message);
    }
    setTimeout(() => setStatus(''), 2500);
  };

  const handleFileChange = (e) => {
    const f = e.target.files && e.target.files[0];
    setFile(f || null);
  };

  const handleDocChange = (e) => {
    const f = e.target.files && e.target.files[0];
    setDocFile(f || null);
  };

  const handleUpload = async () => {
    if (!file) return setStatus('Chưa chọn file');
    setUploading(true);
    setStatus('Đang upload...');
    const res = await uploadFileToStorage(file, 'assets');
    if (res.error) {
      setStatus('Upload lỗi');
      setUploading(false);
      return;
    }
    const { url } = res;
    const rec = await insertAssetRecord(url, file.type, { name: file.name });
    if (rec.error) {
      setStatus('Lưu asset vào DB lỗi');
      setUploading(false);
      return;
    }
    setLastUploaded({ id: rec.data.id, url: rec.data.url, type: rec.data.type });
    setStatus('Upload thành công');
    setUploading(false);
  };

  const handleDocUpload = async () => {
    if (!docFile) return setStatus('Chưa chọn file PDF');
    setUploadingDoc(true);
    setStatus('Đang upload tài liệu...');
    const res = await uploadFileToStorage(docFile, 'documents');
    if (res.error) {
      setStatus('Upload lỗi');
      setUploadingDoc(false);
      return;
    }
    const { url } = res;
    const rec = await insertDocumentRecord(docFile.name, url, 'pdf', pageKey);
    if (rec.error) {
      setStatus('Lưu document vào DB lỗi');
      setUploadingDoc(false);
      return;
    }
    setLastUploadedDoc({ id: rec.data.id, url: rec.data.url, title: rec.data.title });
    setStatus('Upload document thành công');
    setUploadingDoc(false);
  };

  const insertAssetIntoJson = () => {
    if (!lastUploaded) return setStatus('Chưa có asset để chèn');
    try {
      const obj = jsonText ? JSON.parse(jsonText) : {};
      if (!Array.isArray(obj.assets)) obj.assets = [];
      obj.assets.push({ id: lastUploaded.id, url: lastUploaded.url, type: lastUploaded.type });
      setJsonText(JSON.stringify(obj, null, 2));
      setStatus('Chèn asset vào JSON thành công');
    } catch (e) {
      setStatus('Lỗi JSON khi chèn: ' + e.message);
    }
    setTimeout(()=>setStatus(''),2000);
  };

  const insertDocIntoJson = () => {
    if (!lastUploadedDoc) return setStatus('Chưa có document để chèn');
    try {
      const obj = jsonText ? JSON.parse(jsonText) : {};
      if (!Array.isArray(obj.documents)) obj.documents = [];
      obj.documents.push({ id: lastUploadedDoc.id, url: lastUploadedDoc.url, title: lastUploadedDoc.title });
      setJsonText(JSON.stringify(obj, null, 2));
      setStatus('Chèn document vào JSON thành công');
    } catch (e) {
      setStatus('Lỗi JSON khi chèn: ' + e.message);
    }
    setTimeout(()=>setStatus(''),2000);
  };

  return (
    <div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:8}}>
        <select value={pageKey} onChange={(e)=>setPageKey(e.target.value)}>
          <option value="home">home</option>
          <option value="resume">resume</option>
          <option value="about">about</option>
        </select>
        <button className="btn btn-secondary" onClick={async ()=>{setLoadingPage(true); const content=await getPageContent(pageKey); setJsonText(content?JSON.stringify(content,null,2):''); setLoadingPage(false);}}>Tải</button>
        <button className="btn btn-primary" onClick={handleSave}>Lưu</button>
        <div style={{alignSelf:'center'}}>{status}</div>
      </div>
      <div style={{display:'flex',gap:8,flexDirection:'column'}}>
        <div style={{display:'flex',gap:8,alignItems:'center',flexWrap:'wrap'}}>
          <input type="file" accept="image/*" onChange={handleFileChange} />
          <button className="btn btn-secondary" onClick={handleUpload} disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</button>
          <button className="btn btn-primary" onClick={insertAssetIntoJson} disabled={!lastUploaded}>Insert image to JSON</button>
          <span style={{width:16}} />
          <input type="file" accept="application/pdf" onChange={handleDocChange} />
          <button className="btn btn-secondary" onClick={handleDocUpload} disabled={uploadingDoc}>{uploadingDoc ? 'Uploading...' : 'Upload PDF'}</button>
          <button className="btn btn-primary" onClick={insertDocIntoJson} disabled={!lastUploadedDoc}>Insert PDF to JSON</button>
          <div style={{marginLeft:8}}>{status}</div>
        </div>
        {pageKey === 'home' ? (
          <HomeEditor jsonText={jsonText} setJsonText={setJsonText} />
        ) : (
          <textarea className="notes-area" rows={12} value={jsonText} onChange={(e)=>setJsonText(e.target.value)} placeholder={loadingPage ? 'Đang tải...' : '{\n  "title": "..."\n}'} />
        )}
      </div>
      <p className="note">Gợi ý: JSON cho `home` có thể gồm: <code>{`{ "bannerUrl":"...","title":"...","tagline":"...","intro":"...","ctas":[{"text":"","href":""}],"cards":[{"title":"","text":"","href":""}] }`}</code></p>
    </div>
  );
}

function AdminAssets() {
  const [assets, setAssets] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmPayload, setConfirmPayload] = useState(null);

  const loadAll = async () => {
    setLoading(true);
    const a = await getAssets();
    const d = await getDocuments();
    setAssets(a || []);
    setDocuments(d || []);
    setLoading(false);
  };

  useEffect(()=>{ loadAll(); }, []);

  const handleDeleteAsset = (id) => {
    setConfirmPayload(id);
    setConfirmAction('asset');
    setConfirmOpen(true);
  };

  const handleDeleteDoc = (id) => {
    setConfirmPayload(id);
    setConfirmAction('doc');
    setConfirmOpen(true);
  };

  const performConfirm = async () => {
    if (confirmAction === 'asset') await deleteAsset(confirmPayload);
    if (confirmAction === 'doc') await deleteDocument(confirmPayload);
    setConfirmOpen(false);
    setConfirmAction(null);
    setConfirmPayload(null);
    loadAll();
  };

  return (
    <section style={{marginTop:12}}>
      <h3>Quản lý Assets</h3>
      {loading ? <div>Đang tải...</div> : (
        <div style={{display:'grid',gap:8}}>
          {assets.map(a => (
            <div key={a.id} style={{display:'flex',alignItems:'center',gap:8}}>
              <img src={a.url} alt="asset" style={{width:80,height:50,objectFit:'cover'}} />
              <div style={{flex:1}}>{a.url}</div>
              <button className="btn btn-danger" onClick={()=>handleDeleteAsset(a.id)}>Xóa</button>
            </div>
          ))}
        </div>
      )}

      <h3 style={{marginTop:12}}>Quản lý Documents</h3>
      {loading ? <div>Đang tải...</div> : (
        <div style={{display:'grid',gap:8}}>
          {documents.map(d => (
            <div key={d.id} style={{display:'flex',alignItems:'center',gap:8}}>
              <a href={d.url} target="_blank" rel="noreferrer" style={{flex:1}}>{d.title || d.url}</a>
              <button className="btn btn-danger" onClick={()=>handleDeleteDoc(d.id)}>Xóa</button>
            </div>
          ))}
        </div>
      )}
      <ConfirmModal open={confirmOpen} title={confirmAction === 'asset' ? 'Xóa asset' : 'Xóa document'} message={'Bạn có chắc muốn xóa không?'} onConfirm={performConfirm} onCancel={()=>setConfirmOpen(false)} />
    </section>
  );
}

function HomeEditor({ jsonText, setJsonText }) {
  const initial = jsonText ? JSON.parse(jsonText) : {};
  const [bannerUrl, setBannerUrl] = useState(initial.bannerUrl || '');
  const [title, setTitle] = useState(initial.title || '');
  const [tagline, setTagline] = useState(initial.tagline || '');
  const [intro, setIntro] = useState(initial.intro || '');
  const [ctas, setCtas] = useState(initial.ctas || []);
  const [cards, setCards] = useState(initial.cards || []);

  useEffect(()=>{
    const obj = { bannerUrl, title, tagline, intro, ctas, cards };
    setJsonText(JSON.stringify(obj, null, 2));
  }, [bannerUrl, title, tagline, intro, ctas, cards]);

  const addCta = ()=> setCtas(s=>[...s,{text:'',href:'#'}]);
  const updateCta = (i,key,val)=> setCtas(s=>s.map((c,idx)=> idx===i?{...c,[key]:val}:c));
  const removeCta = (i)=> setCtas(s=>s.filter((_,idx)=>idx!==i));

  const addCard = ()=> setCards(s=>[...s,{title:'',text:'',href:'#'}]);
  const updateCard = (i,key,val)=> setCards(s=>s.map((c,idx)=> idx===i?{...c,[key]:val}:c));
  const removeCard = (i)=> setCards(s=>s.filter((_,idx)=>idx!==i));

  return (
    <div style={{display:'grid',gap:8}}>
      <label>Banner URL</label>
      <input className="input" value={bannerUrl} onChange={(e)=>setBannerUrl(e.target.value)} placeholder="https://..." />
      <label>Title</label>
      <input className="input" value={title} onChange={(e)=>setTitle(e.target.value)} />
      <label>Tagline</label>
      <input className="input" value={tagline} onChange={(e)=>setTagline(e.target.value)} />
      <label>Intro</label>
      <textarea className="notes-area" rows={4} value={intro} onChange={(e)=>setIntro(e.target.value)} />

      <div>
        <h4>CTAs</h4>
        {ctas.map((c,i)=> (
          <div key={i} style={{display:'flex',gap:8,alignItems:'center'}}>
            <input className="input" value={c.text} onChange={(e)=>updateCta(i,'text',e.target.value)} placeholder="Text" />
            <input className="input" value={c.href} onChange={(e)=>updateCta(i,'href',e.target.value)} placeholder="Href" />
            <button className="btn btn-danger" onClick={()=>removeCta(i)}>Xóa</button>
          </div>
        ))}
        <button className="btn btn-secondary" onClick={addCta}>Thêm CTA</button>
      </div>

      <div>
        <h4>Cards</h4>
        {cards.map((c,i)=> (
          <div key={i} style={{display:'grid',gap:6}}>
            <input className="input" value={c.title} onChange={(e)=>updateCard(i,'title',e.target.value)} placeholder="Title" />
            <input className="input" value={c.text} onChange={(e)=>updateCard(i,'text',e.target.value)} placeholder="Text" />
            <input className="input" value={c.href} onChange={(e)=>updateCard(i,'href',e.target.value)} placeholder="Href" />
            <button className="btn btn-danger" onClick={()=>removeCard(i)}>Xóa</button>
          </div>
        ))}
        <button className="btn btn-secondary" onClick={addCard}>Thêm Card</button>
      </div>
    </div>
  );
}

 
