function createUser(){
  const formData = new FormData();
  let UserFirstName = document.getElementById("UserFirstName").value;
  let UserLastName = document.getElementById("UserLastName").value;
  let UserEmail = document.getElementById("UserEmail").value;
  formData.append('first_name', UserFirstName);
  formData.append('last_name', UserLastName);
  formData.append('email', UserEmail);

  let url = '/api/user';
  console.log('Creating new user');
  fetch(url, {
    method: 'post',
    body: formData
  })
    .then((response) => response.json())
    .then(() => {
      // Display success message
      alert('User created successfully!');
      // clear the form fields
      document.getElementById("UserFirstName").value = '';
      document.getElementById("UserLastName").value = '';
      document.getElementById("UserEmail").value = '';
      // update list
      updateUserList()
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

async function updateUserList(){
  all_users = await listUsers();
  populateUsersDropdown(all_users, 'UserSelect');
}

async function listUsers(){  
  console.log('Obtaining list of users');
  let url = '/api/users'
  const response = await fetch(url, {
    method: 'get',
  })

  if (response.ok) {
      console.log('Users were obtained');        
      const users = await response.json();
      return users;
  } else {
      log_api_error(response);
  }      
}

function openFamilyManagement() {
  $('#UserModal').modal('show'); // Use jQuery to show the modal
}


function populateUsersDropdown(users, id){  
  console.log('Filling users dropdown');
  let dropdown = document.getElementById(id);
  
  // Clear existing options
  dropdown.innerHTML = '';

  // Populate the dropdown with user options
  users.forEach(user => {
      const option = document.createElement('option');
      option.textContent = `${user.first_name} ${user.last_name}`; // Display full name
      option.value = user.id; // Use user ID as the value
      dropdown.appendChild(option);
  });
  
}

updateUserList()
