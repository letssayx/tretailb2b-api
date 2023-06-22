import React,{useState,useRef,useEffect} from 'react';
import {required,minLength,maxLength,minValue,maxValue,
  number,regex,email,choices,useDataProvider,Loading,
  Error,useNotify,useRedirect,Title,TextInput,BooleanInput,
  FormWithRedirect,FileField,Filter,SearchInput,Create,Show,
  SimpleShowLayout,Edit,RichTextField,ArrayField,List,
  SimpleFormIterator,DeleteButton, SimpleForm,DateInput,
  ReferenceManyField,Datagrid, TextField, DateField,EditButton,
  SaveButton,Toolbar,
} from 'react-admin';
import axios from "axios";
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CancelButton from '../../settings/CancelButton';
import { makeStyles } from '@material-ui/core/styles';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Switch from '@material-ui/core/Switch';
import AccordionSummary from '@material-ui/core/ExpansionPanelSummary';
import AccordionDetails from '@material-ui/core/ExpansionPanelDetails';
import keyby from 'lodash/keyBy';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';

const cssStyle = {
  padding:'20px 0px 20px',
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
  toolbar: {
    display: 'flex',
  },
});

const LogCreate= () => {
  const [orders,setOrders] = useState([]);
  const dataProvider = useDataProvider();
  const form = useRef(null);
  const notify = useNotify();
  const [filevisible, setFilevisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [typeValue, setTypeValue] = useState("");
  const redirect = useRedirect();
  const [inputPickListId, setInputPickListId] = useState(null);
  const [dialogvisible, setDialogvisible] = useState({title:null,link:null,expanded:false,downloadmessage:'',createmessage:''});
  const [orderDetailsVisible,setOrderDetailsVisible]=useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [actionName, setActionName] = useState("none");
  const accordionData=[
    {
      title:'INVENTORY_DOWNLOAD',
      createmessage:'Click on the DOWNLOAD button to download the report of Inventory Information in CSV format.'
    },
    {
      title:'PRODUCT_STAT_DOWNLOAD',
      createmessage: 'Click on the DOWNLOAD button to download the report of the Product Stats in CSV format belonging to various Market-Places.',
    },
    {
      title:'NEW_INVENTORY_DOWNLOAD',
      createmessage:'Click on the DOWNLOAD button to download the report of Newly Added Products in CSV format.',
    },
    {
      title:'LISTING_DATA',
      createmessage:' Click on the DOWNLOAD button to download the report of Listing Data in CSV format.',
    },
    {
      title:'ORDER_DOWNLOAD',
      createmessage:'To download the Orders report in CSV format, first of all you have to select Marketplace, Order Status and Date range[Start Date & End Date]. Then click on the DOWNLOAD button.'
    }
  ];

  const handleTypeChange = (event) => {
    let selectedValue = event.target.value;
    setTypeValue(selectedValue);
    let selectedValueArr=selectedValue.split("_");
    if(event.target.value === 'PICKLIST_DATA') {
      setInputPickListId(true);
    }else{
      setInputPickListId(false);
    }
    if(selectedValueArr[1]=="UPLOAD") {
      setFilevisible(true);
    }
    else {
      setFilevisible(false);
    }
    accordionData.forEach( (element) => {
      if(event.target.value == element.title){
        setDialogvisible({...dialogvisible,title:element.title,link:element.link,downloadmessage:element.downloadmessage,createmessage:element.createmessage});
      }
    })

    if(event.target.value=="" ) {
      setFilevisible(false);
      setDialogvisible({title:null,link:null,downloadmessage:'',createmessage:''});
    }
    
    if(event.target.value=="ORDER_DOWNLOAD") {
      setOrderDetailsVisible(true)
    } else {
      setOrderDetailsVisible(false)
    }
    setActionName(event.target.value)
  }; 

  const submitLog = (event) => {
    event.preventDefault()
    const data = new FormData(form.current);
    let validated=true;
    //validate data before submit 
    if(data.getAll('type')[0]!="" && data.getAll('type')[0]!="undefined") {
      if(filevisible  ) {
        if(data.getAll('file')[0]=="undefined" || parseInt(data.getAll('file')[0]["size"])<=0) {
          notify(`Select file to process`, 'warning');
          validated=false;
        }
      }
      if(orderDetailsVisible) {
        if(data.getAll('start_date') == '') {
          notify(`Select start date to process`, 'warning');
          validated = false;
        }
      }
      if(orderDetailsVisible) {
        if(data.getAll('end_date') == '') {
          notify(`Select end date to process`, 'warning');
          validated = false;
        }
      }
      if(orderDetailsVisible) {
        if(data.getAll('order_status') == '') {
          delete (data.getAll('marketplace'))
          console.log( (data.getAll('name')) )
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
        'Content-Type': 'application/json',
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
  };

  if (loading) return <Loading />;
  if (error) return <Error />;


  return (
    <Card>
      <Title title="Request Operation" />
      <form ref={form} >
        <Card style = {{marginTop:'50px'}}>
          <CardContent>
            <Typography  color="textSecondary" gutterBottom>
              <div
                style={{ position: 'absolute', left: '50%', top: '10%', transform: 'translate(-50%, -50%)' }}>
                Action
                <select style={{marginLeft:'10px'}} name="type" className="type" value={actionName} onChange={handleTypeChange}>
                  <option value="" selected>SELECT</option>
                  <option value="INVENTORY_DOWNLOAD">Inventory Download</option>
                  <option value="NEW_INVENTORY_DOWNLOAD">New SKU's Added </option>
                  <option style={{display:'none'}}  value="PRODUCT_STAT_DOWNLOAD">Product Stat Download</option>
                  <option value="PRODUCT_STAT_DOWNLOAD">Product Stat Download</option>
                  <option style={{display:'none'}} value="ALL_PRODUCT_DOWNLOAD">All Product Download</option>
                  <option value="LISTING_DATA">Listing Data</option>
                  <option  style={{display:'none'}} value="PICKLIST_DOWNLOAD">Pick List Download</option>
                  <option value="ORDER_DOWNLOAD">Order Download</option>
                </select>
              </div>
              {orderDetailsVisible && (
                <div style={cssStyle}>
                  <div>
                    <Grid container>
                      <Grid item md={4} sm={3}>
                        <Box mb={4} mr={2}>
                          <FormControl variant="filled" name={'order-details'} value={'order-details'} style={{ minWidth: 150}} >
                            <InputLabel id="demo-simple-select-filled-label" >Marketplace</InputLabel>
                            <Select label="Marketplace" name="marketplace" defaultValue={'all'} >
                              <MenuItem value={'all'} default={true} > All </MenuItem>
                              <MenuItem value={'amazon'} >Amazon</MenuItem>
                              <MenuItem value={'flipkart'} >Flipkart</MenuItem>
                              <MenuItem value={'store'} >Webstore</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                      </Grid>

                      <Grid item md={4} sm={3}>
                        <Box mb={4} mr={2}>
                          <FormControl variant="filled" name={'order-details'} value={'order-details'} style={{ minWidth: 150}} >
                            <InputLabel id="demo-simple-select-filled-label" >Order Status</InputLabel>
                            <Select label="Order Status" type="order_status"  name="order_status" defaultValue={'all'}>
                              <MenuItem value={'all'}>All</MenuItem>
                              <MenuItem value={'ordered'}>Ordered</MenuItem>
                              <MenuItem value={'shipped'}>Shipped</MenuItem>
                              <MenuItem value={'completed'}>Completed</MenuItem>
                              <MenuItem value={'returned'}>Returned</MenuItem>
                              <MenuItem value={'cancelled'}>Cancelled</MenuItem>
                              <MenuItem value={'processed'}>Processed</MenuItem>
                              <MenuItem value={'unassigned'}>Unassigned</MenuItem>
                              <MenuItem value={'unshipped'}>Unshipped</MenuItem>
                            </Select>
                          </FormControl>
                        </Box>
                      </Grid>
                    </Grid>
                  </div>
                  <Grid container>
                    <Grid item md={4}>
                      <Box mb={2} mr={2}>
                        <div>
                          <Typography>Start Date</Typography>
                          <input type="date" style={cssStyle.dateInput}  name="start_date"/>
                        </div>
                      </Box>
                    </Grid>
                    <Grid item md={4}>
                      <Box mb={2} mr={2}>
                        <div>
                          <Typography>End Date</Typography>
                          <input type="date" style={cssStyle.dateInput} name="end_date"/>  
                        </div> 
                      </Box>
                    </Grid> 
                  </Grid>
                </div> 
              )}

              {filevisible && (
                <div>Upload file <input type="file" name="file" className="file" /></div>
              )}

              {inputPickListId && (
                <div>Pick List ID <br/> <input type="text" name="pick_list_id"/></div>
              )}
            </Typography>
          </CardContent>
          <div className='Accordion' expanded={true}>
            <AccordionSummary>
              {dialogvisible.createmessage}
            </AccordionSummary>
          </div>
          <CardActions>
            <Button 
              variant="contained"
              color="primary"
              onClick={submitLog}
              disabled={typeValue===""}
            >
              Download
            </Button> 
          </CardActions>
        </Card>
      </form>
    </Card>
  );
}

export default LogCreate;