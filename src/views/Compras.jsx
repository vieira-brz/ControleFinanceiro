/* eslint-disable jsx-a11y/alt-text */
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL } from '../config'

import './Compras.scss'

function Compras() {

    const [data, setData] = useState([])
    const [loaded, setLoaded] = useState(false)

    useEffect(() => {
        if (!loaded) {
            const fetchData = async () => {
                try {
                    const response = await axios.get(`${API_URL}/financas/despesas/65c65c76d0b4582cd7b211b2`)
                    const despesas = response.data.filter(despesa => despesa.numeroParcelas !== despesa.parcelasPagas);
                    setData(despesas)
                    setLoaded(true)
                } catch (error) {
                    console.error('Erro ao obter dados de despesas:', error)
                }
            }

            fetchData()
        }
    }, [loaded])


    const total = data.reduce((acc, despesa) => {
        return acc + despesa.valorParcelas;
    }, 0);


    const handlePagarParcela = async (id) => {
        try {
            const response = await axios.put(`${API_URL}/financas/despesas/65c65c76d0b4582cd7b211b2/${id}/pagarParcela`)

            if (response.status === 200) {

                // Atualizar a lista de despesas após o pagamento da parcela
                const updatedDespesas = data.map(despesa => {

                    if (despesa._id === id) {
                        return { ...despesa, parcelasPagas: despesa.parcelasPagas + 1 }
                    } else {
                        return despesa
                    }
                })

                setData(updatedDespesas)

            } else {
                console.error('Erro ao pagar parcela:', response.data)
            }
        } catch (error) {
            console.error('Erro ao pagar parcela:', error)
        }
    }

    const handleVoltarParcela = async (id) => {
        try {
            const response = await axios.put(`${API_URL}/financas/despesas/65c65c76d0b4582cd7b211b2/${id}/retornarParcela`)

            if (response.status === 200) {

                // Atualizar a lista de despesas após o pagamento da parcela
                const updatedDespesas = data.map(despesa => {

                    if (despesa._id === id) {
                        return { ...despesa, parcelasPagas: despesa.parcelasPagas - 1 }
                    } else {
                        return despesa
                    }
                })

                setData(updatedDespesas)

            } else {
                console.error('Erro ao pagar parcela:', response.data)
            }
        } catch (error) {
            console.error('Erro ao pagar parcela:', error)
        }
    }

    const calcularValorTotalBanco = (banco) => {
        return data.reduce((acc, despesa) => {
            if (despesa.instituicaoFinanceira === banco) {
                acc += despesa.valorParcelas;
            }
            return acc;
        }, 0);
    };

    const bancos = [...new Set(data.map(despesa => despesa.instituicaoFinanceira))];

    return (
        <div className='Compras'>
            {data.length === 0 ? (
                <p>Sem compras realizadas este mês</p>
            ) : (
                <div>
                    <h3 className='title'><img src="./icons/historico.png" /> Compras e parcelas ativas</h3>
                    <div className="bancos-container">
                        {bancos.map(banco => (
                            <div key={banco} className="card-banco">
                                <h4 className='card-title'>{banco}</h4>
                                <p className='valor'><small className='ticket'>Valor total de R$</small><strong>{calcularValorTotalBanco(banco).toFixed(2)}</strong></p>
                            </div>
                        ))}
                    </div>

                    <div className="table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Descrição</th>
                                    <th>Local de compra</th>
                                    <th>Banco</th>
                                    <th>Valor da parcela</th>
                                    <th style={{ textAlign: 'center' }}>Parcelas pagas</th>
                                    <th style={{ textAlign: 'center' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.map(despesa => (
                                    <tr key={despesa._id}>
                                        <td>{despesa.descricao}</td>
                                        <td>{despesa.localCompra}</td>
                                        <td>{despesa.instituicaoFinanceira}</td>
                                        <td><small>R$</small>{despesa.valorParcelas.toFixed(2)}</td>
                                        <td style={{ textAlign: 'center' }}>{despesa.parcelasPagas}<small>/</small>{despesa.numeroParcelas}</td>
                                        <td style={{ textAlign: 'center' }}>
                                            <button onClick={(e) => {
                                                e.preventDefault();
                                                handleVoltarParcela(despesa._id);
                                            }}>-</button>
                                            <button onClick={(e) => {
                                                e.preventDefault();
                                                handlePagarParcela(despesa._id);
                                            }}>+</button>
                                        </td>
                                    </tr>
                                ))}
                                <tr>
                                    <td colSpan="3"></td>
                                    <td style={{ color: "var(--o-600)" }}><small>R$</small><strong>{total.toFixed(2)}</strong></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Compras
