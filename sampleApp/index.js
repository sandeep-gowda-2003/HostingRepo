// AUTHENTICATION USING EXPRESS SESSION AND USER INFORMATION WILL BE STORED AT THE SERVER SIDE

import e from "express";
import session from "express-session";

let app = e();

app.use(e.urlencoded({ extended: true }));

// In express-session every time a request is made the middle ware checks if the session exists in its in memory if it is then creates req.sessionID and req.session.user Object for authentication purpose in server else it will create a new session id for every new request
app.use(
  session({
    secret: "MYSECRET",
    resave: false,
    saveUninitialized: false,
  })
);

app.get("/set-session", (req, res) => {
  console.log("INSIDE SET-SESSION");
  if (!req.session.user) {
    console.log("SESSION ID: ", req.sessionID);
    console.log("SESSION Store: ", req.sessionStore);
    console.log("SESSION: ", req.session);
    req.session.user = "sandeep Gowda";
    res.send("SESSION VARIABLE SET!!");
  } else {
    res.send("SESSION ALREADY EXISTS!!!");
  }
});

app.get("/get-session", (req, res) => {
  console.log("INSIDE GET-SESSION");
  if (req.session.user) {
    console.log("SESSION ID: ", req.headers.cookie);
    console.log("SESSION ID: ", req.sessionID);
    console.log("SESSION ID: ", req.sessionID);
    console.log("SESSION Store: ", req.sessionStore);
    console.log("SESSION: ", req.session);
    res.send(
      `SESSION VARIABLE : ${req.sessionID}  ${req.session.user}      ${req.headers.cookie}`
    );
  } else {
    res.send("Please set your session first");
  }
});

app.get("/destroy-session", (req, res) => {
  if (req.session.user) {
    req.session.destroy((err) => {
      if (err) return res.send("failed to destroy session");
      else return res.send(" session destroyed");
    });
  } else {
    res.send("Create you session first");
  }
});

app.listen(process.env.PORT);
