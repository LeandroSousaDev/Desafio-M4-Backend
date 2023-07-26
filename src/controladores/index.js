let bancoDeDados = require('../bancodedados')

function data() {
    const data = new Date()

    const dia = String(data.getDate())
    const mes = String(data.getMonth() + 1).padStart(2, 0)
    const ano = String(data.getFullYear()).padStart(2, 0)

    const hora = String(data.getHours()).padStart(2, 0)
    const minuto = String(data.getMinutes()).padStart(2, 0)
    const segundo = String(data.getSeconds()).padStart(2, 0)

    return `${ano}-${mes}-${dia} ${hora}:${minuto}:${segundo}`
}

let numeroConta = bancoDeDados.contas.length

const listarContas = (req, res) => {
    const { senha } = req.query

    if (senha !== bancoDeDados.banco.senha) {
        return res.json('senha incorreta')
    }

    return res.status(200).json(bancoDeDados.contas)
}

const criarConta = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body

    if (!nome || !cpf || !data_nascimento || !telefone || !email || !senha) {
        return res.status(400).json({
            mensagem: 'É necessário enviar nome, cpf, data de nascimento, telefone, email e senha do usuário para cria conta.'
        })
    }

    const cliente = {
        numero: numeroConta += 1,
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
    }

    bancoDeDados.contas.push(cliente)

    return res.status(201).json(cliente)
}

const atualizarUsuario = (req, res) => {
    const { numeroConta } = req.params;
    const {
        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        senha
    } = req.body;

    if (!nome &&
        !cpf &&
        !data_nascimento &&
        !telefone &&
        !email &&
        !senha &&
        !numeroConta
    ) {
        return res.status(400).json({ mensagem: 'É necessário enviar os dados do usuário.' })
    };

    const confirmaConta = bancoDeDados.contas.find((conta) => {
        return conta.numero === Number(numeroConta);
    });

    if (!confirmaConta) {
        return res.status(404).json({ mensagem: 'Conta inexistente!' })
    };

    const verificaCpf = bancoDeDados.contas.filter((conta) => {
        return conta.usuario.cpf === cpf;
    });

    if (verificaCpf.length > 1 && Number(numeroConta) !== confirmaConta.numero) {
        return res.status(400).json({ mensagem: 'Já existe um usuário com este CPF.' });
    };

    const verificaEmail = bancoDeDados.contas.filter((conta) => {
        return conta.usuario.email === email;
    });

    if (verificaEmail.length > 1 && Number(numeroConta) !== confirmaConta.numero) {
        return res.status(400).json({ mensagem: 'Já existe um usuário com este email.' });
    };

    confirmaConta.usuario.nome = nome,
        confirmaConta.usuario.cpf = cpf,
        confirmaConta.usuario.data_nascimento = data_nascimento,
        confirmaConta.usuario.telefone = telefone,
        confirmaConta.usuario.email = email,
        confirmaConta.usuario.senha = senha

    return res.status(200).json({ mensagem: 'Conta atualizada com sucesso!' });
}

const excluirConta = (req, res) => {
    const { numeroConta } = req.params;

    const confirmaConta = bancoDeDados.contas.find((conta) => {
        return conta.numero === Number(numeroConta);
    });

    if (!confirmaConta) {
        return res.status(404).json({ mensagem: 'Conta inexistente!' })
    };

    if (confirmaConta.saldo !== 0) {
        return res.status(400).json({ mensagem: 'O saldo precisa estar zerado para exluir a conta!' })
    };

    bancoDeDados.contas = bancoDeDados.contas.filter((contas) => {
        return contas.numero !== Number(numeroConta);
    });

    return res.status(200).json({ mensagem: 'Conta excluída com sucesso!' });
}

const depositar = (req, res) => {
    const { numero_conta, valor } = req.body

    if (!numero_conta || !valor) {
        return res.status(400).json({ mensagem: 'O necessario enviar o numero da conta e o valor' })
    }

    const conta = bancoDeDados.contas.find((c) => {
        return c.numero === Number(numero_conta)
    })
    if (!conta) {
        return res.status(400).json({ mensagem: 'O numero da conta não existe' })
    }

    if (Number(valor) <= 0) {
        return res.status(400).json({ mensagem: 'valor invalido' })
    }

    const novoValor = conta.saldo + Number(valor)

    conta.saldo = novoValor

    const novodeposito = {
        data: data(),
        numero_conta,
        valor: Number(valor)
    }

    bancoDeDados.depositos.push(novodeposito)

    return res.status(200).json({ mensagem: "Depósito realizado com sucesso!" })
}

const sacar = (req, res) => {
    const { numero_conta, valor, senha } = req.body;

    if (!numero_conta || !valor || !senha) {
        return res.status(400).json({
            mensagem: 'É necessário enviar o número da conta, valor e senha para esta transação!'
        });
    };

    const confirmaConta = bancoDeDados.contas.find((conta) => {
        return conta.numero === Number(numero_conta);
    });

    if (!confirmaConta) {
        return res.status(404).json({ mensagem: 'Conta inexistente!' })
    };

    if (confirmaConta.usuario.senha !== senha) {
        return res.status(404).json({ mensagem: 'Senha incorreta, tente novamente!' });
    };

    if (confirmaConta.saldo <= 0 || confirmaConta.saldo < valor) {
        return res.status(200).json({ mensagem: 'Saldo insuficiente!' });
    };

    const novoSaldo = confirmaConta.saldo - valor;
    confirmaConta.saldo = novoSaldo;

    return res.status(200).json({ mensagem: "Saque realizado com sucesso!" });
}

const transferir = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body

    if (!numero_conta_origem || !numero_conta_destino || !valor || !senha) {
        return res.status(400).json({ mensagem: 'A conta de origem, conta de destino, valor e senha são obrigatório' })
    }

    const contaOrigem = bancoDeDados.contas.find((c) => {
        return c.numero === Number(numero_conta_origem)
    })
    if (!contaOrigem) {
        return res.status(400).json({ mensagem: 'A conta origem não existe' })
    }

    const contaDestino = bancoDeDados.contas.find((c) => {
        return c.numero === Number(numero_conta_destino)
    })
    if (!contaDestino) {
        return res.status(400).json({ mensagem: 'A conta destino não existe' })
    }

    if (contaOrigem.usuario.senha !== senha) {
        return res.status(400).json({ mensagem: 'senha incorreta' })
    }
    if (contaOrigem.saldo <= Number(valor)) {
        return res.status(400).json({ mensagem: 'salto insuficiente' })
    }

    const valorTransferido = contaOrigem.saldo - Number(valor)
    contaOrigem.saldo = valorTransferido


    const valorDepositado = contaDestino.saldo + Number(valor)
    contaDestino.saldo = valorDepositado

    const novaTransferencio = {
        data: data(),
        numero_conta_origem,
        numero_conta_destino,
        valor: Number(valor)
    }

    bancoDeDados.transferencias.push(novaTransferencio)

    return res.status(200).json({ mensagem: 'Transferência realizada com sucesso!' })
}

const saldo = (req, res) => {
    const { numero_conta, senha } = req.query;

    if (!numero_conta || !senha) {
        return res.status(400).json({
            mensagem: 'É necessário enviar o número da conta e senha para esta transação!'
        });
    };

    const confirmaConta = bancoDeDados.contas.find((conta) => {
        return conta.numero === Number(numero_conta);
    });

    if (!confirmaConta) {
        return res.status(404).json({ mensagem: 'Conta inexistente!' })
    };

    if (confirmaConta.usuario.senha !== senha) {
        return res.status(404).json({ mensagem: 'Senha incorreta, tente novamente!' });
    };

    return res.status(200).json({ mensagem: `saldo: ${confirmaConta.saldo}` });
}

const extrato = (req, res) => {
    const { numero_conta, senha } = req.query

    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: 'O numero da conta e senha são obrigatório' })
    }

    const conta = bancoDeDados.contas.find((c) => {
        return c.numero === Number(numero_conta)
    })
    if (!conta) {
        return res.status(400).json({ mensagem: 'A conta origem não existe' })
    }

    if (conta.usuario.senha !== senha) {
        return res.status(400).json({ mensagem: 'senha incorreta' })
    }

    const depositos = bancoDeDados.depositos.filter((c) => {
        return Number(c.numero_conta) === Number(numero_conta)
    })
    const saques = bancoDeDados.saques.filter((c) => {
        return Number(c.numero_conta) === Number(numero_conta)
    })
    const transferenciasRecebida = bancoDeDados.transferencias.filter((c) => {
        return Number(c.numero_conta_destino) === Number(numero_conta)
    })
    const transferenciasEviada = bancoDeDados.transferencias.filter((c) => {
        return Number(c.numero_conta_origem) === Number(numero_conta)
    })

    const extrato = {
        depositos: depositos,
        saques: saques,
        transferenciasEviada: transferenciasEviada,
        transferenciasRecebida: transferenciasRecebida
    }

    return res.status(200).json(extrato)
}

module.exports = {
    listarContas,
    criarConta,
    atualizarUsuario,
    excluirConta,
    depositar,
    sacar,
    transferir,
    saldo,
    extrato
}