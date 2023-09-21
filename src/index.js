const express = require('express')
const { format } = require('date-fns');
const pool = require('./config')
require('dotenv').config()

const PORT = 3333


const app = express()

app.use(express.json()) // para poder ler o corpo da requisição no formato json

app.get('/', (req, res) => {console.log('olá mundo')})

app.get('/atestados', async (req, res) => {
    try {
        // Ordenar por ID em ordem decrescente (do mais recente para o mais antigo)
        const atestados = await pool.query('SELECT * FROM atestados ORDER BY id DESC');
        
        // Mapear os resultados e formatar as datas antes de enviar a resposta
        const atestadosFormatados = atestados.rows.map((atestado) => ({
            id: atestado.id,
            nome: atestado.nome,
            empresa: atestado.empresa,
            data: format(new Date(atestado.data), 'dd/MM/yyyy'),
            setor: atestado.setor,
            cargo: atestado.cargo,
            data_atestado: format(new Date(atestado.data_atestado), 'dd/MM/yyyy'),
            tempo_atestado: atestado.tempo_atestado,
            motivo: atestado.motivo,
            obs: atestado.obs
        }));
        
        res.json(atestadosFormatados);
    } catch (error) {
        res.status(400).send(error.message);
    }
});


app.post('/atestados', async (req, res) => {
    try {
        const { nome, empresa, data, setor, cargo, data_atestado, tempo_atestado, motivo, obs } = req.body;

        const query = 'INSERT INTO atestados (nome, empresa, data, setor, cargo, data_atestado, tempo_atestado, motivo, obs) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *';
        const values = [nome, empresa, data, setor, cargo, data_atestado, tempo_atestado, motivo, obs];

        const result = await pool.query(query, values);
        
        // Verifique se algum registro foi inserido
        if (result.rowCount === 1) {
            const novoAtestado = result.rows[0];
            res.status(201).json(novoAtestado);
        } else {
            res.status(400).send('Falha ao criar o atestado.');
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});


app.get('/atestados/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const atestado = await pool.query('SELECT * FROM atestados WHERE id = $1', [id]);
        
        if (atestado.rows.length === 0) {
            res.status(404).send('Atestado não encontrado');
        } else {
            // Formate as datas no padrão DD/MM/YYYY antes de enviar a resposta
            const atestadoFormatado = {
                id: atestado.rows[0].id,
                nome: atestado.rows[0].nome,
                empresa: atestado.rows[0].empresa,
                data: format(new Date(atestado.rows[0].data), 'dd/MM/yyyy'),
                setor: atestado.rows[0].setor,
                cargo: atestado.rows[0].cargo,
                data_atestado: format(new Date(atestado.rows[0].data_atestado), 'dd/MM/yyyy'),
                tempo_atestado: atestado.rows[0].tempo_atestado,
                motivo: atestado.rows[0].motivo,
                obs: atestado.rows[0].obs
            };
            
            res.json(atestadoFormatado);
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});


app.put('/atestados/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, empresa, data, setor, cargo, data_atestado, tempo_atestado, motivo, obs } = req.body;

        const query = 'UPDATE atestados SET nome = $1, empresa = $2, data = $3, setor = $4, cargo = $5, data_atestado = $6, tempo_atestado = $7, motivo = $8, obs = $9 WHERE id = $10 RETURNING *';
        const values = [nome, empresa, data, setor, cargo, data_atestado, tempo_atestado, motivo, obs, id];

        const result = await pool.query(query, values);
        
        // Verifique se algum registro foi atualizado
        if (result.rowCount === 1) {
            const atestadoAtualizado = result.rows[0];
            res.json(atestadoAtualizado);
        } else {
            res.status(404).send('Atestado não encontrado.');
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
});


app.delete('/atestados/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM atestados WHERE id = $1', [id]);
        res.send('Atestado excluído com sucesso!');
    } catch (error) {
        res.status(400).send(error.message);
    }
});




app.listen(PORT, () => console.log(`Server running on port ${PORT}`))