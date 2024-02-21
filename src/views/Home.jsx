import React, { useState, useEffect, } from 'react'
import ReactEcharts from "echarts-for-react"
import axios from '../axiosConfig'
import { API_URL } from '../config'

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

  const [emAberto, setEmAberto] = useState([])
  const [emTotal, setEmTotal] = useState([])
  const [emPago, setEmPago] = useState([])

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

          for (let parcela = 0; parcela < despesa.parcelas.length; parcela++) {

            const element = despesa.parcelas[parcela]

            const data_parcela = new Date(element.data)
            const ano_parcela = data_parcela.getFullYear()
            const mes_parcela = data_parcela.getMonth()

            if (ano_parcela === anoAtual) {
              somaPorMes[mes_parcela] += parseFloat(despesa.valorParcelas)

              if (parcela <= despesa.parcelasPagas) {
                pagoPorMes[mes_parcela] += parseFloat(despesa.valorParcelas)
              }
            }
          }

          const data_despesa = new Date(despesa.data)
          const ano_despesa = data_despesa.getFullYear()
          const mes_despesa = data_despesa.getMonth()

          if (ano_despesa === anoAtual && mes_despesa === mesAtual) {
            historyDataArray.push(despesa)
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

              if (value.quitada === true) {
                pagoPorMes[mes] += parseFloat(value.valor)
              }

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
            pagoPorMes[mes] += 0
          }
        }

        setEmAberto((somaPorMes[mesAtual + 1] - pagoPorMes[mesAtual + 1]).toFixed(2))
        setEmTotal((somaPorMes[mesAtual + 1]).toFixed(2))
        setEmPago((pagoPorMes[mesAtual + 1]).toFixed(2))

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

    calculateTrend()
  }, [barData])

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
        name: 'Pago:',
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

      <div className="cards">
        <div className="card">
          <div>
            <h3>Em aberto: <p><span className='ticket'>R$</span>{emAberto}</p></h3>
          </div>
        </div>
        <div className="card">
          <div>
            <h3>Valor Pago: <p><span className='ticket'>R$</span><span>{emPago}</span> <span className='ticket'>/</span> {emTotal}</p></h3>
          </div>
        </div>
      </div>

      <Historico despesas={historyData} />
    </div>
  )
}

export default Home
