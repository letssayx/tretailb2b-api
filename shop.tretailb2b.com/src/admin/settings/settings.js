import React,{useState, useEffect} from 'react';
import { Title, useDataProvider, useNotify, useRedirect} from 'react-admin';
import { Grid, Box, TextInput} from '@material-ui/core';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';



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


const AdminSetting = () => {
    const classes = useStyles();
    const [inputs, setInputs ] = useState({});
    const [errors, setErrors ] = useState({});
    const dataProvider = useDataProvider();
    const notify = useNotify();
    const redirect = useRedirect();

    const handleClick = ( e ) => {
        if(isValidationFail()){
            return;
        }

        const data = {
          interval: inputs.interval_set_job_interval 
        }

        dataProvider.updateOnly(`admin/settings/interval-sync-set-job`, { data } )
        .then(({data}) => {
              if(data && data !== {} && data.status == 'success'){
                     if(data.message){
                        notify( data.message , { type: `success` });
                     }
              }
         })
        
    }

    const isValidationFail = () => {
        let error_obj = { ...errors };

        if(!inputs.interval_set_job_interval){
            
            error_obj['interval_set_job_interval'] = "Required";
            setErrors(error_obj);
            return true;

        }else if(typeof inputs.interval_set_job_interval === 'string'){
            let num = Number(inputs.interval_set_job_interval);
            if( Number.isInteger( num ) && num > 0){

            }else{

                error_obj['interval_set_job_interval'] = "Should be a positive number";
                setErrors(error_obj);
                return true

            }
        }
        
        setErrors({});
        return false;

    }

    useEffect(() => {
         dataProvider.getOnly(`admin/settings/interval-sync-set-job`)
         .then(({data}) => {
              let oldInputs =  { ...inputs };
              if(data && data !== {}){
                   oldInputs['interval_set_job_interval'] = parseInt(data.interval) / ( 60 * 60 * 1000 );
                   setInputs(oldInputs);
              }
         })
    },[])


    return (
      <Grid container>
      <Grid xs={12}>
      <Card className={classes.root}>
        <CardContent>
          <Typography variant="h6" color="textSecondary" gutterBottom>
              Sync Interval Set Job
          </Typography>
          <Box p={2}>
              <TextField id="standard-basic" name="interval_set_job_interval" label="Per Hours" variant="filled" helperText={ errors.interval_set_job_interval || ''} onChange={ (e) => setInputs({ [e.target.name] : e.target.value }) } value={inputs.interval_set_job_interval || ''}/>
          </Box>
        </CardContent>
        <CardActions>
            <Button onClick={handleClick} variant="contained" color="primary" > Submit </Button>
        </CardActions>
      </Card>
      </Grid>
      <Grid xs={12}>
        <Box my={2}>
           <Card>
               <CardContent>
                   <Button onClick={()=> redirect('/admin/profile-pictures')} color="primary" variant="contained">Profile Pictures</Button>
               </CardContent>
           </Card>
         </Box>
      </Grid>
      </Grid>
    );
}
export default AdminSetting;