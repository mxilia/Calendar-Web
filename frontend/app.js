const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.FRONT_END_PORT || 8000;

app.use('/', express.static('public'));

app.listen(port, () => {
    console.log(`Frontend server running at http://localhost:${port}`)
});

