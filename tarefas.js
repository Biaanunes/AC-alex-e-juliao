const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();

const port = 3000;

const alunoPath = path.join(__dirname, 'tarefas.html');
const tarefasPath = path.join(__dirname, 'tarefas.json');

const tarefas = JSON.parse(fs.readFileSync(tarefasPath, 'utf-8'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function salvarDados () {
    fs.writeFileSync(tarefasPath, JSON.stringify(tarefas, null, 2));
}

app.get('/', (req, res) => {
    res.sendFile(alunoPath)
});

app.post('/', (req, res) => {
    const novaTarefa = req.body;

    if (tarefas.find (tarefa => tarefa.nome.toLowerCase() === novaTarefa.nome.toLowerCase())) {
        res.send('<h1>Essa tarefa já exixste.</h1>');
        return;
    }

    tarefas.push(novaTarefa);

    salvarDados();

    res.send('<h1>Tarefa adicionada com sucesso!</h1>');
});

app.get('/atualizar', (req, res) => {
    res.sendFile(path.join(__dirname, 'atualizar.html'));
});

app.post('/atualizar', (req, res) => {
    const { nome, novaDescricao, novaUrlInfo } = req.body;

    const tarefasIndex = tarefas.findIndex(tarefa => tarefa.nome.toLowerCase() === nome.toLowerCase());

    if (tarefasIndex === -1) {
        res.send('<h1>Tarefa não encontrada</h1>');
        return;
    }

    tarefas[tarefasIndex].descricao = novaDescricao;
    tarefas[tarefasIndex].urlInfo = novaUrlInfo;

    salvarDados();

    res.send('<h1>Tarefa foi atualizada com sucesso!</h1>');
});

app.get('/excluir', (req, res) => {
    res.sendFile(path.join(__dirname, 'excluir.html'));
});

app.post('/excluir', (req, res) => {
    const { nome } = req.body;

    let tarefasData = fs.readFileSync(tarefasPath, 'utf-8');
    let tarefas = JSON.parse (tarefasData);

    const tarefasIndex = tarefas.findIndex(tarefa => tarefa.nome.toLowerCase() === nome.toLowerCase());

    if(tarefasIndex === -1){
        res.send('<h1>Tarefa não encontrada</h1>');
        return;
    }
    res.send(`
        <script>
        if (confirm('Tem certeza de que deseja excluir a tarefa ${nome}?')) {
        window.location.href = '/excluir-confirmado?nome=${nome}';
        } else {
        window.location.href = '/excluir';
        }
        </script>
        `);
});

app.get('/excluir-confirmado', (req, res) => {
    const nome =  req.query.nome;

    let tarefasData = fs.readFileSync(tarefasPath, 'utf-8');
    let tarefas = JSON.parse(tarefasData);

    const tarefasIndex = tarefas.findIndex(tarefa => tarefa.nome.toLowerCase() === nome.toLowerCase());

    tarefas.splice(tarefasIndex, 1);

    salvarDados();

    res.send(`<h1>A tarefa ${nome} foi excluida com sucesso!</h1>`);
});

app.get('/tarefas', (req, res) => {
    res.json(tarefas);
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
