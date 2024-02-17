/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../axiosConfig'
import moment from 'moment'
import { API_URL } from '../config'

import './Faturas.scss'

function Faturas() {
  const navigate = useNavigate()

  // Formate a data no formato desejado
  const formatarData = (data) => {
    return moment(data).format('DD/MM/YY H:mm:ss');
  };

  const [mesAno, setMesAno] = useState('')

  useEffect(() => {
    const dataAtual = new Date()
    const mes = String(dataAtual.getMonth() + 1).padStart(2, '0') // Adiciona um zero à esquerda, se necessário
    const ano = dataAtual.getFullYear()
    const mesAnoAtual = `${ano}-${mes}`
    setMesAno(mesAnoAtual)
  }, []) // O segundo parâmetro vazio faz com que o useEffect seja executado apenas uma vez, quando o componente é montado


  const [faturaDoMesSelecionado, setFaturaDoMesSelecionado] = useState(null)
  const [descricao, setDescricao] = useState('')
  const [instituicaoFinanceira, setInstituicaoFinanceira] = useState('Nubank')
  const [valorTotal, setValorTotal] = useState('')


  const formatarValor = (value) => {
    const numero = parseFloat(value.replace(/[^\d]/g, ''));

    if (!isNaN(numero)) {
      return (numero / 100).toFixed(2);
    }

    return '';
  };

  const handleChangeValorTotal = (e) => {
    const valorFormatado = formatarValor(e.target.value);
    setValorTotal(valorFormatado);
  };


  // Função para buscar a fatura do mês
  async function fetchFaturaDoMes() {
    try {

      if (!mesAno) {
        setFaturaDoMesSelecionado(null)
        return
      }

      const response = await axios.get(`${API_URL}/financas/faturas/65c65c76d0b4582cd7b211b2/${mesAno}`)
      const fatura = response.data

      // Calculando valor total da fatura
      const valorTotalFatura = fatura.compras.reduce((acc, compra) => acc + compra.valor, 0)
      fatura.valorTotal = valorTotalFatura.toFixed(2)

      setFaturaDoMesSelecionado(fatura)

    } catch (error) {
      setFaturaDoMesSelecionado(null)
    }
  }


  // Atualiza a fatura do mês sempre que mesAno mudar
  useEffect(() => {
    fetchFaturaDoMes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mesAno])


  // Função para lidar com a adição à fatura
  const adicionarAFatura = async () => {
    try {
      if (!faturaDoMesSelecionado) {

        // Se a fatura do mês/ano selecionado não existir, criar uma nova fatura
        await axios.post(`${API_URL}/financas/faturas/65c65c76d0b4582cd7b211b2`, {
          mes: mesAno,
          compras: [{
            dataHora: new Date(),
            descricao: descricao,
            instituicaoFinanceira: instituicaoFinanceira,
            valor: parseFloat(valorTotal)
          }]
        })

      } else {

        // Se existir, adicionar a compra à fatura existente
        await axios.patch(`${API_URL}/financas/faturas/65c65c76d0b4582cd7b211b2/${faturaDoMesSelecionado._id}`, {
          compras: [...faturaDoMesSelecionado.compras, {
            descricao: descricao,
            instituicaoFinanceira: instituicaoFinanceira,
            valor: parseFloat(valorTotal)
          }]
        })
      }

      // Limpar os campos após o envio bem-sucedido
      alert('Compra adicionada à fatura com sucesso!')
      navigate(-1)

    } catch (error) {
      console.error('Erro ao adicionar compra à fatura:', error)
      alert('Erro ao adicionar compra à fatura. Verifique o console para mais detalhes.')
    }
  }

  // Função para marcar uma compra como quitada
  const marcarCompraQuitada = async (idCompra) => {
    try {
      await axios.patch(`${API_URL}/faturas/65c65c76d0b4582cd7b211b2/${faturaDoMesSelecionado._id}/${idCompra}`)

      // Atualize a fatura após marcar a compra como quitada
      fetchFaturaDoMes()

      alert('Compra marcada como quitada com sucesso!')

    } catch (error) {
      console.error('Erro ao marcar compra como quitada:', error)
      alert('Erro ao marcar compra como quitada. Verifique o console para mais detalhes.')
    }
  }

  return (
    <div className='Faturas'>
      <div className='valor-fatura-mes'>
        <small>R$</small>
        <h2>{faturaDoMesSelecionado ? faturaDoMesSelecionado.valorTotal : '0'}</h2>
      </div>

      <div className='item'>
        <h5>Selecione o mês e o ano</h5>
        <div className="form-group">
          <span><img src='./icons/desc.png' /></span>
          <input className="form-field" type="month" placeholder="" value={mesAno} onChange={e => setMesAno(e.target.value)} />
        </div>
      </div>

      <div className="adicionar-fatura">
        <h3><img src="./icons/add_fatura.png" /> Adicionar à fatura</h3>
        <div className='item'>
          <h5>Descrição</h5>
          <div className="form-group">
            <span><img src='./icons/desc.png' /></span>
            <input className="form-field" type="search" placeholder="Descreva em poucas palavras sua compra" value={descricao} onChange={e => setDescricao(e.target.value)} />
          </div>
        </div>

        <div className='item'>
          <h5>Selecione o banco ou instituição financeira</h5>
          <div className="form-group">
            <span><img src='./icons/banco.png' /></span>
            <select className='form-field' value={instituicaoFinanceira} onChange={e => setInstituicaoFinanceira(e.target.value)}>
              <option value="Nubank">Nubank</option>
              <option value="Inter">Inter</option>
              <option value="Alimentação">Alimentação</option>
              <option value="Refeição">Refeição</option>
              <option value="Will Bank">Will Bank</option>
              <option value="Next">Next</option>
              <option value="PicPay">PicPay</option>
              <option value="Caixa">Caixa</option>
              <option value="Bradesco">Bradesco</option>
              <option value="Santander">Santander</option>
            </select>
          </div>
        </div>

        <div className='item'>
          <h5>Valor total da compra</h5>
          <div className="form-group">
            <span><img src='./icons/coin.png' /></span>
            <input inputMode='numeric' className="form-field" type="search" placeholder="Digite o valor total da compra" value={valorTotal} onChange={handleChangeValorTotal} />
          </div>
        </div>

        <button onClick={adicionarAFatura}>Adicionar à fatura</button>
      </div>

      {faturaDoMesSelecionado && (
        <div className="table">
          <table>
            <thead>
              <tr>
                <th>Data</th>
                <th>Descrição</th>
                <th>Banco</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {faturaDoMesSelecionado.compras.map((compra, index) => (
                <tr key={index}>
                  <td>{formatarData(compra.dataHora)}</td>
                  <td>{compra.descricao}</td>
                  <td>{compra.instituicaoFinanceira}</td>
                  <td><small>R$</small>{compra.valor.toFixed(2)}</td>
                  <td>
                    {compra.quitada ? (
                      <span>Fatura quitada</span>
                    ) : (
                      <button onClick={() => marcarCompraQuitada(compra._id)}>Quitar fatura</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Faturas
