import conn from "../data/db.js";
import { comparePassword, passwordReplace } from "../Authentication/auth.js";

let db = conn();

function getUsersList(currentUser) {
  return new Promise(async (resolve, reject) => {
    try {
      let result = await (
        await db
      )
        .collection("usercredentials")
        .find(
          { username: { $ne: currentUser } },
          { projection: { username: 1, _id: 0 } }
        )
        .toArray();
      resolve(result);
    } catch (error) {
      console.error("error: ", error);
      reject(error);
    }
  });
}

async function changePassword(req, res) {
  if (req.isAuthenticated) {
    let old = req.body.currentPassword;
    let password = req.body.newPassword;

    try {
      let result = await comparePassword(old, req.session.user);
      if (result) {
        try {
          result = await passwordReplace(req.session.user, password);
          if (result) {
            res.redirect("/");
          }
        } catch (error) {
          console.log("error", error.message);
          res.render("account.ejs", {
            message: "failed to change password",
            username: req.session.user,
          });
        }
      }
    } catch (error) {
      console.log("Password incorrect", error.message);
      res.render("account.ejs", {
        message: "wrong password",
        username: req.session.user,
      });
    }
  }
}

export { getUsersList, changePassword };
