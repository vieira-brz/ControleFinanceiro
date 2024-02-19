/* eslint-disable jsx-a11y/alt-text */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../axiosConfig'
import { API_URL } from '../config'

import './Despesa.scss'

function Despesa() {

  const navigate = useNavigate()

  const [despesa, setDespesa] = useState({
    descricao: '',
    localCompra: '',
    formaPagamento: 'Á vista',
    instituicaoFinanceira: 'Nubank',
    valorTotal: '',
    numeroParcelas: 1
  })

  // Alterando dados do objeto
  const handleChange = (e) => {

    const { name, value } = e.target

    let newValue = value

    // Se o campo for "numeroParcelas", substitui por um valor inteiro
    if (name === 'valorTotal') {
      newValue = formatarValor(value)
    }

    if (name === 'numeroParcelas' && value === 0) {
      newValue = 1
    }

    setDespesa(prevDespesa => ({
      ...prevDespesa,
      [name]: newValue
    }))
  }

  // Formatar dinheiro
  const formatarValor = (value) => {

    const numero = parseFloat(value.replace(/[^\d]/g, ''))

    if (!isNaN(numero)) {
      return (numero / 100).toFixed(2)
    }

    return ''
  }

  // Requisição de insert da despesa
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await axios.post(`${API_URL}/financas/despesas/65c65c76d0b4582cd7b211b2`, despesa)

      const message = response.data.message

      alert(message)
      navigate(-1)
      
    } catch (error) {
      alert(error)
      navigate(-1)
      console.error('Erro ao cadastrar despesa:', error)
    }
  }

  return (
    <div className='Despesa'>
      <div className="container-items">
        <div className='item'>
          <h5>Descrição</h5>
          <div className="form-group">
            <span><img src='./icons/desc.png' /></span>
            <input className="form-field" type="search" placeholder="Descreva em poucas palavras sua compra" value={despesa.descricao} onChange={handleChange} name="descricao" />
          </div>
        </div>

        <div className='item'>
          <h5>Local de compra</h5>
          <div className="form-group">
            <span><img src='./icons/place.png' /></span>
            <input className="form-field" type="search" placeholder="Digite o nome da loja ou recebedor " value={despesa.localCompra} onChange={handleChange} name="localCompra" />
          </div>
        </div>

        <div className='item'>
          <h5>Forma de pagamento</h5>
          <div className="form-group">
            <span><img src='./icons/pagamento.png' /></span>
            <select className='form-field' value={despesa.formaPagamento} onChange={handleChange} name="formaPagamento">
              <option value="Á vista">Á vista</option>
              <option value="Débito">Débito</option>
              <option value="Crédito">Crédito</option>
              <option value="Pix">Pix</option>
              <option value="Boleto">Boleto</option>
            </select>
          </div>
        </div>

        <div className='item'>
          <h5>Selecione o banco ou instituição financeira</h5>
          <div className="form-group">
            <span><img src='./icons/banco.png' /></span>
            <select className='form-field' value={despesa.instituicaoFinanceira} onChange={handleChange} name="instituicaoFinanceira">
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
            <input inputMode='numeric' className="form-field" type="search" placeholder="Digite o valor total da compra" value={despesa.valorTotal} onChange={handleChange} name="valorTotal" />
          </div>
        </div>

        <div className='item'>
          <h5>N° de parcelas</h5>
          <div className="form-group">
            <span><img src='./icons/parcelas.png' /></span>
            <input inputMode='numeric' className="form-field" type="number" min="1" placeholder='0' value={despesa.numeroParcelas} onChange={handleChange} name="numeroParcelas" />
          </div>
        </div>
      </div>
      <button onClick={handleSubmit}>Registrar despesa</button>
    </div>
  )
}

export default Despesa
