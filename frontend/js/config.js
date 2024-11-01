const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

if (!API_BASE_URL) {
    console.error("A variável de ambiente VITE_API_BASE_URL não está definida.");
}

export { API_BASE_URL };
