import * as React from 'react';
import {useState} from 'react';
import {useLogin,Loading,useRedirect} from 'react-admin';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';
import MyFooter from './MyFooter'
import { ToastContainer, toast } from 'react-toastify';

const useStyles=makeStyles((theme)=>({
    container:{
        display:'flex',
        minHeight:'100vh',
        flexDirection:'column',
    },
    form_holder:{
        boxSizing:'border-box',
        width:'370px',
        margin:'auto',
        padding:'40px 40px 60px',
        marginTop:'120px',
        display:'flex',
        flexDirection:'column',
        alignItems:'center',
    },
    form_input:{
     marginBottom:'15px'
    },
    form_btn:{
       marginTop:'28px',
       marginBottom:'15px'
    },
}));


const MyLoginPage=function({theme}){
 
    const [username,setUsername]=useState('');
    const [password,setPassword]=useState('');
    const [loading, setLoading] = useState(false);
    const login=useLogin();
    const redirect = useRedirect();
    const classes=useStyles();

    if (loading) return <Loading />;

    const validate_form=()=>{       
        if(password.trim()!=='' && username.trim()!==''){
            return true
        }
        return false;
    }

    const handleSubmit=function(e){
        e.preventDefault();

        if(validate_form()){
            setLoading(true);    
            login({username,password})
            .catch((e)=>{
                setLoading(false);
                toast.error('Access Denied: Invalid User Name or Password');
            })
            .finally(()=>{
                redirect(`/`)
            });
        }else{
            toast.error('Please fill all the required fields correctly');
        }
    }

    return (
        <Container className={classes.container} maxWidth="xs">
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
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <Box p={5} className={classes.form_holder}>
                        <form onSubmit={handleSubmit}>
                            <Typography align="center" component="h1" variant="h4">Tretail</Typography>
                            <TextField
                                className={classes.form_input}
                                onBlur={()=>setUsername(username.trim())}
                                fullWidth value={username}
                                onChange={(e)=>setUsername(e.target.value)}
                                label="Email"
                                type="text"
                            />
                            <TextField 
                                className={classes.form_input}
                                onBlur={()=>setPassword(password.trim())}
                                fullWidth value={password} 
                                onChange={(e)=>setPassword(e.target.value)} 
                                label="Password"
                                type="password"
                            />
                            <Button className={classes.form_btn}
                                fullWidth
                                variant="contained"
                                color="primary"
                                type="submit" 
                                > Login
                            </Button>
                            <Grid container >
                                <Grid item xs >
                                    <Link  href="#/password-reset" underline="hover">Forgot password?</Link>
                                </Grid>
                                <Grid item>
                                    <Link href="#/signup" underline='hover'>Signup</Link>
                                </Grid>
                            </Grid>            
                        </form>        
                    </Box>
                </Grid>
            </Grid>
            <MyFooter/>        
        </Container>        
    );
}

export default MyLoginPage;
