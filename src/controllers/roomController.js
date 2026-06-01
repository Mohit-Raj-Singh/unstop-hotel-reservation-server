const Room = require('../models/Room');
const { findOptimalRooms } = require('../services/bookingService');

const getAllRooms = async (req, res) => {
  const rooms = await Room.find().sort({ floor: 1, position: 1 });
  res.json(rooms);
};

const bookRooms = async (req, res) => {
  const { count } = req.body;

  if (!count || count < 1 || count > 5) {
    return res.status(400).json({ message: 'Room count must be between 1 and 5.' });
  }

  // Reset any previously "booked" rooms to "occupied" to stabilize state
  await Room.updateMany({ status: 'booked' }, { status: 'occupied', isOccupied: true });

  const availableRooms = await Room.find({ status: 'available' }).sort({ floor: 1, position: 1 });

  const result = findOptimalRooms(availableRooms, count);
  if (!result) {
    return res.status(400).json({ message: 'Not enough rooms available.' });
  }

  const roomIds = result.rooms.map((r) => r._id);
  await Room.updateMany({ _id: { $in: roomIds } }, { status: 'booked', isOccupied: true });

  const bookedRooms = await Room.find({ _id: { $in: roomIds } }).sort({ floor: 1, position: 1 });

  res.json({ bookedRooms, travelTime: result.travelTime });
};

const randomOccupancy = async (req, res) => {
  // Reset all first
  await Room.updateMany({}, { status: 'available', isOccupied: false });

  const allRooms = await Room.find();
  const shuffled = allRooms.sort(() => Math.random() - 0.5);
  const occupyCount = Math.floor(Math.random() * 30) + 20; // 20–50 rooms
  const toOccupy = shuffled.slice(0, occupyCount).map((r) => r._id);

  await Room.updateMany({ _id: { $in: toOccupy } }, { status: 'occupied', isOccupied: true });

  const rooms = await Room.find().sort({ floor: 1, position: 1 });
  res.json(rooms);
};

const resetBookings = async (req, res) => {
  await Room.updateMany({}, { status: 'available', isOccupied: false });
  const rooms = await Room.find().sort({ floor: 1, position: 1 });
  res.json(rooms);
};

const seedRooms = async (req, res) => {
  const count = await Room.countDocuments();
  if (count === 97) {
    return res.json({ message: 'DB already seeded with 97 rooms.' });
  }

  await Room.deleteMany({});
  const rooms = [];

  for (let floor = 1; floor <= 9; floor++) {
    for (let pos = 1; pos <= 10; pos++) {
      const roomNumber = floor * 100 + pos;
      rooms.push({ roomNumber, floor, position: pos, isOccupied: false, status: 'available' });
    }
  }

  // Floor 10: rooms 1001–1007
  for (let pos = 1; pos <= 7; pos++) {
    rooms.push({ roomNumber: 1000 + pos, floor: 10, position: pos, isOccupied: false, status: 'available' });
  }

  await Room.insertMany(rooms);
  res.json({ message: `Seeded ${rooms.length} rooms successfully.` });
};

module.exports = { getAllRooms, bookRooms, randomOccupancy, resetBookings, seedRooms };
