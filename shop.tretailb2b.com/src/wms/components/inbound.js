// import React,{useState,useRef} from 'react';
// import {useNotify,Loading, Title,useRedirect, List, Datagrid,Filter,SearchInput, TextField, RichTextField, SimpleShowLayout, ArrayField, Show, FileField  } from 'react-admin'
// import Card from '@material-ui/core/Card';
// import CardContent from '@material-ui/core/CardContent';
// import Typography from '@material-ui/core/Typography';
// import Button from '@material-ui/core/Button';
// import CardActions from '@material-ui/core/CardActions';
import Accordion from '@material-ui/core/ExpansionPanel';
import AccordionSummary from '@material-ui/core/ExpansionPanelSummary';
import AccordionDetails from '@material-ui/core/ExpansionPanelDetails';
// import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
// import Paper from '@material-ui/core/Paper';
// import Tabs from '@material-ui/core/Tabs';
// import Tab from '@material-ui/core/Tab';
import React , { Fragment ,useEffect,useRef,useState} from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {required, minLength, maxLength, minValue, maxValue, number, regex, email, choices} from 'react-admin';
import { FormTab,TabbedForm,ReferenceField,UrlField,AutocompleteInput,Filter,SearchInput,Create, ArrayField,ChipField,Edit,NumberInput,ImageField,DeleteButton,List,useDataProvider,Title, RichTextField,FileField, Loading, Error,FormDataConsumer,ReferenceInput, SelectInput,BooleanInput,SimpleForm, ArrayInput, TextInput,SimpleFormIterator, DateInput,DateTimeInput,ReferenceManyField, Datagrid, TextField, DateField, SaveButton,EditButton,Toolbar} from 'react-admin';
import { useRedirect, useNotify, useQuery, Pagination} from 'react-admin';
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
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography';

import DoneIcon from '@material-ui/icons/Done'
import {indigo} from '@material-ui/core/colors'
import keyBy from 'lodash/keyBy';
import AddIcon from '@material-ui/icons/Add';

const cssStyle = {
  display:'flex',
  padding:'10px 0px 40px',
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

const usePanelStyles = makeStyles({
  paper:{
    margin:0,
    padding:0
  }
});

const useSelectStyles = makeStyles((theme)=>
({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
}));

export const WMSInboundLogList = ({ classes, permissions, ...props }) => {
  const [inbounds,setInbounds] = useState([]);
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
    dataProvider.getList(`wms-inbound`, params)
    .then(({data,total}) =>
    {
      setInbounds(data);
      setTotal( Math.ceil(parseInt(total) / parseInt(10)) );
      setLoading(false);
    })
    .catch((e)=>{
      setLoading(false);
      throw (e.message || e);
    })
  },[currentPage])

  React.useEffect(() => {
    setLoading(true)
    const params = {
      pagination:{
        page:1,
        perPage: 10
      },
      sort: {
        field:'id',
        order: 'desc'
      },
      filter:{q:searchText}
    }
    dataProvider.getList(`wms-inbound`, params)
    .then(({data,total}) =>
    {
      setInbounds(data);
      setTotal( Math.ceil(parseInt(total) / parseInt(10)) );
      setLoading(false);
    })
    .catch((e)=>{
      setLoading(false);
      throw (e.message || e);
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
                <SearchIcon/>
              </InputAdornment>
            ),
          }}
          onChange = {(e) => setSearchText(e.target.value)}
        />
      </Box>
      {
        loading
        ?<Loading/>
        :<Datagrid 
          rowClick={(id) => redirect(`/logs/${id}/show`)}
          data={keyby(inbounds,'id')}
          ids={inbounds.map(({ id }) => id)}
          currentSort={sort}
        >   
          <TextField source="name" label="Name"/>
          <TextField source="status" label="Status"/>
          <TextField source="created_at" label="Created At"/>
        </Datagrid>
      }
      <CustomPagination count={total} currentPage={currentPage} onChange={( page ) => setCurrentPage( page )}/>
    </>
  );
}

export const WMSInboundLogCreate = ( props ) => {
  const form = useRef(null);
  const [filevisible, setFilevisible] = useState(false);
  const [dialogvisible, setDialogvisible] = useState({title:null,link:null,expanded:false,downloadmessage:'',createmessage:''});
  const [showDateInput,setShowDateInput] = useState(false);
  const classes = useSelectStyles();
  const [actionName, setActionName] = useState("none");
  const [uploadFile, setUploadFile] = useState(null);
  const [loading, setLoading] = useState( false );
  const notify = useNotify();
  const redirect = useRedirect();
  const accordionData = [
    {
      title:'WMS_INVENTORY_ADD',
      downloadmessage:'Download the CSV template below.To download click on DOWNLOAD button. Fill the CSV file with valid data and upload it. SKU and quantity columns should be present in the CSV file',
      createmessage:'Add product quantity with CSV file and upload it into the system.To upload CSV file please click on the CREATE button.',
      link: <a href="https://storage.googleapis.com/public-templates/add_inventory.csv">DOWNLOAD</a>
    },
    {
      title:'WMS_INVENTORY_SUBTRACT',
      downloadmessage:'Download the CSV template below.To download click on DOWNLOAD button. Fill the CSV file with valid data and upload it. SKU and quantity columns should be present in the CSV file',
      createmessage:'Subtract product quantity with CSV file and upload it into the system.To upload CSV file please click on the CREATE button.',
      link:<a href="https://storage.googleapis.com/public-templates/subtract_inventory.csv">DOWNLOAD</a>
    },
    {
      title:'WMS_INVENTORY_QUERY',
      downloadmessage:'Download the CSV template below.To download click on DOWNLOAD button. Fill the CSV file with valid data and upload it. SKU column should be present in the CSV file',
      createmessage:'Check product location with CSV file and upload it into the system.To upload CSV file please click on the CREATE button.',
      link:<a href="https://storage.googleapis.com/public-templates/query_inventory.csv">DOWNLOAD</a>
    },
    {
      title:'WMS_INVENTORY_BIN_UPDATE',
      downloadmessage:'Download the CSV template below.To download click on DOWNLOAD button. Fill the CSV file with valid data and upload it. SKU and BIN columns should be present in the CSV file',
      createmessage:'Update product  with CSV file and upload it into the system.To upload CSV file please click on the CREATE button.',
      link:<a href="https://storage.googleapis.com/public-templates/update_inventory_bin.csv">DOWNLOAD</a>
    },
    {
      title:'INVENTORY_DOWNLOAD',
      createmessage:'To download please click on the CREATE button.'
    },
    {
      title:'WMS_INVENTORY_TRANSACTIONS',
      createmessage:'Update the transaction details into the system.To upload please click on the CREATE button.'
    }
  ];
  const [{title,link}]=accordionData;

  const handleChange = (e) => {
    if(e.target.value == 'WMS_INVENTORY_TRANSACTIONS') {
      setShowDateInput(true);
      setFilevisible(false);
      setDialogvisible({title:null,link:null,downloadmessage:'',createmessage:''});
    } else {
      setShowDateInput(false);
      setFilevisible(true);
    }
    accordionData.forEach((element)=> {
      if(e.target.value == element.title) {
        setDialogvisible({...dialogvisible,title:element.title,link:element.link,downloadmessage:element.downloadmessage,createmessage:element.createmessage});
      }
    })
    if(e.target.value=='INVENTORY_DOWNLOAD') {
      setFilevisible(false);
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
        notify(`Select file to process`, 'warning');
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
          redirect('/wms-inbound/monitor_status');
        } else {
          notify(`${res.data.message}`, 'warning');
          redirect('/wms-inbound/items');
        }
      })
      .catch(error => {
        setLoading(false);
        notify(`${error.message}`, 'warning');
      });
    }
  };

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
                      <MenuItem value="WMS_INVENTORY_ADD">Inventory Add</MenuItem>
                      <MenuItem value="WMS_INVENTORY_SUBTRACT">Inventory Remove</MenuItem>
                      <MenuItem value="WMS_INVENTORY_QUERY"> Inventory Query</MenuItem>
                      <MenuItem value="WMS_INVENTORY_TRANSACTIONS"> Inventory Transactions</MenuItem>
                      <MenuItem value="INVENTORY_DOWNLOAD">Inventory Download</MenuItem>
                      <MenuItem value="WMS_INVENTORY_BIN_UPDATE"> Inventory Bin Update</MenuItem>
                    </Select>
                </FormControl>
              </div>
              <br></br>
              {
                showDateInput && 
                <div style={cssStyle}>
                  <div>
                    <Typography>Start Date</Typography>
                    <input type="date" style={cssStyle.dateInput} name="start_date"/>
                  </div>
                <div>
                  <Typography>End Date</Typography>
                  <input type="date" style={cssStyle.dateInput} name="end_date"/>  
                </div>  
              </div>
              }
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

const getIndexByPath= (pathname) => {
    switch (pathname) {
      case 'items':
        return 0
      case 'operation_type':
        return 1;
      case 'monitor_status':
        return 2;
      default:
        return 0; 
    }
}

const getPathByIndex= ( index ) => {
  switch ( index ) {
    case 0:
      return 'items';
    case 1:
      return 'operation_type';
    case 2:
      return 'monitor_status';
    default:
      return 'items'; 
  }
} 

export const WMSInboundSection = ( props ) =>  {

  const { tab } = useParams();
  const [panel, setPanel] = useState(0);
  const history = useHistory();
  useEffect(()=>{
       setPanel( getIndexByPath(tab) );

  },[tab]);

  return (
    <div>
      <Paper elevation={3}> 
        <Tabs value={panel} onChange={(e, value)=> history.push(getPathByIndex(value)) }  aria-label="simple tabs example">
          <Tab label="Inventory" {...a11yProps(0)}/>
          <Tab label="Operation Type" {...a11yProps(1)}/>
          <Tab label="Monitor Status" {...a11yProps(2)}/>
        </Tabs>
      </Paper>
      <TabPanel value={panel} index={0}> <WMSInboundItemList {...props}/> </TabPanel>
      <TabPanel value={panel} index={1}> <WMSInboundLogCreate {...props} /> </TabPanel>
      <TabPanel value={panel} index={2}> <WMSInboundLogList {...props}/> </TabPanel>
    </div>
  );
} 

//////// Pulled from item.js ////////
const useStyles = makeStyles({
  toolbar: {
      display: 'flex',
  },

});
const ItemFilter = props => (
  <Filter {...props}>
      <SearchInput source="q" alwaysOn />
      <SelectInput source="type" choices={[
        { id: 'all', name: 'All' },
        { id: 'new', name: 'New' }
      ]} alwaysOn />
  </Filter>
);
const CustomToolbar = props => (
  <Toolbar {...props} classes={useStyles()}>
      <SaveButton style={{marginRight:'10px'}} />
      <CancelButton />
  </Toolbar>
);

const CustomToolbarEdit = props => (
  <Toolbar {...props} classes={useStyles()}>
      <SaveButton style={{marginRight:'10px'}} />
      <CancelButton />
      <DeleteButton />
  </Toolbar>
);

const PriceValidation = (value, allValues) => {
    //console.log(allValues);

    if (!value) {
        return 'This is required';
    }

    if (value > allValues.items[0].mrp){
      return 'Must be less than MRP';
    }
    //return [];
};


const QuickEdit = (props) => {
  return <Edit
            {...props}
            resource="wms-inbound/items"
            redirect={false}
            title="Quick Edit"
          >
              <SimpleForm redirect={false}>
                  <TextInput source="price"/>
                  <TextInput
                   source="quantity"
                   disabled={props.record.inventory_type=='Single'?false:true}
                   />
              </SimpleForm>
          </Edit>
}

export const WMSInboundItemList = (props ) => {
 
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sort, setSort] = useState({ field: 'id', order: 'ASC' });
  const [filter, setFilter] = useState(null);
  const redirect = useRedirect();

  const { data, total, loading, error } = useQuery ({
    type: 'getList',
    resource: `wms-inbound/items`,
    payload: {
      pagination: { page, perPage },
      sort,
      filter: {
        q: filter
      },
    }
  });

  // if (error) {
  //     return <p>ERROR: {error.message || error}</p>
  // }

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
          value={filter}
          onChange = { (e) => setFilter(e.target.value) }
        />
      </Box>
      {
        loading
        ?<Loading/>
        :<Datagrid         
          data={keyBy(( data || [] ), 'id')}
          ids={( data || [] ).map(({ id }) => id)}
          currentSort={sort}
          setSort={(field, order) => setSort({ field, order })}
          expand={<QuickEdit />}
          basePath="wms-inbound/items"
          resource="wms-inbound/items"
          rowClick={(id, resource, record) => redirect(`/items/${id}`)}
        >   
          <ImageField source="thumbnail_image" label="Product Image" sortable={false} />
          <TextField source="product_name" label="Product Name" sortable={false}/>
          <TextField source="product_sku" label="Parent SKU" sortable={false}/>
          <TextField source="product_category_name" label="Category" sortable={false}/>
          <TextField source="product_subcategory_name" label="SubCategory" sortable={false}/>
          <TextField source="product_brand_name" label="Brand" sortable={false}/>
          <TextField source="sku" label="SKU"/>
          <TextField source="price" label="Price"/>
          <TextField source="quantity" label="Quantity"/>
          <TextField source="variants" label="Variants"/>
          <TextField source="inventory_type" label="Inventory Type"/>
          <TextField source="inventory_location" label="Location"/>
          <NewlyAddedField source="newly_added" label="New"/>
        </Datagrid>
      }
      <Pagination
        page={page}
        setPage={setPage}
        perPage={perPage}
        setPerPage={setPerPage}
        total={total}
      />
    </>
  );
}

const NewlyAddedField = ({source,record})=>{
  const  { newly_added } = record;
  return ( newly_added ? <DoneIcon style={{color:indigo[500]}}/>:<></>)
}
