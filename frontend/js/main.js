// import { apiGet, apiPost, apiPut, apiDelete } from './api.js';

// // Função para criar uma nova categoria
// async function createCategoria() {
//     const categoria = {
//         nome: "Educação",
//         tipo: "despesa"
//     };
//     const result = await apiPost("/categorias/", categoria);
//     if (result) {
//         console.log("Categoria criada:", result);
//         readCategorias(); // Atualiza a lista de categorias após a criação
//     }
// }

// // Função para obter e exibir todas as categorias
// async function readCategorias() {
//     const categorias = await apiGet("/categorias/");
//     const categoriasContainer = document.getElementById("categorias-container");
//     categoriasContainer.innerHTML = ""; // Limpa o conteúdo antes de exibir

//     categorias.forEach(categoria => {
//         const categoriaItem = document.createElement("div");
//         categoriaItem.classList.add("categoria-item");
//         categoriaItem.innerHTML = `
//             <p><strong>Nome:</strong> ${categoria.nome}</p>
//             <p><strong>Tipo:</strong> ${categoria.tipo}</p>
//             <button onclick="deleteCategoria(${categoria.id})">Deletar</button>
//             <button onclick="updateCategoria(${categoria.id})">Atualizar</button>
//         `;
//         categoriasContainer.appendChild(categoriaItem);
//     });
// }

// // Função para atualizar uma categoria
// async function updateCategoria(id) {
//     const categoriaAtualizada = {
//         nome: "Saúde",
//         tipo: "despesa"
//     };
//     const result = await apiPut(`/categorias/${id}`, categoriaAtualizada);
//     if (result) {
//         console.log("Categoria atualizada:", result);
//         readCategorias(); // Atualiza a lista após a atualização
//     }
// }

// // Função para deletar uma categoria
// async function deleteCategoria(id) {
//     const result = await apiDelete(`/categorias/${id}`);
//     if (result) {
//         console.log("Categoria deletada:", result);
//         readCategorias(); // Atualiza a lista após a exclusão
//     }
// }

// // Função para inicializar a aplicação e exibir as categorias
// function init() {
//     readCategorias();

//     // Exemplo de como chamar a função createCategoria (pode ser amarrada a um evento)
//     document.getElementById("create-categoria-btn").addEventListener("click", createCategoria);
// }

// // Inicializa a aplicação quando o DOM estiver carregado
// document.addEventListener("DOMContentLoaded", init);
