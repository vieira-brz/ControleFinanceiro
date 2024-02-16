/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import { Link } from 'react-router-dom'

import './Acoes.scss'

function Acoes() {
  return (
    <div className='Acoes'>
      <h3> <img src="./icons/manage.png" /> Gerenciar</h3>
      <div className="slider">
        <Link className="item" to="/receitas">
          <div className="icon">
            <img src="./icons/receita.png" />
          </div>
          <small className='desc'>Receita</small>
          <div className="notify-plus">+</div>
        </Link>
        <Link className="item" to="/despesas">
          <div className="icon">
            <img src="./icons/compras.png" />
          </div>
          <small className='desc'>Despesa</small>
          <div className="notify-plus">+</div>
        </Link>
        <Link className="item" to="/compras">
          <div className="icon">
            <img src="./icons/cartao.png" />
          </div>
          <small className='desc'>Compras</small>
        </Link>
        <Link className="item" to="/faturas">
          <div className="icon">
            <img src="./icons/fatura.png" />
          </div>
          <small className='desc'>Faturas</small>
        </Link>
      </div>
    </div>
  )
}

export default Acoes
