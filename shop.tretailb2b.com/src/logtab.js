import React,{useState,useStyles,useRef, useEffect} from 'react';
import { Link,useHistory, useLocation } from 'react-router-dom';
import Paper from '@material-ui/core/Paper';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import {FileField,Loading, Error,useRedirect, Title,SearchInput,Create,
        Show,SimpleShowLayout,Edit,RichTextField,ArrayField, List,
        SimpleFormIterator,DeleteButton, SimpleForm,TextField,
        PasswordInput,BooleanInput,DateInput,TextInput,
        ReferenceManyField, Datagrid,  DateField, EditButton,SaveButton,
        required,Toolbar,useDataProvider, useNotify,Filter,loading
      } from 'react-admin';
import MaterialTextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import keyBy from 'lodash/keyBy';
import { Fragment } from 'react';
import keyby from 'lodash/keyBy';
import InputAdornment from '@material-ui/core/InputAdornment';
import SearchIcon from '@material-ui/icons/Search';
import CustomPagination from './picklist/components/CustomPagination';
import AddIcon from '@material-ui/icons/Add';
import Button from '@material-ui/core/Button'
import CancelButton from '/home/fuzonmedia-delux/Documents/projects/tretail/shop.tretailb2b.com/src/settings/CancelButton';
import ReplaySharpIcon from '@material-ui/icons/ReplaySharp';

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`scrollable-tabpanel-${index}`}
      aria-labelledby={`scrollable-tab-${index}`}
      {...other}
    >
        {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired
};

function a11yProps(index) {
  return {
    id: `scrollable-tab-${index}`,
    'aria-controls': `scrollable-tabpanel-${index}`,
  };
} 

const getPath= (location) =>{
  const pathname = location.split('/')[2];
  if (!pathname) return 0;
  else{
    switch (pathname){
      case 'system_logs':
        return 1;
       default:
         return 0; 
    }
  }
} 

 const NewLog=(props)=>{
  let location = useLocation()
  let history = useHistory()
   const [tabpanelitem,setTabpanel]=useState("user_logs");
   const getDataProvider=useDataProvider();
   const handleChange=(event,newValue)=>{
    history.push(
      `/${
        newValue == 1
        ? "logtab/system_logs"
        :  "logtab/user_logs"
      }`
    )
}

React.useEffect(()=>{
  setTabpanel(getPath(location?.pathname));
}, [location])
   
 return( 
  <div >
  <Paper > 
  <Tabs value={tabpanelitem} onChange={handleChange}   aria-label="simple tabs example">
    <Tab label="User logs" {...a11yProps(0)} />
    <Tab label="System logs" {...a11yProps(1)} />
  </Tabs>
  </Paper>
   <TabPanel value={tabpanelitem} index={0}>
     <CustomUserDataGrid />
  </TabPanel>
  <TabPanel value={tabpanelitem} index={1}>
  <CustomSystemDataGrid/>
  </TabPanel>
  </div>
 
 );

} 



 
const CustomUserDataGrid = ()=>{
  const [searchFilter,setSearchFilter]=useState(null)
  const [countPage,setCountPage]=useState(0);
  const [currentPage,setCurrentPage]=useState(1)
  // let searchHandler = (e) => {
  //   if(e.target.value!=""){
  //    let searchValue=e.target.value;
  //    setSearchFilter(searchValue)
  //   }else{
  //     setSearchFilter(null)
  //   }
  // }
  const [sort, setSort] = useState({ field: 'id', order: 'DESC' });
  const [StateUserLogProvider, setStateUserLogProvider] = useState([]);
  const getDataProvider=useDataProvider();
  useEffect(()=>{
    const params= {
      pagination:{
        page:currentPage,
        perPage: 10
      },
      sort: {
        field:'id',
        order: 'desc'
      },
      filter:{user_log:true,q:searchFilter}
    }
    getDataProvider.getList(`logs`, params).then(({data,total}) => {
       setStateUserLogProvider(data);
       setCountPage(Math.ceil(parseInt(total)/parseInt(10)));
    })

  },[currentPage]);

  useEffect(()=>{
    const params= {
      pagination:{
        page:currentPage,
        perPage: 10
      },
      sort: {
        field:'id',
        order: 'desc'
      },
      filter:{user_log:true,q:searchFilter}
    }
    getDataProvider.getList(`logs`, params).then(({data,total}) => {
       setStateUserLogProvider(data);
       setCountPage(Math.ceil(parseInt(total)/parseInt(10)));
       setCurrentPage(1)
    })

  },[searchFilter]);

  const redirect=useRedirect();
  const postRowClick = (id) =>{
    redirect(`/logs/${id}/show`)
  } ;

  return(  
            <div>
              <Box m={2}>
              <MaterialTextField variant="filled" 
              InputProps={{
                startAdornment: (
                  <InputAdornment position="center">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onChange = {(e) => setSearchFilter(e.target.value) }
              />
              <Button variant="text" color="primary" startIcon={<AddIcon />} style={{position:'absolute',right:'110px'}}  onClick={() =>redirect(`/logs/create`)}>
                 Create 
              </Button>
              <Button style={{position:'absolute',right:'50px'}} onMouseOver={({target})=>target.style.background="transparent"} onClick={() => window.location.reload(false)} color="transparent"><ReplaySharpIcon style={{color:"#3f51b5"}}/></Button>
              </Box>
                <Card>
                    <Datagrid 
                       data={keyby(StateUserLogProvider,'id')}
                       ids={StateUserLogProvider.map(({ id }) => id)}
                       currentSort={sort}
                       setSort={(field, order) => setSort({ field, order })} 
                       rowClick={postRowClick}
                    >  
                    <TextField source="name" label="Name" />
                    <TextField source="status" label="Status"/>
                    <TextField source="created_at" label="Created At" />
                    </Datagrid>
                    <CustomPagination
                       count={countPage}
                       currentPage={currentPage}
                       onChange={ ( page ) => setCurrentPage(page) }
                    />
                </Card>
                {/* </input> */}
            </div>
        );
  }
  const CustomSystemDataGrid = ()=>{
    const [searchFilter,setSearchFilter]=useState(null);
    const [currentPage,setCurrentPage]=useState(1);
    const [countPage,setCountPage]=useState(0);
    let searchHandler = (e) => {
    if(e.target.value!=""){
     let searchValue=e.target.value;
     setSearchFilter(searchValue)
      }
    }
    const [sort, setSort] = useState({ field: 'created_at', order: 'ASC' });
    const [StateSystemLogProvider, setStateSystemLogProvider] = useState([]);
    const getDataProvider=useDataProvider();
    useEffect(()=>{
      const params= {
        pagination:{
          page:currentPage,
          perPage: 10
        },
        sort: {
          field:'created_at',
          order: 'desc'
        },
        filter:{user_log:false,q:searchFilter}
      }
      getDataProvider.getList(`logs`, params).then(({data,total}) => {
          setStateSystemLogProvider(data);
          setCountPage(Math.ceil(parseInt(total)/parseInt(10)));
      })
  
    },[currentPage])

    useEffect(()=>{
      const params= {
        pagination:{
          page:currentPage,
          perPage: 10
        },
        sort: {
          field:'created_at',
          order: 'desc'
        },
        filter:{user_log:false,q:searchFilter}
      }
      getDataProvider.getList(`logs`, params).then(({data,total}) => {
          setStateSystemLogProvider(data);
          setCountPage(Math.ceil(parseInt(total)/parseInt(10)));
          setCurrentPage(1)
      })
  
    },[searchFilter])


    const redirect=useRedirect();
    const postRowClick = (id) =>{
      redirect(`/logs/${id}/show`)
    } ;



    return(
              <div>
                <Box m={2}>
                <Button style={{position:'absolute',right:'60px'}} onClick={() => window.location.reload(false)} color="transparent"><ReplaySharpIcon style={{color:"#3f51b5"}}/></Button>
                {/* <MaterialTextField  id="outlined-search" label="Search" type="search" onChange={searchHandler}/> */}
                <MaterialTextField variant="filled" 
              InputProps={{
                startAdornment: (
                  <InputAdornment position="center">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onChange = {(e) => setSearchFilter(e.target.value) }/>
                </Box>
                  <Card>
                      <Datagrid 
                         data={keyby(StateSystemLogProvider,'id')}
                         ids={StateSystemLogProvider.map(({ id }) => id)}
                         currentSort={sort}
                         setSort={(field, order) => setSort({ field, order })} 
                         rowClick={postRowClick}
                      >
                      <TextField source="name" label="Name" />
                      <TextField source="status" label="Status"/>
                      <TextField source="created_at" label="Created At" />
                      </Datagrid>
                      <CustomPagination
                        count={countPage}
                        currentPage={currentPage}
                        onChange={(page)=>setCurrentPage(page)}
                          />
                  </Card>
              </div>
    );
  }
export default NewLog;