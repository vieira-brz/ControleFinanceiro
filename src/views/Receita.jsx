/* eslint-disable jsx-a11y/alt-text */
import React from 'react'

import './Receita.scss'

function Receita() {
  return (
    <div className='Receita'>
      <div className="container-items">
        <div className='item'>
          <h5>Descrição</h5>
          <div className="form-group">
            <span><img src='./icons/desc.png' /></span>
            <input className="form-field" type="search" placeholder="Descreva em poucas palavras a fonte da receita" />
          </div>
        </div>

        <div className='item'>
          <h5>Local de compra</h5>
          <div className="form-group">
            <span><img src='./icons/place.png' /></span>
            <input className="form-field" type="search" placeholder="Digite o nome do pagador " />
          </div>
        </div>

        <div className='item'>
          <h5>Forma de recebimento</h5>
          <div className="form-group">
            <span><img src='./icons/pagamento.png' /></span>
            <select className='form-field'>
              <option value="Á vista">Á vista</option>
              <option value="Débito">Débito</option>
              <option value="Crédito">Crédito</option>
              <option value="Pix">Pix</option>
              <option value="Salário">Salário</option>
              <option value="Boleto">Boleto</option>
            </select>
          </div>
        </div>

        <div className='item'>
          <h5>Selecione o banco ou instituição financeira</h5>
          <div className="form-group">
            <span><img src='./icons/banco.png' /></span>
            <select className='form-field'>
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
          <h5>Valor recebido</h5>
          <div className="form-group">
            <span><img src='./icons/coin.png' /></span>
            <input className="form-field" type="search" placeholder="Digite o valor total da compra" />
          </div>
        </div>
      </div>
      <button>Registrar receita</button>
    </div>
  )
}

export default Receita
