import React,{useState,useRef, useEffect} from 'react';
import {useNotify,Loading, Title,useRedirect, List, Datagrid,Filter,SearchInput, RichTextField, SimpleShowLayout, ArrayField, Show, FileField,PasswordInput,SaveButton,Toolbar,SimpleForm,Create,required,ArrayInput, SimpleFormIterator, DateInput,TextInput,useDataProvider} from 'react-admin'
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import CardActions from '@material-ui/core/CardActions'; 
import TextField from'@material-ui/core/TextField';
import RemoveIcon from '@material-ui/icons/Remove';
import AddIcon from '@material-ui/icons/Add';
import {makeStyles} from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { element } from 'prop-types';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Avatar from '@material-ui/core/Avatar';
import Grid from '@material-ui/core/Grid';



const useStyles=makeStyles((theme)=>({
  root: {
    '& .MuiTextField-root':{
      margin:theme.spacing(0.5),
      width:150
    }
  },

  avatar:{
         width: '100%',
         height: '100%',
         backgroundRepeat: 'none',
         backgroundPosition: 'center',
         backgroundSize: 'cover',
         borderRadius:'3px',
  },

  gridItem: {
       height:'100px',
       padding:'5px',
  },

}))

const ProfilePicturesModal  =  ( props ) => {

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [selectedID, setSelectedID] = useState(null);
  const dataProvider = useDataProvider();
  window.addEventListener("resize",() => setWindowWidth(window.innerWidth));
  const [pictures, setPictures] = useState([]);
  const notify = useNotify();
  const handleClose = () => props.handleOpen(false);
  const classes = useStyles();
  const {role} = props;


  const descriptionElementRef = React.useRef(null);

  React.useEffect(() => {

       dataProvider.getOnly(`settings/profile-pictures`)
       .then(({data})=>{
           setPictures(data);
       }).catch(( e ) => {
           notify(e.message)
       })

  },[])

  React.useEffect(() => {
       if (props.open) {
           const { current: descriptionElement } = descriptionElementRef;
           if (descriptionElement !== null) {
             descriptionElement.focus();
           }
        }
  }, [props.open]);

  const handleProfilePictureSet = () => {
    const data = {
      'profile_picture_id': selectedID,
      'role' :  role
    }
    if(!selectedID){
       notify(`No picture selected`,{type: 'success'})
       return;
    }
    dataProvider.updateOnly(`settings/set-profile-picture`,{
      data
    })
    .then(({data})=>{
        window.location.reload(true);
    }).catch(( e ) => {
        notify(e.message)
    })

  }

  return (
    <div>
      <Dialog
        open={props.open || false}
        onClose={handleClose}
        scroll={'paper'}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
        
      >
        <DialogTitle id="scroll-dialog-title">Select Profile Picture</DialogTitle>
        <DialogContent dividers={true}>
          <DialogContentText
            id="scroll-dialog-description"
            ref={descriptionElementRef}
            tabIndex={-1}
          >
             <Grid 
                  container 
                  className={classes.imageContainer}
                  style={ { width:(windowWidth <= 778? '300px': '500px' ) } } 
             
              >
                  {[...pictures].map((pic) => 
                  (<Grid item xs={6} sm={3} p={1} className={classes.gridItem} onClick={() => setSelectedID(pic.id)}>
                      <div alt="Remy Sharp" style={{backgroundImage:'url("' + pic.src + '")', border:(selectedID == pic.id? '1px solid red': 'none')}} className={classes.avatar}/> 
                   </Grid>)
                  )}
             </Grid>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
              <Button onClick={handleProfilePictureSet} color="primary">
                   Save
              </Button>
              <Button onClick={handleClose} color="primary">
                   Close
              </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}


const ProfileOption=()=>{
   const classes=useStyles()
   const [showPasswordButton,setShowPasswordButton]=useState(true)
   const [loading, setLoading] = useState(false);
   const [passwordResetVisible,setPasswordResetVisible]=useState(false)
   const [showPasswordField,setShowPasswordField]=useState(null);
   const [showMultipleGstButton,setShowMultipleGstButton]=useState(true)
   const [multipleGstVisible,setMultipleGstVisible]=useState(false)
   const [showButton,setShowButton]=useState(true)
   const dataProvider = useDataProvider();
   const [inputFields, setInputFields] = useState([
    { address:"",gstNo:"",state:""}
  ]);
  const [passwordInputField,setPasswordInputField]=useState([{old_password:null,new_password:null,confirm_password:null}])
  const [stateGst,setStateGst]=useState("")
  const [gstDisableCancel, setDisableGstCancel] = useState(false);
  const [clientInfo, setClientInfo] = useState({client:null, user: null});
  const [pictureModal, setPictureModal] = React.useState( { open:false } );

  const notify = useNotify();
  const redirect = useRedirect();

  const handleInput = (event) => {
    setStateGst(event.target.value);
  };
 
   const handlePasswordChange=(e)=>{
       setPasswordResetVisible(true)
       setShowMultipleGstButton(true)
       setMultipleGstVisible(false)
       setShowPasswordButton(false)
       setShowButton(true)
   }

   const handleMultipleGstChange=(e,index)=>{
     setMultipleGstVisible(true)
     setShowPasswordButton(true)
     setPasswordResetVisible(false)
     setShowMultipleGstButton(false)
     setShowButton(true)
     setInputFields([...inputFields,{address:"",gstNo:"",phn_no:"",state:""}])
    //  dataProvider.getOnly('settings/gstadd/show')
    //  .then(({ data }) => {
      
    //  let newData=data.map((gstno)=>{
    //     gstno.gstNo=gstno.gstno;
    //      delete gstno.gstno;
    //      return gstno;
    //   })
    //   setInputFields(newData)
    //      setLoading(false);
    //  })
    //  .catch(error => {
    //      setLoading(false);
    //  })
   }
   useEffect(()=>{

    dataProvider.getOnly('settings/gstadd/show')
    .then(({ data }) => {
        if(Array.isArray(data) && data.length !==0){
          setMultipleGstVisible(true)
          setShowMultipleGstButton(false)
          setDisableGstCancel(true)

        }
        
        let newData=data.map((gstno)=>{
           gstno.gstNo=gstno.gstno;
           delete gstno.gstno;
           return gstno;
        })
        setInputFields(newData)
        setLoading(false);
    })
    .catch(error => {
        setLoading(false);
    })
   },[]);



   useEffect(() => {

      setLoading( true );
      dataProvider.getOnly('settings/client-info').then(({data}) => {
          setClientInfo( data );
          setLoading( false )
      }).catch( error => {
          setLoading( false );
      })

   }, [])

  //  const handleshowMultipleGstButton=(e)=>{
  //    seMultipleGstButton(false)
  //  }
   const handleAfterCancel=(e)=>{
    setShowPasswordButton(true)
    setPasswordResetVisible(false)
    setShowMultipleGstButton(true)
    setMultipleGstVisible(false)
   }
  const handlePasswordChangeInput=(current_password)=>{  
    // console.log(e.target.value)  
   setPasswordInputField({...passwordInputField,...current_password})  
 }
  const handlePasswordSubmit = (e) => {
    setLoading(true);
    dataProvider.updateOnly('settings/change-password',
       {data :  passwordInputField}
    )
        .then(({ data }) => { 
            if(data.status == "success") {
                setLoading(false);
                notify(data.message, 'success');
            }
            else {
                setLoading(false);
                notify(data.message, 'warning');
            }
        })
        .catch(error => {
            setLoading(false);
            let message = error.message  || error;
            notify(message , 'warning');
        })    
}
  const handleGstInputChange=(e,fieldName,index)=>{
    let data=inputFields.map((element,param)=>
      {
          if(param===index){
              element[fieldName]=e.target.value
          } 
          return element 
      }
    )
    setInputFields(data)

  }
  const handleGstSubmit=(e)=>{
    setLoading(true);
      dataProvider.updateOnly('settings/gstadd/create',{data : 
      inputFields
      })
          .then(({ data }) => { 
              if(data.status == "success") {
                      let newData= data.data.map((fetchVariable)=>{
                      fetchVariable.gstNo=fetchVariable.gstno;
                      delete fetchVariable.gstno;
                      return fetchVariable
                   })
                  setInputFields(newData)
                  setLoading(false);
                  notify(data.message, 'success');
                  if(Array.isArray(data.data) && data.data.length ===0){
                    setShowMultipleGstButton(true);
                    setShowButton(false);
                  }
              }
              else {
                  setLoading(false);
                  notify(data.message, 'warning');
              }
          })
          .catch(error => {
               setLoading(false);
               let message = error.message  || error;
               notify(message, 'warning')
          })    
  }
   const handleAddFields=(index)=>{
    setInputFields([...inputFields,{address:"",gstNo:"",phn_no:"",state:""}])
   }
   const handleRemoveFields=(index)=>{
      const value=[...inputFields]
      value.splice(index,1)
      setInputFields(value)

      // if(value.length<=0)
      // {
      //   setShowButton(false)
      //   setShowMultipleGstButton(true)
      // }
    
   }


   const showOption = React.useMemo(()=>{
    return {
        options: [
          {label: 'Andhra pradesh',value:'Andhra_pradesh'},
          {label: 'Andaman and Nicobar_Islands',value:'Andaman_and_Nicobar_Islands'},
          {label: 'Arunachal Pradesh',value:'Arunachal_Pradesh'},
          {label: 'Assam',value:'Assam'},
          {label: 'Bijar',value:'Bijar'},
          {label: 'Chandigarh',value:'Chandigarh'},
          {label: 'Chhattisgarh',value:'Chhattisgarh'},
          {label: 'Dadra and Nagar Haveli & Daman and Diu  ',value:'Dadra_and_Nagar_Haveli and Daman and Diu'},
          // {label: 'Daman and Diu',value:'Daman_and_Diu'},
          {label: 'Delhi',value:'Delhi'},
          {label: 'Lakshadweep',value: 'Lakshadweep'},
          {label: 'Puducherry', value: 'Puducherry'},
          {label: 'Goa',value: 'Goa'},
          {label: 'Gujarat',value: 'Gujarat'},
          {label: 'Haryana', value: 'Haryana'},
          {label: 'Himachal Pradesh',value: 'Himachal_Pradesh'},
          {label: 'Jammu and Kashmir',value: 'Jammu_and_Kashmir'},
          {label: 'Jharkhand',value: 'Jharkhand'},
          {label: 'Andhra pradesh',value: 'Andhra_pradesh'},
          {label: 'Karnataka',value: 'Karnataka'},
          {label: 'Kerala',value: 'Kerala'},
          {label: 'Madhya Pradesh',value: 'Madhya_Pradesh'},
          {label: 'Maharashtra',value: 'Maharashtra'},
          {label: 'Manipur',value: 'Manipur'},
          {label: 'Meghalaya',value: 'Meghalaya'},
          {label: 'Mizoram',value: 'Mizoram'},
          {label: 'Nagaland',value: 'Nagaland'},
          {label: 'Odisha',value: 'Odisha'},
          {label: 'Punjab',value: 'Punjab'},
          {label: 'Rajasthan',value: 'Rajasthan'},
          {label: 'Sikkim',value: 'Sikkim'},
          {label: 'Tamil Nadu',value: 'Tamil_Nadu'},
          {label: 'Telangana',value: 'Telangana'},
          {label: 'Tripura',value: 'Tripura'},
          {label: 'Uttar Pradesh',value: 'Uttar_Pradesh'},
          {label: 'Uttarakhand',value: 'Uttarakhand'},
          {label: 'West Bengal',value: 'West_Bengal'}
        ]
    }
  

})

const MyText  = ({text, type}) => (
  <Typography variant={type} >{ text || '' }</Typography>
)

if (loading) return <Loading />;
//if (error) return <Error />;
  //  function profileChanges(e) {
  // }
  return (
      <Card>
      <Title title="Profile Change" />
      <Card>
      <CardContent>
           <Typography  color="textSecondary" >
           <Typography>Change Profile</Typography>
           <br></br>

      <Box p={1}>
           <Typography variant="h6"> Client </Typography>
           <Button 
               color="primary" 
               variant="contained" 
               onClick={ () => setPictureModal( { open:true, role: 'client'}) }
               >
                 Profile Picture
            </Button>
            
      </Box>
      <Box p={1}>

            <Typography variant="h6"> User </Typography>  
            <Button 
               color="primary" 
               variant="contained" 
               onClick={ () => setPictureModal( { open:true, role: 'user'}) }
            >
                 Profile Picture
            </Button>
            
      </Box>
      <ProfilePicturesModal 
               open={false || pictureModal.open } 
               handleOpen={(open) => setPictureModal( { open: open }) }
               role = {pictureModal.role}
       />

      <Typography variant="h6"> Settings </Typography>
      {showPasswordButton && <div>
          <CardActions>
                <Button variant="contained" id="passwordButton" color="primary" onClick={handlePasswordChange}>Change Password</Button> 
          </CardActions>
      </div>}

      { passwordResetVisible && <div>
        <form onSubmit={handlePasswordSubmit}>
          { passwordInputField &&
        <div>
        <Box mx={3}>
        <TextField   name="old_password" label="Old Password" value={passwordInputField.old_password} onChange={e => handlePasswordChangeInput({old_password:e.target.value})}/>
        </Box>
        <Box my={2} mx={3}>
        <TextField   name="new_password"  label="New Password" value={passwordInputField.new_password} onChange={e => handlePasswordChangeInput({new_password:e.target.value})}/>
        </Box>
        <Box my={2} mx={3}>
        <TextField   name="confirm_password" label="Confirm Password" value={passwordInputField.confirm_password} onChange={e => handlePasswordChangeInput({confirm_password:e.target.value})}/>
        </Box> 
        {showButton &&
        <Box mx={7}>
        <Button style={{marginRight:'10px'}} variant="contained" color="primary"
        onClick={handlePasswordSubmit} >Submit</Button> 
        <Button color="secondary" variant="contained" onClick={handleAfterCancel} >Cancel</Button>
        </Box>
         }
        </div>
        }
        <br></br>
        </form>
        </div>}
        
        {showMultipleGstButton && <div>
        <CardActions>
           <Button variant="contained"  color="primary" onClick={handleMultipleGstChange}>GST Add</Button> 
        </CardActions>
        </div>}
        { multipleGstVisible && <div>
          <form className={classes.root} onSubmit={handleGstSubmit}>
            {inputFields.map((inputField,index)=>(
            <div key={index} style={{marginLeft:'20px'}}>
            <TextField
                  name="address"
                  label="Address"
                  variant="filled"
                  value={"" || inputField.address}
                  onChange={(e)=>handleGstInputChange(e,"address",index)}
                  />
            <TextField
                  name="gstNo"
                  label="GST No"
                  variant="filled"
                  value={"" || inputField.gstNo}
                  onChange={(e)=>handleGstInputChange(e,"gstNo",index)}
                  />
             <TextField
                  name="phn_no"
                  label="Phone No"
                  variant="filled"
                  value={"" || inputField.phn_no}
                  onChange={(e)=>handleGstInputChange(e,"phn_no",index)}
                  />      
                 <FormControl variant="filled" style={{minWidth: 150,paddingTop:5}} sx={{ m:1}}>
        <InputLabel id="demo-simple-select-filled-label">State</InputLabel>
        <Select
          labelId="demo-simple-select-filled-label"
          id="demo-simple-select-filled"
          name="state"
          label="State"
          value={"" || inputField.state}
          onClick={handleInput}
          onChange={(e)=>handleGstInputChange(e,"state",index)}
        > 
           {showOption.options.map((option)=>(
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
           ))}
        </Select>
      </FormControl>
                  <IconButton onClick={()=>{handleRemoveFields(index)}}>
                    <RemoveIcon/>
                  </IconButton>
                  {(inputFields.length===index+1)&&
                   <IconButton onClick={()=>handleAddFields(index)}>
                    <AddIcon/>
                   </IconButton>}
              </div> 
            ))}
          </form>
          {showButton &&
          <Box ml={52}  py={2}>
        <Button style={{marginRight:'10px'}} variant="contained" color="primary" onClick={handleGstSubmit} >Submit</Button> 
        {/* { (gstDisableCancel === false) &&
          <Button color="secondary" variant="contained" onClick={handleAfterCancel} >Cancel</Button>
         } */}
          <Button color="secondary" variant="contained" onClick={handleAfterCancel} >Cancel</Button>
        </Box>
       }
        </div>}
        </Typography>
        <div>
               <Typography variant="h6"> Client </Typography>  
               <p>     
                  <MyText type={'overline'} text={'Name'} />  : 
                  <MyText type='caption' text={( clientInfo.client? clientInfo.client.name: '' ) || ''}/>
              </p>
              <p>
                  <MyText type={'overline'} text={'Email'} />  : 
                  <MyText type='caption' text={( clientInfo.client? clientInfo.client.email: '' ) || ''}/>
              </p>
              <p>
                  <MyText type={'overline'} text={'Phone'} />  : 
                  <MyText type='caption' text={( clientInfo.client? clientInfo.client.phone: '' ) || ''}/>
              </p>
              <p>
                  <MyText type={'overline'} text={'Address'} />  : 
                  <MyText type='caption' text={( clientInfo.client? clientInfo.client.address: '' ) || ''}/>
              </p>
              
        </div>
        <div>
              <Typography variant="h6"> User </Typography>
              <p>     
                  <MyText type={'overline'} text={'Name'} />  : 
                  <MyText type='caption' text={( clientInfo.user? clientInfo.user.name: '' ) || ''}/>
              </p>
              <p>
                  <MyText type={'overline'} text={'Email'} />  : 
                  <MyText type='caption' text={( clientInfo.user? clientInfo.user.email: '' ) || ''}/>
              </p>
              
        </div>
        <div>
             <Button color="primary" onClick={() => redirect('/profile-update') } >Edit</Button>
        </div>
       </CardContent>
  </Card>
  </Card>
  );
};

export default ProfileOption;