import React, { useState } from 'react';
import './AddCoinsModal.css';
import ConfirmActionModal from './ConfirmActionModal';
import axios from 'axios';

const AddCoinsModal = ({ userData, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    creditCardNumber: '',
    ccv: '',
    expiryDate: '',
    amount: '',
  });
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProceed = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirm = async (confirmed) => {
    if (confirmed) {
      try {
        const response = await axios.put(
          `http://localhost:5000/auth/update-coins/${userData.username}`,
          { coinnectCoins: parseInt(formData.amount) }
        );
        if (response.data.success) {
          userData.coinnectCoins += parseInt(formData.amount);
        } else {
          console.error('Coin adding failed');
        }
      } catch (error) {
        console.error('Error during coin adding:', error);
      }
    }
    setIsConfirmModalOpen(false);
    onClose();
  };

  return (
    <div className="add-coins-modal-overlay">
      <div className="add-coins-modal-content">
        <h2>Add CoinnectCoins</h2>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Full Name"
        />
        <input
          type="number"
          name="creditCardNumber"
          value={formData.creditCardNumber}
          onChange={handleChange}
          placeholder="Credit Card Number"
          maxLength="16"
          min="0"
        />
        <input
          type="number"
          name="ccv"
          value={formData.ccv}
          onChange={handleChange}
          placeholder="CCV"
          maxLength="3"
          min="0"
        />
        <input
          type="text"
          name="expiryDate"
          value={formData.expiryDate}
          onChange={handleChange}
          placeholder="Expiry Date (MM/YY)"
        />
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Amount (in CoinnectCoins)"
          min="1"
        />
        <div className="add-coins-modal-buttons">
          <button className="change-button" onClick={handleProceed}>Proceed</button>
          <button className="cancel-button" onClick={onClose}>Cancel</button>
        </div>
      </div>

      {isConfirmModalOpen && (
        <ConfirmActionModal
            actionMessage="Are you sure you want to add the coinnectCoins?"
            onConfirm={handleConfirm}
            onCancel={() => setIsConfirmModalOpen(false)}
        />
      )}
    </div>
  );
};

export default AddCoinsModal;