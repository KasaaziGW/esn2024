const socket = io();
$(() => {
  $("#sendButton").click(() => {
    var fullname = document.querySelector("#fullname").textContent;
    var sentMessage = $("#sendMessage").val();
    var currentTime = getCurrentTime();
    // alert(
    //   `Fullname: ${fullname} \nMessage: ${sentMessage} \nTime 'n Date: ${currentDate}`
    // );
    var message = {
      sender: fullname,
      message: sentMessage,
      sentTime: currentTime,
    };
    saveMessage(message); // delegating the message to be sent by the saveMessage function
    $("#sendMessage").val(""); // clearing the text box after sending the message
  });

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
  });
});

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
