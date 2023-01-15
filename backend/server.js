
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');
const express = require('express');
const bcrypt = require('bcrypt');
dotenv.config({ path: './config.env' });
const server = express();
const PORT = process.env.PORT;
require('./db-conn/conn');
const User = require('./model/UserReg');
const StocksEvaluation = require('./model/StockEvaluation');
const Admin = require('./model/Admin');

const userAuth = require('./middleware/userAuth');
const adminAuth = require('./middleware/adminAuth');

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: false }));



server.post('/Register', async (req, res) => {
    const { U_name, U_email, U_mobile, U_address, U_city, U_state, U_password, Cpassword } = req.body;

    if (!U_name || !U_email || !U_mobile || !U_address || !U_city || !U_state || !U_password) {
        res.status(422).json({ status: false, error: "Please fill all fields" });
    }

    try {
        const userExist = await User.findOne({ U_email: U_email });
        if (userExist) {
            return res.status(422).json({ status: false, Error: "Email already Exist" });
        } else if (U_password != Cpassword) {
            return res.status(422).json({ status: false, Error: "Confirm Password Must be Same" });
        } else {
            const user = new User(req.body);

            await user.save()
            res.status(201).json({ status: true, Message: "User Registered Successfully " });
        }

    } catch (err) {
        res.status(400).send({ status: false, Error: err });
    }
});


server.post('/login', async (req, res) => {
    try {
        const { U_email, U_password } = req.body;

        if (!U_email || !U_password) {
            return res.status(400).json({ status: false, error: "Please Fill All The Fields" })
        }
        const userLogin = await User.findOne({ U_email: U_email });

        if (userLogin) {
            const isMatch = await bcrypt.compare(U_password, userLogin.U_password)
            let token = jwt.sign({ _id: userLogin._id }, process.env.SECRET_KEY);
            if (!isMatch) {
                res.status(400).json({ status: false, error: "Invalid Credientials1" });
            } else {
                res.json({ status: true, message: "User Signin Successfully", token: token, });
            }
        } else {
            res.status(400).json({ status: false, error: "Invalid Credientials" });
        }
    } catch (err) {
        res.status(400).send({ status: false, Error: err })
    }
})


// Admin registration

server.post('/adminRegister', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(422).json({ status: false, error: "Please fill all fields" });
    }

    try {
        const adminExist = await Admin.findOne({ email: email });
        if (adminExist) {
            return res.status(422).json({ status: false, Error: "Email already Exist" });
        } else {
            const admin = new Admin(req.body);

            await admin.save()
            res.status(201).json({ status: true, Message: "Admin Registered Successfully " });
        }

    } catch (err) {
        res.status(400).send({ status: false, Error: err });
    }
});


// Admin Login

server.post('/adminlogin', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ status: false, error: "Please Fill All The Fields" })
        }
        const adminLogin = await Admin.findOne({ email: email });


        if (adminLogin) {
            const isMatch = await bcrypt.compare(password, adminLogin.password)
            let adminToken = jwt.sign({ _id: adminLogin._id }, process.env.SECRET_KEY);
            if (!isMatch) {
                res.status(400).json({ status: false, error: "Invalid Credientials1" });
            } else {
                res.json({ status: true, message: "User Signin Successfully", token: adminToken, adminName: adminLogin.email });
            }
        } else {
            res.status(400).json({ status: false, error: "Invalid Credientials" });
        }
    } catch (err) {
        res.status(400).send({ status: false, Error: err })
    }
})


// User StockPortfolioHistory Api

server.post('/PortfolioHistory', userAuth, async (req, res) => {
    try {
        let buyStock = req.body.buyStock === "" ? 0 : req.body.buyStock;
        let sellStock = req.body.sellStock === "" ? 0 : req.body.sellStock;
        let totalBuyPrice = req.body.totalBuyPrice === "" ? 0 : req.body.totalBuyPrice;
        let totalSellPrice = req.body.totalSellPrice === "" ? 0 : req.body.totalSellPrice;

        const param = {
            companyId: req.body.companyId,
            companyCode: req.body.companyCode,
            companyName: req.body.companyName,
            currentPrice: req.body.currentPrice,
            buyStock: buyStock,
            totalBuyPrice: totalBuyPrice,
            sellStock: sellStock,
            totalSellPrice: totalSellPrice,
            comment: req.body.comment
        }

        const user = await User.findOne({ _id: req.userID });
        if (user) {
            const userPortfolioHistory = await user.addPortfolioHistory(param);
            await user.save();

            res.status(201).json({ status: true, messege: "Stock Buy/Sell Successfully", data: userPortfolioHistory });
        }
    } catch (err) {
        res.status(400).send({ status: false, Error: err })
    }
});

// Update Virtual Amount

server.post('/UpdateVamount', userAuth, async (req, res) => {
    try {
        const { VirtualAmount } = req.body;
        const data = await User.findByIdAndUpdate({ _id: req.userID }, {
            $set: {
                VirtualAmount: VirtualAmount
            }
        });
        if (!data) {
            res.status(404).json({ status: false, Message: 'data not update' })
        } else {
            res.status(201).send({ status: true, Message: 'updated' })
        }
    } catch (err) {
        res.status(400).send({ status: false, Error: err })
    }
});

// fetch portfoliHistory List 

server.post('/portfoliHistoryList', userAuth, async (req, res) => {
    try {
        const data = await User.findOne({ _id: req.userID });
        let array = data.PortfolioHistory;
        let toBuyStock = 0;
        let toSellStock = 0;
        for (const element of array) {
            const cid = element.companyId;
            if (cid === req.body.companyId) {

                toBuyStock = element.buyStock + toBuyStock;
                toSellStock = element.sellStock + toSellStock;
            }
        }
        let stockLeft = toBuyStock - toSellStock;
        let Stock = {
            stockLeft: stockLeft,
            VirtualAmount: data.VirtualAmount
        }
        res.status(200).json({ Stock: Stock, transactionHistory: array, userData: data });

    } catch (error) {
        res.status(400).send({ status: false, Error: error });
    }
})

// admin work 
// userInfoList d
// StockEvaluation insert d
// admin update virtual amount d
// delete user 

server.post('/admin/UpdateVamount/:id', adminAuth, async (req, res) => {
    try {

        const data = await User.findByIdAndUpdate({ _id: req.params.id }, {
            $set: {
                VirtualAmount: req.body.VirtualAmount
            }
        });
        if (!data) {
            res.status(404).json({ status: false, Message: 'data not update' })
        } else {
            res.status(201).send({ status: true, Message: 'updated' })
        }
    } catch (err) {
        console.log(err);
        res.status(400).send({ status: false, Error: err })
    }
});


server.post('/admin/deleteUser/:id', adminAuth, async (req, res) => {
    try {
        console.log(req.params);
        const data = await User.findOneAndDelete({ _id: req.params.id });
        if (!data) {
            res.status(404).json({ status: false, Message: 'data not delete' })
        } else {
            res.status(201).send({ status: true, Message: 'deleted' })
        }
    } catch (err) {
        console.log(err);
        res.status(400).send({ status: false, Error: err })
    }
});


server.get('/admin/portfoliHistoryList/:id', adminAuth, async (req, res) => {
    try {
        const data = await User.findOne({ _id: req.params.id });
        let array = data.PortfolioHistory;
        res.status(200).json({ transactionHistory: array });

    } catch (error) {
        res.status(400).send({ status: false, Error: error });
    }
})

server.get('/userInfoList', adminAuth, async (_req, res) => {
    try {
        const data = await User.find({}).select(['U_name', 'U_email', 'U_mobile', 'VirtualAmount']);
        res.status(202).send(data);
    } catch (error) {
        res.status(400).send({ status: false, Error: error });
    }
})


server.post('/StockEvaluation', adminAuth, async (req, res) => {
    try {
        await StocksEvaluation.insertMany(req.body);
        res.status(201).json({ status: true, Message: "Stock Data Inserted Successfully " });
    } catch (err) {
        console.log(err);
        res.status(400).send({ status: false, Error: err });
    }
})

// for all users

server.get('/StockEvaluationList', async (_req, res) => {
    try {
        const data = await StocksEvaluation.find()
        res.status(201).send({ data: data });

    } catch (err) {
        res.status(400).send({ status: false, Error: err });
    }
})

server.listen(PORT, () => {
    console.log(`Express Server Running at ${PORT}`);
});