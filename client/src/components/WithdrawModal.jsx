import React, { useState } from 'react';
import './WithdrawModal.css';
import ConfirmActionModal from './ConfirmActionModal';
import axios from 'axios';

const WithdrawModal = ({ userData, onClose, updateUserCoins }) => {
  const [walletAddress, setWalletAddress] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(userData.coinnectCoins);

  const handleWalletAddressChange = (e) => {
    setWalletAddress(e.target.value);
  };

  const handleWithdrawAmountChange = (e) => {
    setWithdrawAmount(e.target.value);
  };

  const handleSubmit = () => {
    if (walletAddress) {
      setIsConfirmModalOpen(true);
    } else {
      alert("Please enter a valid wallet address");
    }
  };

  const handleConfirm = async (confirmed) => {
    if (confirmed) {
      try {
        const response = await axios.put(
          `http://localhost:5000/auth/update-coins/${userData.username}`,
          { coinnectCoins: -withdrawAmount }
        );
        if (response.data.success) {
          userData.coinnectCoins -= withdrawAmount;
          console.log('Withdrawal successful:', userData.coinnectCoins);
        } else {
          console.error('Withdrawal failed');
        }
      } catch (error) {
        console.error('Error during withdrawal:', error);
      }
    }
    setIsConfirmModalOpen(false);
    onClose();
  };

  return (
    <div className="withdraw-modal-overlay">
      <div className="withdraw-modal-content">
        <h2>Withdraw</h2>
        <input
          type="text"
          value={walletAddress}
          onChange={handleWalletAddressChange}
          placeholder="Wallet Address"
        />
        <input
          type="number"
          value={withdrawAmount}
          onChange={handleWithdrawAmountChange}
          placeholder="Amount to Withdraw"
          min="1"
          max={userData.coinnectCoins}
        />
        <div className="withdraw-modal-buttons">
          <button className="change-button" onClick={handleSubmit}>Submit</button>
          <button className="cancel-button" onClick={onClose}>Cancel</button>
        </div>
      </div>

      {isConfirmModalOpen && (
        <ConfirmActionModal
          onConfirm={handleConfirm}
          onCancel={() => setIsConfirmModalOpen(false)}
        />
      )}
    </div>
  );
};

export default WithdrawModal;