const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const path = require('path');

const router = express.Router();
const JWT_SECRET = 'auth';


const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

router.post('/register', async (req, res) => {
  const { username, name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const newUser = new User({ username, name, email, password });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

router.get('/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password'); // Exclude password
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../client/src/media/uploads/profile-pictures');
  },
  filename: (req, file, cb) => {
    cb(null, `${req.params.username}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

router.put('/update/:username', upload.single('profilePicture'), async (req, res) => {
  try {
    const { name, email } = req.body;
    const profilePicture = req.file ? `${req.file.filename}` : undefined;

    // Ensure no other users have the same email
    const existingEmail = await User.findOne({ email, username: { $ne: req.params.username } });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const updatedData = { name, email };
    if (profilePicture) updatedData.profilePicture = profilePicture;

    const updatedUser = await User.findOneAndUpdate(
      { username: req.params.username },
      { $set: updatedData },
      { new: true }
    );

    res.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.put('/change-password/:username', async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send({ success: false, message: 'User not found.' });

    // Check if the old password matches the hashed password in the DB
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).send({ success: false, message: 'Old password is incorrect.' });

    // If the new password matches the old one, we don’t want to change it
    if (oldPassword === newPassword) {
      return res.status(400).send({ success: false, message: 'New password cannot be the same as the old password.' });
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Save the new password to the database
    user.password = hashedNewPassword;
    await user.save();

    // Invalidate the current session by sending a new token (optional)
    // Optionally, you can log the user out, requiring them to log in again.

    res.send({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: 'Internal server error.' });
  }
});

router.delete('/delete/:username', async (req, res) => {
  try {
    await User.findOneAndDelete({ username: req.params.username });
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete account' });
  }
});

module.exports = router;