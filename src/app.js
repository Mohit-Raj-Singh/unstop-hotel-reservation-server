const express = require('express');
const cors = require('cors');
const roomRoutes = require('./routes/roomRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/rooms', roomRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
