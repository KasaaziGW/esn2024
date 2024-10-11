// Check if an administrator is logged in
const isAdminLoggedIn = true; // Placeholder, to be validated through server authentication

if (!isAdminLoggedIn) {
  alert('Access Denied! Only administrators can edit profiles.');

  // Redirect to login page or home page
  
  window.location.href = '/login.html';
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
  };
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
    .then(response => {
      if (response.success) {
        document.getElementById('message').textContent="User profile updated successfully!";
      } else {
        ocument.getElementById('message').textContent="Error updating profile!";
    })
    .catch(error => {
      console.error('Error updating profile:', error);
    });
});

// Server update function for sending updated user profile data

function updateUserProfile(username, status, priviledgeRole, password) {
  return new Promise((resolve, reject) => {

    // Simulating an asynchronous server request

    setTimeout(() => {
function updateUserProfile(userData) {
    return fetch('/api/updateUserProfile', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })
      .then(response => response.json())
      .catch(error => {
        console.error('Error updating profile:', error);
        throw error;
      });
  }