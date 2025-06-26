import { apiGet } from './api.js';

function estatistica_mensal(transacoes) {
    // Obtém o mês e o ano atuais
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth(); // Janeiro = 0
    const anoAtual = dataAtual.getFullYear(); // Ex.: 2025

    let total_receitas_mes = 0;
    let total_despesas_mes = 0;
    let total_investido_mes = 0;
    let saldo_restante_mes = 0;

    // Filtra as transações do mês atual
    transacoes.forEach(transacao => {
        if (transacao.tipo === 'receita' && transacao.categoria_id !== 27) {
            total_receitas_mes += transacao.valor;
        } 
        else if (transacao.categoria_id === 27) {
            total_investido_mes += transacao.valor;
        } 
        else {
            const dataTransacao = new Date(transacao.data_hora);
            const mesTransacao = new Date(transacao.data_hora).getMonth();

            let parcelas = transacao.parcelas
            if (transacao.fixa) {
                parcelas = 1
            }

            transacao.dataEncerramento = calcularDataEncerramento(dataTransacao, parcelas);

            if ((transacao.tipo !== 'receita' && mesAtual === mesTransacao) || (transacao.tipo !== 'receita' && transacao.dataEncerramento >= dataTransacao) || (transacao.tipo !== 'receita' && transacao.fixa == true)) {
                total_despesas_mes += (transacao.valor / parcelas);
            }
        }
    });

    saldo_restante_mes = total_receitas_mes - total_despesas_mes;

    // Atualiza os valores no DOM
    document.getElementById('receita-mensal-atual').textContent = total_receitas_mes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('despesa-mensal-atual').textContent = total_despesas_mes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('investimento-mensal-atual').textContent = total_investido_mes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    document.getElementById('saldo-mensal-atual').textContent = saldo_restante_mes.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

async function renderGraficoReceitaDespesa() {
    const faturas = {};
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    try {
        const transacoes = await apiGet("/transacoes/");
        estatistica_mensal(transacoes);

        transacoes.forEach(transacao => {
            const data = new Date(transacao.data_hora);
            const isReceita = transacao.remetente !== null;
            const isFixa = transacao.fixa === true;
            const valorParcela = parseFloat(transacao.valor) / (transacao.parcelas || 1);

            if (isFixa && isReceita) {
                const metade = valorParcela / 2;

                const chave15 = `15/${mesAtual}/${anoAtual}`;
                if (!faturas[chave15]) faturas[chave15] = { dia: 15, mes: mesAtual, ano: anoAtual, receita: 0, despesa: 0 };
                faturas[chave15].receita += metade;

                const chave28 = `28/${mesAtual}/${anoAtual}`;
                if (!faturas[chave28]) faturas[chave28] = { dia: 28, mes: mesAtual, ano: anoAtual, receita: 0, despesa: 0 };
                faturas[chave28].receita += metade;

                return;
            }

            if (isFixa && !isReceita) {
                const chave = `15/${mesAtual}/${anoAtual}`;
                if (!faturas[chave]) faturas[chave] = { dia: 15, mes: mesAtual, ano: anoAtual, receita: 0, despesa: 0 };
                faturas[chave].despesa += valorParcela;
                return;
            }

            const dia = isReceita ? 28 : (data.getDate() <= 15 ? 15 : 28);
            const chave = `${dia}/${mesAtual}/${anoAtual}`;
            if (!faturas[chave]) faturas[chave] = { dia, mes: mesAtual, ano: anoAtual, receita: 0, despesa: 0 };

            if (isReceita) {
                faturas[chave].receita += valorParcela;
            } else {
                faturas[chave].despesa += valorParcela;
            }
        });

        const faturasArray = Object.entries(faturas)
            .map(([key, value]) => ({ key, ...value }))
            .sort((a, b) => a.dia - b.dia);

        const chartDom = document.getElementById('grafico-receita-despesa');
        const myChart = echarts.init(chartDom);

        const option = {
            title: {
                text: 'Receita vs Despesa',
                left: window.innerWidth > 768 ? '40px' : ''
            },
            legend: {
                orient: 'vertical',
                right: window.innerWidth > 768 ? '80px' : '0',
                top: '0%',
                itemGap: 15
            },
            tooltip: {
                trigger: 'axis',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: [5, 10],
                confine: true,
                extraCssText: 'width: fit-content; white-space: nowrap;',
                axisPointer: {
                    type: 'cross'
                },
                formatter: function (params) {
                    let tooltipContent = '';
                    params.forEach((item, index) => {
                        const mbottom = index === 0 ? 10 : 0;
                        tooltipContent += `
                            <div style="white-space: nowrap; margin-bottom: ${mbottom}px;">
                                ${item.seriesName} <br>
                                R$ ${item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>`;
                    });
                    return tooltipContent;
                }
            },
            xAxis: {
                type: 'category',
                data: faturasArray.map(f => `${f.dia}/${f.mes}/${f.ano}`),
                axisLabel: {
                    interval: 0,
                    rotate: window.innerWidth > 768 ? 0 : 30
                },
                name: "Data"
            },
            yAxis: {
                type: 'value',
                name: "Valor (R$)",
                axisLabel: {
                    formatter: value => `R$ ${value.toLocaleString('pt-BR')}`
                }
            },
            series: [
                {
                    name: 'Receita',
                    type: 'bar',
                    data: faturasArray.map(f => f.receita),
                    label: {
                        show: true,
                        position: 'top',
                        formatter: p => `R$ ${p.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                        fontSize: 12,
                        color: '#000'
                    },
                    itemStyle: {
                        color: 'rgba(0, 128, 0, .3)',
                        borderColor: 'rgba(0, 128, 0, 1)'
                    }
                },
                {
                    name: 'Despesa',
                    type: 'bar',
                    data: faturasArray.map(f => f.despesa),
                    label: {
                        show: true,
                        position: 'top',
                        formatter: p => `R$ ${p.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                        fontSize: 12,
                        color: '#000'
                    },
                    itemStyle: {
                        color: '#F003',
                        borderColor: '#F00'
                    },
                    markLine: {
                        data: [{ type: 'average', name: 'Média de Despesa' }],
                        lineStyle: { color: '#F007' },
                        label: {
                            show: true,
                            formatter: 'R$ {c}',
                            color: '#F00',
                            fontSize: 8
                        }
                    }
                }
            ]
        };

        myChart.setOption(option);
    } catch (error) {
        console.error("Erro ao carregar as faturas:", error);
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
        tooltip: {
            confine: true,  // Mantém o tooltip dentro dos limites do contêiner
            backgroundColor: 'rgba(255, 255, 255, 0.9)', // Fundo claro para o tooltip
            padding: [5, 10],
            trigger: 'item',
            extraCssText: 'width: auto; white-space: nowrap;', // Força o ajuste ao conteúdo e evita quebra de linha
            formatter: function (params) {
                return `<div style="width: auto; white-space: nowrap;">
                    ${params.seriesName} <br>
                    ${params.name} : R$ ${params.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${params.percent}%)
                </div>`;
            }
        },
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
                label: {
                    show: true,
                    position: 'outside',
                    formatter: function (params) {
                        return `\n${params.name}\n\nR$ ${params.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    },
                    fontSize: 12,
                    color: '#333',
                    distance: 15 // Aumenta o espaçamento entre o rótulo e o gráfico
                },
                labelLine: {
                    show: true,
                    length: 30, // Comprimento da linha que conecta ao gráfico
                    length2: 10 // Segundo segmento da linha
                },
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

function calcularDataEncerramento(dataTransacao, parcelas) {
    const data = new Date(dataTransacao); // Garante que a data é um objeto Date
    data.setMonth(data.getMonth() + parcelas); // Adiciona os meses correspondentes
    return data; // Retorna a nova data
}

// Função para carregar o histórico com paginação
async function carregarHistorico() {
    const historicoCorpo = document.getElementById("historico-corpo");
    historicoCorpo.innerHTML = ""; // Limpa o conteúdo atual

    try {
        const categorias = await apiGet("/categorias");
        const transacoes = await apiGet("/transacoes/");

        // Calcula a data de encerramento para cada transação
        transacoes.forEach(transacao => {
            const dataTransacao = new Date(transacao.data_hora);

            let parcelas = transacao.parcelas
            if (transacao.fixa) {
                parcelas = 0
            }

            transacao.dataEncerramento = calcularDataEncerramento(dataTransacao, parcelas); // Adiciona dataEncerramento
        });

        // Ordena as transações pela data de encerramento
        transacoes.sort((a, b) => a.dataEncerramento - b.dataEncerramento);

        transacoes.forEach(transacao => {
            if (transacao.tipo != 'receita') {
                const linha = document.createElement("tr");

                const dataAtual = new Date();
                const dataInicio = new Date(transacao.data_hora);
                const parcelasPagas = Math.max(0, (dataAtual.getFullYear() - dataInicio.getFullYear()) * 12 + (dataAtual.getMonth() - dataInicio.getMonth()));

                const parcelasExibidas = (transacao.parcelas === 0 || transacao.fixa)
                    ? "Sem parcelamento."
                    : transacao.parcelas === 1
                        ? "1 parcela na fatura atual."
                        : `${transacao.parcelas} de ${(transacao.valor / transacao.parcelas).toFixed(2).replace('.', ',')}`;

                const parcelasPagasExibidas = (transacao.parcelas === 0 || transacao.fixa)
                    ? "-"
                    : Math.min(parcelasPagas, transacao.parcelas); // Garante que não ultrapasse o total

                linha.style.backgroundColor = transacao.fixa ? '#ff990010' : ''

                linha.innerHTML = `
                    <td>${transacao.fixa ? 'Transação Fixa' : dataInicio.toLocaleString('pt-BR').split(',')[0]}</td>
                    <td>${transacao.fixa ? '-' : transacao.dataEncerramento.toLocaleString('pt-BR').split(',')[0]}</td>
                    <td>${transacao.destinatario ? transacao.destinatario.charAt(0).toUpperCase() + transacao.destinatario.slice(1).toLowerCase() : 'Eu mesmo'}</td>
                    <td>${transacao.descricao}</td>
                    <td>${categorias.filter(cat => cat.id === transacao.categoria_id)[0]?.nome || 'Sem Categoria'}</td>
                    <td>${parcelasExibidas}</td>
                    <td>${parcelasPagasExibidas}</td>
                    <td>R$ ${transacao.valor.toFixed(2).replace('.', ',')}</td>
                `;

                historicoCorpo.appendChild(linha);
            }
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

        const receitas = transacoes
            .filter(transaction => (transaction.fixa === true && transaction.tipo == 'receita'))
            .reduce((total, transaction) => total + parseFloat(transaction.valor), 0);

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
            const sobra_mensal = receitas - (fatura.total + valores_fixos); // Calcula sobra mensal com base na fatura atual
            const linha = document.createElement("tr"); // Cria uma nova linha na tabela

            linha.style.backgroundColor = sobra_mensal > 0 ? '#00a40010' : '#ff4d4d10'

            linha.innerHTML = `
                <td>${fatura.mes < 10 ? '0' + fatura.mes : fatura.mes} - ${meses[fatura.mes]}</td>
                <td>${fatura.ano}</td>
                <td>R$ ${receitas.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                <td>R$ ${(fatura.total + valores_fixos).toFixed(2).replace('.', ',')}</td>
                <td style="font-weight: 600;color:${sobra_mensal > 0 ? '#00a400' : '#ff4d4d'}">R$ ${sobra_mensal.toFixed(2).replace('.', ',')}</td>
            `;

            faturasCorpo.appendChild(linha); // Adiciona a linha à tabela
        }
    } catch (error) {
        console.error("Erro ao carregar as faturas:", error); // Tratamento de erro caso a requisição falhe
    }
}

// Função para criar o gráfico
async function renderGraficoBancario() {
    const chart = echarts.init(document.getElementById('grafico-contas-bancarias'));

    // Função para buscar e processar os dados de transações
    async function fetchData() {
        try {
            const transacoes = await apiGet("/transacoes/");

            // Agrupa os valores das transações por destinatário
            const destinatariosMap = {};
            transacoes.forEach(transacao => {
                if (transacao.tipo != 'receita') {
                    const destinatario = transacao.destinatario.charAt(0).toUpperCase() + transacao.destinatario.slice(1).toLowerCase() || 'Outro';
                    destinatariosMap[destinatario] = (destinatariosMap[destinatario] || 0) + transacao.valor;
                }
            });

            // Converte o mapa em uma lista para o gráfico
            return Object.entries(destinatariosMap).map(([name, value]) => ({ name, value }));
        } catch (error) {
            console.error("Erro ao buscar dados de transações:", error);
            return [];
        }
    }

    const chartData = await fetchData();

    const chartOptions = {
        title: {
            text: 'Faturas por Banco',
            left: 'center'
        },
        legend: {
            // show: window.innerWidth > 768,  // Exibe a legenda apenas para telas maiores que 768px
            orient: 'horizontal',
            left: 'center',
            top: '40px',
            show: false, // Desabilita a legenda para telas menores
        },
        tooltip: {
            confine: true,  // Mantém o tooltip dentro dos limites do contêiner
            backgroundColor: 'rgba(255, 255, 255, 0.9)', // Fundo claro para o tooltip
            padding: [5, 10],
            trigger: 'item',
            extraCssText: 'width: auto; white-space: nowrap;', // Força o ajuste ao conteúdo e evita quebra de linha
            formatter: function (params) {
                return `<div style="width: auto; white-space: nowrap;">
                    ${params.seriesName} <br>
                    ${params.name} : R$ ${params.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${params.percent}%)
                </div>`;
            }
        },
        series: [
            {
                name: 'Gastos',
                type: 'pie',
                radius: ['30%', '55%'],
                label: {
                    show: true,
                    position: 'outside',
                    formatter: function (params) {
                        return `\n${params.name}\n\nR$ ${params.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    },
                    fontSize: 12,
                    color: '#333',
                    distance: 15 // Aumenta o espaçamento entre o rótulo e o gráfico
                },
                labelLine: {
                    show: true,
                    length: 30, // Comprimento da linha que conecta ao gráfico
                    length2: 10 // Segundo segmento da linha
                },
                data: chartData.map(item => ({
                    ...item,
                    itemStyle: {
                        color: item.name === 'Inter' ? '#FFA500' : // Laranja para Inter
                            item.name === 'Willbank' ? '#FFD700' : // Amarelo para Will
                                item.name === 'Nubank' ? '#800080' : // Roxo para Nubank
                                    item.name === 'Familiar' ? '#C0C0C0' : // Cinza para Familiar
                                        '#C0C0C0' // Cinza claro para outros
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

    chart.setOption(chartOptions);

    // Ajusta o gráfico ao redimensionar a tela
    window.addEventListener('resize', () => {
        chart.resize();
    });
}

// Função para renderizar o gráfico de fatura por banco usando ECharts
async function renderGraficoFaturaBancariaMensal() {
    // Inicializa o gráfico no elemento com o ID 'grafico-fatura-banco-mes'
    const chart = echarts.init(document.getElementById("grafico-fatura-banco-mes"));

    // Função para buscar e processar os dados de transações de despesas
    async function fetchDataDespesa() {
        try {
            const transacoes = await apiGet("/transacoes/");
            const destinatariosMap = {};
            const mesAtual = new Date().getMonth();

            transacoes.forEach(transacao => {
                const dataTransacao = new Date(transacao.data_hora);
                const mesTransacao = new Date(transacao.data_hora).getMonth();

                let parcelas = transacao.parcelas
                if (transacao.fixa) {
                    parcelas = 1
                }
    
                transacao.dataEncerramento = calcularDataEncerramento(dataTransacao, parcelas);

                if ((transacao.tipo !== 'receita' && mesAtual === mesTransacao) || (transacao.tipo !== 'receita' && transacao.dataEncerramento >= dataTransacao) || (transacao.tipo !== 'receita' && transacao.fixa == true)) {
                    const destinatario = transacao.destinatario.charAt(0).toUpperCase() + transacao.destinatario.slice(1).toLowerCase() || 'Outro';
                    destinatariosMap[destinatario] = (destinatariosMap[destinatario] || 0) + (transacao.valor / (transacao.parcelas || 1));
                }
            });

            return Object.entries(destinatariosMap).map(([name, value]) => ({ name, value }));
        } catch (error) {
            console.error("Erro ao buscar dados de transações:", error);
            return [];
        }
    }

    // Função para buscar e processar os dados de transações de receitas
    async function fetchDataReceita() {
        try {
            const transacoes = await apiGet("/transacoes/");
            const mesAtual = new Date().getMonth();
            let receita = 0;

            transacoes.forEach(transacao => {
                const mesTransacao = new Date(transacao.data_hora).getMonth();
    
                if (transacao.tipo === 'receita') {
                    receita += transacao.valor;
                }
            });

            return receita;
        } catch (error) {
            console.error("Erro ao buscar dados de transações:", error);
            return 0;
        }
    }

    // Busca e processa os dados de despesas e receitas
    const DadosDespesa = await fetchDataDespesa();
    let DadosSaldo = await fetchDataReceita();

    // Extrai os rótulos (bancos) e valores para o gráfico
    const labels = DadosDespesa.map(item => item.name);
    const dataValues = DadosDespesa.map(item => ({
        value: item.value,
        // itemStyle: {
        //     color: item.name === 'Inter' ? 'rgba(255, 165, 0, 0.4)' : // Laranja com opacidade para Inter
        //         item.name === 'Willbank' ? 'rgba(255, 215, 0, 0.6)' : // Amarelo com opacidade para Willbank
        //         item.name === 'Nubank' ? 'rgba(128, 0, 128, 0.4)' : // Roxo com opacidade para Nubank
        //         item.name === 'Familiar' ? 'rgba(192, 192, 192, 0.4)' : // Cinza com opacidade para Familiar
        //         'rgba(192, 192, 192, 0.4)', // Cor padrão com opacidade para outros
        //     borderColor: item.name === 'Inter' ? '#FFA500' :
        //         item.name === 'Willbank' ? '#FFD700' :
        //         item.name === 'Nubank' ? '#800080' :
        //         item.name === 'Familiar' ? '#C0C0C0' :
        //         '#C0C0C0' // Cor de borda padrão
        // }
    }));

    // Calcula o saldo restante de forma progressiva
    let saldoAtual = DadosSaldo;
    const dataSaldoValues = DadosDespesa.map(item => {
        const saldoRestante = saldoAtual - item.value;
        saldoAtual -= item.value;
        return { value: saldoRestante };
    });

    // Configuração do gráfico de barras para ECharts
    const chartOptions = {
        title: {
            text: 'Fatura do Mês por Banco',
            left: window.innerWidth > 768 ? '40px' : ''
        },
        legend: {
            orient: 'vertical',
            right: window.innerWidth > 768 ? '80px' : '0',
            top: '0%',
            itemGap: 15
        },
        tooltip: {
            trigger: 'axis',
            backgroundColor: 'rgba(255, 255, 255, 0.9)', // Fundo claro para o tooltip
            padding: [5, 10],
            confine: true,  // Garante que o tooltip não saia do contêiner, mas você pode definir como `false` se preferir
            extraCssText: 'width: fit-content; white-space: nowrap;', // Ajusta ao conteúdo e evita quebra de linha
            formatter: function (params) {
                let count = 0
                let tooltipContent = '';
                params.forEach(item => {
                    let mbottom = count == 0 ? 10 : 0

                    tooltipContent += `<div style="white-space: nowrap; margin-bottom: ${mbottom}px;">
                        ${item.seriesName} <br>
                        R$ ${item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>`;

                    count++
                });
                return tooltipContent;
            },
            axisPointer: {
                type: 'cross'
            },
        },
        xAxis: {
            type: 'category',
            data: labels,
            axisLabel: {
                interval: 0,
                rotate: window.innerWidth > 768 ? 0 : 30
            },
            name: "Banco"
        },
        yAxis: {
            type: 'value',
            name: "Valor (R$)",
            axisLabel: {
                formatter: function (value) {
                    return `R$ ${value.toLocaleString('pt-BR')}`;
                }
            }
        },
        series: [
            {
                name: 'Fatura',
                type: 'bar',
                data: dataValues,
                label: {
                    show: true,
                    position: 'top',
                    formatter: function (params) {
                        return `R$ ${params.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    },
                    fontSize: 12,
                    color: '#000'
                },
                itemStyle: {
                    color: '#F003',
                    borderColor: '#F00'
                },
                markLine: {
                    data: [
                        {
                            type: 'average',
                            name: 'Média da Fatura'
                        }
                    ],
                    lineStyle: {
                        color: '#F007',
                    },
                    label: {
                        show: true,
                        formatter: 'R$ {c}', // Formatação do valor da média
                        color: '#F00', // Cor do texto da média
                        fontSize: 8
                    }
                }
            },
            {
                name: 'Saldo Restante',
                type: 'bar',
                data: dataSaldoValues,
                label: {
                    show: true,
                    position: 'top',
                    formatter: function (params) {
                        return `R$ ${params.value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
                    },
                    fontSize: 12,
                    color: '#000'
                },
                itemStyle: {
                    color: 'rgba(0, 128, 0, .3)',
                    borderColor: 'rgba(0, 128, 0, 1)'
                }
            }
        ]
    };

    // Define as opções no gráfico e exibe
    chart.setOption(chartOptions);

    // Ajusta o gráfico ao redimensionar a tela
    window.addEventListener("resize", () => {
        chart.resize();
    });
}

// Inicializa os gráficos e dados ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
    renderGraficoReceitaDespesa();
    renderGraficoFaturaBancariaMensal();
    renderGraficoBancario();
    renderGraficoMaioresGastos();
    carregarHistorico();
    carregarFaturas();
});