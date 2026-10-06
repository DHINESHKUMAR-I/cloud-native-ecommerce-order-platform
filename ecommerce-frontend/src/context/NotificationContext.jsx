import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const showSuccess = (message) => {
    setNotification({ type: 'success', message });
    setTimeout(() => setNotification(null), 5000);
  };

  const showError = (message) => {
    setNotification({ type: 'danger', message });
  };

  const clearNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ notification, showSuccess, showError, clearNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
