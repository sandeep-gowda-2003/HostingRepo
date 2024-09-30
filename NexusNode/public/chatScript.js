let username = ejsData.username;
let SendToUser;
let messages;

const notificationSount = new Audio("/resources/tap-notification.mp3");

//connecting to server socket.io on startup
const socket = io({
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  auth: {
    username: username,
  },
});

//render the name of the recent user interacted person incase of refresh
if (sessionStorage.getItem("SendToUser")) {
  SendToUser = sessionStorage.getItem("SendToUser");
  document.querySelector(".chattingUser").innerHTML = SendToUser;
  fetchMessageOnRefresh(SendToUser);
  async function fetchMessageOnRefresh(SendToUser) {
    await fetch_message(SendToUser);
  }
} else {
  document.querySelector(".chattingUser").innerHTML = "select user";
}

//Add click event to the list of users friends
userElementAddClickEvent();

//function to add click event
function userElementAddClickEvent() {
  let users = document.querySelectorAll(".userelement");
  users.forEach((e) => {
    e.addEventListener("click", async (e) => {
      sessionStorage.setItem(
        "SendToUser",
        e.currentTarget.attributes.name.value
      );
      SendToUser = e.currentTarget.attributes.name.value;

      //if there are any notification on turn it off on click
      e.currentTarget.querySelector(".notification").style.display = "none";

      await fetch_message(e.currentTarget.attributes.name.value);

      //  for mobile user interaction to make this responsive
      if (
        getComputedStyle(document.querySelector(".right")).display == "none"
      ) {
        document.querySelector(".userfriends").style.display = "none";
        document.querySelector(".right").style.display = "block";
        document.querySelector(".back").style.display = "block";
        messages.scrollTo(0, messages.scrollHeight);
      }
    });
  });
}

//add click event to send icon in input field to send message
sendIconEvent();

//function to fetch all the conversations between two users
async function fetch_message(friendName) {
  return new Promise((resolve, reject) => {
    fetch("/fetchMessages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fname: friendName,
      }),
    })
      .then((res) => {
        if (!res.ok) console.error("Network error");
        else {
          return res.text();
        }
      })
      .then((data) => {
        //use templorary variable to store and extract only the chatting part of html and render it instead of whole page
        let temp = document.createElement("div");
        temp.innerHTML = data;
        document.querySelector(".right").innerHTML =
          temp.querySelector(".right").innerHTML;
        let interactingUser = document.querySelector(".chattingUser");
        interactingUser.innerText = SendToUser;

        //add click event to send icon in input field for every newly rendered part of the page
        sendIconEvent();
        // similarly add this to the page for mobile user interaction
        document.querySelector(".back").addEventListener("click", mobileBack);

        //scroll to the end of the chat section
        messages = document.querySelector(".messages");
        messages.scrollTo(0, messages.scrollHeight);

        return resolve();
      })
      .catch((e) => {
        console.log(e);
        reject(e);
      });
  });
}

// to scroll the chat page to the end whenever refreshed
messages = document.querySelector(".messages");
messages.scrollTo(0, messages.scrollHeight);

// console.log("attemtping to connect!!", username);

//to send message whenever the enter key is pressed
document.addEventListener("keydown", (e) => {
  if (e.key == "Enter") {
    sendMessage();
  }
});

// send message function
async function sendMessage() {
  let messageClient = document.createElement("li");

  let message = document.createElement("div");

  message.classList.add("client");

  let input = document.querySelector("#messageinput");
  if (input.value) {
    messageClient.innerText = input.value;

    message.appendChild(messageClient);

    messages.appendChild(message);

    if (SendToUser) {
      //emit events
      socket.emit("message", input.value, SendToUser);
      messages.scrollTo(0, messages.scrollHeight);
      input.value = "";
    }
  }
}

// on any message from other users
socket.on("message", (r, sendername) => {
  // append if user is on same sender's chat section or show notification
  if (sendername == SendToUser) {
    let messageClient = document.createElement("li");

    let message = document.createElement("div");

    message.classList.add("server");

    messageClient.innerText = r;

    message.appendChild(messageClient);

    messages.appendChild(message);

    messages.scrollTo(0, messages.scrollHeight);
  } else {
    document.querySelectorAll(".userelement").forEach((e) => {
      if (e.attributes.name.value === sendername) {
        e.querySelector(".notification").style.display = "block";
        notificationSount.play();
      }
    });
  }
});

socket.on("activeUsers", (activeUsers) => {
  let elements = document.querySelectorAll(".userelement");
  elements.forEach((e) => {
    if (Object.keys(activeUsers).includes(e.attributes.name.value)) {
      e.style.backgroundColor = "#7fde92";
    }
  });
});
socket.on("deactivateUsers", (deactivateUsername) => {
  let elements = document.querySelectorAll(".userelement");
  elements.forEach((e) => {
    if (deactivateUsername === e.attributes.name.value) {
      e.style.backgroundColor = "rgb(200, 199, 197)";
    }
  });
});

// on disconnectSocket deleter the session storage  and this will be called when user logs out from the page
function disconnectSocket() {
  socket.emit("disconnectUser");
}
socket.on("disconnect", () => {
  sessionStorage.removeItem("SendToUser");
  console.log("disconnected socket");
});

// function  for back button in mobile user interaction
function mobileBack() {
  if (
    getComputedStyle(document.querySelector(".userfriends")).display == "none"
  ) {
    document.querySelector(".userfriends").style.display = "block";
    document.querySelector(".right").style.display = "none";
    document.querySelector(".back").style.display = "none";
  }
}

// function for adding event on send icon
function sendIconEvent() {
  document.querySelector(".sendIcon").addEventListener("click", sendMessage);
}

async function queryUsername(e) {
  await fetchQueriedUser(document.querySelector("#searchUser").value);
}

async function fetchQueriedUser(queryName) {
  return new Promise((resolve, reject) => {
    fetch("/queryusername", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        queryuser: queryName,
      }),
    })
      .then((res) => {
        if (!res.ok) console.error("Network error");
        else {
          return res.text();
        }
      })
      .then((data) => {
        let temp = document.createElement("div");
        temp.innerHTML = data;
        document.querySelector(".userfriends>div").innerHTML =
          temp.querySelector(".userfriends>div").innerHTML;
        userElementAddClickEvent();
        socket.emit("refreshActiveUsers");
        return resolve();
      })
      .catch((e) => {
        console.log(e);
        reject(e);
      });
  });
}
