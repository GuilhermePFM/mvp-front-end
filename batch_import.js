
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


async function displayData(data) {
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
    let formsIds = [];
    // Add rows and cells
    var formated_values = await formatBatchTableValues(adjusted_data);
    all_users = await listUsers();
    var user_names = all_users.map(user => [user.first_name+" "+user.last_name, user.id]);
    var categories = await listCategories();
    var categories = categories.map(cat => [cat.transaction_category, cat.id]);
  
    for (const [i, row] of formated_values.entries()) {
        let rowElement = document.createElement('tr');
        
        headerArray.forEach( (column)=>{
            let cellElement = document.createElement('td');
            if (column === "Pessoa"){
                
                var dropdown_id = "formBatchUsers" + i;
                var dropown_object = createDropdown(dropdown_id, user_names)
                cellElement.appendChild(dropown_object);
                
            } else if (column === "Categoria"){
                var dropdown_id = "formBatchCategory" + i;
                var dropown_object = createDropdown(dropdown_id, categories, selected=row[column])
                cellElement.appendChild(dropown_object);
            }
            else{
                cellElement.style = "word-wrap: break-word";
                cellElement.textContent = row[column]; 
            }

            rowElement.appendChild(cellElement);
        });
             
        table.appendChild(rowElement); 
    };
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

function getDisplayedBatchData() {
    const table = document.getElementById('batchTransactionsDataTable');
    const rows = Array.from(table.rows);
    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent);

    const data = rows.slice(1).map(row => {
        // rows[1].cells[0].textContent
        const row_obj = {};
        Array.from(row.querySelectorAll('td')).forEach((cell, index) => {
            var header = headers[index];
            if((header === "Pessoa" || header === "Categoria")){
                var select = cell.firstChild;
                var value = select.value;
                var text = select.options[select.selectedIndex].text;
                row_obj[header] = text;
            } else {
                row_obj[header] = cell.textContent;

            }
        });
        return row_obj;
    });
    return data
}

const importBatchTransactions = async (data) => {
    console.log("Importing batch transactions");
    var batchData = getDisplayedBatchData();
    if (batchData){
        batchData = await enhanceBatchDataWithIds(batchData);
        let ret = await updateBatchTransactionsDatabase(batchData);       
    }
}

async function enhanceBatchDataWithIds(data) {
    usersData = await listUsers();
    const treatedUsersData = {};
    usersData.forEach(entry =>{
        var name = entry.first_name + " " + entry.last_name;
        treatedUsersData[name] = entry
        treatedUsersData[name].user_id = entry.id;
    });

    categoriesData = await listCategories();
    const treatedcategoriesData = {};
    categoriesData.forEach(entry =>{
        treatedcategoriesData[entry.transaction_category] = entry
        treatedcategoriesData[entry.transaction_category].category_id = entry.id;
    });
    const enhanced_data = [];
    data.forEach(row => {
        var enhanced_row = {
            category_id: treatedcategoriesData[row["Categoria"]].category_id,
            user_id: treatedUsersData[row["Pessoa"]].user_id,
            description: row['Descrição'],
            transaction_date: row['Data'],
            value: row['Valor'],
            transaction_type_id: 0,
        };
        enhanced_data.push(enhanced_row);
    });
    return enhanced_data;
    

    // transaction_type_id
//     "transactions": [
//     {
//       "category_id": 0,
//       "description": "one time purchase",
//       "transaction_date": "2025-06-27T09:00:24.752148",
//       "transaction_type_id": 0,
//       "user_id": 0,
//       "value": 100
//     }
//   ]
}

const updateBatchTransactionsDatabase = async (data) => {
    console.log("Updating batch transactions database");
    let url = 'http://127.0.0.1:5000/transactions';
    
    try {
        debugger;
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


function parseDates(data) {
    const d = new Date(data);
    let text = d.toLocaleString();
    return text;
}


const callClassifier = async (data) =>{
    console.log("Sending data to the classifier");
    let url = 'http://127.0.0.1:5000/batchclassifier';

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