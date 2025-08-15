const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Importar rotas do servidor
const { createRoutes } = require('../../server/routes');

// Configurar rotas
createRoutes(app);

module.exports.handler = serverless(app);
