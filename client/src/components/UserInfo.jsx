import React, { useState } from 'react';
import './UserInfo.css';
import './EditUserModal.css';
import editIcon from '../media/edit-icon.png';
import newbieBadge from '../media/newbie-badge.png';
import intermediateBadge from '../media/intermediate-badge.png';
import expertBadge from '../media/expert-badge.png';
import masterBadge from '../media/master-badge.png';
import walletIcon from '../media/wallet-icon.png';
import EditUserModal from './EditUserModal';
import WalletModal from './WalletModal'; // Import the WalletModal

const UserInfo = ({ userData, handleLogout, isOpen, toggleOpen }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false); // State for wallet modal

  const toggleModal = () => setIsModalOpen(!isModalOpen);
  const toggleWalletModal = () => setIsWalletModalOpen(!isWalletModalOpen); // Toggle wallet modal

  if (!isOpen) return null;

  const rankBadgeMap = {
    Newbie: newbieBadge,
    Intermediate: intermediateBadge,
    Expert: expertBadge,
    Master: masterBadge,
  };

  return (
    <>
      <div className="user-info">
        <div className="user-info-header">
          <div className="user-info-name">
            <img
              src={editIcon}
              id="user-info-edit"
              onClick={toggleModal}
              alt="Edit Profile"
            />
            <h3>{userData.name}</h3>
          </div>
          <p>@{userData.username}</p>
        </div>
        <div className="user-info-wallet" onClick={toggleWalletModal}>
          <img src={walletIcon} id="user-info-wallet-icon" alt="Wallet Icon" />
          <p>Wallet</p>
        </div>
        <div className="user-info-body">
          <div className="user-info-rank">
            <img
              src={rankBadgeMap[userData.rank] || newbieBadge}
              id="user-info-rank-badge"
              alt={`${userData.rank} Badge`}
            />
            <p>
              <strong>Rank:</strong> {userData.rank}
            </p>
          </div>
          <p id="user-info-xp">
            <strong>XP:</strong> {userData.XP}
          </p>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          Log Out
        </button>
      </div>
      {isModalOpen && (
        <EditUserModal
          userData={userData}
          onClose={toggleModal}
          handleLogout={handleLogout}
        />
      )}
      {isWalletModalOpen && <WalletModal userData={userData} onClose={toggleWalletModal} />}
    </>
  );
};

export default UserInfo;