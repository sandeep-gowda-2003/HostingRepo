import conn from "../data/db.js";
import bcrypt from "bcrypt";

let db = conn();

const saltRounds = 10;
let message = "";
//authenticates if user exists
function userExists(req, res, next) {
  if (req.session.user) {
    req.isAuthenticated = true;
  } else {
    req.isAuthenticated = false;
  }
  next();
}

//logout
function logout(req, res) {
  if (req.isAuthenticated) {
    req.session.destroy((err) => {
      if (err) console.log(err);
    });
  }
  res.redirect("/");
}

//register new user
async function createUser(req, res) {
  if (req.body.username === "") {
    req.body.username = req.body.email;
  }
  let password = req.body.password;
  let temp = await (
    await db
  )
    .collection("usercredentials")
    .find({
      $or: [{ username: req.body.username }, { email: req.body.email }],
    })
    .toArray();
  console.log(temp);

  if (temp.length === 0) {
    await bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
        console.err("error hashing password", err);
      } else {
        try {
          let r = await (await db).collection("usercredentials").insertOne({
            username: req.body.username,
            email: req.body.email,
            password: hash,
          });
          res.redirect("/");
        } catch (error) {
          console.log("error occured", error);
          req.message = "user did not register";
          res.redirect("/signup");
        }
      }
    });
  } else {
    message = "username or email already exists";

    res.redirect("/signup");
  }
}

//login verification
async function checkCredentials(req, res) {
  try {
    let result = await (await db)
      .collection("usercredentials")
      .findOne({
        $or: [{ username: req.body.username }, { email: req.body.username }],
      });
    if (!result) {
      message = "USER DOES NOT EXIST";
      res.redirect("/");
    } else {
      bcrypt.compare(req.body.password, result["password"], (error, r) => {
        if (error) {
          message = "SERVER ERROR";
          res.redirect("/");
        }
        if (r) {
          req.session.user = result.username;
          res.redirect("/");
        } else {
          message = "INCORRECT PASSWORD";
          res.redirect("/");
        }
      });
    }
  } catch (error) {
    console.log("something went wrong try again!!");
    message = "PLEASE TRY AGAIN";
    res.redirect("/");
  }
}

// route for signup
function signup(req, res) {
  res.render("signUp.ejs", { message: message });
  message = "";
}
// route for LOGIN
function login(req, res) {
  res.render("login.ejs", { message: message });
  message = "";
}

//This is function is used to check if the old password in change password is valid
async function comparePassword(password, username) {
  return new Promise(async (resolve, reject) => {
    try {
      let result = await (await db)
        .collection("usercredentials")
        .findOne({ username: username });
      if (!result) {
        reject(false);
      } else {
        bcrypt.compare(password, result["password"], (error, r) => {
          if (error) {
            reject(false);
          } else if (r) {
            resolve(true);
          } else {
            reject(false);
          }
        });
      }
    } catch (error) {
      console.log("something went wrong try again!!");
      reject(false);
    }
  });
}

//this function updates the new password
function passwordReplace(username, password) {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, async (err, hash) => {
      if (err) {
      } else {
        try {
          let r = await (await db)
            .collection("usercredentials")
            .updateOne({ username: username }, { $set: { password: hash } });
          if (r) resolve(true);
          else reject(false);
        } catch (error) {
          resolve(false);
        }
      }
    });
  });
}

export {
  logout,
  userExists,
  createUser,
  checkCredentials,
  signup,
  comparePassword,
  passwordReplace,
  login,
};
