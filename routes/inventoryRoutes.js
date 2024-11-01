const express = require('express');
const Inventory = require('../models/Inventory');
const router = express.Router();

// Create Inventory
router.post('/create', async (req, res) => {
  try {
    const inventory = new Inventory(req.body);
    await inventory.save();
    res.status(201).json({ message: 'Inventory created successfully', inventory });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Edit Inventory
router.put('/edit/:id', async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!inventory) return res.status(404).json({ message: 'Inventory not found' });
    res.json({ message: 'Inventory updated successfully', inventory });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete Inventory
router.delete('/delete/:id', async (req, res) => {
  try {
    const inventory = await Inventory.findByIdAndDelete(req.params.id);
    if (!inventory) return res.status(404).json({ message: 'Inventory not found' });
    res.json({ message: 'Inventory deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
