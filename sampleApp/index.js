import conn from "./src/data/db";
import express from "express";
// import env from "dotenv";
// env.config();

let app = express();
let db = conn();
connectToDatabase.app.get("/", (req, res) => {
  res.send("<h1> HELLO BUDDY I HOPE YOU ARE FINE </h1>");
});
app.get("/next", async (req, res) => {
  res.json(await (await db).collection("usercredentials").find());
});

app.listen(process.env.PORT);
