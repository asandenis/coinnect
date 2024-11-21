import React, { useState } from 'react';
import ConfirmActionModal from './ConfirmActionModal';
import './WithdrawCryptoModal.css';
import axios from 'axios';

const WithdrawCryptoModal = ({ crypto, userData, onClose, updateCryptos }) => {
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleConfirm = async () => {
    if (amount > crypto.amount) {
      alert("Withdrawal amount exceeds available balance.");
      return;
    }

    try {
      const remainingAmount = crypto.amount - amount;

      if (remainingAmount === 0) {
        await axios.delete(`http://localhost:5000/auth/delete-crypto/${userData.username}/${crypto.symbol}`);
      } else {
        await axios.put(`http://localhost:5000/auth/update-crypto/${userData.username}/${crypto.symbol}`, {
          amount: remainingAmount,
        });
      }

      const announcementsResponse = await axios.get(
        `http://localhost:5000/auth/get-user-announcements`,
        { params: { username: userData.username, symbol: crypto.symbol } }
      );

      if (announcementsResponse.data.success) {
        const announcements = announcementsResponse.data.announcements;
        let remainingForAnnouncements = remainingAmount;

        for (const announcement of announcements) {
          if (remainingForAnnouncements <= 0) {
            await axios.delete(
              `http://localhost:5000/auth/delete-announcement/${announcement._id}`
            );
          } else if (announcement.amount > remainingForAnnouncements) {
            await axios.put(
              `http://localhost:5000/auth/update-announcement/${announcement._id}`,
              { amount: remainingForAnnouncements }
            );
            remainingForAnnouncements = 0;
          } else {
            remainingForAnnouncements -= announcement.amount;
          }
        }
      }

      updateCryptos((prev) =>
        remainingAmount > 0
          ? prev.map((c) =>
              c.symbol === crypto.symbol
                ? { ...c, amount: remainingAmount }
                : c
            )
          : prev.filter((c) => c.symbol !== crypto.symbol)
      );

      onClose();
    } catch (error) {
      console.error("Error processing withdrawal:", error);
      alert("An error occurred during the withdrawal.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Withdraw {crypto.symbol}</h3>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min="0"
          max={crypto.amount}
        />
        <input
          type="text"
          placeholder="Recipient Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button className="change-button" onClick={() => setIsConfirmModalOpen(true)}>
          Withdraw
        </button>
        <button className="cancel-button" onClick={onClose}>
          Cancel
        </button>
      </div>

      {isConfirmModalOpen && (
        <ConfirmActionModal
          message={`Confirm withdrawal of ${amount} ${crypto.symbol} to address ${address}?`}
          onConfirm={handleConfirm}
          onCancel={() => setIsConfirmModalOpen(false)}
        />
      )}
    </div>
  );
};

export default WithdrawCryptoModal;