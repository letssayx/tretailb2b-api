import React from 'react';
import ReactDOM from 'react-dom';
import {
Datagrid,
List,TextField,Filter,SearchInput,Create,SimpleForm,TextInput,Toolbar,SaveButton,NumberInput,ArrayInput,SimpleFormIterator,
ArrayField,ChipField,ImageField,Edit,DeleteButton,ReferenceInput,FormDataConsumer,
useDataProvider,AutocompleteInput,BooleanInput
} from 'react-admin';
import { minLength,maxLength,minValue,maxValue,number,regex,email,choices} from 'react-admin';
import { useForm } from 'react-final-form';
import axios from "axios";
import { required } from 'react-admin';
import CancelButton from '../../settings/CancelButton';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles({
    toolbar: {
        display: 'flex',
    },
    textbox: {
        width: 100,
    },
  
});

const LineItems = ({ formData, ...rest}) => {
    const form = useForm();
    const classes = useStyles();
    const dataProvider = useDataProvider();
    // console.log(rest)
    // console.log(formData)
    return (
            <div>
            <ReferenceInput 
                source={`${rest.id}.id`} reference="items" label="SKU"
                filter={{ inventory_type:1,active:1}}
                sort={{ field: 'sku', order: 'ASC' }}
                onChange={ (value) => { 
                    dataProvider.getOne(`bundles/${formData.id}`,{ id : value})
                        .then(({ data }) => {
                            form.change(rest.id+'.price',data.price);
                            form.change(rest.id+'.sku',data.sku);
                            form.change(rest.id+'.tax_rate',data.tax_rate);
                            form.change(rest.id+'.hsn_code',data.hsn_code);
                            form.change(rest.id+'.quantity',data.quantity);
                        })
                        .catch(error => {

                        })
                   
                }
                }
                validate={required()}
                {...rest}
            >
            <AutocompleteInput optionText="sku" suggestionLimit={10} options={{
               suggestionsContainerProps: {
                   disablePortal: true,
              }}}
            />
            </ReferenceInput>
            <TextInput source={`${rest.id}.price`}   className={classes.textbox} label="Sale Price"   defaultValue={0} disabled />
            <NumberInput source={`${rest.id}.quantity`}  className={classes.textbox} label="Quantity" validate={[required(),minValue(1)]} defaultValue={0} />
            <NumberInput source={`${rest.id}.tax_rate`}  className={classes.textbox} label="Tax rate"  defaultValue={''} disabled />
            <TextInput source={`${rest.id}.hsn_code`} className={classes.textbox} label="HSN"  defaultValue={''} disabled />
            </div>
    );
};


const BundleFilter = props => (
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

const ComboItem=(props)=>{
    const form=useForm();
    const dataProvider = useDataProvider();
    //console.log(props.formData)
    return(
       <>
        <ReferenceInput 
         source={props.getSource('id')} 
         reference="items" 
         validate={required()} 
         label="SKU"
         filter={{ inventory_type:1,active:1}}
         sort={{ field: 'sku', order: 'ASC' }}
         onChange={ (value) => { 
            dataProvider.getOne(`items`,{ id : value})
                .then(({ data }) => {
                    form.change(props.getSource('sku'),data.sku);
                })
                .catch(error => {

                })
              }
            }
        >
        <AutocompleteInput optionText="sku" label="SKU" suggestionLimit={10} options={{
         suggestionsContainerProps: {
          disablePortal: true,
        }}}
        
        />
        </ReferenceInput>
        <NumberInput 
          source={props.getSource('quantity')} 
          label="Quantity"
          validate={[required(),minValue(1)]}
          />
        </>
        );

}

export const BundleCreate=(props)=>{

    return (
    <Create {...props}>
        <SimpleForm toolbar={<CustomToolbar/>} >
         <TextInput   source="bundle_name" validate={required()} label="Bundle Name"/>
         <TextInput   source="sku" validate={required()} label="SKU"/>
         <NumberInput source="price" label="Price" validate={required()}/>
         <NumberInput source="mrp" label="MRP" />
         <ArrayInput  source="items" label="Items">
            <SimpleFormIterator>
            <FormDataConsumer>
              {({ getSource, scopedFormData}) =><ComboItem getSource={getSource} formData={scopedFormData}/>}
               </FormDataConsumer>
            </SimpleFormIterator>
        </ArrayInput>
        <BooleanInput source="active" label="Active" defaultValue={true} name="active"/> 
        </SimpleForm>
    </Create>
   );
}

export const BundleEdit=(props)=>{
   
   return  (  
         <Edit {...props}>
          <SimpleForm       toolbar={<CustomToolbarEdit />}>
              <TextInput   source="bundle_name" validate={required()} label="Bundle Name"/>
              <TextInput   source="sku" validate={required()} label="SKU"/>
              <NumberInput source="price" label="Price" validate={required()}/>
              <NumberInput source="mrp" label="MRP" />
              <ArrayInput source="items" label="Items" >
              <SimpleFormIterator>
                <FormDataConsumer>
                    {formDataProps => (
                        <LineItems {...formDataProps} />
                    )}
                </FormDataConsumer>
               </SimpleFormIterator>
               </ArrayInput>
               <BooleanInput source="active" label="Active" defaultValue={false} name="active"/> 
          </SimpleForm>
         </Edit>
         )
}
export const BundleList = (props) => (
    <List {...props} filters={<BundleFilter />}>
        <Datagrid rowClick="edit">
             <TextField source="sku" label="SKU"/>
             <TextField source="name" label="Bundle Name"/>
             <TextField source="mrp" label="MRP"/>
             <TextField source="price" label="Price"/>
             <TextField source="quantity" label="Quantity"/>
             <ArrayField source="items" label="Items">
                   <Datagrid>
                     <ImageField source="thumbnail_image" label="Product Image" /><ChipField source="sku" label="SKU" /><ChipField source="quantity" label="Quantity" /> 
                   </Datagrid>
             </ArrayField>
        </Datagrid>
    </List>
);