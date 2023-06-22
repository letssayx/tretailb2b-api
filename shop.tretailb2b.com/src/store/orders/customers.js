import React from 'react';
import {required, minLength, maxLength, minValue, maxValue, number, regex, email, choices} from 'react-admin';
import { Filter,SearchInput,Create, Edit, DeleteButton,List,ReferenceInput, SelectInput,BooleanInput,SimpleForm, ArrayInput, TextInput,SimpleFormIterator, DateInput, ReferenceManyField, Datagrid, TextField, DateField, SaveButton,EditButton,CardActions,Toolbar} from 'react-admin';

import { parse } from 'query-string';
import CancelButton from '../../settings/CancelButton';
import { makeStyles } from '@material-ui/core/styles';
import { useDataProvider , useRedirect, Loading } from 'react-admin';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import keyby from 'lodash/keyBy';
import CustomPagination from '../../picklist/components/CustomPagination';
import SearchIcon from '@material-ui/icons/Search';
import InputAdornment from '@material-ui/core/InputAdornment';
import MaterialTextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import AddIcon from '@material-ui/icons/Add';
import { useParams } from 'react-router-dom';
import { Theme, useTheme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Paper from '@material-ui/core/Paper';

const useStyles = makeStyles({
    toolbar: {
        display: 'flex',
    },
  
  });
  const CustomerFilter = props => (
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

export const CustomerCreate = (props) => {
  const redirect = useRedirect();

  const CustomToolbar = props => (
    <Toolbar {...props} classes={useStyles()}>
        <SaveButton style={{marginRight:'10px'}} onClick={() =>{if(localStorage.getItem("AddCustomerRedirect") == "True") {setTimeout(()=>redirect("/orders/create"),5000);}}}/>
        <Button onClick={() =>{ window.history.back(-1);return false;}} variant="contained" color="secondary">Cancel</Button>
    </Toolbar>
  );
  return  (
    <Create {...props}>
        <SimpleForm
        toolbar={<CustomToolbar />}
        >
            <TextInput source="name" validate={required()} label="Name"/>
            <TextInput source="email" validate={required()} label="Email"/>
            <ArrayInput source="address" label="Address">
            <SimpleFormIterator>
              <TextInput source="key" label="Key" />
              <TextInput source="value" label="value"/>
            </SimpleFormIterator>
          </ArrayInput> 
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
                        // { id: 'Daman and Diu', name: 'Daman and Diu' },
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
                     <SelectInput source="customer_type" label="Customer Type"
                      choices={[
                        { id: 'b2b', name: 'B2B' },
                        { id: 'b2c', name: 'B2C' }
                      ]}
                     />
                     <TextInput source="gstin"  label="GSTIN"/>
          <BooleanInput source="active" label="Active" defaultValue={true} />
        </SimpleForm>
    </Create>
  )
};

export const CustomerEdit = (props) => (
    <Edit {...props} >
        <SimpleForm
        toolbar={<CustomToolbarEdit />}
        >
            {/* <TextInput disabled label="Id" source="id" /> */}
            <TextInput source="name" validate={required()} label="Name"/>
            <TextInput source="email" disabled label="Email"/>
            <ArrayInput source="address" label="Address">
            <SimpleFormIterator>
              <TextInput source="key" label="Key" />
              <TextInput source="value" label="value"/>
            </SimpleFormIterator>
          </ArrayInput> 
          <TextInput source="phone"  label="Phone"/>
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
                        // { id: 'Daman and Diu', name: 'Daman and Diu' },
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
                     <SelectInput source="customer_type" label="Customer Type"
                      choices={[
                        { id: 'b2b', name: 'B2B' },
                        { id: 'b2c', name: 'B2C' }
                      ]}
                     />
                     <TextInput source="gstin"  label="GSTIN"/>
          <BooleanInput source="active" label="Active" />
        </SimpleForm>
    </Edit>
);


// export const CustomerList = (props) => (
//     <List {...props} filters={<CustomerFilter />}>
//         <Datagrid rowClick="edit">
//             <TextField source="name" label="Name"/>
//             <TextField source="email" label="Email"/>
//         </Datagrid>
//     </List>
// );



export const CustomerList = ( props ) => {

  const [customers,setCustomers] = React.useState([]);
  const [sort, setSort] =  React.useState({ field: 'id', order: 'DESC' });
  const [currentPage, setCurrentPage] = React.useState(1);
  const dataProvider = useDataProvider();
  const [total, setTotal] = React.useState(0);
  const redirect = useRedirect();
  const [loading, setLoading] = React.useState();
  const [search, setSearch] = React.useState(null);
  const {customerType} = props;


  React.useEffect(()=>{
    setLoading(true)
    const params= {
      pagination:{
        page:currentPage,
        perPage: 10
      },
      sort: {
        field:'id',
        order: 'desc'
      },
      filter:{q: search}
    }

    dataProvider.getList(`customers/${customerType}`, params).then(({data,total}) => {
         setCustomers(data);
         setTotal( Math.ceil(parseInt(total) / parseInt(10)) );
         setLoading(false);
    }).catch((e)=>{
         setLoading(false);
         throw (e.message || e);
    })

  },[currentPage,customerType])


 React.useEffect(()=>{
    
    setLoading(true)
    const params= {
      pagination:{
        page:1,
        perPage: 10
      },
      sort: {
        field:'id',
        order: 'desc'
      },
      filter:{ q: search}
    };

    dataProvider.getList(`customers/${customerType}`, params).then(({data,total}) => {
         setCustomers( data );
         setTotal( Math.ceil(parseInt(total) / parseInt(10)) );
         setLoading(false);
    }).catch((e)=>{
         setLoading(false);
         throw (e.message || e);
    })

  },[ search, customerType])
      
  return (
        <>
        <Card>
        <CardContent>
        <Box p={2}>
          <MaterialTextField
             variant="filled"
             InputProps={{
              startAdornment: (
                <InputAdornment position="center">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            onChange = {(e) => setSearch(e.target.value) }
          />
           <Button variant="text" color="primary" startIcon={<AddIcon />} style={{marginLeft:'490px'}}  onClick={() =>redirect(`customers/create`)}>
             Create 
           </Button>
        </Box>
        {loading? 
        <Loading/>:
              <Datagrid 
                  rowClick={(id) => redirect(`/customers/${id}`)}
                  data={ keyby(customers, 'id') }
                  ids={ customers.map(({ id }) => id) }
                  currentSort={sort}
              >
                <TextField source="name" label="Name"/>
                <TextField source="email" label="Email"/>
              </Datagrid>}
            </CardContent>
            <CardActions>
               <CustomPagination count={total} currentPage={currentPage} onChange={( page ) => setCurrentPage( page ) } />
            </CardActions>
        </Card>
        </>
        );
}



const TabPanel = ( props ) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <AppBar position="static" color="default"> {children} </AppBar>
        </Box>
      )}
    </div>
  );
}

function a11yProps( index ) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const useStyles2 = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    width: '100%',
  },
}));

export const CustomerTab = () => {
  const classes = useStyles2();
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue ) => {
    setValue(newValue);
  };

  const handleChangeIndex = ( index ) => {
    setValue(index);
  };

  return (
    <div className={classes.root}>
      <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label="B2B CUSTOMER" {...a11yProps(0)} />
          <Tab label="B2C CUSTOMER" {...a11yProps(1)} />
          <Tab label="MARKETPLACE CUSTOMER" {...a11yProps(2)} />
        </Tabs>
      </AppBar>
        <TabPanel value={value} index={0} dir={theme.direction}>
           <CustomerList customerType="b2b"/>
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
           <CustomerList customerType="b2c"/>
        </TabPanel>
        <TabPanel value={value} index={2} dir={theme.direction}>
            <CustomerList customerType="marketplace"/>
        </TabPanel>
    </div>
  );
}
