import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Home from './components/Home';
import LoginRegister from './components/LoginRegister';
import Cookies from 'js-cookie';
import Homepage from './components/Homepage';

const App = () => {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
};

const AppRoutes = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const findUserLoggedIn = async () => {
      try {
        const token = Cookies.get('authToken');
        if (!token) {
          return;
        }
  
        navigate('/homepage');
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    findUserLoggedIn();
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<LoginRegister />} />
      <Route path="/homepage" element={<Homepage />} />
    </Routes>
  );
};

export default App;