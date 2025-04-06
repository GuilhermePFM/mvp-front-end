# Controle Financeiro - MVP Front-End
## Índice
- [Controle Financeiro - MVP Front-End](#controle-financeiro---mvp-front-end)
  - [Índice](#índice)
  - [Descrição do Projeto](#descrição-do-projeto)
  - [Organização do Projeto](#organização-do-projeto)
    - [Estrutura de Arquivos](#estrutura-de-arquivos)
    - [Descrição dos Arquivos](#descrição-dos-arquivos)
    - [Fluxo Geral](#fluxo-geral)

## Descrição do Projeto
Este é o repositório do front-end do projeto **Controle Financeiro**, desenvolvido como parte do MVP (Minimum Viable Product) para a Pós-Graduação em Engenharia de Software da PUC Rio. O objetivo do projeto é fornecer uma interface intuitiva e funcional para gerenciar finanças pessoais e familiares, permitindo o controle de transações, categorias, e usuários de forma eficiente.

A aplicação foi construída utilizando **HTML**, **CSS**, **JavaScript**, e **Bootstrap**, garantindo uma experiência responsiva e moderna para os usuários.

O repositório com o Back-end deste projeto é [https://github.com/GuilhermePFM/mvp-api](https://github.com/GuilhermePFM/mvp-api)

## Organização do Projeto

O projeto está organizado em uma estrutura de arquivos e pastas que facilita o desenvolvimento e a manutenção do código. Abaixo está a descrição de cada arquivo e sua função:

### Estrutura de Arquivos
```plaintext 
mvp-front-end/
├── index.html                # Arquivo principal da aplicação (estrutura HTML)
├── styles.css                # Arquivo de estilos personalizados (CSS)
├── user.js                   # Script para gerenciar usuários (JavaScript)
├── transactions.js           # Script para gerenciar transações e categorias (JavaScript)
├── transaction_types.js      # Script para gerenciar tipos de transações (JavaScript)
├── category.js               # Script para gerenciar categorias (JavaScript)
├── user.js                   # Script para gerenciar categorias (JavaScript)
├── transaction_validation.js # Script para gerenciar criação de usuários (JavaScript)
├── utils.js                  # Script com funções utilitárias (JavaScript)
├── README.md                 # Documentação do projeto
```


### Descrição dos Arquivos

- **`index.html`**:
  - Arquivo principal que define a estrutura da interface do usuário.
  - Contém os elementos HTML para o layout da aplicação, como navbar, tabelas, modais, e botões.

- **`styles.css`**:
  - Arquivo de estilos personalizados para a aplicação.
  - Define o design visual, como cores, fontes, espaçamentos, e estilos de botões e tabelas.

- **`user.js`**:
  - Script responsável por gerenciar as funcionalidades relacionadas aos usuários.
  - Inclui funções para listar, criar e manipular usuários, além de abrir o modal de gerenciamento de usuários.

- **`transactions.js`**:
  - Script responsável por gerenciar transações financeiras.
  - Inclui funções para listar, adicionar e formatar transações.

- **`transaction_types.js`**:
  - Script responsável por gerenciar os tipos de transações.
  - Define e manipula os diferentes tipos de transações disponíveis no sistema.

- **`category.js`**:
  - Script responsável por gerenciar as categorias de transações.
  - Inclui funcionalidades para criar, listar e manipular categorias.

- **`transaction_validation.js`**:
  - Script responsável por validar os dados das transações antes de serem salvas.
  - Garante que os dados inseridos pelo usuário estejam corretos e completos.

- **`utils.js`**:
  - Script com funções utilitárias que são usadas em diferentes partes do projeto.
  - Inclui funções auxiliares para formatação, manipulação de dados e outras tarefas comuns.


- **`README.md`**:
  - Arquivo de documentação do projeto.
  - Contém informações sobre o objetivo do projeto, sua organização, e instruções para desenvolvedores.

### Fluxo Geral
1. **HTML**: Define a estrutura da interface.
2. **CSS**: Aplica o design visual.
3. **JavaScript**: Adiciona interatividade e manipulação dinâmica dos dados.