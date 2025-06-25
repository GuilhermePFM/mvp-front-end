
function fileTemplate(){

}

function validateFile(file) {
}

function validateFileContent(content) {
}

function runAutoClassification() {
}

const sendBatchFile =  async (event) => {
    console.log("Uploaded file");
    
    const fileInput = document.getElementById("BatchTransactionsformFile");
    if (!fileInput.files || fileInput.files.length === 0) {
        alert("Please select a file first.");
        return;
    }

    try {
        console.log("Parsing excel file");
        const file = fileInput.files[0];
        const arrayBuffer  = await handleBatchFile(file);

        // Create and dispatch a custom event
        const event = new CustomEvent("batchFileLoaded", { detail: { message: "File was loaded" } });
        document.dispatchEvent(event);
    } catch (e) {
        debugger;
        console.error("Error reading file:", e);
        alert(`An error occurred: ${e.message}`);
    }
};


// Add an event listener for the custom event
document.addEventListener("batchFileLoaded", function(event) {
    $('#batchImportSpinner').show();
    setTimeout(async function() {
        // Your time-consuming logic here
        let ret = await classifyBatchTransactions(event);
        $('#batchImportSpinner').hide();
    }, 0);
    toggleBatchImportButton();
});


function toggleBatchSpinner(){
    const spinner = document.getElementById("batchImportSpinner");
    spinner.style.display = spinner.style.display === "" ? "block" : "";
}

function toggleBatchImportButton(){
    const button = document.getElementById("batchTransactionsImportButton");
    button.disabled = !button.disabled;
}


const handleBatchFile =  (file) => {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onload = (event) => {
            try {
                const jsonData = excelToArray(event);
                displayData(jsonData);
                resolve(jsonData);
            } catch (error) {
                reject(error);
            }
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
    // const workbook = XLSX.read(data, { type: 'array', cellDates:true});
    const workbook = XLSX.read(data, {cellDates:true, dateNF: 'yyyy-mm-dd hh:mm'});

    // Get first worksheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, {blankrows:false, raw:false, skipHeader:true, UTC:true, header: Object.keys(getTemplateTableNames()) }); // { header: 1, raw:false,  cellDates:true, dateNF: 'yyyy-mm-dd hh:mm', UTC:true}, dateNF: 'yyyy-mm-dd hh:mm'

    formatColumns(jsonData)
    validateHeaderNames(jsonData)

    // remove header row
    jsonData.shift();

    return jsonData;
};

function  validateHeaderNames(jsonData) {
    const expectedHeaders = Object.keys(getTemplateTableNames()); 
    const actualHeaders = Object.keys(jsonData[0]);
    console.log("Expected Headers: ", expectedHeaders);
    console.log("Actual Headers: ", actualHeaders);
    if (actualHeaders.length !== expectedHeaders.length) {
        throw new Error("Invalid file format: Incorrect number of columns.");
    }
    for (let i = 0; i < actualHeaders.length; i++) {
        if (actualHeaders[i] !== expectedHeaders[i]) {
            throw new Error(`Invalid file format: Expected column '${expectedHeaders[i]}', but found '${actualHeaders[i]}'.`);
        }
    }
    console.log("Column names are valid.");
}

function  formatColumns(jsonData) {
    const header_maping = getTemplateTableNames();
    const expectedHeaders = Object.keys(header_maping); 

    jsonData.forEach(row => {
        // fill missing columns with null values
        expectedHeaders.forEach(header => {
            if(!(header in row)) {
                let internal_header = header_maping[header];
                // check if object is in internal format, and adjust to user format
                if (internal_header in row){
                    row[header] = row[internal_header];
                    delete row[internal_header];
                } else{
                    row[header] = null; // Fill missing columns with null
                }
            }
        });
    });

    return jsonData;    
}

function formatBatchTableValues(jsonData) {    
    let formattedData = [];
    formattedData = jsonData.map(row => 
        function() {
            let newrow = {}; // Create a deep copy of the row to avoid mutating the original object
            for (let key in row) {
                newrow[key] = row[key];
            }
            // format values
            newrow['Valor'] =  newrow['Valor'] === "Valor" ?  newrow['Valor'] : formatValue(newrow['Valor']); // Convert 'Valor' to float
            // format dates
            newrow['Data'] = parseDates(newrow['Data']);
            
            return newrow;
        }()
    );

    return formattedData;    
}


function parseNumber(value) {
    let is_brazilian_numeric = "," in String(value)
    if (is_brazilian_numeric) {
        value = value.replace(".", "").replace(",", ".");
    }
    return parseFloat(value.replace(/[^0-9.-]+/g,"")) || 0; // Convert to float, default to 0 if parsing fails
}


function displayData(data) {
    const table = document.getElementById('batchTransactionsDataTable');
    table.innerHTML = ''; // Clear any existing data
    let adjusted_data = structuredClone(data);
    adjusted_data = formatColumns(data)

    // Create header
    const headerRow = document.createElement("tr");
    const headerArray = Object.keys(getTemplateTableNames());

    headerArray.forEach((cell) => {
        let cellElement = document.createElement('th');
        cellElement.textContent = cell; 
        headerRow.appendChild(cellElement);
    });
    table.appendChild(headerRow);

    // Add rows and cells
    formatBatchTableValues(adjusted_data).forEach((row) => {
        let rowElement = document.createElement('tr');
        
        headerArray.forEach((column) => {
            let cellElement = document.createElement('td');
            cellElement.style = "word-wrap: break-word";
            cellElement.textContent = row[column]; // cell[1] is the value, cell[0] is the key
            rowElement.appendChild(cellElement);
        });        
        table.appendChild(rowElement);
    });
}


const classifyBatchTransactions = async (event) =>{
    console.log("Requested classification of batch transactions");
    
    const fileInput = document.getElementById("BatchTransactionsformFile");
    if (!fileInput.files || fileInput.files.length === 0) {
        alert("Please select a file first.");
        return;
    }
   
    try {
        console.log("Parsing excel file");
        const file = fileInput.files[0];
        const arrayBuffer  = await handleBatchFile(file)
        const jsonData  = await renameColumns(arrayBuffer)
        
        console.log("Running Classifier");
        const classification_result = await callClassifier(jsonData)
        displayData(classification_result['transactions'])

    } catch (e) {
        debugger;
        console.error("Error during batch classification:", e);
        alert(`An error occurred: ${e.message}`);
    }
};


const renameColumns = async (data) =>{
    console.log("Converting data array to JSON");
    let header_maping = getTemplateTableNames(); // Get the header mapping from the template

    let renamedJsonData = data.map(row => 
        Object.fromEntries(
            // convert prices to array, map each key/value pair into another pair
            // and then fromEntries gives back the object
            Object.entries(row).map(entry => [header_maping[entry[0]], entry[1]])
        )
    );
    
    return renamedJsonData;
} 


function getTemplateTableNames(){
    const names = { "Data": 'date', "Descrição": 'description', "Valor": 'value', "Pessoa": 'user', "Categoria": 'classification' };
    return names
}

// function convert_batch_names(name) {
//     console.log("Converting batch data to JSON");
//     const dictionary = getTemplateTableNames();
//     if (name in dictionary) {
//         return dictionary[name];
//     } else {
//         return name; // Keep original key if no mapping exists
//         }
// };    


function parseDates(data) {
    const d = new Date(data);
    let text = d.toLocaleString();
    return text;
}


const callClassifier = async (data) =>{
    console.log("Sending data to the classifier");
    let url = 'http://127.0.0.1:5000/batchclassifier';
    // const formData = new FormData();
    // formData.append('data', data); // Convert data to JSON string
    
    // const myHeaders = new Headers();
    // myHeaders.append("Content-Type", "application/json");

    // const myRequest = new Request(url, {
    // method: "POST",
    // body: JSON.stringify({ username: "example" }),
    // headers: myHeaders,
    // });
    try {
        const response = await fetch(url, {
            method: 'post',
            headers: {
                "Content-Type": "application/json",
            },
            // body: {'transactions': data}, // Send data as JSON
            body: JSON.stringify({'transactions': data}), // Send data as JSON
        });
        if (!response.ok) {
            log_api_error(response);
            throw new Error(`Classifier request failed with status ${response.status}`);
        }
        console.log('Classification was successful!');
        return await response.json();
    } catch (error) {
        console.error('Error running classifier!', error);
        throw error; // Re-throw to be caught by the caller
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
