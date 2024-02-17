const mongoose = require('mongoose')

const receitaSchema = new mongoose.Schema({
    descricao: String,
    localCompra: String,
    formaRecebimento: String,
    instituicaoFinanceira: String,
    valorRecebido: Number,
    data: Date,
    hora: String
})

const despesaSchema = new mongoose.Schema({
    descricao: String,
    localCompra: String,
    formaPagamento: String,
    instituicaoFinanceira: String,
    valorTotal: Number,
    numeroParcelas: Number,
    valorParcelas: Number,
    parcelasPagas: {
        type: Number,
        default: 0
    },
    data: Date,
    hora: String
})

const compraSchema = new mongoose.Schema({
    descricao: String,
    instituicaoFinanceira: String,
    valor: Number,
    quitada: {
        type: Boolean,
        default: false
    },
    dataHora: {
        type: Date,
        default: Date.now
    }
})

const faturaSchema = new mongoose.Schema({
    mes: String,
    compras: [compraSchema]
})

const financasSchema = new mongoose.Schema({
    id_usuario: String,
    salario: {
        type: Number,
        default: 0
    },
    receitas: [receitaSchema],
    despesas: [despesaSchema],
    faturas: [faturaSchema]
})

const Financas = mongoose.model('Financas', financasSchema)

module.exports = Financas
