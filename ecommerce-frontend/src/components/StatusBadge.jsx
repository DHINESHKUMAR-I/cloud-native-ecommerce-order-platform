import React from 'react';

export default function StatusBadge({ status }) {
  if (!status) return null;

  const normalized = status.toLowerCase();
  return (
    <span className={`badge-status badge-${normalized}`}>
      {status}
    </span>
  );
}
