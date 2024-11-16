import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import secureicon from '../media/secure-icon.png';
import globeicon from '../media/globe-icon.png';
import timeicon from '../media/time-icon.png';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="logo">
            <img src='https://i.imgur.com/lhnGyhS.png' alt='coinnect logo' id='logo'></img>
        </div>
        <button className="login-button" onClick={() => navigate('/login')}>
          Login / Register
        </button>
      </header>

      <main className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Coinnect</h1>
          <p>
            Coinnect is your go-to platform for peer-to-peer cryptocurrency
            trading. Buy and sell digital currencies with ease, security, and
            transparency.
          </p>
          <button className="cta-button" onClick={() => navigate('/login')}>Get Started</button>
        </div>
        <div className="hero-image">
          <img
            src='https://images.ctfassets.net/0idwgenf7ije/18joQuFxY5unfYS590OIg7/8514ab61b816bc4acd70cc6682f92b22/Crypto.gif'
            alt="Cryptocurrency trading illustration"
            id='home-gif'
          />
        </div>
      </main>

      <section className="features-section">
        <div className="feature">
            <img src={secureicon} id='home-icon' alt='secure-icon'></img>
          <h3>Secure Transactions</h3>
          <p>Enjoy the highest level of security for every trade.</p>
        </div>
        <div className="feature">
            <img src={globeicon} id='home-icon' alt='globe-icon'></img>
          <h3>Global Access</h3>
          <p>Connect with traders from around the world.</p>
        </div>
        <div className="feature">
            <img src={timeicon} id='home-icon' alt='time-icon'></img>
          <h3>Fast Trades</h3>
          <p>Experience lightning-fast transaction speeds.</p>
        </div>
      </section>

      <footer className="home-footer">
        <p>© 2024 Coinnect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;