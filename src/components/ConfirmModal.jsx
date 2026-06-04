import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmText = "Tiếp tục rời đi", cancelText = "Ở lại chỉnh sửa" }) {
  if (!open) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div style={{ backgroundColor: '#ffffff', borderRadius: '20px', width: '100%', maxWidth: '450px', padding: '2rem', boxShadow: '0 25px 50px rgba(0,0,0,0.2)', animation: 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
        <style>{`
          @keyframes popIn { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        `}</style>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#fef2f2', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444' }}>
            <FiAlertTriangle size={24} />
          </div>
          <button onClick={onCancel} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}><FiX /></button>
        </div>

        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#1e1b4b', margin: '0 0 0.8rem 0' }}>{title}</h3>
        <p style={{ color: '#64748b', lineHeight: 1.6, margin: '0 0 2rem 0', fontSize: '0.95rem' }}>{message}</p>

        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={onCancel} 
            style={{ flex: 1, padding: '0.8rem', backgroundColor: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '10px', fontWeight: 700, cursor: 'pointer' }}
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            style={{ flex: 1, padding: '0.8rem', backgroundColor: '#ef4444', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)' }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}