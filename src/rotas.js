const express = require('express')
const controladores = require('./controladores/index')

const rotas = express()

rotas.get('/contas', controladores.listarContas)
rotas.post('/contas', controladores.criarConta)
rotas.put('/contas/:numeroConta/usuario', controladores.atualizarUsuario)
rotas.delete('/contas/:numeroConta', controladores.excluirConta)
rotas.post('/transacoes/depositar', controladores.depositar)
rotas.post('/transacoes/sacar', controladores.sacar)
rotas.post('/transacoes/transferir', controladores.transferir)
rotas.get('/contas/saldo', controladores.saldo)
rotas.get('/contas/extrato', controladores.extrato)

module.exports = rotas