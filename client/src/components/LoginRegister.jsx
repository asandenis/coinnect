import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginRegister.css';

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  return (
    <div className="login-register-container">
        <div className='logo-container'>
            <img src='https://i.imgur.com/lhnGyhS.png' alt='coinnect logo' id='logo-login' onClick={() => navigate('/')}></img>
        </div>
      <div className="login-register-header">
        <h1>{isLogin ? 'Login to Coinnect' : 'Register on Coinnect'}</h1>
        <p>
          {isLogin
            ? 'Access your account and start exchanging cryptocurrencies now!'
            : 'Create an account to start buying and selling cryptocurrency.'}
        </p>
      </div>

      <div className="form-container">
        <form>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input type="text" id="username" placeholder="Enter your username" />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" placeholder="Enter your email" />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" placeholder="Enter your password" />
          </div>

          <button type="submit" className="form-button">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="toggle-mode">
          <p>
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <span onClick={toggleMode} className="toggle-link">
              {isLogin ? 'Register here' : 'Login here'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;