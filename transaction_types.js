
async function listTransactionTypes(){  
    let url = 'http://127.0.0.1:5000/transaction_types'
    const response = await fetch(url, {
    method: 'get',
    })

    if (response.ok) {
        console.log('Transaction types were obtained');        
        const types = await response.json();
        populateTransactionTypesDropdown(types);

    } else {
        log_api_error(response);
    }      
}

function populateTransactionTypesDropdown(types){  
    console.log('Filling types dropdown');
    let dropdown = document.getElementById('TransactionTypeId');

    // Clear existing options
    dropdown.innerHTML = '';

    // Populate the dropdown with user options
    types.forEach(ttype => {
        const option = document.createElement('option');
        option.textContent = `${ttype.transaction_type}`; // Display full name
        option.value = ttype.id; // Use user ID as the value
        dropdown.appendChild(option);
    });

}
listTransactionTypes()
