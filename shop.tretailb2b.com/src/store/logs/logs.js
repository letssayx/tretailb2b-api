import React,{useState,useRef} from 'react';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {required,minLength,maxLength,minValue,maxValue,number,
  regex,email,choices,FileField,Loading,Error,useNotify,useRedirect,
  Title,Filter,SearchInput,Create,Show,SimpleShowLayout,Edit,
  RichTextField,ArrayField,List,SimpleFormIterator,DeleteButton,
  SimpleForm,TextInput,DateInput,ReferenceManyField,Datagrid,TextField,
  DateField,EditButton,SaveButton,Toolbar
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
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Box from '@material-ui/core/Box';

const useStyles = makeStyles({
  toolbar: {
    display: 'flex',
  },
});

const LogFilter = props => (
  <Filter {...props}>
    <SearchInput source="q" alwaysOn />
  </Filter>
);

const CustomToolbarEdit = props => (
  <Toolbar {...props} classes={useStyles()}>
    <CancelButton />
  </Toolbar>
);

const CustomToolbar = props => (
  <Toolbar {...props} classes={useStyles()}>
    <SaveButton style={{marginRight:'10px'}} />
    <CancelButton />
  </Toolbar>
);

export const LogCreate= () => {
  const form = useRef(null);
  const notify = useNotify();
  const [filevisible, setFilevisible] = useState(false);
  const [typeValue, setTypeValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const redirect = useRedirect();
  const [inputPickListId, setInputPickListId] = useState(null);
  const [dialogvisible, setDialogvisible] = useState({title:null,link:null,expanded:false,downloadmessage:'',createmessage:''});

  const accordionData=[
    {
      title:'ORDER_UPLOAD',
      downloadmessage:'Download the CSV template below. To download click on DOWNLOAD. Fill up the CSV file with valid data and upload it. Valid datas like Order Ref., Order Date, Invoice Number, Customer Phone, Customer Email, Customer State, Customer PIN-code, Ship to Name, Ship to Address, Ship to State, Ship to Phone, Item SKU, Sale Price, Quantity, Line Item Total Discount Amount, Sales Channel, Total Shipping Cost, Order Type, Dispatch Date, Priority, should be present column-wise in the CSV file',
      createmessage:'Choose CSV file with Order data & upload it into the system. To upload CSV file please click on the CREATE button.',
      link: <a href="https://storage.googleapis.com/public-templates/new_order_template.csv">DOWNLOAD</a>
    },
    {
      title:'TRANSACTION_UPLOAD',
      downloadmessage:'Download the CSV template below. To download click on DOWNLOAD. Fill up the CSV file with valid data and upload it. Valid datas like Order Ref., Type, Date(YYYY-MM-DD), Settlement ID, Line Item ID(if any), Description, Older Order ID(if any), Quantity and Transaction Amount columns should be present in the CSV file',
      createmessage:'Choose CSV file with Transaction data & upload it into the system. To upload CSV file please click on the CREATE button.',
      link:<a href="https://storage.googleapis.com/public-templates/transaction_template.csv">DOWNLOAD</a>
    },
    {
      title:'RETURN_UPLOAD',
      downloadmessage:'Download the CSV template below. To download click on DOWNLOAD. Fill up the CSV file with valid data and upload it. Valid datas like Order Ref., SKU, Line Item ID(if any), Quantity, Condition [0-bad; 1-good], Description, Received date, columns should be present in the CSV file',
      createmessage:'Choose CSV file with Sales Return data & upload it into the system. To upload CSV file please click on the CREATE button.',
      link:<a href="https://storage.googleapis.com/public-templates/return_receieve.csv">DOWNLOAD</a>
    },
    {
      title: 'INVENTORY_ALIAS_UPLOAD',
      downloadmessage:'Download the CSV template below. To download click on DOWNLOAD. Fill up the CSV file with valid data and upload it. Valid datas like SKU, Amazon Alias & Flipkart Alias column, should be present in the CSV file',
      createmessage: 'Choose CSV file with Item SKU data and upload it into the system. To upload CSV file please click on the CREATE button.',
      link: <a href="https://storage.googleapis.com/public-templates/alias-update.csv">DOWNLOAD</a>
    },
    {
      title:'LISTING_DATA',
      createmessage:'Upload listing data into the system. To upload please click on the CREATE button.',
    },
  ];

  const handleTypeChange = (event) => {
    let selectedValue = event.target.value;
    setTypeValue(selectedValue);
    let selectedValueArr=selectedValue.split("_");
    if(event.target.value === 'PICKLIST_DATA') {
      setInputPickListId(true);
    } else {
      setInputPickListId(false);
    }

    if(selectedValueArr[selectedValueArr.length - 1]=="UPLOAD") {
      setFilevisible(true);
    } else {
      setFilevisible(false);
    }

    accordionData.forEach((element) => {
      if(event.target.value == element.title){
        setDialogvisible({...dialogvisible,title:element.title,link:element.link,downloadmessage:element.downloadmessage,createmessage:element.createmessage});
      }
    })
    
    if(event.target.value=="" ) {
      setFilevisible(false);
      setDialogvisible({title:null,link:null,downloadmessage:'',createmessage:''});
    }
  };

  const submitLog = (event) => {
    const data = new FormData(form.current);
    let validated=true;
    // validate data before submit 
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
          redirect('/logs');
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
        <Card style = {{marginTop:'450px'}}>
          <CardContent>
            <Typography  color="textSecondary" gutterBottom>
              <div style={{ position: 'absolute', left: '50%', top: '13%', transform: 'translate(-50%, -50%)' }}>
                Action
                <select style={{marginLeft:'10px'}} name="type" className="type" onChange={handleTypeChange}>
                  <option value="" selected>SELECT</option>
                  <option style={{display:'none'}} value="INVENTORY_UPLOAD">Inventory Upload</option>
                  <option value="ORDER_UPLOAD">New Order Upload</option>
                  <option value="TRANSACTION_UPLOAD">New Transaction Upload</option>
                  <option value="RETURN_UPLOAD">New Return Receive Upload</option>
                  <option value="INVENTORY_ALIAS_UPLOAD">Inventory Alias Upload</option>
                  <option style={{display:'none'}} value="AMAZON_ORDER_SYNC">Amazon Order Sync</option>
                  <option style={{display:'none'}} value="FLIPKART_ORDER_SYNC">Flipkart Order Sync</option>
                  <option style={{display:'none'}} value="AMAZON_FLIPKART_INVENTORY_SYNC">Amazon and Flipkart Inventory Sync</option>
                  <option style={{display:'none'}} value="LISTING_DATA">Listing Data</option>
                  <option style={{display:'none'}} value="PICKLIST_DOWNLOAD">Pick List Download</option>
                </select>
              </div>

              <div className='Accordion'  expanded={true} style={{ marginTop:'50px', position: 'absolute', left: '50%', top: '30%', transform: 'translate(-50%, -50%)' }}>
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

          {filevisible && (
                <div style={{ marginTop:'50px', position: 'absolute', left: '41.5%', top: '50%', transform: 'translate(-50%, -50%)' }}>File to be uploaded: <input type="file" name="file" className="file" /></div>
          )}
          {inputPickListId && (
            <div>Pick List ID <br/> <input type="text" name="pick_list_id"/></div>
          )}
          
          <CardActions>
            <Button
              style={{ position: 'absolute', left: '29.5%', top: '62%', transform: 'translate(-50%, -50%)' }}
              variant="contained"
              color="primary"
              onClick={submitLog}
              disabled={typeValue===""}
            >
              Create
            </Button> 
          </CardActions>
        </Card>
      </form>
    </Card>
  );
}

export const LogShow = (props) =>(
  <Show {...props}>
    <SimpleShowLayout>
      <Box my={2}> 
        <ArrowBackIcon style={{ cursor: "pointer"}} onClick={() => window.history.back()}/>
      </Box>
      <TextField source="name" label="Name"/>
      <TextField source="status" label="Status"/>
      <TextField source="created_at" label="Created At"/>
      <RichTextField source="description" />

      <ArrayField source="input_files">
        <Datagrid>
          <TextField label="File Name" source="name" />
          <FileField source="url" title="Download" label=""  />
        </Datagrid>
      </ArrayField>

      <ArrayField source="output_files">
        <Datagrid>
          <TextField label="File Name" source="name" />
          <FileField source="url" title="Download" label=""  />
        </Datagrid>
      </ArrayField>
    </SimpleShowLayout>
  </Show>
);

export const LogList = (props) => (
  <List {...props} sort={{ field: 'created_at', order: 'DESC' }} filters={<LogFilter />}>
    <Datagrid rowClick="show">
      <TextField source="name" label="Name"/>
      <TextField source="status" label="Status"/>
      <TextField source="created_at" label="Created At"/>
    </Datagrid>
  </List>
);

