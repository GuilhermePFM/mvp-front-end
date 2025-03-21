

const createCategory =  () => {
    let categoryName = document.getElementById("NewCategory").value;
    const formData = new FormData();
    formData.append('name', categoryName);
  
    let url = 'http://127.0.0.1:5000/transaction_category';
    fetch(url, {
      method: 'post',
      body: formData
    })
      .then((response) => response.json())
      .then(() => {
        // Display success message
        alert('Category created successfully!');
        // clear the form fields
        document.getElementById("NewCategory").value = '';
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  const listCategories =  () => {  
    let url = 'http://127.0.0.1:5000/transaction_categories';
    fetch(url, {
      method: 'get'
    })
      .then((response) => response.json())
      .catch((error) => {
        console.error('Error:', error);
      });
  }