import express from "express";
// import env from "dotenv";
// env.config();

let app = express();

app.get("/", (req, res) => {
  res.send("<h1> HELLO BUDDY I HOPE YOU ARE FINE </h1>");
});
app.get("/next", (req, res) => {
  res.json({ name: "sandeep", age: 21 });
});

app.listen(process.env.PORT);
