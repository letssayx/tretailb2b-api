import * as React from 'react';
import { useEffect } from 'react';
import { useDataProvider, Loading, Error,useNotify } from 'react-admin';
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


function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
    {'Copyright © '}
    <Link color="inherit" >
      Tretail
    </Link>{' '}
    {new Date().getFullYear()}
    {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
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

const Registration = () => {
  const GOOGLE_RECAPTCHA_SITE_KEY = process.env.REACT_APP_GOOGLE_RECAPTCHA_SITE_KEY;
  const [google_recaptcha_token, setGoogleRecaptchaToken] = useState("");
  const notify = useNotify();
  const dataProvider = useDataProvider();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState();
  const [official_name, setOfficialName] = useState('');
  const [official_address, setOfficialAddress] = useState('');
  const [official_phone, setOfficialPhone] = useState('');
  const [official_email, setOfficialEmail] = useState('');
  const [state, setState] = useState('');
  const [gstin, setGstin] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const classes = useStyles();
  const reCaptcha = useRef();

  if (loading) return <Loading />;
  //if (error) return <Error />;

  const validate_form = () => {
    if(official_name.trim()=='') {
      return false;
    }
    // if(official_address.trim()=='') {
    //   return false;
    // }
    // if(official_phone.trim()=='') {
    //   return false;
    // }
    // if(official_email.trim()=='') {
    //   return false;
    // }
    // if(state.trim()=='') {
    //   return false;
    // }
    // if(gstin.trim()=='') {
    //   return false;
    // }
    if(name.trim()=='') {
      return false;
    }
    if(email.trim()=='') {
      return false;
    }
    if(password.trim()=='') {
      return false;
    }
    if(google_recaptcha_token.trim()=='') {
      return false;
    }
    return true;
  }

  const handleSubmit = () => {
    if(validate_form()) {
      // Prepare Data to push 
      setLoading(true);
      dataProvider.updateOnly('signup',{data : { 
        official_name: official_name,
        // official_address: official_address,
        // official_phone: official_phone,
        // official_email: official_email,
        // state: state,
        // gstin: gstin,
        name: name,
        email: email,
        password: password,
        google_recaptcha_token: google_recaptcha_token,
    }})
    .then(({ data }) => { 
      if(data.status == "success") {
        setLoading(false);
        toast.success(data.message);
      } else {
        setLoading(false);
        toast.error(data.message);
      }
    })
    .catch(error => {
      setLoading(false);
      toast.error(error);
      // toast.error('Invalid Request');
      })
    } else {
      toast.error('Please fill the required field correctly');
    }
  }

  return (
    <Container component="main" maxWidth="xs">
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
        <Typography component="h1" variant="h5">Sign up</Typography>
        <div className={classes.form} >
          <Grid container spacing={2}>
            <Grid item xs={12} >
              <TextField
                autoComplete="name"
                name="official_name"
                variant="outlined"
                required
                fullWidth
                id="official_name"
                label="Trade Name / Company Name"
                autoFocus
                onChange={event => setOfficialName(event.target.value)}
              />
            </Grid>

            {/* <Grid item xs={12} >
              <TextField
                variant="outlined"
                required
                fullWidth
                id="official_address"
                label="Official Address"
                name="official_address"
                autoComplete="address"
                onChange={event => setOfficialAddress(event.target.value)}
              />
            </Grid> */}

            {/* <Grid item xs={12} >
              <TextField
                variant="outlined"
                required
                fullWidth
                id="official_phone"
                label="Official Phone Number"
                name="official_phone"
                autoComplete="phone"
                onChange={event => setOfficialPhone(event.target.value)}
              />
            </Grid> */}

            {/* <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="official_email"
                label="Official Email / Store Email"
                name="official_email"
                autoComplete="email"
                onChange={event => setOfficialEmail(event.target.value)}
              />
            </Grid> */}

            {/* <Grid item xs={12} >
              <TextField
                variant="outlined"
                label="State(GST)"
                id="state"
                required
                fullWidth
                name="state"
                select
                onChange={event => setState(event.target.value)}
              >
                <MenuItem value="Andhra Pradesh">Andhra Pradesh</MenuItem>
                <MenuItem value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</MenuItem>
                <MenuItem value="Arunachal Pradesh">Arunachal Pradesh</MenuItem>
                <MenuItem value="Assam">Assam</MenuItem>
                <MenuItem value="Bihar">Bihar</MenuItem>
                <MenuItem value="Chandigarh">Chandigarh</MenuItem>
                <MenuItem value="Chhattisgarh">Chhattisgarh</MenuItem>
                <MenuItem value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli & Daman and Diu</MenuItem>
                <MenuItem value="Delhi">Delhi</MenuItem>
                <MenuItem value="Lakshadweep">Lakshadweep</MenuItem>
                <MenuItem value="Puducherry">Puducherry</MenuItem>
                <MenuItem value="Goa">Goa</MenuItem>
                <MenuItem value="Gujarat">Gujarat</MenuItem>
                <MenuItem value="Haryana">Haryana</MenuItem>
                <MenuItem value="Himachal Pradesh">Himachal Pradesh</MenuItem>
                <MenuItem value="Jammu and Kashmir">Jammu and Kashmir</MenuItem>
                <MenuItem value="Jharkhand">Jharkhand</MenuItem>
                <MenuItem value="Karnataka">Karnataka</MenuItem>
                <MenuItem value="Kerala">Kerala</MenuItem>
                <MenuItem value="Madhya Pradesh">Madhya Pradesh</MenuItem>
                <MenuItem value="Maharashtra">Maharashtra</MenuItem>
                <MenuItem value="Manipur">Manipur</MenuItem>
                <MenuItem value="Meghalaya">Meghalaya</MenuItem>
                <MenuItem value="Mizoram">Mizoram</MenuItem>
                <MenuItem value="Nagaland">Nagaland</MenuItem>
                <MenuItem value="Odisha">Odisha</MenuItem>
                <MenuItem value="Punjab">Punjab</MenuItem>
                <MenuItem value="Rajasthan">Rajasthan</MenuItem>
                <MenuItem value="Sikkim">Sikkim</MenuItem>
                <MenuItem value="Tamil Nadu">Tamil Nadu</MenuItem>
                <MenuItem value="Telangana">Telangana</MenuItem>
                <MenuItem value="Tripura">Tripura</MenuItem>
                <MenuItem value="Uttar Pradesh">Uttar Pradesh</MenuItem>
                <MenuItem value="Uttarakhand">Uttarakhand</MenuItem>
                <MenuItem value="West Bengal">West Bengal</MenuItem>
              </TextField>
            </Grid> */}

            {/* <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="gstin"
                label="GSTIN"
                name="gstin"
                autoComplete="GSTIN"
                onChange={event => setGstin(event.target.value)}
              />
            </Grid> */}

            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="name"
                label="Full Name"
                name="name"
                autoComplete="name"
                onChange={event => setName(event.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                onChange={event => setEmail(event.target.value)}
              />
            </Grid>

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

            <Grid item xs={12}>
              <FormControlLabel
                control={<Checkbox value="allowExtraEmails" color="primary" />}
                label="I want to receive inspiration, marketing promotions and updates via email."
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
            Sign Up
          </Button>

          <Grid container justify="flex-end">
            <Grid item>
              <Link href="#/login" variant="body2">
                Already have an account? Sign in.
              </Link>
            </Grid>
          </Grid>
        </div>
      </div>
      <Box mt={5}>
        <Copyright />
      </Box>
    </Container>
  );
};

export default Registration;
