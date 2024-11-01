const express = require('express');
const bcrypt = require('bcryptjs');
const { DateTime } = require('luxon');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();
const jwt = require("jsonwebtoken");

// Create User
router.post('/create', async (req, res) => {
  try {
    const { name, mobile, email, password, coordinates } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      mobile,
      email,
      password: hashedPassword,
      coordinates,
    });
    await user.save();
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// login User
router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ error: 'Invalid email or password' });
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ error: "Invaild password" });
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      delete user.password;

      res.json({ message: 'Logged in successfully', token,user });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
});

// Edit User
router.put('/edit/:id',auth ,async (req, res) => {
  try {
    const updates = req.body;
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User updated successfully', user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete User
router.delete('/delete/:id',auth ,async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Fetch Users with Sorting and Date Filter
router.get('/', async (req, res) => {
  try {
    const { sort = 'latest', registrationDate } = req.query;
    let query = {};
    if (registrationDate) {
      const date = DateTime.fromFormat(registrationDate, 'dd/MM/yyyy').startOf('day');
      if (!date.isValid) {
        return res.status(400).json({ error: 'Invalid registration date format' });
      }
      query.time_of_registration = {
        $gte: date.toJSDate(),
        $lt:  date.plus({ days: 1 }).toJSDate(),
      };
    }
    const sortOrder = sort === 'latest' ? -1 : 1;
    const users = await User.find(query).sort({ time_of_registration: sortOrder });
    res.json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
