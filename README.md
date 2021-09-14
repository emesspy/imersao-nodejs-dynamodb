# imersao-nodejs-dynamodb

## Tecnologias utilizadas

* NodeJs  
* Typescript  
* Jest  
* DynamoDB  
* Docker e Docker compose

# Objetivo
Devido ao grande sucesso do nosso sistema, a companhia decidiu disponibilizar as APIs para empresas que gostariam de ter o seu próprio banco, tornando nosso sistema em um Banking as a Service. Com isso em mente devemos evoluir o sistema que simula operações de um Banco para utilizar DynamoDB e permitir multi-tenacidade.

# Descrição

Neste momento é necessário as seguintes alterações no sistema:
* Alterar as tabelas hash para DynamoDB  
* Separar os dados dos clientes em multi-tenancy  
* O mesmo cliente pode ter uma conta em vários bancos  
* Não deve haver transferência entre contas de bancos diferentes

# Requisitos técnicos
* Todos os inputs da aplicação devem ser originados a partir de um arquivo json, ver exemplo do input em src/input/input_with_tenant.json
* A informação do tenancy será informado no campo “organization” em cada operação  
* Cobertura dos testes unitários devem ser de 90% 
* Para o armazenamento dos dados utilizar apenas o DynamoDB  
* Para execução do DynamoDB utilize o docker-compose
