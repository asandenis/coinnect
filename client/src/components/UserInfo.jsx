import React from 'react';
import './UserInfo.css';

const UserInfo = ({ userData, handleLogout, isOpen, toggleOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="user-info">
      <div className="user-info-header">
        <h3>{userData.name}</h3>
        <p>@{userData.username}</p>
      </div>
      <div className="user-info-body">
        <p><strong>Rank:</strong> {userData.rank}</p>
        <p><strong>XP:</strong> {userData.XP}</p>
      </div>
      <button className="logout-button" onClick={handleLogout}>
        Log Out
      </button>
    </div>
  );
};

export default UserInfo;