import React, { useState, useEffect } from 'react';
import { useDataProvider, Loading, Error,useNotify,useRedirect } from 'react-admin';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Title } from 'react-admin';
import { makeStyles } from '@material-ui/core/styles';
import { parse } from 'query-string';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import VerifiedUserIcon from '@material-ui/icons/VerifiedUser';
import NotInterestedIcon from '@material-ui/icons/NotInterested';


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
    const redirect = useRedirect();

    // useEffect(() => {
    //     dataProvider.getOnly('settings')
    //         .then(({ data }) => {
    //           //console.log(data.amazon_integration);
    //             if(data.amazon_integration=='1') {
    //               setAmazonIntegration(true);
    //             }
    //             else {
    //               setAmazonIntegration(false);
    //             }
    //             if(data.amazon_seller_id) {
    //               setAmazonSellerId(data.amazon_seller_id);
    //             }
    //             if(data.amazon_marketplace_id) {
    //               setamazonMarketplaceId(data.amazon_marketplace_id);
    //             }
    //             if(data.amazon_auth_token) {
    //               setAmazonAuthToken(data.amazon_auth_token);
    //             }
    //             if(data.amazon_verified=='1') {
    //               setAmazonVerified(true);
    //             }
    //             else {
    //               setAmazonVerified(false);
    //             }
    //             setLoading(false);
    //         })
    //         .catch(error => {
    //             setError(error);
    //             setLoading(false);
    //         })
    // }, []);
        // Read the post_id from the location which is injected by React Router and passed to our component
    const { state: state_string } = parse(props.location.search);
  
    // ra-data-fakerest uses integers as identifiers, we need to parse the querystring
    const state = state_string ? state_string : '';
    if(state=="fuzon_initilize") {
      // Successfully call back from amazon 
      // gather few more details to call api to update 
      const { spapi_oauth_code: spapi_oauth_code_string } = parse(props.location.search);
      const spapi_oauth_code = spapi_oauth_code_string ? spapi_oauth_code_string : '';
      const { selling_partner_id: selling_partner_id_string } = parse(props.location.search);
      const selling_partner_id = selling_partner_id_string ? selling_partner_id_string : '';
      if(spapi_oauth_code !='' && selling_partner_id!='') {
        useEffect(() => {
          dataProvider.updateOnly('amazon_oauth_update',{data : {spapi_oauth_code: spapi_oauth_code,selling_partner_id:selling_partner_id}})
              .then(({ data }) => {
                //console.log(data.amazon_integration);
                  if(data.amazon_sp_integration=='1') {
                    setAmazonSpIntegration(true);
                  }
                  else {
                    setAmazonSpIntegration(false);
                  }
                  if(data.amazon_sp_seller_id) {
                    setAmazonSpSellerId(data.amazon_sp_seller_id);
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
                  if(data.amazon_sp_verified=='1') {
                    setAmazonSpVerified(true);
                  }
                  else {
                    setAmazonSpVerified(false);
                  }
                  setLoading(false);
              })
              .catch(error => {
                  setError(error);
                  setLoading(false);
              })
      }, []);
      }
      else {
        setLoading(false);
        notify(`Wrong Page`, 'warning');
        redirect('/settings');
      }
    }
    else {
      useEffect(() => {
        dataProvider.getOnly('settings')
            .then(({ data }) => {
              //console.log(data.amazon_integration);
                if(data.amazon_sp_integration=='1') {
                  setAmazonSpIntegration(true);
                }
                else {
                  setAmazonSpIntegration(false);
                }
                if(data.amazon_sp_seller_id) {
                  setAmazonSpSellerId(data.amazon_sp_seller_id);
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
                if(data.amazon_sp_verified=='1') {
                  setAmazonSpVerified(true);
                }
                else {
                  setAmazonSpVerified(false);
                }
                setLoading(false);
            })
            .catch(error => {
                setError(error);
                setLoading(false);
            })
    }, []);
    }


    if (loading) return <Loading />;
    if (error) return <Error />;

     //On the change event for the select box pass the selected value back to the parent
     const handleChange = () =>
     {
      // prepare data to push & validation 
        setLoading(true);
        dataProvider.updateOnly('settings',{data : {settings : { 
          amazon_sp_integration: amazon_sp_integration,
        }}})
            .then(({ data }) => { 
                if(data.status == "success") {
                    setLoading(false);
                    if(data.amazon_sp_verified) {
                      setAmazonSpVerified(true);
                    }
                    else {
                      setAmazonSpVerified(false);
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

    return (
    //     <Card>
    //     <Title title="Store Settings" />
    //     <Card>
    //     <CardContent>
    //     <Typography  color="textSecondary" gutterBottom>
    //       Amazon Integration {amazon_verified ? <VerifiedUserIcon fontSize="large"  /> : <NotInterestedIcon fontSize="large"  /> }
    //     </Typography>
    //     <Typography  color="textSecondary">
    //     <div><Switch id="amazon_integration" onChange={event => setAmazonIntegration(event.target.checked)} checked={amazon_integration}  /> Enable Integration</div>
    //     <div><TextField id="amazon_seller_id" onChange={event => setAmazonSellerId(event.target.value)} label="Amazon Seller ID" value={amazon_seller_id} /></div>
    //     <div><TextField id="amazon_marketplace_id" onChange={event => setamazonMarketplaceId(event.target.value)} label="Marketplace ID" value={amazon_marketplace_id}  /></div>
    //     <div><TextField id="amazon_auth_token"  onChange={event => setAmazonAuthToken(event.target.value)} label="Amazon Marketplace Token" value={amazon_auth_token}  /></div>
    //     </Typography>
    //     </CardContent>
    //   <CardActions>
    //     <Button variant="contained" color="primary" onClick={handleChange}>Update</Button> 
    //     <Button variant="contained" color="primary" onClick={handleAmazonSync}>Import Products</Button> 
    //   </CardActions>
    // </Card>
   //</Card>
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
        </CardContent>
        {amazon_sp_verified ? <CardActions>
        <Button variant="contained" color="primary" onClick={handleChange}>Update</Button> 
        <Button variant="contained" color="primary" onClick={handleAmazonSync}>Import Products</Button> 
      </CardActions> : "" }
      
    </Card>
    </Card>
    )
};

export default Settings;