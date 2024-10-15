const express = require("express");
const bodyParser = require("body-parser");
const flashMessages = require("connect-flash");
const sessions = require("express-session");
const mongoose = require("mongoose");
const { Citizen } = require("./models/Citizen");
const { Message } = require("./models/Message");
const bcrypt = require("bcryptjs");
const PORT = 3300; // the port where our server will be running

// instantiating express
const app = express();
const httpServer = require("http").Server(app);
const socketIO = require("socket.io")(httpServer);
app.use(express.static("public")); // points to where the static files are.

// setting up the session
app.use(
  sessions({
    secret: "esn2024",
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flashMessages());
// setting up a middleware to send all flash messages
app.use(function (request, response, next) {
  response.locals.message = request.flash();
  next();
});

// set up the body-parser utility
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// setting the templating engine
app.set("view engine", "ejs");

// connecting to the database
const dbUrl =
  "mongodb+srv://gkasaazi:6nhq1kidDxCiynU1@cluster0.9px3e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// mongoose.connect(dbUrl, (err) => {
//   if (err) console.log(`Couldn't connect to MongoDB\n${err}`);
//   else console.log("Successfully connected to MongoDB");
// });
// mongoose.connect()
try {
  mongoose.connect(dbUrl);
  console.log("Successfully connected to MongoDB");
} catch (error) {
  // handleError(error);
  console.log(`Couldn't connect to MongoDB\n${error}`);
}

// creating global variables for easy access to the data they hold
var session, uname;
// loading the login page
app.get("/", (request, response) => {
  response.render("login");
});

// loading the register page
app.get("/register", (request, response) => {
  response.render("register");
});

// registering a user
app.post("/userRegister", (request, response) => {
  // getting the data from the user
  let email = request.body.email;
  let fullname = request.body.fullname;
  let pswd = request.body.password;
  let cpswd = request.body.confirmpassword;

  if (pswd != cpswd) {
    request.flash("error", "Entered passwords do not match! Please try again.");
    response.redirect("/register");
  } else {
    // request.flash("success", "This is the next thing on the agenda.");
    // response.redirect("/register");
    // testing that the account does not exist
    Citizen.findOne({ username: email }).then((user) => {
      if (user) {
        request.flash(
          "error",
          `${user.fullname} already exists! Please try again!`
        );
        response.redirect("/register");
      } else {
        // creating the account
        // encrypt the password
        bcrypt.hash(pswd, 10, async (err, hashedPassword) => {
          if (err) {
            request.flash("error", `Error while hashing the password ${err}!`);
            response.redirect("/register");
          } else {
            // create a model to save the data
            let citizen = new Citizen({
              username: email,
              fullname: fullname,
              password: hashedPassword,
            });
            // saving the data
            await citizen.save();
            request.flash(
              "success",
              `${fullname} successfully added to the system.\nPlease login with your new credentials.`
            );
            response.redirect("/");
          }
        });
      }
    });
  }
});

// logging in a user
app.post("/processLogin", (request, response) => {
  // getting the data from the user
  let email = request.body.email;
  let pswd = request.body.password;
  if (email === "") {
    request.flash("error", "The email field must be filled! Please try again.");
    response.redirect("/");
  }
  if (pswd === "") {
    request.flash(
      "error",
      "The password field must be filled too! Please try again."
    );
    response.redirect("/");
  }
  // check if the user exists
  Citizen.findOne({ username: email })
    .then((userInfo) => {
      if (userInfo) {
        // the user exists, check the password
        const hashedPassword = userInfo.password;
        bcrypt.compare(pswd, hashedPassword).then((result) => {
          if (result) {
            session = request.session;
            session.uid = userInfo.username;
            session.fname = userInfo.fullname;
            uname = userInfo.fullname;
            // request.flash("success", "You have logged in successfully.");
            response.redirect("/home");
          } else {
            request.flash("error", "Invalid Username/Password combination!");
            response.redirect("/");
          }
        });
      } else {
        request.flash("error", "Citizen not found in the system!");
        response.redirect("/");
      }
    })
    .catch((err) => {
      request.flash("error", `Error while logging in! \n${err}`);
      response.redirect("/");
    });
});

// loading the dashboard
app.get("/home", (request, response) => {
  if (session.uid && session.fname) {
    response.render("dashboard", {
      data: {
        userid: session.uid,
        fullname: session.fname,
      },
    });
  } else {
    response.redirect("/");
  }
});

//loading the chatroom
app.get("/chatroom", (request, response) => {
  session = request.session;
  // uname = request.session.fullname;
  if (session.uid && session.fname) {
    response.render("chatroom", {
      data: {
        userid: session.uid,
        fullname: session.fname,
      },
    });
  } else response.redirect("/");
});

// logging the user out
app.get("/logout", (request, response) => {
  request.session.destroy();
  session = "";
  response.redirect("/");
});

// saving the message to the database
app.post("/saveMessage", async (request, response) => {
  // create an object from the model
  var message = new Message(request.body);
  await message.save();
  // emit an event to the front end for displaying a sent message
  socketIO.emit("message", message);
  response.sendStatus(200);
});

// fetching the messages from the database
app.get("/fetchMessages", async (request, response) => {
  await Message.find({}).then((messages) => {
    if (messages) response.send(messages);
    else console.log(`Error while fetching messages!`);
  });
});

// receiving and emit a message when a user joins the chat
socketIO.on("connection", (socket) => {
  socketIO.emit("joined", uname);
  console.log(`${uname} has joined the chat.`);
});
// listen for incoming connections
httpServer.listen(PORT, () => {
  console.log(`The server is up and running on port ${PORT}`);
});

// Check if an administrator is logged in

const isAdminLoggedIn = true; 

// Placeholder, to be validated through server authentication

if (!isAdminLoggedIn) {
  alert('Access Denied! Only administrators can edit profiles.');

  // Redirect to login page or home page
  
  window.location.href = '/login';
}

// Fetch user data 
const user = {
  username: 'ESNAdmin',
  password: 'admin',
  email: 'mseddie5@gmail.com',
  priviledge: 'Administrator'
};

// Populate the form with existing user data
document.getElementById('username').value = user.username;
document.getElementById('password').value = user.password;
document.getElementById('email').value = user.email;
document.getElementById('priviledge').value = user.role;

// Handle form submission for profile update
document.getElementById('userProfileForm').addEventListener('submit', function (event) {
  event.preventDefault();

  // Collect updated data
  const updatedUser = {
    username: user.username,
    password: user.password,
    email: document.getElementById('email').value,
    role: document.getElementById('role').value
  }
}
  //validate fields by rules

  if(!username.match(/^[a-zA-Z0-9]+$/)) {
    alert("invalid username. please follow the username rules.");
    return;
  }
  {if(password && password.length<6) {
    alert("password must be at least 6 characters long");
    return;
  }
  // Send the updated data to the server or simulating server update 

  updateUserProfile(username, accountStatus, priviledgeRole, password)
<<<<<<< HEAD
  .then(response => {
    if (response.success) {
      document.getElementById('message').textContent = "User profile updated successfully!";
    } else {
      document.getElementById('message').textContent = "Error updating profile!";
    }
  })
  .catch(error => {
    console.error("Error updating profile:", error);
    document.getElementById('message').textContent = "An unexpected error occurred.";
  });

=======
    .then(response => {
      if (response.success) {
        document.getElementById('message').textContent="User profile updated successfully!";
      } else {
        ocument.getElementById('message').textContent="Error updating profile!";
    })
    .catch(error => {
      console.error('Error updating profile:', error);
    })
});
>>>>>>> 6e1db58f6bca5d1beeb2908daea2e0346b993565

// Server update function for sending updated user profile data

function updateUserProfile(username, accountStatus, priviledgeRole, password) {
  return new Promise((resolve, reject) => {
    // Simulate async operation, e.g., API call to update the profile
    const isSuccess = true; // Replace with actual condition

    if (isSuccess) {
      resolve({ success: true });
    } else {
      reject(new Error("Profile update failed"));
    }
  });
}


// Check if a user has 'Coordinator' privilege
const userPrivilege = 'coordinator';

// Placeholder

if (userPrivilege !== 'coordinator') {
  alert("Access denied. Only Coordinators can post announcements.");
  window.location.href = '/login.html';

  // Redirect to login if not a Coordinator
}
// Loading existing announcements

const announcements = [
  { text: 'Welcome to the ESN community portal!', author: 'Admin', timestamp: new Date().toLocaleString() }
];
displayAnnouncements();

// Handle announcement submission

document.getElementById('announcementForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const announcementText = document.getElementById('announcement').value;
  if (!announcementText.trim()) {
    alert("Announcement cannot be empty.");
    return;
  }

  // Posting a new announcement

  postAnnouncement(announcementText)
    .then(response => {
      if (response.success) {
        document.getElementById('message').textContent = "Announcement posted.";
        displayAnnouncements();
      } else {
        document.getElementById('message').textContent = "Error posting announcement.";
      }
    });
});
// Function to display 

function displayAnnouncements() {
  const list = document.getElementById('announcementsList');
  list.innerHTML = ''; 
  
  // Clear existing list

  announcements.forEach(a => {
    const li = document.createElement('li');
    li.textContent = `${a.text} - ${a.author} (${a.timestamp})`;
    list.appendChild(li);
  });
}

// Function to post an announcement
function postAnnouncement(text) {
  return new Promise((resolve) => {
    const newAnnouncement = {
      text: text,
      author: 'Coordinator',
      timestamp: new Date().toLocaleString()
    };
    announcements.push(newAnnouncement);
    resolve({ success: true });
  }); // Make sure this is closed
} // Ensure the function is closed properly

