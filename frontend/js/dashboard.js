import { apiGet } from './api.js';

function renderGraficoReceitaDespesa() {
    const chartDom = document.getElementById('grafico-receita-despesa');
    const myChart = echarts.init(chartDom);
    const option = {
        title: { text: 'Receita vs Despesa' },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross'
            }
        },
        legend: { data: ['Receita', 'Despesa'] },
        xAxis: {
            type: 'category',
            data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                name: 'Receita',
                type: 'line',
                data: [500, 700, 1050, 1000, 850, 950, 1300, 1500, 1200, 1450, 1600, 2000],
                itemStyle: {
                    color: 'green'
                },
                lineStyle: {
                    color: 'green'
                },
                areaStyle: {
                    color: 'rgba(0, 128, 0, 0.05)' // Fundo verde com opacidade de 0.05
                }
            },
            {
                name: 'Despesa',
                type: 'line',
                data: [400, 600, 800, 850, 750, 700, 900, 1200, 1100, 1300, 1400, 1600],
                itemStyle: {
                    color: 'red'
                },
                lineStyle: {
                    color: 'red'
                },
                areaStyle: {
                    color: 'rgba(255, 0, 0, 0.05)' // Fundo vermelho com opacidade de 0.05
                }
            }
        ]
    };
    myChart.setOption(option);
}

function renderGraficoMaioresGastos() {
    const chartDom = document.getElementById('grafico-maiores-gastos');
    const myChart = echarts.init(chartDom);

    const colors = [
        'rgba(255, 107, 107, 1)', 'rgba(255, 217, 61, 1)', 'rgba(107, 203, 119, 1)', 'rgba(77, 150, 255, 1)',
        'rgba(240, 101, 149, 1)', 'rgba(255, 111, 145, 1)', 'rgba(255, 160, 122, 1)', 'rgba(135, 206, 235, 1)',
        'rgba(50, 205, 50, 1)', 'rgba(255, 215, 0, 1)', 'rgba(255, 69, 0, 1)', 'rgba(218, 112, 214, 1)',
        'rgba(186, 85, 211, 1)', 'rgba(255, 140, 0, 1)', 'rgba(30, 144, 255, 1)', 'rgba(0, 206, 209, 1)',
        'rgba(148, 0, 211, 1)', 'rgba(255, 20, 147, 1)', 'rgba(123, 104, 238, 1)', 'rgba(250, 128, 114, 1)',
        'rgba(65, 105, 225, 1)', 'rgba(0, 191, 255, 1)', 'rgba(127, 255, 0, 1)', 'rgba(220, 20, 60, 1)',
        'rgba(255, 99, 71, 1)', 'rgba(255, 69, 0, 1)', 'rgba(46, 139, 87, 1)', 'rgba(70, 130, 180, 1)',
        'rgba(210, 105, 30, 1)', 'rgba(199, 21, 133, 1)'
    ];

    const backgroundColors = colors.map(color => color.replace('1)', '0.05)'));

    const option = {
        title: { text: 'Maiores Gastos por Categoria', left: 'center' },
        tooltip: { trigger: 'item' },
        legend: {
            orient: 'vertical',
            left: 'left'
        },
        series: [
            {
                name: 'Gastos',
                type: 'pie',
                radius: ['45%', '60%'],
                data: [
                    { value: 1048, name: 'Alimentação', itemStyle: { color: colors[0], borderColor: backgroundColors[0], borderWidth: 8 } },
                    { value: 735, name: 'Transporte', itemStyle: { color: colors[1], borderColor: backgroundColors[1], borderWidth: 8 } },
                    { value: 580, name: 'Educação', itemStyle: { color: colors[2], borderColor: backgroundColors[2], borderWidth: 8 } },
                    { value: 484, name: 'Lazer', itemStyle: { color: colors[3], borderColor: backgroundColors[3], borderWidth: 8 } },
                    { value: 300, name: 'Saúde', itemStyle: { color: colors[4], borderColor: backgroundColors[4], borderWidth: 8 } }
                ],
                emphasis: {
                    itemStyle: {
                        border: 1,
                        borderColor: "#fff",
                    }
                }
            }
        ]
    };

    myChart.setOption(option);
}


// Função para carregar o histórico com paginação
let paginaAtual = 1;
async function carregarHistorico(pagina) {
    const historicoCorpo = document.getElementById("historico-corpo");
    historicoCorpo.innerHTML = "";  // Limpa o conteúdo atual
    const historico = await apiGet(`/transacoes?pagina=${pagina}`);

    historico.transacoes.forEach(transacao => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${transacao.data_hora}</td>
            <td>${transacao.tipo}</td>
            <td>${transacao.descricao}</td>
            <td>${transacao.categoria}</td>
            <td>R$ ${transacao.valor}</td>
        `;
        historicoCorpo.appendChild(linha);
    });

    // Atualiza os botões de paginação
    document.getElementById("pagina-atual").innerText = `Página ${pagina}`;
    document.getElementById("anterior").disabled = pagina <= 1;
    document.getElementById("proximo").disabled = !historico.temMaisPaginas;
    paginaAtual = pagina;
}

document.getElementById("anterior").addEventListener("click", () => carregarHistorico(paginaAtual - 1));
document.getElementById("proximo").addEventListener("click", () => carregarHistorico(paginaAtual + 1));

// Função para carregar as faturas
async function carregarFaturas() {
    const faturasCorpo = document.getElementById("faturas-corpo");
    faturasCorpo.innerHTML = "";  // Limpa o conteúdo atual
    const faturas = await apiGet("/faturas/");

    faturas.forEach(fatura => {
        const linha = document.createElement("tr");
        linha.innerHTML = `
            <td>${fatura.mes}</td>
            <td>${fatura.ano}</td>
            <td>R$ ${fatura.total}</td>
        `;
        faturasCorpo.appendChild(linha);
    });
}

// Inicializa os gráficos e dados ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    renderGraficoReceitaDespesa();
    renderGraficoMaioresGastos();
    carregarHistorico(paginaAtual);
    carregarFaturas();
});
