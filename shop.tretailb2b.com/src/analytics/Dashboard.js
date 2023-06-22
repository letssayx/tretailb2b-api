import React, { useState, useEffect, useMemo } from 'react';
import {Datagrid, TextField, ChipField, DateField, useRedirect, Title, List, Pagination,
TextInput, Filter, SearchInput, SimpleForm, useNotify, useDataProvider, SelectInput, Loading}
from 'react-admin';

import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Checkbox from "@material-ui/core/Checkbox";
import FormControl from '@material-ui/core/FormControl';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import SearchIcon from '@material-ui/icons/Search';
import Select from '@material-ui/core/Select';
import TextInputField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
// import TextField from '@material-ui/core/TextField';

import keyby from 'lodash/keyBy';
import values from 'lodash/values';
import moment from 'moment';

import CustomPagination from '../picklist/components/CustomPagination';

const ENDPOINT = process.env.REACT_APP_API_ENDPOINT;

const inputStyles = makeStyles((theme) => ({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 100,
      maxWidth: 200,
      padding: '25px'
    }
}));
  
const useStyles = makeStyles(( theme ) => ({
    root: {
        '& .MuiFilledInput-input': {
            padding: '14px 12px'
        },
        flexGrow: 1,
        backgroundColor: theme.palette.background.paper,
        padding : '30px',
    },
}))

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
                        ? <div><Typography variant="h6" style={{fontWeight:"bold",color:"black"}}>₹ {Math.ceil(products[0].avg_daily_sales*100)/100}</Typography></div>
                        : <div className={classes.empty}><Typography variant="h6" style={{textAlign:"center",fontWeight:"bold",color:"red"}}>No Records Found</Typography></div>
                        }
                    </Box>
                </Grid>
                <Grid item md={4}>
                    <Box mb={2} mr={2} >
                        <Typography variant="caption" display="block" gutterBottom style={{fontSize : '18px'}}>Average Weekly Order Value</Typography>
                        { products && products.length
                        ? <div><Typography variant="h6" style={{fontWeight:"bold",color:"black"}}>₹ {Math.ceil(products[0].avg_ord_val*100)/100}</Typography></div>
                        : <div className={classes.empty}><Typography variant="h6" style={{textAlign:"center",fontWeight:"bold",color:"red"}}>No Records Found</Typography></div>
                        }
                    </Box>
                </Grid>
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
    const [stateName, setStateName] = useState('all');
    const getDataProvider=useDataProvider();
    const [totalPage, setTotalPage] = useState();
    const [perPage, setPerPage] = useState((props.perPage || 5));
    const resource = props.resource || '';
    const path     = resource.split("/")[1];
    const classes  = useStyles();

    useEffect(()=>{
        setLoading( true );
        const params = {
            pagination: {
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
                days_ago: daysAgo,
                states: stateName
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
          days_ago: daysAgo,
          states: stateName
        }
      }
  
      getDataProvider.getList(`${resource}`, params)
      .then(({data,total}) => {
        setProducts( values( data ) );
        setTotalPage( Math.ceil( total/ perPage ) );
        setPage(1);
        setLoading( false );
      })
    },[daysAgo, stateName, search, props.market]);
  
    if(loading) {
      return <Loading/>;
    }
    return (
        <Box component={Paper} my={4}>
            <Grid container>
                {/* Date Range Selector */}
                <Grid item md={4}>
                    <Box mb={2} mr={2} >
                        <Typography variant="caption" display="block" gutterBottom style={{fontSize : '16px'}}>Date Range</Typography>
                        <FormControl variant="filled">
                            <Select  
                                value={daysAgo}
                                inputProps={{id: 'select_item'}}
                                style={{width:'215px'}}
                                InputLabelProps={{shrink: false}}
                                onChange = { (e) => setDaysAgo( e.target.value ) }
                            >
                                <MenuItem value={0} >Today</MenuItem>
                                <MenuItem value={1}>Since Yesterday</MenuItem>
                                <MenuItem value={15}>Last 15 Days</MenuItem>
                                <MenuItem value={30}>Last 30 Days</MenuItem>
                                <MenuItem value={45}>Last 45 Days</MenuItem>
                                <MenuItem value={60}>Last 60 Days</MenuItem>
                                <MenuItem value={90}>Last 90 Days</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>

                {/* State Selector */}
                <Grid item md={4}>
                    <Box mb={2} mr={2} >
                        <Typography variant="caption" display="block" gutterBottom style={{fontSize : '16px'}}>Select State</Typography>
                        <FormControl variant="filled">
                            <Select  
                                value={stateName}
                                inputProps={{id: 'select_item'}}
                                style={{width:'215px'}}
                                InputLabelProps={{shrink: false}}
                                onChange = { (e) => setStateName( e.target.value ) }
                            >
                                <MenuItem value={'all'}>All</MenuItem>
                                <MenuItem value={'andhra pradesh'}>Andhra Pradesh</MenuItem>
                                <MenuItem value={'arunachal pradesh'}>Arunachal Pradesh</MenuItem>
                                <MenuItem value={'assam'}>Assam</MenuItem>
                                <MenuItem value={'bihar'}>Bihar</MenuItem>
                                <MenuItem value={'chattisgarh'}>Chattisgarh</MenuItem>
                                <MenuItem value={'goa'}>Goa</MenuItem>
                                <MenuItem value={'gujarat'}>Gujarat</MenuItem>
                                <MenuItem value={'haryana'}>Haryana</MenuItem>
                                <MenuItem value={'himachal pradesh'}>Himachal Pradesh</MenuItem>
                                <MenuItem value={'jharkhand'}>Jharkhand</MenuItem>
                                <MenuItem value={'karnataka'}>Karnataka</MenuItem>
                                <MenuItem value={'kerala'}>Kerala</MenuItem>
                                <MenuItem value={'madhya pradesh'}>Madhya Pradesh</MenuItem>
                                <MenuItem value={'maharashtra'}>Maharashtra</MenuItem>
                                <MenuItem value={'manipur'}>Manipur</MenuItem>
                                <MenuItem value={'meghalaya'}>Meghalaya</MenuItem>
                                <MenuItem value={'mizoram'}>Mizoram</MenuItem>
                                <MenuItem value={'nagaland'}>Nagaland</MenuItem>
                                <MenuItem value={'odisha'}>Odisha</MenuItem>
                                <MenuItem value={'punjab'}>Punjab</MenuItem>
                                <MenuItem value={'rajasthan'}>Rajasthan</MenuItem>
                                <MenuItem value={'sikkim'}>Sikkim</MenuItem>
                                <MenuItem value={'tamil nadu'}>Tamil Nadu</MenuItem>
                                <MenuItem value={'telengana'}>Telengana</MenuItem>
                                <MenuItem value={'tripura'}>Tripura</MenuItem>
                                <MenuItem value={'uttarakhand'}>Uttarakhand</MenuItem>
                                <MenuItem value={'uttar pradesh'}>Uttar Pradesh</MenuItem>
                                <MenuItem value={'west bengal'}>West Bengal</MenuItem>
                                <MenuItem value={'andaman and nicobar islands'}>Andaman and Nicobar Islands</MenuItem>
                                <MenuItem value={'chandigarh'}>Chandigarh</MenuItem>
                                <MenuItem value={'dadra and nagar haveli and daman & diu'}>Dadra and Nagar Haveli and Daman & Diu</MenuItem>
                                <MenuItem value={'new delhi'}>New Delhi</MenuItem>
                                <MenuItem value={'jammu & kashmir'}>Jammu & Kashmir</MenuItem>
                                <MenuItem value={'ladakh'}>Ladakh</MenuItem>
                                <MenuItem value={'lakshadweep'}>Lakshadweep</MenuItem>
                                <MenuItem value={'puducherry'}>Puducherry</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>

                {/* Search criteria box */}
                <Grid>
                    <MySearch value={search} onChange={(e) => setSearch( e.target.value ) }/>                
                </Grid>
            </Grid>
        <Box>
            {(
                products.length !== 0
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
                :<div className={classes.empty}><Typography variant="h6" style={{textAlign:"center",fontWeight:"bold",color:"red"}}>No Records Found</Typography> </div>
            )}
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


const SalesVelocityAnalyticsTable = ( props ) => {
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
    const resource = props.resource || ''
    const path     = resource.split("/")[1];
    const classes  = useStyles();

    useEffect(() => {
        setLoading( true );
        const params = {
            pagination: {
                page: page,
                perPage: perPage
            },
            sort: {
                field:'id',
                order: 'desc'
            },
            filter: {
                q: props.search , 
                marketplace: props.market, 
                days_ago: props.daysRange,
                sku_perform: props.skuPerform
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
        const params = {
            pagination: {
                page: 1,
                perPage: perPage
            },
            sort: {
                field:'id',
                order: 'desc'
            },
            filter: {
                q: props.search , 
                marketplace: props.market , 
                days_ago: props.daysRange,
                sku_perform: props.skuPerform
            }
        }
        getDataProvider.getList(`${resource}`, params)
        .then(({data,total}) => {
            setProducts( values( data ) );
            setTotalPage( Math.ceil( total/ perPage ) );
            setPage(1);
            setLoading( false );
        })
    },[props.daysRange, props.search, props.market, props.skuPerform]);
  
    if(loading){
        return <Loading/>;
    }
  
    return (
        <Box component={Paper} my={4}>
            <Box>
                {(
                    products.length !== 0
                    ?<Datagrid
                        data = { keyby(products,'id') }
                        ids = { (products.map(({ id }) => id) )}
                        currentSort = { sort }
                    >
                        {/* <TextField source="id"    label="ID"    /> */}
                        <TextField source="sku"   label="SKU"   />
                        {(path == 'cancelled-products') && <ChipField source="cancel_count" label="Cancelled" />}
                        {(path == 'returned-products') && <ChipField source="return_count" label="Returned" />}
                        {/* <TextField source="id"    label="ID"    /> */}
                        <ChipField source="sales" label="Sales" />
                    </Datagrid>
                    :<div className={classes.empty}><Typography variant="h6" style={{textAlign:"center",fontWeight:"bold",color:"red"}}>No Records Found</Typography></div>
                )}
            </Box>

            <Box p={2}>
                <CustomPagination 
                    count={ totalPage } 
                    currentPage={ page } 
                    onChange={ ( page ) => setPage( page ) } 
                />
            </Box>
        </Box>
    )
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
    const [averageSales, setaverageSales] = useState(7);
    const [deliveryLeadTime, setdeliveryLeadTime] = useState(0);
    const [safetyStock, setsafetyStock] = useState(0);
    const getDataProvider=useDataProvider();
    const [totalPage, setTotalPage] = useState();
    const [perPage, setPerPage] = useState((props.perPage || 5));
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
          reorder_within: reorderWithin,
          average_sales: averageSales,
          delivery_lead_time: deliveryLeadTime,
          safety_stock: safetyStock
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
          reorder_within: reorderWithin,
          average_sales: averageSales,
          delivery_lead_time: deliveryLeadTime,
          safety_stock: safetyStock
        }
      }
  
      getDataProvider.getList(`${resource}`, params)
      .then(({data,total}) => {
        setProducts( values( data ) );
        setTotalPage( Math.ceil( total/ perPage ) );
        setPage(1);
        setLoading( false );
      })
  
    },[safetyStock, deliveryLeadTime, averageSales, reorderWithin, search, props.market]);
  
    if(loading) {
      return <Loading/>;
    }
  
    return (
        <Box component={Paper} my={4}>
            <Grid container>
                {/* Average Sales Period Selector */}
                <Grid item md={4}>
                    <Box mb={2} mr={2} >
                        <Typography variant="caption" display="block" gutterBottom style={{fontSize : '16px'}}>Average Sales Period</Typography>
                        <FormControl variant="filled">
                            <Select  
                                value={ averageSales }
                                inputProps={{id: 'select_item'}}
                                style={{width:'200px'}}
                                InputLabelProps={{shrink: false}}
                                onChange = { (e) => setaverageSales( e.target.value ) }
                            >
                                <MenuItem value={7} >7 Days</MenuItem>
                                <MenuItem value={15}>15 Days</MenuItem>
                                <MenuItem value={30}>30 Days</MenuItem>
                                <MenuItem value={60}>60 Days</MenuItem>
                                <MenuItem value={90}>90 Days</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>

                {/* Date Range Selector */}
                <Grid item md={4}>
                    <Box mb={2} mr={2} >
                        <Typography variant="caption" display="block" gutterBottom style={{fontSize : '16px'}}>Reorder Within</Typography>
                        <FormControl variant="filled">
                            <Select  
                                value={ reorderWithin }
                                inputProps={{id: 'select_item'}}
                                style={{width:'200px'}}
                                InputLabelProps={{shrink: false}}
                                onChange = { (e) => setReorderWithin( e.target.value ) }
                            >
                                <MenuItem value={7} >7 Days</MenuItem>
                                <MenuItem value={15}>15 Days</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>

                {/* Search criteria box */}
                <Grid>
                    <MySearch value={search} onChange={(e) => setSearch( e.target.value ) }/>                
                </Grid>
            </Grid>

            <Box>
                {(
                    products.length !== 0
                    ?<Datagrid  
                        data = { keyby(products,'id') }
                        ids = { (products.map(({ id }) => id) )}
                        currentSort = { sort }
                    >
                        <TextField source="id"          label="ID"  />
                        <ChipField source="sku"         label="SKU" />
                        <DateField source="reord_date"  label="Last Date to order" />
                    </Datagrid>
                    :<div className={classes.empty}><Typography variant="h6" style={{textAlign:"center",fontWeight:"bold",color:"red"}}>No Records Found</Typography></div>
                )}
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
  
const AnalyticDashboard = (props) => {
    const classes = useStyles();
    const [marketPlaces , setMarketPlaces] = useState([])
    const notify = useNotify();
    const dataProvider = useDataProvider();
    
    const defaultAnalytics = {
        marketplaceName: 'all',
        daysRange:0,
        skuPerform:'best_performing_sku',
        search: null
    }
    const [searchAnalyticsDashboard, setSearchAnalyticsDashboard] = React.useState(defaultAnalytics);

    const handleSearchAnalyticsDashboard  = (input) => {
        setSearchAnalyticsDashboard(
            {
                ...searchAnalyticsDashboard,
                ...input,
            },
        )
    }

    React.useEffect(() => {
        dataProvider.getOnly(`orders/marketplaces/list`)
        .then(({ data }) => {
            setMarketPlaces(data.data);
        })
        .catch((error) => {
            notify(error.message,`warning`);
        })
    },[]);

    return <form  noValidate >
        {/* Marketplace selector Card */}
        <Card className={classes.root}>
            <Typography style={{marginBottom: '10px',fontSize : '22px'}}>Market Place Selector</Typography>
            <Grid container>
                {/* Marketplace Selector */}
                <Grid item md={4}>
                    <Box mb={2} mr={2}>
                        <Typography variant="caption" display="block" gutterBottom style={{fontSize : '16px', margin: '0 auto'}}>MarketPlace</Typography>
                        <FormControl variant="filled">
                            <Select
                                style={{width : '215px'}}
                                value={searchAnalyticsDashboard.marketplaceName}
                                onChange={ (e)=>handleSearchAnalyticsDashboard({marketplaceName : e.target.value})}
                            >
                                <MenuItem value={'all'} >All</MenuItem>
                                { marketPlaces.map((name) => (
                                    <MenuItem value={name}>{name.replace(/(^\w|\s\w)/g, firstCharOfWord => firstCharOfWord.toUpperCase())}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>
            </Grid>
        </Card>

        {/* Basic Analytics [Average Daily Sales/Order/etc.] Card */}
        <Card className={classes.root}>
            <Typography style={{marginBottom: '10px',fontSize : '22px'}}>Basic Analytics</Typography>
            <BasicAnalyticsPanel resource="analytics/basic-analytics" market={searchAnalyticsDashboard.marketplaceName}/>
        </Card>

        {/* State-wise sales analytics Card */}
        <Card className={classes.root}>
            <Typography style={{marginBottom: '10px',fontSize : '22px'}}>State-wise Analytics</Typography>
            <StateWiseSalesAnalyticsTable resource="analytics/state-wise-sales" market={searchAnalyticsDashboard.marketplaceName}/>
        </Card>

        {/* Sales velocity analytics Card */}
        <Card className={classes.root}>
            <Typography style={{marginBottom: '10px',fontSize : '22px'}}>SKU Performance Analytics</Typography>
            <Grid container>
                {/* Date Range Selector */}
                <Grid item md={4}>
                    <Box mb={2} mr={2} >
                        <Typography variant="caption" display="block" gutterBottom style={{fontSize : '16px'}}>Date Range</Typography>
                        <FormControl variant="filled">
                            <Select  
                                value={searchAnalyticsDashboard.daysRange}
                                inputProps={{id: 'select_item'}}
                                style={{width:'215px'}}
                                InputLabelProps={{shrink: false}}
                                onChange = { (e) => handleSearchAnalyticsDashboard( {daysRange : e.target.value} ) }
                            >
                                <MenuItem value={0} >Today</MenuItem>
                                <MenuItem value={1}>Since Yesterday</MenuItem>
                                <MenuItem value={15}>Last 15 Days</MenuItem>
                                <MenuItem value={30}>Last 30 Days</MenuItem>
                                <MenuItem value={45}>Last 45 Days</MenuItem>
                                <MenuItem value={60}>Last 60 Days</MenuItem>
                                <MenuItem value={90}>Last 90 Days</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>

                {/* SKU Performance Selector */}
                <Grid item md={4}>
                    <Box mb={2} mr={2}>
                        <Typography variant="caption" display="block" gutterBottom style={{fontSize : '16px'}}>SKU Performance</Typography>
                        <FormControl variant="filled">
                            <Select  
                                value={searchAnalyticsDashboard.skuPerform}
                                inputProps={{id: 'select_item'}}
                                style={{width:'215px'}}
                                InputLabelProps={{shrink: false}}
                                onChange = { (e)=>handleSearchAnalyticsDashboard( { skuPerform : e.target.value } ) }
                            >
                                <MenuItem value={'best_performing_sku'}>Best Performing SKU</MenuItem>
                                <MenuItem value={'medium_performing_sku'}>Medium Performing SKU</MenuItem>
                                <MenuItem value={'low_performing_sku'}>Low Performing SKU</MenuItem>
                                <MenuItem value={'worst_performing_sku'}>No Sales SKU</MenuItem>
                                <MenuItem value={'highest_cancel_sku'}>Highest Cancelled SKU</MenuItem>
                                <MenuItem value={'highest_return_sku'}>Highest Returned SKU</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </Grid>

                {/* Search criteria box */}
                <Grid>
                    <MySearch value={searchAnalyticsDashboard.search} onChange={(e) => handleSearchAnalyticsDashboard( { search : e.target.value } ) }/>                
                </Grid>
            </Grid>
            {
                (searchAnalyticsDashboard.skuPerform==='best_performing_sku')
                ?<SalesVelocityAnalyticsTable resource="analytics/top-sales" market={searchAnalyticsDashboard.marketplaceName} daysRange={searchAnalyticsDashboard.daysRange} skuPerform={searchAnalyticsDashboard.skuPerform} search={searchAnalyticsDashboard.search}/>
                :(searchAnalyticsDashboard.skuPerform==='medium_performing_sku')
                ?<SalesVelocityAnalyticsTable resource="analytics/medium-sales" market={searchAnalyticsDashboard.marketplaceName} daysRange={searchAnalyticsDashboard.daysRange} skuPerform={searchAnalyticsDashboard.skuPerform} search={searchAnalyticsDashboard.search}/>
                :searchAnalyticsDashboard.skuPerform==='low_performing_sku'
                ?<SalesVelocityAnalyticsTable resource="analytics/low-sales" market={searchAnalyticsDashboard.marketplaceName} daysRange={searchAnalyticsDashboard.daysRange} skuPerform={searchAnalyticsDashboard.skuPerform} search={searchAnalyticsDashboard.search}/>
                :searchAnalyticsDashboard.skuPerform==='worst_performing_sku'
                ?<SalesVelocityAnalyticsTable resource="analytics/worst-products" market={searchAnalyticsDashboard.marketplaceName} daysRange={searchAnalyticsDashboard.daysRange} skuPerform={searchAnalyticsDashboard.skuPerform} search={searchAnalyticsDashboard.search}/>
                :searchAnalyticsDashboard.skuPerform==='highest_cancel_sku'
                ?<SalesVelocityAnalyticsTable resource="analytics/cancelled-products" market={searchAnalyticsDashboard.marketplaceName} daysRange={searchAnalyticsDashboard.daysRange} skuPerform={searchAnalyticsDashboard.skuPerform} search={searchAnalyticsDashboard.search}/>
                :<SalesVelocityAnalyticsTable resource="analytics/returned-products" market={searchAnalyticsDashboard.marketplaceName} daysRange={searchAnalyticsDashboard.daysRange} skuPerform={searchAnalyticsDashboard.skuPerform} search={searchAnalyticsDashboard.search}/>
            }
        </Card>

        {/* Inventory Reorder Card */}
        <Card className={classes.root}>
            <Typography style={{marginBottom: '10px',fontSize : '22px'}}>Stock Analytics & ReOrder Point</Typography>
            <InventoryReorderTable resource="analytics/inventory-reorder" market={searchAnalyticsDashboard.marketplaceName}/>
        </Card>
    </form>
}

export default AnalyticDashboard;