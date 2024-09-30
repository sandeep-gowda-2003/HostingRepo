import { getUsersList } from "./users.js";

async function main(req, res) {
  if (!req.isAuthenticated) res.redirect("/loginPage");
  else {
    let users = await getUsersList(req.session.user);

    if (req.body.queryuser) {
      users = users.filter((e) => {
        if (
          e.username
            .toLowerCase()
            .startsWith(req.body.queryuser.trim().toLowerCase())
        )
          return e;
      });
    }
    // fetch all the messages
    let messages = req.session.messages || [];

    res.render("chatPage.ejs", {
      username: req.session.user,
      users: users || [],
      messages: messages,
    });
  }
}

export { main };
