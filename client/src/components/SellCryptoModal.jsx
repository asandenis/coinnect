import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ConfirmActionModal from './ConfirmActionModal';
import './SellCryptoModal.css';

const SellCryptoModal = ({ userData, crypto, onClose }) => {
  const [amount, setAmount] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableAmount, setAvailableAmount] = useState(crypto.amount);

  useEffect(() => {
    const fetchUserAnnouncements = async () => {
      try {
        const response = await axios.get('http://localhost:5000/auth/get-user-announcements', {
          params: { username: userData.username, symbol: crypto.symbol },
        });

        if (response.data.success) {
          const totalInAnnouncements = response.data.announcements.reduce(
            (sum, announcement) => sum + announcement.amount,
            0
          );
          setAvailableAmount(crypto.amount - totalInAnnouncements);
        } else {
          console.error('Failed to fetch announcements');
        }
      } catch (error) {
        console.error('Error fetching announcements:', error.response?.data || error.message);
      }
    };

    fetchUserAnnouncements();
  }, [crypto.amount, crypto.symbol, userData.username]);

  const handleSell = () => {
    if (!amount || amount <= 0 || amount > availableAmount) {
      alert('Please enter a valid amount within the available range.');
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirm = async (isConfirmed) => {
    setIsConfirmOpen(false);
    if (isConfirmed) {
      try {
        setIsSubmitting(true);

        const response = await axios.post(
          'http://localhost:5000/auth/create-announcement',
          {
            symbol: crypto.symbol,
            username: userData.username,
            amount: parseFloat(amount),
          }
        );

        if (response.data.success) {
          alert('Announcement created successfully');
          setAvailableAmount((prev) => prev - parseFloat(amount));
          setAmount('');
        } else {
          alert(response.data.message || 'Failed to create announcement');
        }
      } catch (error) {
        console.error('Error creating announcement:', error.response?.data || error.message);
        alert('Error creating announcement');
      } finally {
        setIsSubmitting(false);
        onClose();
      }
    }
  };

  return (
    <div className="sell-crypto-modal-overlay">
      <div className="sell-crypto-modal-content">
        <h3>Sell {crypto.symbol}</h3>
        <p>Available: {availableAmount.toFixed(2)} {crypto.symbol}</p>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          min="0"
          max={availableAmount}
          disabled={isSubmitting}
        />
        <div className="sell-crypto-modal-actions">
          <button onClick={onClose} className="cancel-button" disabled={isSubmitting}>
            Cancel
          </button>
          <button onClick={handleSell} className="change-button" disabled={isSubmitting}>
            Sell
          </button>
        </div>
      </div>

      {isConfirmOpen && (
        <ConfirmActionModal
          message={`Are you sure you want to sell ${amount} ${crypto.symbol}?`}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
};

export default SellCryptoModal;