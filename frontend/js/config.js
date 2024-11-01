// config.js
import dotenv from 'dotenv';

dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

const API_BASE_URL = process.env.API_BASE_URL; // Acessa a variável de ambiente

if (!API_BASE_URL) {
    throw new Error("API_BASE_URL não está definida no arquivo .env");
}

export { API_BASE_URL };
