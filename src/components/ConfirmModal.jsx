import React from 'react';
import '../styles/ConfirmModal.css';

export default function ConfirmModal({ open, title='Confirm', message, onConfirm, onCancel }){
  if(!open) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>{title}</h3>
        <p>{message}</p>
        <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:12}}>
          <button className="btn btn-secondary" onClick={onCancel}>Hủy</button>
          <button className="btn btn-danger" onClick={onConfirm}>Xác nhận</button>
        </div>
      </div>
    </div>
  );
}
