import React, { useState, useEffect } from 'react';
import { useDataProvider, Loading, Error,useNotify,useRedirect,
  Title ,SimpleForm,TextInput,BooleanInput,FormWithRedirect
} from 'react-admin';
import { useForm } from 'react-final-form';
import axios from "axios";
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import CardContent from '@material-ui/core/CardContent';
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

const useStyles=makeStyles((theme)=>({
  inputGroup:{
    display:'flex',
    flexDirection:'row',
  }
  
}));
const Settings= (props) => {
    const notify = useNotify();
    const dataProvider = useDataProvider();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState();
    const [amazon_sp_integration, setAmazonSpIntegration] = useState(false);
    const [amazon_sp_seller_id, setAmazonSpSellerId] = useState('');
    const [amazon_sp_auth_url, setAmazonSpAuthUrl] = useState('');
    const [amazon_sp_verified, setAmazonSpVerified] = useState(false);
    const [amazon_sp_token_expired, setAmazonSpTokenExpired] = useState(false);
    const [flipkart_integration, setFlipkartIntegration] = useState(false);
    const [flipkart_auth_url, setFlipkartAuthUrl] = useState('');
    const [flipkart_verified, setFlipkartVerified] = useState(false);
    const [flipkart_token_expired, setFlipkartTokenExpired] = useState(false);
    const [flipkartDefaultLocationId,setFlipkartDefaultLocationId] = useState(null);
    const [showSyncOption,setShowSyncOption] = useState(null);
    const [flipkart_email,setFlipkartEmail] = useState(null);
    const [amazon_email,setAmazonEmail] = useState(null);
    const [flipkart_store_id,setFlipkartStoreId] = useState(null);
    const [amazon_store_id,setAmazonStoreId] = useState(null);

    const redirect = useRedirect();
    useEffect(() => {
    const { state: state_string } = parse(props.location.search);
    const state = state_string ? state_string : '';
    console.log("state",state);
    if(state=="fuzon_initilize") {
      // Successfully call back from amazon 
      // gather few more details to call api to update 
      const { spapi_oauth_code: spapi_oauth_code_string } = parse(props.location.search);
      const spapi_oauth_code = spapi_oauth_code_string ? spapi_oauth_code_string : '';
      const { selling_partner_id: selling_partner_id_string } = parse(props.location.search);
      const selling_partner_id = selling_partner_id_string ? selling_partner_id_string : '';
      // const { mws_auth_token: mws_auth_token_string } = parse(props.location.search);
      // const mws_auth_token = mws_auth_token_string ? mws_auth_token_string : '';
      if(spapi_oauth_code !='' && selling_partner_id!='') {
        dataProvider.updateOnly('settings/amazon_oauth_update',{data : {spapi_oauth_code: spapi_oauth_code,selling_partner_id:selling_partner_id}})
              .then(({ data }) => {
                //console.log(data.amazon_integration);
                  // if(data.amazon_integration=='1') {
                  //   setAmazonSpIntegration(true);
                  // }
                  // else {
                  //   setAmazonSpIntegration(false);
                  // }
                  // if(data.amazon_seller_id) {
                  //   setAmazonSpSellerId(data.amazon_seller_id);
                  // }
                  // if(data.amazon_sp_auth_url) {
                  //   setAmazonSpAuthUrl(data.amazon_sp_auth_url);
                  // }
                  // if(data.amazon_sp_token_expired=='1') {
                  //   setAmazonSpTokenExpired(true);
                  // }
                  // else {
                  //   setAmazonSpTokenExpired(false);
                  // }
                  // if(data.amazon_verified=='1') {
                  //   setAmazonSpVerified(true);
                  // }
                  // else {
                  //   setAmazonSpVerified(false);
                  // }
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
    }
    else if(state=="fuzon_initilize_flipkart") {
      // Successfully call back from amazon 
      // gather few more details to call api to update 
      const { flipkart_oauth_code: flipkart_oauth_code_string } = parse(props.location.search);
      const flipkart_oauth_code = flipkart_oauth_code_string ? flipkart_oauth_code_string : '';
      if(flipkart_oauth_code !='') {
        dataProvider.updateOnly('settings/flipkart_oauth_update',{data : {flipkart_oauth_code: flipkart_oauth_code,flipkart_state:state}})
              .then(({ data }) => {
                //console.log(data.amazon_integration);
                  // if(data.flipkart_integration=='1') {
                  //   setFlipkartIntegration(true);
                  // }
                  // else {
                  //   setFlipkartIntegration(false);
                  // }
                  // if(data.flipkart_token_expired=='1') {
                  //   setFlipkartTokenExpired(true);
                  // }
                  // else {
                  //   setFlipkartTokenExpired(false);
                  // }
                  // if(data.flipkart_verified=='1') {
                  //   setFlipkartVerified(true);
                  // }
                  // else {
                  //   setFlipkartVerified(false);
                  // }
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
    }
    else {
      dataProvider.getOnly('settings')
      .then(({ data }) => {
        //console.log(data.amazon_integration);
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
          }
          if(data.flipkart_store_id){
             setFlipkartStoreId(data.flipkart_store_id);
          }
          if(data.flipkart_email){
             setFlipkartEmail(data.flipkart_email);
          }
          if(data.amazon_store_id){
            setAmazonStoreId(data.amazon_store_id);
          }
          if(data.amazon_email){
            setAmazonEmail(data.amazon_email);
          }
          if (  data.flipkart_store_id &&
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
          setLoading(false);
      })
      .catch(error => {
          setError(error);
          setLoading(false);
      })
    }

  }, []);

     //On the change event for the select box pass the selected value back to the parent
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

 
     //Amazon Sync
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
              } else {
                notify(`${res.data.message}`, 'warning');
              }
            })
            .catch(error => {
              setLoading(false);
              notify(`${error.message}`, 'warning');
            });
        };
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
     
    


    if (loading) return <Loading />;
    if (error) return <Error />;

    return (
        <Card>
        <Title title="Store Settings" />
        <Card>
        <CardContent>
        <Typography  color="textSecondary" gutterBottom>
          Amazon Integration {amazon_sp_verified ? <VerifiedUserIcon fontSize="large"  /> : <NotInterestedIcon fontSize="large"  /> }
        </Typography>
        <Typography  color="textSecondary">
        {!amazon_sp_verified ? <div><a className="button primary" href={amazon_sp_auth_url} >Authorize</a></div>  : <div><div><Switch id="amazon_sp_integration" onChange={event => setAmazonSpIntegration(event.target.checked)} checked={amazon_sp_integration}  /> Enable Integration</div>
        <div>Seller ID : {amazon_sp_seller_id}</div></div> }
        </Typography>
        {amazon_sp_verified && <Box my={2}>
            <Grid container spacing={2}>
                <Grid item>
                  <TextField label="Amazon Store ID"  value={amazon_store_id} onChange={(e)=>setAmazonStoreId(e.target.value)} variant="filled"/>
                </Grid>
                <Grid item>
                  <TextField label="Amazon Email" value={amazon_email} onChange={(e)=>setAmazonEmail(e.target.value)} variant="filled" />
                </Grid>
            </Grid>
        </Box>}
        </CardContent>
        {amazon_sp_verified ? <CardActions>
        <Button variant="contained" color="primary" onClick={handleChange}>Update</Button> 
        <Button variant="contained" color="primary" onClick={handleAmazonSync}>Import Products</Button> 
        <Button variant="contained" color="primary" onClick={handleAmazonDisconnect}>Disconnect</Button> 
      </CardActions> : "" }
        
    </Card>
    <Card>
        <CardContent>
        <Typography  color="textSecondary" gutterBottom>
          Flipkart Integration {flipkart_verified ? <VerifiedUserIcon fontSize="large"  /> : <NotInterestedIcon fontSize="large"  /> }
        </Typography>
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
        
      </CardActions> : "" }
      
      
    </Card>
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
  const [amazon_order_sync,setAmazonOrderSync] = useState(false);
  const [flipkart_order_sync,setFlipkartOrderSync] = useState(false);
  const [amazon_flipkart_inventory_sync,setAmazonFlipkartInventorySync] = useState(false);
  const [countChange, setCountChange] = useState(0);

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
                 setAmazonOrderSync(json.AMAZON_ORDER_SYNC);
                 form.change("amazon_order_sync",json.AMAZON_ORDER_SYNC);
                 setFlipkartOrderSync(json.FLIPKART_ORDER_SYNC);
                 form.change("flipkart_order_sync",json.FLIPKART_ORDER_SYNC);
                
          })
          .catch(error => {
            notify(`${error.message}`, 'warning');
          });
    },[countChange]);

  const saveAutomateJobSetting=()=>{
    let jobs =[
      {name:"AMAZON_ORDER_SYNC",start:amazon_order_sync},
      {name:"FLIPKART_ORDER_SYNC",start:flipkart_order_sync},
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

  const handleFlipkartOrderSyncChange=()=>{
      form.change("flipkart_order_sync",!flipkart_order_sync);
      setFlipkartOrderSync(!flipkart_order_sync);
  }
  const handleAmazonOrderSyncChange=()=>{
     form.change("amazon_order_sync",!amazon_order_sync);
     setAmazonOrderSync(!amazon_order_sync);
  }
  const handleAmazonFlipkartInventorySyncChange=()=>{
      form.change("amazon_flipkart_inventory_sync",!amazon_flipkart_inventory_sync);
      setAmazonFlipkartInventorySync(!amazon_flipkart_inventory_sync);
  }
  return(
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
              <Grid item xs={12} md={4}/>
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
              <Grid item xs={12} md={4}/>
              <Grid item xs={12} md={4}>
               <BooleanInput 
               label="Enable Marketplace Inventory Sync" 
               source="amazon_flipkart_inventory_sync" 
               onChange={handleAmazonFlipkartInventorySyncChange}
               />
               </Grid>
               <Grid item xs={12} md={4}>
                  <TextInput disabled value="10" source="minutes" label="Minutes" />
              </Grid>
            </Grid>
            </CardContent>
            <CardActions>
                <Button variant="contained" color="primary" onClick={saveAutomateJobSetting}>Save</Button>
            </CardActions>
         </Card>
        );

}

export default Settings;