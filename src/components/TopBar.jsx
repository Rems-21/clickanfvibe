import React, { useState, useEffect } from 'react';
import { Search, Bell, Zap, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './Layout.css';

function TopBar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { notifications, markAsRead } = useNotification();
  const [showDropdown, setShowDropdown] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Close dropdown if click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.notif-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);


  return (
    <header className="app-topbar">
      <div className="topbar-search">
        <Search size={18} color="rgba(255,255,255,0.4)" />
        <input type="text" placeholder="Rechercher..." />
        <span className="search-shortcut">Ctrl K</span>
      </div>

      <div className="topbar-actions">

        <div className="notif-container" style={{ position: 'relative' }}>
          <button className="icon-btn-transparent" onClick={() => setShowDropdown(!showDropdown)}>
            <Bell size={20} />
            {unreadCount > 0 && <span className="notification-dot" style={{ position: 'absolute', top: 0, right: 0, background: '#FF3366', width: '8px', height: '8px', borderRadius: '50%' }}></span>}
          </button>

          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '40px',
              right: '0',
              width: '300px',
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              zIndex: 1000,
              maxHeight: '400px',
              overflowY: 'auto',
              padding: '10px 0'
            }}>
              <h4 style={{ margin: '0 0 10px 15px', color: '#fff', fontSize: '14px' }}>Notifications</h4>
              {notifications.length === 0 ? (
                <p style={{ margin: '15px', color: '#666', fontSize: '13px', textAlign: 'center' }}>Aucune notification.</p>
              ) : (
                notifications.map(n => (
                  <div 
                    key={n.id} 
                    onClick={() => { if (!n.is_read) markAsRead(n.id); }}
                    style={{ 
                      padding: '10px 15px', 
                      borderBottom: '1px solid #333',
                      background: n.is_read ? 'transparent' : 'rgba(255, 51, 102, 0.1)',
                      cursor: n.is_read ? 'default' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    {!n.is_read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FF3366', flexShrink: 0 }}></span>}
                    <div>
                      <h5 style={{ margin: 0, color: '#fff', fontSize: '13px' }}>{n.title}</h5>
                      <p style={{ margin: '4px 0 0 0', color: '#9ca3af', fontSize: '12px' }}>{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
        <button className="credits-badge-top" onClick={() => navigate('/credits')}>
          <Zap size={14} color="#FF3366" fill="#FF3366" />
          <span>{user ? user.credits : 0} Gens</span>
        </button>
      </div>
    </header>
  );
}

export default TopBar;
