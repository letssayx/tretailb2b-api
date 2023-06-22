import React, { useState, useEffect } from 'react';
import { useDataProvider, Loading, Error,useNotify,useRedirect } from 'react-admin';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import CardContent from '@material-ui/core/CardContent';
import { Title ,SimpleForm,TextInput,BooleanInput,FormWithRedirect} from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import { parse } from 'query-string';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import { useForm } from 'react-final-form';
import axios from "axios";

const useStyles=makeStyles( ( theme ) => ({
  inputGroup:{
    display:'flex',
    flexDirection:'row',
  }
  
}) );

const InventrySync= (props) => {
    const dataProvider = useDataProvider();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [showSyncOption,setShowSyncOption] = useState(null);
    const [showSyncStopMessage, setShowSyncStopMessage] = useState(false);

    useEffect(() => {
    
      dataProvider.getOnly('settings')
      .then(({ data }) => {
        
          if(   data.flipkart_store_id &&
                data.flipkart_email && 
                data.amazon_store_id &&
                data.amazon_email &&
                data.flipkart_default_inventory_location_id &&
                data.amazon_verified && data.amazon_verified!="0" &&
                data.flipkart_verified && data.flipkart_verified!="0"
          ){
             setShowSyncOption(true);
          }else{
             setShowSyncOption(false);
          }

          if(data.amazon_access_token_creation_fail){
              let stop_sync_amazon  = JSON.parse( data.amazon_access_token_creation_fail );
              if(stop_sync_amazon.sync_stop){
                 setShowSyncStopMessage( true );
              }
          }

          if(data.flipkart_access_token_creation_fail){
            let stop_sync_flipkart  = JSON.parse( data.flipkart_access_token_creation_fail );
            if(stop_sync_flipkart.sync_stop){
               setShowSyncStopMessage( true );
            }
          }

          setLoading(false);
      })
      .catch(error => {
          setError(error);
          setLoading(false);
      })
    

  }, []);


    if (loading) return <Loading />;
    if (error) return <Error />;

    return (
        <Card>
        <Title title="Store Settings" />
        {showSyncStopMessage && <SyncFailAlert text="Sync Stopped. Create token failed multiple times." />}
    { 
      showSyncOption && <FormWithRedirect render={()=><AutomateJobForm/>} />
    }
    </Card>
    )
};

const AutomateJobForm=(props)=>{
  
  
  const classes=useStyles();
  const form = useForm();
  const [loading, setLoading] = useState(true);
  const notify = useNotify();
  const [amazon_flipkart_inventory_sync,setAmazonFlipkartInventorySync] = useState(false);
  const [countChange, setCountChange] = useState(0);
  const redirect = useRedirect();

  useEffect(()=>{
          
          fetch(process.env.REACT_APP_API_ENDPOINT+'/settings/automate-job',
            { 
              method: 'GET', 
              headers: {
                'Accept': 'application/json',
                'x-access-token': localStorage.getItem('access_token'),
                'x-default-client-id': localStorage.getItem('default_client_id')
              },          
              credentials: 'include'
          })
         .then(res => res.json())
         .then((json)=>{
                 setAmazonFlipkartInventorySync(json.AMAZON_FLIPKART_INVENTORY_SYNC);
                 form.change("amazon_flipkart_inventory_sync",json.AMAZON_FLIPKART_INVENTORY_SYNC);
                
         })
         .catch(error => {
            notify(`${error.message}`, 'warning');
         });
    },[countChange]);


  const handleAmazonFlipkartInventorySyncChange=()=>{
      form.change("amazon_flipkart_inventory_sync",!amazon_flipkart_inventory_sync);
      setAmazonFlipkartInventorySync(!amazon_flipkart_inventory_sync);
  }

  const saveAutomateJobSetting = () => {
    let jobs =[
      {name:"AMAZON_FLIPKART_INVENTORY_SYNC",start:amazon_flipkart_inventory_sync},
    ];

    fetch(process.env.REACT_APP_API_ENDPOINT+'/settings/automate-job', { 
      method: 'POST', 
      body: JSON.stringify({jobs:jobs}),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': localStorage.getItem('access_token'),
        'x-default-client-id': localStorage.getItem('default_client_id')
      },          
      credentials: 'include'
    })
    .then(res => res.json())
    .then(json => {
        setCountChange(countChange+1);
        if(json.status == "success") {
          notify(`${json.message}`, 'success');
        }
        else {
          notify(`${json.message}`, 'warning');
        }
    })
    .catch(error => {
        setCountChange(countChange+1);
        notify(`${error.message}`, 'warning');
    });

  }
  
    const handleForceSync = ( ) => {
  
      const formData = new FormData(form.current);
   
      formData.append('type', 'AMAZON_FLIPKART_INVENTORY_SYNC');
      formData.append('force', true);

      setLoading(true);
      axios(process.env.REACT_APP_API_ENDPOINT+'/logs', { 
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
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
  }

  return(
    <Card>
        <CardContent>
           <Grid container>
              <Grid item xs={12} md={4}>
               <BooleanInput 
               label="Enable Marketplace Inventory Sync" 
               source="amazon_flipkart_inventory_sync" 
               onChange={handleAmazonFlipkartInventorySyncChange}
               />
               </Grid>
               <Grid item xs={12} md={4}>
                <TextInput disabled value="15" source="minutes" label="Minutes"/>
              </Grid>
            </Grid>
            </CardContent>
            <CardActions>
                 <Button variant="contained" color="primary" onClick={saveAutomateJobSetting}>Save</Button>
                 <Button variant="contained" color="primary" onClick={handleForceSync} >Force Inventory Sync</Button> 
            </CardActions>
         </Card>
        );

}

const SyncFailAlert = ( props) => {

  const { text } = props;

  return (
    <Box bgcolor="primary" m={1} px={2} py={1} style={ {backgroundColor:'#f8d7da',borderRadius:'0.25rem',borderColor:'#721c24'} }>
        <Typography color="error">{text || ''}</Typography>
    </Box>
  )

}


export default InventrySync;