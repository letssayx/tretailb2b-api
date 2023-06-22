import React from 'react';
import { Create,SelectInput, required,ReferenceInput,RadioButtonGroupInput, Edit, List,Show, SimpleForm, TextInput, DateInput,DeleteButton, ReferenceManyField, Datagrid, TextField, DateField, EditButton,BooleanInput } from 'react-admin';
import { parse } from 'query-string';


const RoleCreate = props => {
  // Read the post_id from the location which is injected by React Router and passed to our component by react-admin automatically
  const { client_id: client_id_string } = parse(props.location.search);

  // ra-data-fakerest uses integers as identifiers, we need to parse the querystring
  // We also must ensure we can still create a new comment without having a post_id
  // from the url by returning an empty string if post_id isn't specified
  const client_id = client_id_string ? parseInt(client_id_string, 10) : '';

  const redirect = client_id ? `/admin/clients/${client_id}` : false;

  return (
    <Create {...props}>
      <SimpleForm
        defaultValue={{client_id}}
        redirect={redirect}
      >
        {/* <TextInput disabled label="Client" source="client_id" /> */}
        <ReferenceInput label="User" source="user_id" reference="admin/users">
        <SelectInput optionText="name" />
        </ReferenceInput>
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
            { id: 'GET', name: 'Read' },
            { id: 'POST', name: 'Write' },
        ]} defaultValue={'none'} />
        <BooleanInput source="primary_user" id="primary_user" label="Primary User"/>
        </div>
      </SimpleForm>
    </Create>
  );
};


export default {
    create: RoleCreate
  };