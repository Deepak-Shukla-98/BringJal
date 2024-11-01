const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const Inventory = require('../models/Inventory');

const router = express.Router();
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

const permute = (arr) => {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (let perm of permute(remaining)) {
      result.push([current, ...perm]);
    }
  }
  return result;
};

router.get('/shortest_path', async (req, res) => {
  try {
    const users = await User.find();
    const inventories = await Inventory.find();

    if (inventories.length < 2) {
      return res.status(400).json({ error: 'At least two inventories are required' });
    }

    const destinations = users.map(
      user => `${user.coordinates.latitude},${user.coordinates.longitude}`
    );

    const origin = `${inventories[0].coordinates.latitude},${inventories[0].coordinates.longitude}`;
    const finalDestination = `${inventories[1].coordinates.latitude},${inventories[1].coordinates.longitude}`;

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${destinations.join('|')}|${finalDestination}&key=${GOOGLE_API_KEY}`;

    const response = await axios.get(url);
    const distanceData = response.data;

    // Parse distances from API response
    const distances = distanceData.rows[0].elements.map((element, index) => ({
      destinationIndex: index,
      distance: element.distance.value,
      duration: element.duration.value
    }));

    // Permute user destinations to find the shortest route
    const userDestinations = distances.slice(0, -1);
    const destinationPermutations = permute(userDestinations);

    let shortestDistance = Infinity;
    let shortestRoute = [];

    // Calculate the distance for each route permutation
    for (const perm of destinationPermutations) {
      let totalDistance = 0;
      let currentLocation = origin;

      for (const stop of perm) {
        totalDistance += stop.distance;
        currentLocation = destinations[stop.destinationIndex];
      }

      // Add distance to the final destination
      totalDistance += distances[distances.length - 1].distance;

      if (totalDistance < shortestDistance) {
        shortestDistance = totalDistance;
        shortestRoute = perm.map(stop => ({
          user: users[stop.destinationIndex].name,
          coordinates: destinations[stop.destinationIndex],
          distance: stop.distance,
          duration: stop.duration
        }));
      }
    }

    // Append final destination to the shortest route
    shortestRoute.push({
      finalDestination: finalDestination,
      distance: distances[distances.length - 1].distance,
      duration: distances[distances.length - 1].duration
    });

    // Respond with the shortest route and total distance
    res.json({
      origin,
      shortestRoute,
      totalDistance: shortestDistance
    });
  } catch (error) {
    console.error("Error fetching distance data:", error.message);
    res.status(500).json({ error: 'Failed to fetch distance data' });
  }
});

module.exports = router;
