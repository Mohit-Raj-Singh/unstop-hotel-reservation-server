const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema(
  {
    roomNumber: { type: Number, required: true, unique: true },
    floor: { type: Number, required: true },
    position: { type: Number, required: true },
    isOccupied: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['available', 'occupied', 'booked'],
      default: 'available',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Room', roomSchema);
