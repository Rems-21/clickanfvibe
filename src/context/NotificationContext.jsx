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
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        pointerEvents: 'none'
      }}>
        {toasts.map(toast => {
          let Icon = Info;
          let color = '#3b82f6'; // info
          if (toast.type === 'success') { Icon = CheckCircle; color = '#10b981'; }
          if (toast.type === 'warning') { Icon = AlertTriangle; color = '#f59e0b'; }
          if (toast.type === 'error') { Icon = X; color = '#ef4444'; }
          
          return (
            <div key={toast.id} style={{
              background: '#1a1a1a',
              borderLeft: `4px solid ${color}`,
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              width: '300px',
              pointerEvents: 'auto',
              animation: 'slideInRight 0.3s ease-out'
            }}>
              <Icon color={color} size={24} style={{ flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: '0 0 4px 0', color: '#fff', fontSize: '14px' }}>{toast.title}</h4>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '13px' }}>{toast.message}</p>
              </div>
              <button 
                onClick={() => removeToast(toast.id)}
                style={{ background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', padding: 0 }}
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
      `}</style>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}
