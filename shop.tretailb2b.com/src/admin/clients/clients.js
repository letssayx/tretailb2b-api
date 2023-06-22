import React from 'react';
import { Link } from 'react-router-dom';
import {required,minLength,maxLength,minValue,maxValue,number,
  regex,email,choices,Button,Filter,SearchInput,Create,Edit,
  SelectInput,Show,BooleanInput,SimpleForm,TextInput,DateInput,
  DeleteButton,ReferenceManyField,List,Datagrid,TextField,
  DateField, EditButton,SaveButton,Toolbar,ChipField,useRedirect
} from 'react-admin';

import ChatBubbleIcon from '@material-ui/icons/ChatBubble';
import { withStyles, makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';

import CancelButton from '../../settings/CancelButton';



const useStyles = makeStyles({
  toolbar: {
    display: 'flex',
  },

});

const ClientFilter = props => (
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

const CustomToolbarEdit = props => (
  <Toolbar {...props} classes={useStyles()}>
    <SaveButton style={{marginRight:'10px'}} />
    {/* <CancelButton /> */}
    <DeleteButton />
  </Toolbar>
);

export const ClientCreate = (props) => (
  <Create {...props}>
    <SimpleForm toolbar={<CustomToolbar/>}>
      <TextInput source="name" validate={required()} label="Client Name / Company"/>
      <TextInput source="email" validate={required()} label="Email"/>
      <TextInput source="address" validate={required()} label="Address"/>
      <TextInput source="phone" validate={required()} label="Phone"/>
      <SelectInput source="state" label="State(For GST)"
        choices={[
          { id: 'Andhra Pradesh', name: 'Andhra Pradesh' },
          { id: 'Andaman and Nicobar Islands', name: 'Andaman and Nicobar Islands' },
          { id: 'Arunachal Pradesh', name: 'Arunachal Pradesh' },
          { id: 'Assam', name: 'Assam' },
          { id: 'Bihar', name: 'Bihar' },
          { id: 'Chandigarh', name: 'Chandigarh' },
          { id: 'Chhattisgarh', name: 'Chhattisgarh' },
          { id: 'Dadra and Nagar Haveli and Daman and Diu ', name: 'Dadra and Nagar Haveli & Daman and Diu' },
          { id: 'Delhi', name: 'Delhi' },
          { id: 'Lakshadweep', name: 'Lakshadweep' },
          { id: 'Puducherry', name: 'Puducherry' },
          { id: 'Goa', name: 'Goa' },
          { id: 'Gujarat', name: 'Gujarat' },
          { id: 'Haryana', name: 'Haryana' },
          { id: 'Himachal Pradesh', name: 'Himachal Pradesh' },
          { id: 'Jammu and Kashmir', name: 'Jammu and Kashmir' },
          { id: 'Jharkhand', name: 'Jharkhand' },
          { id: 'Karnataka', name: 'Karnataka' },
          { id: 'Kerala', name: 'Kerala' },
          { id: 'Madhya Pradesh', name: 'Madhya Pradesh' },
          { id: 'Maharashtra', name: 'Maharashtra' },
          { id: 'Manipur', name: 'Manipur' },
          { id: 'Meghalaya', name: 'Meghalaya' },
          { id: 'Mizoram', name: 'Mizoram' },
          { id: 'Nagaland', name: 'Nagaland' },
          { id: 'Odisha', name: 'Odisha' },
          { id: 'Punjab', name: 'Punjab' },
          { id: 'Rajasthan', name: 'Rajasthan' },
          { id: 'Sikkim', name: 'Sikkim' },
          { id: 'Tamil Nadu', name: 'Tamil Nadu' },
          { id: 'Telangana', name: 'Telangana' },
          { id: 'Tripura', name: 'Tripura' },
          { id: 'Uttar Pradesh', name: 'Uttar Pradesh' },
          { id: 'Uttarakhand', name: 'Uttarakhand' },
          { id: 'West Bengal', name: 'West Bengal' }
        ]}
      />
      <TextInput source="gstin"  label="GSTIN"/>
      <Typography component="div">
        <Grid component="label" container alignItems="baseline" spacing={1}>
          <Grid item>Inactive&nbsp;&nbsp;&nbsp;</Grid>
          <Grid item>
            <BooleanInput label="" source="active" defaultValue={true}/> 
          </Grid>
          <Grid item>Active</Grid>
        </Grid>
      </Typography>
    </SimpleForm>
  </Create>
);

export const ClientShow = (props) => (
  <Show {...props}>
    <SimpleForm toolbar={<CustomToolbarEdit/>}>
      {/* <TextInput disabled label="Id" source="id" /> */}
      <TextInput source="name" validate={required()} label="Client Name / Company"/>
      <TextInput source="email" validate={required()} label="Email"/>
      <TextInput source="address" validate={required()} label="Address"/>
      <TextInput source="phone" validate={required()} label="Phone"/>
      <SelectInput source="state" label="State(For GST)"
        choices={[
          { id: 'Andhra Pradesh', name: 'Andhra Pradesh' },
          { id: 'Andaman and Nicobar Islands', name: 'Andaman and Nicobar Islands' },
          { id: 'Arunachal Pradesh', name: 'Arunachal Pradesh' },
          { id: 'Assam', name: 'Assam' },
          { id: 'Arunachal Pradesh', name: 'Arunachal Pradesh' },
          { id: 'Bihar', name: 'Bihar' },
          { id: 'Chandigarh', name: 'Chandigarh' },
          { id: 'Chhattisgarh', name: 'Chhattisgarh' },
          { id: 'Dadra and Nagar Haveli & Daman and Diu ', name: 'Dadra and Nagar Haveli & Daman and Diu' },
          { id: 'Delhi', name: 'Delhi' },
          { id: 'Assam', name: 'Assam' },
          { id: 'Lakshadweep', name: 'Lakshadweep' },
          { id: 'Puducherry', name: 'Puducherry' },
          { id: 'Goa', name: 'Goa' },
          { id: 'Gujarat', name: 'Gujarat' },
          { id: 'Haryana', name: 'Haryana' },
          { id: 'Himachal Pradesh', name: 'Himachal Pradesh' },
          { id: 'Jammu and Kashmir', name: 'Jammu and Kashmir' },
          { id: 'Jharkhand', name: 'Jharkhand' },
          { id: 'Karnataka', name: 'Karnataka' },
          { id: 'Kerala', name: 'Kerala' },
          { id: 'Madhya Pradesh', name: 'Madhya Pradesh' },
          { id: 'Maharashtra', name: 'Maharashtra' },
          { id: 'Manipur', name: 'Manipur' },
          { id: 'Meghalaya', name: 'Meghalaya' },
          { id: 'Mizoram', name: 'Mizoram' },
          { id: 'Nagaland', name: 'Nagaland' },
          { id: 'Odisha', name: 'Odisha' },
          { id: 'Punjab', name: 'Punjab' },
          { id: 'Rajasthan', name: 'Rajasthan' },
          { id: 'Sikkim', name: 'Sikkim' },
          { id: 'Tamil Nadu', name: 'Tamil Nadu' },
          { id: 'Telangana', name: 'Telangana' },
          { id: 'Tripura', name: 'Tripura' },
          { id: 'Uttar Pradesh', name: 'Uttar Pradesh' },
          { id: 'Uttarakhand', name: 'Uttarakhand' },
          { id: 'West Bengal', name: 'West Bengal' }
        ]}
      />
      <TextInput source="gstin"  label="GSTIN"/>
      <Typography component="div">
        <Grid component="label" container alignItems="baseline" spacing={1}>
          <Grid item>Inactive&nbsp;&nbsp;&nbsp;</Grid>
          <Grid item>
            <BooleanInput label="" source="active"/> 
          </Grid>
          <Grid item>Active</Grid>
        </Grid>
      </Typography>
      <BooleanInput source="migrate" label="Update Migration" defaultValue={false}/>
      <BooleanInput source="rollback" label="Rollback To Previous Migration" defaultValue={false}/>
      <ReferenceManyField label="Team" reference="admin/roles" target="client_id">
        <Datagrid>
          <TextField source="user" label="Name" />
          <TextField source="user_email" label="User Email" />
          <DeleteButton redirect={false}/>
        </Datagrid>
      </ReferenceManyField>
      <AddRoleButton/>
    </SimpleForm>
  </Show>
);

const ShowPrimaryUser = ({record,...rest})=>(record.primary_user=="primary"?<ChipField source="primary_user" record={record} label="Primary User"/>:null);

export const ClientEdit = (props) => (
  <Edit {...props}>
    <SimpleForm toolbar={<CustomToolbarEdit/>}>  
      <Button style={{position:'absolute',right:'30px',width:'50px'}}
        variant="raised" component={Link} to={`/admin/clients`}
        color="transparent"><ArrowBackIcon/>
      </Button>
      {/* <TextInput disabled label="Id" source="id" /> */}
      <TextInput source="name" validate={required()} label="Client Name / Company"/>
      <TextInput source="email" validate={required()} label="Email"/>
      <TextInput source="address" validate={required()} label="Address"/>
      <TextInput source="phone" validate={required()} label="Phone"/>
      <SelectInput source="state" label="State(For GST)"
        choices={[
          { id: 'Andhra Pradesh', name: 'Andhra Pradesh' },
          { id: 'Andaman and Nicobar Islands', name: 'Andaman and Nicobar Islands' },
          { id: 'Arunachal Pradesh', name: 'Arunachal Pradesh' },
          { id: 'Assam', name: 'Assam' },
          { id: 'Arunachal Pradesh', name: 'Arunachal Pradesh' },
          { id: 'Bihar', name: 'Bihar' },
          { id: 'Chandigarh', name: 'Chandigarh' },
          { id: 'Chhattisgarh', name: 'Chhattisgarh' },
          { id: 'Dadra and Nagar Haveli and Daman and Diu ', name: 'Dadra and Nagar Haveli & Daman and Diu' },
          { id: 'Delhi', name: 'Delhi' },
          { id: 'Assam', name: 'Assam' },
          { id: 'Lakshadweep', name: 'Lakshadweep' },
          { id: 'Puducherry', name: 'Puducherry' },
          { id: 'Goa', name: 'Goa' },
          { id: 'Gujarat', name: 'Gujarat' },
          { id: 'Haryana', name: 'Haryana' },
          { id: 'Himachal Pradesh', name: 'Himachal Pradesh' },
          { id: 'Jammu and Kashmir', name: 'Jammu and Kashmir' },
          { id: 'Jharkhand', name: 'Jharkhand' },
          { id: 'Karnataka', name: 'Karnataka' },
          { id: 'Kerala', name: 'Kerala' },
          { id: 'Madhya Pradesh', name: 'Madhya Pradesh' },
          { id: 'Maharashtra', name: 'Maharashtra' },
          { id: 'Manipur', name: 'Manipur' },
          { id: 'Meghalaya', name: 'Meghalaya' },
          { id: 'Mizoram', name: 'Mizoram' },
          { id: 'Nagaland', name: 'Nagaland' },
          { id: 'Odisha', name: 'Odisha' },
          { id: 'Punjab', name: 'Punjab' },
          { id: 'Rajasthan', name: 'Rajasthan' },
          { id: 'Sikkim', name: 'Sikkim' },
          { id: 'Tamil Nadu', name: 'Tamil Nadu' },
          { id: 'Telangana', name: 'Telangana' },
          { id: 'Tripura', name: 'Tripura' },
          { id: 'Uttar Pradesh', name: 'Uttar Pradesh' },
          { id: 'Uttarakhand', name: 'Uttarakhand' },
          { id: 'West Bengal', name: 'West Bengal' }
        ]}
      />
      <TextInput source="gstin"  label="GSTIN"/>
      <Typography component="div">
        <Grid component="label" container alignItems="baseline" spacing={1}>
          <Grid item>Inactive&nbsp;&nbsp;&nbsp;</Grid>
          <Grid item>
            <BooleanInput label="" source="active"/> 
          </Grid>
          <Grid item>Active</Grid>
        </Grid>
      </Typography>
      <BooleanInput source="migrate" label="Update Migration" defaultValue={false}/>
      <BooleanInput source="rollback" label="Rollback To Previous Migration" defaultValue={false}/>
      <ReferenceManyField label="Team" reference="admin/roles" target="client_id">
        <Datagrid>
          <TextField source="user" label="Name" />
          <TextField source="user_email" label="User Email" />
          <ShowPrimaryUser source="primary_user"/>
          <DeleteButton redirect={false}/>
        </Datagrid>
      </ReferenceManyField>
      <AddRoleButton />
    </SimpleForm>
  </Edit>
);

export const ClientList = (props) => (
  <List { ...props } filters={ <ClientFilter /> } >
    <Datagrid rowClick="edit">
      {/* <TextField source="id" label="Id" /> */}
      <TextField source="name" label="Name"/>
      <TextField source="email" label="Email"/>
      <TextField source="address" label="address" />
    </Datagrid>
  </List>
);

const styles = {
  button: {
    marginTop: '1em'
  }
};

const AddRoleButton = ({ classes, record }) => (
  <Button
    variant="raised"
    component={Link}
    to={`/admin/roles/create?client_id=${record.id}`}
    label="Add a User"
    title="Add a User to Store"
  >
    <ChatBubbleIcon />
  </Button>
);

export default withStyles(styles)(AddRoleButton);