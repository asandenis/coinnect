import React, { useState, useEffect } from 'react';
import './AddCryptoModal.css';
import axios from 'axios';
import cryptoData from '../config/cryptos.json';
import ConfirmActionModal from './ConfirmActionModal';

const AddCryptoModal = ({ userData, onClose }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [seed, setSeed] = useState('');
  const [selectedCrypto, setSelectedCrypto] = useState('');
  const [amount, setAmount] = useState('');
  const [cryptos, setCryptos] = useState([]);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    if (cryptoData && cryptoData.cryptocurrencies) {
      setCryptos(cryptoData.cryptocurrencies);
    } else {
      console.error('No cryptocurrencies found in the JSON data');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!walletAddress || !seed || !selectedCrypto || !amount) {
      alert("All fields are required!");
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleConfirm = async () => {
    try {
      const response = await axios.post('http://localhost:5000/auth/add-crypto', {
        username: userData.username,
        symbol: selectedCrypto,
        amount,
      });

      if (response.data.success) {
        alert('Crypto added successfully');
        onClose();
        setIsConfirmModalOpen(false);
      } else {
        alert('Failed to add crypto');
        setIsConfirmModalOpen(false);
      }
    } catch (error) {
      console.error('Error adding crypto:', error);
      setIsConfirmModalOpen(false);
    }
  };

  return (
    <div className="add-crypto-modal-overlay">
      <div className="add-crypto-modal-content">
        <h2>Add Cryptocurrency</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Wallet Address"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Seed"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            required
          />
          <select
            value={selectedCrypto}
            onChange={(e) => setSelectedCrypto(e.target.value)}
            required
          >
            <option value="">Select Cryptocurrency</option>
            {cryptos.length > 0 ? (
              cryptos.map((crypto) => (
                <option key={crypto.symbol} value={crypto.symbol}>
                  <img
                    src={crypto.logo}
                    alt={crypto.symbol}
                    className="crypto-logo"
                  />
                  {crypto.symbol}
                </option>
              ))
            ) : (
              <option>No cryptocurrencies available</option>
            )}
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            required
          />
          <div className="add-crypto-modal-buttons">
            <button className="change-button" type="submit">Add</button>
            <button className="cancel-button" type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>

      {isConfirmModalOpen && (
        <ConfirmActionModal
          onClose={() => setIsConfirmModalOpen(false)}
          onConfirm={handleConfirm}
          message={`Are you sure you want to add ${amount} ${selectedCrypto} to your wallet?`}
        />
      )}
    </div>
  );
};

export default AddCryptoModal;