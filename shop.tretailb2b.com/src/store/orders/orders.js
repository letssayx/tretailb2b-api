import React , { Fragment,useRef,useEffect,useState} from 'react';
import { Link, useHistory } from 'react-router-dom';
import
{
  FormTab,TabbedForm,ReferenceField,UrlField,AutocompleteInput,Filter,
  SearchInput,Create,ArrayField,FunctionField,ChipField,Edit,NumberInput,
  ImageField,DeleteButton,List,useDataProvider,Loading,Error,FormDataConsumer,
  ReferenceInput,SelectInput,BooleanInput,SimpleForm,ArrayInput,TextInput,
  SimpleFormIterator,DateInput,DateTimeInput,ReferenceManyField,Datagrid,TextField,
  DateField,SaveButton,EditButton,Toolbar,useCreateController,useEditController,
  useRedirect,useNotify,Title,RichTextField,FileField,required,minLength,maxLength,
  minValue,maxValue,number,regex,email,choices
} from 'react-admin';

import { useForm } from 'react-final-form';
import axios from "axios";
import PropTypes from 'prop-types';
import keyby from 'lodash/keyBy';
import { now } from 'moment/moment';
import moment from 'moment/moment';

import Accordion from '@material-ui/core/ExpansionPanel';
import AccordionSummary from '@material-ui/core/ExpansionPanelSummary';
import AccordionDetails from '@material-ui/core/ExpansionPanelDetails';
import AddIcon from '@material-ui/icons/Add';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import { Avatar } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button'
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Checkbox from "@material-ui/core/Checkbox";
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import MaterialTextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import SearchIcon from '@material-ui/icons/Search';
import Select from '@material-ui/core/Select';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Table from '@material-ui/core/Table';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableCell from '@material-ui/core/TableCell';
import Typography from '@material-ui/core/Typography';
import CustomPagination from '../../picklist/components/CustomPagination';
import { checkHtmlElement } from '@testing-library/jest-dom/dist/utils';

const validateState   = [required()];
const validateName    = [required(), minLength(3), maxLength(255)];
const validateCity    = [required(), minLength(3), maxLength(255)];
const validateAddress = [required(), minLength(3), maxLength(255)];
const validatePincode = [required(), minValue(10000), maxValue(999999)];
const validatePhone   = [required(), minLength(9), maxLength(12)];

const STATES = [
  {id: 'andhra pradesh', name: 'Andhra Pradesh'}, 
  {id: 'arunachal pradesh', name: 'Arunachal Pradesh'},
  {id: 'assam', name: 'Assam'},
  {id: 'bihar', name: 'Bihar'},
  {id: 'chattisgarh', name: 'Chattisgarh'},
  {id: 'Goa', name: 'Goa'},
  {id: 'gujarat', name: 'Gujarat'},
  {id: 'haryana', name: 'Haryana'},
  {id: 'himachal pradesh', name: 'Himachal Pradesh'},
  {id: 'jharkhand', name: 'Jharkhand'},
  {id: 'karnataka', name: 'Karnataka'},
  {id: 'kerala', name: 'Kerala'},
  {id: 'madhya pradesh', name: 'Madhya Pradesh'},
  {id: 'maharashtra', name: 'Maharashtra'},
  {id: 'manipur', name: 'Manipur'},
  {id: 'meghalaya', name: 'Meghalaya'},
  {id: 'mizoram', name: 'Mizoram'},
  {id: 'nagaland', name: 'Nagaland'},
  {id: 'odisha', name: 'Odisha'},
  {id: 'punjab', name: 'Punjab'},
  {id: 'rajasthan', name: 'Rajasthan'},
  {id: 'sikkim', name: 'Sikkim'},
  {id: 'tamil nadu', name: 'Tamil Nadu'},
  {id: 'telengana', name: 'Telengana'},
  {id: 'tripura', name: 'Tripura'},
  {id: 'uttarakhand', name: 'Uttarakhand'},
  {id: 'uttar pradesh', name: 'Uttar Pradesh'},
  {id: 'west bengal', name: 'West Bengal'},
  {id: 'andaman and nicobar islands', name: 'Andaman and Nicobar Islands'},
  {id: 'chandigarh', name: 'Chandigarh'},
  {id: 'dadra and nagar haveli and daman & diu', name: 'Dadra and Nagar Haveli and Daman & Diu'},
  {id: 'new delhi', name: 'New Delhi'},
  {id: 'jammu & kashmir', name: 'Jammu & Kashmir'},
  {id: 'lakshadweep', name: 'Lakshadweep'},
  {id: 'pondicherry', name: 'Pondicherry'},
];

const cssStyle = {
  display:'flex',
  padding:'10px 9px 40px',
  dateInput: {
    display:'block',
    width:'120px',
    padding:'6px 20px',
    marginRight:'10px',
    border:'1px solid #999',
    backgroundColor:'#ddd',
    borderRadius:'3px'
  }
}

const useStyles = makeStyles({
  textbox: {
    width: 100,
    margin: 2,
  },
  customer_textbox: {
    width:150,
  },
  root: {
    '& .MuiFilledInput-input': {
      padding: '14px 12px'
    }
  }
});

const useTableStyles = makeStyles({
  table: {
    minWidth: 350,
  },
});

const usePanelStyles = makeStyles({
  paper: {
    margin:0,
    padding:0
  }
});

const useSelectStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

const ColoredLine = ({ color }) => (
  <hr
      style={{
          color: color,
          backgroundColor: color,
          height: 2
      }}
  />
)

const CustomToolbar = (props) => {
  const notify = useNotify();
  return(
  <Toolbar style={{marginTop:'50px'}} {...props} classes={useStyles()}>
    <SaveButton
      style={{marginRight:'10px'}}
      disabled={props.saveDisable}
    />
    <Button onClick={() =>{ window.history.back(-1);return false;}} variant="contained" color="secondary">Cancel</Button>
  </Toolbar>
  )
};

const styles = {
  image: { maxHeight: '3rem' }
}

function createData(thumbnail_image, sku,quantity) {
  return { thumbnail_image ,sku ,quantity };
}

const ComboPanel=({ id, record, resource })=>{
  const classes = useTableStyles();
  let rows=[];
  if(record.combo_items.length==0 ) return null;
  rows=record.combo_items.map((val)=>createData(val.thumbnail_image,val.item_sku_product, val.quantity));
  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Product Image</TableCell>
            <TableCell align="right">SKU</TableCell>
            <TableCell align="right">Quantity</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.item_id}>
              <TableCell><Avatar alt="picture" src={row.thumbnail_image} /></TableCell>
              <TableCell align="right">{row.sku}</TableCell>
              <TableCell align="right">{row.quantity}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

const ItemField = ({classes,record={},...rest}) => {
  return (
    <ArrayField source="lineitems" label="Items" record={record} {...rest}>
    <Datagrid expand={<ComboPanel/>} isRowExpandable={false}>
    {/* <ImageField classes={classes} source="thumbnail_image" label="Product Image" record={record} {...rest}/> */}
    <ChipField source="item_sku_product" label="SKU" record={record} {...rest}/>
    <ChipField source="quantity" label="Quantity" record={record} {...rest}/>
    </Datagrid>
    </ArrayField>
  );
}

const ShippingField = ( props ) => {
  const { record } = props;
  return(
    <span 
      style={{
        display:( 
          record.billing_to_city  &&
          record.billing_to_state &&
          record.billing_to_pincode &&
          record.buyer_city  &&
          record.buyer_state &&
          record.buyer_pincode 
          ?'block'
          :'none'
        )
      }}
    >
      { record.billing_to_city + ',' + record.billing_to_state }<br/>
      { record.billing_to_pincode} <br/><br/>
      { record.buyer_city + ',' + record.buyer_state } <br/>
      { record.buyer_pincode }
    </span>
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

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  const classes = usePanelStyles();
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-auto-tabpanel-${index}`}
      aria-labelledby={`scrollable-auto-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          <Paper className={classes.paper}>{children}</Paper> 
        </Box>
      )}
    </div>
  );
}

const OrderFilter = props => (
  <Filter {...props}>
    <SearchInput source="q" alwaysOn/>
  </Filter>
);

const OrderOperation = ( props ) => {
  const form = useRef(null);
  const classes = useSelectStyles();
  const [actionName, setActionName] = useState("none");
  const [uploadFile, setUploadFile] = useState(null);
  const [filevisible, setFilevisible] = useState(false);
  const [dialogvisible, setDialogvisible] = useState({title:null,link:null,expanded:false,downloadmessage:'',createmessage:''});
  const [loading, setLoading] = useState( false );
  const notify = useNotify();
  const [showDateInput,setShowDateInput] = useState({ start_date: '', end_date: '' });
  const redirect = useRedirect();
  const accordionData = [
    {
      title:'ORDER_UPLOAD',
      downloadmessage:'Download the CSV template below. To download click on DOWNLOAD button. Fill the CSV file with valid data and upload it. order ref and invoice number,order date,customer phone,customer phone,customer email,customer pincode,customer state,ship to name,ship to address,ship to state,ship to phone no,item sku,sale price,qty,lineitem total discount amount,sales channel,total shipping cost,order type,dispatch by columns should be present in the CSV file.',
      createmessage:'Upload Order with CSV file and upload it into the system.To upload CSV file please click on the CREATE button.',
      link: <a href="https://storage.googleapis.com/public-templates/new_order_template.csv">Download</a>
    },
    {
      title:'RETURN_UPLOAD',
      downloadmessage:'Download the CSV template below. To download click on DOWNLOAD button. Fill the CSV file with valid data and upload it. order ref,SQU,line item id (if any),condition (0-bad 1- good),quantity ,description, received date by columns should be present in the CSV file.',
      createmessage:'Upload  Return Order with CSV file and upload it into the system.To upload CSV file please click on the CREATE button.',
      link: <a href="https://storage.googleapis.com/public-templates/return_receieve.csv">Download</a>
    },
  ];
  const [{title,link}]=accordionData;

  const handleChange = (e, newValue) => {
    if(e.target.value == 'ORDER_UPLOAD') {
      setDialogvisible({title:null,link:null,downloadmessage:'',createmessage:''});
      setFilevisible(true);
    } else {
      setFilevisible(false);
    } 
    accordionData.forEach((element) => {
      if(e.target.value == element.title) {
        setDialogvisible({...dialogvisible,title:element.title,link:element.link,downloadmessage:element.downloadmessage,createmessage:element.createmessage});
      }
    })

    if(e.target.value=='RETURN_UPLOAD') {
      setFilevisible(true);
    }

    if(e.target.value=="none" ) {
      setFilevisible(false);
      setDialogvisible({title:null,link:null,downloadmessage:'',createmessage:''});
    }
    setActionName(e.target.value)
  }

  const submitLog = (event) => {
    const data = new FormData(form.current);
    let validated=true;

    if(data.getAll('type')[0]!="" && data.getAll('type')[0]!="undefined") {
      if(filevisible) {
        if(data.getAll('file')[0]=="undefined" || parseInt(data.getAll('file')[0]["size"])<=0) {
          notify(`Select File to process`, 'warning');
          validated=false;
        }
      }
    } else {
      notify(`Fill the correct data`, 'warning');
      validated=false;
    }

    if(validated) {
      setLoading(true);
      axios(process.env.REACT_APP_API_ENDPOINT+'/logs', { 
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-access-token': localStorage.getItem('access_token'),
          'x-default-client-id': localStorage.getItem('default_client_id')
        },
        data: data,
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
    }
  }

  if (loading) return <Loading />;

  return (
    <Card>
      <Title title="Request Operation"/>
      <form ref={form}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              <div>
                <FormControl variant="filled" className={classes.formControl}>
                  <Typography id="demo-simple-select-filled-label">Action</Typography>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    name="type"
                    value={actionName}
                    onChange={handleChange}
                  >  
                    <MenuItem value="none">Select</MenuItem>
                    <MenuItem value="ORDER_UPLOAD">Order Upload</MenuItem>
                    <MenuItem value="RETURN_UPLOAD">Sales Return Upload</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <br></br>
              {
                filevisible &&
                <div>
                  <Typography>Upload file</Typography>
                  <br></br>  
                  <input type="file" name="file" className="file"/>
                </div>
              }
              <div className='Accordion' expanded={true}>
                <AccordionSummary>
                  {dialogvisible.downloadmessage}
                </AccordionSummary>
                <AccordionDetails>
                  {dialogvisible.link}
                </AccordionDetails>
                <AccordionSummary>
                  {dialogvisible.createmessage}
                </AccordionSummary>
              </div>
            </Typography>
          </CardContent>
          <CardActions>
            <Button variant="contained" color="primary" onClick={submitLog}>Create</Button> 
          </CardActions>
        </Card>
      </form>
    </Card>
  );
}

const ChildLineItems=({formData,...rest}) => {
  const classes = useStyles();
  return (
    <div>
      <TextInput source={`${rest.id}.sku`} className={classes.textbox} label="SKU" defaultValue={''} inputProps={{ readOnly: true }}/>
      <TextInput source={`${rest.id}.unit_price`} className={classes.textbox} label="Sale Price" defaultValue={0} inputProps={{ readOnly: true }}/>
      <NumberInput source={`${rest.id}.quantity`} className={classes.textbox} label="Quantity" defaultValue={0} inputProps={{ readOnly: true }} />
      <NumberInput source={`${rest.id}.tax_rate`} className={classes.textbox} label="Tax rate"  defaultValue={''} inputProps={{ readOnly: true }} />
      <TextInput source={`${rest.id}.hsn_code`} className={classes.textbox} label="HSN" defaultValue={''} inputProps={{ readOnly: true }} />
    </div>
  );
}
// Code for Shipping Address same as Billing Address
// const BuyerAddress = ({ formData, ...rest}) => {
//   <label>
//     <input
//       type="checkbox"
//       checked={!checked}
//       onClick={(event)=>handleAddressCheck(event)}
//     />
//       Same as Billing Address
//   </label>
// }
// const handleAddressCheck = (e) => {
//   handleAddress();
//   // Set Checked to false after all tasks complete
//   setChecked(!checked);
// }

// const handleAddress = () => {
//   checked==true?form.change(rest.id+'buyer_name',billing_to_name):form.change(rest.id+'buyer_name',"");
//   checked==true?setBuyerPhone(billing_to_phone):setBuyerPhone("");
//   checked==true?setBuyerAddress(billing_to_address):setBuyerAddress("");
//   checked==true?setBuyerCity(billing_to_city):setBuyerCity("");
//   checked==true?setBuyerState(billing_to_state):setBuyerState("");
//   checked==true?setBuyerPincode(billing_to_pincode):setBuyerPincode("");
// }

const LineItems = ({ formData, ...rest}) => {
  const form = useForm();
  const classes = useStyles();
  const dataProvider = useDataProvider();
  const [loading, setLoading] = useState( false );
  const [hsnValidate,setHsnValidate]=useState([]);
  const [taxValidate,setTaxValidate]=useState([]);
  const [itemData,setItemData]=useState({mrp:0.00,unitprice:0.00,discount:0.00,tax:0.00});
  const [showChild,setShowChild]=useState(true);
  const [order_item_id, setOrderItemId]=useState("91"+Math.random()*10000000000000000);
  form.change(rest.id+'.amount',(itemData.mrp * (1-(itemData.discount/100 ))+itemData.tax));

  return (
    <div>
    <ReferenceInput 
      source={`${rest.id}.item_id`} reference="items"
      filter={{ active: true}}
      sort={{ field: 'sku', order: 'ASC' }}
      onChange={ (value) => { 
        dataProvider.getOne('items',{ id : value})
        .then(({ data }) => {
          setLoading(true);
          form.change(rest.id+'.unit_price',data.price);
          form.change(rest.id+'.mrp',data.mrp);
          form.change(rest.id+'.tax_rate',data.product_tax_rate);
          form.change(rest.id+'.discount',data.discount?data.discount:0.00);
          setItemData({...itemData,tax:data.product_tax_rate,unitprice:data.price,mrp:data.mrp})
          form.change(rest.id+'.hsn_code',data.product_hsn_code);
          form.change(rest.id+'.thumbnail_image',data.thumbnail_image);
          form.change(rest.id+'order_item_id',order_item_id);

          if(data.combo_items!==undefined) {
            form.change(rest.id+'.combo_items',data.combo_items);
            setTaxValidate([])
            setHsnValidate([])
            setShowChild(true)
          } else {
            setTaxValidate([required()])
            setHsnValidate([required()])
            setShowChild(false)
          }
        })
        .catch(error => {
          setLoading(false);
          throw (error.message || error);
        })
      }}
      validate={required()}
      {...rest}
    >
      <AutocompleteInput
        optionText="product_name_with_sku"
        suggestionLimit={10}
        options={{
          suggestionsContainerProps: {
            disablePortal: true,
          }
        }}
      />
    </ReferenceInput>

    <TextInput source={`${rest.id}.unit_price`}   className={classes.textbox} label="Sale Price"  defaultValue={0} onChange={(e)=>{setItemData({...itemData,unitprice:e.target.value})}} validate={required()} style={{width: "20%", paddingRight: "3px"}}/>
    <NumberInput source={`${rest.id}.quantity`}  className={classes.textbox} label="Quantity" validate={required()} defaultValue={1} style={{width: "20%", paddingRight: "3px"}}/>
    <NumberInput source={`${rest.id}.tax_rate`}  className={classes.textbox} label="Tax rate (%)" validate={taxValidate} defaultValue={0} disabled style={{width: "20%", paddingRight: "3px"}}/>
    <TextInput source={`${rest.id}.hsn_code`} className={classes.textbox} label="HSN" validate={hsnValidate} defaultValue={''} disabled style={{width: "20%", paddingRight: "3px"}}/>
    <TextInput source={`${rest.id}.order_item_id`} className={classes.textbox} label="OrderItemID" style={{width: "20%", paddingRight: "3px"}}/>
    <TextInput source={`${rest.id}.mrp`}  className={classes.textbox} label="MRP" defaultValue={0} onChange={(e)=>{setItemData({...itemData,mrp:e.target.value})}} disabled style={{width: "20%", paddingRight: "3px"}}/>
    <TextInput source={`${rest.id}.discount`}  className={classes.textbox} label="Discount (%)" defaultValue={0} onChange={(e)=>{setItemData({...itemData,discount:e.target.value})}} style={{width: "20%", paddingRight: "3px"}}/>
    <TextInput source={`${rest.id}.amount`}  className={classes.textbox} label="Amount"  disabled style={{width: "20%", paddingRight: "3px"}}/>
    <ImageField source={`${rest.id}.thumbnail_image`} label="Picture" sortable={false}/>
    {
      showChild &&
      <ArrayInput source={`${rest.id}.combo_items`} label="Items">
        <SimpleFormIterator disableAdd disableRemove>
          <FormDataConsumer>
            {
              formDataProps => (
                <ChildLineItems {...formDataProps} />
              )
            }
          </FormDataConsumer>
        </SimpleFormIterator>
      </ArrayInput>
    }
      <ImageField source={`${rest.id}.thumbnail_image`} label="Picture" sortable={false}/>
    </div>
  );
};

const CustomerDetails = ({ formData, ...rest}) => {
  const form = useForm();
  const classes = useStyles();
  const dataProvider = useDataProvider();
  return (
    <div style={{display: "flex", flexDirection: "row"}}>
      <div style={{paddingRight: "85px"}}>
        <ReferenceInput 
          label="Customer Email"
          source="customer_id"
          reference="customers"
          validate={required()}
          {...rest}
        >
          <SelectInput optionText="email" />
        </ReferenceInput>
      </div>

      <div style={{paddingRight: "85px"}}>
        <ReferenceInput 
          label="Customer Name"
          source="customer_id"
          reference="customers"
          validate={required()}
          {...rest}
        >
          <SelectInput optionText="name" />
        </ReferenceInput>
      </div>

      <div>
        <ReferenceInput
          label="Customer Phone"
          source="customer_id"
          reference="customers"
          validate={required()}
          {...rest}
        >
          <SelectInput optionText="phone" />
        </ReferenceInput>
      </div>

    </div>
  );
};

export const OrderTabs = ( props ) =>  {
  const [panel,setPanel]=useState(0);
  let history = useHistory();
  const handleChange=(event,newValue) => {
    setPanel(newValue);
    history.push(
      `/${
        newValue == 1
        ?"orders"
        :"orders"
      }`
    )
  }
  return (
    <div>
      <Paper elevation={2}> 
        <Tabs value={panel} onChange={handleChange} aria-label="simple tabs example">
          <Tab label="Orders"   {...a11yProps(0)} />
          <Tab label="Returns"   {...a11yProps(1)} />
          <Tab label="Operation" {...a11yProps(2)} />
        </Tabs>
      </Paper>
      <TabPanel value={panel} index={0}> <OrderList {...props} /> </TabPanel>
      <TabPanel value={panel} index={1}> <ReturnList {...props}/> </TabPanel>
      <TabPanel value={panel} index={2}> <OrderOperation {...props}/> </TabPanel>
    </div>
  );
}

const defaultOrderItems = {
  orderType: 'all' ,
  marketplace: 'all' ,
  orderstatus:'all'
}

export const OrderList = ({  permissions, ...props }) => {
  const classes = useStyles();
  const [orders,setOrders] = useState([]);
  const notify = useNotify();
  const [sort, setSort] =  useState({ field: 'id', order: 'DESC' });
  const [currentPage, setCurrentPage] = useState(1);
  const dataProvider = useDataProvider();
  const [total, setTotal] = useState(0);
  const redirect = useRedirect();
  const [loading, setLoading] = useState();
  const [searchText, setSearchText] = useState(null);
  const [searchTextPage, setSearchTextPage] = useState(1);
  const [marketplaces, setMarketPlaces] = useState([]);
  const [orderItems ,setOrderItems] = useState(defaultOrderItems)


  React.useEffect(() => {
    setLoading(true)

    const params = {
      pagination: {
        page:currentPage,
        perPage: 10
      },
      sort: {
        field:'id',
        order: 'desc'
      },
      filter: {
        q:searchText,
        order_type: orderItems.orderType,
        order_marketplace: orderItems.marketplace,
        order_status:orderItems.orderstatus
      },
    }
    dataProvider.getList(`orders`, params)
    .then(({data,total}) => {
      setOrders(data);
      setTotal( Math.ceil(parseInt(total) / parseInt(10)) );
      setLoading(false);
    })
    .catch((error)=>{
      setLoading(false);
      throw (error.message || error);
    })
  },[currentPage])

  React.useEffect(() => {
    setLoading(true)

    const params = {
      pagination: {
        page:currentPage,
        perPage: 10
      },
      sort: {
        field:'id',
        order: 'desc'
      },
      filter: {
        q:searchText,
        order_type: orderItems.orderType,
        order_marketplace: orderItems.marketplace,
        order_status:orderItems.orderstatus
      },
    }
    dataProvider.getList(`orders`, params)
    .then(({data,total}) => {
      setOrders(data);
      setTotal( Math.ceil(parseInt(total) / parseInt(10)) );
      setCurrentPage(1)
      setLoading(false);
    })
    .catch((error)=>{
      setLoading(false);
      throw (error.message || error);
    })
  },[searchText])

  React.useEffect(() => {
    setLoading(true)

    const params = {
      pagination: {
        page:currentPage,
        perPage: 10
      },
      sort: {
        field:'id',
        order: 'desc'
      },
      filter: {
        q:searchText,
        order_type: orderItems.orderType,
        order_marketplace: orderItems.marketplace,
        order_status:orderItems.orderstatus
      },
    }
    dataProvider.getList(`orders`, params)
    .then(({data,total}) => {
      setOrders(data);
      setTotal( Math.ceil(parseInt(total) / parseInt(10)) );
      setCurrentPage(1)
      setLoading(false);
    })
    .catch((error)=>{
      setLoading(false);
      throw (error.message || error);
    })
  },[orderItems])

  const handleInputs= (input) => {
    setOrderItems({...orderItems,...input})
  }

  React.useEffect(() => {
    setLoading(true)
    dataProvider.getOnly(`orders/marketplaces/list`)
    .then(({ data }) => {
      setMarketPlaces(data.data);
      setLoading(false);
    })
    .catch((error)=>{
      setLoading(true);
      notify(`Please wait until I reload`,`warning`);
      const timer = setTimeout(() => {
        window.location.reload(false);
        setLoading(false);
      }, 7000);      
    })
  },[]);

  return (
    <>
      <Card style={{marginBottom:"20px"}}>
        <form  noValidate className={classes.root}>
          <Grid container style={{marginLeft : "50px",paddingTop : "20px"}}>
            <Grid item  md={2}>
              <Box mb={2}>
                <Typography variant="caption" display="block" gutterBottom >Market Place</Typography>
                <FormGroup>
                  <FormControlLabel 
                    type="checkbox"
                    value={'all'}
                    name={'all'}
                    control={<Checkbox  checked={orderItems.marketplace==="all"} onChange={(e)=>handleInputs({marketplace:'all'})}/>}
                    label={"All"}
                  />
                  { 
                    marketplaces.map((name) => (
                      <FormControlLabel 
                        type="checkbox"
                        value={name}
                        name={name}
                        control={<Checkbox checked={orderItems.marketplace===name} onChange={(e)=>handleInputs({marketplace: name})}/>}
                        label={process.env["REACT_APP_"+name.toUpperCase()]}
                      />
                    ))
                  }
                </FormGroup>
              </Box>
            </Grid>
            <Grid item  md={2}>
            <div style={{display: "flex", flexDirection: "row"}}>
              <Box mb={2} mr={10}>
                <Typography variant="caption" display="block" gutterBottom>Order Type</Typography>
                <FormControl variant="filled" >
                  <Select  
                    value={orderItems.orderType}
                    inputProps={{id: 'select_order_type'}}
                    style={{width:'220px'}}
                    onChange={(e)=>handleInputs({orderType:e.target.value})}
                  >
                    <MenuItem value={'all'}>All</MenuItem>
                    <MenuItem value={'b2b'}>B2B</MenuItem>
                    <MenuItem value={'b2c'}>B2C</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              <Box mb={2}>
                <Typography variant="caption" display="block" gutterBottom>Order Status</Typography>
                <FormControl variant="filled" >
                  <Select 
                    value={orderItems.orderstatus} 
                    inputProps={{id: 'select_order_status'}}
                    style={{width:'220px'}}
                    onChange={(e)=>handleInputs({orderstatus:e.target.value})}
                  >
                    <MenuItem value={'all'}>All</MenuItem>
                    <MenuItem value={'unshipped'}>Unshipped</MenuItem>
                    <MenuItem value={'cancelled'}>Cancelled</MenuItem>
                    <MenuItem value={'shipped'}>Shipped</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              </div>
            </Grid>
          </Grid>
        </form>
      </Card>

      <Card>
        <Box p={2}>
          <MaterialTextField
            variant="filled"
            InputProps={{
              startAdornment: (
                <InputAdornment position="center">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onChange = { (e) => setSearchText(e.target.value) }
          />
          <Button variant="text" color="primary" startIcon={<AddIcon />} style={{marginLeft:'490px'}}  onClick={() =>redirect(`orders/create`)}>Create</Button>
        </Box>
        {
          loading
          ?<Loading/>
          :<Datagrid 
            rowClick={(id) => redirect(`/orders/${id}`)}
            data={keyby(orders,'id')}
            ids={orders.map(({ id }) => id)}
            currentSort={sort}
          >
            <TextField source="order_ref" label="Order Ref"/>
            <DateField source="order_date" label="Order Date"/>
            <ChipField source="sum_total" label="Order Amount"/>
            <ItemField/>
            <TextField source="priority" label="Is Priority"/>
            <DateField source="dispatch_by" label="Dispatch By"/>
            <TextField source="status" label="Status"/>
            <TextField source="marketplace_identifier" label="MarketPlace Identifier"/>
            <TextField source="marketplace_name"  label="Marketplace name" />
            <TextField source="order_type"  label="Order Type"/>
            <FunctionField label="Shipping" render={(record) => <ShippingField record={record}/> }/>
            <DateField source="updated_at" label="Last Updated"/>
          </Datagrid>
        }
        <CustomPagination count={total} currentPage={currentPage} onChange={( page ) => setCurrentPage( page ) } />
      </Card>
    </>
  );
}

// Create a new Webstore Order
export const OrderCreate = (props,...rest) => {
  const controllerProps = useCreateController(props);
  const {record} = controllerProps;
  // Place holder for const form = useForm();
  const [loading, setLoading] = useState( false );
  const [customersData,setCustomersData]  =  useState();
  const notify = useNotify();
  const redirect = useRedirect();

  const [checked, setChecked] = useState(true);

  const [billing_to_name, setBillingToName] = useState("");
  const [billing_to_phone, setBillingToPhone] = useState("");
  const [billing_to_address, setBillingToAddress] = useState("");
  const [billing_to_city, setBillingToCity] = useState("");
  const [billing_to_state, setBillingToState] = useState("");
  const [billing_to_pincode, setBillingToPincode] = useState("");

  const [buyer_name, setBuyerName] = useState("");
  const [buyer_phone, setBuyerPhone] = useState("");
  const [buyer_address, setBuyerAddress] = useState("");
  const [buyer_city, setBuyerCity] = useState("");
  const [buyer_state, setBuyerState] = useState("");
  const [buyer_pincode, setBuyerPincode] = useState("");

  localStorage.setItem("AddCustomerRedirect", "False")
  const addCustomer=(event) => {
    redirect('create', '/customers');
    localStorage.setItem("AddCustomerRedirect", "True")
  }

  return (
    <>
      <Create {...props}>
        <SimpleForm toolbar={<CustomToolbar saveDisable={false} />}>
          <Button
            style={{position:'absolute',right:'30px',width:'50px'}}
            variant="raised"
            component={Link} 
            to={`/orders`}
            color="transparent"
          >
            <ArrowBackIcon/>
          </Button>
          <DateTimeInput source="order_date" defaultValue={moment(now()).utcOffset('+0530').format('YYYY-MM-DD HH:mm')} validate={required()} label="Order Date" parse={(v)=>v.replace(/(\.[0-9]{1,9}Z)/ig,"").replace("T"," ")}/>
          {/* <TextInput source="customer_email"  label="Customer Email" />
          <TextInput source="customer_phn"  label="Customer Phone" />
          <TextInput source="customer_name" disabled label="Customer Name" /> */}
          <CustomerDetails />
          {/* <ReferenceInput label="Customer" source="customer_id" reference="customers" validate={required()}>
          <SelectInput  optionText="name"/>
          </ReferenceInput> */}
          <Button variant="text" color="primary" startIcon={<AddIcon />} style={{marginLeft:'725px'}}  onClick={addCustomer}>Create Customer</Button>

          <div style={{display: "flex", flexDirection: "row"}}>
            <SelectInput
              source="sales_channel"
              label="Sales Channel"
              choices={[
                { id: 'amazon', name: 'Amazon' },
                { id: 'flipkart', name: 'Flipkart' },
                { id: 'store', name: 'Webstore' }
              ]}
              defaultValue={'store'}
              style={{paddingRight: "228px"}}
            />

            <SelectInput
              source="priority"
              label="Is Priority"
              choices={[
                { id: '0', name: 'False'},
                { id: '1', name: 'True' }
              ]}
              defaultValue={0}
              style={{paddingRight: "228px"}}
            />

            <SelectInput source="order_type" label="Order Type"
              choices={[
                { id: 'prepaid', name: 'Pre-paid' },
                { id: 'postpaid', name: 'Post-paid' }
              ]}
            />
          </div>

          <ColoredLine color="grey" />

          <ArrayInput source="lineitems" label="Items" validate={required()} >
            <SimpleFormIterator>
              <FormDataConsumer>
                {
                  formDataProps => (
                    <LineItems {...formDataProps} />
                  )
                }
              </FormDataConsumer>
              <ImageField source="thumbnail_image" label="Picture" record={record}/>
            </SimpleFormIterator>
          </ArrayInput>

          <ArrayInput source="payments" label="Payments">
            <SimpleFormIterator>
              <div className='container' style={{display: "flex", flexDirection: "row", width: "83%"}}>
                <DateInput source="date" label="Date" style={{width: "30%", paddingRight: "30px"}}/>
                <TextInput source="ref" label="Transaction Reference" style={{width: "35%", paddingRight: "30px"}}/>
                <TextInput source="amount" label="Transaction Amount" style={{width: "35%"}}/>
              </div>
            </SimpleFormIterator>
          </ArrayInput> 

          <ArrayInput source="shipping" label="Shipping Tracking">
            <SimpleFormIterator>
              <div className='container' style={{display: "flex", flexDirection: "row", width: "83%"}}>
                <DateInput source="date" label="Date" style={{width: "30%", paddingRight: "30px"}}/>
                <TextInput source="ref" label="Tracking Reference" style={{width: "35%", paddingRight: "30px"}}/>
                <TextInput source="notes" label="Notes" style={{width: "35%"}}/>
              </div>
            </SimpleFormIterator>
          </ArrayInput>

          <div className='container' style={{display: "flex", flexDirection: "row", width: "55%"}}>
            <SelectInput source="status" label="Status" defaultValue="unshipped"
              choices={[
                { id:'ordered', name: 'Ordered' },
                { id:'unassigned' , name: 'Unassigned'},
                { id:'unshipped', name: 'Unshipped' },
                { id:'processed' , name: 'Processed'},
                { id:'shipped', name: 'Shipped' },
                { id:'completed', name: 'Completed' },
                { id:'returned', name: 'Returned' },
                { id:'cancelled', name: 'Cancelled' },
              ]}
              style={{width: "45%", paddingRight: "30px"}}
            />
            <TextInput source="delivery_amount"  label="Shipping Cost" style={{width: "40%"}}/>
          </div>

          <ColoredLine color="grey" />

          <div className='container' style={{display: "flex", flexDirection: "row", width: "100%"}}>
            <div style={{width: "50%", paddingRight: "250px"}}>
              {/* Billing Address */}
              <Typography variant='h5'>Billing Address</Typography> 
              <TextInput source="billing_to_name" label="Name" validate={validateName} onChange={( event ) => setBillingToName( event.target.value )} />
              <TextInput source="billing_to_phone" label="Phone" validate={validatePhone} onChange={( event ) => setBillingToPhone( event.target.value )}/>
              <TextInput source="billing_to_address" label="Address" validate={validateAddress} onChange={( event ) => setBillingToAddress( event.target.value )}/>
              <TextInput source="billing_to_city" label="City" validate={validateCity} onChange={( event ) => setBillingToCity( event.target.value )}/>
              <SelectInput source="billing_to_state" label="State" validate={validateState} choices={ STATES } onChange={(event) => setBillingToState(event.target.value)}/>
              <TextInput source="billing_to_pincode" label="Pincode" validate={validatePincode} onChange={( event ) => setBillingToPincode( event.target.value )}/> 
            </div>

            <div style={{width: "50%"}} >
              {/* Shipping Address */}
              <Typography variant='h5'>Shipping Address</Typography>

              {/* <FormDataConsumer>
                {
                  formDataProps => (
                    <BuyerAddress {...formDataProps} />
                  )
                }
              </FormDataConsumer> */}

              <TextInput source="buyer_name" label="Name" validate={validateName} value={buyer_name} onChange={(e)=>setBuyerName(e.target.value)} disabled={!checked}/>
              <TextInput source="buyer_phone" label="Phone"validate={validatePhone} value={buyer_phone} onChange={(e)=>setBuyerPhone(e.target.value)} disabled={!checked}/>
              <TextInput source="buyer_address" label="Address" validate={validateAddress} value={buyer_address} onChange={(e)=>setBuyerAddress(e.target.value)} disabled={!checked}/>
              <TextInput source="buyer_city" label="City" validate={validateCity} value={buyer_city} onChange={(e)=>setBuyerCity(e.target.value)} disabled={!checked}/>
              <SelectInput source="buyer_state" label="State" validate={validateState} choices={ STATES } value={buyer_state?buyer_state:""} onChange={(e)=>setBuyerState(e.target.value)} disabled={!checked}/>
              <TextInput source="buyer_pincode" label="Pincode" validate={validatePincode} value={buyer_pincode} onChange={(e)=>setBuyerPincode(e.target.value)} disabled={!checked}/>
            </div>
          </div>

          <BooleanInput source="archive" label="Archived" defaultValue={false} />
        </SimpleForm>
      </Create>
    </>
  );
}

export const OrderEdit = (props,classes) => {
const controllerProps = useEditController(props);
const {record} = controllerProps;
const saveDisable = (record!=undefined && record.marketplace_identifier)?true:false;
return (
<Edit {...props}>
<TabbedForm toolbar={<CustomToolbar saveDisable={saveDisable}/>}>
<FormTab label="Order summary">
<Button
style={{position:'absolute',right:'30px',width:'50px'}}
variant="raised"
component={Link} 
to={`/orders`}
color="transparent">
<ArrowBackIcon/>
</Button>
<div className='container' style={{display: "flex", flexDirection: "row", width: "100%"}}>
<DateTimeInput source="order_date" validate={required()} label="Order Date" parse={(v)=>v.replace(/(\.[0-9]{1,9}Z)/ig,"").replace("T"," ")} style={{paddingRight: "100px"}}/>
<TextInput source="order_ref"  label="Order Ref" disabled style={{paddingRight: "100px"}}/>
<TextInput source="invoice_number"  label="Invoice Number" disabled />
</div>
<ColoredLine color="grey" />
<div className='container' style={{display: "flex", flexDirection: "row", width: "100%"}}>
<SelectInput source="sales_channel" label="Sales Channel"
choices={[
{ id: 'amazon', name: 'Amazon' },
{ id: 'flipkart', name: 'Flipkart' },
{ id: 'store', name: 'Webstore' }
]}
sx={{
  minWidth: 500
}}
style={{paddingRight: "60px"}}
/>

<SelectInput source="priority"  label="Is Priority"
choices={[
{ id: '0', name: 'False' },
{ id: '1', name: 'True' }
]}
style={{paddingRight: "60px"}}
/>

<DateTimeInput source="dispatch_by" label="Dispatch By"
parse={(v)=>v.replace(/(\.[0-9]{1,9}Z)/ig,"").replace("T"," ")}
style={{paddingRight: "60px"}}
/>

<SelectInput source="order_type" label="Order Type"
choices={[
{ id: 'prepaid', name: 'Pre-paid' },
{ id: 'postpaid', name: 'Post-paid' }
]}
/>
</div>

<div className='container' style={{display: "flex", flexDirection: "row", width: "100%"}}>
<ReferenceInput label="Customer" source="customer_id" reference="customers" validate={required()} style={{paddingRight: "160px"}}>
<SelectInput optionText="name" />
</ReferenceInput>
{/* <TextInput source="marketplace_identifier"  label="Marketplace Identifier" disabled />
<TextInput source="marketplace_status" disabled label="Marketplace Status"/>  */}
<SelectInput source="status" label="Status" 
choices={[
  { id:'ordered', name: 'Ordered' },
  { id:'unassigned' , name: 'Unassigned'},
  { id:'unshipped', name: 'Unshipped' },
  { id:'processed' , name: 'Processed'},
  { id:'shipped', name: 'Shipped' },
  { id:'completed', name: 'Completed' },
  { id:'returned', name: 'Returned' },
  { id:'cancelled', name: 'Cancelled' },
  ]}
  style={{paddingRight: "160px"}}
/> 
<TextInput source="delivery_amount"  label="Shipping Cost" />
</div>

<ColoredLine color="grey" />

<ArrayInput source="lineitems" label="Items" validate={required()} >
<SimpleFormIterator inline>
<FormDataConsumer>
{formDataProps => (
<LineItems {...formDataProps} />
)}
</FormDataConsumer>
<ImageField classes={classes} source="thumbnail_image" label="Picture" record={record}/>
</SimpleFormIterator>
</ArrayInput>

<TextField label="Total Order Amount" source="sum_total" />
<TextField label="Total IGST" source="total_igst" />
<TextField label="Total CGST" source="total_cgst" />
<TextField label="Total SGST" source="total_sgst" />
<TextField label="Total Taxable Amount" source="total_taxable_amount" />

<ArrayInput source="payments" label="Payments">
<SimpleFormIterator>
<div className='container' style={{display: "flex", flexDirection: "row", width: "83%"}}>
<DateInput source="date" label="Date" style={{width: "30%", paddingRight: "30px"}}/>
<TextInput source="ref" label="Transaction Reference" style={{width: "35%", paddingRight: "30px"}}/>
<TextInput source="amount" label="Transaction Amount" style={{width: "35%"}}/>
</div>
</SimpleFormIterator>
</ArrayInput> 
<ArrayInput source="shipping" label="Shipping Tracking">
<SimpleFormIterator>
<div className='container' style={{display: "flex", flexDirection: "row", width: "83%"}}>
<DateInput source="date" label="Date" style={{width: "30%", paddingRight: "30px"}}/>
<TextInput source="ref" label="Tracking Reference" style={{width: "35%", paddingRight: "30px"}}/>
<TextInput source="notes" label="Notes" style={{width: "35%"}}/>
</div>
</SimpleFormIterator>
</ArrayInput>

<div className='container' style={{display: "flex", flexDirection: "row", width: "100%"}}>
<div style={{width: "50%", paddingRight: "250px"}}>
{/* Billing Address */}
<Typography variant='h5'>Billing Address</Typography> 
<TextInput source="billing_to_name" label="Name" validate={validateName}/>
<TextInput source="billing_to_phone" label="Phone" validate={validatePhone}/>
<TextInput source="billing_to_address" label="Address" validate={validateAddress}/>
<TextInput source="billing_to_city" label="City" validate={validateCity}/>
<SelectInput source="billing_to_state" label="State" choices={ STATES } validate={validateState}/>
<TextInput source="billing_to_pincode" label="Pincode" validate={validatePincode}/> 
</div>

<div style={{width: "50%"}} >
{/* Shipping Address */}
<Typography variant='h5'>Shipping Address</Typography> 
<TextInput source="buyer_name" label="Name" validate={validateName}/>
<TextInput source="buyer_phone" label="Phone"validate={validatePhone}/>
<TextInput source="buyer_address" label="Address" validate={validateAddress}/>
<TextInput source="buyer_city" label="City" validate={validateCity}/>
<SelectInput source="buyer_state" label="State" choices={ STATES } validate={validateState}/>
<TextInput source="buyer_pincode" label="Pincode" validate={validatePincode}/> 
</div>
</div>

<BooleanInput source="archive" label="Archived" defaultValue={false} />           

<ArrayField source="parent_order_details" label="Previous Linked Order">
<Datagrid style={{tableLayout: 'auto', width : '100%'}}>
<ReferenceField label="Order Ref" source="primary_order_id" reference="orders">
<TextField source="order_ref" />
</ReferenceField>
<TextField source="primary_order_date" label="Order Date"/>
<TextField source="primary_order_status" label="Order Status" />
<ArrayField source="primary_order_lineitem" label="Items">
<Datagrid style={{tableLayout: 'auto', width : '100%'}} >
<TextField source="sku" />
<TextField source="quantity" />
</Datagrid>
</ArrayField> 
</Datagrid>
</ArrayField>  
</FormTab> 
{/*Transaction Tab*/}
<FormTab label="Transactions" path="transactions">
<Button
style={{position:'absolute',right:'30px',marginBottom:'100px',width:'50px'}}
variant="raised"
component={Link} 
to={`/orders`}
color="transparent">
<ArrowBackIcon/>
</Button>
<ReferenceManyField
reference="transactions"
target="order_id"
addLabel={false}
fullWidth
>
<Datagrid>
<TextField source="initiate_date" label="Date" />
<TextField source="sum_total" label="Total" />
<TextField source="is_debit" label="Debit" />
<TextField source="service_type" label="Service Type" />
<TextField source="notes" label="Notes" />
{/* <EditButton/>  */}
{/* <DeleteButton redirect={false}/> */}
</Datagrid>
</ReferenceManyField>
</FormTab>
</TabbedForm>
</Edit>
);
}

export const ReturnList = ( props ) => {
  const [returns,setReturns] = useState([]);
  const [sort, setSort] =  useState({ field: 'id', order: 'DESC' });
  const [currentPage, setCurrentPage] = useState(1);
  const dataProvider = useDataProvider();
  const [total, setTotal] = useState(0);
  const redirect = useRedirect();
  const [loading, setLoading] = useState();
  const [searchText, setSearchText] = useState(null);
  const [searchTextPage, setSearchTextPage] = useState(1);

  React.useEffect(() => {
    setLoading(true)
    const params= {
      pagination: {
        page:1,
        perPage: 10
      },
      sort: {
        field:'id',
        order: 'desc'
      },
      filter:{ q:searchText }
    }
    dataProvider.getList(`returns`, params)
    .then(({data,total}) => {
      setReturns(data);
      setTotal( Math.ceil(parseInt(total) / parseInt(10)) );
      setLoading(false);
    })
    .catch((error) => {
      setLoading(false);
      throw (error.message || error);
    })
  },[searchTextPage, searchText])

  return (
    <>
      <Box p={2}>
        <MaterialTextField
          variant="filled"
          InputProps={{
            startAdornment: (
              <InputAdornment position="center">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          onChange = { (e) => setSearchText(e.target.value) }
        />
        {/*
        <Button variant="text" color="primary" startIcon={<AddIcon />} style={{marginLeft:'490px'}}  onClick={() =>redirect(`orders/create`)}>
          Create 
        </Button>
        */}
      </Box>
      {
        loading
        ?<Loading/>
        :<Datagrid 
          rowClick={(id) => redirect(`/returns/${id}`)}
          data={keyby(returns,'id')}
          ids={returns.map(({ id }) => id)}
          currentSort={sort}
        >
          <TextField source="order_ref" label="Order Ref"/>
          <TextField source="order_date" label="Order Date"/>
          <TextField source="lineitems.sku" label="Lineitem SKU"/>
          <TextField source="lineitems.quantity" label="Ordered Quantity"/>
          <TextField source="initiate_date" label="Return Initiate Date"/>
          <TextField source="quantity" label="Returning Quantity" />
          <TextField source="type" label="Return Type" />
          <TextField source="received_date" label="Return Received Date" />
          <TextField source="is_received" label="Return Received?" />
          <TextField source="reason" label="Reason" />
          <TextField source="notes" label="Notes" />
        </Datagrid>
      }
      <CustomPagination count={total} currentPage={currentPage} onChange={( page ) => setCurrentPage( page ) } />
    </>        
  );
} 

export const ReturnEdit = (props) => (
  <Edit {...props}>
    <SimpleForm
      toolbar={<CustomToolbar />}
    >
      <TextField source="order_ref" label="Order Ref"/>
      <TextField source="order_date" label="Order Date"/>
      <TextField source="lineitems.sku" label="Lineitem SKU"/>
      <TextField source="lineitems.quantity" label="Ordered Quantity"/>
      <TextField source="initiate_date" label="Return Initiate Date"/>
      <TextField source="quantity" label="Returning Quantity" />
      <TextField source="type" label="Return Type" />
      <DateInput source="received_date" label="Return Received Date" />
      <BooleanInput source="is_received" label="Return Received?" />
      <TextInput source="quantity_received" label="Quantity Received" />
      <BooleanInput source="is_inventory_adjusted" label="Inventory Adjusted?" />
      <TextField source="inventory_adjusted_date" label="Inventory Adjusted Date" />
      <BooleanInput source="is_good_inventory" label="Good Inventory?" />
      <TextField source="reason" label="Reason" />
      <TextInput source="notes" label="Notes" />
    </SimpleForm>
  </Edit>
);
