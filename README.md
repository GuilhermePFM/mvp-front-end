# Controle Financeiro - MVP Front-End
## Descrição do Projeto

Este é o repositório do **front-end** do projeto **Controle Financeiro**, desenvolvido como parte do MVP (Minimum Viable Product) para a Pós-Graduação em Engenharia de Software da PUC Rio. O objetivo do projeto é fornecer uma interface intuitiva e funcional para gerenciar finanças pessoais e familiares, permitindo o controle de transações, categorias e usuários de forma eficiente.

A aplicação foi construída utilizando **HTML**, **CSS**, **JavaScript** e **Bootstrap**, garantindo uma experiência responsiva e moderna para os usuários.

**Diferencial do Projeto**: A aplicação integra **Machine Learning** para classificação automática de transações financeiras. Através de um modelo de embeddings, o sistema sugere automaticamente categorias para despesas importadas, facilitando o gerenciamento financeiro e reduzindo o trabalho manual de categorização.
## Índice
- [Controle Financeiro - MVP Front-End](#controle-financeiro---mvp-front-end)
  - [Descrição do Projeto](#descrição-do-projeto)
  - [Índice](#índice)
  - [Arquitetura do Sistema](#arquitetura-do-sistema)
    - [Fluxo de Classificação Automática](#fluxo-de-classificação-automática)
  - [Funcionalidades](#funcionalidades)
  - [Tecnologias Utilizadas](#tecnologias-utilizadas)
  - [Pré-requisitos](#pré-requisitos)
  - [Como Executar](#como-executar)
    - [Passo 1: Clone o Repositório](#passo-1-clone-o-repositório)
    - [Passo 2: Configure o Backend](#passo-2-configure-o-backend)
    - [Passo 3: Configure a API de Embeddings](#passo-3-configure-a-api-de-embeddings)
    - [Passo 4: Inicie a Aplicação Front-End](#passo-4-inicie-a-aplicação-front-end)
    - [Passo 5: Acesse a Aplicação](#passo-5-acesse-a-aplicação)
  - [Formato do Arquivo de Importação](#formato-do-arquivo-de-importação)
    - [Exemplo de Template Excel](#exemplo-de-template-excel)
  - [Organização do Projeto](#organização-do-projeto)
    - [Estrutura de Arquivos](#estrutura-de-arquivos)
    - [Descrição dos Arquivos](#descrição-dos-arquivos)
  - [Endpoints da API](#endpoints-da-api)
    - [Transações](#transações)
    - [Usuários](#usuários)
    - [Categorias](#categorias)
    - [Tipos de Transação](#tipos-de-transação)
  - [Fluxo de Uso](#fluxo-de-uso)
    - [1. Importar Transações (Recomendado)](#1-importar-transações-recomendado)
    - [3. Adicionar Transação Manual (Alternativa)](#3-adicionar-transação-manual-alternativa)
    - [4. Visualizar e Analisar](#4-visualizar-e-analisar)
  - [Contribuição](#contribuição)



## Arquitetura do Sistema

Este projeto faz parte de uma arquitetura de **3 microserviços**:

![alt text](frontend.png)

1. **Front-End (Este Repositório)**: Interface web que permite aos usuários gerenciar suas finanças, importar transações e visualizar dados. Comunicação via API REST com o backend.

2. [Backend Geral](https://github.com/GuilhermePFM/mvp-api):
   - Gerencia a lógica de negócio
   - Armazena dados de usuários, transações, categorias e tipos
   - Orquestra a comunicação com a API de embeddings
   - Fornece endpoints REST para o front-end
   - Utiliza modelos de Machine Learning para classificação automática
   - Retorna sugestões de categorias baseadas em similaridade semântica

3. [API de Embeddings](https://github.com/GuilhermePFM/mvp-embedding): Microserviço especializado que:
   - Calcula embeddings (representações vetoriais) das descrições de transações
   - Realiza uma chamada externa à API do google (gemni)
   - API key foi informada na plataforma do MVP

### Fluxo de Classificação Automática

```
1. Usuário faz upload de arquivo Excel com transações
   ↓
2. Front-end processa o arquivo e envia dados para o backend (POST /batchclassifier)
   ↓
3. Backend extrai as descrições das transações
   ↓
4. Backend envia descrições para a API de Embeddings
   ↓
5. API de Embeddings calcula vetores 
   ↓
6. Backend retorna transações classificadas para o front-end
   ↓
7. Usuário visualiza preview com categorias sugeridas
   ↓
8. Usuário pode revisar/ajustar categorias antes de confirmar importação
   ↓
9. Transações são salvas no banco de dados (POST /transactions)
```

## Funcionalidades

- ✅ **Criação de Transações Individuais**: Registre transações manualmente uma por vez
- ✅ **Importação em Lote via Excel**: Importe múltiplas transações de uma vez através de arquivos Excel (.xlsx)
- ✅ **Classificação Automática com Machine Learning**: O sistema sugere automaticamente categorias para as transações importadas usando embeddings
- ✅ **Gerenciamento de Categorias**: Crie categorias personalizadas para organizar suas despesas e receitas
- ✅ **Tipos de Transações**: Diferencie entre receitas, despesas e outros tipos de movimentações
- ✅ **Preview antes de Importar**: Revise e ajuste as classificações sugeridas antes de salvar definitivamente

## Tecnologias Utilizadas

- **HTML5**: Estrutura semântica da aplicação
- **CSS3**: Estilização personalizada da interface
- **JavaScript (ES6+)**: Lógica de front-end e manipulação do DOM
- **Bootstrap 5.2.3**: Framework CSS para design responsivo e componentes UI
- **jQuery 3.7.1**: Biblioteca JavaScript para manipulação simplificada do DOM
- **SheetJS (XLSX 0.18.5)**: Biblioteca para parsing e processamento de arquivos Excel
- **Fetch API**: Comunicação síncrona com o backend

## Pré-requisitos

Antes de executar a aplicação, certifique-se de ter:

1. **Navegador Web Moderno**: Chrome, Firefox, Edge ou Safari (versões recentes)
2. **Backend API em Execução**: O backend deve estar rodando e acessível
   - Repositório: [mvp-api](https://github.com/GuilhermePFM/mvp-api)
   - URL padrão: `http://127.0.0.1:5000`
3. **API de Embeddings em Execução** 
   - Necessário para a funcionalidade de classificação ML
   - URL padrão `http://127.0.0.1:5001`
4. **Servidor Web Local** (para desenvolvimento):
   - Live Server (extensão do VS Code), ou
   - Python: `python -m http.server 8000`, ou
   - Node.js: `npx http-server`

## Como Executar

### Passo 1: Clone o Repositório
```bash
git clone https://github.com/seu-usuario/mvp-front-end.git
cd mvp-front-end
```

### Passo 2: Configure o Backend
Siga as instruções de configuração e execução no repositório [mvp-api](https://github.com/GuilhermePFM/mvp-api).

O backend deve estar rodando em `http://127.0.0.1:5000` (configuração padrão).

### Passo 3: Configure a API de Embeddings
Siga as instruções de configuração e execução no repositório [mvp-embedding](https://github.com/GuilhermePFM/mvp-embedding).

O backend deve estar rodando em `http://127.0.0.1:5001` (configuração padrão).

### Passo 4: Inicie a Aplicação Front-End

**Abrindo Diretamente no Navegador:**
```bash
# Simplesmente abra o arquivo index.html no seu navegador
```

### Passo 5: Acesse a Aplicação
Abra seu navegador e acesse a URL onde a aplicação está sendo servida. A interface estará pronta para uso!

## Formato do Arquivo de Importação

Para utilizar a funcionalidade de importação em lote, seu arquivo Excel (.xlsx) deve seguir o formato específico:

### Exemplo de Template Excel

| Data       | Descrição                    | Valor     | Pessoa |
|------------|------------------------------|-----------|--------|
| 2024-01-15 | Supermercado Extra          | 250,50    | João  | 
| 2024-01-16 | Posto de Gasolina          | 180,00    | Maria |
| 2024-01-17 | Netflix Assinatura         | 39,90     | João |

**Especificações das Colunas:**

1. **Data**: Formato `YYYY-MM-DD` ou `DD/MM/YYYY`
2. **Descrição**: Texto descritivo da transação (usado pelo ML para classificação)
3. **Valor**: Valor numérico no formato brasileiro (ex: `1.250,50`) ou internacional (ex: `1250.50`)
4. **Pessoa**: Nome do membro da família responsável pela transação
5. **Categoria**: Categoria da transação (pode ficar em branco para classificação automática)

**Observações:**
- O arquivo deve conter um cabeçalho com os nomes exatos das colunas
- Valores em branco na coluna "Categoria" serão preenchidos automaticamente pelo sistema ML
- Certifique-se de que as pessoas mencionadas já estão cadastradas no sistema
- Categorias não existentes serão criadas automaticamente (se suportado pelo backend)

## Organização do Projeto

O projeto está organizado em uma estrutura de arquivos e pastas que facilita o desenvolvimento e a manutenção do código.

### Estrutura de Arquivos
```plaintext 
mvp-front-end/
├── index.html                  # Arquivo principal da aplicação (estrutura HTML)
├── styles.css                  # Arquivo de estilos personalizados (CSS)
├── batch_import.js             # Script para importação em lote e classificação ML
├── transactions.js             # Script para gerenciar transações e categorias
├── transaction_types.js        # Script para gerenciar tipos de transações
├── transaction_validation.js   # Script para validação de transações
├── category.js                 # Script para gerenciar categorias
├── user.js                     # Script para gerenciar usuários/família
├── utils.js                    # Script com funções utilitárias
├── img/                        # Pasta para imagens e recursos visuais
└── README.md                   # Documentação do projeto
```

### Descrição dos Arquivos

- **`index.html`**:
  - Arquivo principal que define a estrutura da interface do usuário
  - Contém os elementos HTML para navbar, tabelas, modais e botões
  - Inclui modais para: criação de transações, importação em lote, gerenciamento de usuários e categorias

- **`styles.css`**:
  - Arquivo de estilos personalizados para a aplicação
  - Define o design visual: cores, fontes, espaçamentos e estilos de componentes
  - Complementa os estilos do Bootstrap com customizações específicas

- **`batch_import.js`** ⭐:
  - **Funcionalidade principal do projeto**
  - Parse de arquivos Excel (.xlsx) usando a biblioteca SheetJS
  - Validação de formato e estrutura dos dados importados
  - Integração com a API de classificação ML (`/batchclassifier`)
  - Exibição de preview interativo com dropdowns para revisão
  - Formatação de valores monetários e datas
  - Envio de lote de transações para o backend (`/transactions`)

- **`transactions.js`**:
  - Script responsável por gerenciar transações financeiras
  - Funções para listar, adicionar e formatar transações
  - Cálculo automático de totais
  - Formatação de valores em moeda brasileira (BRL)
  - Atualização dinâmica da tabela de transações

- **`transaction_types.js`**:
  - Script responsável por gerenciar os tipos de transações
  - Lista tipos disponíveis (receita, despesa, transferência, etc.)
  - Popula dropdown de seleção de tipos

- **`category.js`**:
  - Script responsável por gerenciar as categorias de transações
  - Funcionalidades para criar, listar e manipular categorias
  - Popula dropdowns de categorias nos formulários

- **`user.js`**:
  - Script responsável por gerenciar usuários/membros da família
  - Funções para listar, criar e manipular usuários
  - Modal de gerenciamento de família
  - Popula dropdowns de seleção de usuários

- **`transaction_validation.js`**:
  - Script responsável por validar os dados das transações
  - Garante que os dados inseridos estejam corretos e completos

- **`utils.js`**:
  - Script com funções utilitárias reutilizáveis
  - Tratamento de erros de API
  - Criação dinâmica de elementos HTML (dropdowns, componentes)
  - Funções auxiliares para formatação e manipulação de dados

- **`README.md`**:
  - Arquivo de documentação do projeto
  - Contém informações sobre objetivo, arquitetura, organização e instruções

## Endpoints da API

A aplicação front-end consome os seguintes endpoints do backend:

### Transações
- `GET /transactions` - Lista todas as transações
- `POST /transaction` - Cria uma nova transação individual
- `POST /transactions` - Importa múltiplas transações em lote
- `POST /batchclassifier` - Classifica transações usando ML (retorna sugestões de categorias)

### Usuários
- `GET /users` - Lista todos os usuários/membros da família
- `POST /user` - Cria um novo usuário

### Categorias
- `GET /transaction_categories` - Lista todas as categorias
- `POST /transaction_category` - Cria uma nova categoria

### Tipos de Transação
- `GET /transaction_types` - Lista todos os tipos de transação disponíveis

**URL Base Padrão**: `http://127.0.0.1:5000`

## Fluxo de Uso


### 1. Importar Transações (Recomendado)

**Com Classificação Automática ML:**
1. Prepare um arquivo Excel seguindo o [formato especificado](#formato-do-arquivo-de-importação)
2. Clique no botão "Importe Transações"
3. Selecione seu arquivo Excel (.xlsx)
4. Aguarde o processamento e classificação automática (pode levar alguns segundos)
5. Revise as categorias sugeridas pelo sistema ML
6. Ajuste manualmente as categorias, se necessário
7. Selecione as pessoas responsáveis por cada transação
8. Clique em "Importar" para salvar definitivamente

### 3. Adicionar Transação Manual (Alternativa)

1. Clique no botão "Nova Transação"
2. Preencha os campos:
   - Pessoa: Selecione o membro da família
   - Tipo: Escolha o tipo de transação
   - Classe: Selecione a categoria
   - Data: Escolha a data da transação
   - Valor: Insira o valor em reais (R$)
3. Clique em "Adicionar"

### 4. Visualizar e Analisar

- Todas as transações aparecem na tabela principal
- O total é calculado automaticamente no rodapé da tabela
- Use os dados para acompanhar gastos e receitas da família

## Contribuição

Este projeto foi desenvolvido como MVP para a Pós-Graduação em Engenharia de Software da PUC Rio.

Para reportar problemas ou sugerir melhorias, entre em contato com o desenvolvedor ou abra uma issue no repositório.

---