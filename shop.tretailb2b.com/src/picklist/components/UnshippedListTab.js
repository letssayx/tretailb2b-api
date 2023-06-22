import React from 'react';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import {useState} from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import InputLabel from '@material-ui/core/InputLabel'
import Button from '@material-ui/core/Button';
import moment from 'moment';
import {Loading, useDataProvider, useNotify } from 'react-admin';
import CustomListTable from './CustomListTable';
import Box from '@material-ui/core/Box';
import Checkbox from "@material-ui/core/Checkbox";
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
// import FileDownloadIcon from '@material-ui/icons/FileDownload';
// import DownloadIcon from '@material-ui/icons/Download';
import VerticalAlignBottomIcon from '@material-ui/icons/VerticalAlignBottom';

const useStyles = makeStyles((theme) => ({
  root:{
    '& .MuiFilledInput-input': {
      padding: '14px 12px'
    }
  }
}))

const UnshippedListTab = (props) => {
  const dataProvider = useDataProvider();
  const { 
    loading, 
    inputs, 
    handleInputs
  } = props;
  const [unshippedListControl, setUnshippedListControl] = React.useState({resource: null,data: null,reload: 0,order_no:0,total_quantity:0,selectStatus:`selected Order 0 and selected items 0`});
  const notify = useNotify();
  const classes = useStyles();
  const [marketplaces, setMarketPlaces] = useState([]);
  const tableHeaders = React.useMemo(() => {
  return  {
    main:[
      {fieldName: 'Market Place ID', fieldAttr: 'marketplace_id'},
      {fieldName: 'Order Date', fieldAttr: 'order_date'},
      {fieldName: 'Quantity', fieldAttr: 'quantity'},
      {fieldName: 'Dispatch Date', fieldAttr: 'dispatch_by'},
      {fieldName: 'Status', fieldAttr: 'status'},
      {fieldName: 'Sales Channel', fieldAttr: 'sales_channel'}
    ],
    child:[
      {fieldName: 'Sku', fieldAttr: 'sku'},
      {fieldName: 'Quantity', fieldAttr: 'quantity'},
    ]
  };
})

const setInput = (inputObj) => {
  handleInputs(inputObj);
}

React.useEffect(() => {
  dataProvider.getOnly(`orders/marketplaces/list`)
  .then(({ data }) => {
    setMarketPlaces(data.data);
  })
  .catch((error)=>{
    notify(error.message,`warning`);
  })
},[]);

const searchUnshippedList = () => {
  const getParams = {
    dispatch_by_filter: inputs.dispatchByFilter,
    order_item: inputs.orderItem,
    order_type: inputs.orderType,
    order_marketplace: inputs.marketplaceName,  
    order_status:inputs.status
  }
  let paramString = Object.keys(getParams).map((key)=>`${key}=${getParams[key]}`);
  setUnshippedListControl({
    ...unshippedListControl,
    resource: `picklist/select-items?${paramString.join('&')}`,
    reload: unshippedListControl.reload + 1
  })
}

const handleSelectUnshipped = (data)=> {
  let total_quantity=0
  let order_no=0
  Object.keys(data).forEach((page) => {
    let parentRow=data[page].data;
    parentRow.forEach((singleRow)=> {
      if(singleRow.childRows && singleRow.childRows.length!==0) {
        if(singleRow.selected==true) {
          order_no=order_no+1;
        }
        let main_line=singleRow.childRows
        main_line.forEach((line) => {
          if(line.selected==true ) {
            let q=line.data.quantity
            total_quantity=q+total_quantity;
          }
        })
      }
    })
  })
  // console.log(total_quantity)
  setUnshippedListControl({...unshippedListControl,selectOrder:order_no,selectItems:total_quantity, selectStatus: `selected Order ${order_no} and selected items ${total_quantity}`,data:data});
}

const handleSavePickList = () => {
  let lineitems = [];
  let selectedUnshipped = unshippedListControl.data || [];
  if(selectedUnshipped.length === 0) return;
  Object.keys(selectedUnshipped).forEach((page) => {
    let rows = selectedUnshipped[page].data;
    rows.forEach(( singleRow ) => {
      if(singleRow.childRows && singleRow.childRows.length !==0 ) {
        singleRow.childRows.forEach((line) => {
          if(line.selected) {
            lineitems.push( line.data );
          }
        })
      }
    })
  })
  loading(true);
  dataProvider.updateOnly(`picklist`,{data:{lineitems}})
  .then(({data}) => {
    loading(false);
    notify(`${data.message}`); 
  })
  .catch((err) => {
    loading(false)
    notify(err.message || err);
  })
}

const downloadTxtFile = () => {
  const getParams = {
    dispatch_by_filter: inputs.dispatchByFilter,
    order_item: inputs.orderItem,
    order_type: inputs.orderType,
    order_marketplace: inputs.marketplaceName,  
    order_status:inputs.status,
    export_csv:true
  }
  const  paramString = Object.keys(getParams).map((key)=>`${key}=${getParams[key]}`);
  if(paramString) {
    const fileURL = `/picklist/select-items?${paramString.join('&')}`;
    fetch(process.env.REACT_APP_API_ENDPOINT + fileURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/csv',
        'x-access-token': localStorage.getItem('access_token'),
        'x-default-client-id': localStorage.getItem('default_client_id')
      },
      credentials: 'include'
    })
    .then((response) => response.blob())
    .then((blob) => {
      // Create blob link to download
      const url = window.URL.createObjectURL (
        new Blob([blob]),
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute (
        'download',
        `picklist_order.csv`,
      );
      // Append to html link element page
      document.body.appendChild(link);
      // Start download
      link.click();
      // Clean up and remove the link
      link.parentNode.removeChild(link);
    });
  }
}

return <form  noValidate className={classes.root}>
  <Grid container>
    <Button variant="text" color="primary" startIcon={<VerticalAlignBottomIcon />} onClick={downloadTxtFile} style={{position:'absolute',right:'30px'}}>Export</Button>
    <Grid item md={4}>
      <Box mb={2} mr={2}>
        <Typography variant="caption" display="block" gutterBottom>Date Range</Typography>
        <FormControl variant="filled">
          <Select  
            value={inputs.dispatchByFilter}
            inputProps={{id: 'select_item'}}
            style={{width:'215px'}}
            onChange={ (e)=> setInput({ dispatchByFilter: e.target.value }) }
            InputLabelProps={{shrink: false}}
          >
            <MenuItem value={'lastweek'} >Last Week</MenuItem>
            <MenuItem value={'yesterday'} >Yesterday</MenuItem>
            <MenuItem value={'today'} >Today</MenuItem>
            <MenuItem value={'tomorrow'}>Tomorrow</MenuItem>
            <MenuItem value={'dayaftertomorrow'}>Day After Tomorrow</MenuItem>
            <MenuItem value={'thisweek'}>This Week</MenuItem>
            <MenuItem value={'thismonth'}>This Month</MenuItem>
            {/*
            <MenuItem value={'previousday'} >Previous Day</MenuItem>
            */}
          </Select>
        </FormControl>
      </Box>
    </Grid>
  <Grid item  md={4}>
    <Box mb={2} mr={2}>
      <Typography variant="caption" display="block" gutterBottom>Single and multi-qty preference</Typography>
      <FormControl variant="filled" >
        <Select  
          value={inputs.orderItem}
          inputProps={{id: 'select_item'}}
          style={{width:'215px'}}
          onChange={ (e)=> setInput({ orderItem: e.target.value }) }
        >
          <MenuItem value={'both'} style={{padding: '10px 12px 10px'}}> Both</MenuItem>
          <MenuItem value={'single'}>Single Item</MenuItem>
          <MenuItem value={'multi'}>Multi Item</MenuItem>
        </Select>
      </FormControl>
    </Box>
  </Grid>
  <Grid item  md={4}></Grid>
  <Grid item  md={4}>
    <Box mb={2} mr={2}>
      <Typography variant="caption" display="block" gutterBottom >Market Place</Typography>
      <FormGroup>
        <FormControlLabel 
          type="checkbox"
          value={'all'}
          name={'all'}
          control={<Checkbox  inputProps={{id: 'select_marketplace'}} checked={inputs.marketplaceName==="all"} onChange={(e)=>setInput({marketplaceName:'all'})}/>}
          label={'All'}
        />
        { 
          marketplaces.map((name) => (
            <FormControlLabel 
              type="checkbox"
              value={name}
              name={name}
              control={<Checkbox inputProps={{id: 'select_marketplace'}} checked={inputs.marketplaceName===name} onChange={(e)=>setInput({marketplaceName: name})}/>}
              label={process.env["REACT_APP_"+name.toUpperCase()]}
            />
          ))
        }
      </FormGroup>
</Box>
</Grid>

<Grid item  md={4}>
<Box mb={2} mr={2}>
<Typography variant="caption" display="block" gutterBottom>Order Type</Typography>
<FormControl variant="filled" >
<Select  
value={ inputs.orderType }
inputProps={{id: 'select_order_type'}}
style={{width:'220px'}}
onChange={ (e)=> setInput({ orderType: e.target.value}) }
>
<MenuItem value={'both'}>Both</MenuItem>
<MenuItem value={'b2b'}>B2B</MenuItem>
<MenuItem value={'b2c'}>B2C</MenuItem>
</Select>
</FormControl>
</Box>
</Grid>


<Grid item  md={4}>
<Box mb={2} mr={2}>
<Typography variant="caption" display="block" gutterBottom>Order Status</Typography>
<FormControl variant="filled" >
<Select  
value={ inputs.status }
inputProps={{id: 'select_order_status'}}
style={{width:'220px'}}
onChange={ (e)=> setInput({ status: e.target.value}) }
>
<MenuItem value={'unshipped'}>Unshipped</MenuItem>
<MenuItem value={'unassigned'}>Unassigned</MenuItem>
<MenuItem value={'ordered'}>Ordered</MenuItem>
</Select>
</FormControl>
</Box>
</Grid>
<Grid item xs={12}>
<Box mt={2} mr={2} >
<Button variant="contained" color="primary" onClick={()=>searchUnshippedList()}>
Search
</Button>
{unshippedListControl.resource  &&
<Button style={{marginLeft:'14px'}} variant="contained" color="primary" onClick={()=>handleSavePickList()}>
Create Picklist
</Button>
}
</Box>
</Grid>
{unshippedListControl.resource && <CustomListTable resource={unshippedListControl.resource} onSelect={handleSelectUnshipped}  reload={unshippedListControl.reload}  headers={tableHeaders} loading={loading} selectStatus={unshippedListControl.selectStatus}/>}
{/* {unshippedListControl.resource  &&
<Grid item xs={12}>
<Box mt={2} mr={2} >
<Button variant="contained" color="primary" onClick={()=>handleSavePickList()}>
Create Picklist
</Button>
</Box>
</Grid>
} */}
</Grid>
</form>
}

export default UnshippedListTab;