import React,{ useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import {Title,useNotify, Loading, useDataProvider, Error, useRedirect, FormWithRedirect} from 'react-admin';
import Typography from '@material-ui/core/Typography';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import { parse } from 'query-string';
import { BooleanInput, TextInput} from 'react-admin';
import { useForm } from 'react-final-form';
import axios from "axios";
import {
  useLocation
} from "react-router-dom";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const AmazonIntegration = ( props ) => {

    const notify = useNotify();
    const dataProvider = useDataProvider();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [amazon_sp_integration, setAmazonSpIntegration] = useState(false);
    const [amazon_sp_seller_id, setAmazonSpSellerId] = useState('');
    const [amazon_sp_auth_url, setAmazonSpAuthUrl] = useState('');
    const [amazon_sp_verified, setAmazonSpVerified] = useState(false);
    const [amazon_sp_token_expired, setAmazonSpTokenExpired] = useState(false);
    const [amazon_store_id,setAmazonStoreId] = useState(null);
    const [amazon_email,setAmazonEmail] = useState(null);
    const redirect = useRedirect();
    const [showSyncOption,setShowSyncOption] = useState(null);
    const { search } = useLocation();
    const [showSyncStopMessage, setShowSyncStopMessage] = useState(false);

    useEffect(()=>{
        const { state: state_string } = parse(search);
        const state = state_string ? state_string : '';
        console.log("state",state);
        if(state=="fuzon_initilize") {
          // Successfully call back from amazon 
          // gather few more details to call api to update 
          const { spapi_oauth_code: spapi_oauth_code_string } = parse(search);
          const spapi_oauth_code = spapi_oauth_code_string ? spapi_oauth_code_string : '';
          const { selling_partner_id: selling_partner_id_string } = parse(search);
          const selling_partner_id = selling_partner_id_string ? selling_partner_id_string : '';
          // const { mws_auth_token: mws_auth_token_string } = parse(search);
          // const mws_auth_token = mws_auth_token_string ? mws_auth_token_string : '';
          if(spapi_oauth_code !='' && selling_partner_id!='') {
            dataProvider.updateOnly('settings/amazon_oauth_update',{data : {spapi_oauth_code: spapi_oauth_code,selling_partner_id:selling_partner_id}})
                  .then(({ data }) => {
                    
                      setLoading(false);
    
                      if(data.status=='success') {
                        redirect('/settings');
                        notify(`${data.message}`, 'success');
                        window.location.reload(true); 
                      }
                      else {
                        redirect('/settings');
                        notify(data.message, 'warning');
                      }
                  })
                  .catch(error => {
                      setError(error);
                      setLoading(false);
                  })
          }
          else {
            setLoading(false);
            notify(`Wrong Page`, 'warning');
            redirect('/settings');
          }
        }else{

            dataProvider.getOnly('settings')
            .then(({ data }) => {
               if(data.amazon_integration=='1') {
                 setAmazonSpIntegration(true);
               }
               else {
                 setAmazonSpIntegration(false);
               }
               if(data.amazon_seller_id) {
                 setAmazonSpSellerId(data.amazon_seller_id);
               }
               if(data.amazon_sp_auth_url) {
                 setAmazonSpAuthUrl(data.amazon_sp_auth_url);
               }
               if(data.amazon_sp_token_expired=='1') {
                 setAmazonSpTokenExpired(true);
               }
               else {
                 setAmazonSpTokenExpired(false);
               }
               if(data.amazon_verified=='1') {
                 setAmazonSpVerified(true);
               }
               else {
                 setAmazonSpVerified(false);
               }
               if(data.amazon_store_id){
                 setAmazonStoreId(data.amazon_store_id);
               }else{
                  setAmazonStoreId(null)
               }
               if(data.amazon_email){
                  setAmazonEmail(data.amazon_email);
               }else{
                  setAmazonEmail(null)
               }

               if ( 
                data.amazon_store_id &&
                data.amazon_email &&
                data.amazon_verified && data.amazon_verified!="0"
               ){
                  setShowSyncOption(true);
               }else{
                  setShowSyncOption(false);
               }

               if(data.amazon_access_token_creation_fail){
                  let stop_sync  = JSON.parse( data.amazon_access_token_creation_fail );
                  if(stop_sync.sync_stop){
                     setShowSyncStopMessage( true );
                  }
               }

               setLoading(false);
           })
           .catch(error => {
               setError(error);
               setLoading(false);
           })
        }
    },[])

    const handleChange = () =>
     {
      // prepare data to push & validation 
        setLoading(true);
        dataProvider.updateOnly('settings',{data : {settings : { 
          amazon_integration: amazon_sp_integration,
          amazon_email,
          amazon_store_id
        }}})
            .then(({ data }) => { 
                if(data.status == "success") {
                    setLoading(false);
                    if(amazon_sp_integration) {
                      setAmazonSpIntegration(true);
                    }
                    else {
                      setAmazonSpIntegration(false);
                    }
                    notify(`${data.message}`, 'success');
                }
                else {
                    setLoading(false);
                    notify(`${data.message}`, 'warning');
                }
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            })
     }

     const handleAmazonSync = () =>
     {
      // prepare data to push & validation 
        setLoading(true);
        dataProvider.updateOnly('tasks',{data : {task_code : 1 ,data : { 
          
        }}})
            .then(({ data }) => { 
                if(data.status == "success") {
                    setLoading(false);
                    notify(`${data.message}`, 'success');
                }
                else {
                    setLoading(false);
                    notify(`${data.message}`, 'warning');
                }
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            })
     }

     const handleAmazonDisconnect = () =>
     {
      // prepare data to push & validation 
        setLoading(true);
        dataProvider.updateOnly('settings/oauth_disconnect',{data :  { 
          platform: "amazon",
          delete : true
        }})
            .then(({ data }) => { 
                if(data.status == "success") {
                    setLoading(false);
                    notify(`${data.message}`, 'success');
                    window.location.reload(true); 
                }
                else {
                    setLoading(false);
                    notify(`${data.message}`, 'warning');
                }
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            })
     }

     const handleForceSync = ( ) => {
  
      const formData = new FormData();
      formData.append('type', 'AMAZON_ORDER_SYNC');
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

    if (loading) return <Loading />;
    if (error) return <Error />;

    return(
      <>
      
      <Card>
        <CardContent>
        <Box my={1}> 
                  <ArrowBackIcon style={{ cursor: "pointer"}} onClick={() => window.history.back()}/>
        </Box>
        <Typography  color="textSecondary" gutterBottom>
          Amazon Integration {amazon_sp_verified ? <VerifiedUserIcon fontSize="large"  /> : <NotInterestedIcon fontSize="large"  /> }
        </Typography>
        {showSyncStopMessage && <SyncFailAlert text="Sync Stopped. Create token failed multiple times." />}
        <Typography  color="textSecondary">
        {!amazon_sp_verified ? <div><a className="button primary" href={amazon_sp_auth_url} >Authorize</a></div>  : <div><div><Switch id="amazon_sp_integration" onChange={event => setAmazonSpIntegration(event.target.checked)} checked={amazon_sp_integration}  /> Enable Integration</div>
        <div>Seller ID : {amazon_sp_seller_id}</div></div> }
        </Typography>
        {amazon_sp_verified && <Box my={2}>
            <Grid container spacing={2}>
                <Grid item>
                  <TextField label="Amazon Store ID"  defaultValue={amazon_store_id} onChange={(e)=>setAmazonStoreId(e.target.value)} variant="filled"/>
                </Grid>
                <Grid item>
                  <TextField label="Amazon Email" defaultValue={amazon_email} onChange={(e)=>setAmazonEmail(e.target.value)} variant="filled" />
                </Grid>
            </Grid>
        </Box>}
        </CardContent>
        {amazon_sp_verified ? <CardActions>
        <Button variant="contained" color="primary" onClick={handleChange}>Update</Button> 
        <Button variant="contained" color="primary" onClick={handleAmazonSync}>Import Products</Button> 
        <Button variant="contained" color="primary" onClick={handleAmazonDisconnect}>Disconnect</Button> 
        <br/>
        <Button variant="contained" color="primary" onClick={handleForceSync} >Force Order Sync</Button> 
      </CardActions> : "" }
      </Card>
      { 
       showSyncOption && <FormWithRedirect render={()=> <AutomateAmazonSync/>} />
      }
      </>
    )
}

const AutomateAmazonSync = () => {

  const [amazon_order_sync,setAmazonOrderSync] = useState(false);
  const [countChange, setCountChange] = useState(0);
  const form = useForm();
  const notify = useNotify();


  const handleAmazonOrderSyncChange=()=>{
    form.change("amazon_order_sync",!amazon_order_sync);
    setAmazonOrderSync(!amazon_order_sync);
  }

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
           setAmazonOrderSync(json.AMAZON_ORDER_SYNC);
           form.change("amazon_order_sync",json.AMAZON_ORDER_SYNC);
    })
    .catch(error => {
           notify(`${error.message}`, 'warning');
    });
},[countChange]);

  const saveAutomateJobSetting=()=>{
    let jobs =[
      {name:"AMAZON_ORDER_SYNC",start:amazon_order_sync}
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

  return (
     <Card>
       <CardContent>
       <Grid container>
             <Grid item xs={12} md={4}>
                <BooleanInput 
                label="Enable Amazon Order Sync" 
                source="amazon_order_sync" 
                onClick={handleAmazonOrderSyncChange}
                
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextInput disabled value="15" source="minutes" label="Minutes"/>
              </Grid>
       </Grid>
       </CardContent>
       <CardActions>
           <Button variant="contained" color="primary" onClick={saveAutomateJobSetting}>Save</Button>
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

export default AmazonIntegration;