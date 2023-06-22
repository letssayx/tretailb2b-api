import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import { useDataProvider, Loading, useNotify} from 'react-admin'


const useStyles = makeStyles({
    root: {
      minWidth: 275,
    },
    bullet: {
      display: 'inline-block',
      margin: '0 2px',
      transform: 'scale(0.8)',
    },
    title: {
      fontSize: 14,
    },
    pos: {
      marginBottom: 12,
    },
});


export default function OutlinedCard() {
    const classes = useStyles();
    const [ client_name,  setClientName] = useState( null );
    const [ client_email, setClientEmail] = useState( null );
    const [ client_phone, setClientPhone] = useState( null );
    const [ client_address, setClientAddress] = useState( null );
    const [ user_name, setUserName ] = useState( null );
    const [ user_email, setUserEmail ] = useState( null );
    const [loading, setLoading ] = useState(null);
    const  dataProvider = useDataProvider();
    const  notify = useNotify();


    useEffect(() => {

        setLoading( true );
        dataProvider.getOnly('settings/client-info').then(({data}) => {

            setClientEmail( data.client.email );
            setClientName( data.client.name );
            setClientPhone( data.client.phone );
            setClientAddress( data.client.address);
            setUserName( data.user.name );
            setUserEmail( data.user.email );
            setLoading( false );

        }).catch( error => {
            setLoading( false );
        })
  
     }, []);


     const handleSaveChange = ( ) => {

        const params = {
            data:{
                client_name ,
                client_email ,
                client_phone ,
                client_address ,
                user_name ,
                user_email ,
            }
        }
        setLoading( true );
        dataProvider.updateOnly(`settings/client-info`, params)
        .then(({data}) => {
            setClientEmail( data.data.client_email );
            setClientName( data.data.client_name );
            setClientPhone( data.data.client_phone );
            setClientAddress( data.data.client_address);
            setUserName( data.data.user_name );
            setUserEmail( data.data.user_email );
            setLoading( false );
            notify(data.message, 'success');

        }).catch( error => {
            setLoading( false );
            let message = error.message  || error;
            notify(message, 'warning');
        })

     }


     if(loading){
         return <Loading/>
     }

  
    return (
      <Card className={classes.root} variant="outlined">
        <CardContent>

        <Grid container className={classes.root} spacing={2}>
               <Grid item xs={12}>
                    <Typography variant="h6" > Client </Typography>
              </Grid>
              <Grid item xs={4}>
                  <Box mb={2}>
                      <TextField  name="client_name"  label="Name"  variant="filled" value={'' || client_name } onChange={ (e) => setClientName( e.target.value )}/>
                  </Box>
              </Grid>
              <Grid item xs={4}>
                  <Box mb={2}>
                      <TextField   name="client_email"  label="Email"  variant="filled" value={'' || client_email } onChange={ (e) => setClientEmail( e.target.value ) }/>
                  </Box>
              </Grid>
              <Grid item xs={4}/>
              <Grid item xs={4}>
                  <Box mb={2}>
                       <TextField   name="client_phone"  label="Phone"  variant="filled" value={'' || client_phone } onChange={ (e) => setClientPhone( e.target.value ) }/>
                  </Box>
              </Grid>
              <Grid item xs={4}>
                  <Box mb={2}>
                      <TextField    name="client_address"  label="Address"  variant="filled" value={'' || client_address } onChange={ (e) => setClientAddress( e.target.value )}/>
                  </Box>
              </Grid>
              <Grid item xs={12}>
                    <Typography variant="h6" > User </Typography>
              </Grid>
              <Grid item xs={4}>
                  <Box mb={2}>
                      <TextField   name="user_name"  label="Name"  variant="filled" value={'' || user_name }  onChange={ (e) => setUserName( e.target.value )} />
                  </Box>
              </Grid>
              <Grid item xs={4}>
                  <Box mb={2}>
                      <TextField   name="user_email"  label="Email"  variant="filled" value={'' || user_email } onChange={ (e) => setUserEmail( e.target.value ) } />
                  </Box>
              </Grid>
        </Grid>
        </CardContent>
        <CardActions>
          <Button variant="contained" color="primary" onClick={handleSaveChange} > Save </Button>
        </CardActions>
      </Card>
    );
  }