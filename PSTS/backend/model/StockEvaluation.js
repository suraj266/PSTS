const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });


const Schema = new mongoose.Schema({
    companyCode: { type: String, required: true },
    companyName: { type: String, required: true },
    currentPrice: { type: Number, required: true },
    highPrice: { type: Number, required: true },
    lowPrice: { type: Number, required: true },
    variance: { type: Number, required: true },
    stockSignal: { type: String, required: true },
})


const Stocks = mongoose.model('stockevaluation', Schema);
module.exports = Stocks;