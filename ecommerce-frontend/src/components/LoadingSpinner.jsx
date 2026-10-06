import React from 'react';

export default function LoadingSpinner({ message = 'Loading data from server...' }) {
  return (
    <div className="loading-box">
      <div className="spinner" />
      <p>{message}</p>
    </div>
  );
}
