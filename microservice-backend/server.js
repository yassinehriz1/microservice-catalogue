require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/products', productRoutes);

mongoose.connect("mongodb://admin:pass@mongodb-statefulset-0.mongo-service:27017,mongodb-statefulset-1.mongo-service:27017/catalogue?replicaSet=rs0&authSource=admin")
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection failed:', err));

app.listen(process.env.PORT, () => {
  console.log(`🚀 Catalogue service running on port ${process.env.PORT}`);
});
