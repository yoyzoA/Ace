const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const seedProducts = require('./data/seedProducts');

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Product.deleteMany({});
    await Product.insertMany(seedProducts);
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Failed to seed database', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
};

seedDatabase();
