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
import HourglassFullOutlinedIcon from '@material-ui/icons/HourglassFullOutlined';
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


const ThankYouVerifyShop = (props) => {
  
    const classes = useStyles();
    
    return (
      
        <Container className={classes.container} component="main" maxWidth="xs">
          <CssBaseline />
          <div className={classes.paper}>
            <Avatar className={classes.avatar}>
              <HourglassFullOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
             Thank You 
            </Typography>
            <div className={classes.form} >    
            <h4>Your Email verification successfull done. We will contact with you soon. You can contact with us support@tretailb2b.com</h4>
            </div>
          </div>
          <MyFooter/>
        </Container>
      );
};

export default ThankYouVerifyShop;
