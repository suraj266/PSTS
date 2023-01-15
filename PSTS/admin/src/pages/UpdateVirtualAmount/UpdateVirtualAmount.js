import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useTheme } from '@material-ui/core/styles';
import { IconButton, TextField } from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';

export default function UpdateVirtualAmount(props) {
    const [open, setOpen] = React.useState(false);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [Vamount, setVamount] = React.useState(props.Vamt);

    const handleClickOpen = async () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const UpdateVamount = async () => {
        try {
            const res = await fetch(`http://localhost:5000/admin/UpdateVamount/${props.id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + localStorage.getItem("adminToken")
                }, body: JSON.stringify({
                    VirtualAmount: Vamount
                })
            });
            if (res.status === 400) {
                window.alert('No data Found')
            }
            handleClose();
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <div>

            <IconButton title="Update Virtual Amount" onClick={handleClickOpen}>
                <EditIcon />
            </IconButton>
            <Dialog
                fullScreen={fullScreen}
                open={open}
                aria-labelledby="responsive-dialog-title"
            >
                <DialogTitle id="responsive-dialog-title">{"Virtual Amount "}</DialogTitle>
                <DialogContent>
                    <form method='post'>
                        <TextField value={Vamount} onChange={(e) => setVamount(e.target.value)} id="standard-basic" label="Enter Virtual Amount" />
                    </form>
                </DialogContent>
                <DialogActions>
                    <Button autoFocus onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={() => UpdateVamount()} color="primary" autoFocus>
                        Update
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
