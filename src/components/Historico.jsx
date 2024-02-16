/* eslint-disable jsx-a11y/alt-text */
import React from 'react'
import moment from 'moment'

import './Historico.scss'

function Historico({ despesas }) {

    // Formate a data no formato desejado
    const formatarData = (data) => {
        return moment(data).format('DD/MM/YY');
    };

    // Ordene as despesas pela data em ordem decrescente
    despesas.sort((a, b) => {
        return new Date(b.data) - new Date(a.data);
    });

    return (
        <div className="Historico">
            <h3><img src="./icons/historico.png" /> Histórico de compra</h3>
            {despesas.length === 0 ? (
                <p>Sem compras realizadas este mês</p>
            ) : (
                <div className="table">
                    <table>
                        <thead>
                            <tr>
                                <th>Data</th>
                                <th>Descrição</th>
                                <th>Local de compra</th>
                                <th>Banco</th>
                                <th>Valor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {despesas.map((despesa, index) => (
                                <tr key={index}>
                                    <td>{formatarData(despesa.data)} {typeof despesa.hora ? `às ${despesa.hora}` : despesa.hora}</td>
                                    <td>{despesa.descricao}</td>
                                    <td>{despesa.localCompra}</td>
                                    <td>{despesa.instituicaoFinanceira}</td>
                                    <td><small>R$</small>{despesa.valorTotal.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default Historico
