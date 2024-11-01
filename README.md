# Controle Financeiro

Este projeto é uma aplicação web para controle financeiro, permitindo o cadastro e gerenciamento de receitas, despesas, categorias e parcelas. A aplicação foi desenvolvida utilizando uma arquitetura backend com Python e FastAPI, e um frontend com HTML, CSS e JavaScript puro.

## Estrutura do Projeto

### Backend

- **FastAPI**: Framework para construção da API RESTful.
- **Banco de Dados**: Utiliza o Neon como banco de dados.
- **Operações CRUD**: Implementadas para gerenciar categorias, transações e parcelas.
- **CORS**: Configuração de CORS para permitir requisições de origem cruzada.

### Frontend

- **HTML/CSS/JavaScript**: Utilizado para construção da interface do usuário.
- **ECharts**: Biblioteca utilizada para a criação de gráficos que mostram a relação entre receitas e despesas, além de comparativos de gastos por categoria.
- **Responsividade**: O layout foi projetado para ser responsivo, adaptando-se a diferentes tamanhos de tela.

## Funcionalidades

- **Cadastro de Receitas e Despesas**: Permite o registro de entradas e saídas financeiras.
- **Cadastro de Categorias**: Gerenciamento de categorias de despesas e receitas.
- **Parcelamento**: Opção de cadastrar transações parceladas com controle de faturas.
- **Gráficos**: Visualização gráfica das finanças com ECharts, incluindo:
  - Gráfico de linha para comparação de receita e despesa.
  - Gráfico de pizza para análise de maiores gastos por categoria.
- **Histórico Mensal**: Exibição de um histórico detalhado de transações e faturas.

## Configuração do Ambiente

1. Clone este repositório em sua máquina local.
2. Crie um arquivo `.env` para armazenar suas variáveis de ambiente (por exemplo, configurações do banco de dados).
3. Instale as dependências do backend e inicie a API usando FastAPI.
4. Abra um servidor local (por exemplo, usando Python ou Node.js) para servir os arquivos do frontend.

## Contribuição

Sinta-se à vontade para contribuir com o projeto, sugerindo melhorias ou reportando problemas. Todas as contribuições são bem-vindas!