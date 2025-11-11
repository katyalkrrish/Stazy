require('dotenv').config();
const mongoose = require('mongoose');
const Listing = require('./models/listing');

const uri = process.env.ALTLASDB_URL;

(async function run() {
  if (!uri) {
    console.error('ALTLASDB_URL not set in .env');
    process.exit(1);
  }
  try {
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverSelectionTimeoutMS: 5000 });
    console.log('Connected to DB for dump');
    const count = await Listing.countDocuments();
    console.log('Listings count:', count);
    const docs = await Listing.find({}).limit(5).lean();
    console.log('First up to 5 listings:');
    console.dir(docs, { depth: 2, colors: true });
    await mongoose.disconnect();
  } catch (e) {
    console.error('Error querying DB:', e);
    process.exit(1);
  }
})();
