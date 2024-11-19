import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import './Homepage.css';
import UserInfo from './UserInfo';

const Homepage = () => {
  const [userData, setUserData] = useState({ username: 'User', name: '', rank: '', XP: 0 });
  const [activeSection, setActiveSection] = useState('welcome');
  const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = Cookies.get('authToken');
        if (!token) {
          navigate('/');
          return;
        }

        const response = await axios.get('http://localhost:5000/auth/user', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/');
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    Cookies.remove('authToken');
    navigate('/');
  };

  const toggleUserInfo = () => {
    setIsUserInfoOpen((prevState) => !prevState);
  };

  return (
    <div className="homepage">
      <header className="homepage-header">
        <div className="logo-homepage" onClick={() => navigate('/')}>
          <img src="https://i.imgur.com/lhnGyhS.png" alt="Coinnect Logo" />
        </div>
        <div className="user-profile" onClick={toggleUserInfo}>
          <img
            src={userData.profilePicture || 'https://via.placeholder.com/50'}
            alt="User"
            className="user-image"
          />
        </div>
        <UserInfo
          userData={userData}
          handleLogout={handleLogout}
          isOpen={isUserInfoOpen}
          toggleOpen={toggleUserInfo}
        />
      </header>

      <main>
        <div className="secondary-header">
          <button
            className={`action-button ${activeSection === 'sell' ? 'active' : ''}`}
            onClick={() => setActiveSection('sell')}
          >
            Sell
          </button>
          <button
            className={`action-button ${activeSection === 'buy' ? 'active' : ''}`}
            onClick={() => setActiveSection('buy')}
          >
            Buy
          </button>
        </div>

        <div className="content-section">
          {activeSection === 'welcome' && (
            <div className="welcome-message">
              <h2>Welcome, {userData.username}!</h2>
              <p>Select an action to get started.</p>
            </div>
          )}
          {activeSection === 'sell' && (
            <div className="sell-section">
              <h2>Sell Cryptocurrencies</h2>
            </div>
          )}
          {activeSection === 'buy' && (
            <div className="buy-section">
              <h2>Buy Cryptocurrencies</h2>
            </div>
          )}
        </div>
      </main>

      <footer className="homepage-footer">
        <p>© 2024 Coinnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Homepage;