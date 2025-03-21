// import { getTransactionErrors } from './transaction_validation.js';

/*
  Função para obter a lista existente do servidor via requisição GET
*/
const getList = async () => {
  let url = 'http://127.0.0.1:5000/transactions';
  fetch(url, {
    method: 'get',
  })
    .then((response) => response.json())
    .then((data) => {
      data.produtos.forEach(item => insertList(item.nome, item.quantidade, item.valor))
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

/*
  Chamada da função para carregamento inicial dos dados
*/
getList()

/*
  Função para adicionar uma nova transação 
*/
const addTransaction = () => {
  let username = document.querySelector('#User > .newTransaction').value;
  let date = document.querySelector('#Date > .newTransaction').value;
  let value = document.querySelector('#Value > .newTransaction').value;
  let type = document.querySelector('#Type > .newTransaction').value;
  let category = document.querySelector('#Category > .newTransaction').value;

  let errors_in_transaction = getTransactionErrors(username, date, value, type, category);

  if( errors_in_transaction.length == 0 ) {
    postTransaction(username, date, value, type, category)
    alert("Transação adicionada!")
  } else{
    alert("Preencha todos os campos corretamente! Os seguintes erros foram encontrados: \n" + errors_in_transaction.join("\n"))
  }
}