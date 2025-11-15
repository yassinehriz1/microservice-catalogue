require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/products', productRoutes);

mongoose.connect("mongodb://admin:pass@mongo-service:27017/mydb?authSource=admin")
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection failed:', err));

app.listen(process.env.PORT, () => {
  console.log(`🚀 Catalogue service running on port ${process.env.PORT}`);
});
