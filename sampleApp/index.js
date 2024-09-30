// import hello from "./src/controllers/sam1.js";
import conn from "./src/data/db.js";
import express from "express";
import env from "dotenv";
env.config();

let app = express();
let db = conn();
app.get("/", (req, res) => {
  res.send("<h1> HELLO BUDDY I HOPE YOU ARE FINE </h1>");
});
app.get("/next", async (req, res) => {
  //   res.send(hello());
  try {
    let result = await (await db)
      .collection("usercredentials")
      .find()
      .toArray();
    console.log(result);

    if (result) {
      res.json(result);
    } else {
      res.send("False");
    }
  } catch (error) {
    res.send("error occured", error.message);
  }
});

app.listen(process.env.PORT);
