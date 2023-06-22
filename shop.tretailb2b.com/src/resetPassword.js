import React,{useState} from 'react';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import MyFooter from './MyFooter'
import { fetchUtils ,Loading} from 'react-admin';
import { stringify } from 'query-string';
import { ToastContainer, toast } from 'react-toastify';

const apiUrl = process.env.REACT_APP_API_ENDPOINT;
const httpClient = (url, options = {}) => {
    if (!options.headers) {
        options.headers = new Headers({ Accept: 'application/json',  'x-access-token': localStorage.getItem('access_token'), 'x-default-client-id': localStorage.getItem('default_client_id') });
    }
    //const token = localStorage.getItem('token');
    //options.headers.set('Authorization', `Bearer ${token}`);
    options.credentials = 'include';
    
    return fetchUtils.fetchJson(url, options);
  };

const useStyles = makeStyles((theme) => ({
  container:{
      display:'flex',
      minHeight:'100vh',
      flexDirection:'column',
    },
    paper: {
      marginTop: theme.spacing(8),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
    avatar: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.secondary.main,
    },
    form: {
      width: '100%', // Fix IE 11 issue.
      marginTop: theme.spacing(3),
    },
    submit: {
      margin: theme.spacing(3, 0, 2),
    },
  }));


const ResetPassword = (props)=>{
   
    const classes = useStyles();
    const [email,setEmail]=useState(null);
    const [loading, setLoading] = useState(false);
    
    const handleSubmit=(e)=>{
      e.preventDefault();
      setLoading(true);
      const data={email:email}
      httpClient(`${apiUrl}/forgot-password/send-link`,{
        method:'POST',
        body:JSON.stringify(data)
      })
      .then((response)=>JSON.parse(response.body))
      .then((response)=>{
         setLoading(false)
         if(response.status=='fail'){
            toast.error(response.message);
         }else if(response.status=='success'){
            toast.success(response.message);
         }
      })
      .catch((response)=>setLoading(false))
    }
    const handleChange=(e)=>{
       setEmail(e.target.value);
    }
    if (loading) return <Loading />;

    return(
        <Container className={classes.container} component="main" maxWidth="xs">
          <ToastContainer
                position="bottom-center"
                autoClose={5000}
                hideProgressBar
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                limit={1}
          /> 
          <CssBaseline />
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Reset Your Password
            </Typography>
            
            <div className={classes.form} >
              <Grid container spacing={2}>
              <Grid item xs={12}>
              
            <Box m={1}></Box>

                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    name="email"
                    label="Email"
                    type="email"
                    onChange={handleChange}
                    initialValue={email}
                  />
                </Grid>
               
              </Grid>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={handleSubmit}              
              >
               Send Email
              </Button>              
              </div>
              </div>
            <MyFooter/>      
        </Container>      
     
    );
};

export default ResetPassword;