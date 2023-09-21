// Importe o módulo 'pg'
const { Pool } = require('pg');

// Configurações da conexão com o banco de dados PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'webpro',
  password: 'P@ssw0rd',
  port: 5432, 
});

module.exports = pool;
