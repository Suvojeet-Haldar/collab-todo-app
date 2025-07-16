const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ msg: 'User already exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const newUser = await User.create({ name, email, passwordHash });

  const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
  res.json({ token, user: { id: newUser._id, name, email } });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
});

module.exports = router;

router.get('/users', auth, async (req, res) => {
  const users = await User.find({}, 'name _id');
  res.json(users);
});
