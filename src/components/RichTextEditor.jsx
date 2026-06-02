import React, { useEffect, useRef } from 'react';
import { FiBold, FiItalic, FiUnderline, FiAlignLeft, FiAlignCenter, FiList } from 'react-icons/fi';

const RichTextEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleFormat = (command, val = null) => {
    document.execCommand(command, false, val);
    editorRef.current.focus();
    onChange(editorRef.current.innerHTML);
  };

  return (
    <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', backgroundColor: '#fff', overflow: 'hidden' }}>
      <div style={{ display: 'flex', gap: '4px', padding: '0.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #cbd5e1', flexWrap: 'wrap' }}>
        <button type="button" onClick={() => handleFormat('bold')} style={{ padding: '0.4rem', cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#fff' }} title="In đậm"><FiBold /></button>
        <button type="button" onClick={() => handleFormat('italic')} style={{ padding: '0.4rem', cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#fff' }} title="In nghiêng"><FiItalic /></button>
        <button type="button" onClick={() => handleFormat('underline')} style={{ padding: '0.4rem', cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#fff' }} title="Gạch chân"><FiUnderline /></button>
        <div style={{ width: '1px', backgroundColor: '#cbd5e1', margin: '0 4px' }}></div>
        <button type="button" onClick={() => handleFormat('formatBlock', 'H3')} style={{ padding: '0.2rem 0.6rem', cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#fff', fontWeight: 800 }}>H1</button>
        <button type="button" onClick={() => handleFormat('formatBlock', 'H4')} style={{ padding: '0.2rem 0.6rem', cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#fff', fontWeight: 700 }}>H2</button>
        <div style={{ width: '1px', backgroundColor: '#cbd5e1', margin: '0 4px' }}></div>
        <button type="button" onClick={() => handleFormat('insertUnorderedList')} style={{ padding: '0.4rem', cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#fff' }} title="Danh sách"><FiList /></button>
        <button type="button" onClick={() => handleFormat('justifyLeft')} style={{ padding: '0.4rem', cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#fff' }} title="Căn trái"><FiAlignLeft /></button>
        <button type="button" onClick={() => handleFormat('justifyCenter')} style={{ padding: '0.4rem', cursor: 'pointer', border: '1px solid #e2e8f0', borderRadius: '4px', background: '#fff' }} title="Căn giữa"><FiAlignCenter /></button>
      </div>
      <div 
        ref={editorRef} 
        contentEditable 
        onBlur={(e) => onChange(e.currentTarget.innerHTML)}
        style={{ padding: '1rem', minHeight: '150px', outline: 'none', lineHeight: '1.6', fontSize: '1rem' }}
        placeholder="Nhập nội dung văn bản tại đây..."
      />
    </div>
  );
};

export default RichTextEditor;