/*
  Função para validar os inputs da transação
*/
const getTransactionErrors = (username, date, value, type, category) => {
    let errors = [];
  
    // Validar username (não pode estar vazio)
    if (!username.trim()) {
      errors.push("Nome de usuário não pode estar vazio");
    }
  
    // Validar data (deve ser uma data válida)
    if (!isValidDate(date)) {
      errors.push("Data inválida");
    }
  
    // Validar valor (deve ser um número positivo)
    if (!isPositiveNumber(value)) {
      errors.push("Valor deve ser um número positivo");
    }
  
    // Validar tipo (deve ser 'entrada' ou 'saída')
    if (type !== 'entrada' && type !== 'saída') {
      errors.push("Tipo deve ser 'entrada' ou 'saída'");
    }
  
    // Validar categoria (não pode estar vazia)
    if (!category.trim()) {
      errors.push("Categoria não pode estar vazia");
    }
  
    // Se houver erros, exibi-los
    if (errors.length > 0) {
      alert("Erros encontrados:\n" + errors.join("\n"));
      return errors;
    }
  
    return errors;
  }
  
  // Função auxiliar para validar data
  const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
  
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
  }
  
  // Função auxiliar para validar número positivo
  const isPositiveNumber = (value) => {
    const number = parseFloat(value);
    return !isNaN(number) && number > 0;
  }