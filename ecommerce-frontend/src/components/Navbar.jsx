import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services/orderService';

export default function Navbar() {
  const [backendUp, setBackendUp] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const checkHealth = async () => {
      try {
        const res = await orderService.getHealth();
        if (isMounted) {
          setBackendUp(res.data && res.data.status === 'UP');
        }
      } catch (err) {
        if (isMounted) {
          setBackendUp(false);
        }
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand">
        <span>🛍️ Cloud-Native E-Commerce</span>
        <span className="badge">Spring Boot 3 + React</span>
      </Link>
      <div className="navbar-status">
        <span
          className={`status-dot ${backendUp === true ? 'up' : backendUp === false ? 'down' : ''}`}
          title={backendUp ? 'Backend connected' : 'Backend unavailable'}
        />
        <span>{backendUp === true ? 'Backend: UP' : backendUp === false ? 'Backend: DOWN' : 'Connecting...'}</span>
      </div>
    </header>
  );
}
