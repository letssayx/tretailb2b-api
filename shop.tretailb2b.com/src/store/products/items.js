import React , { Fragment } from 'react';
import {required, minLength, maxLength, minValue, maxValue,
  number, regex, email, choices, Filter, SearchInput, Create,
  Edit, ImageField, DeleteButton, List, ReferenceInput,
  SelectInput, BooleanInput, SimpleForm, ArrayInput,
  TextInput,SimpleFormIterator, DateInput, ReferenceManyField,
  Datagrid, TextField, DateField, SaveButton, EditButton,
  CardActions, Toolbar, useRecordContext} from 'react-admin';

import { parse } from 'query-string';
import CancelButton from '../../settings/CancelButton';
import { makeStyles } from '@material-ui/core/styles';
//import'bootstrap/dist/css/bootstrap.min.css';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import DoneIcon from '@material-ui/icons/Done'
import {indigo} from '@material-ui/core/colors'


const useStyles = makeStyles({
  toolbar: {
      display: 'flex',
  },

});
const ItemFilter = props => (
  <Filter {...props}>
      <SearchInput source="q" alwaysOn />
      <SelectInput source="type" choices={[
        { id: 'all', name: 'All' },
        { id: 'new', name: 'New' }
      ]} alwaysOn />
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

// const divStyle = {
//   width: '100px',
//   margin: '0 10px'
// };

// const scrollingWrapper  = {
//   overflowX: 'scroll',
//   overflowY: 'hidden',
//   whiteSpace: 'nowrap'
// }

const PriceValidation = (value, allValues) => {
    //console.log(allValues);

    if (!value) {
        return 'This is required';
    }

    if (value > allValues.items[0].mrp){
      return 'Must be less than MRP';
    }
    //return [];
};

const validatePrice = [PriceValidation];

export const ItemCreate = props => {
    // Read the post_id from the location which is injected by React Router and passed to our component by react-admin automatically
    const { product_id: product_id_string } = parse(props.location.search);

    // ra-data-fakerest uses integers as identifiers, we need to parse the querystring
    // We also must ensure we can still create a new comment without having a post_id
    // from the url by returning an empty string if post_id isn't specified
    const product_id = product_id_string ? parseInt(product_id_string, 10) : '';

    const redirect = product_id ? `/products/${product_id}/items` : `/items`;
    const required = (message = 'Required') => value => value ? undefined : message;




    return (
      <Create  {...props}>
        <SimpleForm
          defaultValue={{product_id}}
          redirect={redirect}
          toolbar={<CustomToolbar />}
        >
          {product_id=='' ?
          <ReferenceInput label="Product" source="product_id" reference="products" validate={required()}>
                <SelectInput optionText="name" />
          </ReferenceInput> : <TextInput disabled label="Product ID" source="product_id" validate={required()} />}

          <ArrayInput source="items" label="Items" validate={required()}>
          <SimpleFormIterator>
          
          <TextInput source="sku" validate={required()} label="SKU" />
          <TextInput source="mrp" validate={required()} label="MRP" />
          <TextInput label="price" source="price" />
          <TextInput source="length" label="L" />
          <TextInput source="breadth" label="B" />
          <TextInput source="height" label="H" />
          <SelectInput source="dimension_unit" label="unit"
                      choices={[
                        { id: 'centimeters', name: 'centimeters' },
                        { id: 'inches', name: 'inches' }
                      ]}
                     />

          <TextInput source="weight" validate={required()} label="Weight" />
                  
          <SelectInput source="weight_unit" label="unit"
                      choices={[
                        { id: 'grams', name: 'grams' },
                        { id: 'kg', name: 'kg' }
                      ]}
          />
                  
          <TextInput source="quantity" validate={required()} label="Quantity" />
                
          <ArrayInput source="variants" label="Variants" >
          <SimpleFormIterator>
              <TextInput source="key" label="Key" />
              <TextInput source="value" label="value"/>
          </SimpleFormIterator>
          </ArrayInput>
                
          <ArrayInput source="attributes" label="Extra Attributes">
            <SimpleFormIterator>
                <TextInput source="key" label="Key" />
                <TextInput source="value" label="value"/>
            </SimpleFormIterator>
          </ArrayInput>
        <TextInput source="inventory_location" label="Inventory Location" />
        <BooleanInput source="active" label="Active" defaultValue={true} />
                
         </SimpleFormIterator>
          </ArrayInput>

        </SimpleForm>
        
      </Create>
    );
  };

  const redirect = (basePath, id, data) => `/products/${data.product_id}/items`;


// Item Edit
  export const ItemEdit = (props) => (

    <Edit {...props}>
        <SimpleForm
        toolbar={<CustomToolbarEdit />}
        redirect={redirect}
        >
          
          {/* <TextInput disabled label="Id" source="id" /> */}
          <TextInput disabled label="Product ID" source="product_id" />
          <TextInput disabled source="sku" validate={required()} label="SKU" />
          <TextInput source="amazon_sku_alias" lable="Amazon SKU"/>
          <TextInput source="flipkart_sku_alias" lable="Flipkart SKU"/>


          <ArrayInput source="variants" label="Variants">
            <SimpleFormIterator>
              <TextInput source="key" label="Key" />
              <TextInput source="value" label="value"/>
            </SimpleFormIterator>
          </ArrayInput> 

          <ArrayInput source="attributes" label="Extra Attributes">
            <SimpleFormIterator>
              <TextInput source="key" label="Key" />
              <TextInput source="value" label="value"/>
            </SimpleFormIterator>
          </ArrayInput> 

          <TextInput source="mrp" validate={required()} label="MRP" />
          <TextInput source="price" validate={required()} label="Price" />
          <TextInput source="length" label="Length" validate={required()}  />
          <TextInput source="breadth" label="Breadth" validate={required()}  />
          <TextInput source="height" label="Height" validate={required()}  />
          <SelectInput source="dimension_unit" label="Dimension Unit" validate={required()}
            choices={[
              { id: 'centimeters', name: 'centimeters' },
              { id: 'inches', name: 'inches' }
          ]}
          />
          <TextInput source="weight" validate={required()} label="Weight in grms" />
          <SelectInput source="weight_unit" label="Weight_Unit"
            choices={[
              { id: 'grams', name: 'grams' },
              { id: 'kg', name: 'kg' },
              { id: 'pounds', name: 'pounds' }
          ]}
          />
          <TextInput source="quantity" validate={required()} label="Quantity" />
          <TextInput source="inventory_location" label="Inventory Location" />
          {/* <BooleanInput source="active" label="Active" /> */}
          <Typography component="div">
            <Grid component="label" container alignItems="baseline" spacing={1}>
          <Grid item>Inactive&nbsp;&nbsp;&nbsp;</Grid>
          <Grid item>
          <BooleanInput label="" source="active" /> 
          </Grid>
          <Grid item>Active</Grid>
        </Grid>
      </Typography>         
        </SimpleForm>
    </Edit>
);

// Item Listing
const IEdit = props => (
  <Edit
      {...props}
      /* disable the app title change when shown */
      title=" ">
      <SimpleForm>
          <TextInput source="price"/>
          <TextInput
           source="quantity"
           disabled={props.record.inventory_type=='Single'?false:true}
           />
      </SimpleForm>
  </Edit>
);


// No Header options
const NoneActions = props => (
  <CardActions />
);



export const ItemList = (props) => (
  <List {...props} filters={<ItemFilter />} actions={<NoneActions />} filterDefaultValues={{type:'all'}}>
      <Datagrid expand={<IEdit />}>
          {/* <TextField source="id" label="Id" /> */}
          <ImageField source="thumbnail_image" label="Product Image" sortable={false} />
          <TextField source="product_name" label="Product Name" sortable={false}/>
          <TextField source="product_sku" label="Parent SKU" sortable={false}/>
          <TextField source="product_category_name" label="Category" sortable={false}/>
          <TextField source="product_subcategory_name" label="SubCategory" sortable={false}/>
          <TextField source="product_brand_name" label="Brand" sortable={false}/>
          <TextField source="sku" label="SKU"/>
          <TextField source="price" label="Price"/>
          <TextField source="quantity" label="Quantity"/>
          <TextField source="variants" label="Variants"/>
          <TextField source="inventory_type" label="Inventory Type"/>
          <TextField source="inventory_location" label="Location"/>
          <NewlyAddedField source="newly_added" label="New"/>
          {/* <EditButton /> */}
      </Datagrid>
  </List>
);

const NewlyAddedField = ({source,record})=>{
  const {newly_added} = record;
  return (newly_added?<DoneIcon style={{color:indigo[500]}}/>:<></>)

}

//const redirect_edit = (basePath, id, data) => `/products/${data.product_id}/items`;
// Item BulkEdit
export const ItemBulkEdit = (props) => (

  <Edit {...props}>
     <SimpleForm
          redirect={false}
          toolbar={<CustomToolbar />}
        >
          {/* <TextInput disabled source="id" label="Product Id"/> */}


          <ArrayInput source="items" label="Items" validate={required()}>
          <SimpleFormIterator>
          
          <TextInput source="sku" validate={required()} label="SKU" />
          <TextInput source="mrp" validate={required()} label="MRP" />
          <TextInput source="amazon_sku_alias" label="Amazon SKU"/>
          <TextInput source="flipkart_sku_alias" label="Flipkart SKU"/>
          <TextInput label="price" source="price" validate={required()} />
          <TextInput source="length" label="L" validate={required()}/>
          <TextInput source="breadth" label="B"  validate={required()}/>
          <TextInput source="height" label="H"  validate={required()}/>
          <SelectInput source="dimension_unit" label="Dimension Unit" validate={required()}
                      choices={[
                        { id: 'centimeters', name: 'centimeters' },
                        { id: 'inches', name: 'inches' }
                      ]}
                     />

          <TextInput source="weight" validate={required()} label="Weight" />
                  
          <SelectInput source="weight_unit" label="Weight Unit" validate={required()}
                      choices={[
                        { id: 'grams', name: 'grams' },
                        { id: 'kg', name: 'kg' },
                        { id: 'pounds', name: 'pounds' }
                      ]}
          />
                  
          <TextInput source="quantity" validate={required()} label="Quantity" />
                
          <ArrayInput source="variants" label="Variants" >
          <SimpleFormIterator>
              <TextInput source="key" label="Key" />
              <TextInput source="value" label="value"/>
          </SimpleFormIterator>
          </ArrayInput>
                
          <ArrayInput source="attributes" label="Extra Attributes">
            <SimpleFormIterator>
                <TextInput source="key" label="Key" />
                <TextInput source="value" label="value"/>
            </SimpleFormIterator>
          </ArrayInput>
          <TextInput source="inventory_location" label="Inventory Location" />
        {/* <BooleanInput source="active" label="Active" defaultValue={true} /> */}
        <Typography component="div">
            <Grid component="label" container alignItems="baseline" spacing={1}>
          <Grid item>Inactive&nbsp;&nbsp;&nbsp;</Grid>
          <Grid item>
          <BooleanInput label="" source="active" defaultValue={true}/> 
          </Grid>
          <Grid item>Active</Grid>
        </Grid>
      </Typography>
                
         </SimpleFormIterator>
          </ArrayInput>

        </SimpleForm>
  </Edit>
);

