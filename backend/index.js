const express = require('express');
const bodyparser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2/promise');

//require('dotenv').config()

const app = express();
const port = process.env.BACK_END_PORT || 3000;

app.use(bodyparser.json());
app.use(cors(/*{origin: `http://localhost:8000`}*/));

let conn = null;
const connect_database = async() => {
    while(!conn){
        try {
            conn = await mysql.createConnection({
                host: 'db',
                user: 'root',
                password: '1234',
                database: 'calendardb',
                port: 3306
            });
        }
        catch(error){
            console.log("Error connecting database:", error.message);
            console.log("Reconnecting db.")
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    console.log("Successfully connected to db.")
    
    const [table] = await conn.query(`SHOW TABLES LIKE 'user_events'`);
    if(table.length == 0){
        await conn.query(`
                        CREATE TABLE user_events (
                            id int NOT NULL AUTO_INCREMENT,
                            event_name varchar(50) DEFAULT NULL,
                            tag_name varchar(10) DEFAULT NULL,
                            desc_text mediumtext,
                            start_time datetime DEFAULT NULL,
                            end_time datetime DEFAULT NULL,
                            tag_rgb varchar(20) DEFAULT NULL,
                            PRIMARY KEY (id)
                        ) ENGINE=InnoDB AUTO_INCREMENT=126 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
                        `);
        console.log("Table created.")
    }
    else console.log("Table existed.")
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
        const [result] = await conn.query('SELECT * FROM user_events ORDER BY end_time');
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