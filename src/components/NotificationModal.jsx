import React from 'react';

export default function NotificationModal({ open, type = 'success', title, message, onClose }) {
  if (!open) return null;

  const isSuccess = type === 'success';

  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', zindex: 10000, animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        backgroundColor: '#ffffff', padding: '2rem', borderRadius: '12px', maxWidth: '400px',
        width: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
        textAlign: 'center', borderTop: `6px solid ${isSuccess ? '#10b981' : '#ef4444'}`
      }}>
        <h3 style={{ fontSize: '1.5rem', marginBottom: '0.75rem', color: '#1f2937' }}>{title}</h3>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem', lineHeight: '1.5' }}>{message}</p>
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', backgroundColor: isSuccess ? '#10b981' : '#ef4444' }}
          onClick={onClose}
        >
          Đóng
        </button>
      </div>
    </div>
  );
}