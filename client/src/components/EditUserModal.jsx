import React, { useState } from 'react';
import axios from 'axios';
import './EditUserModal.css';
import Alert from './Alert';
import ConfirmActionModal from './ConfirmActionModal';

const EditUserModal = ({ userData, onClose, handleLogout }) => {
  const [editMode, setEditMode] = useState('details');
  const [formData, setFormData] = useState({
    name: userData.name,
    username: userData.username,
    email: userData.email,
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [profilePicture, setProfilePicture] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    setProfilePicture(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async () => {
    try {
      let response;
  
      if (editMode === 'details') {
        const formDataToSend = new FormData();
        formDataToSend.append('name', formData.name);
        formDataToSend.append('email', formData.email);
        if (profilePicture) {
          formDataToSend.append('profilePicture', profilePicture);
        }
  
        response = await axios.put(
          `http://localhost:5000/auth/update/${userData.username}`,
          formDataToSend,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
      } else if (editMode === 'password') {
        if (
          !formData.oldPassword ||
          !formData.newPassword ||
          formData.newPassword !== formData.confirmPassword
        ) {
          setAlert({ show: true, message: 'Password mismatch or missing fields.', type: 'error' });
          return;
        }
  
        response = await axios.put(`http://localhost:5000/auth/change-password/${userData.username}`, {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword,
        });
      }
  
      if (response.data.success) {
        setAlert({ show: true, message: 'Changes saved successfully!', type: 'success' });
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setAlert({ show: true, message: response.data.message, type: 'error' });
      }
    } catch (error) {
      console.error(error);
      setAlert({ show: true, message: 'An error occurred. Please try again.', type: 'error' });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await axios.delete(`http://localhost:5000/auth/delete/${userData.username}`);
      if (response.data.success) {
        handleLogout();
      } else {
        setAlert({ show: true, message: response.data.message, type: 'error' });
      }
    } catch (error) {
      console.error(error);
      setAlert({ show: true, message: 'Failed to delete account', type: 'error' });
    }
  };

  const handleModeSwitch = (mode) => {
    if (mode === 'password') {
      setFormData({
        ...formData,
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
    setEditMode(mode);
  };

  const handleConfirmAction = () => {
    if (actionType === 'delete') {
      handleDeleteAccount();
    } else {
      handleSubmit();
    }
    setShowConfirmModal(false);
  };

  const handleCancelAction = () => {
    setShowConfirmModal(false);
  };

  const profileImagePath = userData.profilePicture 
    ? require(`../media/uploads/profile-pictures/${userData.profilePicture}`) 
    : 'https://via.placeholder.com/50';

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit Profile</h2>
        {editMode === 'details' ? (
          <>
            <div
              className="profile-picture-dropzone"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <img
                src={profileImagePath}
                alt="User"
                className="profile-picture-user-image"
              />
              <p>➤</p>
              {profilePicture ? (
                <img
                  src={URL.createObjectURL(profilePicture)}
                  alt="Profile Preview"
                  className="profile-preview"
                />
              ) : (
                <p>Drag and drop a profile picture here</p>
              )}
            </div>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Name"
            />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
            />
            <button
              className="change-password-button"
              onClick={() => handleModeSwitch('password')}
            >
              Change Password
            </button>
          </>
        ) : (
          <>
            <input
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              placeholder="Old Password"
            />
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="New Password"
            />
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat Password"
            />
            <button
              className="change-password-button"
              onClick={() => handleModeSwitch('details')}
            >
              Back to Details
            </button>
          </>
        )}
        <div className="modal-buttons">
          <button className="change-button" onClick={() => { setActionType('update'); setShowConfirmModal(true); }}>
            Change Info
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="delete-account-button" onClick={() => { setActionType('delete'); setShowConfirmModal(true); }}>
            Delete Account
          </button>
        </div>
      </div>

      {alert.show && <Alert type={alert.type} message={alert.message} />}

      {showConfirmModal && (
        <ConfirmActionModal
          actionMessage={actionType === 'delete' ? 'Are you sure you want to delete your account?' : 'Are you sure you want to update your information?'}
          onConfirm={handleConfirmAction}
          onCancel={handleCancelAction}
        />
      )}
    </div>
  );
};

export default EditUserModal;