import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { insertContactMessage, getPageContent } from '../utils/supabaseClient';
import '../styles/pages.css';
import NotificationModal from '../components/NotificationModal';
import PageHero from '../components/PageHero';
import {
  FiMail, FiPhone, FiMapPin, FiGithub, FiLinkedin,
  FiFacebook, FiSend, FiCheck, FiUser, FiMessageSquare,
  FiAlertCircle, FiClock, FiArrowRight, FiExternalLink,
} from 'react-icons/fi';

/* ── EmailJS config từ .env ── */
const EJS_SERVICE  = process.env.REACT_APP_EMAILJS_SERVICE_ID  || '';
const EJS_TEMPLATE = process.env.REACT_APP_EMAILJS_TEMPLATE_ID || '';
const EJS_KEY      = process.env.REACT_APP_EMAILJS_PUBLIC_KEY  || '';

/* ── Scroll reveal ── */
function useReveal(deps = []) {
  useEffect(() => {
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-visible'); }),
      { threshold: 0.07 }
    );
    document.querySelectorAll('.reveal-section').forEach(el => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/* ── Single info row ── */
function InfoRow({ icon, label, value, href }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
      <div style={{
        width: 42, height: 42, borderRadius: 11, flexShrink: 0,
        background: 'linear-gradient(135deg,#eef2ff,#e0e7ff)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#6366f1',
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.2rem' }}>{label}</div>
        {href
          ? <a href={href} target="_blank" rel="noreferrer" style={{ fontSize: 'clamp(0.88rem,1.8vw,0.96rem)', fontWeight: 700, color: '#0f172a', textDecoration: 'none', wordBreak: 'break-all' }}
            onMouseOver={e => e.currentTarget.style.color = '#6366f1'}
            onMouseOut={e => e.currentTarget.style.color = '#0f172a'}
          >{value}</a>
          : <div style={{ fontSize: 'clamp(0.88rem,1.8vw,0.96rem)', fontWeight: 700, color: '#0f172a', wordBreak: 'break-all' }}>{value}</div>
        }
      </div>
    </div>
  );
}

/* ── Social button ── */
function SocialBtn({ icon, label, href, color, bg }) {
  if (!href) return null;
  return (
    <a
      href={href} target="_blank" rel="noreferrer"
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.75rem 1.1rem', borderRadius: 12,
        background: bg, color, border: `1.5px solid ${color}22`,
        textDecoration: 'none', fontWeight: 700,
        fontSize: 'clamp(0.82rem,1.7vw,0.9rem)',
        transition: 'all 0.22s', flex: '1 1 140px',
      }}
      onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 20px ${color}28`; }}
      onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      {icon}
      <span>{label}</span>
      <FiExternalLink size={12} style={{ marginLeft: 'auto', opacity: 0.6 }} />
    </a>
  );
}

/* ── Floating label input ── */
function Field({ label, error, children, required }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <label style={{ fontWeight: 700, fontSize: '0.82rem', color: error ? '#ef4444' : '#374151', display: 'flex', gap: '4px', alignItems: 'center' }}>
        {label}
        {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
      {error && (
        <span style={{ fontSize: '0.75rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
          <FiAlertCircle size={12} /> {error}
        </span>
      )}
    </div>
  );
}

const MAX_MSG = 1000;

export default function Contact() {
  const [global, setGlobal] = useState(null);
  const [form, setForm]     = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [sent, setSent]     = useState(false);
  const [modal, setModal]   = useState({ open: false, type: 'success', title: '', message: '' });
  const formRef             = useRef(null);

  useEffect(() => {
    (async () => {
      const data = await getPageContent('global');
      if (data) setGlobal(data);
    })();
  }, []);

  useReveal([global]);

  const email   = global?.email   || 'quyen.contact@example.com';
  const phone   = global?.phone   || '+84 901 234 567';
  const address = global?.address || 'TP. Hồ Chí Minh, Việt Nam';
  const social  = global?.social  || {};

  /* Validate */
  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Vui lòng nhập họ và tên.';
    if (!form.email.trim())   e.email   = 'Vui lòng nhập địa chỉ email.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Địa chỉ email không hợp lệ.';
    if (!form.subject.trim()) e.subject = 'Vui lòng nhập chủ đề.';
    if (!form.message.trim()) e.message = 'Vui lòng nhập nội dung lời nhắn.';
    return e;
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);

    try {
      /* ── 1. Lưu vào Supabase (luôn thực hiện trước) ── */
      const { error: dbError } = await insertContactMessage(form);
      if (dbError) {
        /* DB lỗi → dừng, không gửi mail để tránh gửi mail mà không có record */
        setModal({
          open: true, type: 'error',
          title: 'Lưu dữ liệu thất bại',
          message: 'Hệ thống tạm gián đoạn. Vui lòng thử lại sau hoặc liên hệ trực tiếp qua email.',
        });
        return;
      }

      /* ── 2. Gửi email qua EmailJS ── */
      if (EJS_SERVICE && EJS_TEMPLATE && EJS_KEY) {
        try {
          await emailjs.send(
            EJS_SERVICE,
            EJS_TEMPLATE,
            {
              // Truyền các biến khớp hoàn toàn với mẫu HTML Template
              name:       form.name,
              email:      form.email,
              subject:    form.subject,
              message:    form.message,
              time:       new Date().toLocaleString('vi-VN'),
              reply_to:   form.email,
            },
            EJS_KEY
          );
        } catch (mailErr) {
          /* Mail lỗi → không block UX, chỉ log warning.
             Dữ liệu đã lưu Supabase nên admin vẫn thấy. */
          console.warn('[EmailJS] Gửi email thất bại:', mailErr?.text || mailErr);
          /* Tuỳ chọn: hiện toast nhẹ thay vì modal lỗi cứng */
          setModal({
            open: true, type: 'error',
            title: 'Lời nhắn đã lưu, nhưng email chưa gửi được',
            message: 'Dữ liệu đã được lưu lại. Tuy nhiên hệ thống email gặp sự cố — admin sẽ xem trong trang quản lý.',
          });
        }
      } else {
        console.warn('[EmailJS] Chưa cấu hình biến môi trường REACT_APP_EMAILJS_*');
      }

      /* ── 3. Thành công ── */
      setSent(true);
      setForm({ name: '', email: '', subject: '', message: '' });
      setErrors({});

    } catch (err) {
      setModal({ open: true, type: 'error', title: 'Lỗi không xác định', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  const inputBase = (hasError) => ({
    width: '100%', padding: '0.82rem 1rem',
    borderRadius: 12,
    border: `1.5px solid ${hasError ? '#fca5a5' : '#e2e8f0'}`,
    outline: 'none', fontSize: '0.92rem',
    background: hasError ? '#fff5f5' : '#fff',
    color: '#0f172a', fontFamily: "'Plus Jakarta Sans', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Fraunces:ital,wght@0,700;0,900;1,700&display=swap');

        .ct-root { font-family:'Plus Jakarta Sans',sans-serif; background:#f8fafc; }

        .ct-wrap {
          max-width:1100px; margin:0 auto;
          padding:0 clamp(1rem,4vw,2rem) clamp(3rem,6vw,5rem);
          display:flex; flex-direction:column; gap:clamp(2rem,4vw,3rem);
        }

        /* ── Main grid ── */
        .ct-grid {
          display:grid; grid-template-columns:1fr;
          gap:clamp(1.5rem,3vw,2.5rem); align-items:start;
        }
        @media(min-width:860px){
          .ct-grid { grid-template-columns:380px 1fr; }
        }

        /* ── Info panel ── */
        .ct-info {
          background:#fff; border:1.5px solid #f1f5f9;
          border-radius:20px; overflow:hidden;
          box-shadow:0 4px 24px rgba(15,23,42,0.05);
        }
        .ct-info-hero {
          background:linear-gradient(135deg,#1e1b4b 0%,#312e81 60%,#1e40af 100%);
          padding:clamp(1.5rem,4vw,2.2rem);
          position:relative; overflow:hidden;
        }
        .ct-info-hero::before {
          content:''; position:absolute; inset:0;
          background-image:radial-gradient(rgba(255,255,255,0.04) 1px,transparent 1px);
          background-size:24px 24px;
        }
        .ct-info-hero-content { position:relative; z-index:1; }
        .ct-info-body {
          padding:clamp(1.5rem,4vw,2rem);
          display:flex; flex-direction:column; gap:1.4rem;
        }
        .ct-divider { height:1px; background:#f1f5f9; margin:0.2rem 0; }

        /* ── Availability badge ── */
        .ct-avail {
          display:inline-flex; align-items:center; gap:8px;
          background:rgba(74,222,128,0.15); border:1px solid rgba(74,222,128,0.3);
          color:#d1fae5; padding:0.35rem 0.9rem; border-radius:99px;
          font-size:0.75rem; font-weight:700; letter-spacing:0.04em;
          margin-bottom:0.9rem; width:fit-content;
        }
        .ct-avail-dot {
          width:7px; height:7px; border-radius:50%;
          background:#4ade80; box-shadow:0 0 8px #4ade80;
          animation:ct-pulse 2s infinite;
        }
        @keyframes ct-pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(0.8)}}

        /* ── Form card ── */
        .ct-form-card {
          background:#fff; border:1.5px solid #f1f5f9;
          border-radius:20px; padding:clamp(1.8rem,4vw,2.8rem);
          box-shadow:0 4px 24px rgba(15,23,42,0.05);
        }

        /* ── Input focus ring ── */
        .ct-input:focus { border-color:#6366f1 !important; box-shadow:0 0 0 3px rgba(99,102,241,0.12); }
        .ct-textarea:focus { border-color:#6366f1 !important; box-shadow:0 0 0 3px rgba(99,102,241,0.12); }

        /* ── Submit button ── */
        .ct-submit {
          width:100%; padding:0.95rem;
          background:linear-gradient(135deg,#6366f1,#4f46e5);
          color:#fff; border:none; border-radius:14px;
          font-size:1rem; font-weight:800; cursor:pointer;
          display:flex; align-items:center; justify-content:center; gap:9px;
          transition:all 0.25s;
          box-shadow:0 4px 16px rgba(99,102,241,0.3);
          font-family:'Plus Jakarta Sans',sans-serif;
        }
        .ct-submit:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 24px rgba(99,102,241,0.38); }
        .ct-submit:disabled { opacity:0.65; cursor:not-allowed; transform:none; }

        /* ── Success state ── */
        .ct-success {
          display:flex; flex-direction:column; align-items:center;
          justify-content:center; text-align:center;
          padding:clamp(2.5rem,6vw,4rem) clamp(1.5rem,4vw,2.5rem);
          gap:1.2rem; animation:ct-fadeIn 0.5s ease;
        }
        @keyframes ct-fadeIn{ from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
        .ct-success-icon {
          width:72px; height:72px; border-radius:50%;
          background:linear-gradient(135deg,#d1fae5,#a7f3d0);
          display:flex; align-items:center; justify-content:center;
          color:#059669; font-size:2rem;
          box-shadow:0 8px 24px rgba(16,185,129,0.22);
        }

        /* ── Quick links strip ── */
        .ct-quick {
          display:grid;
          grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr));
          gap:1rem;
        }
        .ct-quick-card {
          background:#fff; border:1.5px solid #f1f5f9; border-radius:16px;
          padding:1.3rem; display:flex; flex-direction:column; gap:0.5rem;
          text-decoration:none; transition:all 0.22s;
        }
        .ct-quick-card:hover {
          border-color:#c7d2fe; transform:translateY(-3px);
          box-shadow:0 10px 28px rgba(99,102,241,0.09);
        }
        .ct-quick-icon {
          width:38px; height:38px; border-radius:10px;
          background:#eef2ff; display:flex; align-items:center; justify-content:center;
          color:#6366f1; margin-bottom:0.2rem;
        }
        .ct-quick-label { font-size:0.72rem; fontWeight:700; color:#94a3b8; textTransform:uppercase; letterSpacing:'0.06em'; }
        .ct-quick-title { font-size:0.92rem; font-weight:800; color:#0f172a; }
        .ct-quick-arrow { font-size:0.78rem; color:#6366f1; font-weight:700; margin-top:auto; display:flex; align-items:center; gap:4px; }
      `}</style>

      <div className="ct-root page contact-page">
        <PageHero
          title={global?.contactTitle || 'Liên Hệ Trực Tiếp'}
          subtitle={global?.contactSubtitle || 'Để lại thông tin kết nối công việc hoặc dự án hợp tác'}
          bgImage={global?.contactCoverUrl || ''}
        />

        <div className="ct-wrap">

          {/* ── Main grid: Info + Form ── */}
          <div className="ct-grid">

            {/* ── LEFT: Info panel ── */}
            <div className="ct-info reveal-section">
              {/* Hero gradient header */}
              <div className="ct-info-hero">
                <div className="ct-info-hero-content">
                  <div className="ct-avail">
                    <span className="ct-avail-dot" />
                    Sẵn sàng kết nối
                  </div>
                  <h2 style={{
                    fontFamily: "'Fraunces', serif",
                    fontSize: 'clamp(1.3rem,3vw,1.7rem)',
                    fontWeight: 900, color: '#fff', margin: '0 0 0.5rem 0', lineHeight: 1.2,
                  }}>
                    Hãy Cùng Nhau<br />Xây Dựng Điều Gì Đó
                  </h2>
                  <p style={{ color: '#a5b4fc', fontSize: 'clamp(0.82rem,1.7vw,0.9rem)', margin: 0, lineHeight: 1.7 }}>
                    Dù là cơ hội internship, dự án hợp tác hay chỉ đơn giản là muốn kết nối — mình luôn sẵn sàng lắng nghe.
                  </p>
                </div>
              </div>

              {/* Info rows */}
              <div className="ct-info-body">
                <InfoRow icon={<FiMail size={18} />} label="Thư điện tử" value={email} href={`mailto:${email}`} />
                <div className="ct-divider" />
                <InfoRow icon={<FiPhone size={18} />} label="Điện thoại" value={phone} href={`tel:${phone.replace(/\s/g,'')}`} />
                <div className="ct-divider" />
                <InfoRow icon={<FiMapPin size={18} />} label="Địa điểm" value={address} />
                <div className="ct-divider" />
                <InfoRow icon={<FiClock size={18} />} label="Thời gian phản hồi" value="Trong vòng 24 giờ làm việc" />

                {/* Social links */}
                {(social.github || social.linkedin || social.facebook) && (
                  <>
                    <div className="ct-divider" />
                    <div>
                      <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '0.85rem' }}>Mạng Xã Hội</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.65rem' }}>
                        <SocialBtn href={social.linkedin} icon={<FiLinkedin size={15} />} label="LinkedIn" color="#0a66c2" bg="#eff8ff" />
                        <SocialBtn href={social.github}   icon={<FiGithub size={15} />}   label="GitHub"   color="#0f172a" bg="#f8fafc" />
                        <SocialBtn href={social.facebook} icon={<FiFacebook size={15} />} label="Facebook" color="#1877f2" bg="#eff6ff" />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* ── RIGHT: Form ── */}
            <div className="ct-form-card reveal-section">
              {sent ? (
                /* Success state */
                <div className="ct-success">
                  <div className="ct-success-icon"><FiCheck /></div>
                  <div>
                    <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(1.3rem,3vw,1.7rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                      Lời nhắn đã được gửi!
                    </h3>
                    <p style={{ color: '#64748b', fontSize: 'clamp(0.85rem,1.8vw,0.95rem)', lineHeight: 1.7, margin: 0 }}>
                      Cảm ơn bạn đã liên hệ. Mình sẽ phản hồi trong vòng <strong style={{ color: '#6366f1' }}>24 giờ làm việc</strong>.
                    </p>
                  </div>
                  <button
                    onClick={() => setSent(false)}
                    style={{ background: '#eef2ff', color: '#6366f1', border: 'none', padding: '0.75rem 2rem', borderRadius: 12, fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem', fontFamily: 'inherit', transition: 'all 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.background = '#e0e7ff'}
                    onMouseOut={e => e.currentTarget.style.background = '#eef2ff'}
                  >
                    Gửi lời nhắn khác
                  </button>
                </div>
              ) : (
                /* Form */
                <>
                  <div style={{ marginBottom: 'clamp(1.4rem,3vw,2rem)' }}>
                    <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 'clamp(1.3rem,3vw,1.8rem)', fontWeight: 900, color: '#0f172a', margin: '0 0 0.4rem 0' }}>
                      Gửi Lời Nhắn
                    </h2>
                    <p style={{ color: '#64748b', fontSize: 'clamp(0.82rem,1.7vw,0.9rem)', margin: 0 }}>
                      Tất cả các trường có dấu <span style={{ color: '#ef4444' }}>*</span> là bắt buộc.
                    </p>
                  </div>

                  <form ref={formRef} onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>

                    {/* Name + Email row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(min(100%,200px),1fr))', gap: '1rem' }}>
                      <Field label="Họ và tên" required error={errors.name}>
                        <div style={{ position: 'relative' }}>
                          <FiUser size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                          <input
                            className="ct-input"
                            type="text"
                            value={form.name}
                            onChange={e => handleChange('name', e.target.value)}
                            placeholder="Nguyễn Văn A"
                            style={{ ...inputBase(!!errors.name), paddingLeft: '2.5rem' }}
                            onFocus={e => { e.target.style.borderColor='#6366f1'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.12)'; }}
                            onBlur={e => { e.target.style.borderColor=errors.name?'#fca5a5':'#e2e8f0'; e.target.style.boxShadow='none'; }}
                          />
                        </div>
                      </Field>

                      <Field label="Địa chỉ Email" required error={errors.email}>
                        <div style={{ position: 'relative' }}>
                          <FiMail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' }} />
                          <input
                            className="ct-input"
                            type="email"
                            value={form.email}
                            onChange={e => handleChange('email', e.target.value)}
                            placeholder="your@email.com"
                            style={{ ...inputBase(!!errors.email), paddingLeft: '2.5rem' }}
                            onFocus={e => { e.target.style.borderColor='#6366f1'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.12)'; }}
                            onBlur={e => { e.target.style.borderColor=errors.email?'#fca5a5':'#e2e8f0'; e.target.style.boxShadow='none'; }}
                          />
                        </div>
                      </Field>
                    </div>

                    {/* Subject */}
                    <Field label="Chủ đề" required error={errors.subject}>
                      <input
                        className="ct-input"
                        type="text"
                        value={form.subject}
                        onChange={e => handleChange('subject', e.target.value)}
                        placeholder="VD: Cơ hội internship BA / Hợp tác dự án..."
                        style={inputBase(!!errors.subject)}
                        onFocus={e => { e.target.style.borderColor='#6366f1'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.12)'; }}
                        onBlur={e => { e.target.style.borderColor=errors.subject?'#fca5a5':'#e2e8f0'; e.target.style.boxShadow='none'; }}
                      />
                    </Field>

                    {/* Message */}
                    <Field label="Nội dung lời nhắn" required error={errors.message}>
                      <div style={{ position: 'relative' }}>
                        <FiMessageSquare size={15} style={{ position: 'absolute', left: 14, top: 14, color: '#94a3b8', pointerEvents: 'none' }} />
                        <textarea
                          className="ct-textarea"
                          value={form.message}
                          onChange={e => handleChange('message', e.target.value.slice(0, MAX_MSG))}
                          placeholder="Mô tả ngắn về bạn, mục đích liên hệ và những gì bạn mong muốn trao đổi..."
                          rows={6}
                          style={{ ...inputBase(!!errors.message), paddingLeft: '2.5rem', resize: 'vertical', lineHeight: 1.75, minHeight: 140 }}
                          onFocus={e => { e.target.style.borderColor='#6366f1'; e.target.style.boxShadow='0 0 0 3px rgba(99,102,241,0.12)'; }}
                          onBlur={e => { e.target.style.borderColor=errors.message?'#fca5a5':'#e2e8f0'; e.target.style.boxShadow='none'; }}
                        />
                        <span style={{
                          position: 'absolute', bottom: 10, right: 12,
                          fontSize: '0.72rem', fontWeight: 600,
                          color: form.message.length > MAX_MSG * 0.9 ? '#ef4444' : '#cbd5e1',
                        }}>
                          {form.message.length}/{MAX_MSG}
                        </span>
                      </div>
                    </Field>

                    {/* Privacy note */}
                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '0', lineHeight: 1.6 }}>
                      Thông tin của bạn chỉ được dùng để liên lạc, không được chia sẻ với bên thứ ba.
                    </p>

                    {/* Submit */}
                    <button type="submit" className="ct-submit" disabled={loading}>
                      {loading
                        ? <><span style={{ width:18, height:18, border:'2.5px solid rgba(255,255,255,0.4)', borderTopColor:'#fff', borderRadius:'50%', animation:'ct-spin 0.8s linear infinite', display:'inline-block' }} /> Đang gửi...</>
                        : <><FiSend size={17} /> Gửi Lời Nhắn</>
                      }
                    </button>
                    <style>{`@keyframes ct-spin{to{transform:rotate(360deg)}}`}</style>
                  </form>
                </>
              )}
            </div>
          </div>

          {/* ── Quick links strip ── */}
          <div className="reveal-section">
            <p style={{ fontSize: '0.72rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1rem' }}>
              Khám phá thêm
            </p>
            <div className="ct-quick">
              {[
                { to: '/projects', icon: <FiUser size={18} />, label: 'Portfolio', title: 'Kho Dự Án BA', desc: 'Xem các case study thực tế' },
                { to: '/resume',   icon: <FiUser size={18} />, label: 'CV', title: 'Hồ Sơ Năng Lực', desc: 'Tải CV đầy đủ của tôi' },
                { to: '/blog',     icon: <FiUser size={18} />, label: 'Blog', title: 'Bài Viết Kiến Thức', desc: 'Nghiên cứu và chia sẻ' },
                { to: '/about',    icon: <FiUser size={18} />, label: 'About', title: 'Giới Thiệu Bản Thân', desc: 'Hành trình và định hướng' },
              ].map(item => (
                <Link key={item.to} to={item.to} className="ct-quick-card">
                  <div className="ct-quick-icon">
                    {item.icon}
                  </div>
                  <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{item.label}</div>
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a' }}>{item.title}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.5 }}>{item.desc}</div>
                  <div style={{ fontSize: '0.78rem', color: '#6366f1', fontWeight: 700, marginTop: 'auto', paddingTop: '0.5rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Xem ngay <FiArrowRight size={12} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>

      <NotificationModal
        open={modal.open}
        type={modal.type}
        title={modal.title}
        message={modal.message}
        onClose={() => setModal({ ...modal, open: false })}
      />
    </>
  );
}