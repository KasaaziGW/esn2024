const socket = io();
var typing=false;
var timeout=undefined;
var user;
$(() => {
  $("#sendButton").click(() => {
    var fullname = document.querySelector("#fullname").textContent;
    // used the value method to get form inputs
    var sentMessage = $("#sendMessage").val();
    var currentTime = getCurrentTime();
    // alert(
    //   `Fullname: ${fullname} \nMessage: ${sentMessage} \nTime 'n Date: ${currentTime}`
    // );
    var message = {
      sender: fullname,
      message: sentMessage,
      sentTime: currentTime,
    };
    saveMessage(message); // delegating the message to be sent by the saveMessage function
    $("#sendMessage").val(""); // clearing the text box after sending the message
  });
  getMessages();

  socket.on("joined", (username) => {
    var fullname = document.querySelector("#fullname").textContent;
    if (username == fullname) {
      $("#alert").text("");
      $("#alert").remove("p");
      $("#alert").append(
        `<p style='position:absolute;'><center><em>You joined the chat</em></center></p>`
      );
    } else {
      $("#alert").text("");
      $("#alert").remove("p");
      $("#alert").append(
        `<p style='position:absolute;'><center><strong>${username} joined the chat.</strong></center></p>`
      );
    }
    scrollContainer();

    // Implementing for typing event from other users
    $(document).ready(function(){
      $('#sendMessage').keypress((e)=>{
        if(e.which!=13){
          typing=true
          socket.emit('typing', data={user:fullname, typing:true})
          timeout=setTimeout(typingTimeout, 3000)
        }else{
          clearTimeout(timeout)
          typingTimeout()
          //sendMessage() function will be called once the user hits enter
          sendMessage()
        }
      })
      //code for triggering the user is typing
          socket.on('display', (data)=>{
        if(data.typing==true)
          //Putting the space between the user name and the word is typing using this\u00A0
        //  ${data.user} was introduced before \u00A0 to display users full names but it was remove because the used is already diplaye on the dashboard
          $('#typing').text(`\u00A0 is typing...`)
        else
          $('#typing').text("")
      })
    })
    /*
    // JavaScript code that handles the search input, fetches autocomplete suggestions, and displays search results
    // Wait until the entire DOM content is loaded before executing the script
    document.addEventListener('DOMContentLoaded', () => {
      // Get references to various DOM elements in the HTML file
      const searchForm = document.getElementById('search-form'); // The search form
      const searchInput = document.getElementById('search-criteria'); // The input field where user types search query
      const suggestionBox = document.getElementById('suggestion-box'); // The div where autocomplete suggestions will appear
      const resultsList = document.getElementById('results-list');  // The element where full search results will be displayed      

      let typingTimer; // Timer to manage debounce effect for search input
      const typingDelay = 300; // Time (in milliseconds) to wait after the user stops typing before sending a request

      // Event listener that triggers when the user types in the search input field
      searchInput.addEventListener('input', () => {
          // Clear previous suggestions before displaying new ones
          suggestionBox.innerHTML = '';

          const searchCriteria = searchInput.value.trim(); // Get the input and remove leading/trailing spaces

          // If the user continues typing, clear the previous typing timer to prevent multiple requests
          clearTimeout(typingTimer);

          // Set a new typing timer. Once the user stops typing for 300ms, the search is triggered
          typingTimer = setTimeout(async () => {
              if (searchCriteria.length < 3) { 
                  // If the input is less than 3 characters, don't make a request (ensures meaningful searches)
                  return;
              }

              try {
                  // Send a POST request to the server to get autocomplete suggestions based on the search input
                  const response = await fetch('/search', {
                      method: 'POST', // Use the POST method for the request
                      headers: {
                          'Content-Type': 'application/json' // The request sends JSON data
                      },
                      body: JSON.stringify({ searchCriteria }) // Send the search input as the request body
                  });

                  // Parse the JSON response from the server
                  const data = await response.json();

                  // Check if the response indicates success and if there are results
                  if (data.success && data.results) {
                      // For each result, create a new suggestion item and append it to the suggestion box
                      data.results.forEach(result => {
                          const suggestionItem = document.createElement('div'); // Create a new div for each suggestion
                          suggestionItem.classList.add('suggestion-item'); // Add a CSS class for styling
                          suggestionItem.textContent = result.fullname; // Set the content of the suggestion to the citizen's full name

                          // When a suggestion is clicked, set the search input value to the selected full name and clear suggestions
                          suggestionItem.onclick = () => {
                              searchInput.value = result.fullname; // Set the search input to the clicked suggestion
                              suggestionBox.innerHTML = ''; // Clear the suggestion box after selection
                          };
                          suggestionBox.appendChild(suggestionItem); // Add the suggestion to the suggestion box
                      });
                  } else {
                      // If no suggestions are found, display a "No suggestions found" message
                      suggestionBox.innerHTML = '<div class="suggestion-item">No suggestions found</div>';
                  }
              } catch (error) {
                  // Log any error that occurs while fetching suggestions
                  console.error('Error fetching suggestions:', error);
                  suggestionBox.innerHTML = '<div class="suggestion-item">Error fetching suggestions</div>'; // Display error message
              }
          }, typingDelay); // Delay the request until after 300ms of inactivity
      });

      // Event listener that triggers when the search form is submitted
      searchForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the form from submitting the usual way (refreshing the page)

        const searchCriteria = searchInput.value.trim(); // Get the input value and remove unnecessary spaces

        try {
            // Send a POST request to perform a full search with the given search criteria
            const response = await fetch('/search', {
              method: 'POST', // Use POST method for the request
              headers: {
                  'Content-Type': 'application/json' // Specify the content type as JSON
              },
              body: JSON.stringify({ searchCriteria }) // Send the search criteria to the server
            });

            const data = await response.json(); // Parse the response from the server as JSON

            // Clear any previous results from the result list
            resultsList.innerHTML = '';

            // Check if the response was successful and contains results
            if (data.success && data.results) {
                // Loop over each search result and display it
                data.results.forEach(result => {
                    const listItem = document.createElement('li'); // Create a new list item for each search result

                    // Display the citizen's full name and username/email in the list item
                    listItem.innerHTML = `<strong>${result.citizen.fullname}</strong> - ${result.citizen.username}`;
                    
                    // Create a nested list to show the last 10 messages for each citizen
                    const messageList = document.createElement('ul'); // Create a new unordered list for messages
                    messageList.classList.add('message-list');  // Add a CSS class for styling purposes

                    if (result.messages.length > 0) {
                        // If messages exist, loop through them and display each one
                        result.messages.forEach(message => {
                            const messageItem = document.createElement('li'); // Create a new list item for each message
                            messageItem.textContent = `${message.sentTime}: ${message.message}`; // Display message sent time and content
                            messageList.appendChild(messageItem); // Append the message to the message list
                        });
                    } else {
                        // If no messages are found, display a message indicating that
                        const noMessagesItem = document.createElement('li');
                        noMessagesItem.textContent = 'No messages found.'; // Inform that no messages exist
                        messageList.appendChild(noMessagesItem); // Append to the message list
                    }

                    // Append the message list (with all messages) to the main list item (citizen)
                    listItem.appendChild(messageList);

                    // Append the main list item (citizen + messages) to the results list
                    resultsList.appendChild(listItem);
                });
            } else {
                // If no results are found, display a message indicating that
                resultsList.innerHTML = '<li>No results found</li>';
            }
        } catch (error) {
            // Log any error that occurs while fetching the full search results
            console.error('Error fetching results:', error);
            resultsList.innerHTML = '<li>Error fetching results</li>'; // Display error message in the results list
        }
      });
    });*/
/*
    // Add an event listener to the form's submit event when a user selects a status
    document.getElementById('status-form').addEventListener('submit', function(event) {
      event.preventDefault();  // Prevent the default form submission behavior

      // Get the selected status value from the dropdown
      const status = document.getElementById('status-select').value;

      // Send a POST request to the server to update the user's status
      fetch('/status', {
          method: 'POST',  // Specify that this is a POST request
          headers: {
              'Content-Type': 'application/json'  // Indicate that the request body will be in JSON format
          },
          // Send only the selected status as the request body since username is taken from the session
          body: JSON.stringify({ status: status })
      })
      .then(response => response.json())  // Parse the JSON response from the server
      .then(data => {
          // Get the DOM element to display the status update message
          const statusMessage = document.getElementById('status-message');

          // If the server responds with success, update the message accordingly
          if (data.success) {
              statusMessage.textContent = data.message;  // Use the message from the server response
          } else {
              // If there is an error, display the error message from the server response
              statusMessage.textContent = `Error: ${data.message}`;
          }
      })
      .catch(error => {
          // Log any error that occurs during the fetch operation
          console.error('Error updating status:', error);
          
          // Update the status message to inform the user of an error
          document.getElementById('status-message').textContent = "Error updating status.";
      });
    });*/

  });
}); 





// displaying messages on the UI
function getMessages() {
  $.get("http://localhost:3300/fetchMessages", (messages) => {
    messages.forEach(displayMessage);
  });
  scrollContainer();
}

// Listen for the "message" event from the server (real-time message update)
socket.on("message", function (message) {
  displayMessage(message);  // Call the function to display the new message in the chat
});

// Listen for the "messageDelivered" event from the server to update delivery status
socket.on("messageDelivered", function (messageId) {
  // Locate the message in the DOM using its data-message-id attribute and update the tick marks
  const deliveredTick = $(`[data-message-id="${messageId}"] .delivered-tick`);

  // If the message is found, update its tick status to show it is delivered
  if (deliveredTick.length) {
      deliveredTick.text("✔✔");  // Show double tick for delivered message
      deliveredTick.css("color", "blue");  // Optionally change the color to blue for read status
  } else {
      console.error("Message element not found for ID:", messageId);
  }
});

// Function to display a message in the chat window
function displayMessage(message) {
  var fullname = document.querySelector("#fullname").textContent;

  // Check if the message sender is the current user
  if (message.sender === fullname) {
      // Initially show a single tick (message sent but not delivered yet)
      let tickMarks = "✔";  // Single tick initially (for sent status)
      let tickColor = "black";  // Default color for the sent message

      $("#messages").append(`<div id="messageContainer1" data-message-id="${message._id}">
                                <div id="messageHeader">
                                    <div id="senderName">Me</div>
                                    <div id="sentTime">${message.sentTime}</div>
                                </div>
                                <p>${message.message}</p>
                                <div id="deliveredStatus" class="delivered-tick" style="color: ${tickColor};">${tickMarks}</div>
                            </div>`);
  } else {
      // Append other people's messages (no tick marks)
      $("#messages").append(`<div id="messageContainer">
                                <div id="messageHeader">
                                    <div id="senderName">${message.sender}</div>
                                    <div id="sentTime">${message.sentTime}</div>
                                </div>
                                <p>${message.message}</p>
                            </div>`);
  }

  // Call the function to scroll the container to the latest message
  scrollContainer();
}

// Automatically scroll to the latest message
function scrollContainer() {
  var messageContainer = document.getElementById("messages");
  messageContainer.scrollTop = messageContainer.scrollHeight; // Scroll to the bottom
}



// function to get the current date and time
function getCurrentTime() {
  var today = new Date();
  var currentDate = [
    today.getDate(),
    today.getMonth() + 1,
    today.getFullYear(),
  ];
  var currentTime = [today.getHours(), today.getMinutes(), today.getSeconds()];
  //   converting from 24 hours to 12 hours format
  var suffix = currentTime[0] < 12 ? "AM" : "PM"; // using the ternary operator
  currentTime[0] = currentTime[0] < 12 ? currentTime[0] : currentTime[0] - 12;
  // adding zero to the date or month in the currentDate object/array
  currentDate[0] = currentDate[0] < 10 ? "0" + currentDate[0] : currentDate[0];
  currentDate[1] = currentDate[1] < 10 ? "0" + currentDate[1] : currentDate[1];

  // adding zero for when the hours, minutes and/or seconds are less than 10
  currentTime[0] = currentTime[0] < 10 ? "0" + currentTime[0] : currentTime[0];
  currentTime[1] = currentTime[1] < 10 ? "0" + currentTime[1] : currentTime[1];
  currentTime[2] = currentTime[2] < 10 ? "0" + currentTime[2] : currentTime[2];

  // returning the combined date and time
  return currentDate.join("-") + " " + currentTime.join(":") + " " + suffix;
}

// function to send the message to the server
function saveMessage(message) {
  $.post("http://localhost:3300/saveMessage", message);
}
// scrolling to the last message
function scrollContainer() {
  $("#messages").scrollTop($("#messages")[0].scrollHeight);
}