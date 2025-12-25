// import { MongoClient } from "mongodb";

// const url = "mongodb+srv://nitin:nitin@cluster0.kbnly1e.mongodb.net/";
// // const url = "mongodb://localhost:27017"
// const dbName = "t10exchange";

// let client;

// export async function connect() {
//   if (!client) {
//     client = new MongoClient(url,{ serverSelectionTimeoutMS: 10000});
//     await client.connect();
//     console.log("✅ Connected to MongoDB");
//   }
//   return client.db(dbName);
// }

import { MongoClient } from "mongodb";
const url = "mongodb+srv://nitin:nitin@cluster0.kbnly1e.mongodb.net/t10casino";
const dbName = "t10casino";
let _db;

export const MongoConnect = async (callback) => {
  try{
 const client = await MongoClient.connect(url,{useUnifiedTopology: true})
    console.log(`connected to db ${dbName} `)
    _db = client.db(dbName);
    callback()
  }catch(err){
    console.log("connection failed to DB",err)
    throw err;
  }
}

export const getDb = () => {
  if(!_db){
    throw "No database found"
  }
  return _db;
}   