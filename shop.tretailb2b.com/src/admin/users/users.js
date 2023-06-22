import React from 'react';
import {required,minLength,maxLength,minValue,maxValue,
  number,regex,email,choices,Filter,SearchInput,Create,
  Edit,DeleteButton,Show,SimpleForm,BooleanInput,
  CheckboxGroupInput,PasswordInput,TextInput,DateInput,
  ReferenceManyField,List,Datagrid,TextField,DateField,
  EditButton,SaveButton,Toolbar,Button
} from 'react-admin';

import { withStyles, makeStyles } from '@material-ui/core/styles';
import ChatBubbleIcon from '@material-ui/icons/ChatBubble';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

import CancelButton from '../../settings/CancelButton';

const useStyles = makeStyles({
  toolbar: {
    display: 'flex',
  },
});

const UserFilter = props => (
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
    <CancelButton />
    <DeleteButton />
  </Toolbar>
);

export const UserList = (props) => (
  <List { ...props } filters={ <UserFilter /> } >
    <Datagrid rowClick="edit">
      <TextField source="id" label="Id" />
      <TextField source="name" label="Name"/>
      <TextField source="email" label="Email"/>
      <TextField source="is_admin" label="Admin" />
    </Datagrid>
  </List>
);

export const UserCreate = (props) => (
  <Create {...props}>
    <SimpleForm
      toolbar={<CustomToolbar />}
    >
      <TextInput source="name" validate={required()} label="Name"/>
      <TextInput source="email" validate={required()} label="User Email"/>
      <PasswordInput source="password" validate={required()} label="User Password"/>
      <BooleanInput label="Admin" source="is_admin" />
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

export const UserShow = (props) => (
  <Show{...props}>
    <SimpleForm
      toolbar={<CustomToolbarEdit />}
    >
      {/* <TextInput disabled label="Id" source="id" /> */}
      <TextInput source="name" validate={required()} label="Name"/>
      <TextInput source="email" validate={required()} label="User Email"/>
      <PasswordInput source="password" validate={required()} label="User Password"/>
      <BooleanInput label="Admin" source="is_admin" />
      <Typography component="div">
        <Grid component="label" container alignItems="baseline" spacing={1}>
          <Grid item>Inactive&nbsp;&nbsp;&nbsp;</Grid>
          <Grid item>
            <BooleanInput label="" source="active"/> 
          </Grid>
          <Grid item>Active</Grid>
        </Grid>
      </Typography>
    </SimpleForm>
  </Show>
);

export const UserEdit = (props) => (
  <Edit {...props}>
    <SimpleForm
      toolbar={<CustomToolbarEdit />}
    >
      {/* <TextInput disabled label="Id" source="id" /> */}
      <TextInput source="name" validate={required()} label="Name"/>
      <TextInput source="email" validate={required()} label="User Email"/>
      <PasswordInput source="password" validate={required()} label="User Password"/>
      <BooleanInput label="Admin" source="is_admin" />
      <Typography component="div">
        <Grid component="label" container alignItems="baseline" spacing={1}>
          <Grid item>Inactive&nbsp;&nbsp;&nbsp;</Grid>
          <Grid item>
            <BooleanInput label="" source="active"/> 
          </Grid>
          <Grid item>Active</Grid>
        </Grid>
      </Typography>
    </SimpleForm>
  </Edit>
);