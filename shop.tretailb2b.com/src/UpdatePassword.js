import React,{useState} from 'react';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import MyFooter from './MyFooter'
import { fetchUtils,Loading } from 'react-admin';
import { stringify } from 'query-string';
import {useParams,useLocation,Redirect} from 'react-router-dom';
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


const UpdatePassword = (props)=>{
   
    const classes = useStyles();
    const [password,setPassword]=useState(null);
    const [password_confirmation,setPasswordConfirm]=useState(null);
    const [redirect,setRedirect]=useState(false);

    const {token}=useParams();
    const [loading, setLoading] = useState(false);
    let   email = useQuery().get('email');
    function useQuery() {
        return new URLSearchParams(useLocation().search);
    }
    const handleSubmit=(e)=>{
        e.preventDefault();
        setLoading(true)
        const data={password_confirmation,password,email,token}
        httpClient(`${apiUrl}/forgot-password/reset-password`,{
          method:'POST',
          body:JSON.stringify(data)
        })
        .then((response)=>JSON.parse(response.body))
        .then((response)=>{
           if(response.status=='fail'){
             toast.error(response.message);
           }else if(response.status=='success'){
             toast.success(response.message);
             setTimeout(()=>setRedirect(true),1000)
           }
           setLoading(false)
        })
        .catch((response)=>setLoading(true))
    }
    if (loading) return <Loading />;
    if (redirect) {
        return <Redirect to='/login'/>;
    }
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
              New Password
            </Typography>
            <div className={classes.form} >
              <Grid container spacing={2}>
              <Grid item xs={12}>
            <Box m={1}></Box>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    onChange={(e)=>setPassword(e.target.value)}
                  />
                  <Box mt={3}></Box>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    name="password_confirmation"
                    label="Confirm Password"
                    type="password"
                    onChange={(e)=>setPasswordConfirm(e.target.value)}
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
               Save
              </Button>              
              </div>
              </div>
            <MyFooter/>      
        </Container>      
     
    );
};

export default UpdatePassword;