const express = require('express');
require('dotenv').config();

const app = express();
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
const router = require('./routes/Routes');

app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(router);

const port = process.env.PORT || 8080;
const host = process.env.HOST;
app.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}`);
});
