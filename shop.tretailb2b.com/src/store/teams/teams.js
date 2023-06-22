import React from 'react';
import {required, minLength, maxLength, minValue, maxValue, number, regex, email, choices} from 'react-admin';
import { Filter,SearchInput,Create, RadioButtonGroupInput,Edit, List,DeleteButton, SimpleForm, TextInput, DateInput, ReferenceManyField, Datagrid, TextField, DateField, EditButton,SaveButton,Toolbar } from 'react-admin';

import CancelButton from '../../settings/CancelButton';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    toolbar: {
        display: 'flex',
    },
  
  });
  const TeamFilter = props => (
    <Filter {...props}>
        <SearchInput source="q" alwaysOn />
    </Filter>
  );
  
  const CustomToolbarEdit = props => (
    <Toolbar {...props} classes={useStyles()}>
        <SaveButton style={{marginRight:'10px'}} />
        <CancelButton />
        <DeleteButton />
    </Toolbar>
  );
  const CustomToolbar = props => (
    <Toolbar {...props} classes={useStyles()}>
        <SaveButton style={{marginRight:'10px'}} />
        <CancelButton />
    </Toolbar>
  );

export const TeamCreate = (props) => (
    <Create {...props}>
        <SimpleForm
        toolbar={<CustomToolbar />}
        >
            <TextInput source="name" validate={required()} label="Name"/>
            <TextInput source="email" validate={required()} label="Email"/>
            <div> <h4>Module Permission</h4>
        <RadioButtonGroupInput source="products" choices={[
            { id: 'none', name: 'None'},
            { id: 'GET', name: 'Read' },
            { id: 'POST', name: 'Write' },
        ]} defaultValue={'none'} />
         <RadioButtonGroupInput source="orders" choices={[
            { id: 'none', name: 'None'},
            { id: 'GET', name: 'Read' },
            { id: 'POST', name: 'Write' },
        ]} defaultValue={'none'} />
        <RadioButtonGroupInput source="settings" choices={[
            { id: 'none', name: 'None'},
            { id: 'POST', name: 'Write' },
        ]} defaultValue={'none'} />
        </div>
        </SimpleForm>
    </Create>
);

export const TeamEdit = (props) => (
    <Edit {...props}>
        <SimpleForm
        toolbar={<CustomToolbarEdit />}
        >
        <TextInput source="name" disabled label="Name"/>
        <TextInput source="email" disabled label="Email"/>
        <div> <h4>Module Permission</h4>
        <RadioButtonGroupInput source="products" choices={[
            { id: 'none', name: 'None'},
            { id: 'GET', name: 'Read' },
            { id: 'POST', name: 'Write' },
        ]} defaultValue={'none'} />
         <RadioButtonGroupInput source="orders" choices={[
            { id: 'none', name: 'None'},
            { id: 'GET', name: 'Read' },
            { id: 'POST', name: 'Write' },
        ]} defaultValue={'none'} />
        <RadioButtonGroupInput source="settings" choices={[
            { id: 'none', name: 'None'},
            { id: 'POST', name: 'Write' },
        ]} defaultValue={'none'} />
        </div>
        </SimpleForm>
    </Edit>
);


export const TeamList = (props) => (
    <List {...props} filters={<TeamFilter />}>
        <Datagrid rowClick="edit">
            <TextField source="name" label="Name"/>
            <TextField source="email" label="Email"/>
        </Datagrid>
    </List>
);