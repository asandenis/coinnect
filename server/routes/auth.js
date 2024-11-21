const express = require('express');
const bcrypt = require('bcrypt');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Cryptocurrency = require('../models/Cryptocurrency');
const Announcement = require('../models/Announcement');
const path = require('path');
const cron = require('node-cron');

const router = express.Router();
const JWT_SECRET = 'auth';

const updateUserRank = async (username, xp) => {
  let newRank = '';
  
  if (xp <= 100) {
    newRank = 'Newbie';
  } else if (xp > 100 && xp <= 500) {
    newRank = 'Intermediate';
  } else if (xp > 500 && xp <= 2000) {
    newRank = 'Expert';
  } else if (xp > 2000) {
    newRank = 'Master';
  }

  try {
    await User.updateOne({ username: username }, { rank: newRank });
    console.log(`User ${username}'s rank has been updated to ${newRank}`);
  } catch (error) {
    console.error('Error updating user rank:', error);
  }
};

const updateAllUsersRanks = async () => {
  try {
    const users = await User.find();

    for (const user of users) {
      await updateUserRank(user.username, user.XP);
    }
  } catch (error) {
    console.error('Error updating all users ranks:', error);
  }
};

cron.schedule('* * * * *', async () => {
  console.log('Running rank update for all users...');
  await updateAllUsersRanks();
});

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
    const user = await User.findById(req.user.id).select('-password');
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

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) return res.status(400).send({ success: false, message: 'Old password is incorrect.' });

    if (oldPassword === newPassword) {
      return res.status(400).send({ success: false, message: 'New password cannot be the same as the old password.' });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedNewPassword;
    await user.save();

    res.send({ success: true, message: 'Password changed successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).send({ success: false, message: 'Internal server error.' });
  }
});

router.delete('/delete/:username', async (req, res) => {
  try {
    await User.findOneAndDelete({ username: req.params.username });
    await Announcement.deleteMany({ username: req.params.username});
    await Cryptocurrency.deleteMany({ username: req.params.username});
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to delete account' });
  }
});

router.put('/update-coins/:username', async (req, res) => {
  const { username } = req.params;
  const { coinnectCoins } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.coinnectCoins += coinnectCoins;
    await user.save();

    res.json({ success: true, updatedCoins: user.coinnectCoins });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/add-crypto', async (req, res) => {
  const { username, symbol, amount, walletAddress, seed } = req.body;

  try {
    const newCrypto = new Cryptocurrency({
      username,
      symbol,
      amount,
      walletAddress,
      seed,
    });

    await newCrypto.save();

    res.status(200).json({ success: true, message: 'Cryptocurrency added successfully.' });
  } catch (error) {
    console.error('Error adding cryptocurrency:', error);
    res.status(500).json({ success: false, message: 'Failed to add cryptocurrency.' });
  }
});

router.get('/get-cryptos/:username', async (req, res) => {
  const { username } = req.params;
  try {
    const cryptos = await Cryptocurrency.find({ username });
    if (cryptos.length > 0) {
      return res.status(200).json({ success: true, cryptos });
    } else {
      return res.status(200).json({ success: false, cryptos: [] });
    }
  } catch (error) {
    console.error('Error fetching cryptocurrencies:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch cryptocurrencies.' });
  }
});

router.delete('/delete-crypto/:username/:symbol', async (req, res) => {
  const { username, symbol } = req.params;

  try {
    await Cryptocurrency.deleteOne({ username, symbol });
    return res.status(200).json({ success: true, message: 'Cryptocurrency deleted successfully' });
  } catch (error) {
    console.error("Error deleting cryptocurrency:", error);
    return res.status(500).json({ success: false, message: 'Failed to delete cryptocurrency' });
  }
});

router.put('/update-crypto/:username/:symbol', async (req, res) => {
  const { username, symbol } = req.params;
  const { amount } = req.body;

  try {
    await Cryptocurrency.updateOne({ username, symbol }, { $set: { amount } });
    return res.status(200).json({ success: true, message: 'Cryptocurrency updated successfully' });
  } catch (error) {
    console.error("Error updating cryptocurrency:", error);
    return res.status(500).json({ success: false, message: 'Failed to update cryptocurrency' });
  }
});

router.post('/create-announcement', async (req, res) => {
  try {
    const { symbol, username, amount } = req.body;

    if (!symbol || !username || !amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid input data' });
    }

    const newAnnouncement = new Announcement({ symbol, username, amount });
    await newAnnouncement.save();

    res.status(201).json({ success: true, message: 'Announcement created successfully' });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/get-announcements', async (req, res) => {
  try {
    const { username } = req.query;

    const announcements = await Announcement.find({ username: { $ne: username } });

    res.status(200).json({ success: true, announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, message: 'Error fetching announcements' });
  }
});

router.get('/get-sales-data', async (req, res) => {
  const { username } = req.query;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const salesData = user.numberOfSales;

    if (salesData > 0) {
      return res.status(200).json({ success: true, numberOfSales: salesData });
    } else {
      return res.status(200).json({ success: true, numberOfSales: 0 });
    }

  } catch (error) {
    console.error('Error fetching sales data:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/get-user-announcements', async (req, res) => {
  const { username, symbol } = req.query;
  try {
    const announcements = await Announcement.find({ username, symbol });
    res.json({ success: true, announcements });
  } catch (error) {
    console.error('Error fetching user announcements:', error);
    res.status(500).json({ success: false, message: 'Error fetching announcements' });
  }
});

router.get('/get-user-announcements', async (req, res) => {
  const { username, symbol } = req.query;
  try {
    const announcements = await Announcement.find({ username, symbol });
    res.json({ success: true, announcements });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ success: false, message: 'Error fetching announcements' });
  }
});

router.delete('/delete-announcement/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await Announcement.findByIdAndDelete(id);
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    res.status(500).json({ success: false, message: 'Error deleting announcement' });
  }
});

router.put('/update-announcement/:id', async (req, res) => {
  const { id } = req.params;
  const { amount } = req.body;
  try {
    await Announcement.findByIdAndUpdate(id, { amount });
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating announcement:', error);
    res.status(500).json({ success: false, message: 'Error updating announcement' });
  }
});

router.post('/buy-crypto', async (req, res) => {
  const { buyer, seller, symbol, amount, totalCost } = req.body;

  try {
    const announcement = await Announcement.findOne({ username: seller, symbol });
    if (!announcement || announcement.amount < amount) {
      return res.status(400).json({ success: false, message: 'Invalid or insufficient announcement.' });
    }

    const buyerUser = await User.findOne({ username: buyer });
    if (!buyerUser) {
      return res.status(404).json({ success: false, message: 'Buyer not found' });
    }
    
    if (buyerUser.coinnectCoins < totalCost) {
      return res.status(400).json({ success: false, message: 'Insufficient CoinnectCoins.' });
    }
    buyerUser.coinnectCoins -= totalCost;

    const sellerUser = await User.findOne({ username: seller });
    if (!sellerUser) {
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }
    sellerUser.coinnectCoins += totalCost;

    const sellerCrypto = await Cryptocurrency.findOne({ username: seller, symbol });
    if (!sellerCrypto || sellerCrypto.amount < amount) {
      return res.status(400).json({ success: false, message: 'Seller does not have enough cryptocurrency.' });
    }

    sellerCrypto.amount -= amount;
    await sellerCrypto.save();

    const buyerCrypto = await Cryptocurrency.findOne({ username: buyer, symbol });
    if (buyerCrypto) {
      buyerCrypto.amount += amount;
      await buyerCrypto.save();
    } else {
      const newCrypto = new Cryptocurrency({
        username: buyer,
        symbol,
        amount,
      });
      await newCrypto.save();
    }

    if (announcement.amount === amount) {
      await Announcement.findByIdAndDelete(announcement._id);
    } else {
      announcement.amount -= amount;
      await announcement.save();
    }

    buyerUser.XP += Math.round(totalCost*0.2*0.5);

    sellerUser.XP += Math.round(totalCost*0.2);

    buyerUser.numberOfBuys += 1;

    sellerUser.numberOfSales += 1;

    await buyerUser.save();
    await sellerUser.save();

    res.status(200).json({ success: true, message: 'Purchase completed successfully.' });
  } catch (error) {
    console.error('Error processing transaction:', error);
    res.status(500).json({ success: false, message: 'Transaction failed.' });
  }
});

module.exports = router;