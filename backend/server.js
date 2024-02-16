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

// // Middleware para verificar a chave da API em cada solicitação
// app.use((req, res, next) => {
//   const apiKey = req.headers['api-key'];

//   if (apiKey && apiKey === process.env.DATA_API_KEY) {
//     // Chave da API válida, permitir a continuação da solicitação
//     next();
//   } else {
//     // Chave da API inválida ou ausente, retornar erro de autenticação
//     res.status(401).json({ error: 'Unauthorized' });
//   }
// });



// Rotas
const financas = require('./routes/financas')


// Usar rotas
app.use('/financas', financas)


// Iniciar servidor
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(() => {

    console.log('Conectado ao banco de dados MongoDB');

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  })
  .catch((err) => {

    console.error('Erro ao conectar ao banco de dados MongoDB:', err);
  });