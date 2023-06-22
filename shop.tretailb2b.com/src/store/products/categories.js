import React from 'react';
import { Link } from 'react-router-dom';
import {required, minLength, maxLength, minValue, maxValue, number, regex, email, choices, NumberField} from 'react-admin';
import { Create, Edit, List, SimpleForm,DeleteButton, TextInput, Button,DateInput, ReferenceManyField, Datagrid, TextField, DateField, EditButton,SaveButton,Toolbar } from 'react-admin';
import ChatBubbleIcon from '@material-ui/icons/ChatBubble';
import { withStyles } from '@material-ui/core/styles';

import CancelButton from '../../settings/CancelButton';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    toolbar: {
        display: 'flex',
    },
  
  });
  
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


export const CategoryCreate = (props) => (
    <Create {...props}>
        <SimpleForm
        toolbar={<CustomToolbar />}
        >
            <TextInput source="name" validate={required()} label="Name"/>
        </SimpleForm>
    </Create>
);

export const CategoryEdit = (props) => (
    <Edit {...props}>
        <SimpleForm
        toolbar={<CustomToolbarEdit />}
        >
            {/* <TextInput disabled label="Id" source="id" /> */}
            <TextInput source="name" validate={required()} label="Name"/>
            <ReferenceManyField label="Sub Categories" reference="subcategories" target="category_id">
                <Datagrid>
                    <TextField source="name" label="Name" />
                    <NumberField source="tax_rate" label="Tax Rate"/>
                    <DeleteButton redirect={false}/>
                </Datagrid>
            </ReferenceManyField>
            <AddSucategoryButton />
        </SimpleForm>
    </Edit>
);


export const CategoryList = (props) => (
    <List {...props}>
        <Datagrid rowClick="edit">
            {/* <TextField source="id" label="Id" /> */}
            <TextField source="name" label="Name"/>
        </Datagrid>
    </List>
);

const styles = {
    button: {
      marginTop: '1em'
    }
  };
const AddSucategoryButton = ({ classes, record }) => (
    <Button
      variant="raised"
      component={Link}
      to={`/subcategories/create?category_id=${record.id}`}
      label="Add a Sub Category"
      title="Add a Sub Category to Category"
    >
      <ChatBubbleIcon />
    </Button>
  );
  export default withStyles(styles)(AddSucategoryButton);