import React, { useState, useEffect, } from 'react'
import ReactEcharts from "echarts-for-react"
import axios from '../axiosConfig'
import {API_URL} from '../config'

// Components
import Acoes from '../components/Acoes'

// Css
import './Home.scss'
import Historico from '../components/Historico'

function Home() {

  const salario = 4000 / 2
  const salario30Pct = salario * .3

  const [historyData, setHistoryData] = useState([])
  const [barData, setBarData] = useState([])
  const [valorPago, setValorPago] = useState([])
  const [trendData, setTrendData] = useState([])
  
  useEffect(() => {

    const fetchData = async () => {
      try {
        let historyDataArray = []

        const hoje = new Date()
        const mesAtual = hoje.getMonth()
        const anoAtual = hoje.getFullYear()

        const response = await axios.get(`${API_URL}/financas/despesas/65c65c76d0b4582cd7b211b2`)
        const despesas = response.data

        const somaPorMes = new Array(12).fill(0)
        const pagoPorMes = new Array(12).fill(0)

        // Valores das despesas
        despesas.forEach(despesa => {

          const dataDespesa = new Date(despesa.data)
          const anoDespesa = dataDespesa.getFullYear()
          const mes = dataDespesa.getMonth()

          // Histórico de despesas do mês atual
          if (anoAtual === anoDespesa && mesAtual === mes) {
            historyDataArray.push(despesa)
          }

          // Parcelas de compras do ano anterior
          let parcelasPagas = despesa.parcelasPagas
          let numeroParcelas = despesa.numeroParcelas

          // console.log('Ano anterior:');
          // console.log('Parcelas: ' + numeroParcelas);
          // console.log('Pagas: ' + parcelasPagas);
          // console.log(`${mes} - ${anoDespesa}`);

          if (anoDespesa !== anoAtual) {

            let parcelasPagas_antigas = parcelasPagas;

            let mes_ate_fim_ano = (11 - mes) + 1;
            if (mes_ate_fim_ano > 0) {
              parcelasPagas = parcelasPagas - mes_ate_fim_ano;
            }

            numeroParcelas = (numeroParcelas - parcelasPagas_antigas) + parcelasPagas;
          }

          // console.log('--------------------------');
          // console.log('Este ano:');
          // console.log('Parcelas: ' + numeroParcelas);
          // console.log('Pagas: ' + parcelasPagas);
          // console.log(`${mesAtual} - ${anoAtual}`);
          // console.log('');

          for (let mesParcela = 0; mesParcela < numeroParcelas; mesParcela++) {

            if (mesParcela <= 11) {
              const valorParcelas = parseFloat(despesa.valorParcelas)
              somaPorMes[mesParcela] += valorParcelas

              if (mesParcela < parcelasPagas) {
                pagoPorMes[mesParcela] += valorParcelas
              }
            }
          }
        })

        // Valores das faturas
        for (let mes = 0; mes < 12; mes++) {
          let mes_api = mes < 9 ? `0${mes + 1}` : mes + 1

          try {
            const response_fatura_mes = await axios.get(`${API_URL}/financas/faturas/65c65c76d0b4582cd7b211b2/${anoAtual}-${mes_api}`)
            const fatura = response_fatura_mes.data
            const valorTotalFatura = fatura.compras.reduce((acc, compra) => acc + compra.valor, 0)

            somaPorMes[mes] += valorTotalFatura

            fatura.compras.forEach((value, index) => {
              let objeto_historico = {
                data: value.dataHora,
                hora: value.dataHora.split('T')[1].split('.')[0],
                descricao: value.descricao,
                localCompra: 'Fatura Crédito',
                instituicaoFinanceira: value.instituicaoFinanceira,
                valorTotal: value.valor
              }

              historyDataArray.push(objeto_historico)
            })

          } catch (error) {
            somaPorMes[mes] += 0
          }
        }

        setHistoryData(historyDataArray)
        setBarData(somaPorMes)
        setValorPago(pagoPorMes)

      } catch (error) {
        console.error('Erro ao obter dados de despesas:', error)
      }
    }

    fetchData()
  }, [])

  // Verificando mudanças no bardata
  useEffect(() => {
    const calculateTrend = () => {
      const n = 12
      let sumX = 0
      let sumY = 0
      let sumXY = 0
      let sumXX = 0

      for (let i = 0; i < n; i++) {
        // Soma das coordenadas x (1, 2, 3, ..., n)
        sumX += i + 1
        // Soma das coordenadas y (valores dos gastos mensais)
        sumY += barData[i]
        // Soma do produto das coordenadas x e y (i * gasto)
        sumXY += (i + 1) * barData[i]
        // Soma dos quadrados das coordenadas x (i^2)
        sumXX += (i + 1) ** 2
      }

      // Cálculo do coeficiente angular da linha de tendência (m)
      const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX ** 2)

      // Cálculo do coeficiente linear da linha de tendência (b)
      const intercept = (sumY - slope * sumX) / n

      const trend = []
      for (let i = 0; i < n; i++) {
        const value = Math.max(0, Math.round(slope * (i + 1) + intercept))
        trend.push(value)
      }

      setTrendData(trend)
    }

    calculateTrend();
  }, [barData]);

  // Opções gráfico
  const option = {
    title: {
      text: 'Faturas mensais',
      textStyle: {
        color: '#cbd5e1'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'line'
      }
    },
    toolbox: {
      show: true,
      feature: {
        magicType: {
          type: ['line', 'bar']
        },
        saveAsImage: {},
      }
    },
    xAxis: {
      type: 'category',
      boundaryGap: true,
      data: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        formatter: 'R$ {value}'
      },
      axisLine: {
        show: false
      },
      axisPointer: {
        snap: true
      },
      splitLine: {
        show: true,
        lineStyle: {
          opacity: 0.1  // Definir a opacidade das linhas horizontais
        }
      }
    },
    visualMap: {
      show: false,
      pieces: [
        {
          lte: (salario - salario30Pct),
          color: '#16a34a'
        },
        {
          gt: (salario - salario30Pct),
          lte: salario,
          color: '#f97316'
        },
        {
          gt: salario,
          color: '#fc1406'
        }
      ]
    },
    series: [
      {
        name: 'Fatura:',
        type: 'bar',
        smooth: false,
        symbol: 'none',
        // prettier-ignore
        data: barData.map(value => parseFloat(value.toFixed(2))),
      },
      {
        name: 'Valor pago:',
        type: 'bar',
        smooth: false,
        symbol: 'none',
        // prettier-ignore
        data: valorPago.map((value, index) => ({
          value: parseFloat(value.toFixed(2)),
          itemStyle: {
            color: '#475569',
          },
        })),
      },
      {
        name: 'Tendência:',
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: trendData[0] > trendData[trendData.length - 1] ? 'green' : 'red'
        },
        data: trendData.map(value => parseFloat(value.toFixed(2))),
      }
    ]
  }


  return (
    <div className="Home">
      <Acoes />

      <div className="content-chart">
        <ReactEcharts option={option} />
      </div>

      <Historico despesas={historyData} />
    </div>
  )
}

export default Home
