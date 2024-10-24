const express = require("express");
const bodyParser = require("body-parser");
const flashMessages = require("connect-flash");
const sessions = require("express-session");
const mongoose = require("mongoose"); 
const { Citizen } = require("./models/Citizen");
const { Message } = require("./models/Message");
const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and']); // Define your stop words
const {announcements} = require("./models/PublicAnnouncements");     // Import your model here
const bcrypt = require("bcryptjs");
const { title } = require("process");
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
    cookie:{secure:false}
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
// Middleware to parse URL-encoded data from incoming requests
// extended: true allows for nested objects to be parsed, using the qs library instead of the default querystring library
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
  // Debugging output
  console.log("Received email:", email);
  console.log("Received password:", pswd);
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

// Store typing timers for each socket
let typingTimers = {};

// Event for triggering user is typing
socketIO.on('connection', (socket)=>{
  /*from server side we will emit 'display' event once the user starts typing
  so that on the client side we can capture this event and display 
  '<data.user> is typing...' */
  
  socket.on('typing', (data) => {
    // If the user is typing
    if (data.typing === true) {
      socket.broadcast.emit('display', data);

      // If a timer exists for this user, clear it
      if (typingTimers[socket.id]) {
        clearTimeout(typingTimers[socket.id]);
      }

      // Start a new timer for 10 seconds
      typingTimers[socket.id] = setTimeout(() => {
        // Emit event to stop displaying 'is typing' after 10 seconds
        data.typing = false;
        //broadcast is a property of the socket object in Socket.IO. It allows you..
        //to send a message to all connected clients except the one that triggered the event.
        socket.broadcast.emit('display', data);
      }, 10000); // 10 seconds

    } else {
      // User stopped typing manually
      socket.broadcast.emit('display', data);

      // Clear the timer if the user manually stopped typing
      if (typingTimers[socket.id]) {
        clearTimeout(typingTimers[socket.id]);
        delete typingTimers[socket.id];
      }
    }
  });

  // Clear the timer when the socket disconnects
  socket.on('disconnect', () => {
    if (typingTimers[socket.id]) {
      clearTimeout(typingTimers[socket.id]);
      delete typingTimers[socket.id];
    }
  });
});



// Backend Code (Single Route for Search and Autocomplete):
// Search Route and autcomplete route




// handle the autocomplete logic directly within the existing search route. This way, the same route can 
// provide both search results and suggestions based on the input length or some other criteria.
app.post('/search', async (request, response) => {
  const searchCriteria = request.body.searchCriteria;

  // Check if searchCriteria is provided in the request body
  if (!searchCriteria) {
      return response.json({ success: false, message: 'No search criteria provided' });
  }

  // Determine if it's an autocomplete request (less than 3 characters triggers autocomplete)
  const isAutocomplete = searchCriteria.length < 3;

  let searchResults;

  // Handle autocomplete request
  if (isAutocomplete) {
      // Search citizens by fullname, username, or email (case-insensitive)
      searchResults = await Citizen.find({
          $or: [
              { fullname: new RegExp(searchCriteria, 'i') },
              { username: new RegExp(searchCriteria, 'i') },
              { email: new RegExp(searchCriteria, 'i') }
          ]
      }, 'fullname')  // Only retrieve 'fullname' field for autocomplete suggestions
      .limit(5)        // Limit results to 5 suggestions
      .exec();
      
      // Respond with suggestions if found
      if (searchResults.length > 0) {
          return response.json({ success: true, results: searchResults });
      } else {
          return response.json({ success: false, message: 'No suggestions found' });
      }
  }

  // For a full search (input 3 characters or more)
  searchResults = await Citizen.find({
      $or: [
          { fullname: new RegExp(searchCriteria, 'i') },  // Search by fullname (case-insensitive)
          { username: new RegExp(searchCriteria, 'i') },  // Search by username
          { email: new RegExp(searchCriteria, 'i') }      // Search by email
      ]
  }).exec();

  // If citizen records are found
  if (searchResults.length > 0) {
      // For each found citizen, also retrieve the last 10 messages they sent
      // Promise.all(...) Waits for all the asynchronous operations (finding messages for each citizen) to complete before proceeding. 
      // It ensures the code waits until the last message for the last citizen is retrieved.
      // searchResults.map(...) Iterates over each citizen in the 
      // searchResults array and runs the asynchronous function for each citizen to fetch their messages.
      const citizenWithMessages = await Promise.all(searchResults.map(async citizen => {
        // Message.find(...): This performs a query on the Message collection, looking for messages where 
        // the sender field matches the citizen.username.
          const messages = await Message.find({ sender: citizen.username })
                                      //sort({ sentTime: -1 }): Sorts the messages in descending order of 
                                      // sentTime, meaning the most recent messages appear first.
                                        .sort({ sentTime: -1 })  // Sort messages by latest
                                        .limit(10)               // Limit to the last 10 messages
                                        .exec();
                                         // Log each message with its sentTime

          return {
              citizen,  // The citizen's details
              messages  // The last 10 messages from that citizen
          };
      }));

      // Send both the citizen data and their messages
      response.json({ success: true, results: citizenWithMessages });
  } else {
      // No matching records found
      response.json({ success: false, message: 'No matching records found' });
  }
});

// Backend Code (Single Route for Search and Autocomplete):
// Search Route and autcomplete route
// handle the autocomplete logic directly within the existing search route. This way, the same route can 
// provide both search results and suggestions based on the input length or some other criteria.
app.post('/search', async (request, response) => {
  const searchCriteria = req.body.searchCriteria;

  // Check if searchCriteria is provided
  if (!searchCriteria) {
      return response.json({ success: false, message: 'No search criteria provided' });
  }

  // Search for a citizen by either fullname or username
  const citizen = await Citizen.findOne({
      $or: [
          { fullname: new RegExp(searchCriteria, 'i') },  // Search by fullname (case-insensitive)
          { username: new RegExp(searchCriteria, 'i') }   // Search by username (case-insensitive)
      ]
  }).exec();

  // If a citizen is found, fetch their messages
  if (citizen) {
      const searchFullname = citizen.fullname;  // We will use the citizen's fullname for message lookup

      // Fetch messages where sender matches the citizen's fullname
      const messages = await Message.find({
          sender: searchFullname  // Use fullname for message lookup
      }).exec();

      // Return the citizen's details along with their messages
      return res.json({
          success: true,
          results: [{
              username: citizen.username,
              fullname: citizen.fullname,
              status: citizen.status,
              statusLastUpdated: citizen.statusLastUpdated,
              messages: messages  // Attach the fetched messages array
          }]
      });
  } else {
      // If no citizen is found, return a no matching records response
      return res.json({ success: false, message: 'No matching records found' });
  }
});



// Route to handle status update
app.post('/status', async (request, response) => {
  try {
      // Access userEmail from the session (you can change this based on how you manage sessions)
      const userEmail = request.session.userEmail;  // Assuming you store the user's email in the session
      const { status } = request.body;  // Only get the status from the request body

      // Log to confirm if email and status are passed correctly
      console.log("Received email:", userEmail);
      console.log("Received status:", status);

      // Validate the status to ensure it is within the valid statuses
      const validStatuses = ['OK', 'Help', 'Emergency', 'Undefined'];
      if (!validStatuses.includes(status)) {
          return response.status(400).json({ success: false, message: 'Invalid status' });
      }

      // Update the citizen's status using their email as the filter
      const updatedCitizen = await Citizen.findOneAndUpdate(
          { email: userEmail },  // Use email to find the citizen in the database
          { status: status },    // Update the status field with the new value
          { new: true }          // Return the updated citizen object after the update
      );

      if (updatedCitizen) {
        // Extract the 'fullname' property from the updated citizen object
      // This will be used to include the full name in the success response message.  
          const fullName = updatedCitizen.fullname; 

          // Append the full name to the success message
          response.json({
              success: true,
              message: ` ${fullName} Your status is successfully updated`,  // Including full name in the message
              citizen: updatedCitizen  // Sending the updated citizen object in the response
          });
      } else {
          // If no citizen was found with the provided username
          response.status(404).json({ success: false, message: 'Citizen not found' });
      }
  } catch (error) {
      // Handling errors that may occur during the process
      console.error('Error updating status:', error);
      response.status(500).json({ success: false, message: 'Server error' });
  }
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

// loading the searchinfo page
/*app.get("/searchinfo", (request, response) => {
  session = request.session;
  // uname = request.session.fullname;
  if (session.uid && session.fname) {
    response.render("searchinfo", {
      data: {
        userid: session.uid,
        fullname: session.fname,
      },
    });
  } else response.redirect("/");
});
*/
app.get("/searchinfo", async (request, response) => {
  const session = request.session;

  // Ensure that the session is valid 
  if (session && session.uid && session.fname) {
      try {
          // Fetch announcements and users from your data source
          const announcements = await fetchPublicAnnouncements();
          const users = await fetchCitizen();

          // Check if announcements and users are defined
          console.log("Checking announcements and users...");
          console.log("Announcements:", announcements);
          console.log("Users:", users);

          if (!Array.isArray(announcements) || !Array.isArray(users)) {
              throw new Error("Announcements or users data is missing or not an array.");
          }

          // Render the searchinfo page with both announcements and users
          response.render("searchinfo", {
              data: {
                  userid: session.uid,
                  fullname: session.fname || "Guest", // Default to "Guest" if fname is undefined
              },
              announcements,
              users,
          });
      } catch (error) {
          console.error("Error rendering searchinfo:", error);
          response.status(500).send('Internal Server Error: ' + error.message);
      }
  } else {
      console.log("Redirecting to home, session invalid.");
      response.redirect("/");
  }
});


// loading the sharestatus page
app.get("/sharestatus", (request, response) => {
  session = request.session;
  // uname = request.session.fullname;
  if (session.uid && session.fname) {
    response.render("sharestatus", {
      data: {
        userid: session.uid,
        fullname: session.fname,
      },
    });
  } else response.redirect("/");
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

// Endpoint to create a private message
app.post('/createPrivateMessage', async (request, response) => {
  const { sender, recipient, content, status } = request.body;

  // Validate input
  if (!sender || !recipient || !content) {
    return response.status(400).json({ success: false, message: 'Sender, recipient, and content are required' });
  }

  try {
    const newMessage = new Message({
      sender,
      recipient,
      content,
      status,
      timestamp: new Date(),
      isPrivate: true,
    });

    await newMessage.save(); // Save the message to the database

    return response.json({ success: true, message: 'Private message created successfully' });
  } catch (error) {
    console.error(`Error creating private message: ${error}`);
    return response.status(500).json({ success: false, message: 'Server error' });
  }
});

// Endpoint to fetch private messages
app.post('/fetchPrivateMessages', async (request, response) => {
  const searchCriteria = request.body.searchCriteria;

  if (!searchCriteria) {
    return response.json({ success: false, message: 'No search criteria provided' });
  }

  const criteriaWords = searchCriteria.split(' ').map(word => word.toLowerCase());
  const filteredWords = criteriaWords.filter(word => !stopWords.has(word));

  // Check if filteredWords is empty
  if (filteredWords.length === 0) {
    return response.json({ success: false, message: 'Search criteria contains only stop words' });
  }

  try {
    const messages = await Message.find({ isPrivate: true })
      .sort({ timestamp: -1 })
      .limit(10)
      .exec();

    // Filter messages based on the search criteria
    const responseMessages = messages
      .filter(message => {
        return filteredWords.some(word => 
          message.content.toLowerCase().includes(word) || 
          message.sender.toLowerCase().includes(word)
        );
      })
      .map(message => ({
        username: message.sender,
        status: message.status,
        timestamp: message.timestamp,
        content: message.content,
      }));

    if (responseMessages.length === 0) {
      return response.json({ success: false, message: 'No matching messages found' });
    }

    return response.json({ success: true, results: responseMessages });
  } catch (error) {
    console.error(`Error fetching private messages: ${error}`);
    return response.status(500).json({ success: false, message: 'Server error' });
  }
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

// Route to load the create announcement page
app.get("/createAnnouncement", (request, response) => {
  response.render("createAnnouncement", {
      messages: {
          error: request.flash("error"),
          success: request.flash("success"),
      },
  });
});

// POST request for saving the announcement
app.post("/saveAnnouncement", async (request, response) => {
  const { content } = request.body;

  try {
    const announcement = new Message({
      content,
      isPrivate: false,
      isAnnouncement: true,
      timestamp: new Date(),
    });

    await announcement.save();
    request.flash("success", "Announcement created successfully!");
    response.redirect("/publicAnnouncements");
  } catch (err) {
    console.error("Error saving announcement:", err);
    request.flash("error", `Error creating announcement: ${err.message}`);
    response.redirect("/createAnnouncement");
  }
});

// Fetching the latest public announcement messages 
app.get("/publicAnnouncements", async (request, response) => {
  try {
    const announcements = await Message.find({ isPrivate: false, isAnnouncement: true })
      .sort({ timestamp: -1 })
      .limit(10);
//Render the page with fetched announcement
    response.render("publicAnnouncements", {
      announcements,
      messages: {
        error: request.flash("error"),
        success: request.flash("success"),
      },
    });
  } catch (error) {
// Log the error for debugging
    console.error(`Error fetching public announcements: ${error}`);
// Flash an error message to be displayed to users
    request.flash("error", "Error fetching announcements.");
    response.redirect("/home");
  }
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