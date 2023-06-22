import React from 'react';
import {required, minLength, maxLength, minValue, maxValue, number, regex, email, choices} from 'react-admin';
import { Create, Edit, List, SimpleForm, TextInput,NumberInput, SaveButton,Toolbar} from 'react-admin';
import { parse } from 'query-string';

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


export const SubCategoryCreate = props => {
    // Read the post_id from the location which is injected by React Router and passed to our component by react-admin automatically
    const { category_id: category_id_string } = parse(props.location.search);
  
    // ra-data-fakerest uses integers as identifiers, we need to parse the querystring
    // We also must ensure we can still create a new comment without having a post_id
    // from the url by returning an empty string if post_id isn't specified
    const category_id = category_id_string ? parseInt(category_id_string, 10) : '';
  
    const redirect = category_id ? `/categories/${category_id}/show` : false;
  
    return (
      <Create {...props}>
        <SimpleForm
          defaultValue={{category_id}}
          redirect={redirect}
          toolbar={<CustomToolbar />}
        >
          {/* <TextInput disabled label="Category" source="category_id" /> */}
          <TextInput source="name" validate={required()} label="Name"/>
          <NumberInput source="tax_rate" validate={required()} label="Tax Rate"/>
        </SimpleForm>
      </Create>
    );
  };