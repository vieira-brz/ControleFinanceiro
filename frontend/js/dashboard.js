import { apiGet } from './api.js';

async function renderGraficoReceitaDespesa() {
    const faturas = {}; // Um objeto para agrupar faturas por mês e ano

    try {
        let ultimo_mes = 0

        // Faz a requisição para obter as transações
        const transacoes = await apiGet("/transacoes/");

        // Filtra as transações fixas e calcula o total
        const valoresFixosDespesa = transacoes
            .filter(transaction => (transaction.fixa === true && transaction.tipo != 'receita'))
            .reduce((total, transaction) => total + parseFloat(transaction.valor), 0);

        // Agrupa transações por mês e ano
        transacoes.forEach(transacao => {
            const mesAtual = new Date().getMonth()
            const dataTransacao = new Date(transacao.data_hora); // Converte a data para objeto Date
            const mesTransacao = dataTransacao.getMonth(); // Obtém o mês (0-11)

            if (mesTransacao >= (mesAtual - 1)) {
                const dataTransacao = new Date(transacao.data_hora); // Converte a data da transação

                let diaTransacao = dataTransacao.getDate(); // Dia da transação
                diaTransacao = diaTransacao < 9 ? `0${diaTransacao}` : diaTransacao

                const mesTransacao = dataTransacao.getMonth() + 1; // Mês da transação (1-12)
                const anoTransacao = dataTransacao.getFullYear(); // Ano da transação

                const chaveFatura = `${diaTransacao}/${mesTransacao}/${anoTransacao}`; // Chave para identificar a fatura

                if (!faturas[chaveFatura]) {
                    // Inicializa a fatura se não existir
                    faturas[chaveFatura] = {
                        dia: diaTransacao,
                        mes: mesTransacao,
                        ano: anoTransacao,
                        receita: 0,
                        despesa: 0
                    };
                }

                // Se a transação for fixa
                if (transacao.fixa) {
                    // Adiciona valores fixos à despesa se não for o mesmo mês
                    if (ultimo_mes !== mesTransacao) {
                        faturas[chaveFatura].despesa += valoresFixosDespesa; // Adiciona valores fixos à despesa
                    }

                    // Para salário 1 no dia 15
                    const chaveFaturaSalario1 = `15/${mesTransacao}/${anoTransacao}`;

                    if (!faturas[chaveFaturaSalario1]) {
                        const salario1 = transacoes.find(transaction => transaction.id === 31);
                        faturas[chaveFaturaSalario1] = {
                            dia: '15',
                            mes: mesTransacao,
                            ano: anoTransacao,
                            receita: salario1 ? parseFloat(salario1.valor) : 0, // Adiciona valores fixos à receita
                            despesa: 0
                        };
                    }

                    // Para salário 2 no dia 28
                    const chaveFaturaSalario2 = `28/${mesTransacao}/${anoTransacao}`;

                    if (!faturas[chaveFaturaSalario2]) {

                        const salario2 = transacoes.find(transaction => transaction.id === 32);
                        faturas[chaveFaturaSalario2] = {
                            dia: '28',
                            mes: mesTransacao,
                            ano: anoTransacao,
                            receita: salario2 ? parseFloat(salario2.valor) : 0, // Adiciona valores fixos à receita
                            despesa: 0
                        };
                    }
                }
                else {
                    // Adiciona o valor da transação à receita ou despesa
                    if (transacao.remetente == null) { // Se não tem remetente, é uma despesa
                        faturas[chaveFatura].despesa += parseFloat(transacao.valor / transacao.parcelas);
                    } else { // Caso contrário, é uma receita
                        faturas[chaveFatura].receita += parseFloat(transacao.valor / transacao.parcelas);
                    }
                }

                ultimo_mes = mesTransacao
            }
        });

        // Supondo que `faturas` seja um objeto com chaves no formato "dia/mês/ano"
        const faturasArray = Object.entries(faturas) // Converte o objeto em um array de pares [chave, valor]
            .map(([key, value]) => ({ key, ...value })) // Mapeia para um novo objeto contendo a chave e os valores
            .sort((a, b) => {
                const dateA = new Date(`${a.key.split('/')[2]}-${a.key.split('/')[1]}-${a.key.split('/')[0]}`);
                const dateB = new Date(`${b.key.split('/')[2]}-${b.key.split('/')[1]}-${b.key.split('/')[0]}`);
                return dateA - dateB; // Ordena por data
            });

        // Renderiza o gráfico com ECharts
        const chartDom = document.getElementById('grafico-receita-despesa');
        const myChart = echarts.init(chartDom);
        const option = {
            title: {
                text: 'Receita vs Despesa',
                left: window.innerWidth > 768 ? '40px' : '0' // Define a margem direita com base na largura da tela
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'cross'
                }
            },
            legend: {
                data: ['Receita', 'Despesa'], 
                orient: 'vertical',
                right: window.innerWidth > 768 ? '80px' : '0' // Define a margem direita com base na largura da tela
            },
            xAxis: {
                type: 'category',
                data: Object.keys(faturasArray).map(key => faturasArray[key].key) // Formata os dados do eixo X
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name: 'Receita',
                    type: 'line',
                    data: Object.values(faturasArray).map(f => f.receita), // Usando as receitas
                    itemStyle: { color: 'green' },
                    lineStyle: { color: 'green' },
                    areaStyle: { color: 'rgba(0, 128, 0, 0.05)' } // Fundo verde com opacidade
                },
                {
                    name: 'Despesa',
                    type: 'line',
                    data: Object.values(faturasArray).map(f => f.despesa), // Usando as despesas
                    itemStyle: { color: 'red' },
                    lineStyle: { color: 'red' },
                    areaStyle: { color: 'rgba(255, 0, 0, 0.05)' } // Fundo vermelho com opacidade
                }
            ]
        };
        myChart.setOption(option);
    } catch (error) {
        console.error("Erro ao carregar as faturas:", error); // Tratamento de erro caso a requisição falhe
    }
}

async function renderGraficoMaioresGastos() {
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

    const categorias = await apiGet("/categorias/");
    const transacoes = await apiGet("/transacoes/");

    // Criar um objeto para armazenar o total gasto por categoria
    const gastosPorCategoria = {};

    // Inicializar o objeto com as categorias
    categorias.forEach(categoria => {
        gastosPorCategoria[categoria.id] = {
            nome: categoria.nome,
            total: 0
        };
    });

    // Calcular o total de gastos por categoria
    transacoes.forEach(transacao => {
        if (transacao.categoria_id != 22) {
            const categoriaId = transacao.categoria_id;
            const valorPorParcela = transacao.valor / (transacao.parcelas || 1); // Considera 1 se parcelas for 0

            if (gastosPorCategoria[categoriaId]) {
                gastosPorCategoria[categoriaId].total += valorPorParcela;
            }
        }
    });

    // Filtrar e mapear os dados para o gráfico
    const data = Object.values(gastosPorCategoria)
        .map(({ nome, total }) => ({ value: total, name: nome }))
        .filter(item => item.value > 0); // Remove categorias sem gastos

    // Configuração do gráfico
    const option = {
        title: { 
            text: 'Maiores Gastos por Categoria', 
            left: 'center',  
        },
        tooltip: { trigger: 'item' },
        // legend: {
        //     show: window.innerWidth > 768,  // Exibe a legenda apenas para telas maiores que 768px
        //     orient: window.innerWidth > 768 ? 'vertical' : 'horizontal',
        //     left: window.innerWidth > 768 ? 'left' : 'center',
        // },        
        series: [
            {
                name: 'Gastos',
                type: 'pie',
                radius: ['30%', '55%'],
                data: data.map((item, index) => ({
                    ...item,
                    itemStyle: {
                        color: colors[index % colors.length],
                        borderColor: backgroundColors[index % backgroundColors.length],
                        borderWidth: 8
                    }
                })),
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
async function carregarHistorico() {
    const historicoCorpo = document.getElementById("historico-corpo");
    historicoCorpo.innerHTML = "";  // Limpa o conteúdo atual

    try {
        const categorias = await apiGet("/categorias");
        const transacoes = await apiGet("/transacoes/");

        transacoes.sort((a, b) => b.data_hora.localeCompare(a.data_hora));

        transacoes.forEach(transacao => {
            const linha = document.createElement("tr");

            const mesAtual = new Date().getMonth()
            const dataTransacao = new Date(transacao.data_hora); // Converte a data para objeto Date
            const mesTransacao = dataTransacao.getMonth(); // Obtém o mês (0-11)

            // Verifica se a data da transação é dentro do mês atual
            if (mesTransacao >= (mesAtual - 1)) {
                linha.innerHTML = `
                    <td>${transacao.fixa ? 'Transação Fixa' : new Date(transacao.data_hora).toLocaleString('pt-BR').split(',')[0]}</td>
                    <td>${transacao.tipo.charAt(0).toUpperCase() + transacao.tipo.slice(1).toLowerCase()}</td>
                    <td>${transacao.destinatario ? transacao.destinatario : 'Eu mesmo'}</td>
                    <td>${transacao.descricao}</td>
                    <td>${categorias.filter(cat => cat.id === transacao.categoria_id)[0]?.nome || 'Sem Categoria'}</td>
                    <td>R$ ${transacao.valor.toFixed(2).replace('.', ',')}</td>
                    <td>${transacao.parcelas == 0 ? "Sem parcelamento." : transacao.parcelas == 1 ? "1 parcela na fatura atual." : `${transacao.parcelas} de ${(transacao.valor / transacao.parcelas).toFixed(2).replace('.', ',')}`}</td>
                `;
            }

            historicoCorpo.appendChild(linha);
        });
    } catch (error) {
        console.error("Erro ao carregar o histórico:", error);
    }
}

// Função assíncrona para carregar as faturas
async function carregarFaturas() {
    // Mapeamento dos meses para exibição
    const meses = {
        1: 'Janeiro',
        2: 'Fevereiro',
        3: 'Março',
        4: 'Abril',
        5: 'Maio',
        6: 'Junho',
        7: 'Julho',
        8: 'Agosto',
        9: 'Setembro',
        10: 'Outubro',
        11: 'Novembro',
        12: 'Dezembro',
    };

    const faturasCorpo = document.getElementById("faturas-corpo");
    faturasCorpo.innerHTML = "";  // Limpa o conteúdo atual do corpo da tabela de faturas

    try {
        // Faz a requisição para obter as transações
        const transacoes = await apiGet("/transacoes/");

        const faturas = {}; // Um objeto para agrupar faturas por mês e ano

        // Filtra as transações fixas
        const valores_fixos = transacoes
            .filter(transaction => (transaction.fixa === true && transaction.tipo != 'receita'))
            .reduce((total, transaction) => total + parseFloat(transaction.valor), 0); // Soma os valores fixos

        // Agrupa transações por mês e ano
        transacoes.forEach(transacao => {
            if (transacao.categoria_id != 22) { // Se não for receita, cai na fatura
                const dataTransacao = new Date(transacao.data_hora); // Converte a data da transação
                const mesTransacao = dataTransacao.getMonth() + 1; // Mês da transação (1-12)
                const anoTransacao = dataTransacao.getFullYear(); // Ano da transação

                // Lógica para lidar com parcelas
                if (!transacao.fixa) { // Apenas para transações não fixas
                    if (transacao.parcelas > 0) { // Verifica se há parcelas
                        for (let i = 0; i < transacao.parcelas; i++) {
                            let mesParcela = mesTransacao + i; // Mês da parcela
                            let anoParcela = anoTransacao; // Ano da parcela

                            // Ajusta mês e ano se ultrapassar dezembro
                            if (mesParcela > 12) {
                                mesParcela -= 12;
                                anoParcela++;
                            }

                            const chaveFatura = `${mesParcela}-${anoParcela}`; // Chave para identificar a fatura
                            if (!faturas[chaveFatura]) {
                                // Inicializa a fatura se não existir
                                faturas[chaveFatura] = {
                                    mes: mesParcela,
                                    ano: anoParcela,
                                    total: 0
                                };
                            }

                            // Adiciona o valor da parcela à fatura
                            faturas[chaveFatura].total += transacao.valor / transacao.parcelas;
                        }
                    } else {
                        const chaveFatura = `${mesTransacao}-${anoTransacao}`; // Chave para fatura única
                        if (!faturas[chaveFatura]) {
                            // Inicializa a fatura se não existir
                            faturas[chaveFatura] = {
                                mes: mesTransacao,
                                ano: anoTransacao,
                                total: 0
                            };
                        }
                        // Adiciona o valor total à fatura
                        faturas[chaveFatura].total += transacao.valor;
                    }
                }
            }
        });

        // Adiciona as faturas no DOM
        for (const key in faturas) {
            const fatura = faturas[key]; // Obtém a fatura agrupada
            const linha = document.createElement("tr"); // Cria uma nova linha na tabela
            linha.innerHTML = `
                <td>${fatura.mes < 10 ? '0' + fatura.mes : fatura.mes} - ${meses[fatura.mes]}</td>
                <td>${fatura.ano}</td>
                <td>R$ ${(fatura.total + valores_fixos).toFixed(2).replace('.', ',')}</td>
            `;
            faturasCorpo.appendChild(linha); // Adiciona a linha à tabela
        }
    } catch (error) {
        console.error("Erro ao carregar as faturas:", error); // Tratamento de erro caso a requisição falhe
    }
}

 // Função para criar o gráfico
 function renderGraficoContasBancarias() {
    const chart = echarts.init(document.getElementById('grafico-contas-bancarias'));
    
    const chartOptions = {
        title: {
            text: 'Saldo em Contas Bancárias',
            left: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: '{a} <br/>{b} : {c} ({d}%)'
        },
        // legend: {
        //     show: window.innerWidth > 768,
        //     orient: window.innerWidth > 768 ? 'vertical' : 'horizontal',
        //     left: window.innerWidth > 768 ? 'left' : 'center',
        //     top: window.innerWidth > 768 ? 'middle' : 'bottom'
        // },
        series: [
            {
                name: 'Saldo',
                type: 'pie',
                radius: '50%',
                data: [
                    { value: 1048, name: 'Conta Corrente' },
                    { value: 735, name: 'Poupança' },
                    { value: 580, name: 'Investimentos' },
                    { value: 484, name: 'Carteira Digital' },
                    { value: 300, name: 'Conta Internacional' }
                ],
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };

    chart.setOption(chartOptions);

    // Redimensiona o gráfico ao redimensionar a tela
    window.addEventListener('resize', () => {
        chartOptions.legend.show = window.innerWidth > 768;
        chartOptions.legend.orient = window.innerWidth > 768 ? 'vertical' : 'horizontal';
        chartOptions.legend.left = window.innerWidth > 768 ? 'left' : 'center';
        chartOptions.legend.top = window.innerWidth > 768 ? 'middle' : 'bottom';
        chart.setOption(chartOptions);
        chart.resize();
    });
}

// Inicializa os gráficos e dados ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    renderGraficoReceitaDespesa();
    renderGraficoMaioresGastos();
    renderGraficoContasBancarias();
    carregarHistorico();
    carregarFaturas();
});