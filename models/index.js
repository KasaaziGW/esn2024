// Check if an administrator is logged in

const isAdminLoggedIn = true; 

// Placeholder, to be validated through server authentication

if (!isAdminLoggedIn) {
  alert('Access Denied! Only administrators can edit profiles.');

  // Redirect to login page or home page
  
  window.location.href = '/processLogin';
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

  // Collecting updated data
  const updatedUser = {
    username: user.username,
    password: user.password,
    email: document.getElementById('email').value,
    role: document.getElementById('role').value,
  };
  //validating fields by rules

  if(!username.match(/^[a-zA-Z0-9]+$/)) {
    alert("invalid username. please follow the username rules.");
    return;
  }
  if(password && password.length<6) {
    alert("password must be at least 6 characters long");
    return;
  }
  // Sending the updated data to the server or simulating server update 

  updateUserProfile(username, accountStatus, priviledge, password)
    .then(response => {
      if (response.success) {
        document.getElementById('message').textContent="User profile updated successfully!";
      } else {
        document.getElementById('message').textContent="Error updating profile!";
    }})
    .catch(error => {
      console.error('Error updating profile:', error);
    })
});

// Server update function for sending updated user profile data

function updateUserProfile(username, accountStatus, priviledge, password) {
  return new Promise((resolve, reject) => {
    // Simulate async operation, API call to update the profile
    const isSuccess = true;

    if (isSuccess) {
      resolve({ success: true });
    } else {
      reject(new Error("Profile update failed"));
    }
  });
}
