// Seleciona o menu e o botão de alternância
const menu = document.getElementById('responsive-menu');
const toggleButton = document.createElement('button');

// Configurações do botão de alternância
toggleButton.innerText = 'Menu';
toggleButton.classList.add('menu-toggle');
toggleButton.onclick = () => {
    menu.classList.toggle('menu-open');  // Alterna a classe 'menu-open' para exibir/ocultar o menu
};

// Adiciona o botão de alternância ao cabeçalho
document.querySelector('header').appendChild(toggleButton);

// Ajusta o menu de acordo com o tamanho da janela
function adjustMenu() {
    if (window.innerWidth > 768) {
        menu.classList.remove('menu-open');  // Exibe o menu em telas grandes
        toggleButton.style.display = 'none';  // Oculta o botão em telas grandes
    } else {
        toggleButton.style.display = 'block'; // Exibe o botão em telas menores
    }
}

// Adiciona um listener para ajustar o menu ao redimensionar a janela
window.addEventListener('resize', adjustMenu);
document.addEventListener('DOMContentLoaded', adjustMenu);  // Chama a função ao carregar a página
