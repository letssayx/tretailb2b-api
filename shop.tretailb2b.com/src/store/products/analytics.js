import React, { useState, useEffect, useMemo } from 'react';
import {Datagrid, TextField, ChipField, DateField, useRedirect, Title, List, Pagination,
  TextInput, Filter, SearchInput, useNotify, useDataProvider, SelectInput, Loading}
  from 'react-admin';
import keyby from 'lodash/keyBy';
import values from 'lodash/values';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Select from '@material-ui/core/Select';
import Paper from '@material-ui/core/Paper';
import FormControl from '@material-ui/core/FormControl';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import CustomPagination from '../../picklist/components/CustomPagination';
import TextInputField from '@material-ui/core/TextField';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';



const inputStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 150,
  }
}));

const useStyles = makeStyles((theme) => ({
  empty: {
    padding: theme.spacing(4),
  },
}));

const MyStateFilter = ( props ) => {
  const choices =  props.choices || [];
  const label   =  props.label || '';
  const classes =  inputStyles();
  const handleChange = props.onChange || undefined;
  const value = props.value;
  return (
    <FormControl variant="filled" className={classes.formControl}>
      <InputLabel id="demo-simple-select-label"> {label || ''}</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={ value || 0}
        onChange={ handleChange }
      >
        { 
          choices.map(( choice ) => (
            <MenuItem value={ choice.id }>{ choice.name }</MenuItem>
          ))
        }
      </Select>
    </FormControl>
  );
};

const ReorderFilter = ( props ) => {
  const choices =  props.choices || [];
  const label   =  props.label || '';
  const classes =  inputStyles();
  const handleChange = props.onChange || undefined;
  const value = props.value;
  return (
    <FormControl variant="filled" className={classes.formControl}>
      <InputLabel id="demo-simple-select-label"> {label || ''}</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={ value || 7}
        onChange={ handleChange }
      >
        {
          choices.map( ( choice ) => (
            <MenuItem value={ choice.id }>{ choice.name }</MenuItem>
          ))
        }
      </Select>
    </FormControl>
  );
};

const MyDayFilter = ( props ) => {
  const choices =  props.choices || [];
  const label   =  props.label || '';
  const classes =  inputStyles();
  const handleChange = props.onChange || undefined;
  const value = props.value;
  return (
    <FormControl variant="filled" className={classes.formControl}>
      <InputLabel id="demo-simple-select-label"> {label || ''}</InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={ value || 0}
        onChange={ handleChange }
      >
        {
          choices.map( ( choice ) => (
            <MenuItem value={ choice.id }>{ choice.name }</MenuItem>
          ))
        }
      </Select>
    </FormControl>
  );
};

const MyMarketFilter = ( props ) => {
  const choices =  [
    {id: 'all',   name: 'All' },
    {id: 'amazon',   name: 'Amazon' },
    {id: 'flipkart', name: 'Flipkart' },
    {id: 'store',   name: 'Store' }
  ];
  const classes =  inputStyles();
  return (
    <FormControl variant="filled" className={classes.formControl}>
      <InputLabel id="demo-simple-select-label"> Marketplace </InputLabel>
      <Select
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={ props.value || 'all'}
        onChange={ props.onChange || undefined}
      >
        { 
          choices.map( ( choice ) => (
          <MenuItem value={ choice.id }>{ choice.name }</MenuItem>
          ))
        }
      </Select>
    </FormControl>
  );
};

const MySearch = ( props ) => {
  const handleChange = (props.onChange || undefined)
  const value  = props.value || '';
  const classes =  inputStyles(); 
  return (
    <TextInputField
      id = "filled-basic" 
      label = "Search" 
      variant = "filled"
      onChange = { handleChange }
      value = { value }
      className={ classes.formControl }
      InputProps = {{startAdornment:(
      <InputAdornment position="start">
        <SearchIcon />
      </InputAdornment>
      )}}
    />
  );
}

// Inventory reOrder forecast
const InventoryReorderTable = ( props ) => {
  const [sort, setSort] = useState({ field: 'id', order: 'DESC' });
  const [products, setProducts] = useState([]);
  const redirect = useRedirect();
  const [loading, setLoading] = useState();
  const [page, setPage] = useState(1);
  const [search, setSearch ] = useState(null);
  const [reorderWithin, setReorderWithin] = useState(7);
  const getDataProvider=useDataProvider();
  const [totalPage, setTotalPage] = useState();
  const [perPage, setPerPage] = useState((props.perPage || 5));
  const marketplace = 'all';
  const resource = props.resource || ''
  const path     = resource.split("/")[1];
  const classes  = useStyles();

  useEffect(() => {
    setLoading( true );
    const params= {
        pagination:{
        page: page,
        perPage: perPage
      },
        sort: {
        field:'id',
        order: 'desc'
      },
      filter:{ 
        q: search , 
        marketplace: props.market , 
        reorder_within: reorderWithin
      }
    }
    getDataProvider.getList(`${resource}`, params)
    .then(({data,total}) => {
    setProducts( values( data ) );
    setTotalPage( Math.ceil( total/ perPage ));
    setLoading( false );
    })
  },[page]);

  useEffect(() => {
    setLoading( true );
    const params= {
      pagination: {
        page: 1,
        perPage: perPage
      },
      sort: {
        field:'id',
        order: 'desc'
      },
      filter: {
        q: search , 
        marketplace: props.market , 
        reorder_within: reorderWithin
      }
    }

    getDataProvider.getList(`${resource}`, params)
    .then(({data,total}) => {
      setProducts( values( data ) );
      setTotalPage( Math.ceil( total/ perPage ) );
      setPage(1);
      setLoading( false );
    })

  },[reorderWithin, search, props.market]);

  if(loading) {
    return <Loading/>;
  }

  return (
  <Box component={Paper} my={4}>
  <Box pt={2} pl={1} >
  <ReorderFilter
  label= "Reorder Within"
  choices={[
  {id: 7, name: '07 days'},
  {id: 15, name: '15 days'},
  ]}
  value={ reorderWithin }
  onChange={ (e) => setReorderWithin( e.target.value )
  }/>
  <MySearch value={search} onChange={(e) => setSearch( e.target.value ) }/>
  </Box>
  <Box>
  {(products.length !== 0?
  <Datagrid  
  data = { keyby(products,'id') }
  ids = { (products.map(({ id }) => id) )}
  currentSort = { sort }
  >
  <TextField source="id"          label="ID"  />
  <ChipField source="sku"         label="SKU" />
  <DateField source="reord_date"  label="Last Date to order" />
  </Datagrid>: 
  <div className={classes.empty}><Typography variant="h5" style={{textAlign:"center"}}>No Data</Typography> </div>)
  }
  </Box>
  <Box p={2}>
  <CustomPagination 
  count={ totalPage } 
  currentPage={ page } 
  onChange={( page ) => setPage( page ) } 
  />
  </Box>
  </Box>
  )
}

// Analytics panel for Average daily sales & Average Order Value
const BasicAnalyticsPanel = ( props ) => {
  const classes = useStyles();
  const [marketplace, setMarketPlace]= useState([])
  const [avg_ord_val , setAvgOrdVal] = useState([])
  const [avg_daily_sales , setAvgDailySales] = useState([])
  const [loading, setLoading] = useState();
  const [products, setProducts] = useState([{}]);
  const [search, setSearch ] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState();
  const [perPage, setPerPage] = useState((props.perPage || 5));
  const notify = useNotify();
  const resource = props.resource || '';
  const getDataProvider = useDataProvider();
  useEffect(() => {
    setLoading( true );
    const params= {
      pagination: {
        page: 1,
        perPage: perPage
      },
      sort: {
        field:'id',
        order: 'desc'
      },
      filter: {
        q: search , 
        marketplace: props.market,
      }
    }

    getDataProvider.getList(`${resource}`, params)
    .then(({data,total}) => {
      setProducts( data  );
      setLoading( false );
    })
  },[search, props.market]);

  if(loading) {
    return <Loading/>;
  }

return <form  noValidate >
     <Card className={classes.root}>
       <Grid container>
           <Grid item md={4}>
               <Box mb={2} mr={2}>
                  <Typography variant="caption" display="block" gutterBottom style={{fontSize : '18px'}}>Average Daily Sales Value</Typography>
                  { products && products.length
                  ? <div>{products[0].avg_daily_sales}</div>
                  : <div><h3>No data</h3></div>
                  }
               </Box>
           </Grid>
             <Grid item md={4}>
                <Box mb={2} mr={2} >
                  <Typography variant="caption" display="block" gutterBottom style={{fontSize : '18px'}}>Average Weekly Order Value</Typography>
                  { products && products.length
                    ? <div>{products[0].avg_ord_val}</div>
                    : <div><h3>No data</h3></div>
                  }
                </Box>
           </Grid>
           {/* <Grid item md={4}>
                <Box mb={2} mr={2} >
                     <Typography variant="caption" display="block" gutterBottom style={{fontSize : '16px'}}>Coming Soon...</Typography>
                     <FormControl variant="filled" >

                     </FormControl>
                     <FormControl variant="filled" >
                           <Select  
                               value={searchAnalyticsDashboard.skuPerformance}
                               inputProps={{id: 'select_item'}}
                               style={{width:'215px'}}
                               InputLabelProps={{shrink: false}}
                               onChange = { (e)=> handleSearchAnalyticsDashboard({ skuPerformance : e.target.value })}
                           >
                               <MenuItem value={'best_performing_sku'}>Best Performing SKU</MenuItem>
                               <MenuItem value={'medium_performing_sku'}>Medium Performing SKU</MenuItem>
                               <MenuItem value={'low_performing_sku'}>Low Performing SKU</MenuItem>
                               <MenuItem value={'worst_performing_sku'}>Worst Performing SKU</MenuItem>
                           </Select>
                     </FormControl>
                 </Box>
           </Grid> */}
         </Grid>
      </Card>
  </form>
}

const StateWiseSalesAnalyticsTable = ( props ) => {
  const [sort, setSort] = useState({ field: 'id', order: 'DESC' });
  const [products, setProducts] = useState([]);
  const redirect = useRedirect();
  const [loading, setLoading] = useState();
  const [page, setPage] = useState(1);
  const [search, setSearch ] = useState(null);
  const [daysAgo, setDaysAgo] = useState(0);
  const [states, setStates] = useState('maharashtra');
  const getDataProvider=useDataProvider();
  const [totalPage, setTotalPage] = useState();
  const [perPage, setPerPage] = useState((props.perPage || 5));
  const marketplace = 'amazon';
  const resource = props.resource || '';
  const path     = resource.split("/")[1];
  const classes  = useStyles();

  useEffect(() => {
    setLoading( true );
    const params= {
      pagination: {
        page: 1,
        perPage: perPage
      },
      sort: {
        field:'id',
        order: 'desc'
      },
      filter: {
        q: search , 
        marketplace: props.market , 
        days_ago: daysAgo,
        states: states
      }
    }

    getDataProvider.getList(`${resource}`, params)
    .then(({data,total}) => {
      setProducts( values( data ) );
      setTotalPage( Math.ceil( total/ perPage ) );
      setPage(1);
      setLoading( false );
    })
  },[daysAgo, states, search, props.market]);

  if(loading) {
    return <Loading/>;
  }
  return (
    <Box component={Paper} my={4}>
      <Box pt={2} pl={1} >
        <MyStateFilter
          label= "Filter By State"
          choices={[
            {id: 'all', name: 'All'}, 
            {id: 'andhra pradesh', name: 'Andhra Pradesh'},
            {id: 'arunachal pradesh', name: 'Arunachal Pradesh'},
            {id: 'assam',  name: 'Assam'},
            {id: 'bihar', name: 'Bihar'},
            {id: 'chattisgarh', name: 'Chattisgarh'},
            {id: 'goa', name: 'Goa'},
            {id: 'gujarat', name: 'Gujarat'},
            {id: 'haryana', name: 'Haryana'},
            {id: 'himachal pradesh', name: 'Himachal Pradesh'},
            {id: 'jharkhand', name: 'Jharkhand'},
            {id: 'karnataka', name: 'Karnataka'},
            {id: 'kerala', name: 'Kerala'},
            {id: 'madhya pradesh', name: 'Madhya Pradesh'},
            {id: 'maharashtra', name: 'Maharashtra'},
            {id: 'manipur', name: 'Manipur'},
            {id: 'meghalaya', name: 'Meghalaya'},
            {id: 'mizoram', name: 'Mizoram'},
            {id: 'nagaland', name: 'Nagaland'},
            {id: 'odisha', name: 'Odisha'},
            {id: 'punjab', name: 'Punjab'},
            {id: 'rajasthan', name: 'Rajasthan'},
            {id: 'sikkim', name: 'Sikkim'},
            {id: 'tamil nadu', name: 'Tamil Nadu'},
            {id: 'telengana', name: 'Telengana'},
            {id: 'tripura', name: 'Tripura'},
            {id: 'uttarakhand', name: 'Uttarakhand'},
            {id: 'uttar pradesh', name: 'Uttar Pradesh'},
            {id: 'west bengal',  name: 'West Bengal'},
            {id: 'andaman and nicobar islands', name: 'Andaman and Nicobar Islands'},
            {id: 'chandigarh', name: 'Chandigarh'},
            {id: 'dadra and nagar haveli and daman & diu', name: 'Dadra and Nagar Haveli and Daman & Diu'},
            {id: 'new delhi', name: 'New Delhi'},
            {id: 'jammu & kashmir', name: 'Jammu & Kashmir'},
            {id: 'ladakh', name: 'Ladakh'},
            {id: 'lakshadweep', name: 'Lakshadweep'},
            {id: 'puducherry', name: 'Puducherry'},
          ]}
          value={ states }
          onChange={ (e) => setStates( e.target.value ) }
        />
        <MyDayFilter
          label= "Filter By Days"
          choices={[
            {id: 0,  name: 'Today'},
            {id: 1,  name: 'Yesterday'},
            {id: 15, name: '15 days ago'},
            {id: 30, name: '30 days ago'},
            {id: 45, name: '45 days ago'},
            {id: 60, name: '60 days ago'},
            {id: 90, name: '90 days ago'}
          ]}
          value={ daysAgo }
          onChange={ (e) => setDaysAgo( e.target.value ) }
        />
        <MySearch value={search} onChange={(e) => setSearch( e.target.value ) }/>
      </Box>
      <Box>
        {
          (products.length !== 0
          ?<Datagrid  
              data = { keyby(products,'id') }
              ids = { (products.map(({ id }) => id) )}
              currentSort = { sort }
          >
            <TextField source="id" label="ID"    />
            <TextField source="sku" label="SKU"   />
            {(path == 'cancelled-products') && <ChipField source="cancel_count" label="Cancelled" />}
            {(path == 'returned-products') && <ChipField source="return_count" label="Returned" />}
            <ChipField source="sales" label="Sales" />
            <TextField source="percent_sales" label="% of Total Sales" />
          </Datagrid>
          :<div className={classes.empty}><Typography variant="h5" style={{textAlign:"center"}}>No Data</Typography> </div>)
        }
      </Box>
      <Box p={2}>
        <CustomPagination 
        count={ totalPage } 
        currentPage={ page } 
        onChange={( page ) => setPage( page ) } 
      />
      </Box>
    </Box>
  )
}


const SalesAnalyticsTable = ( props ) => {
  const [sort, setSort] = useState({ field: 'id', order: 'DESC' });
  const [products, setProducts] = useState([]);
  const redirect = useRedirect();
  const [loading, setLoading] = useState();
  const [page, setPage] = useState(1);
  const [search, setSearch ] = useState(null);
  const [daysAgo, setDaysAgo] = useState(0);
  const getDataProvider=useDataProvider();
  const [totalPage, setTotalPage] = useState();
  const [perPage, setPerPage] = useState((props.perPage || 5));
  const marketplace = 'amazon';
  const resource = props.resource || ''
  const path     = resource.split("/")[1];
  const classes  = useStyles();

  useEffect(()=>{
  setLoading( true );
  const params= {
  pagination:{
  page: page,
  perPage: perPage
  },
  sort: {
  field:'id',
  order: 'desc'
  },
  filter:{ 
  q: search , 
  marketplace: props.market , 
  days_ago: daysAgo
  }

  }
  getDataProvider.getList(`${resource}`, params)
  .then(({data,total}) => {
  setProducts( values( data ) );
  setTotalPage( Math.ceil( total/ perPage ));
  setLoading( false );
  })
  },[page]);

  useEffect(()=>{
  setLoading( true );
  const params= {
  pagination:{
  page: 1,
  perPage: perPage
  },
  sort: {
  field:'id',
  order: 'desc'
  },
  filter:{ 
  q: search , 
  marketplace: props.market , 
  days_ago: daysAgo
  }
  }
  getDataProvider.getList(`${resource}`, params)
  .then(({data,total}) => {
  setProducts( values( data ) );
  setTotalPage( Math.ceil( total/ perPage ) );
  setPage(1);
  setLoading( false );
  })
  },[daysAgo, search, props.market]);

  if(loading){
  return <Loading/>;
  }

  return (
  <Box component={Paper} my={4}>
  <Box pt={2} pl={1} >
  <MyDayFilter
  label= "Filter By Days"
  choices={[
  {id: 0,  name: 'Today'},
  {id: 1,  name: 'Yesterday'},
  {id: 15, name: '15 days ago'},
  {id: 30, name: '30 days ago'},
  {id: 45, name: '45 days ago'},
  {id: 60, name: '60 days ago'},
  {id: 90, name: '90 days ago'}
  ]}
  value={ daysAgo }
  onChange={ (e) => setDaysAgo( e.target.value )
  }/>
  <MySearch value={search} onChange={(e) => setSearch( e.target.value ) }/>
  </Box>
  <Box>
  {(products.length !== 0?
  <Datagrid  
  data = { keyby(products,'id') }
  ids = { (products.map(({ id }) => id) )}
  currentSort = { sort }
  >
  <TextField source="id"    label="ID"    />
  <TextField source="sku"   label="SKU"   />
  {(path == 'cancelled-products') && <ChipField source="cancel_count" label="Cancelled" />}
  {(path == 'returned-products') && <ChipField source="return_count" label="Returned" />}
  <ChipField source="sales" label="Sales" />
  </Datagrid>: 
  <div className={classes.empty}><Typography variant="h5" style={{textAlign:"center"}}>No Data</Typography> </div>)
  }
  </Box>
  <Box p={2}>
  <CustomPagination 
  count={ totalPage } 
  currentPage={ page } 
  onChange={( page ) => setPage( page ) } 
  />
  </Box>
  </Box>
  )
}


const Analytics = () => {
  const [market,setMarket] = useState('all');
  return (
    <Box p={4}>
      <Box>
        <div style={{overflow: 'auto'}}>
        <div style={{float: 'right'}}>
        <MyMarketFilter value={ market} onChange={ (e) => setMarket(e.target.value) }/>
        </div>
        </div>
      </Box>
      <Box>
        <Typography variant="h5">Inventory Out-of-stock Alert</Typography>
        <InventoryReorderTable resource="analytics/inventory-reorder" market={market}/>

        <Typography variant="h5">Basic Analytics</Typography>
        <BasicAnalyticsPanel resource="analytics/basic-analytics" market={market}/>

        <Typography variant="h5">State-wise Sales</Typography>
        <StateWiseSalesAnalyticsTable resource="analytics/state-wise-sales" market={market}/>

        <Typography variant="h5">Top Sales</Typography>
        <SalesAnalyticsTable resource="analytics/top-sales" market={market}/>

        <Typography variant="h5">Medium Sales</Typography>
        <SalesAnalyticsTable resource="analytics/medium-sales" market={market}/>

        <Typography variant="h5">Low Sales</Typography>
        <SalesAnalyticsTable resource="analytics/low-sales" market={market}/>

        <Typography variant="h5">Worst Products</Typography>
        <SalesAnalyticsTable resource="analytics/worst-products" market={market}/>

        <Typography variant="h5">Highest Cancel</Typography>
        <SalesAnalyticsTable resource="analytics/cancelled-products" market={market}/>

        <Typography variant="h5">Highest Return</Typography>
        <SalesAnalyticsTable resource="analytics/returned-products" market={market}/>
      </Box>
    </Box>
  );
}

export default Analytics;
