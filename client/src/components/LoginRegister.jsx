import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import './LoginRegister.css';
import Alert from './Alert';

const LoginRegister = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
  });
  const [alert, setAlert] = useState({ message: '', type: '' });
  const navigate = useNavigate();

  const toggleMode = () => {
    setIsLogin(!isLogin);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        setAlert({
          message:
            'Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.',
          type: 'error',
        });
        return;
      }
    }

    try {
      if (isLogin) {
        const response = await axios.post('http://localhost:5000/auth/login', {
          email: formData.email,
          password: formData.password,
        });
      
        // Save the token in cookies
        Cookies.set('authToken', response.data.token, { expires: 1 }); // Expires in 1 day
      
        setAlert({ message: 'Login successful!', type: 'success' });
        setTimeout(() => navigate('/homepage'), 2000);      
      } else {
        await axios.post('http://localhost:5000/auth/register', formData);
        setAlert({ message: 'Registration successful!', type: 'success' });
        toggleMode();
      }
    } catch (error) {
      setAlert({ message: error.response?.data?.message || 'Something went wrong', type: 'error' });
    }
  };

  return (
    <div className="login-register-container">
      {alert.message && (
        <Alert
          message={alert.message}
          type={alert.type}
          onClose={() => setAlert({ message: '', type: '' })}
        />
      )}
      <div className="logo-container">
        <img
          src="https://i.imgur.com/lhnGyhS.png"
          alt="coinnect logo"
          id="logo-login"
          onClick={() => navigate('/')}
        />
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
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your username"
                />
              </div>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
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