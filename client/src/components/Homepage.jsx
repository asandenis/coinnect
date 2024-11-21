import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Cookies from 'js-cookie';
import './Homepage.css';
import UserInfo from './UserInfo';
import cryptoData from '../config/cryptos.json';
import SellCryptoModal from './SellCryptoModal';
import BuyCryptoModal from './BuyCryptoModal';
import trustedSellerBadge from '../media/trusted-seller-badge.png';

const Homepage = () => {
  const [userData, setUserData] = useState({ username: 'User', name: '', rank: '', XP: 0 });
  const [activeSection, setActiveSection] = useState('welcome');
  const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);
  const [userCryptos, setUserCryptos] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState(null);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleSellClick = (crypto) => {
    setSelectedCrypto(crypto);
    setIsSellModalOpen(true);
  };

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

    const fetchUserCryptos = async () => {
      try {
        const token = Cookies.get('authToken');
        const response = await axios.get(
          `http://localhost:5000/auth/get-cryptos/${userData.username}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          setUserCryptos(response.data.cryptos);
        } else {
          console.error('Failed to fetch cryptocurrencies');
        }
      } catch (error) {
        console.error('Error fetching cryptocurrencies:', error);
      }
    };

    const fetchAnnouncements = async () => {
      try {
        const token = Cookies.get('authToken');
        const response = await axios.get(
          'http://localhost:5000/auth/get-announcements',
          { headers: { Authorization: `Bearer ${token}` }, params: { username: userData.username } }
        );
        if (response.data.success) {
          setAnnouncements(response.data.announcements);
        } else {
          console.error('Failed to fetch announcements');
        }
      } catch (error) {
        console.error('Error fetching announcements:', error);
      }
    };

    fetchUserData();
    fetchUserCryptos();
    fetchAnnouncements();
  }, [navigate, userData.username]);

  useEffect(() => {
    const fetchSalesData = async (username) => {
      try {
        const response = await axios.get(
          'http://localhost:5000/auth/get-sales-data',
          { params: { username } }
        );
        if (response.data.success) {
          return response.data.numberOfSales;
        } else {
          return 0;
        }
      } catch (error) {
        console.error('Error fetching sales data:', error);
        return 0;
      }
    };

    const loadAnnouncementsWithSalesData = async () => {
      const announcementsWithSales = [];
      for (let announcement of announcements) {
        const numberOfSales = await fetchSalesData(announcement.username);
        announcementsWithSales.push({ ...announcement, numberOfSales });
      }
      setSalesData(announcementsWithSales);
    };

    if (announcements.length > 0) {
      loadAnnouncementsWithSalesData();
    }
  }, [announcements]);

  const handleLogout = () => {
    Cookies.remove('authToken');
    navigate('/');
  };

  const toggleUserInfo = () => {
    setIsUserInfoOpen((prevState) => !prevState);
  };

  const handleBuyClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsBuyModalOpen(true);
  };

  const profileImagePath = userData.profilePicture
    ? require(`../media/uploads/profile-pictures/${userData.profilePicture}`)
    : 'https://via.placeholder.com/50';

  return (
    <div className="homepage">
      <header className="homepage-header">
        <div className="logo-homepage" onClick={() => navigate('/')}>
          <img src="https://i.imgur.com/lhnGyhS.png" alt="Coinnect Logo" />
        </div>
        <div className="user-profile" onClick={toggleUserInfo}>
          <img
            src={profileImagePath}
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
              <div className="user-cryptos">
                {userCryptos.length > 0 ? (
                  userCryptos.map((crypto) => {
                    const cryptoInfo = cryptoData.cryptocurrencies.find((c) => c.symbol === crypto.symbol);
                    return (
                      <div className="crypto-info" key={crypto.symbol}>
                        <div className="crypto-info-data">
                          <img src={cryptoInfo?.logo} alt={crypto.symbol} className="crypto-logo" />
                          <p>
                            <b>{crypto.symbol}</b>
                            <br />
                            {crypto.amount}
                          </p>
                        </div>
                        <button onClick={() => handleSellClick(crypto)}><b>Sell</b></button>
                      </div>
                    );
                  })
                ) : (
                  <p>No cryptocurrencies found</p>
                )}
              </div>
            </div>
          )}
          {activeSection === 'buy' && (
            <div className="buy-section">
              <h2>Buy Cryptocurrencies</h2>
              <div className="user-cryptos">
                {salesData.length > 0 ? (
                  salesData
                    .filter((announcement) => announcement.username !== userData.username) // Exclude user's announcements
                    .map((announcement) => {
                      const cryptoInfo = cryptoData.cryptocurrencies.find(
                        (c) => c.symbol === announcement.symbol
                      );
                      return (
                        <div className="crypto-info" key={announcement.symbol}>
                          <div className="crypto-info-data">
                            <img
                              src={cryptoInfo?.logo}
                              alt={announcement.symbol}
                              className="crypto-logo-announcements"
                            />
                            <p>
                              {announcement.amount}
                              <b> {cryptoInfo.symbol}</b>
                              <br />
                              <span id="announcements-username">
                                @{announcement.username}
                              </span>
                              <br />
                              {announcement.numberOfSales >= 10 ? (
                                <div className="trusted-seller">
                                  <img
                                    src={trustedSellerBadge}
                                    alt="Trusted Seller Badge"
                                    className="trusted-seller-badge"
                                  />
                                  <span>Trusted Seller</span>
                                </div>
                              ) : (
                                <></>
                              )}
                            </p>
                          </div>
                          <button onClick={() => handleBuyClick({ ...announcement, logo: cryptoInfo?.logo })}>
                            <b>Buy</b>
                          </button>
                        </div>
                      );
                    })
                ) : (
                  <p>No cryptocurrencies found</p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="homepage-footer">
        <p>© 2024 Coinnect. All rights reserved.</p>
      </footer>

      {isSellModalOpen && selectedCrypto && (
        <SellCryptoModal
          userData={userData}
          crypto={selectedCrypto}
          onClose={() => setIsSellModalOpen(false)}
        />
      )}

      {isBuyModalOpen && selectedAnnouncement && (
        <BuyCryptoModal
          userData={userData}
          crypto={selectedAnnouncement}
          onClose={() => setIsBuyModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Homepage;