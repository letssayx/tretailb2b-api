import React from 'react';
import { Link } from 'react-router-dom';
import {required, minLength, maxLength, minValue, maxValue, number, regex, email, choices,BooleanField} from 'react-admin';
import { Filter,SearchInput,Create, Edit, List,SelectInput,Show,BooleanInput, SimpleForm, TextInput, DateInput,DeleteButton, ReferenceManyField, Datagrid, TextField, DateField, EditButton,SaveButton,Toolbar} from 'react-admin';
import Button from '@material-ui/core/Button';
import ChatBubbleIcon from '@material-ui/icons/ChatBubble';
import { withStyles } from '@material-ui/core/styles';
import { useDataProvider, Loading, Error,useNotify } from 'react-admin';
import CancelButton from '../../settings/CancelButton';
import { makeStyles } from '@material-ui/core/styles';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState,useRef  } from 'react';

const useStyles = makeStyles({
    toolbar: {
        display: 'flex',
    },
  
  });
  

 

  const RequestFilter = props => (
    <Filter {...props}>
        <SearchInput source="q" alwaysOn />
    </Filter>
  );
  
  const CustomToolbar = props => (
    <Toolbar {...props} classes={useStyles()}>
        <SaveButton style={{marginRight:'10px'}} />
        <CancelButton />
    </Toolbar>
  );
  



export const RequestShow = (props) => {
  const [loading, setLoading] = useState(false);
  if (loading) return <Loading />;
  const CustomToolbarEdit = props => (
    <Toolbar {...props} classes={useStyles()}>  
        <ApproveButton />
        <CancelButton />
        <DeleteButton />
    </Toolbar>
  );
  const ApproveButton = ({ record }) => {
    
    const dataProvider = useDataProvider();
      const approve = () => {
        console.log(record.id);
        setLoading(true);
          dataProvider.updateOnly('admin/requests',{data : { 
            request_id: record.id,
            action: 'accepted'
          }})
              .then(({ data }) => { 
                  if(data.status == "success") {
                      setLoading(false);
                      toast.success(data.message);
                  }
                  else {
                      setLoading(false);
                      toast.error(data.message);
                  }
              })
              .catch(error => {
                  setLoading(false);
                  toast.error(error);
              })
      }
      
      return <Button onClick={approve} style={{marginRight:'10px'}} variant="contained" color="primary">Approve</Button>;
    };
  return (
    <Show {...props}>
         <SimpleForm
         toolbar={<CustomToolbarEdit />}
         >
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
          
            {/* <TextField label="Id" source="id" /> */}
            <TextField source="official_name"  label="Trade name / Company"/>
            <TextField source="official_address"  label="Official Address"/>
            <TextField source="official_phone"  label="Official Phone"/>
            <TextField source="official_email"  label="Official Email"/>
            <TextField source="name"  label="Name"/>
            <TextField source="email"  label="Primary Login / Email"/>
            <TextField source="state"  label="State"/>
            <TextField source="gstin"  label="GSTIN"/>
            <TextField source="email_verified_at"  label="Email verified at"/>
            <TextField source="created_at"  label="Created at"/>
            <BooleanInput source="active" label="Client Activated"/>
        </SimpleForm>
    </Show> );
};


export const RequestList = (props) => (
    <List {...props} sort={{ field: 'created_at', order: 'DESC' }} filters={<RequestFilter />}>
        <Datagrid rowClick="show">
            <TextField source="official_name" label="Official Name"/>
            <TextField source="official_email" label="Official Email"/>
            <TextField source="official_phone" label="Official Phone" />
            <TextField source="email" label="Primary Login Email" />
            <TextField source="created_at" label="Created At"/>
            <TextField source="email_verified_at" label="Email Verified At"/>
            <TextField source="active" label="Client Activated"/>
        </Datagrid>
    </List>
);
const styles = {
    button: {
      marginTop: '1em'
    }
  };

  //export default withStyles(styles)(AddRoleButton);
  //export default ApproveButton;