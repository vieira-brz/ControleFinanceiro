const router = require('express').Router()

const Financas = require('../models/Financas')

// create
router.post('/', async (req, res) => {
    const { nome, salario, receitas, despesas, faturas } = req.body

    if (!nome || !salario) {
        res.status(422).json({ error: "O nome e o salário são obrigatórios!" })
        return
    }

    const financas = {
        nome,
        salario,
        receitas,
        despesas,
        faturas
    }

    try {
        await Financas.create(financas)
        res.status(201).json({ message: "Inserido com sucesso!" })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// read
router.get('/', async (req, res) => {

    try {
        const financas = await Financas.find()

        res.status(200).json(financas)

    } catch (error) {
        res.status(500).json({ error: error })
    }
})

// read dynamic
router.get('/:id_usuario', async (req, res) => {

    const { id_usuario } = req.params

    try {
        const financas = await Financas.findOne({ id_usuario: id_usuario })

        if (!financas) {
            req.status(422).json({ message: "Usuário não encontrado!" })
            return
        }

        res.status(200).json(financas)

    } catch (error) {
        res.status(500).json({ error: error })
    }
})

// update (put = mande objeto completo, patch = atualiza um campo só)
router.patch('/:id_usuario', async (req, res) => {
    const { id_usuario } = req.params
    const { nome, salario, receitas, despesas, faturas } = req.body

    const financas = {
        nome,
        salario,
        receitas,
        despesas,
        faturas
    }

    try {
        const updatedFinancas = await Financas.updateOne({ id_usuario: id_usuario }, financas)

        if (updatedFinancas.matchedCount === 0) {
            res.status(422).json({ message: "Usuário não encontrado!" })
        }

        res.status(200).json(financas)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

// delete
router.delete('/:id_usuario', async (req, res) => {

    const { id_usuario } = req.params

    const financas = await Financas.findOne({ id_usuario: id_usuario })

    if (!financas) {
        req.status(422).json({ message: "Usuário não encontrado!" })
        return
    }

    try {
        await Financas.deleteOne({ id_usuario: id_usuario })

        res.status(200).json({ message: "Usuário removido com sucesso!" })

    } catch (error) {
        res.status(500).json({ error: error })
    }
})


// 
// DESPESAS
// 
const calcularParcelas = (despesa) => {
    const parcelas = []

    // Obter a data da primeira parcela
    let dataParcela = new Date(despesa.data)
    dataParcela.setMonth(dataParcela.getMonth() + 1) // Incrementar o mês para a primeira parcela

    // Calcular e adicionar as parcelas
    for (let i = 0; i < despesa.numeroParcelas; i++) {
        const valorParcela = despesa.valorParcelas
        const quitada = i < despesa.parcelasPagas // Verificar se a parcela está quitada

        parcelas.push({ data: new Date(dataParcela), valor: valorParcela, quitada: quitada })

        // Incrementar a data para o próximo mês
        dataParcela.setMonth(dataParcela.getMonth() + 1)
    }

    return parcelas
}

// Rota para adicionar uma nova despesa
router.post('/despesas/:id_usuario', async (req, res) => {
    const { descricao, localCompra, formaPagamento, instituicaoFinanceira, valorTotal, numeroParcelas } = req.body
    const { id_usuario } = req.params

    try {
        let financas = await Financas.findOne({ id_usuario })

        if (!financas) {
            financas = await Financas.create({ id_usuario })
        }

        const valorParcelas = (valorTotal / numeroParcelas).toFixed(2)

        // Obter data e hora atuais
        const dataAtual = new Date()
        const data = dataAtual.toISOString().split('T')[0]
        const hora = dataAtual.toTimeString().split(' ')[0]

        // Criar a despesa com as parcelas calculadas
        const despesa = {
            descricao,
            localCompra,
            formaPagamento,
            instituicaoFinanceira,
            valorTotal,
            numeroParcelas,
            valorParcelas,
            data,
            hora,
            parcelas: calcularParcelas({ data, numeroParcelas, valorParcelas, parcelasPagas: 0 }) // Calcular as parcelas
        }

        financas.despesas.push(despesa)
        await financas.save()

        res.status(201).json({ message: 'Despesa adicionada com sucesso!', despesa })

    } catch (error) {
        console.error('Erro ao adicionar despesa:', error)
        res.status(500).json({ error: 'Erro interno do servidor' })
    }
})

// Rota para buscar todas as despesas de um usuário
router.get('/despesas/:id_usuario', async (req, res) => {

    const { id_usuario } = req.params

    try {
        const financas = await Financas.findOne({ id_usuario })

        if (!financas) {
            return res.status(404).json({ error: 'Usuário não encontrado' })
        }

        const despesas = financas.despesas
        res.json(despesas)

    } catch (error) {

        console.error('Erro ao buscar despesas:', error)
        res.status(500).json({ error: 'Erro interno do servidor' })
    }
})

// Rota para atualizar uma despesa
router.get('/despesas/:id_usuario/atualizarDespesa', async (req, res) => {
    const { id_usuario } = req.params 

    try {
        // Encontre o usuário
        let financas = await Financas.findOne({ id_usuario }) 

        if (!financas) {
            return res.status(404).json({ error: 'Usuário não encontrado' }) 
        }

        // Buscar todas as despesas
        const despesas = financas.despesas 

        // Para cada despesa, calcular e inserir as parcelas
        for (let i = 0; i < despesas.length; i++) {
            const despesa = despesas[i] 
            despesa.parcelas = calcularParcelas(despesa) 
        }

        await financas.save() 

        res.status(200).json({ message: 'Parcelas calculadas e inseridas com sucesso', despesas }) 

    } catch (error) {
        console.error('Erro ao calcular e inserir parcelas:', error) 
        res.status(500).json({ error: 'Erro interno do servidor' }) 
    }
}) 

// Rota para pagar uma parcela de uma despesa
router.put('/despesas/:id_usuario/:id/pagarParcela', async (req, res) => {
    const { id_usuario, id } = req.params 

    try {
        // Encontre o usuário
        const financas = await Financas.findOne({ id_usuario }) 

        if (!financas) {
            return res.status(404).json({ error: 'Usuário não encontrado' }) 
        }

        // Encontre a despesa pelo ID
        const despesaIndex = financas.despesas.findIndex(despesa => despesa._id.toString() === id) 

        if (despesaIndex === -1) {
            return res.status(404).json({ error: 'Despesa não encontrada' }) 
        }

        // Atualize o número de parcelas pagas
        financas.despesas[despesaIndex].parcelasPagas += 1 

        // Marque como quitada apenas a parcela correspondente ao número de parcelas pagas
        financas.despesas[despesaIndex].parcelas[financas.despesas[despesaIndex].parcelasPagas - 1].quitada = true;

        await financas.save() 

        // Retorne uma resposta de sucesso
        res.status(200).json({ message: 'Parcela paga com sucesso' }) 

    } catch (error) {
        console.error('Erro ao pagar parcela:', error) 
        res.status(500).json({ error: 'Erro interno do servidor' }) 
    }
}) 

// Rota para voltar uma parcela de uma despesa
router.put('/despesas/:id_usuario/:id/retornarParcela', async (req, res) => {
    const { id_usuario, id } = req.params 

    try {
        // Encontre o usuário
        const financas = await Financas.findOne({ id_usuario }) 

        if (!financas) {
            return res.status(404).json({ error: 'Usuário não encontrado' }) 
        }

        // Encontre a despesa pelo ID
        const despesaIndex = financas.despesas.findIndex(despesa => despesa._id.toString() === id) 

        if (despesaIndex === -1) {
            return res.status(404).json({ error: 'Despesa não encontrada' }) 
        }

        // Verifique se há parcelas pagas
        if (financas.despesas[despesaIndex].parcelasPagas > 0) {

            // Atualize o número de parcelas pagas
            financas.despesas[despesaIndex].parcelasPagas -= 1 

            // Marque como não quitada a última parcela paga
            financas.despesas[despesaIndex].parcelas[financas.despesas[despesaIndex].parcelasPagas].quitada = false 

            await financas.save() 

            // Retorne uma resposta de sucesso
            return res.status(200).json({ message: 'Parcela retornada com sucesso' }) 
            
        } else {
            return res.status(400).json({ error: 'Nenhuma parcela foi paga anteriormente' }) 
        }
    } catch (error) {
        console.error('Erro ao retornar parcela:', error) 
        res.status(500).json({ error: 'Erro interno do servidor' }) 
    }
}) 


// 
// FATURAS
// 
// Rota para adicionar uma nova fatura
router.post('/faturas/:id_usuario', async (req, res) => {

    const { mes, compras } = req.body
    const { id_usuario } = req.params

    try {
        let financas = await Financas.findOne({ id_usuario })

        if (!financas) {
            financas = await Financas.create({ id_usuario })
        }

        // Verificar se já existe uma fatura para o mês especificado
        const faturaExistente = financas.faturas.find(fatura => fatura.mes === mes)

        if (faturaExistente) {
            faturaExistente.compras.push(...compras)
        } else {
            financas.faturas.push({
                mes: mes,
                compras: compras
            })
        }

        await financas.save()

        res.status(201).json({ message: 'Fatura adicionada/atualizada com sucesso!', faturas: financas.faturas })

    } catch (error) {
        console.error('Erro ao adicionar/atualizar fatura:', error)
        res.status(500).json({ error: 'Erro interno do servidor ao adicionar/atualizar fatura.' })
    }
})

// Rota para buscar a fatura do mês e ano especificados para um determinado usuário
router.get('/faturas/:id_usuario/:mesAno', async (req, res) => {
    const { id_usuario, mesAno } = req.params

    try {
        // Busque as finanças do usuário
        const financas = await Financas.findOne({ id_usuario: id_usuario })

        if (!financas) {
            return res.status(404).json({ message: "Finanças não encontradas para este usuário." })
        }

        // Verifique se existe alguma fatura para o mês/ano especificado
        const fatura = financas.faturas.find(fatura => fatura.mes === mesAno)

        if (!fatura) {
            return res.status(404).json({ message: "Fatura não encontrada para este usuário e mês/ano." })
        }

        // Retorne a fatura encontrada
        res.status(200).json(fatura)

    } catch (error) {
        console.error('Erro ao buscar fatura do mês/ano para o usuário:', error)
        res.status(500).json({ error: 'Erro interno do servidor ao buscar fatura.' })
    }
})

// Atualizando uma fatura existente
router.patch('/faturas/:id_usuario/:id_fatura', async (req, res) => {
    const id_usuario = req.params.id_usuario
    const id_fatura = req.params.id_fatura
    const { compras } = req.body

    try {
        // Verifique se a fatura pertence ao usuário especificado
        const financas = await Financas.findOne({ id_usuario: id_usuario })

        if (!financas) {
            return res.status(404).json({ message: "Finanças não encontradas para este usuário." })
        }

        // Verifique se a fatura existe dentro das finanças do usuário
        const faturaIndex = financas.faturas.findIndex(fatura => fatura._id.toString() === id_fatura)

        if (faturaIndex === -1) {
            return res.status(404).json({ message: "Fatura não encontrada para este usuário." })
        }

        // Atualize as compras da fatura
        financas.faturas[faturaIndex].compras = compras
        await financas.save()

        res.status(200).json({ message: "Fatura atualizada com sucesso!" })

    } catch (error) {
        console.error('Erro ao atualizar fatura:', error)
        res.status(500).json({ error: 'Erro interno do servidor ao atualizar fatura.' })
    }
})

// Rota para marcar uma compra específica como quitada
router.patch('/faturas/:id_usuario/:id_fatura/:id_compra', async (req, res) => {
    const idUsuario = req.params.id_usuario
    const idFatura = req.params.id_fatura
    const idCompra = req.params.id_compra

    try {
        // Encontre as finanças do usuário
        const financas = await Financas.findOne({ id_usuario: idUsuario })

        if (!financas) {
            return res.status(404).json({ message: "Finanças não encontradas para este usuário." })
        }

        // Encontre a fatura dentro das finanças do usuário
        const fatura = financas.faturas.find(fatura => fatura._id.toString() === idFatura)

        if (!fatura) {
            return res.status(404).json({ message: "Fatura não encontrada para este usuário." })
        }

        // Encontre a compra na fatura pelo ID
        const compraIndex = fatura.compras.findIndex(compra => compra._id.toString() === idCompra)

        if (compraIndex === -1) {
            return res.status(404).json({ message: "Compra não encontrada nesta fatura." })
        }

        // Marque a compra como quitada
        fatura.compras[compraIndex].quitada = true

        // Salve as alterações nas finanças do usuário
        await financas.save()

        res.status(200).json({ message: "Compra marcada como quitada com sucesso!" })

    } catch (error) {
        console.error('Erro ao marcar compra como quitada:', error)
        res.status(500).json({ error: 'Erro interno do servidor ao marcar compra como quitada.' })
    }
})

module.exports = router
