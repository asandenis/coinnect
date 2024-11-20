import React from 'react';
import './WalletModal.css';

const WalletModal = ({ userData, onClose }) => {
  return (
    <div className="wallet-modal-overlay">
      <div className="wallet-modal-content">
        <button className="wallet-modal-close" onClick={onClose}>X</button>
        <h2>Wallet</h2>
        <div className="wallet-modal-info">
          <img
            src="https://via.placeholder.com/50"
            alt="Wallet"
            className="wallet-modal-image"
          />
          <p className="wallet-modal-coinbalance">
            {userData.coinnectCoins} coinnectCoins
          </p>
        </div>
        <div className='wallet-coinbalance-actions'>
            <p><b>+</b> Add</p>
            <p><b>-</b> Withdraw</p>
        </div>
        <hr className="wallet-modal-line" />
        <div className="wallet-modal-placeholder">
          {/* Placeholder for future content, e.g., transactions or purchase options */}
        </div>
      </div>
    </div>
  );
};

export default WalletModal;