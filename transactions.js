
const log_api_error = (response) =>{
    if (response.status === 400) {
        console.error('Bad request');
        // Handle bad request (e.g., invalid data)
      } else if (response.status === 401) {
        console.error('Unauthorized');
        // Handle unauthorized access
      } else if (response.status === 500) {
        console.error('Server error');
        // Handle server error
      } else {
        console.error(`Unexpected status code: ${response.status}`);
      }
}
const getTransactions = async () => {
    let url = 'http://127.0.0.1:5000/transactions';
    const response = await fetch(url, {
      method: 'get',
    })

    if (response.statusCode === 200 && response.ok) {
        console.log('loading all transactions:', response);
        
        const data = response.json();
        console.log('json:', data);
        console.log('Filling table:');
        data.forEach(item => insertList(item.transaction_date, item.value, item.user, item.category, item.type))
        "created_at": "Fri, 14 Mar 2025 19:44:28 GMT",
        "id": 1,
        "transaction_category_id": 1,
        "transaction_date": null,
        "transaction_type_id": 1,
        "user_id": 1,
        "value": 100.0
        .catch((error) => {
            console.error('Error:', error);
          });

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