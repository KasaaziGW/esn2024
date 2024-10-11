// Check if a user has 'Coordinator' privilege
const userPrivilege = 'coordinator'; // Placeholder

if (userPrivilege !== 'coordinator') {
  alert("Access denied. Only Coordinators can post announcements.");
  window.location.href = '/login.html'; // Redirect to login if not a Coordinator
}
// Loading existing announcements

const announcements = [
  { text: 'Welcome to the system!', author: 'Admin', timestamp: new Date().toLocaleString() }
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
  list.innerHTML = ''; // Clear existing list

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
  });
}
