require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');


const app = express()
const cors = require("cors")


const PORT = process.env.PORT || 3000
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};


// Middleware para analisar corpos de requisição
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors(corsOptions))


// Rotas
const financas = require('./routes/financas')


// Usar rotas
app.use('/financas', financas)


// Iniciar servidor
const DB_URI = process.env.DB_URI;

mongoose.connect(DB_URI)
  .then(() => {

    console.log('Conectado ao banco de dados MongoDB');

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {

    console.error('Erro ao conectar ao banco de dados MongoDB:', err);
  });