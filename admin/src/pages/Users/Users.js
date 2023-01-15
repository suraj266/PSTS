import { Button, IconButton } from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import React, { useEffect, useState } from 'react'
import Tables from '../tables/Tables';
import DeleteIcon from '@material-ui/icons/Delete';
import UpdateVirtualAmount from '../UpdateVirtualAmount/UpdateVirtualAmount';


export default function Users() {
    const [userRow, setUserRow] = useState([]);
    const [transHistory, setTransHistory] = useState([]);
    const [ActiveTab, setActiveTab] = useState(0);

    const getUser = async () => {
        try {
            const res = await fetch('http://localhost:5000/userInfoList', {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("id_token")
                },
            });
            const data = await res.json();
            setUserRow(data);
            if (res.status === 400 || !data) {
                window.alert('No data Found')
            }
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        getUser();
    }, [])


    const gettransHistorylist = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/admin/portfoliHistoryList/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("id_token")
                },
            });
            const data = await res.json();
            setTransHistory(data.transactionHistory);
            if (res.status === 400 || !data) {
                window.alert('No data Found')
            }
            setActiveTab(1);
        } catch (err) {
            console.log(err);
        }
    }

    const deleteUser = async (id) => {
        try {
            const res = await fetch(`http://localhost:5000/admin/deleteUser/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("id_token")
                },
            });
            if (res.status === 400) {
                window.alert('No data Found')
            }
            getUser();
        } catch (err) {
            console.log(err);
        }
    }

    const userList = userRow.map((row, index) => {
        return [
            index + 1,
            row.U_name,
            row.U_email,
            row.U_mobile,
            row.VirtualAmount,
            <span><Button onClick={() => gettransHistorylist(row._id)} color="primary">Transaction History</Button></span>,
            <span>
                <UpdateVirtualAmount 
                id={row._id}
                Vamt={row.VirtualAmount}
                />
                <IconButton title="Delete User" onClick={() => deleteUser(row._id)}>
                    <DeleteIcon />
                </IconButton>
            </span>
        ]
    })

    const transList = transHistory.map(({ companyCode, companyName, currentPrice, buyStock, totalBuyPrice, sellStock, totalSellPrice, comment }, index) => {
        return [
            index + 1,
            companyCode,
            companyName,
            currentPrice,
            buyStock,
            totalBuyPrice,
            sellStock,
            totalSellPrice,
            comment
        ]
    })

    return (
        <>
            {ActiveTab === 0 && <Tables
                Title='Users List'
                Rows={userList}
                Columns={[
                    { name: 'id', label: 'S.No', options: { filter: false, sort: true, } },
                    { name: 'Name', label: 'Name', options: { filter: true, sort: true, } },
                    { name: 'Email', label: 'Email', width: 205, options: { filter: false, sort: false, } },
                    { name: 'Mobile', label: 'Mobile', width: 205, options: { filter: false, sort: false, } },
                    { name: 'VirtualAmount', label: 'Virtual Amount', width: 205, options: { filter: false, sort: true, } },
                    { name: 'Transaction History', label: 'Transaction History', width: 205, options: { filter: false, sort: false, } },
                    { name: 'Action', label: 'Action', width: 205, options: { filter: false, sort: false, } },
                ]}
            />}

            {ActiveTab === 1 && <Tables
                Title={[<IconButton onClick={() => setActiveTab(0)}><ArrowBackIcon /></IconButton>, "Transaction History"]}
                Rows={transList}
                Columns={[
                    { name: 'id', label: 'S.No', options: { filter: false, sort: true, } },
                    { name: 'companyCode', label: 'company Code', width: 205, options: { filter: false, sort: true, } },
                    { name: 'companyName', label: 'company Name', width: 205, options: { filter: true, sort: true, } },
                    { name: 'currentPrice', label: 'current Price', width: 205, options: { filter: false, sort: true, } },
                    { name: 'buyStock', label: 'buy Stock', width: 205, options: { filter: false, sort: true, } },
                    { name: 'totalBuyPrice', label: 'total Buying Price', width: 205, options: { filter: false, sort: true, } },
                    { name: 'sellStock', label: 'sell Stock', width: 205, options: { filter: false, sort: true, } },
                    { name: 'totalSellPrice', label: 'total Selling Price', width: 205, options: { filter: false, sort: true, } },
                    { name: 'comment', label: 'comment', width: 205, options: { filter: false, sort: false, } },
                ]}
            />}
        </>
    )
}
