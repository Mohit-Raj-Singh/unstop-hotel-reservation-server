const express = require('express');
const router = express.Router();
const {
  getAllRooms,
  bookRooms,
  randomOccupancy,
  resetBookings,
  seedRooms,
} = require('../controllers/roomController');

router.get('/', getAllRooms);
router.post('/book', bookRooms);
router.post('/random', randomOccupancy);
router.post('/reset', resetBookings);
router.post('/seed', seedRooms);

module.exports = router;
