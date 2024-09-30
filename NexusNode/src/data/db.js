// import mysql from "mysql2";
// import env from "dotenv";

// env.config();

// let conn = mysql.createConnection({
//   user: process.env.DBUSER,
//   password: process.env.DBPASSWORD,
//   port: process.env.DBPORT,
//   database: process.env.DBDATABASE,
// });

// export default conn;

import { MongoClient } from "mongodb";

// Replace the uri string with your connection string.
const uri = process.env.URI;
const dbName = "nexus";
async function connectToDatabase() {
  try {
    const client = new MongoClient(uri);
    await client.connect();

    // Select the database
    let dbConnection = client.db(dbName);
    console.log(`Connected to database: ${dbName}`);

    return dbConnection;
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}
export default connectToDatabase;
