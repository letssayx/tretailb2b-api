import * as React from 'react';
import { useEffect } from 'react';
import { useDataProvider, Loading, Error,useNotify ,useRedirect} from 'react-admin';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Title } from 'react-admin';
import { useState,useRef  } from 'react';
import ReCAPTCHA from "react-google-recaptcha";
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import InputLabel from '@material-ui/core/InputLabel';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { parse } from 'query-string';
import MyFooter from './MyFooter'
  
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

const VerifyUser = (props) => {
    const GOOGLE_RECAPTCHA_SITE_KEY = process.env.REACT_APP_GOOGLE_RECAPTCHA_SITE_KEY;
    const [google_recaptcha_token, setGoogleRecaptchaToken] = useState("");
    const notify = useNotify();
    const dataProvider = useDataProvider();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState();
    const redirect = useRedirect();
    const [password, setPassword] = useState('');
    


    const classes = useStyles();
    const reCaptcha = useRef();

    if (loading) return <Loading />;
    //if (error) return <Error />;
    
    const validate_form = () => {
      if(google_recaptcha_token.trim()=='') {
        return false;
      }
      if(password.trim()=='') {
        return false;
      }
      return true;
    }
    const { token: token_string } = parse(props.location.search);
    //console.log(token_string);
    const handleSubmit = () =>
    {
      if(validate_form()) {
        // prepare data to push 
        setLoading(true);
        dataProvider.updateOnly('verify',{data : { 
          verification_token:token_string,
          google_recaptcha_token: google_recaptcha_token,
          password: password,
        }})
            .then(({ data }) => { 
                if(data.status == "success") {
                    setLoading(false);
                    toast.success(data.message);
                    redirect('/thank-you-user-verification');
                }
                else {
                    setLoading(false);
                    toast.error(data.message);
                }
            })
            .catch(error => {
                setLoading(false);
                toast.error('Invalid Request');
            })
      }
      else {
        toast.error('Please fill the required field correctly');
      }
      
      }
    return (
      
        <Container className={classes.container} component="main" maxWidth="xs">
          <CssBaseline />
          <ToastContainer
                position="top-center"
                autoClose={5000}
                hideProgressBar
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
          />
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
              Verification
            </Typography>
            <div className={classes.form} >
              <Grid container spacing={2}>
              <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    required
                    fullWidth
                    name="password"
                    label="Password"
                    type="password"
                    id="password"
                    autoComplete="current-password"
                    onChange={event => setPassword(event.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                <ReCAPTCHA
                  ref={reCaptcha}
                  sitekey={GOOGLE_RECAPTCHA_SITE_KEY}
                  onChange={google_recaptcha_token => setGoogleRecaptchaToken(google_recaptcha_token)}
                  onExpired={e => setGoogleRecaptchaToken("")}
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
                Verify
              </Button>
              
            </div>
          </div>
          <MyFooter/>
        </Container>
      );
};

export default VerifyUser;
