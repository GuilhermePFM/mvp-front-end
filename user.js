

const createUser =  () => {
    const formData = new FormData();
    let UserFirstName = document.getElementById("UserFirstName").value;
    let UserLastName = document.getElementById("UserLastName").value;
    let UserEmail = document.getElementById("UserEmail").value;
    formData.append('first_name', UserFirstName);
    formData.append('last_name', UserLastName);
    formData.append('email', UserEmail);
  
    let url = 'http://127.0.0.1:5000/user';
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
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  const listUsers =  () => {  
    let url = 'http://127.0.0.1:5000/users';
    fetch(url, {
      method: 'get'
    })
      .then((response) => response.json())
      .catch((error) => {
        console.error('Error:', error);
      });
  }