# Tweteroo - Backend

Este é o **servidor backend** para a aplicação **Tweteroo**, desenvolvido com **Node.js**, **Express** e **MongoDB**.  
Ele fornece a API responsável por gerenciar usuários e tweets.

## Funcionalidades

O servidor implementa as seguintes rotas principais:

* **`POST /sign-up`** – Cadastra um novo usuário.
* **`POST /tweets`** – Cria um novo tweet.
* **`GET /tweets`** – Retorna uma lista de tweets.
* **`PUT /tweets/:id`** – Atualiza um tweet existente.
* **`DELETE /tweets/:id`** – Deleta um tweet.

## Tecnologias Utilizadas

* **Node.js** – Ambiente de execução.
* **Express** – Framework web para Node.js.
* **MongoDB** – Banco de dados NoSQL para persistência dos dados.
* **Joi** – Biblioteca para validação de esquemas.
