const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');

const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect(
    '<MongoDB Connection',
  )
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

app.use('/auth', authRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));