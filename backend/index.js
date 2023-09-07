const express = require("express");
const cors = require('cors');
const dotenv = require("dotenv");
const app = express();

dotenv.config();

const port = process.env.PORT || 3300;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/api', require('./routes/token'));
app.listen(port, () => console.log(`Servidor corriendo en http://localhost:${port}`));

module.exports = app;