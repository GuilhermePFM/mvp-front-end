
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
  
  const addTransaction = async (nome, quantidade, valor, user) => {
    const url = 'http://127.0.0.1:5000/transactions';
    const data = {
      nome: nome,
      quantidade: quantidade,
      valor: valor
    };
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      console.log('Transaction added successfully:', result);
      
      // After adding, refresh the list
      getTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };