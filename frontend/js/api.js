// Importa a URL base da API
import { API_BASE_URL } from './config.js';

// Função GET genérica para obter dados
async function apiGet(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        if (!response.ok) {
            throw new Error(`Erro ao obter dados de ${endpoint}: ${response.status} ${response.statusText}`);
        }

        // Tenta converter a resposta em JSON
        try {
            const response_text = await response.json();
            return response_text; // Retorna os dados JSON
            
        } catch (jsonError) {
            console.error(`Erro ao converter resposta em JSON: ${jsonError}`);
            return null; // Retorna null se houver erro na conversão
        }
    } catch (error) {
        console.error("Erro no GET:", error);
        return null; // Retorna null em caso de erro na requisição
    }
}

// Função POST genérica para enviar dados
async function apiPost(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`Erro ao enviar dados: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Erro no POST:", error);
    }
}

// Função PUT genérica para atualizar dados
async function apiPut(endpoint, data) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`Erro ao atualizar dados: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Erro no PUT:", error);
    }
}

// Função DELETE genérica para excluir dados
async function apiDelete(endpoint) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: "DELETE"
        });
        if (!response.ok) {
            throw new Error(`Erro ao excluir dados: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Erro no DELETE:", error);
    }
}

// Exporta as funções para uso em outros arquivos
export { apiGet, apiPost, apiPut, apiDelete };
