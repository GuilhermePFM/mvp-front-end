// import { log_api_error } from './utils.js';


function createCategory(){
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

  async function listCategories(){  
    let url = 'http://127.0.0.1:5000/transaction_categories';
    const response = await fetch(url, {
      method: 'get',
    })

    if (response.ok) {
        console.log('Categories were obtained');        
        const categories = await response.json();
        populatCategoryDropdown(categories);

    } else {
        log_api_error(response);
    }      
  }

  function populatCategoryDropdown(categories){  
    console.log('categories ', categories);
    console.log('Filling category dropdown');
    let dropdown = document.getElementById('TransactionCategoryId');
    
    // Clear existing options
    dropdown.innerHTML = '';

    // Populate the dropdown with user options
    categories.forEach(category => {
        const option = document.createElement('option');
        option.textContent = `${category.transaction_category}`; // Display full name
        option.value = category.id; // Use user ID as the value
        dropdown.appendChild(option);
    });
    
  }
  listCategories()