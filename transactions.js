
// import { log_api_error } from './utils.js';

// Function to add a row to the table
function addRowToTransactions(rowData) {
    // Get the table body
    const tableBody = document.querySelector("#myTransactions tbody");

    // Create a new row
    const newRow = document.createElement("tr");

    // Create and append cells to the row
    rowData.forEach(cellData => {
        const cell = document.createElement("td");
        cell.textContent = cellData; // Set the text content of the cell
        newRow.appendChild(cell); // Append the cell to the row
    });

    // Append the new row to the table body
    tableBody.appendChild(newRow);
}

function populateTransactionsTable(transactions) {
    console.log('Filling transactions table');
    // clear table
    const tableBody = document.querySelector("#myTransactions tbody");
    tableBody.innerHTML = ''; // Clear all rows
   

    for (const transaction of transactions) {
        const rowData = [
            transaction.transaction_date,
            transaction.value,
            transaction.first_name,
            transaction.transaction_type,
            transaction.transaction_category,
        ];
        addRowToTransactions(rowData)
    }
}

const getTransactions = async () => {
    let url = 'http://127.0.0.1:5000/transactions';
    const response = await fetch(url, {
      method: 'get',
    })

    if (response.ok) {
        console.log('Transactions were obtained');        
        const transactions = await response.json();
        populateTransactionsTable(transactions);

    } else {
        log_api_error(response);
    }      
  }
  
  /*
    Chamada da função para carregamento inicial dos dados
  */
getTransactions()
  
  const addTransaction = async () => {
    const formData = new FormData();

    let category_id = document.getElementById("TransactionCategoryId").value;
    formData.append('category_id', category_id);
    
    let type_id = document.getElementById("TransactionTypeId").value;
    formData.append('transaction_type_id', type_id);
        
    let user_id = document.getElementById("UserSelect").value;
    formData.append('user_id', user_id);
    
    let date = document.getElementById("NewTransactionDate").value;
    formData.append('date', date);
    
    let value = document.getElementById("NewTransactionValue").value;
    formData.append('value', value);
    
    let url = 'http://127.0.0.1:5000/transaction';
    const response = await fetch(url, {
      method: 'post',
      body: formData
    })

    if (response.ok) {
      console.log('Transaction created successfully!');
      alert('Transaction created successfully!');
      // clear the form fields
      document.getElementById("UserFirstName").value = '';
      document.getElementById("UserLastName").value = '';
      document.getElementById("UserEmail").value = '';
      getTransactions();

    } else {
      console.log('Error creating transaction!');
      log_api_error(response);
    }    
  };