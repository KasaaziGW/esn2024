const express = require("express");
const bodyParser = require("body-parser");

const PORT = 3300; // the port where our server will be running

// instantiating express
const app = express();
// set up the body-parse utility
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// setting the templating engine
app.set("view engine", "ejs");

// loading the login page
app.get("/", (request, response) => {
  response.render("login");
});

// listen for incoming connections
app.listen(PORT, () => {
  console.log(`The server is up and running on port ${PORT}`);
});
