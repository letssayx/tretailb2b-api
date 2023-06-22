import React , { Fragment ,useEffect,useState} from 'react';
import {required, minLength, maxLength, minValue, maxValue, number, regex, email, choices} from 'react-admin';
import { FormTab,TabbedForm,ReferenceField,UrlField,AutocompleteInput,Filter,SearchInput,Create, ArrayField,ChipField,Edit,NumberInput,ImageField,DeleteButton,List,useDataProvider, Loading, Error,FormDataConsumer,ReferenceInput, SelectInput,BooleanInput,SimpleForm, ArrayInput, TextInput,SimpleFormIterator, DateInput,DateTimeInput,ReferenceManyField, Datagrid, TextField, DateField, SaveButton,EditButton,Toolbar} from 'react-admin';
import { useEditController, useRedirect, useNotify } from 'react-admin';
import { useForm } from 'react-final-form';
import axios from "axios";
import { parse } from 'query-string';
import CancelButton from '../../settings/CancelButton';
import { makeStyles } from '@material-ui/core/styles';
import { withStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { Avatar } from '@material-ui/core';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import keyby from 'lodash/keyBy';
import CustomPagination from '../../picklist/components/CustomPagination';
import SearchIcon from '@material-ui/icons/Search';
import InputAdornment from '@material-ui/core/InputAdornment';
import MaterialTextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

const cssStyle = {
  display:'flex',
  padding:'10px 9px 40px',
  dateInput:{
    display:'block',
    width:'120px',
    padding:'6px 20px',
    marginRight:'10px',
    border:'1px solid #999',
    backgroundColor:'#ddd',
    borderRadius:'3px'
  }
}
const useSelectStyles = makeStyles((theme)=>
({
  formControl:{
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-tabpanel-${index}`}
      aria-labelledby={`scrollable-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};

function a11yProps(index) {
  return {
    id: `scrollable-tab-${index}`,
    'aria-controls': `scrollable-tabpanel-${index}`,
  };
} 

const Transactions=(props)=>{
  const [tabpanelitem,setTabpanel]=useState(0);
  const getDataProvider=useDataProvider();
  const handleChange=(event,newValue)=>{
    setTabpanel(newValue)
  }
  return( 
    <div>
      <Paper>
        <Tabs value={tabpanelitem} onChange={handleChange} aria-label="simple tabs example">
          <Tab label="Transaction" {...a11yProps(0)}/>
          <Tab label="Operation" {...a11yProps(1)}/>
        </Tabs>
      </Paper>
      <TabPanel value={tabpanelitem} index={0}>
        <TransactionShow/>
      </TabPanel>
      <TabPanel value={tabpanelitem} index={1}>
        <OrderOperation  {...props}/>
      </TabPanel>
    </div>
  );
} 

const OrderOperation = ( props ) => {
  const classes = useSelectStyles();
  const [actionName, setActionName] = useState("TRANSACTION_UPLOAD");
  const [uploadFile, setUploadFile] = useState(null);
  const [loading, setLoading] = useState( false );
  const notify = useNotify();
  const [showDateInput,setShowDateInput] = useState({ start_date: '', end_date: '' });
  const redirect = useRedirect();
  const handleSubmit = () => {
    const allowedTypes = ['csv'];
    if(uploadFile != null && uploadFile.size && uploadFile.size !== 0){
      const tmp_arr = uploadFile.name.split(".");
      const ext = tmp_arr[tmp_arr.length - 1];
      if(allowedTypes.indexOf(ext) !== -1){
        setLoading(false);
        const formData = new FormData();
        formData.append('type', actionName);
        formData.append('file', uploadFile);
        axios(process.env.REACT_APP_API_ENDPOINT+'/logs', { 
          method: 'POST',
          headers: {
            'Content-Type': 'multipart/form-data',
            'x-access-token': localStorage.getItem('access_token'),
            'x-default-client-id': localStorage.getItem('default_client_id')
          },
          data: formData,
          credentials: 'include'
        })
        .then(res => {
          setLoading(false);
          if(res.data.status == "success") {
            notify(`${res.data.message}`, 'success');
            redirect('/logtab/user_logs');
          } else {
            notify(`${res.data.message}`, 'warning');
          }
        })
        .catch(error => {
          setLoading(false);
          notify(`${error.message}`, 'warning');
        });
        } else {
        notify('File is not valid','warning');
      }
    } else {
      notify('Inputs is not valid','warning');
    }
  }

  if (loading) return <Loading />;

  return (
    <Card>
      <CardContent>
        <Grid container>
          <Grid xs={12}>
            <FormControl variant="filled" className={classes.formControl}>
              <InputLabel id="demo-simple-select-filled-label">Action</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={actionName}
                onChange={(e)=> setActionName( e.target.value )}
              >
                <MenuItem value={"TRANSACTION_UPLOAD"}> Transactions Upload </MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid xs={12}>
            <FormControl variant="filled" className={classes.formControl}>
              <input type="file" name="file" className="file" onChange={(e) => setUploadFile(e.target.files[0])}/>
            </FormControl>
          </Grid>
          <Grid> 
            <Paper elevation={0} style={{padding:'10px'}}>
              <Typography >
                Download the CSV template below.To download click on DOWNLOAD button. Fill the CSV file with valid data and upload it. order ref and type,date(YYYY-MM-DD),settlement id,line item id(if any),SQU,description,older order id(if any),quantity,transaction amount by columns should be present in the CSV file.
                <br/>
                <a href="https://storage.googleapis.com/public-templates/transaction_template.csv">Download</a>
                <br/>
                Upload Order with CSV file and upload it into the system.To upload CSV file please click on the CREATE button.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </CardContent>
      <CardActions>
        <Button variant="contained" color="primary" onClick={() => handleSubmit()}>Create</Button>
      </CardActions>
    </Card>
  );
}

export const TransactionShow= (props) => {
  const [showData,setShowData]=useState([]);
  const [sort, setSort] =  useState({ field: 'id', order: 'DESC' });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState(null);
  const [total, setTotal] = useState(0);
  const dataProvider = useDataProvider();

  React.useEffect(() => {
    setLoading(true)
    const params= {
      pagination:{
        page:currentPage,
        perPage: 10
      },
      sort: {
        field:'id',
        order: 'desc'
      },
      filter:{q:searchText}
    }
    dataProvider.getList(`transactions`, params)
    .then(({data,total}) => {
      setShowData(data);
      setTotal( Math.ceil(parseInt(total) / parseInt(10)) );
      setLoading(false);
    })
    .catch((e)=>{
      setLoading(false);
      throw (e.message || e);
    })
  },[currentPage])

  if (loading) return <Loading />;
  return(
    <Card>
      <Datagrid  
        data={keyby(showData,'id')}
        ids={showData.map(({ id }) => id)}
        currentSort={sort}
      >
        <TextField source="initiate_date" label="Date"/>
        <TextField source="sum_total" label="Total"/>
        <TextField source="is_debit" label="Debit"/>
        <TextField source="service_type" label="Service Type"/>
        <TextField source="notes" label="Notes"/>
      </Datagrid> 
      <CustomPagination count={total} currentPage={currentPage} onChange={( page ) => setCurrentPage( page ) } /> 
    </Card>
  );
}

export default Transactions;