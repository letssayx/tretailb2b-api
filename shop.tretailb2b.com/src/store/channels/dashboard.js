import React, { useState, useEffect } from "react";
import ReactDOM  from "react-dom";
import { makeStyles } from '@material-ui/core/styles';
import {Title} from 'react-admin'
import { useHistory } from 'react-router-dom'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {useNotify, useDataProvider} from 'react-admin';
import DoneIcon from '@material-ui/icons/Done';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});



const DashBoard = ( props )=>{

    const classes = useStyles();
    const history = useHistory();
    const notify = useNotify();
    const dataProvider = useDataProvider();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [rows, setRows ] = useState([]);

    useEffect(()=>{
        dataProvider.getOnly('settings/channels').then(({data}) => {
             setRows(data);
        }).catch(()=>{
             setError(error);
             setLoading(false);
        })
    },[]);

    const handleNavigate = ( path) => {
        history.push(`settings?channel=${path}`);
    }

    return (
      <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Channel</TableCell>
            <TableCell>Connected</TableCell>
            <TableCell>Sync Enable</TableCell>
            <TableCell>Last Sync</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Edit</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="left">{row.connected? <DoneIcon color="primary"/>: <CloseIcon color="error"/> }</TableCell>
              <TableCell align="left">{row.sync_enable? <DoneIcon color="primary"/>: <CloseIcon color="error"/>}</TableCell>
              <TableCell align="left">{row.last_sync_at}</TableCell>
              <TableCell align="left">{row.location}</TableCell>
              <TableCell align="left"> <IconButton color="primary" component="span" onClick={() => handleNavigate(row.name)}> <EditIcon/> </IconButton> </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer> 
    );
}

export default DashBoard;

