import React, { useEffect, useState } from "react";
import {
  Grid
} from "@material-ui/core";

// components
import mock from "./mock";
import PageTitle from "../../components/PageTitle";
import BigStat from "./components/BigStat/BigStat";
import Tables from "../tables/Tables";

const columns = [
  { name: 'id', label: 'S.No', options: { filter: false, sort: true, } },
  { name: 'Name', label: 'Name', options: { filter: true, sort: true, } },
  { name: 'Email', label: 'Email', width: 205, options: { filter: false, sort: false, } },
  { name: 'Mobile', label: 'Mobile', width: 205, options: { filter: false, sort: false, } },
  { name: 'VirtualAmount', label: 'Virtual Amount', width: 205, options: { filter: false, sort: true, } },
];

export default function Dashboard(_props) {

  const [userRow, setUserRow] = useState([]);

  console.log(localStorage.getItem("id_token"));

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

  const rows = userRow.map((row,index) => {
    return [
      index+1,
      row.U_name,
      row.U_email,
      row.U_mobile,
      row.VirtualAmount,
    ]
  })

  return (
    <>
      <PageTitle title="Dashboard" />
      <Grid container spacing={4}>
        {mock.bigStat.map(stat => (
          <Grid item md={4} sm={6} xs={12} key={stat.product}>
            <BigStat {...stat} />
          </Grid>
        ))}
        <Grid item xs={12}>

          <Tables
            Title='Users List'
            Rows={rows}
            Columns={columns}
          />
        </Grid>
      </Grid>
    </>
  );
}
