const express = require('express');
const cors = require('cors')
const dotenv = require('dotenv')
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const shortest_path = require('./routes/pathRoutes')

dotenv.config()

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();
app.use(cors())
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/inventories', inventoryRoutes);
app.use('/api/path', shortest_path);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
