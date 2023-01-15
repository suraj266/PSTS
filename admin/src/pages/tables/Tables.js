import React from "react";
import { Grid } from "@material-ui/core";
import MUIDataTable from "mui-datatables";


export default function Tables(props) {
  return (
    <>
      {/* <PageTitle title="Tables" /> */}
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <MUIDataTable
            title={props.Title}
            data={props.Rows}
            columns={props.Columns}
            options={{
              filterType: "checkbox",
              selectableRows: 'none'
            }}
          />
        </Grid>
      </Grid>
    </>
  );
}
