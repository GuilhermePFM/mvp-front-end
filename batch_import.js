// Functions sendBatchForClassification and pollJobStatus are loaded from kafka.js and polling.js
// These files must be loaded before this file in index.html


const sendBatchFile = async (event) => {
    console.log("Uploaded file");

    const fileInput = document.getElementById("BatchTransactionsformFile");
    if (!fileInput.files || fileInput.files.length === 0) {
        alert("Please select a file first.");
        return;
    }

    try {
        console.log("Parsing excel file");
        const file = fileInput.files[0];
        const arrayBuffer = await handleBatchFile(file);

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
document.addEventListener("batchFileLoaded", async function (event) {
    $('#batchImportSpinner').show();
    
    try {
        console.log("Starting async batch classification process");
        
        // Get parsed transaction data from the table
        const transactionData = extractTransactionsFromTable();
        
        if (!transactionData || transactionData.length === 0) {
            throw new Error("No transaction data found in table");
        }
        
        console.log(`Sending ${transactionData.length} transactions for classification`);
        
        // Convert to internal format and send to backend
        const internalFormat = await renameColumns(transactionData);
        const jobId = await sendBatchForClassification(internalFormat);
        
        console.log(`Job submitted with ID: ${jobId}, starting polling...`);
        
        // Poll for completion (60 second timeout, 2 second interval)
        const result = await pollJobStatus(jobId, 60000, 2000);
        
        if (result.success) {
            // Display classified transactions
            console.log("Classification completed successfully");
            await displayData(result.data);
            alert('Classification completed successfully!');
        } else {
            console.error("Classification failed:", result.error);
            alert(`Classification failed: ${result.error}`);
        }
    } catch (error) {
        console.error('Error during batch classification:', error);
        alert(`An error occurred: ${error.message}`);
    } finally {
        $('#batchImportSpinner').hide();
        toggleBatchImportButton();
    }
});


function toggleBatchSpinner() {
    const spinner = document.getElementById("batchImportSpinner");
    spinner.style.display = spinner.style.display === "" ? "block" : "";
}

function toggleBatchImportButton() {
    const button = document.getElementById("batchTransactionsImportButton");
    button.disabled = !button.disabled;
}


const handleBatchFile = (file) => {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
        reader.onload = async (event) => {
            try {
                const jsonData = excelToArray(event);
                await displayData(jsonData);  // Wait for table to be populated
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
    const workbook = XLSX.read(data, { cellDates: true, dateNF: 'yyyy-mm-dd hh:mm' });

    // Get first worksheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert sheet to JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { blankrows: false, raw: false, skipHeader: true, UTC: true, header: Object.keys(getTemplateTableNames()) }); // { header: 1, raw:false,  cellDates:true, dateNF: 'yyyy-mm-dd hh:mm', UTC:true}, dateNF: 'yyyy-mm-dd hh:mm'

    formatColumns(jsonData)
    validateHeaderNames(jsonData)

    // remove header row
    jsonData.shift();

    return jsonData;
};

function validateHeaderNames(jsonData) {
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

function formatColumns(jsonData) {
    const header_maping = getTemplateTableNames();
    const expectedHeaders = Object.keys(header_maping);

    jsonData.forEach(row => {
        // fill missing columns with null values
        expectedHeaders.forEach(header => {
            if (!(header in row)) {
                let internal_header = header_maping[header];
                // check if object is in internal format, and adjust to user format
                if (internal_header in row) {
                    row[header] = row[internal_header];
                    delete row[internal_header];
                } else {
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
        function () {
            let newrow = {}; // Create a deep copy of the row to avoid mutating the original object
            for (let key in row) {
                newrow[key] = row[key];
            }
            // format values
            newrow['Valor'] = newrow['Valor'] === "Valor" ? newrow['Valor'] : formatValue(newrow['Valor']); // Convert 'Valor' to float
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
    return parseFloat(value.replace(/[^0-9.-]+/g, "")) || 0; // Convert to float, default to 0 if parsing fails
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
    var user_names = all_users.map(user => [user.first_name + " " + user.last_name, user.id]);
    var categories = await listCategories();
    var categories = categories.map(cat => [cat.transaction_category, cat.id]);

    for (const [i, row] of formated_values.entries()) {
        let rowElement = document.createElement('tr');

        headerArray.forEach((column) => {
            let cellElement = document.createElement('td');
            if (column === "Pessoa") {

                var dropdown_id = "formBatchUsers" + i;
                var dropown_object = createDropdown(dropdown_id, user_names)
                cellElement.appendChild(dropown_object);

            } else if (column === "Categoria") {
                var dropdown_id = "formBatchCategory" + i;
                var dropown_object = createDropdown(dropdown_id, categories, selected = row[column])
                cellElement.appendChild(dropown_object);
            }
            else {
                cellElement.style = "word-wrap: break-word";
                cellElement.textContent = row[column];
            }

            rowElement.appendChild(cellElement);
        });

        table.appendChild(rowElement);
    };
}


/**
 * DEPRECATED: This function is no longer used with the async architecture.
 * Classification now happens through the batchFileLoaded event listener
 * which uses sendBatchForClassification and pollJobStatus.
 * Kept for reference only.
 */
// const classifyBatchTransactions = async (event) => {
//     console.log("Requested classification of batch transactions");

//     const fileInput = document.getElementById("BatchTransactionsformFile");
//     if (!fileInput.files || fileInput.files.length === 0) {
//         alert("Please select a file first.");
//         return;
//     }

//     try {
//         console.log("Parsing excel file");
//         const file = fileInput.files[0];
//         const arrayBuffer = await handleBatchFile(file)
//         const jsonData = await renameColumns(arrayBuffer)

//         console.log("Running Classifier");
//         const classification_result = await callClassifier(jsonData)
//         displayData(classification_result['transactions'])

//     } catch (e) {
//         debugger;
//         console.error("Error during batch classification:", e);
//         alert(`An error occurred: ${e.message}`);
//     }
// };

/**
 * Extracts transaction data from the displayed table (before classification)
 * Used when initially loading the file to send for classification
 * @returns {Array} Array of transaction objects with user-facing column names
 */
function extractTransactionsFromTable() {
    const table = document.getElementById('batchTransactionsDataTable');
    const rows = Array.from(table.rows);
    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent);

    const data = rows.slice(1).map(row => {
        const row_obj = {};
        Array.from(row.querySelectorAll('td')).forEach((cell, index) => {
            var header = headers[index];
            // For the initial extraction, just get text content (no dropdowns yet for Pessoa)
            // Categoria dropdown might exist if pre-classified
            if (header === "Categoria" && cell.firstChild && cell.firstChild.tagName === 'SELECT') {
                var select = cell.firstChild;
                var text = select.options[select.selectedIndex].text;
                row_obj[header] = text;
            } else if (header === "Pessoa" && cell.firstChild && cell.firstChild.tagName === 'SELECT') {
                var select = cell.firstChild;
                var text = select.options[select.selectedIndex].text;
                row_obj[header] = text;
            } else {
                row_obj[header] = cell.textContent;
            }
        });
        return row_obj;
    });
    return data;
}

function getDisplayedBatchData() {
    const table = document.getElementById('batchTransactionsDataTable');
    const rows = Array.from(table.rows);
    const headers = Array.from(table.querySelectorAll('th')).map(th => th.textContent);

    const data = rows.slice(1).map(row => {
        // rows[1].cells[0].textContent
        const row_obj = {};
        Array.from(row.querySelectorAll('td')).forEach((cell, index) => {
            var header = headers[index];
            if ((header === "Pessoa" || header === "Categoria")) {
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
    if (batchData) {
        batchData = await enhanceBatchDataWithIds(batchData);
        let ret = await updateBatchTransactionsDatabase(batchData);
    }
    // modal('hide');
    getTransactions();
}

async function enhanceBatchDataWithIds(data) {
    usersData = await listUsers();
    const treatedUsersData = {};
    usersData.forEach(entry => {
        var name = entry.first_name + " " + entry.last_name;
        treatedUsersData[name] = entry
        treatedUsersData[name].user_id = entry.id;
    });

    categoriesData = await listCategories();
    const treatedcategoriesData = {};
    categoriesData.forEach(entry => {
        treatedcategoriesData[entry.transaction_category] = entry
        treatedcategoriesData[entry.transaction_category].category_id = entry.id;
    });
    const enhanced_data = [];
    data.forEach(row => {
        var value = currencyToFloat(row['Valor']);
        var date = new Date(row['Data'])
        var enhanced_row = {
            transaction_category_id: treatedcategoriesData[row["Categoria"]].category_id,
            user_id: treatedUsersData[row["Pessoa"]].user_id,
            description: row['Descrição'],
            transaction_date: date.toISOString(),
            value: value,
            transaction_type_id: 1,
        };
        enhanced_data.push(enhanced_row);
    });
    return enhanced_data;
}

const updateBatchTransactionsDatabase = async (data) => {
    console.log("Updating batch transactions database");
    let url = '/api/transactions';

    try {
        debugger;
        const response = await fetch(url, {
            method: 'post',
            headers: {
                "Content-Type": "application/json",
            },
            // body: {'transactions': data}, // Send data as JSON
            body: JSON.stringify({ 'transactions': data }), // Send data as JSON
        });
        if (!response.ok) {
            log_api_error(response);
            throw new Error(`Classifier request failed with status ${response.status}`);
        }
        console.log('Batch transaction imported successfully!');
        return await response.json();
    } catch (error) {
        console.error('Error running classifier!', error);
        throw error; // Re-throw to be caught by the caller
    }
}


/**
 * Converts Brazilian locale date string to ISO format
 * @param {string} dateString - Date like "06/01/2025, 00:00:00"
 * @returns {string} ISO date like "2025-01-06T00:00:00"
 */
function convertToISODate(dateString) {
    try {
        // Parse the locale string back to Date object
        const date = new Date(dateString);
        
        // Check if valid date
        if (isNaN(date.getTime())) {
            console.warn('Invalid date:', dateString);
            return new Date().toISOString(); // Fallback to current date
        }
        
        return date.toISOString();
    } catch (error) {
        console.error('Error converting date:', dateString, error);
        return new Date().toISOString();
    }
}

const renameColumns = async (data) => {
    console.log("Converting data array to API format");
    let header_mapping = getTemplateTableNames(); // Get the header mapping from the template

    let renamedJsonData = data.map(row => {
        let transformed = {};
        
        Object.entries(row).forEach(([key, value]) => {
            const internalKey = header_mapping[key];
            
            // Transform values to API format
            if (key === 'Data') {
                // Convert "06/01/2025, 00:00:00" to ISO format
                transformed[internalKey] = convertToISODate(value);
            } else if (key === 'Valor') {
                // Convert "R$ 15,00" to number
                transformed[internalKey] = currencyToFloat(value);
            } else {
                transformed[internalKey] = value;
            }
        });
        
        return transformed;
    });

    return renamedJsonData;
}


function getTemplateTableNames() {
    const names = { "Data": 'date', "Descrição": 'description', "Valor": 'value', "Pessoa": 'user', "Categoria": 'classification' };
    return names
}


function parseDates(data) {
    const d = new Date(data);
    let text = d.toLocaleString();
    return text;
}


/**
 * DEPRECATED: This function made synchronous calls to /api/batchclassifier.
 * Now replaced by async architecture using sendBatchForClassification and pollJobStatus.
 * Kept for reference only.
 */
// const callClassifier = async (data) => {
//     console.log("Sending data to the classifier");
//     let url = '/api/batchclassifier';

//     try {
//         const response = await fetch(url, {
//             method: 'post',
//             headers: {
//                 "Content-Type": "application/json",
//             },
//             // body: {'transactions': data}, // Send data as JSON
//             body: JSON.stringify({ 'transactions': data }), // Send data as JSON
//         });
//         if (!response.ok) {
//             log_api_error(response);
//             throw new Error(`Classifier request failed with status ${response.status}`);
//         }
//         console.log('Classification was successful!');
//         return await response.json();
//     } catch (error) {
//         console.error('Error running classifier!', error);
//         throw error; // Re-throw to be caught by the caller
//     }
// }