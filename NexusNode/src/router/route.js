import { main } from "../controllers/mainPage.js";
import { fetchMessage } from "../controllers/privateMessage.js";
import { changePassword } from "../controllers/users.js";
import express from "express";
import {
  logout,
  userExists,
  createUser,
  checkCredentials,
  signup,
  login,
} from "../Authentication/auth.js";

let router = express.Router();

router.route("/").get(userExists, main);
router.route("/loginPage").get(userExists, login);
router.route("/signup").get(userExists, signup);
router.route("/checkCredentials").post(userExists, checkCredentials);
router.route("/createUser").post(userExists, createUser);
router.route("/logout").post(userExists, logout);
router.route("/fetchMessages").post(userExists, fetchMessage);
router.route("/queryusername").post(userExists, main);
router.route("/account").get(userExists, (req, res) => {
  if (req.isAuthenticated)
    res.render("account.ejs", { username: req.session.user });
  else res.redirect("/");
});
router.route("/changePassword").post(userExists, changePassword);
export default router;
