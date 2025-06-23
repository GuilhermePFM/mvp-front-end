
function fileTemplate(){

}

function validateFile(file) {
}

function validateFileContent(content) {
}

function runAutoClassification() {
}


const handleBatchFile = (file) => {
    const reader = new FileReader();
    let jsonData = null;

    return new Promise((resolve, reject) => {
        reader.onload = (event) => {
            jsonData = excelToArray(event)
            displayData(jsonData);
            resolve(reader.result);
        };

        reader.onerror = (event) => {
            reader.abort();
            reject(new DOMException("Problem parsing input file."));
        };

        reader.readAsArrayBuffer(file);
    });
};
    

function excelToArray(event) {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: 'array' });

    // Get first worksheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    // jsonData2 = reader.result;

    // Display the data in a table
    console.log("jsonData: ", jsonData);
    return jsonData;
};


function displayData(data) {
    const table = document.getElementById('excelDataTable');
    table.innerHTML = ''; // Clear any existing data

    // Loop through rows and cells
    data.forEach((row) => {
        let rowElement = document.createElement('tr');

        row.forEach((cell) => {
            let cellElement = document.createElement('td');
            cellElement.textContent = cell;
            rowElement.appendChild(cellElement);
        });

        table.appendChild(rowElement);
    });
}


const classifyBatchTransactions = async (event) =>{
    console.log("Requested classification of batch transactions");
    
    const file = document.getElementById("BatchTransactionsformFile").files[0];
    // const file = event.target.files[0];
    
    try {
        console.log("Parsing excel file");
        const file_processed = await handleBatchFile(file)
        console.log(file_processed);
        
        console.log("Running Classifier");
        classification_result = callClassifier(file_processed)

        console.log("Filling table");
        updateClassificationColumn(classification_result);

    } catch (e) {
        console.warn(e.message)
    }
};


const callClassifier = async (data) =>{
    console.log("Enviando dados para o classificador")
    console.log(data);
    const formData = new FormData();
    // formData.append('data', data);
    formData.append('data', JSON.stringify({'data': data.buffer}))
    // formData.append('data', new Blob([data.buffer]))

    let url = 'http://127.0.0.1:5000/batchclassifier';
    const response = await fetch(url, {
    method: 'post',
    body: formData
    })

    if (response.ok) {
    console.log('Classification was successfull!');
    console.log(response.json());
    return response.json();

    } else {
    console.log('Error running classifier!');
    log_api_error(response);
    }    
}


function updateClassificationColumn(){

}


function updateDatabase(){
    const formData = new FormData();
    let UserFirstName = document.getElementById("UserFirstName").value;
    let UserLastName = document.getElementById("UserLastName").value;
    let UserEmail = document.getElementById("UserEmail").value;
    formData.append('first_name', UserFirstName);
    formData.append('last_name', UserLastName);
    formData.append('email', UserEmail);
  
    let url = 'http://127.0.0.1:5000/user';
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
        listUsers()
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  async function listUsers(){  
    console.log('Obtaining list of users');
    let url = 'http://127.0.0.1:5000/users'
    const response = await fetch(url, {
      method: 'get',
    })

    if (response.ok) {
        console.log('Users were obtained');        
        const users = await response.json();
        populateUsersDropdown(users);
    } else {
        log_api_error(response);
    }  
}
function populateBatchTransactionsTable(transactions) {
    // console.log('Filling transactions table');
    // // clear table
    // const tableBody = document.querySelector("#myTransactions tbody");
    // tableBody.innerHTML = ''; // Clear all rows
   
    // for (const transaction of transactions) {
    //     const rowData = [
    //         formatDate(transaction.transaction_date),
    //         formatValue(transaction.value),
    //         transaction.first_name,
    //         transaction.transaction_type,
    //         transaction.transaction_category,
    //     ];
    //     addRowToTransactions(rowData)
    // }
    // // Format the "Valor" column after populating the table
    // updateTotal()
}

function saveBatchTransactions(transactions) {
    // console.log('Filling transactions table');
    // // clear table
    // const tableBody = document.querySelector("#myTransactions tbody");
    // tableBody.innerHTML = ''; // Clear all rows
   
    // for (const transaction of transactions) {
    //     const rowData = [
    //         formatDate(transaction.transaction_date),
    //         formatValue(transaction.value),
    //         transaction.first_name,
    //         transaction.transaction_type,
    //         transaction.transaction_category,
    //     ];
    //     addRowToTransactions(rowData)
    // }
    // // Format the "Valor" column after populating the table
    // updateTotal()
}
