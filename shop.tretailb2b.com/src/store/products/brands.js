import React from 'react';
import {required, minLength, maxLength, minValue, maxValue, number, regex, email, choices} from 'react-admin';
import { Filter,SearchInput,Create, Edit, List,DeleteButton, SimpleForm, TextInput, DateInput, ReferenceManyField, Datagrid, TextField, DateField, EditButton,SaveButton,Toolbar } from 'react-admin';

import CancelButton from '../../settings/CancelButton';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    toolbar: {
        display: 'flex',
    },
  
  });
  const BrandFilter = props => (
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

export const BrandCreate = (props) => (
    <Create {...props}>
        <SimpleForm
        toolbar={<CustomToolbar />}
        >
            <TextInput source="name" validate={required()} label="Name"/>
        </SimpleForm>
    </Create>
);

export const BrandEdit = (props) => (
    <Edit {...props}>
        <SimpleForm
        toolbar={<CustomToolbarEdit />}
        >
            {/* <TextInput disabled label="Id" source="id" /> */}
            <TextInput source="name" validate={required()} label="Name"/>
        </SimpleForm>
    </Edit>
);


export const BrandList = (props) => (
    <List {...props} filters={<BrandFilter />}>
        <Datagrid rowClick="edit">
            {/* <TextField source="id" label="Id" /> */}
            <TextField source="name" label="Name"/>
        </Datagrid>
    </List>
);