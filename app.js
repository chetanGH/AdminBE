require('dotenv').config();
require('./db');
const express = require('express');
const bodyparser = require('body-parser');
const app = express();
const routes = require('./routes/basic.routes');
const cors = require('cors');

app.use(bodyparser.json());

const corsList = ['http://localhost:4200']
const Options = (req, callback) => {
    let corsOptions;
    if (corsList.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true }
    } else {
        corsOptions = { origin: false }
    }
    callback(null, corsOptions)
}
app.use(cors(Options));

app.use('/api',routes);

app.listen(process.env.PORT,()=>{
    console.log(`server listening on ${process.env.PORT}`);
})