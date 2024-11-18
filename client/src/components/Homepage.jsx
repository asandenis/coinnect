import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Homepage.css';

const Homepage = () => {
  const [username, setUsername] = useState('User'); // Default username
  const [activeSection, setActiveSection] = useState('welcome');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/auth/user', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setUsername(response.data.username);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="homepage">
      <header className="homepage-header">
        <div className="logo-homepage" onClick={() => navigate('/')}>
          <img src="https://i.imgur.com/lhnGyhS.png" alt="Coinnect Logo" />
        </div>
        <div className="user-profile">
          <img
            src="https://via.placeholder.com/50"
            alt="User"
            className="user-image"
          />
        </div>
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
              <h2>Welcome, {username}!</h2>
              <p>Select an action to get started.</p>
            </div>
          )}
          {activeSection === 'sell' && (
            <div className="sell-section">
              <h2>Sell Cryptocurrencies</h2>
              <p>Sell Bitcoin, Ethereum, and other cryptocurrencies here.</p>
              <div className="sell-options">
                <div className="crypto-option">Bitcoin (BTC)</div>
                <div className="crypto-option">Ethereum (ETH)</div>
                <div className="crypto-option">Litecoin (LTC)</div>
              </div>
            </div>
          )}
          {activeSection === 'buy' && (
            <div className="buy-section">
              <h2>Buy Cryptocurrencies</h2>
              <p>Buy Bitcoin, Ethereum, and other cryptocurrencies here.</p>
              <div className="buy-options">
                <div className="crypto-option">Bitcoin (BTC)</div>
                <div className="crypto-option">Ethereum (ETH)</div>
                <div className="crypto-option">Litecoin (LTC)</div>
              </div>
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