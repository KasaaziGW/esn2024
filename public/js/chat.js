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
// JavaScript code that handles the search input, fetches autocomplete suggestions, and displays search results
document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-criteria');
  const suggestionBox = document.getElementById('suggestion-box');
  const resultsList = document.getElementById('results-list');      

  let typingTimer; // Timer identifier
  const typingDelay = 300; // Delay in milliseconds

  // Listen for input in the search criteria field
  searchInput.addEventListener('input', () => {
      // Clear previous suggestions
      suggestionBox.innerHTML = '';

      const searchCriteria = searchInput.value.trim();

      // Clear the timer if the user is typing
      clearTimeout(typingTimer);

      // Set a new timer for debounce effect to avoid too many requests
      typingTimer = setTimeout(async () => {
          if (searchCriteria.length < 3) {
              // Don't perform a search if the input is less than 3 characters
              return;
          }

          try {
              // Send POST request to the server for autocomplete suggestions
              const response = await fetch('/search', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ searchCriteria })
              });

              const data = await response.json();

              // Check if autocomplete results are returned
              if (data.success && data.results) {
                  // Display suggestions in the suggestion box
                  data.results.forEach(result => {
                      const suggestionItem = document.createElement('div');
                      suggestionItem.classList.add('suggestion-item');
                      suggestionItem.textContent = result.fullname; // Display only the fullname
                      
                      // Handle suggestion click - set search input and clear suggestions
                      suggestionItem.onclick = () => {
                          searchInput.value = result.fullname;
                          suggestionBox.innerHTML = ''; // Clear suggestions
                      };
                      suggestionBox.appendChild(suggestionItem);
                  });
              } else {
                  suggestionBox.innerHTML = '<div class="suggestion-item">No suggestions found</div>';
              }
          } catch (error) {
              console.error('Error fetching suggestions:', error);
              suggestionBox.innerHTML = '<div class="suggestion-item">Error fetching suggestions</div>';
          }
      }, typingDelay);
  });

  // Handle the form submission for a full search
  searchForm.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent default form submission

      const searchCriteria = searchInput.value.trim();

      // Perform a full search request
      try {
          // Send POST request to the server for full search results
          const response = await fetch('/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ searchCriteria })
          });

          const data = await response.json();

          // Clear previous results
          resultsList.innerHTML = '';

          if (data.success && data.results) {
              // Iterate over the search results
              data.results.forEach(result => {
                  const listItem = document.createElement('li');
                  
                  // Display citizen's full name and username/email
                  listItem.innerHTML = `<strong>${result.citizen.fullname}</strong> - ${result.citizen.username}`;
                  
                  // Create a nested list to show the last 10 messages for each citizen
                  const messageList = document.createElement('ul');
                  messageList.classList.add('message-list');  // Add a class for styling purposes

                  if (result.messages.length > 0) {
                      // Iterate over the messages and display each
                      result.messages.forEach(message => {
                          const messageItem = document.createElement('li');
                          messageItem.textContent = `${message.sentTime}: ${message.message}`;
                          messageList.appendChild(messageItem);
                      });
                  } else {
                      // If no messages are found, show a message indicating that
                      const noMessagesItem = document.createElement('li');
                      noMessagesItem.textContent = 'No messages found.';
                      messageList.appendChild(noMessagesItem);
                  }

                  // Append the message list to the main list item
                  listItem.appendChild(messageList);

                  // Append the main list item (citizen + messages) to the results list
                  resultsList.appendChild(listItem);
              });
          } else {
              // If no results were found, display a "No results found" message
              resultsList.innerHTML = '<li>No results found</li>';
          }
      } catch (error) {
          console.error('Error fetching results:', error);
          resultsList.innerHTML = '<li>Error fetching results</li>';
      }
  });
});



    // Add an event listener to the form's submit event when a user selects a status
    document.getElementById('status-form').addEventListener('submit', function(event) {
      event.preventDefault();  // Prevent the default form submission behavior

      // Get the selected status value from the dropdown
      const status = document.getElementById('status-select').value;
      
      // Get the userId from a hidden input field in the form
      const userId = document.getElementById('user-id').value;

      // Log the userId to the console for debugging purposes
      console.log('User ID:', userId);

      // Send a POST request to the server to update the user's status
      fetch('/status', {
          method: 'POST',  // Specify that this is a POST request
          headers: {
              'Content-Type': 'application/json'  // Indicate that the request body will be in JSON format
          },
          // Convert the userId and status into a JSON string to send as the request body
          body: JSON.stringify({ userId: userId, status: status })  
      })
      .then(response => response.json())  // Parse the JSON response from the server
      .then(data => {
          // Get the DOM element to display the status update message
          const statusMessage = document.getElementById('status-message');
          
          // If the server responds with success, update the message accordingly
          if (data.success) {
              statusMessage.textContent = "Status updated successfully!";
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
    });

  });
});





// displaying messages on the UI
function getMessages() {
  $.get("http://localhost:3300/fetchMessages", (messages) => {
    messages.forEach(displayMessage);
  });
  scrollContainer();
}

// listening to the "message" event
socket.on("message", displayMessage);
// function for diplaying the message on the screen
function displayMessage(message) {
  var fullname = document.querySelector("#fullname").textContent;
  if (message.sender == fullname) {
    $("#messages").append(`<div id="messageContainer1">
                              <div id="messageHeader">
                              <div id="senderName">Me</div>
                              <div id="sentTime">${message.sentTime}</div>
                              </div>
                              <p>${message.message}</p>
                              </div>`);
  } else {
    $("#messages").append(`<div id="messageContainer">
                              <div id="messageHeader">
                              <div id="senderName">${message.sender}</div>
                              <div id="sentTime">${message.sentTime}</div>
                              </div>
                              <p>${message.message}</p>
                              </div>`);
  }
  scrollContainer();
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