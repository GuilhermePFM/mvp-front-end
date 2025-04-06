
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

function formatValue(value){
  const value_float = parseFloat(value) || 0; // Parse the value as a float
  // Format the value as a number with two decimal places
  return value_float.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function currencyToFloat(currencyString) {
  // Remove non-numeric characters except for the decimal separator
  const cleanedString = currencyString.replace(/[^\d,-]/g, '').replace(',', '.');
  // Convert the cleaned string to a float
  return parseFloat(cleanedString) || 0; // Return 0 if parsing fails
}

function updateTotal() {
  // Select the table body and footer total element
  const tableBody = document.querySelector("#myTransactions tbody");
  const totalValueCell = document.getElementById("totalValue");

  let total = 0;

  // Iterate through each row in the table body
  tableBody.querySelectorAll("tr").forEach(row => {
      const valueCell = row.cells[1]; 
      if (valueCell) {
          console.log("value cell", valueCell);
          const value = currencyToFloat(valueCell.textContent) || 0; 
          total += value;
      }
  });

  // Format the total value as currency
  console.log("total", total);
  console.log("total formated", total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }));
  totalValueCell.textContent = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', options);
}
function populateTransactionsTable(transactions) {
    console.log('Filling transactions table');
    // clear table
    const tableBody = document.querySelector("#myTransactions tbody");
    tableBody.innerHTML = ''; // Clear all rows
   
    for (const transaction of transactions) {
        const rowData = [
            formatDate(transaction.transaction_date),
            formatValue(transaction.value),
            transaction.first_name,
            transaction.transaction_type,
            transaction.transaction_category,
        ];
        addRowToTransactions(rowData)
    }
    // Format the "Valor" column after populating the table
    updateTotal()
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
    console.log("Abriu add transaction")
    
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
    console.log("enviando post")

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