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
import {Title,useNotify, Loading, useDataProvider, Error, useRedirect} from 'react-admin';
import Typography from '@material-ui/core/Typography';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import NotInterestedIcon from '@material-ui/icons/NotInterested';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import { parse } from 'query-string';
import { BooleanInput, TextInput, FormWithRedirect } from 'react-admin';
import { useForm } from 'react-final-form';
import axios from "axios";
import {
  useLocation
} from "react-router-dom";
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

const FlipkartIntegration = ( props ) => {

    const notify = useNotify();
    const dataProvider = useDataProvider();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const redirect = useRedirect();
    const [flipkart_integration, setFlipkartIntegration] = useState(false);
    const [flipkart_auth_url, setFlipkartAuthUrl] = useState('');
    const [flipkart_verified, setFlipkartVerified] = useState(false);
    const [flipkart_token_expired, setFlipkartTokenExpired] = useState(false);
    const [flipkartDefaultLocationId,setFlipkartDefaultLocationId] = useState(null);
    const [showSyncOption,setShowSyncOption] = useState(null);
    const [flipkart_email,setFlipkartEmail] = useState(null);
    const [flipkart_store_id,setFlipkartStoreId] = useState(null);
    const { search } = useLocation();
    const [showSyncStopMessage, setShowSyncStopMessage] = useState(false);

    useEffect(()=>{
        const { state: state_string } = parse(search);
        const state = state_string ? state_string : '';
        console.log("state",state);
        if(state=="fuzon_initilize_flipkart") {
            // Successfully call back from amazon 
            // gather few more details to call api to update 
            const { flipkart_oauth_code: flipkart_oauth_code_string } = parse(search);
            const flipkart_oauth_code = flipkart_oauth_code_string ? flipkart_oauth_code_string : '';
            if(flipkart_oauth_code !='') {
              dataProvider.updateOnly('settings/flipkart_oauth_update',{data : {flipkart_oauth_code: flipkart_oauth_code,flipkart_state:state}})
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
                
                if(data.flipkart_auth_url) {
                  setFlipkartAuthUrl(data.flipkart_auth_url);
                }
                if(data.flipkart_integration=='1') {
                  setFlipkartIntegration(true);
                }
                else {
                  setFlipkartIntegration(false);
                }
                if(data.flipkart_token_expired=='1') {
                  setFlipkartTokenExpired(true);
                }
                else {
                  setFlipkartTokenExpired(false);
                }
                if(data.flipkart_verified=='1') {
                  setFlipkartVerified(true);
                }
                else {
                  setFlipkartVerified(false);
                }
                if(data.flipkart_default_inventory_location_id){
                   setFlipkartDefaultLocationId(data.flipkart_default_inventory_location_id)
                }else{
                   setFlipkartDefaultLocationId(null);
                }
                if(data.flipkart_store_id){
                   setFlipkartStoreId(data.flipkart_store_id);
                }else{
                   setFlipkartStoreId(null)
                }
                if(data.flipkart_email){
                   setFlipkartEmail(data.flipkart_email);
                }else{
                   setFlipkartEmail(null);
                }

                if (  
                  data.flipkart_store_id &&
                  data.flipkart_email && 
                  data.flipkart_default_inventory_location_id &&
                  data.flipkart_verified && data.flipkart_verified!="0"
                ){
                   setShowSyncOption(true);
                }else{
                   setShowSyncOption(false);
                }
                if(data.flipkart_access_token_creation_fail){
                  let stop_sync  = JSON.parse( data.flipkart_access_token_creation_fail );
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

    const handleChangeFlipkart = () =>
     {
      // prepare data to push & validation 
        setLoading(true);
        dataProvider.updateOnly('settings',{data : {settings : { 
          flipkart_integration: flipkart_integration,
          flipkart_default_inventory_location_id:flipkartDefaultLocationId,
          flipkart_store_id,
          flipkart_email
        }}})
            .then(({ data }) => { 
                if(data.status == "success") {
                    setLoading(false);
                    if(flipkart_integration) {
                      setFlipkartIntegration(true);
                    }
                    else {
                      setFlipkartIntegration(false);
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

     const handleFlipkartDisconnect = () =>
     {
      // prepare data to push & validation 
        setLoading(true);
        dataProvider.updateOnly('settings/oauth_disconnect',{data :  { 
          platform: "flipkart",
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

    const handleLoading = ( value ) => { setLoading( value ); }

    //Flipkart Sync
    const handleFlipkartSync = () =>
    {
       let data = new FormData();    //formdata object
       data.append('type', 'FLIPKART_INVENTORY_EXTRACT');   //append the values with key, value pair
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
    };

    const handleForceSync = ( ) => {
  
      const formData = new FormData();
   
      formData.append('type', 'FLIPKART_ORDER_SYNC');
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

    if(loading){
       return <Loading/>;
    }

    return (
      <>
      <Card>
        <CardContent>
        <Box my={1}> 
                  <ArrowBackIcon style={{ cursor: "pointer"}} onClick={() => window.history.back()}/>
        </Box>
        <Typography  color="textSecondary" gutterBottom>
          Flipkart Integration {flipkart_verified ? <VerifiedUserIcon fontSize="large"  /> : <NotInterestedIcon fontSize="large"  /> }
        </Typography>
        {showSyncStopMessage && <SyncFailAlert text="Sync Stopped. Create token failed multiple times." />}
        <Typography  color="textSecondary">
        {!flipkart_verified ? <div><a className="button primary" href={flipkart_auth_url} >Authorize</a></div>  : <div><div><Switch id="flipkart_integration" onChange={event => setFlipkartIntegration(event.target.checked)} checked={flipkart_integration}  /> Enable Integration</div>
        </div> }
        </Typography>
        {flipkart_verified ? <TextField value={flipkartDefaultLocationId} onChange={(e)=>setFlipkartDefaultLocationId(e.target.value)} label="Default Location ID" variant="filled"/>:""}
        {flipkart_verified && <Box my={2}>
            <Grid container spacing={2}>
                <Grid item>
                  <TextField label="Flipkart Store ID" value={flipkart_store_id} onChange={(e)=>setFlipkartStoreId(e.target.value)} variant="filled"/>
                </Grid>
                <Grid item>
                  <TextField label="Flipkart Email"  value={flipkart_email} onChange={(e)=>setFlipkartEmail(e.target.value)} variant="filled" />
                </Grid>
            </Grid>
        </Box>}
        </CardContent>
        {flipkart_verified ? <CardActions>
        <Button variant="contained" color="primary" onClick={handleChangeFlipkart}>Update</Button> 
        <Button variant="contained" color="primary" onClick={handleFlipkartSync}>FlipkartSync</Button>
        <Button variant="contained" color="primary" onClick={handleFlipkartDisconnect}>Disconnect</Button> 
        <Button variant="contained" color="primary" onClick={handleForceSync}>Force Order Sync</Button> 
        
      </CardActions> : "" }
      </Card>
      { 
       showSyncOption && <FormWithRedirect render={()=> <AutomateFlipkartSync loading={handleLoading}/>} />
      }
      </>
    );

}


const AutomateFlipkartSync = ( props ) => {

  const [flipkart_order_sync,setFlipkartOrderSync] = useState(false);
  const [countChange, setCountChange] = useState(0);
  const form = useForm();
  const notify = useNotify();
  const [showSyncOption,setShowSyncOption] = useState(null);
  const redirect = useRedirect();

  const handleFlipkartOrderSyncChange = () => {
    form.change("flipkart_order_sync",!flipkart_order_sync);
    setFlipkartOrderSync(!flipkart_order_sync);
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
           setFlipkartOrderSync(json.FLIPKART_ORDER_SYNC);
           form.change("flipkart_order_sync",json.FLIPKART_ORDER_SYNC);
          
    })
    .catch(error => {
      notify(`${error.message}`, 'warning');
    });
   },[countChange]);

  const saveAutomateJobSetting=()=>{
    let jobs =[
      {name:"FLIPKART_ORDER_SYNC",start:flipkart_order_sync}
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
                label="Enable Flipkart Order Sync" 
                source="flipkart_order_sync"
                onChange={handleFlipkartOrderSyncChange}
                 />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextInput disabled value="20" source="minutes" label="Minutes" />
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

export default FlipkartIntegration;