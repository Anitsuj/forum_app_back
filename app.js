const express = require('express');
const cors = require('cors');
const router = require('./router');
const app = express();
const port = 2020;
const mongoose = require('mongoose');
require('dotenv').config();

mongoose
  .connect(process.env.MONGO_KEY)
  .then(() => {
    console.log('Connection ok');
  })
  .catch((err) => {});

app.use(express.json());
app.use(cors());
app.use('', router);
app.listen(port, () => {});
