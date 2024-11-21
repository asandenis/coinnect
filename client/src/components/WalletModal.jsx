import React, { useState, useEffect } from 'react';
import './WalletModal.css';
import coinnectCoinsIcon from '../media/coinnectCoin-icon.png';
import AddCoinsModal from './AddCoinsModal';
import WithdrawModal from './WithdrawModal';
import AddCryptoModal from './AddCryptoModal';
import WithdrawCryptoModal from './WithdrawCryptoModal';
import axios from 'axios';
import cryptoData from '../config/cryptos.json';

const WalletModal = ({ userData, onClose }) => {
  const [isAddCoinsModalOpen, setIsAddCoinsModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isAddCryptoModalOpen, setIsAddCryptoModalOpen] = useState(false);
  const [isWithdrawCryptoModalOpen, setIsWithdrawCryptoModalOpen] = useState(false);
  const [userCryptos, setUserCryptos] = useState([]);
  const [selectedCrypto, setSelectedCrypto] = useState(null);

  useEffect(() => {
    const fetchUserCryptos = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/auth/get-cryptos/${userData.username}`);
        if (response.data.success) {
          setUserCryptos(response.data.cryptos);
        } else {
          console.error('Failed to fetch cryptocurrencies');
        }
      } catch (error) {
        console.error('Error fetching cryptocurrencies:', error);
      }
    };

    fetchUserCryptos();
  }, [userData.username]);

  const handleWithdrawCrypto = (crypto) => {
    setSelectedCrypto(crypto);
    setIsWithdrawCryptoModalOpen(true);
  };

  const updateCryptos = (updatedCryptos) => {
    setUserCryptos(updatedCryptos);
  };

  const toggleAddCoinsModal = () => {
    setIsAddCoinsModalOpen(!isAddCoinsModalOpen);
  };

  return (
    <div className="wallet-modal-overlay">
      <div className="wallet-modal-content">
        <h2>Wallet</h2>
        <div className="wallet-modal-info">
          <img src={coinnectCoinsIcon} alt="Wallet" className="wallet-modal-image" />
          <p className="wallet-modal-coinbalance">
            {userData.coinnectCoins} coinnectCoins
          </p>
        </div>
        <div className="wallet-coinbalance-actions">
          <p onClick={toggleAddCoinsModal}>
            <b>+</b> Add
          </p>
          <p onClick={() => setIsWithdrawModalOpen(true)}>
            <b>-</b> Withdraw
          </p>
        </div>
        <hr className="wallet-modal-line" />
        <div className="wallet-modal-placeholder">
          <div className="wallet-coinbalance-actions" onClick={() => setIsAddCryptoModalOpen(true)}>
            <p><b>+</b> Add Crypto</p>
          </div>
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
                    <button onClick={() => handleWithdrawCrypto(crypto)}><b>-</b> Withdraw</button>
                  </div>
                );
              })
            ) : (
              <p>No cryptocurrencies found</p>
            )}
          </div>
        </div>
        <button className="cancel-button" onClick={onClose}>Close</button>
      </div>

      {isAddCoinsModalOpen && (
        <AddCoinsModal
          userData={userData}
          onClose={toggleAddCoinsModal}
        />
      )}

      {isWithdrawModalOpen && (
        <WithdrawModal
          userData={userData}
          onClose={() => setIsWithdrawModalOpen(false)}
        />
      )}

      {isWithdrawCryptoModalOpen && selectedCrypto && (
        <WithdrawCryptoModal
          userData={userData}
          crypto={selectedCrypto}
          onClose={() => setIsWithdrawCryptoModalOpen(false)}
          updateCryptos={updateCryptos}
        />
      )}

      {isAddCryptoModalOpen && (
        <AddCryptoModal
          userData={userData}
          onClose={() => setIsAddCryptoModalOpen(false)}
        />
      )}
    </div>
  );
};

export default WalletModal;