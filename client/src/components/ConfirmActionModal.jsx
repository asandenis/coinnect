import React from 'react';
import './ConfirmActionModal.css';

const ConfirmActionModal = ({ actionMessage, onConfirm, onCancel }) => {
  return (
    <div className="confirm-modal-overlay">
      <div className="confirm-modal-content">
        <h2>Confirm Action</h2>
        <p>{actionMessage}</p>
        <div className="confirm-modal-buttons">
          <button className="confirm-button" onClick={onConfirm}>Yes</button>
          <button className="cancel-button" onClick={onCancel}>No</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;