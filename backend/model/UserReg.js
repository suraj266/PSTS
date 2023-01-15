const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });


const Scheama = new mongoose.Schema({
    U_name: { type: String, required: true },
    U_email: { type: String, required: true, unique: true },
    U_mobile: { type: String, required: true },
    U_address: { type: String, required: true },
    U_city: { type: String, required: true },
    U_state: { type: String, required: true },
    U_password: { type: String, required: true },
    VirtualAmount: { type: Number, default: 0, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    PortfolioHistory: [
        {
            companyId: { type: String, required: true },
            companyCode: { type: String, required: true },
            companyName: { type: String, required: true },
            currentPrice: { type: Number, required: true },
            buyStock: { type: Number },
            totalBuyPrice: { type: Number },
            sellStock: { type: Number },
            totalSellPrice: { type: Number },
            comment: { type: String, required: true },
            createdAt: { type: Date, default: Date.now, required: true },
        }
    ],
    tokens: [
        {
            token: {
                type: String,
                required: true
            }
        }
    ]
})

// password hashing

Scheama.pre('save', async function (next) {
    if (this.isModified('U_password')) {
        this.U_password = await bcrypt.hash(this.U_password, 12);
    }
    next();
});

// generating token

Scheama.methods.generateAuthToken = async function () {
    try {
        let token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (error) {
        console.log(error);
    }
}

// save PortfolioHistory

Scheama.methods.addPortfolioHistory = async function (param) {
    const { companyId, companyCode, companyName, currentPrice, buyStock, totalBuyPrice, sellStock, totalSellPrice, comment } = param
    try {
        this.PortfolioHistory = this.PortfolioHistory.concat({ companyId, companyCode, companyName, currentPrice, buyStock, totalBuyPrice, sellStock, totalSellPrice, comment });

        await this.save();
        return this.PortfolioHistory;

    } catch (err) {
        console.log(err);
    }
}

const User = mongoose.model('User', Scheama);
module.exports = User;