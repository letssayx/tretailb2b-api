import React, { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-final-form';
import axios from "axios";
import { Link } from 'react-router-dom';
import {required, minLength,DeleteButton,Button, maxLength, minValue, maxValue, number, regex, email, choices} from 'react-admin';
import { SearchInput,Create,ImageField,ImageInput, FileField,Edit,TabbedForm, FormTab,List,Filter, BooleanInput,SimpleForm,FormDataConsumer, SelectInput, TextInput, ReferenceInput, DateInput, ReferenceManyField, Datagrid, TextField, DateField, EditButton,SaveButton,Toolbar } from 'react-admin';
import ChatBubbleIcon from '@material-ui/icons/ChatBubble';
import { withStyles } from '@material-ui/core/styles';
import AirplanemodeActiveIcon from '@material-ui/icons/AirplanemodeActive';
import AirplanemodeInactiveIcon from '@material-ui/icons/AirplanemodeInactive';
import CancelButton from '../../settings/CancelButton';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import {useDataProvider} from 'react-admin';

const useStyles = makeStyles({
    toolbar: {
        display: 'flex',
    },
  
  });

  const ProductFilter = props => (
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
  

const ProductCategories = ({ formData, ...rest }) => {
    const form = useForm();
    return (
        <Fragment>
            <ReferenceInput
                source="category_id" reference="categories"
                onChange={value => form.change('subcategory_id', null)}
                validate={required()}
                {...rest}
            >
            <SelectInput optionText="name" />
            </ReferenceInput>
            <ReferenceInput
                source="subcategory_id" reference="subcategories" filter={{category_id: formData.category_id}}
                validate={required()}
                {...rest}
            >
            <SelectInput optionText="name" />
            </ReferenceInput> 
        </Fragment>
    );
};

const ProductTaxRate = ( props ) => {
    const form = useForm();
    const { formData } = props;
    const dataProvider = useDataProvider()
    const [freez, setFreez] = useState(true)
    useEffect(()=>{
        const subcategory_id = formData.subcategory_id;
        if(subcategory_id){
            if(!freez){
                 setFreez(true);
            }
            dataProvider.getOnly(`subcategories/${subcategory_id}}/tax-rate`)
            .then(({data}) => {
                  if(data){
                    form.change("tax_rate", data.tax_rate);
                    setFreez( false );
                  }
            }).catch(( err) => {
                 console.log(err);
            })
       }
          
    },[formData.subcategory_id])
    return (
        <Fragment>
            <TextInput source="tax_rate" label="Tax Rate" disabled={freez} />
       </Fragment>
    );
}

export const ProductCreate = (props) => (
    <Create {...props}>
            <SimpleForm
            toolbar={<CustomToolbar />}
            >
                <TextInput source="name" validate={required()} label="Name"/>
                <TextInput source="sku" validate={required()} label="Parent SKU"/>
                <TextInput source="description" validate={required()} label="Description"/>
                <TextInput source="asin"  label="ASIN"/>
                <ReferenceInput label="Brand" source="brand_id" reference="brands">
                    <SelectInput optionText="name" />
                </ReferenceInput>
                <ReferenceInput label="Manufacturer" source="manufacturer_id" reference="manufacturers">
                    <SelectInput optionText="name" />
                </ReferenceInput>
                <ReferenceInput label="Country Of Origin" source="country_id" reference="countries">
                    <SelectInput optionText="name" />
                </ReferenceInput>
                <FormDataConsumer>
                    {formDataProps => (
                        <ProductCategories {...formDataProps} />
                    )}
                </FormDataConsumer>
                <DateInput source="launch_date" label="Product Launch Date" />
                <TextInput source="hsn_code"  label="HSN Code" validate={required()}/>
                <FormDataConsumer>
                    {formDataProps => (
                        <ProductTaxRate {...formDataProps} />
                    )}
                </FormDataConsumer>
                <ImageInput source="pictures" multiple={true} maxSize="1000000" label="Related pictures" accept="image/*" placeholder={<p>Drop your file here</p>}>
                <ImageField source="src" title="title" />
                </ImageInput>
                
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
// Variant Inline Update
const ProductQuickEdit = props => (
    <Edit 
        {...props}
        /* disable the app title change when shown */
        title=" ">
        <SimpleForm
        redirect={false}
        >
        <TextField source="sku" label="SKU" />
            <TextInput source="price" />
            <TextInput source="quantity" />
        </SimpleForm>
    </Edit>
  );

const StatusButton= ({ record }) => (
    <BooleanInput label={ record.active ? "Active" : "Inactive"} source="active" onChange={console.log('yah')}/>
);
  
export const ProductEdit = (props) => (
    <Edit {...props}>
        <TabbedForm
        toolbar={<CustomToolbarEdit />}
        >
        <FormTab label="Product summary">
            <TextInput disabled label="Id" source="id" />
            <TextInput source="name" validate={required()} label="Name"/>
            <TextInput source="sku" validate={required()} label="Parent SKU"/>
            <TextInput source="description" validate={required()} label="Description"/>
            <TextInput source="asin"  label="ASIN"/>
            <ReferenceInput label="Brand" source="brand_id" reference="brands">
                <SelectInput optionText="name" />
            </ReferenceInput>
            <ReferenceInput label="Manufacturer" source="manufacturer_id" reference="manufacturers">
                    <SelectInput optionText="name" />
                </ReferenceInput>
                <ReferenceInput label="Country Of Origin" source="country_id" reference="countries">
                    <SelectInput optionText="name" />
                </ReferenceInput>
            <FormDataConsumer>
                {formDataProps => (
                    <ProductCategories {...formDataProps} />
                )}
            </FormDataConsumer>
            <DateInput source="launch_date" label="Product Launch Date" />
            <TextInput source="hsn_code"  label="HSN Code" validate={required()}/>
            <FormDataConsumer>
                    {formDataProps => (
                        <ProductTaxRate {...formDataProps} />
                    )}
            </FormDataConsumer>
            <ImageInput source="pictures" multiple={true} maxSize="1000000" label="Related pictures" accept="image/*" placeholder={<p>Drop your file here</p>}>
                <ImageField source="src" title="title" />
            </ImageInput>
            {/* <BooleanInput label={ props.record.active ? "Active" : "Inactive"} source="active"/> */}
            {/* <StatusButton /> */}
            <Typography component="div">
            <Grid component="label" container alignItems="baseline" spacing={1}>
          <Grid item>Inactive&nbsp;&nbsp;&nbsp;</Grid>
          <Grid item>
          <BooleanInput label="" source="active"/> 
          </Grid>
          <Grid item>Active</Grid>
        </Grid>
      </Typography>
           
            </FormTab>

            {/*Inventory Tab*/}
            <FormTab label="Variants" path="items">
            <ReferenceManyField reference="items" target="product_id"  addLabel={false} fullWidth>
                <Datagrid expand={<ProductQuickEdit />}>
                    <TextField source="sku" label="SKU" />
                    <TextField source="price" label="Price" />
                    <TextField source="quantity" label="Quantity" />
                    <TextField source="variants" label="Variant" />
                    <EditButton/> 
                    <DeleteButton redirect={false}/>
                </Datagrid>
            </ReferenceManyField>
            <AddItemButton />
            
            </FormTab>

        </TabbedForm>
    </Edit>
);


export const ProductList = (props) => (
    <List {...props} filters={<ProductFilter />}>
        <Datagrid rowClick="edit">
            <ImageField source="thumbnail_image" label="Product Image" sortable={false}/>
            <TextField source="name" label="Name"/>
            <TextField source="sku" label="SKU"/>
        </Datagrid>
        
    </List>
);

const styles = {
    button: {
      marginTop: '1em'
    }
  };

const AddItemButton = ({ classes, record }) => (
    <Button
      variant="raised"
      component={Link}
      to={`/items-bulk/${record.id}`}
      label="Bulk Edit"
      title="Add new items on product"
    >
      <ChatBubbleIcon />
    </Button>
  );
  export default withStyles(styles)(AddItemButton);