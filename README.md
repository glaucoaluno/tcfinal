# Sistema de Doação e Distribuição de Alimentos

Este projeto é uma aplicação front-end para gerenciamento de doações e distribuição de alimentos. Ele permite que se registrev  suas doações, e que administradores gerenciem as doações, famílias beneficiadas e relatórios de distribuição.


## Estrutura do Projeto
A estrutura de pastas do projeto é organizada da seguinte forma:

```
├── index.html
├── script.js
├── styles.css
├── assets/
│   └── imagem/
├── CadastroDoacao/
│   ├── cadastro.html
│   ├── script.js
│   ├── styles.css
│   └── cadastro.json
│
├── Administrativo/
│   ├── index.html
│   ├── script.js
│   ├── styles.css
│   └── Administrativo.json
│
│   ├── FamiliasBeneficiadas/
│   │   ├── index.html
│   │   ├── script.js
│   │   ├── styles.css
│   │   └── Familias.json
│   │
│   ├── RegistroDoacoes/
│   │   ├── index.html
│   │   ├── script.js
│   │   ├── styles.css
│   │   └── Registro.json
│   │
│   └── RelatorioDistribuicao/
│       ├── index.html
│       ├── script.js
│       ├── styles.css
│       └── Relatorio.json
│
├── node_modules/
├── package-lock.json
├── package.json
└── README.md
```

## Funcionalidades

### Página Inicial (`index.html`)
- Dois botões principais: "Quero Doar" e "Área Administrativa".
- Redirecionamento para cadastro de doação ou área administrativa.

### Cadastro de Doação (`CadastroDoacao`)
- Cadastro de doadores (pessoa física ou jurídica).
- Validação de CPF/CNPJ com máscara automática.
- Localizador de CEP para preenchimento automático de endereço.
- Opção para cadastrar email e telefone.
- Opção "Já sou cadastrado" para doadores recorrentes.
- Campos para produto doado, quantidade, peso e opção de entrega/retirada.

### Área Administrativa (`Administrativo`)
- Login com usuário `admin` e senha.
- Acesso às páginas de controle de doações, famílias beneficiadas e relatórios.

### Famílias Beneficiadas (`Administrativo/FamiliasBeneficiadas`)
- Lista de famílias cadastradas.
- Opções para cadastrar novas famílias e beneficiar famílias com doações.
- Botões para confirmar retirada de doação.

### Registro de Doações (`Administrativo/RegistroDoacoes`)
- Histórico de doações recebidas.
- Opções para editar, excluir e registrar novas doações.

### Relatório de Distribuição (`Administrativo/RelatorioDistribuicao`)
- Histórico de doações distribuídas.
- Opções para editar e excluir registros.

## Bibliotecas Utilizadas

- **axios**: Utilizada para realizar requisições HTTP à API Laravel, permitindo a comunicação eficiente entre o front-end e o back-end.
- **http-server**: Usada para executar um servidor local e facilitar a implantação no ambiente Railway para produção.

## Como Executar o Projeto

1. Instale as dependências:
   ```bash
   npm install
2. Inicie o servidor local:
   ```bash
    npx http-server
3. Acesse a aplicação no navegador:
    <br>http://localhost:8080