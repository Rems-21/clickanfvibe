import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch('/api/user/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': '69420'
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error("Failed to fetch user profile", error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'ngrok-skip-browser-warning': '69420'
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        await fetchUserProfile(data.access_token);
        navigate('/home');
        return { success: true };
      } else {
        const errorData = await response.json();
        if (errorData.detail === 'NOT_VERIFIED') {
          navigate('/verify-email', { state: { email } });
          return { success: false, error: "Veuillez vérifier votre email." };
        }
        return { success: false, error: errorData.detail };
      }
    } catch (error) {
      return { success: false, error: "Erreur de connexion" };
    }
  };

  const signup = async (name, email, password) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });

      if (response.ok) {
        navigate('/verify-email', { state: { email } });
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail };
      }
    } catch (error) {
      return { success: false, error: "Erreur d'inscription" };
    }
  };

  const loginWithGoogle = async (access_token) => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ access_token })
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        await fetchUserProfile(data.access_token);
        navigate('/home');
        return { success: true };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.detail };
      }
    } catch (error) {
      return { success: false, error: "Erreur de connexion Google" };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login', { replace: true });
  };

  const refreshCredits = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await fetchUserProfile(token);
    }
  };

  const updateProfile = async (name, profile_picture) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, profile_picture })
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: "Erreur de mise à jour" };
      }
    } catch (error) {
      return { success: false, error: "Erreur réseau" };
    }
  };

  const token = localStorage.getItem('token');

  return (
    <AuthContext.Provider value={{ user, token, login, signup, loginWithGoogle, logout, refreshCredits, updateProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
