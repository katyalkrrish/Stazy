if(process.env.NODE_ENV!="production"){
require('dotenv').config({ path: '../.env' });
}
const mongoose= require("mongoose");
const initData= require("./data.js");
const listing = require ("../models/listing.js");
const MONGO_URL = process.env.ALTLASDB_URL ;




main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await listing.deleteMany({});
  initData.data = initData.data.map((obj) => ({ ...obj, owner: "6893c7dd3eb080083ebae42e"}));
  await listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();