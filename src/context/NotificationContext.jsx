import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { X, Bell, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const { token, user } = useAuth();
  
  // Fetch DB notifications
  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchNotifications();
      // Poll every 30s
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
    }
  }, [token, fetchNotifications]);

  const addToast = useCallback((title, message, type = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, title, message, type }]);
    
    // Auto remove after 5s
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const markAsRead = async (id) => {
    if (!token) return;
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <NotificationContext.Provider value={{ toasts, addToast, notifications, markAsRead, fetchNotifications }}>
      {children}
      
      {/* Toast Container */}
      <div style={{
        position: 'fixed',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none',
        // Desktop : coin supérieur droit
        top: '20px',
        right: '20px',
        left: 'auto',
        bottom: 'auto',
        width: '320px',
      }}
      className="toast-container"
      >
        {toasts.map(toast => {
          let Icon = Info;
          let color = '#3b82f6'; // info
          if (toast.type === 'success') { Icon = CheckCircle; color = '#10b981'; }
          if (toast.type === 'warning') { Icon = AlertTriangle; color = '#f59e0b'; }
          if (toast.type === 'error') { Icon = X; color = '#ef4444'; }
          
          return (
            <div key={toast.id} style={{
              background: '#1c1c1c',
              borderLeft: `4px solid ${color}`,
              padding: '14px 16px',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              width: '100%',
              pointerEvents: 'auto',
              animation: 'slideInRight 0.3s ease-out'
            }}>
              <Icon color={color} size={22} style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{ margin: '0 0 3px 0', color: '#fff', fontSize: '14px', fontWeight: 700 }}>{toast.title}</h4>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px', lineHeight: 1.4 }}>{toast.message}</p>
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 0, flexShrink: 0 }}
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @media (max-width: 480px) {
          .toast-container {
            top: auto !important;
            right: 12px !important;
            left: 12px !important;
            bottom: 80px !important;
            width: auto !important;
          }
          @keyframes slideInRight {
            from { transform: translateY(100%); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        }
      `}</style>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
