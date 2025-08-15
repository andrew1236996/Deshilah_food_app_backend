const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const foodRoutes = require('./Routes/foodRoutes');



dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const PORT = process.env.PORT || 5000;
connectDB();

app.use("/api/food", foodRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});