const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise')

require('dotenv').config()

const app = express();
const port = process.env.BACK_END_PORT || 3000;

app.use(bodyparser.json());
app.use(cors({origin: `http://localhost:8000`}));

let conn = null;
const connect_database = async() => {
    try {
        conn = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '1234',
            database: 'calendardb',
            port: 3306
        });
    }
    catch(error){
        console.log("Error connecting database:", error.message);
    }
    console.log("Successfully connected to db.")
}

app.delete('/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const [result] = await conn.query('DELETE FROM user_events WHERE id = ?', [id]);
        console.log('---------------------------------------------------')
        console.log(id, result)
        if(result.affectedRows>0) res.status(200).json({ result: result, message: 'Delete successfully.'});
        else res.status(400).json({ result: result, message: 'Event not found.'});
    }
    catch(error) {
        res.status(500).json({ status: "error", message: err.message });
    }
});

app.post('/', async (req, res) => {
    const data = req.body;
    console.log(data);
    try {
        const result = await conn.query('INSERT INTO user_events SET ?', data);
        console.log(result)
        res.status(201).json({ result: result, message: 'Event created successfully.'});
    }
    catch(error){
        console.error('Error creating event:', error.message);
        res.status(500).json({ error: error, message: 'Error creating event.' });
    }
});

app.get('/', async (req, res) => {
    try {
        const [result] = await conn.query('SELECT * FROM user_events');
        if(result.length === 0) return res.status(404).json({ error: 'User not found.', message: 'User not found.'})
        res.json(result);
    }
    catch(error){
        console.error('Error fetching:', error.message);
        res.status(500).json({ error: error, message: 'Error fetching events.' });
    }
});

app.listen(port, async () => {
    await connect_database();
    console.log(`Backend server running at http://localhost:${port}`)
});