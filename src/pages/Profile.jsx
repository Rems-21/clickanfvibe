import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Edit2, Music, Calendar, Clock, Download, HelpCircle, LogOut, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Profile.css';
import '../pages/Home.css';

function Profile() {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPicture, setEditPicture] = useState(user?.profile_picture || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return (
      <div className="profile-container" style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
        <div style={{textAlign: 'center'}}>
          <h2 style={{marginBottom: '20px'}}>Connecte-toi pour voir ton profil</h2>
          <button className="btn-primary" onClick={() => navigate('/login')}>Se connecter</button>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const res = await updateProfile(editName, editPicture);
    setIsSaving(false);
    if (res.success) {
      setIsEditing(false);
    } else {
      alert(res.error || "Une erreur est survenue");
    }
  };

  return (
    <div className="profile-container">
      <div className="page-header-simple">
        <div className="title-section">
          <h1>Profil</h1>
        </div>
      </div>

      <div className="profile-content">
        <section className="profile-header-info">
          <div className="avatar-container">
            <div className="avatar-glow-ring">
              <img src={isEditing ? (editPicture || "/hero_bg.png") : (user.profile_picture || "/hero_bg.png")} alt="Profile" className="profile-avatar" />
            </div>
            {isEditing && (
              <>
                <button className="btn-camera-badge" onClick={() => document.getElementById('profile-upload').click()} disabled={isSaving}>
                  <Camera size={14} />
                </button>
                <input 
                  type="file" 
                  id="profile-upload" 
                  style={{ display: 'none' }} 
                  accept="image/png, image/jpeg, image/webp, image/gif" 
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const file = e.target.files[0];
                      if (file.size > 5 * 1024 * 1024) {
                        alert("Le fichier est trop volumineux (max 5MB)");
                        return;
                      }
                      const formData = new FormData();
                      formData.append('file', file);
                      try {
                        setIsSaving(true);
                        const res = await fetch('/api/user/upload-profile-picture', {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                          },
                          body: formData
                        });
                        const data = await res.json();
                        if (res.ok) {
                          setEditPicture(data.profile_picture);
                        } else {
                          alert(data.detail || "Erreur lors de l'upload");
                        }
                      } catch (err) {
                        console.error(err);
                        alert("Erreur de connexion");
                      } finally {
                        setIsSaving(false);
                      }
                    }
                  }}
                />
              </>
            )}
          </div>
          
          {isEditing ? (
            <div className="user-details" style={{width: '100%'}}>
              <input 
                type="text" 
                value={editName} 
                onChange={(e) => setEditName(e.target.value)}
                style={{width: '100%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '8px 12px', borderRadius: '8px', marginBottom: '8px'}}
                placeholder="Votre nom"
              />
              <div style={{display: 'flex', gap: '8px'}}>
                <button className="btn-primary-gradient" style={{flex: 1, padding: '8px'}} onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button className="btn-secondary-outline" style={{flex: 1, padding: '8px'}} onClick={() => {
                  setIsEditing(false);
                  setEditName(user.name);
                  setEditPicture(user.profile_picture || '');
                }} disabled={isSaving}>
                  Annuler
                </button>
              </div>
            </div>
          ) : (
            <div className="user-details">
              <div className="user-name-row">
                <h2>{user.name}</h2>
                {user.is_premium && <CheckCircle2 size={16} fill="#FF3366" color="white" className="verified-badge" />}
              </div>
              <p className="user-handle">@{user.name.toLowerCase().replace(/\s+/g, '_')}</p>
              <p className="user-bio">Créateur de vibes <Music size={12} className="inline-icon" /></p>
              <p className="user-join-date">
                <Calendar size={12} /> Membre depuis aujourd'hui
              </p>
            </div>
          )}
        </section>

        {!isEditing && (
          <button className="btn-edit-profile" onClick={() => {
            setIsEditing(true);
            setEditName(user.name);
            setEditPicture(user.profile_picture || '');
          }}>
            <Edit2 size={16} /> Éditer mon profil
          </button>
        )}

        <section className="settings-menu" style={{marginTop: '32px'}}>
          <Link to="/history" className="menu-item">
            <Clock size={20} className="menu-icon" />
            <span className="menu-label">Historique</span>
            <span className="menu-chevron">›</span>
          </Link>
          <Link to="/history" state={{ tab: 'downloads' }} className="menu-item">
            <Download size={20} className="menu-icon" />
            <span className="menu-label">Mes téléchargements</span>
            <span className="menu-chevron">›</span>
          </Link>
          <Link to="/help" className="menu-item">
            <HelpCircle size={20} className="menu-icon" />
            <span className="menu-label">Aide & Support</span>
            <span className="menu-chevron">›</span>
          </Link>
        </section>

        <button className="btn-logout" onClick={logout}>
          <LogOut size={18} /> Se déconnecter
        </button>
      </div>
    </div>
  );
}

export default Profile;
