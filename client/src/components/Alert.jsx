import React from 'react';
import './Alert.css';

const Alert = ({ message, type, onClose }) => {
  const alertClass = type === 'error' ? 'alert-error' : 'alert-success';

  return (
    <div className={`alert ${alertClass}`}>
      <p>{message}</p>
      <button className="close-button" onClick={onClose}>
        ✕
      </button>
    </div>
  );
};

export default Alert;