import React from 'react';

export default function Alert({ type = 'danger', message, onClose }) {
  if (!message) return null;

  return (
    <div className={`alert alert-${type}`}>
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold' }}
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
}
