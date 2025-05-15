const mongoose= require("mongoose");
const initData= require("./data.js");
const listing = require ("../models/listing.js");
const MONGO_URL = "mongodb+srv://katyalkrrish:PjLWZtC93IKNZO3y@cluster0.irbeqgw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

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
  await listing.insertMany(initData.data);
  console.log("data was initialized");
};

initDB();