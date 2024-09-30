import conn from "../data/db.js";
import crypto from "crypto";
import env from "dotenv";

let db = conn();

env.config();
const algorithm = "aes-256-cbc";

const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex"); // Encryption key (store securely)

function encrypt(text) {
  const iv = crypto.randomBytes(16); // Initialization vector
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { iv: iv.toString("hex"), encryptedData: encrypted };
}

function decrypt(encryptedData, ivHex) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(ivHex, "hex")
  );
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

async function pushMessage(fromUser, toUser, message) {
  if (fromUser && toUser && message) {
    let { iv, encryptedData } = encrypt(message);
    try {
      let result = (await db).collection("messagedata").insertOne({
        from_user: fromUser,
        to_user: toUser,
        message: encryptedData,
        initial_vector: iv,
      });

      if (result) {
      } else {
        console.log("message was not saved");
      }
    } catch (error) {
      console.error("error", error);
    }
  }
}

async function fetchMessage(req, res) {
  if (req.isAuthenticated) {
    let fromUser = req.session.user;
    let toUser = req.body.fname;

    if (fromUser && toUser) {
      try {
        let result = await (
          await db
        )
          .collection("messagedata")
          .find({
            from_user: { $in: [fromUser, toUser] },
            to_user: { $in: [fromUser, toUser] },
          })
          .sort({ _id: 1 })
          .toArray();
        result = result.map((element) => {
          element["message"] = decrypt(
            element["message"],
            element["initial_vector"]
          );
          delete element["initial_vector"];
          return element;
        });
        req.session.messages = result;
        res.redirect("/");
      } catch (error) {
        console.log("error occurred!!!");
        res.redirect("/");
      }
    }
  }
}

// use it if needed for showing notification by creating notification column
// function notificationStatus(toUser) {
//   db.query(
//     "SELECT from_user FROM messagedata where to_user =? AND notification_status = 1  ORDER BY id",
//     [toUser],
//     (err, result) => {
//       if (err) console.log(err);
//       else {
//         console.log("result of notification", result);
//         return result;
//       }
//     }
//   );
// }

export { pushMessage, fetchMessage };

// ||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||\\\\\\\

//without encryption and decryption
// import db from "../data/db.js";

// function pushMessage(fromUser, toUser, message) {
//   if (fromUser && toUser && message) {
//     db.query(
//       "INSERT INTO messagedata(from_user,to_user,message) values(?,?,?)",
//       [fromUser, toUser, message],
//       (err, res) => {
//         if (err) console.log(err);
//         else {
//           console.log("message saved successfully");
//         }
//       }
//     );
//   }
// }

// function fetchMessage(req, res) {
//   if (req.isAuthenticated) {
//     let fromUser = req.session.user;
//     let toUser = req.body.fname;
//     console.log(fromUser, " => ", toUser);

//     if (fromUser && toUser) {
//       db.query(
//         "SELECT * FROM messagedata where from_user IN (?,?) AND to_user IN (?,?) ORDER BY id",
//         [fromUser, toUser, fromUser, toUser],
//         (err, result) => {
//           if (err) console.log(err);
//           else {
//             req.session.messages = result;
//             console.log("fetch", req.session.messages);
//             res.redirect("/");
//           }
//         }
//       );
//     }
//   }
// }

// export { pushMessage, fetchMessage };
